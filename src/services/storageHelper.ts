/**
 * Resilient Storage Helper with In-Memory Fallback & Quota Guards
 * Handles Incognito/Private Browsing, QuotaExceededError, and SecurityError gracefully.
 */

// In-Memory fallback store for private/incognito mode or blocked storage
const memoryStore: Record<string, string> = {};

let isLocalStorageTested = false;
let isLocalStorageWorking = false;

/**
 * Safely verify if localStorage is operational in the current browsing context.
 */
export function isLocalStorageAvailable(): boolean {
  if (isLocalStorageTested) {
    return isLocalStorageWorking;
  }

  try {
    const testKey = '__storage_test_key__';
    window.localStorage.setItem(testKey, testKey);
    const retrieved = window.localStorage.getItem(testKey);
    window.localStorage.removeItem(testKey);
    isLocalStorageWorking = retrieved === testKey;
  } catch (e) {
    isLocalStorageWorking = false;
  }

  isLocalStorageTested = true;
  return isLocalStorageWorking;
}

/**
 * Retrieve raw string value from storage with in-memory fallback.
 */
export function safeStorageGet(key: string, fallback: string | null = null): string | null {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      const value = window.localStorage.getItem(key);
      if (value !== null) {
        return value;
      }
    }
  } catch (e) {
    // Access denied or private browsing restriction
  }

  return key in memoryStore ? memoryStore[key] : fallback;
}

/**
 * Write raw string value to storage with in-memory fallback and quota protection.
 */
export function safeStorageSet(key: string, value: string): boolean {
  // Always update memory store as immediate backup
  memoryStore[key] = value;

  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch (e) {
    console.warn(`[StorageHelper] Failed to persist key "${key}" to localStorage (using in-memory fallback):`, e);
  }

  return false;
}

/**
 * Remove key from both persistent storage and in-memory store.
 */
export function safeStorageRemove(key: string): void {
  delete memoryStore[key];

  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    // Ignored in restricted environments
  }
}

/**
 * Clear all game-related storage keys safely.
 */
export function safeStorageClear(): void {
  for (const k in memoryStore) {
    delete memoryStore[k];
  }

  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      window.localStorage.clear();
    }
  } catch (e) {
    // Ignored
  }
}

/**
 * Safely parse JSON from storage. Returns fallback if missing, corrupted, or unparsable.
 */
export function safeStorageGetJSON<T>(key: string, fallback: T): T {
  const raw = safeStorageGet(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[StorageHelper] Corrupted JSON in key "${key}", reverting to fallback:`, e);
    return fallback;
  }
}

/**
 * Safely stringify and write JSON to storage.
 */
export function safeStorageSetJSON<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    return safeStorageSet(key, serialized);
  } catch (e) {
    console.error(`[StorageHelper] JSON serialization failed for key "${key}":`, e);
    return false;
  }
}

/**
 * Returns current storage diagnostic info for UI notices.
 */
export function getStorageDiagnostics(): { isPersistent: boolean; mode: 'localStorage' | 'memoryFallback' } {
  const isPersistent = isLocalStorageAvailable();
  return {
    isPersistent,
    mode: isPersistent ? 'localStorage' : 'memoryFallback'
  };
}
