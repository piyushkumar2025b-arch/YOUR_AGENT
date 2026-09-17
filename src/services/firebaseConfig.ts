import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore, 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot,
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  getDocFromServer
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import rawFirebaseConfig from "../../firebase-applet-config.json";

// Read from injected Vite environment variables if defined, with fallback to platform config
const activeFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawFirebaseConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || rawFirebaseConfig.firestoreDatabaseId
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(activeFirebaseConfig);

// Initialize Firestore with custom database ID from config using HTTP long-polling
// This prevents WebChannel streaming connection failures and unavailable errors inside sandboxed browser iframes
let firestoreInstance: Firestore | null = null;
const targetDbId = activeFirebaseConfig.firestoreDatabaseId || undefined;

try {
  firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, targetDbId);
} catch (initErr) {
  try {
    firestoreInstance = targetDbId ? getFirestore(app, targetDbId) : getFirestore(app);
  } catch (fallbackErr) {
    try {
      firestoreInstance = getFirestore(app);
    } catch (finalErr) {
      console.warn("Firestore initialization fallback:", finalErr);
    }
  }
}

export const db: Firestore = (firestoreInstance || (getApps().length > 0 ? getFirestore(app) : null)) as Firestore;

// Connection validator per SKILL.md critical constraint
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore client operating in offline mode.");
      return false;
    }
    // Document missing or server response indicates server is reachable
    return true;
  }
}

// Call validation non-blockingly on boot
if (typeof window !== "undefined") {
  validateFirestoreConnection().catch(() => {});
}

// Authentication
export const auth = getAuth(app);

let anonymousAttempted = false;
let anonymousSupported = true;

// Authenticate gracefully so Firestore rules can verify session if enabled
export async function ensureAuth(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  if (anonymousAttempted && !anonymousSupported) return null;

  try {
    anonymousAttempted = true;
    const cred = await signInAnonymously(auth);
    anonymousSupported = true;
    return cred.user;
  } catch (err: any) {
    if (err?.code === "auth/admin-restricted-operation" || err?.code === "auth/operation-not-allowed") {
      anonymousSupported = false;
    }
    // Allow retry on temporary network drop
    if (err?.code === "auth/network-request-failed") {
      anonymousAttempted = false;
    }
    return null;
  }
}

export { collection, doc, setDoc, getDoc, getDocs, onSnapshot, query, orderBy, limit, serverTimestamp, getDocFromServer };
