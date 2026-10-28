import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  Firestore 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';

const STORAGE_KEY_FIREBASE = 'ghotok_firebase_cfg_v2_';

// Web App Firebase configuration provided by user
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyB0FNMYbOswtxB98dFcKAAokpl0Woo9lFM",
  authDomain: "gen-lang-client-0703650574.firebaseapp.com",
  projectId: "gen-lang-client-0703650574",
  storageBucket: "gen-lang-client-0703650574.firebasestorage.app",
  messagingSenderId: "218299447923",
  appId: "1:218299447923:web:4be7e4c13c111ce8718806"
};

export const DEFAULT_PROJECT_ID = DEFAULT_FIREBASE_CONFIG.projectId;
export const LIVE_ANDROID_DATABASE_ID = "ai-studio-android-ghotok-4211e3a9-df28-46c8-9b21-bd8ea1fc4a18";
export const DEFAULT_DATABASE_ID = LIVE_ANDROID_DATABASE_ID;
export const DEFAULT_API_KEY = DEFAULT_FIREBASE_CONFIG.apiKey;
export const DEFAULT_AUTH_DOMAIN = DEFAULT_FIREBASE_CONFIG.authDomain;
export const DEFAULT_STORAGE_BUCKET = DEFAULT_FIREBASE_CONFIG.storageBucket;
export const DEFAULT_MESSAGING_SENDER_ID = DEFAULT_FIREBASE_CONFIG.messagingSenderId;
export const DEFAULT_APP_ID = DEFAULT_FIREBASE_CONFIG.appId;

export const FIREBASE_PROJECT_ID = DEFAULT_PROJECT_ID;
export const FIRESTORE_DATABASE_ID = DEFAULT_DATABASE_ID;

export async function checkFirestoreConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return { connected: true, message: `Connected (${snap.size} users in live DB)` };
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      return { connected: false, message: 'Permission Denied (Sign In Required)' };
    }
    return { connected: false, message: err?.message || 'Connection failed' };
  }
}

export interface FirebaseCustomConfig {
  projectId: string;
  firestoreDatabaseId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId?: string;
  appId?: string;
}

export function getSavedFirebaseConfig(): FirebaseCustomConfig {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_FIREBASE}config`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-migrate from any old legacy project configuration or invalid database ID
      if (
        parsed.projectId &&
        parsed.projectId !== 'gen-lang-client-0516606678' &&
        parsed.apiKey !== 'AIzaSyBhYWHkD6pN5N4lAk2gqiaSq4dQ_vwH2Sk'
      ) {
        // If the databaseId was set to the non-existent ai-studio-ee10d669-2437-4e64-9a43-3484863699ca, migrate back to DEFAULT_DATABASE_ID
        const targetDbId = (!parsed.firestoreDatabaseId || parsed.firestoreDatabaseId === 'ai-studio-ee10d669-2437-4e64-9a43-3484863699ca')
          ? DEFAULT_DATABASE_ID
          : parsed.firestoreDatabaseId;

        // Auto-save the corrected ID
        if (targetDbId !== parsed.firestoreDatabaseId) {
          localStorage.setItem(`${STORAGE_KEY_FIREBASE}config`, JSON.stringify({
            ...parsed,
            firestoreDatabaseId: targetDbId
          }));
        }

        return {
          projectId: parsed.projectId,
          firestoreDatabaseId: targetDbId,
          apiKey: parsed.apiKey || DEFAULT_API_KEY,
          authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
          storageBucket: parsed.storageBucket || `${parsed.projectId}.firebasestorage.app`,
          messagingSenderId: parsed.messagingSenderId || DEFAULT_MESSAGING_SENDER_ID,
          appId: parsed.appId || DEFAULT_APP_ID
        };
      } else {
        localStorage.removeItem(`${STORAGE_KEY_FIREBASE}config`);
      }
    }
  } catch (e) {
    // ignore
  }

  return {
    projectId: DEFAULT_PROJECT_ID,
    firestoreDatabaseId: DEFAULT_DATABASE_ID,
    apiKey: DEFAULT_API_KEY,
    authDomain: DEFAULT_AUTH_DOMAIN,
    storageBucket: DEFAULT_STORAGE_BUCKET,
    messagingSenderId: DEFAULT_MESSAGING_SENDER_ID,
    appId: DEFAULT_APP_ID
  };
}

export function saveFirebaseConfig(cfg: FirebaseCustomConfig) {
  localStorage.setItem(`${STORAGE_KEY_FIREBASE}config`, JSON.stringify(cfg));
}

let currentConfig = getSavedFirebaseConfig();

// Initialize or reuse Firebase App with full config
function initApp(): FirebaseApp {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0];
  }
  return initializeApp({
    apiKey: currentConfig.apiKey,
    authDomain: currentConfig.authDomain,
    projectId: currentConfig.projectId,
    storageBucket: currentConfig.storageBucket,
    messagingSenderId: currentConfig.messagingSenderId || DEFAULT_MESSAGING_SENDER_ID,
    appId: currentConfig.appId || DEFAULT_APP_ID
  });
}

export const app = initApp();

function initFirestore(firebaseApp: FirebaseApp, databaseId: string): Firestore {
  const cleanId = (databaseId || '').trim();
  if (!cleanId || cleanId === '(default)' || cleanId === 'default') {
    return getFirestore(firebaseApp);
  }
  return getFirestore(firebaseApp, cleanId);
}

// In Firebase Web JS SDK, pass custom database ID as the 2nd argument
export const db = initFirestore(app, currentConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google Sign-In with popup
export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Email & Password login
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

// Email & Password registration
export async function signUpWithEmail(email: string, pass: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

// Anonymous login (satisfies isSignedIn() rules)
export async function loginAnonymously(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

// Sign out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Diagnostic runner to check live database access
export async function testFirestoreAccess(): Promise<{
  success: boolean;
  docCount: number;
  sampleIds: string[];
  errorCode?: string;
  errorMessage?: string;
  userEmail?: string | null;
  authUid?: string | null;
}> {
  const currentUser = auth.currentUser;
  try {
    const snap = await getDocs(collection(db, 'users'));
    const ids: string[] = [];
    snap.forEach(d => ids.push(d.id));
    return {
      success: true,
      docCount: snap.size,
      sampleIds: ids.slice(0, 5),
      userEmail: currentUser?.email,
      authUid: currentUser?.uid
    };
  } catch (err: any) {
    return {
      success: false,
      docCount: 0,
      sampleIds: [],
      errorCode: err?.code || 'unknown',
      errorMessage: err?.message || String(err),
      userEmail: currentUser?.email,
      authUid: currentUser?.uid
    };
  }
}
