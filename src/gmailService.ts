import { app, auth } from "./services/firebaseConfig";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";

const provider = new GoogleAuthProvider();
// Request Workspace Gmail and Drive scopes
provider.addScope("https://www.googleapis.com/auth/gmail.readonly");
provider.addScope("https://www.googleapis.com/auth/gmail.send");
provider.addScope("https://www.googleapis.com/auth/gmail.modify");
provider.addScope("https://www.googleapis.com/auth/gmail.labels");
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/drive");

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache the access token in memory
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If we have a user but no cached token (e.g. reload), we might need to log in again to fetch the token,
        // or wait for explicit login trigger.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get access token from Firebase Auth. Make sure you accepted permissions.");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error?.code === "auth/popup-closed-by-user" || error?.message?.includes("popup-closed-by-user")) {
      console.warn("Google sign-in popup was closed by the user.");
      return null;
    }
    console.error("Sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// ----------------------------------------------------
// Gmail API Interactions
// ----------------------------------------------------

export interface GmailAttachmentInfo {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  attachmentId?: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  isHtml: boolean;
  attachments?: GmailAttachmentInfo[];
}

// Fetch headers helper
function getHeader(headers: { name: string; value: string }[], name: string): string {
  const found = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return found ? found.value : "";
}

// Extract attachments from payload
function extractAttachments(payload: any): GmailAttachmentInfo[] {
  const list: GmailAttachmentInfo[] = [];

  const walkParts = (part: any) => {
    if (part.filename && part.filename.length > 0) {
      list.push({
        id: part.partId || part.body?.attachmentId || Math.random().toString(),
        filename: part.filename,
        mimeType: part.mimeType || "application/octet-stream",
        size: part.body?.size || 0,
        attachmentId: part.body?.attachmentId
      });
    }
    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(walkParts);
    }
  };

  if (payload) walkParts(payload);
  return list;
}

// Decode raw body of a message parts
function decodeBody(payload: any): { body: string; isHtml: boolean } {
  let body = "";
  let isHtml = false;

  const decodeBase64 = (data: string) => {
    try {
      // Decode base64url safe string
      const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
      return decodeURIComponent(
        atob(base64)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } catch (e) {
      try {
        const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
        return atob(base64);
      } catch {
        return "";
      }
    }
  };

  if (!payload) return { body, isHtml };

  if (payload.body && payload.body.data) {
    body = decodeBase64(payload.body.data);
    isHtml = payload.mimeType === "text/html";
    return { body, isHtml };
  }

  if (payload.parts && payload.parts.length > 0) {
    // Try to find text/html part first, fallback to text/plain
    const htmlPart = payload.parts.find((part: any) => part.mimeType === "text/html");
    const plainPart = payload.parts.find((part: any) => part.mimeType === "text/plain");

    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      body = decodeBase64(htmlPart.body.data);
      isHtml = true;
    } else if (plainPart && plainPart.body && plainPart.body.data) {
      body = decodeBase64(plainPart.body.data);
      isHtml = false;
    } else {
      // Check recursively
      for (const part of payload.parts) {
        const res = decodeBody(part);
        if (res.body) {
          return res;
        }
      }
    }
  }

  return { body, isHtml };
}

// 1. List latest 10 emails (supports optional search query)
export const listEmails = async (token: string, query: string = ""): Promise<GmailMessageSummary[]> => {
  let url = "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10";
  if (query.trim()) {
    url += `&q=${encodeURIComponent(query)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`Gmail API List failed: ${errorMsg}`);
  }

  const data = await response.json();
  if (!data.messages || data.messages.length === 0) {
    return [];
  }

  // Fetch full details for each message in parallel
  const detailPromises = data.messages.map(async (msg: { id: string }) => {
    try {
      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!detailResponse.ok) return null;
      const fullMsg = await detailResponse.json();
      const headers = fullMsg.payload?.headers || [];

      const { body, isHtml } = decodeBody(fullMsg.payload);
      const attachments = extractAttachments(fullMsg.payload);

      return {
        id: fullMsg.id,
        threadId: fullMsg.threadId,
        snippet: fullMsg.snippet || "",
        from: getHeader(headers, "From"),
        to: getHeader(headers, "To"),
        subject: getHeader(headers, "Subject") || "(No Subject)",
        date: getHeader(headers, "Date"),
        body: body || fullMsg.snippet || "",
        isHtml,
        attachments
      } as GmailMessageSummary;
    } catch (err) {
      console.error(`Failed to fetch message details for ${msg.id}`, err);
      return null;
    }
  });

  const resolved = await Promise.all(detailPromises);
  return resolved.filter((m): m is GmailMessageSummary => m !== null);
};

// 2. Send email
export const sendEmail = async (
  token: string,
  to: string,
  subject: string,
  body: string
): Promise<any> => {
  if (!to.trim()) throw new Error("Recipient email (To) is required.");

  // Build standard RFC 2822 email layout
  const rawEmail = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `Content-Type: text/html; charset=utf-8`,
    `MIME-Version: 1.0`,
    ``,
    body
  ].join("\r\n");

  // Web-safe base64url encode
  const base64Safe = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      raw: base64Safe
    })
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`Gmail API Send failed: ${errorMsg}`);
  }

  return await response.json();
};

// 3. Download Attachment Data
export const getAttachmentData = async (
  token: string,
  messageId: string,
  attachmentId: string
): Promise<{ size: number; data: string }> => {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`Gmail API Attachment Fetch failed: ${errorMsg}`);
  }

  return await response.json();
};

// ----------------------------------------------------
// Google Drive API Interactions
// ----------------------------------------------------

export const createDriveFolder = async (
  token: string,
  name: string,
  parentId?: string
): Promise<string> => {
  const body: any = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentId) {
    body.parents = [parentId];
  }

  const response = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create Drive folder: ${errText}`);
  }

  const data = await response.json();
  return data.id;
};

export const uploadFileToDrive = async (
  token: string,
  filename: string,
  content: string,
  parentId?: string
): Promise<string> => {
  const boundary = "workspace_upload_boundary_" + Date.now();
  const metadata = {
    name: filename,
    parents: parentId ? [parentId] : undefined,
  };

  const multipartBody = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    content,
    `--${boundary}--`
  ].join("\r\n");

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to upload file to Drive: ${errText}`);
  }

  const data = await response.json();
  return data.id;
};

