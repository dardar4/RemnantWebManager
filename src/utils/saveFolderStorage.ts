// Utilities for persistent save folder access via the File System Access API and IndexedDB

const DB_NAME = 'RemnantWebManagerDB';
const STORE_NAME = 'saveFolderStore';
const KEY = 'directoryHandle';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve the saved FileSystemDirectoryHandle from IndexedDB
 */
export async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to retrieve stored directory handle from IndexedDB:', err);
    return null;
  }
}

/**
 * Store a FileSystemDirectoryHandle in IndexedDB for persistent access
 */
export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(handle, KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save directory handle to IndexedDB:', err);
  }
}

/**
 * Clear the stored directory handle from IndexedDB
 */
export async function clearStoredDirectoryHandle(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to clear stored directory handle:', err);
  }
}

/**
 * Query or request read permission for a stored directory handle.
 * Note: requesting permission should be called in response to a user interaction (like a button click).
 */
export async function verifyHandlePermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    // Check if permission is already active
    // @ts-expect-error - File System Access API
    if (typeof handle.queryPermission === 'function') {
      // @ts-expect-error - File System Access API
      const status = await handle.queryPermission({ mode: 'read' });
      if (status === 'granted') {
        return true;
      }
    }

    // Request permission (triggers browser prompt if needed)
    // @ts-expect-error - File System Access API
    if (typeof handle.requestPermission === 'function') {
      // @ts-expect-error - File System Access API
      const status = await handle.requestPermission({ mode: 'read' });
      return status === 'granted';
    }

    return true;
  } catch (err) {
    console.warn('Permission verification failed:', err);
    return false;
  }
}

/**
 * Read all .sav files (profile.sav and save_*.sav) from a directory handle
 */
export async function readSavFilesFromHandle(handle: FileSystemDirectoryHandle): Promise<File[]> {
  const files: File[] = [];
  for await (const entry of (handle as any).values()) {
    if (entry.kind === 'file') {
      const name = entry.name.toLowerCase();
      if (name === 'profile.sav' || (name.startsWith('save_') && name.endsWith('.sav'))) {
        const file = await entry.getFile();
        files.push(file);
      }
    }
  }
  return files;
}

/**
 * Check if the browser supports the File System Access directory picker
 */
export function isDirectoryPickerSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Attempt to load save files from the local server endpoint (/api/local-saves)
 * This automatically accesses %LOCALAPPDATA%\Remnant\Saved\SaveGames without browser sandbox restrictions
 */
export async function fetchLocalSaves(): Promise<{ path: string; files: File[] } | null> {
  try {
    const res = await fetch('/api/local-saves');
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.files) || data.files.length === 0) {
      return null;
    }

    const files: File[] = data.files.map((f: { name: string; base64: string }) => {
      const binaryString = window.atob(f.base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new File([bytes.buffer], f.name, { type: 'application/octet-stream' });
    });

    return { path: data.path || 'SaveGames', files };
  } catch {
    return null;
  }
}
