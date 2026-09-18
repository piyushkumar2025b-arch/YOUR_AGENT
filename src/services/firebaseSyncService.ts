import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  ensureAuth 
} from "./firebaseConfig";
import { VirtualFile, Message, AgentAction } from "../types";

export interface FirebaseSyncStatus {
  connected: boolean;
  lastSyncedAt: string | null;
  saving: boolean;
  error: string | null;
  mode: "cloud" | "offline";
}

// Save workspace files to Firebase Firestore
export async function syncFilesToFirebase(files: VirtualFile[], emptyFolders: string[] = []): Promise<boolean> {
  try {
    const user = await ensureAuth().catch(() => null);
    if (!user || !user.uid) return false;

    const docRef = doc(db, "workspaces", user.uid);
    await setDoc(docRef, {
      userId: user.uid,
      files: files.map(f => ({
        path: f.path,
        content: f.content,
        language: f.language,
        isUserCreated: !!f.isUserCreated
      })),
      emptyFolders,
      updatedAt: serverTimestamp(),
      fileCount: files.length
    }, { merge: true });
    return true;
  } catch (err: any) {
    // If offline or network unavailable, Firestore operates silently without breaking the app
    console.debug("Firestore syncFilesToFirebase notice:", err?.message || err);
    return false;
  }
}

// Load workspace files from Firebase Firestore with safety timeout
export async function loadFilesFromFirebase(): Promise<{ files: VirtualFile[]; emptyFolders: string[] } | null> {
  try {
    const user = await ensureAuth().catch(() => null);
    if (!user || !user.uid) return null;

    const docRef = doc(db, "workspaces", user.uid);
    
    // Safety timeout: if Firestore is offline, return null after 3s so the app uses local storage without hanging
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
    
    const fetchPromise = (async () => {
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.files) && data.files.length > 0) {
            return {
              files: data.files,
              emptyFolders: Array.isArray(data.emptyFolders) ? data.emptyFolders : []
            };
          }
        }
      } catch (e: any) {
        console.debug("Firestore getDoc in loadFilesFromFirebase:", e?.message || e);
      }
      return null;
    })();

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (err: any) {
    console.debug("Firestore loadFilesFromFirebase:", err?.message || err);
    return null;
  }
}

// Sync chat messages to Firebase Firestore
export async function syncMessagesToFirebase(messages: Message[]): Promise<boolean> {
  try {
    const user = await ensureAuth().catch(() => null);
    if (!user || !user.uid) return false;

    const docRef = doc(db, "chat_sessions", user.uid);
    // Limit to latest 50 messages to keep document light
    const trimmed = messages.slice(-50);
    await setDoc(docRef, {
      userId: user.uid,
      messages: trimmed,
      updatedAt: serverTimestamp(),
      count: trimmed.length
    }, { merge: true });
    return true;
  } catch (err: any) {
    console.debug("Firestore syncMessagesToFirebase notice:", err?.message || err);
    return false;
  }
}

// Load chat messages from Firebase Firestore with safety timeout
export async function loadMessagesFromFirebase(): Promise<Message[] | null> {
  try {
    const user = await ensureAuth().catch(() => null);
    if (!user || !user.uid) return null;

    const docRef = doc(db, "chat_sessions", user.uid);
    
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
    
    const fetchPromise = (async () => {
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            return data.messages;
          }
        }
      } catch (e: any) {
        console.debug("Firestore getDoc in loadMessagesFromFirebase:", e?.message || e);
      }
      return null;
    })();

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (err: any) {
    console.debug("Firestore loadMessagesFromFirebase:", err?.message || err);
    return null;
  }
}

// Save audit log entry to Firebase Firestore
export async function logActionToFirebase(action: { type: string; message: string; path?: string }): Promise<void> {
  try {
    const user = await ensureAuth().catch(() => null);
    if (!user || !user.uid) return;

    const logsCol = collection(db, "agent_audit_logs");
    const newDoc = doc(logsCol);
    await setDoc(newDoc, {
      ...action,
      userId: user.uid,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    // Non-blocking
  }
}

