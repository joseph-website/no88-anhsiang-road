import LZString from 'lz-string';
import { SavedGameData, SaveSlotId, SaveSlotInfo, EndingId } from '../types';
import { ENDINGS_DATA } from '../data/rulesData';
import { safeStorageGet, safeStorageSet, safeStorageRemove } from './storageHelper';

export const SAVE_STORAGE_PREFIX = 'anhsiang_88_slot_';
export const LEGACY_SAVE_KEY = 'anhsiang_88_save';
export const OLD_SAVE_STORAGE_PREFIX = 'anxiang_88_slot_';
export const OLD_LEGACY_SAVE_KEY = 'anxiang_88_save';

// 1 Single Manual Save Slot
export const MANUAL_SAVE_SLOT_DEF = {
  id: 'slot1' as SaveSlotId,
  title: '【調查手動封存】即時案件手動存檔',
  isAutoSave: false
};

// 9 Dedicated Ending Auto-Save Slots (One per Ending, including ED0)
export const ENDING_AUTO_SAVE_SLOT_DEFS: { id: SaveSlotId; endingId: EndingId; title: string; isAutoSave: boolean }[] = [
  { id: 'ending_ending0', endingId: 'ending0', title: '【結局專屬存檔】ED0 結案報告：《第404號證物》', isAutoSave: true },
  { id: 'ending_ending1', endingId: 'ending1', title: '【結局專屬存檔】普通結局一：《規則的影子》', isAutoSave: true },
  { id: 'ending_ending2', endingId: 'ending2', title: '【結局專屬存檔】普通結局二：《明哲保身》', isAutoSave: true },
  { id: 'ending_ending3', endingId: 'ending3', title: '【結局專屬存檔】普通結局三：《倉皇撤退》', isAutoSave: true },
  { id: 'ending_ending4', endingId: 'ending4', title: '【結局專屬存檔】壞結局一：《成為新規則》', isAutoSave: true },
  { id: 'ending_ending5', endingId: 'ending5', title: '【結局專屬存檔】真結局一：《真相大白》', isAutoSave: true },
  { id: 'ending_ending6', endingId: 'ending6', title: '【結局專屬存檔】壞結局二：《無邪之惡》', isAutoSave: true },
  { id: 'ending_ending7', endingId: 'ending7', title: '【結局專屬存檔】普通結局四：《執念的輪迴》', isAutoSave: true },
  { id: 'ending_ending8', endingId: 'ending8', title: '【結局專屬存檔】真結局二：《破曉》', isAutoSave: true }
];

export function getSlotStorageKey(slotId: SaveSlotId): string {
  if (slotId === 'auto') return LEGACY_SAVE_KEY;
  return `${SAVE_STORAGE_PREFIX}${slotId}`;
}

export function loadSaveSlot(slotId: SaveSlotId): SavedGameData | null {
  try {
    const key = getSlotStorageKey(slotId);
    let raw = safeStorageGet(key);
    if (!raw) {
      // Check old key prefix for seamless migration
      raw = safeStorageGet(`${OLD_SAVE_STORAGE_PREFIX}${slotId}`);
    }
    if (!raw) {
      // Check legacy key if slot1 is empty
      if (slotId === 'slot1') {
        const legacyRaw = safeStorageGet(LEGACY_SAVE_KEY) || safeStorageGet(OLD_LEGACY_SAVE_KEY);
        if (legacyRaw) {
          try {
            return JSON.parse(legacyRaw) as SavedGameData;
          } catch {
            return null;
          }
        }
      }
      return null;
    }
    return JSON.parse(raw) as SavedGameData;
  } catch (e) {
    console.error(`Failed to load save slot ${slotId} (corrupted or restricted):`, e);
    return null;
  }
}

export function saveToSlot(slotId: SaveSlotId, data: SavedGameData, customLabel?: string): boolean {
  try {
    const key = getSlotStorageKey(slotId);
    const timestamp = new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const enrichedData: SavedGameData = {
      ...data,
      slotId,
      saveTimestamp: timestamp,
      slotLabel: customLabel || (slotId === 'slot1' ? '【手動調查存檔】即時案件封存' : `案件槽位 ${slotId}`)
    };

    safeStorageSet(key, JSON.stringify(enrichedData));
    return true;
  } catch (e) {
    console.error(`Failed to write save slot ${slotId}:`, e);
    return false;
  }
}

/**
 * Automatically triggers save when an ending is reached.
 * Dedicated save slot for each specific ending!
 */
export function autoSaveEndingClearance(endingId: EndingId, data: SavedGameData): boolean {
  try {
    const slotId: SaveSlotId = `ending_${endingId}`;
    const endingInfo = ENDINGS_DATA[endingId];
    const endingTitle = endingInfo ? endingInfo.title : `結局 ${endingId}`;
    
    const timestamp = new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const enrichedData: SavedGameData = {
      ...data,
      slotId,
      currentEnding: endingId,
      currentChapter: 'ending',
      currentLocationName: '案件終局紀錄',
      saveTimestamp: timestamp,
      slotLabel: `【破關專屬存檔】${endingTitle}`
    };

    const key = getSlotStorageKey(slotId);
    safeStorageSet(key, JSON.stringify(enrichedData));
    return true;
  } catch (e) {
    console.error(`Failed to auto-save ending clearance for ${endingId}:`, e);
    return false;
  }
}

export function deleteSaveSlot(slotId: SaveSlotId): boolean {
  try {
    const key = getSlotStorageKey(slotId);
    safeStorageRemove(key);
    if (slotId === 'slot1') {
      safeStorageRemove(LEGACY_SAVE_KEY);
      safeStorageRemove('anxiang_88_save');
    }
    return true;
  } catch (e) {
    console.error(`Failed to delete save slot ${slotId}:`, e);
    return false;
  }
}

/**
 * Completely wipe active gameplay and manual save slot
 */
export function wipeActiveInvestigationSave(): void {
  try {
    deleteSaveSlot('slot1');
    safeStorageRemove(LEGACY_SAVE_KEY);
    safeStorageRemove('anxiang_88_save');
    safeStorageRemove('completed_week1');
    safeStorageRemove('ROOM404_JUST_TRANSITIONED');
    safeStorageRemove('ROOM404_FREE_NOTES');
    safeStorageRemove('ROOM404_FOUND_CONTRADICTIONS');
    safeStorageRemove('ROOM404_TRUTH_FRAGMENTS');
    safeStorageRemove('ROOM404_TAPE_LISTENED_V1');
    safeStorageRemove('anxiang_investigation_progress_v1');
    safeStorageRemove('anxiang_dossier_unlocked_v1');
  } catch (e) {
    console.error('Failed to wipe active investigation save:', e);
  }
}

/**
 * Completely wipe ALL game progress, including all manual and ending save slots,
 * achievements, unlockables, notes, and cycle/week flags, restoring the game
 * to an entirely fresh state that begins from Round 1.
 */
export function wipeEntireGameProgress(): void {
  try {
    // 1. Delete manual save slot1
    deleteSaveSlot('slot1');

    // 2. Delete all dedicated ending clearance slots
    for (const def of ENDING_AUTO_SAVE_SLOT_DEFS) {
      deleteSaveSlot(def.id);
    }

    // 3. Remove all known storage keys
    safeStorageRemove(LEGACY_SAVE_KEY);
    safeStorageRemove('anxiang_88_save');
    safeStorageRemove('anxiang_unlocked_endings');
    safeStorageRemove('ROOM_404_UNLOCKED_ENDINGS_V2');
    safeStorageRemove('completed_week1');
    safeStorageRemove('ROOM404_JUST_TRANSITIONED');
    safeStorageRemove('ROOM404_FREE_NOTES');
    safeStorageRemove('ROOM404_FOUND_CONTRADICTIONS');
    safeStorageRemove('ROOM404_TRUTH_FRAGMENTS');
    safeStorageRemove('ROOM404_TAPE_LISTENED_V1');
    safeStorageRemove('anxiang_investigation_progress_v1');
    safeStorageRemove('anxiang_dossier_unlocked_v1');

    // 4. Sweep any remaining game data keys with known prefixes if localStorage exists
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith(SAVE_STORAGE_PREFIX) ||
            key.startsWith('anxiang_') ||
            key.startsWith('ROOM404_') ||
            key.startsWith('ROOM_')
          )) {
            if (!key.startsWith('ROOM404_VOL_')) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch {}
  } catch (e) {
    console.error('Failed to wipe entire game progress:', e);
  }
}

export function getManualSaveSlot(): SaveSlotInfo {
  return {
    id: MANUAL_SAVE_SLOT_DEF.id,
    title: MANUAL_SAVE_SLOT_DEF.title,
    isAutoSave: false,
    data: loadSaveSlot(MANUAL_SAVE_SLOT_DEF.id)
  };
}

export function getAllEndingSaveSlots(): SaveSlotInfo[] {
  return ENDING_AUTO_SAVE_SLOT_DEFS.map(def => ({
    id: def.id,
    title: def.title,
    isAutoSave: true,
    endingId: def.endingId,
    data: loadSaveSlot(def.id)
  }));
}

export function getAllSaveSlots(): SaveSlotInfo[] {
  return [
    getManualSaveSlot(),
    ...getAllEndingSaveSlots()
  ];
}

/**
 * Find the most recent manual save across slot1 (active investigation)
 * Only falls back to ending slots if explicitly requested
 */
export function getLatestManualSave(includeEndingSlots: boolean = false): { slotId: SaveSlotId; data: SavedGameData } | null {
  const manual = getManualSaveSlot();
  if (manual.data) {
    return { slotId: 'slot1', data: manual.data };
  }

  if (!includeEndingSlots) {
    return null;
  }

  // If includeEndingSlots is true, find the most recent ending clearance save
  const endingSlots = getAllEndingSaveSlots();
  let latestEndingSlot: { slotId: SaveSlotId; data: SavedGameData } | null = null;
  let latestTime = 0;

  for (const slot of endingSlots) {
    if (slot.data && slot.data.saveTimestamp) {
      const parsedTime = Date.parse(slot.data.saveTimestamp) || 0;
      if (parsedTime > latestTime || !latestEndingSlot) {
        latestTime = parsedTime;
        latestEndingSlot = { slotId: slot.id, data: slot.data };
      }
    }
  }

  return latestEndingSlot;
}

// -------------------------------------------------------------
// Cross-Platform Save Export & Import via Key Code / QR Code
// -------------------------------------------------------------

export const KEY_PREFIX = 'AX88-';

/**
 * Compresses a SavedGameData object into a URL-safe compact password/code
 */
export function exportSaveToKey(data: SavedGameData): string {
  try {
    const jsonStr = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    return `${KEY_PREFIX}${compressed}`;
  } catch (e) {
    console.error('Failed to export save to key:', e);
    return '';
  }
}

/**
 * Decompresses and validates a save password/key or import URL
 */
export function importSaveFromKey(inputStr: string): SavedGameData | null {
  try {
    if (!inputStr || typeof inputStr !== 'string') return null;
    let clean = inputStr.trim();

    // If input is a full URL, extract the query param
    if (clean.includes('?')) {
      try {
        const url = new URL(clean.startsWith('http') ? clean : `https://example.com/${clean}`);
        const param = url.searchParams.get('save_import') || url.searchParams.get('key') || url.searchParams.get('save');
        if (param) {
          clean = param;
        }
      } catch {}
    }

    if (clean.startsWith(KEY_PREFIX)) {
      clean = clean.slice(KEY_PREFIX.length);
    }

    // Attempt LZ-String decompression
    let decompressed = LZString.decompressFromEncodedURIComponent(clean);
    if (!decompressed) {
      decompressed = LZString.decompressFromBase64(clean);
    }
    if (!decompressed) {
      // Fallback: Check if it was raw JSON
      decompressed = clean;
    }

    if (!decompressed) return null;

    const parsed = JSON.parse(decompressed) as SavedGameData;
    if (parsed && typeof parsed === 'object' && typeof parsed.playerName === 'string') {
      // Basic sanity checks
      if (typeof parsed.san !== 'number') parsed.san = 100;
      if (!Array.isArray(parsed.inventory)) parsed.inventory = [];
      if (!Array.isArray(parsed.obtainedRules)) parsed.obtainedRules = [];
      if (!Array.isArray(parsed.foundContradictions)) parsed.foundContradictions = [];
      if (!Array.isArray(parsed.freeNotes)) parsed.freeNotes = [];
      if (!Array.isArray(parsed.journalLogs)) parsed.journalLogs = [];
      return parsed;
    }
    return null;
  } catch (e) {
    console.error('Failed to import save from key:', e);
    return null;
  }
}

/**
 * Builds a direct shareable import link for QR Code or cross-platform transfer
 */
export function generateShareableURL(key: string): string {
  if (typeof window === 'undefined') return key;
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?save_import=${encodeURIComponent(key)}`;
}
