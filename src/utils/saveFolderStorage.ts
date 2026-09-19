// Utilities for save file handling and local server endpoints

export const DEFAULT_SAVE_PATH = '%LOCALAPPDATA%\\Remnant\\Saved\\SaveGames';

/**
 * Check if running locally (where the Vite / Node dev server /api/local-saves middleware exists)
 * On static deployments (like GitHub Pages), there is no backend server.
 */
export function isLocalServerAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/**
 * Copy a path string to the user's clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback for older browsers or restricted contexts
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
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
