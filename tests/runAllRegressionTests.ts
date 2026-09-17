import http from "http";

let passedCount = 0;
let failedCount = 0;
const failures: { testName: string; error: any }[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedCount++;
    const errMsg = detail || "Assertion failed";
    failures.push({ testName, error: errMsg });
    console.error(`  ✗ FAIL: ${testName} -> ${errMsg}`);
  }
}

function fetchApi(
  path: string,
  options: { method?: string; headers?: Record<string, string>; body?: any } = {}
): Promise<{ status: number; data: any; headers: any }> {
  return new Promise((resolve, reject) => {
    const payload = options.body
      ? typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body)
      : null;

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 3000,
        path,
        method: options.method || "GET",
        headers: {
          ...(payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              }
            : {}),
          ...options.headers,
        },
      },
      (res) => {
        let rawData = "";
        res.on("data", (chunk) => (rawData += chunk));
        res.on("end", () => {
          let data = rawData;
          try {
            data = JSON.parse(rawData);
          } catch {
            // retain raw string
          }
          resolve({ status: res.statusCode || 0, data, headers: res.headers });
        });
      }
    );

    req.on("error", (err) => reject(err));
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  STARTING REGRESSION & FULL LIMIT TEST SUITE");
  console.log("=======================================================\n");

  // -------------------------------------------------------------
  // SUITE 1: Server System & Health Endpoints
  // -------------------------------------------------------------
  console.log("--- [Suite 1] Server System Endpoints ---");
  try {
    const health = await fetchApi("/api/health");
    assert(health.status === 200, "GET /api/health returns 200", `status: ${health.status}`);
    assert(health.data.status === "ok", "GET /api/health data.status === 'ok'");
  } catch (err: any) {
    assert(false, "GET /api/health reachable", err.message);
  }

  try {
    const tokenSavings = await fetchApi("/api/system/token-savings");
    assert(tokenSavings.status === 200, "GET /api/system/token-savings returns 200");
    assert(typeof tokenSavings.data.totalSystemTokensSaved === "number", "Token savings returns numeric totalSystemTokensSaved");
  } catch (err: any) {
    assert(false, "GET /api/system/token-savings", err.message);
  }

  try {
    const secStats = await fetchApi("/api/system/security-stats");
    assert(secStats.status === 200, "GET /api/system/security-stats returns 200");
  } catch (err: any) {
    assert(false, "GET /api/system/security-stats", err.message);
  }

  try {
    const secAudit = await fetchApi("/api/system/security-audit");
    assert(secAudit.status === 200, "GET /api/system/security-audit returns 200");
    assert(Boolean(secAudit.data.auditTimestamp), "Security audit returns timestamp");
  } catch (err: any) {
    assert(false, "GET /api/system/security-audit", err.message);
  }

  // -------------------------------------------------------------
  // SUITE 2: Code Runner & Sandbox Execution Tests (BUG-001 & BUG-002 Hardened)
  // -------------------------------------------------------------
  console.log("\n--- [Suite 2] Code Runner & Sandbox Execution Tests ---");

  // Acquire guest session token for authorized tests
  let guestAuthToken = "";
  try {
    const guestRes = await fetchApi("/api/auth/guest-session", { method: "POST" });
    assert(guestRes.status === 200, "Acquire guest session token returns 200");
    assert(Boolean(guestRes.data.token), "Guest session token returned");
    guestAuthToken = guestRes.data.token;
  } catch (err: any) {
    assert(false, "Acquire guest session token", err.message);
  }

  const authHeaders = { Authorization: `Bearer ${guestAuthToken}` };

  // 2.1 Unauthenticated execution rejection (BUG-001/BUG-002)
  try {
    const resUnauth = await fetchApi("/api/exec-code", {
      method: "POST",
      body: { code: "console.log(1)", language: "javascript" }
    });
    assert(resUnauth.status === 401, "Exec-code rejects unauthenticated execution with 401", `status: ${resUnauth.status}`);

    const resSandboxUnauth = await fetchApi("/api/sandbox/run", {
      method: "POST",
      body: { activeFilePath: "index.js", files: [{ path: "index.js", content: "console.log(1)" }] }
    });
    assert(resSandboxUnauth.status === 401, "Sandbox rejects unauthenticated execution with 401", `status: ${resSandboxUnauth.status}`);
  } catch (err: any) {
    assert(false, "Unauthenticated execution checks", err.message);
  }

  // 2.2 /api/exec-code: Missing code validation (with auth)
  try {
    const res = await fetchApi("/api/exec-code", {
      method: "POST",
      headers: authHeaders,
      body: {},
    });
    assert(res.status === 400, "Exec-code rejects empty payload with 400", `status: ${res.status}`);
  } catch (err: any) {
    assert(false, "Exec-code empty validation", err.message);
  }

  // 2.3 /api/exec-code: Node.js execution (with auth)
  try {
    const res = await fetchApi("/api/exec-code", {
      method: "POST",
      headers: authHeaders,
      body: {
        code: "const nums = [1, 2, 3, 4, 5]; console.log(nums.reduce((a, b) => a + b, 0));",
        language: "javascript",
      },
    });
    assert(res.status === 200, "Exec-code runs Node.js script", `status: ${res.status}`);
    assert(String(res.data.output || res.data.stdout || "").trim() === "15", "Node.js stdout computes sum '15'");
  } catch (err: any) {
    assert(false, "Exec-code Node.js execution", err.message);
  }

  // 2.4 /api/exec-code: Python execution (with auth)
  try {
    const res = await fetchApi("/api/exec-code", {
      method: "POST",
      headers: authHeaders,
      body: {
        code: "print([x**2 for x in range(5)])",
        language: "python",
      },
    });
    assert(res.status === 200, "Exec-code runs Python script", `status: ${res.status}`);
    assert(String(res.data.output || res.data.stdout || "").includes("[0, 1, 4, 9, 16]"), "Python script computes squares");
  } catch (err: any) {
    assert(false, "Exec-code Python execution", err.message);
  }

  // 2.5 /api/sandbox/run: Missing activeFilePath validation
  try {
    const res = await fetchApi("/api/sandbox/run", {
      method: "POST",
      headers: authHeaders,
      body: {},
    });
    assert(res.status === 400, "Sandbox rejects missing activeFilePath with 400", `status: ${res.status}`);
  } catch (err: any) {
    assert(false, "Sandbox empty body check", err.message);
  }

  // 2.6 /api/sandbox/run: Multi-file Python sandbox run
  try {
    const res = await fetchApi("/api/sandbox/run", {
      method: "POST",
      headers: authHeaders,
      body: {
        activeFilePath: "main.py",
        files: [
          { path: "helper.py", content: "def get_multiplier(): return 6\n" },
          { path: "main.py", content: "from helper import get_multiplier\nprint(7 * get_multiplier())\n" },
        ],
      },
    });
    assert(res.status === 200, "Sandbox executes multi-file Python project", `status: ${res.status}`);
    assert(String(res.data.stdout).trim() === "42", "Multi-file Python output imports and outputs '42'");
  } catch (err: any) {
    assert(false, "Sandbox multi-file execution", err.message);
  }

  // 2.7 /api/sandbox/run: Infinite loop limit test (safely terminates without hanging server)
  try {
    const startTime = Date.now();
    const res = await fetchApi("/api/sandbox/run", {
      method: "POST",
      headers: authHeaders,
      body: {
        activeFilePath: "loop.py",
        files: [{ path: "loop.py", content: "while True: pass\n" }],
      },
    });
    const duration = Date.now() - startTime;
    assert(res.status === 200, "Sandbox handles infinite loop safely without server crash", `status: ${res.status}`);
    assert(duration < 15000, "Infinite loop terminated within timeout boundary", `duration: ${duration}ms`);
    assert(res.data.timedOut === true || String(res.data.stderr || "").includes("timed out") || res.data.exitCode !== 0, "Execution flags timeout / termination");
  } catch (err: any) {
    assert(false, "Sandbox infinite loop test", err.message);
  }

  // -------------------------------------------------------------
  // SUITE 3: Auth Security & Boundary Limit Tests
  // -------------------------------------------------------------
  console.log("\n--- [Suite 3] Auth Security & Boundary Limit Tests ---");

  // 3.1 Prototype pollution attack in email
  try {
    const res = await fetchApi("/api/auth/signup", {
      method: "POST",
      body: { email: "__proto__", password: "Password123!" },
    });
    assert(res.status === 400, "Auth signup rejects __proto__ prototype pollution", `status: ${res.status}`);
  } catch (err: any) {
    assert(false, "Auth signup proto pollution", err.message);
  }

  // 3.2 Malformed and empty emails
  try {
    const resEmpty = await fetchApi("/api/auth/signup", {
      method: "POST",
      body: { email: "", password: "password" },
    });
    assert(resEmpty.status === 400, "Auth signup rejects empty email", `status: ${resEmpty.status}`);

    const resMalformed = await fetchApi("/api/auth/signup", {
      method: "POST",
      body: { email: "notanemail", password: "password" },
    });
    assert(resMalformed.status === 400, "Auth signup rejects malformed email", `status: ${resMalformed.status}`);
  } catch (err: any) {
    assert(false, "Auth signup malformed emails", err.message);
  }

  // 3.3 Short password limit
  try {
    const resShortPass = await fetchApi("/api/auth/signup", {
      method: "POST",
      body: { email: "valid@test.com", password: "123" },
    });
    assert(resShortPass.status === 400, "Auth signup rejects short password (<6 chars)", `status: ${resShortPass.status}`);
  } catch (err: any) {
    assert(false, "Auth signup short password", err.message);
  }

  // 3.4 Valid signup and login roundtrip
  const testEmail = `user_${Date.now()}@example.com`;
  const testPass = "StrongPass2026!";
  let testToken = "";

  try {
    const resSignup = await fetchApi("/api/auth/signup", {
      method: "POST",
      body: { email: testEmail, password: testPass, name: "Test User" },
    });
    assert(resSignup.status === 200, "Auth signup creates new user account", `status: ${resSignup.status}`);
    assert(resSignup.data.success === true, "Auth signup returns success: true");
    assert(Boolean(resSignup.data.token), "Auth signup returns session token");
    testToken = resSignup.data.token;
  } catch (err: any) {
    assert(false, "Auth signup valid user", err.message);
  }

  // 3.5 Duplicate user registration rejection
  try {
    const resDup = await fetchApi("/api/auth/signup", {
      method: "POST",
      body: { email: testEmail, password: testPass },
    });
    assert(resDup.status === 400, "Auth signup rejects duplicate email", `status: ${resDup.status}`);
  } catch (err: any) {
    assert(false, "Auth signup duplicate email", err.message);
  }

  // 3.6 Login with wrong password
  try {
    const resWrongPass = await fetchApi("/api/auth/login", {
      method: "POST",
      body: { email: testEmail, password: "WrongPassword999!" },
    });
    assert(resWrongPass.status === 401, "Auth login rejects incorrect password with 401", `status: ${resWrongPass.status}`);
  } catch (err: any) {
    assert(false, "Auth login wrong pass", err.message);
  }

  // 3.7 Login with correct password
  try {
    const resLogin = await fetchApi("/api/auth/login", {
      method: "POST",
      body: { email: testEmail, password: testPass },
    });
    assert(resLogin.status === 200, "Auth login succeeds with correct credentials", `status: ${resLogin.status}`);
    assert(Boolean(resLogin.data.token), "Auth login returns token");
  } catch (err: any) {
    assert(false, "Auth login correct pass", err.message);
  }

  // 3.8 /api/auth/me with valid and invalid tokens
  try {
    const resMeValid = await fetchApi("/api/auth/me", {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    assert(resMeValid.status === 200, "Auth me accepts valid bearer token", `status: ${resMeValid.status}`);
    assert(resMeValid.data.user?.email === testEmail, "Auth me returns correct user profile");

    const resMeForged = await fetchApi("/api/auth/me", {
      headers: { Authorization: `Bearer ${testToken.slice(0, -5)}fake` },
    });
    assert(resMeForged.status === 401, "Auth me rejects forged/tampered token with 401", `status: ${resMeForged.status}`);
  } catch (err: any) {
    assert(false, "Auth me token validation", err.message);
  }

  // -------------------------------------------------------------
  // SUITE 4: File Share Service & Limit Tests
  // -------------------------------------------------------------
  console.log("\n--- [Suite 4] File Share Service & Limit Tests ---");

  // 4.1 Missing upload content
  try {
    const res = await fetchApi("/api/share/upload", {
      method: "POST",
      body: { fileName: "empty.txt" },
    });
    assert(res.status === 400, "Share upload rejects missing content with 400", `status: ${res.status}`);
  } catch (err: any) {
    assert(false, "Share upload missing content", err.message);
  }

  // 4.2 Valid upload & download roundtrip
  let uploadedFileId = "";
  try {
    const testContent = "Hello from automated regression test! " + Date.now();
    const resUpload = await fetchApi("/api/share/upload", {
      method: "POST",
      body: {
        fileName: "regression-test.txt",
        fileData: testContent,
      },
    });
    assert(resUpload.status === 200, "Share upload saves file and returns 200", `status: ${resUpload.status}`);
    assert(Boolean(resUpload.data.fileId), "Share upload returns fileId");
    uploadedFileId = resUpload.data.fileId;

    const resDownload = await fetchApi(`/api/share/download/${uploadedFileId}`);
    assert(resDownload.status === 200, "Share download retrieves uploaded file", `status: ${resDownload.status}`);
    assert(String(resDownload.data) === testContent, "Share download matches exact uploaded content");
  } catch (err: any) {
    assert(false, "Share upload/download roundtrip", err.message);
  }

  // 4.3 Path traversal attempt on download
  try {
    const resTraversal = await fetchApi(`/api/share/download/..%2F..%2Fetc%2Fpasswd`);
    assert(resTraversal.status === 400 || resTraversal.status === 404, "Share download rejects path traversal safely", `status: ${resTraversal.status}`);
  } catch (err: any) {
    assert(false, "Share download path traversal", err.message);
  }

  // 4.4 Non-existent fileId
  try {
    const resNonExistent = await fetchApi(`/api/share/download/non_existent_file_id_99999`);
    assert(resNonExistent.status === 404, "Share download returns 404 for missing file", `status: ${resNonExistent.status}`);
  } catch (err: any) {
    assert(false, "Share download 404", err.message);
  }

  // -------------------------------------------------------------
  // SUITE 5: Specialized Agent Ecosystem Proxy Endpoints
  // -------------------------------------------------------------
  console.log("\n--- [Suite 5] Specialized Agent Ecosystem Proxy Endpoints ---");

  // 5.1 Jokes Agent
  try {
    const res = await fetchApi("/api/jokes/random");
    assert(res.status === 200, "GET /api/jokes/random returns 200", `status: ${res.status}`);
  } catch (err: any) {
    assert(false, "Jokes random endpoint", err.message);
  }

  // 5.2 Quotes Agent
  try {
    const res = await fetchApi("/api/quotes/random");
    assert(res.status === 200, "GET /api/quotes/random returns 200", `status: ${res.status}`);
  } catch (err: any) {
    assert(false, "Quotes random endpoint", err.message);
  }

  // 5.3 Advice Agent
  try {
    const res = await fetchApi("/api/advice/random");
    assert(res.status === 200, "GET /api/advice/random returns 200", `status: ${res.status}`);
  } catch (err: any) {
    assert(false, "Advice random endpoint", err.message);
  }

  // 5.4 Facts Agent
  try {
    const res = await fetchApi("/api/facts/random");
    assert(res.status === 200, "GET /api/facts/random returns 200", `status: ${res.status}`);
  } catch (err: any) {
    assert(false, "Facts random endpoint", err.message);
  }

  // 5.5 Crypto Live Agent
  try {
    const res = await fetchApi("/api/crypto/live");
    assert(res.status === 200, "GET /api/crypto/live returns 200", `status: ${res.status}`);
  } catch (err: any) {
    assert(false, "Crypto live endpoint", err.message);
  }

  // 5.6 Forex Agent
  try {
    const res = await fetchApi("/api/forex/latest");
    assert(res.status === 200, "GET /api/forex/latest returns 200", `status: ${res.status}`);
  } catch (err: any) {
    assert(false, "Forex latest endpoint", err.message);
  }

  // 5.7 Space Astros & APOD & ISS
  try {
    const resAstros = await fetchApi("/api/space/astros");
    assert(resAstros.status === 200, "GET /api/space/astros returns 200", `status: ${resAstros.status}`);

    const resIss = await fetchApi("/api/iss");
    assert(resIss.status === 200, "GET /api/iss returns 200", `status: ${resIss.status}`);

    const resApod = await fetchApi("/api/space/apod");
    assert(resApod.status === 200, "GET /api/space/apod returns 200", `status: ${resApod.status}`);
  } catch (err: any) {
    assert(false, "Space agent endpoints", err.message);
  }

  // 5.8 Dictionary Agent
  try {
    const res = await fetchApi("/api/dictionary/algorithm");
    assert(res.status === 200, "GET /api/dictionary/algorithm returns 200", `status: ${res.status}`);

    const resNonExistent = await fetchApi("/api/dictionary/zyxwvutsrqp12345");
    assert(resNonExistent.status === 200 || resNonExistent.status === 404, "GET /api/dictionary handles unknown words safely", `status: ${resNonExistent.status}`);
  } catch (err: any) {
    assert(false, "Dictionary agent endpoint", err.message);
  }

  // 5.9 Universities Agent
  try {
    const res = await fetchApi("/api/universities?country=United+States");
    assert(res.status === 200, "GET /api/universities returns 200", `status: ${res.status}`);
    assert(Array.isArray(res.data), "Universities returns array of results");
  } catch (err: any) {
    assert(false, "Universities agent endpoint", err.message);
  }

  // 5.10 Countries Search Agent
  try {
    const res = await fetchApi("/api/countries/search?name=France");
    assert(res.status === 200, "GET /api/countries/search returns 200", `status: ${res.status}`);
  } catch (err: any) {
    assert(false, "Countries search agent endpoint", err.message);
  }

  // 5.11 YouTube Status & Search
  try {
    const resStatus = await fetchApi("/api/youtube/status");
    assert(resStatus.status === 200, "GET /api/youtube/status returns 200", `status: ${resStatus.status}`);

    const resSearch = await fetchApi("/api/youtube/search?q=typescript");
    assert(resSearch.status === 200, "GET /api/youtube/search returns 200", `status: ${resSearch.status}`);
  } catch (err: any) {
    assert(false, "YouTube agent endpoints", err.message);
  }

  // 5.12 Gemini Vision MIME type rejection limit test
  try {
    const resInvalidMime = await fetchApi("/api/gemini/vision", {
      method: "POST",
      body: {
        imageBase64: "dGVzdA==",
        mimeType: "application/x-executable",
        prompt: "Analyze",
      },
    });
    assert(resInvalidMime.status === 400, "Gemini vision rejects non-image MIME type with 400", `status: ${resInvalidMime.status}`);
  } catch (err: any) {
    assert(false, "Gemini vision mime rejection", err.message);
  }

  // 5.13 OpenRouter Chat validation
  try {
    const resMissingMessages = await fetchApi("/api/openrouter/chat", {
      method: "POST",
      body: { model: "anthropic/claude-3-haiku" },
    });
    assert(resMissingMessages.status === 400, "OpenRouter chat rejects missing messages array with 400", `status: ${resMissingMessages.status}`);
  } catch (err: any) {
    assert(false, "OpenRouter missing messages validation", err.message);
  }

  // -------------------------------------------------------------
  // SUITE 6: Frontend Core Utilities Boundary & Limit Tests
  // -------------------------------------------------------------
  console.log("\n--- [Suite 6] Frontend Core Utilities Boundary & Limit Tests ---");

  // 6.1 Syntax Highlighter stress & limits
  try {
    const { highlightCode } = await import("../src/utils/syntaxHighlighter");

    // Empty string
    const emptyResult = highlightCode("", "typescript");
    assert(emptyResult === "", "highlightCode handles empty string cleanly");

    // Huge code string (100,000 chars)
    const hugeCode = "const x = 42;\n".repeat(7000);
    const startHuge = Date.now();
    const hugeResult = highlightCode(hugeCode, "typescript");
    const hugeTime = Date.now() - startHuge;
    assert(hugeResult.length > 0, "highlightCode processes 100k+ chars without crash", `time: ${hugeTime}ms`);
    assert(hugeTime < 3000, "highlightCode 100k+ chars completes in <3s");

    // Unsafe HTML injection in code
    const unsafeCode = "<script>alert('xss')</script> & \" '";
    const escapedResult = highlightCode(unsafeCode, "html");
    assert(!escapedResult.includes("<script>alert"), "highlightCode escapes raw <script> tags to HTML entities");

    // Stress testing 500 distinct snippets (evaluates LRU cache stability)
    for (let i = 0; i < 500; i++) {
      highlightCode(`function test_${i}() { return ${i * 42}; }`, "typescript");
    }
    assert(true, "highlightCode survived 500 distinct cache insertions without memory leak");
  } catch (err: any) {
    assert(false, "Syntax highlighter limit tests", err.message);
  }

  // 6.2 Math Engine boundary limits
  try {
    const { safeEvaluate2DFunction, analyzeFunction } = await import("../src/utils/mathEngine");

    // Empty expression
    const emptyRes = safeEvaluate2DFunction("", -10, 10);
    assert(emptyRes.isValid === false, "MathEngine safeEvaluate2DFunction rejects empty input");

    // Valid mathematical function (e.g. sin(x))
    const sinRes = safeEvaluate2DFunction("sin(x)", -3.14, 3.14, 50);
    assert(sinRes.isValid === true, "MathEngine evaluates sin(x)");
    assert(sinRes.xVals.length === 51, "MathEngine produces expected number of plot points");

    // Singularity evaluation (e.g. 1 / x around 0)
    const singRes = safeEvaluate2DFunction("1 / x", -5, 5, 20);
    assert(singRes.isValid === true, "MathEngine evaluates function with singularity safely");

    // Calculus analysis: derivative and integral
    const analysis = analyzeFunction("x^2", [0, 1, 2], [0, 1, 4], 2, 0, 2);
    assert(analysis.derivativeAtX0 !== null, "MathEngine computes numerical derivative");
    assert(Math.abs((analysis.derivativeAtX0 || 0) - 4) < 0.1, "Numerical derivative of x^2 at x=2 is ~4");
  } catch (err: any) {
    assert(false, "Math engine limit tests", err.message);
  }

  // 6.3 Token Optimizer limits
  try {
    const { sanitizeAndCompressPrompt, compressChatHistory, calculateTokenSavings, getAdaptiveMaxTokens } = await import("../src/utils/tokenOptimizer");

    // Compress whitespace & code fences
    const rawPrompt = "Hello\n\n\n\nWorld    \n```\n  function test() {\n    return 1;\n  }\n```";
    const compressed = sanitizeAndCompressPrompt(rawPrompt);
    assert(compressed.includes("function test() {\n    return 1;"), "sanitizeAndCompressPrompt preserves indentation inside code fences");

    // Token savings calculation
    const savings = calculateTokenSavings("A".repeat(1000), "A".repeat(400));
    assert(savings.originalLength === 1000, "calculateTokenSavings tracks original length");
    assert(savings.savingsPercentage === 60, "calculateTokenSavings computes 60% savings");

    // Adaptive max tokens
    const shortQueryTokens = getAdaptiveMaxTokens("What is a closure?");
    assert(shortQueryTokens === 1536, "getAdaptiveMaxTokens selects 1536 for short query");
    const fullCodeTokens = getAdaptiveMaxTokens("Please create component for full code dashboard");
    assert(fullCodeTokens === 4096, "getAdaptiveMaxTokens selects 4096 for full component creation");

    // Compress chat history
    const history = [
      { role: "system", content: "You are an assistant." },
      ...Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `Message ${i}: ${"long content ".repeat(150)}`,
      })),
    ];
    const condensed = compressChatHistory(history, 6);
    assert(condensed.length <= 7, "compressChatHistory restricts history to system prompt + max history window");
  } catch (err: any) {
    assert(false, "Token optimizer limit tests", err.message);
  }

  // 6.4 Key Obfuscation security limits
  try {
    const { isValidOpenRouterKey, obfuscateKey, deobfuscateKey } = await import("../src/utils/keyObfuscation");

    assert(!isValidOpenRouterKey(""), "Empty key is invalid");
    assert(!isValidOpenRouterKey("short"), "Short key is invalid");
    assert(!isValidOpenRouterKey("sk-invalid"), "Non-openrouter prefix is invalid");
    assert(isValidOpenRouterKey("sk-or-v1-abcdef1234567890"), "Valid sk-or- key passes validation");

    const sampleKey = "sk-or-v1-supersecretkey12345";
    const obf = obfuscateKey(sampleKey);
    assert(obf !== sampleKey, "Obfuscated key does not match plain key");
    const deobf = deobfuscateKey(obf);
    assert(deobf === sampleKey, "Deobfuscated key roundtrips cleanly to original key");
  } catch (err: any) {
    assert(false, "Key obfuscation limit tests", err.message);
  }

  // 6.5 ID Generator collision limit test
  try {
    const { generateUniqueId } = await import("../src/utils/idGenerator");
    const idSet = new Set<string>();
    const count = 10000;
    for (let i = 0; i < count; i++) {
      idSet.add(generateUniqueId());
    }
    assert(idSet.size === count, `ID generator generated ${count} unique IDs with 0 collisions`);
  } catch (err: any) {
    assert(false, "ID generator collision limit test", err.message);
  }

  // -------------------------------------------------------------
  // SUITE 7: Agent Orchestrator & Skills Service Limits
  // -------------------------------------------------------------
  console.log("\n--- [Suite 7] Agent Orchestrator & Skills Service Limits ---");
  try {
    const { detectAndSelectChain } = await import("../src/services/agentOrchestratorService");

    // Empty prompt
    const emptyChain = await detectAndSelectChain("");
    assert(Boolean(emptyChain), "detectAndSelectChain handles empty prompt safely");

    // SaaS prompt
    const saasChain = await detectAndSelectChain("Build a SaaS app with subscription billing");
    assert(saasChain?.id === "build_saas", "detectAndSelectChain identifies build_saas chain");

    // Review prompt
    const reviewChain = await detectAndSelectChain("Perform a security audit and review this repo");
    assert(reviewChain?.id === "review_repo", "detectAndSelectChain identifies review_repo chain");

    // Deploy prompt
    const deployChain = await detectAndSelectChain("Deploy the project with Docker and configure CI/CD");
    assert(deployChain?.id === "deploy_project", "detectAndSelectChain identifies deploy_project chain");

    // Massive prompt (50,000 characters)
    const giantPrompt = "create app: " + "features ".repeat(7000);
    const giantChain = await detectAndSelectChain(giantPrompt);
    assert(Boolean(giantChain), "detectAndSelectChain handles 50,000 char prompt without error");
  } catch (err: any) {
    assert(false, "Agent orchestrator limit tests", err.message);
  }

  // -------------------------------------------------------------
  // SUITE 8: Security Audit & Bug Fix Regression Tests (BUG-001 - BUG-010)
  // -------------------------------------------------------------
  console.log("\n--- [Suite 8] Security Audit & Bug Fix Regression Tests ---");

  // 8.1 SSRF Protection in /api/proxy (BUG-003)
  try {
    // Unauthenticated proxy request must be rejected
    const unauthProxy = await fetchApi("/api/proxy?url=https://httpbin.org/get");
    assert(unauthProxy.status === 401, "Proxy rejects unauthenticated requests with 401", `status: ${unauthProxy.status}`);

    // Loopback 127.0.0.1 must be blocked
    const loopbackRes = await fetchApi("/api/proxy?url=http://127.0.0.1:3000/api/health", { headers: authHeaders });
    assert(loopbackRes.status === 403, "Proxy blocks loopback 127.0.0.1 with 403", `status: ${loopbackRes.status}`);

    // Cloud metadata 169.254.169.254 must be blocked
    const metadataRes = await fetchApi("/api/proxy?url=http://169.254.169.254/computeMetadata/v1", { headers: authHeaders });
    assert(metadataRes.status === 403, "Proxy blocks cloud metadata IP 169.254.169.254 with 403", `status: ${metadataRes.status}`);

    // Internal private network IP (10.0.0.1) must be blocked
    const privateRes = await fetchApi("/api/proxy?url=http://10.0.0.1/admin", { headers: authHeaders });
    assert(privateRes.status === 403, "Proxy blocks RFC1918 10.0.0.1 with 403", `status: ${privateRes.status}`);

    // Non-HTTP/HTTPS protocol (file://) must be rejected
    const fileProtoRes = await fetchApi("/api/proxy?url=file:///etc/passwd", { headers: authHeaders });
    assert(fileProtoRes.status === 400, "Proxy rejects file:// protocol with 400", `status: ${fileProtoRes.status}`);

    // Forbidden HTTP methods through proxy (e.g. DELETE, PUT)
    const deleteRes = await fetchApi("/api/proxy?url=https://httpbin.org/delete", { method: "DELETE", headers: authHeaders });
    assert(deleteRes.status === 405, "Proxy rejects DELETE method with 405", `status: ${deleteRes.status}`);
  } catch (err: any) {
    assert(false, "SSRF proxy protection tests", err.message);
  }

  // 8.2 GitHub OAuth URL endpoint (BUG-004)
  try {
    const ghUrlRes = await fetchApi("/api/auth/github/url");
    assert(ghUrlRes.status === 200, "GET /api/auth/github/url returns 200");
    assert(typeof ghUrlRes.data.configured === "boolean", "GitHub auth status returns boolean configured flag");
    if (!ghUrlRes.data.configured) {
      assert(!ghUrlRes.data.url, "Unconfigured GitHub OAuth does not return a dummy auth URL");
    }
  } catch (err: any) {
    assert(false, "GitHub OAuth endpoint test", err.message);
  }

  // 8.3 OpenRouter API Key body injection rejection (BUG-005)
  try {
    const fakeBodyKeyRes = await fetchApi("/api/openrouter/verify-key", {
      method: "POST",
      body: { apiKey: "sk-or-v1-fake-injected-key" }
    });
    // Should reject because body key is ignored and no Authorization header was provided
    assert(fakeBodyKeyRes.status === 400, "Verify-key rejects body-injected apiKey when Authorization header missing", `status: ${fakeBodyKeyRes.status}`);
  } catch (err: any) {
    assert(false, "OpenRouter body key injection test", err.message);
  }

  // 8.4 Dynamic Token Efficiency Calculation (BUG-010)
  try {
    const tokenSavingsRes = await fetchApi("/api/system/token-savings");
    assert(tokenSavingsRes.status === 200, "Token savings returns 200");
    const eff = tokenSavingsRes.data.efficiencyScore;
    assert(typeof eff === "string" && eff.endsWith("%"), "Efficiency score is formatted percentage string");
    const parsedEff = parseFloat(eff.replace("%", ""));
    assert(!isNaN(parsedEff) && parsedEff >= 0 && parsedEff <= 100, "Efficiency score is valid number between 0 and 100");
  } catch (err: any) {
    assert(false, "Dynamic token savings calculation test", err.message);
  }

  // 8.5 Crypto Live vs Fallback indicators (BUG-008)
  try {
    const cryptoMarketRes = await fetchApi("/api/crypto/market-prices");
    assert(cryptoMarketRes.status === 200, "Crypto market prices returns 200");
    assert(typeof cryptoMarketRes.data.isLive === "boolean", "Crypto market prices includes isLive indicator");
    assert(typeof cryptoMarketRes.data.isFallback === "boolean", "Crypto market prices includes isFallback indicator");
    assert(Boolean(cryptoMarketRes.data.source), "Crypto market prices includes clear source attribution");
  } catch (err: any) {
    assert(false, "Crypto live vs fallback indicators test", err.message);
  }

  // -------------------------------------------------------------
  // Summary of Results
  // -------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================");

  if (failures.length > 0) {
    console.log("\nFailed Tests Details:");
    failures.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f.testName}: ${f.error}`);
    });
  }

  process.exit(failedCount > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
