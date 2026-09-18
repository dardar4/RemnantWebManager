// Utilities for persistent save folder & file access via the File System Access API and IndexedDB

const DB_NAME = 'RemnantWebManagerDB';
const STORE_NAME = 'saveFolderStore';
const KEY_DIR = 'directoryHandle';
const KEY_FILES = 'fileHandles';

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
      const req = store.get(KEY_DIR);
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
      const req = store.put(handle, KEY_DIR);
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
      const req = store.delete(KEY_DIR);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to clear stored directory handle:', err);
  }
}

/**
 * Retrieve the saved FileSystemFileHandle[] from IndexedDB
 */
export async function getStoredFileHandles(): Promise<FileSystemFileHandle[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY_FILES);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to retrieve stored file handles from IndexedDB:', err);
    return null;
  }
}

/**
 * Store FileSystemFileHandle[] in IndexedDB for persistent access across reloads/refreshes
 */
export async function saveFileHandles(handles: FileSystemFileHandle[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(handles, KEY_FILES);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save file handles to IndexedDB:', err);
  }
}

/**
 * Clear the stored file handles from IndexedDB
 */
export async function clearStoredFileHandles(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(KEY_FILES);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to clear stored file handles:', err);
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
 * Query or request read permission for a stored file handle.
 * allowPrompt: if true, requests permission if prompt is needed (must be called during user interaction)
 */
export async function verifyFileHandlePermission(
  handle: FileSystemFileHandle,
  allowPrompt = false
): Promise<boolean> {
  try {
    // @ts-expect-error - File System Access API
    if (typeof handle.queryPermission === 'function') {
      // @ts-expect-error - File System Access API
      const status = await handle.queryPermission({ mode: 'read' });
      if (status === 'granted') {
        return true;
      }
      if (status === 'prompt' && allowPrompt) {
        // @ts-expect-error - File System Access API
        if (typeof handle.requestPermission === 'function') {
          // @ts-expect-error - File System Access API
          const reqStatus = await handle.requestPermission({ mode: 'read' });
          return reqStatus === 'granted';
        }
      }
      return false;
    }
    return true;
  } catch (err) {
    console.warn('File handle permission verification failed:', err);
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
 * Read files from an array of FileSystemFileHandle
 */
export async function readSavFilesFromFileHandles(handles: FileSystemFileHandle[]): Promise<File[]> {
  const files: File[] = [];
  for (const handle of handles) {
    try {
      const name = handle.name.toLowerCase();
      if (name === 'profile.sav' || (name.startsWith('save_') && name.endsWith('.sav'))) {
        const file = await handle.getFile();
        files.push(file);
      }
    } catch (err) {
      console.warn(`Failed to read file from handle "${handle.name}":`, err);
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
 * Check if the browser supports the File System Access open file picker
 */
export function isFilePickerSupported(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window;
}

/**
 * Open file picker to let user select save files with persistent handles.
 * Bypasses Chrome's AppData whole-directory restriction ("contains system files").
 */
export async function pickSaveFilesWithHandle(): Promise<{ files: File[]; handles: FileSystemFileHandle[] } | null> {
  if (!isFilePickerSupported()) return null;
  try {
    // @ts-expect-error - showOpenFilePicker
    const handles: FileSystemFileHandle[] = await window.showOpenFilePicker({
      multiple: true,
      types: [
        {
          description: 'Remnant Save Files (*.sav)',
          accept: {
            'application/octet-stream': ['.sav'],
          },
        },
      ],
      excludeAcceptAllOption: false,
    });

    if (!handles || handles.length === 0) return null;

    const files = await readSavFilesFromFileHandles(handles);
    return { files, handles };
  } catch (err: unknown) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Error picking save files with handle:', err);
    }
    return null;
  }
}

/**
 * Check if running locally (where the Vite / Node dev server /api/local-saves middleware exists)
 * On static deployments (like GitHub Pages), there is no backend server.
 */
export function isLocalServerAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/**
 * Attempt to load save files from the local server endpoint (/api/local-saves)
 * This automatically accesses %LOCALAPPDATA%\Remnant\Saved\SaveGames without browser sandbox restrictions
 * Only executed when running on localhost where the server middleware is present.
 */
export async function fetchLocalSaves(customPath?: string | null): Promise<{ path: string; files: File[] } | null> {
  if (!isLocalServerAvailable()) {
    return null;
  }
  try {
    const url = customPath?.trim()
      ? `/api/local-saves?path=${encodeURIComponent(customPath.trim())}`
      : '/api/local-saves';
    const res = await fetch(url);
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
