import http from "http";
import https from "https";
import net from "net";
import dns from "dns";

export const FORBIDDEN_OUTBOUND_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "proxy-authorization",
  "proxy-authenticate",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-real-ip",
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "upgrade"
]);

export function sanitizeOutboundHeaders(input: unknown): Record<string, string> {
  const output: Record<string, string> = {};
  if (!input || typeof input !== "object") return output;

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const normalized = key.toLowerCase().trim();
    if (FORBIDDEN_OUTBOUND_HEADERS.has(normalized)) continue;
    if (typeof value !== "string" && typeof value !== "number") continue;
    const strVal = String(value);
    if (/[\r\n\0]/.test(strVal)) continue;
    output[key.trim()] = strVal.slice(0, 8192);
  }

  return output;
}

export function isPrivateOrRestrictedHost(hostname: string): boolean {
  if (!hostname || typeof hostname !== "string") return true;
  const h = hostname.toLowerCase().trim().replace(/^\[|\]$/g, ""); // strip IPv6 brackets

  // Blacklist loopback and metadata names
  if (
    h === "localhost" ||
    h === "metadata" ||
    h === "metadata.google.internal" ||
    h === "169.254.169.254" ||
    h.endsWith(".local") ||
    h.endsWith(".localhost") ||
    h.endsWith(".onion") ||
    h.endsWith(".invalid")
  ) {
    return true;
  }

  // Handle octal dotted notation: e.g. 0177.0.0.1 -> 127.0.0.1
  let normalized = h;
  const dottedParts = h.split(".");
  if (dottedParts.length === 4) {
    const parsedNums = dottedParts.map(p => {
      if (p.startsWith("0x") || p.startsWith("0X")) return parseInt(p, 16);
      if (p.length > 1 && p.startsWith("0")) return parseInt(p, 8);
      return parseInt(p, 10);
    });
    if (parsedNums.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
      normalized = parsedNums.join(".");
    }
  }

  // Handle integer or hex IP representation: e.g. 2130706433 or 0x7f000001
  let ipCandidate = normalized;
  if (/^(0x[0-9a-f]+|\d+)$/i.test(normalized)) {
    try {
      const num = parseInt(normalized, normalized.startsWith("0x") || normalized.startsWith("0X") ? 16 : 10);
      if (!isNaN(num) && num >= 0 && num <= 0xffffffff) {
        ipCandidate = `${(num >>> 24) & 255}.${(num >>> 16) & 255}.${(num >>> 8) & 255}.${num & 255}`;
      }
    } catch {}
  }

  const ipType = net.isIP(ipCandidate);
  if (ipType === 4) {
    const parts = ipCandidate.split(".").map(p => parseInt(p, 10));
    const [a, b, c, d] = parts;
    // 0.0.0.0/8 (Current network)
    if (a === 0) return true;
    // 10.0.0.0/8 (Private network)
    if (a === 10) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 169.254.0.0/16 (Link-local & cloud metadata)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12 (Private network)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.0.0.0/24 (IETF Protocol Assignments)
    if (a === 192 && b === 0 && c === 0) return true;
    // 192.0.2.0/24 (Documentation / TEST-NET-1)
    if (a === 192 && b === 0 && c === 2) return true;
    // 192.88.99.0/24 (6to4 Relay Anycast)
    if (a === 192 && b === 88 && c === 99) return true;
    // 192.168.0.0/16 (Private network)
    if (a === 192 && b === 168) return true;
    // 198.18.0.0/15 (Network benchmark tests)
    if (a === 198 && (b === 18 || b === 19)) return true;
    // 198.51.100.0/24 (TEST-NET-2)
    if (a === 198 && b === 51 && c === 100) return true;
    // 203.0.113.0/24 (TEST-NET-3)
    if (a === 203 && b === 0 && c === 113) return true;
    // 224.0.0.0/4 (Multicast)
    if (a >= 224 && a <= 239) return true;
    // 240.0.0.0/4 (Reserved / Future use)
    if (a >= 240) return true;
    // Broadcast
    if (a === 255 && b === 255 && c === 255 && d === 255) return true;
  } else if (ipType === 6) {
    const lower = ipCandidate.toLowerCase();
    if (lower === "::1" || lower === "::" || lower === "0:0:0:0:0:0:0:1" || lower === "0:0:0:0:0:0:0:0") return true;
    if (lower.startsWith("::ffff:") || lower.startsWith("0:0:0:0:0:ffff:")) {
      const v4Part = lower.split(":").pop();
      if (v4Part && isPrivateOrRestrictedHost(v4Part)) return true;
    }
    if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("2001:db8")) return true;
  }

  return false;
}

export async function isSafeDestination(hostname: string): Promise<{ safe: boolean; reason?: string; resolvedIps?: string[] }> {
  if (!hostname || typeof hostname !== "string") {
    return { safe: false, reason: "Missing or invalid hostname." };
  }

  const cleanHost = hostname.toLowerCase().trim().replace(/^\[|\]$/g, "");
  if (isPrivateOrRestrictedHost(cleanHost)) {
    return { safe: false, reason: `Host '${cleanHost}' is a restricted or private address.` };
  }

  if (net.isIP(cleanHost)) {
    return { safe: true, resolvedIps: [cleanHost] };
  }

  try {
    const records = await dns.promises.lookup(cleanHost, { all: true });
    if (!records || records.length === 0) {
      return { safe: false, reason: `Could not resolve hostname '${cleanHost}'.` };
    }
    const resolvedIps: string[] = [];
    for (const record of records) {
      if (isPrivateOrRestrictedHost(record.address)) {
        return { safe: false, reason: `Hostname '${cleanHost}' resolves to restricted IP ${record.address}.` };
      }
      resolvedIps.push(record.address);
    }
    return { safe: true, resolvedIps };
  } catch (err: any) {
    return { safe: false, reason: `DNS lookup failed for '${cleanHost}': ${err.message}` };
  }
}

export async function readResponseWithLimit(
  response: Response,
  maxBytes: number = 5 * 1024 * 1024
): Promise<Buffer> {
  if (!response.body) return Buffer.alloc(0);

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (!value) continue;

    total += value.byteLength;
    if (total > maxBytes) {
      try { await reader.cancel(); } catch {}
      throw new Error(`Upstream response exceeded ${maxBytes} bytes limit.`);
    }

    chunks.push(Buffer.from(value));
  }

  return Buffer.concat(chunks);
}

export interface SafeFetchResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  bodyBuffer: Buffer;
  finalUrl: string;
}

function executeSingleSafeRequest(
  targetUrl: string,
  options: {
    method: string;
    headers: Record<string, string>;
    body?: any;
    timeoutMs: number;
    maxBytes: number;
  }
): Promise<{ status: number; statusText: string; headers: Record<string, string>; bodyBuffer: Buffer }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === "https:" ? https : http;

    let destroyed = false;
    const req = client.request(
      targetUrl,
      {
        method: options.method,
        headers: options.headers,
        timeout: options.timeoutMs,
        lookup: (hostname, lookupOpts, cb) => {
          dns.lookup(hostname, lookupOpts, (err, address, family) => {
            if (err) return cb(err, address as any, family as any);
            const addrs = Array.isArray(address) ? address : [{ address, family }];
            for (const item of addrs) {
              const ip = typeof item === "string" ? item : (item as any)?.address;
              if (ip && isPrivateOrRestrictedHost(ip)) {
                destroyed = true;
                return cb(new Error(`SSRF safeguard: Hostname resolved to restricted IP ${ip}`), "" as any, 4 as any);
              }
            }
            return cb(null, address as any, family as any);
          });
        }
      },
      (res) => {
        const chunks: Buffer[] = [];
        let total = 0;

        res.on("data", (chunk: Buffer) => {
          total += chunk.length;
          if (total > options.maxBytes) {
            destroyed = true;
            res.destroy();
            req.destroy(new Error(`Upstream response exceeded ${options.maxBytes} bytes limit.`));
          } else {
            chunks.push(chunk);
          }
        });

        res.on("end", () => {
          if (destroyed) return;
          const respHeaders: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.headers)) {
            if (v !== undefined) {
              respHeaders[k] = Array.isArray(v) ? v.join(", ") : v;
            }
          }
          resolve({
            status: res.statusCode || 200,
            statusText: res.statusMessage || "OK",
            headers: respHeaders,
            bodyBuffer: Buffer.concat(chunks)
          });
        });

        res.on("error", (err) => {
          if (!destroyed) {
            destroyed = true;
            reject(err);
          }
        });
      }
    );

    // Socket-level IP check on connect event (guards against DNS rebinding):
    req.on("socket", (socket: net.Socket) => {
      const verifySocketAddress = () => {
        const remoteIp = socket.remoteAddress;
        if (remoteIp && isPrivateOrRestrictedHost(remoteIp)) {
          destroyed = true;
          socket.destroy(new Error(`SSRF safeguard: Socket connected to restricted IP ${remoteIp}`));
        }
      };

      if (socket.connecting) {
        socket.on("connect", verifySocketAddress);
      } else if (socket.remoteAddress) {
        verifySocketAddress();
      }
    });

    req.on("timeout", () => {
      destroyed = true;
      req.destroy(new Error(`Request timed out after ${options.timeoutMs}ms`));
    });

    req.on("error", (err) => {
      if (!destroyed) {
        destroyed = true;
        reject(err);
      }
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

export async function fetchExternalSafely(
  targetUrl: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    timeoutMs?: number;
    maxBytes?: number;
  } = {}
): Promise<SafeFetchResult> {
  let current = targetUrl.trim();
  const method = (options.method || "GET").toUpperCase();
  const maxBytes = options.maxBytes || 5 * 1024 * 1024;
  const timeoutMs = options.timeoutMs || 10000;
  const sanitizedHeaders = sanitizeOutboundHeaders(options.headers);

  let redirectCount = 0;
  const MAX_REDIRECTS = 3;

  while (true) {
    const parsed = new URL(current);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Only HTTP and HTTPS protocols are permitted.");
    }

    const check = await isSafeDestination(parsed.hostname);
    if (!check.safe) {
      throw new Error(check.reason || "Destination blocked by SSRF safeguard.");
    }

    let reqBody: any = undefined;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && options.body !== undefined) {
      reqBody = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
      if (!sanitizedHeaders["Content-Type"] && !sanitizedHeaders["content-type"]) {
        sanitizedHeaders["Content-Type"] = "application/json";
      }
    }

    const singleRes = await executeSingleSafeRequest(current, {
      method,
      headers: sanitizedHeaders,
      body: reqBody,
      timeoutMs,
      maxBytes
    });

    if ([301, 302, 303, 307, 308].includes(singleRes.status)) {
      redirectCount++;
      if (redirectCount > MAX_REDIRECTS) {
        throw new Error("Redirect limit exceeded (max 3).");
      }
      const location = singleRes.headers["location"];
      if (!location) {
        throw new Error("Redirect received with no Location header.");
      }
      current = new URL(location, current).toString();
      continue;
    }

    return {
      status: singleRes.status,
      statusText: singleRes.statusText,
      headers: singleRes.headers,
      bodyBuffer: singleRes.bodyBuffer,
      finalUrl: current
    };
  }
}
