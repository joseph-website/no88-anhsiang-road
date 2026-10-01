/**
 * Type definitions for Room 404: Rule-based Weird Tale ARG
 */

export type ChapterId = 'prologue' | 'exploration' | 'ending';

export type EndingId = 
  | 'ending0'
  | 'ending1' 
  | 'ending2' 
  | 'ending3' 
  | 'ending4' 
  | 'ending5' 
  | 'ending6' 
  | 'ending7' 
  | 'ending8';

export type TraitId = 
  | 'rationalist' 
  | 'empath' 
  | 'pragmatist' 
  | 'cautious' 
  | 'deconstructor'
  | 'intuitive';

export interface RuleItem {
  id: string;
  title: string;
  subtitle: string;
  source: string;
  obtainedAt: string;
  content: string[];
  isFake?: boolean;
  notes?: string;
  week1Title?: string;
  week1Subtitle?: string;
  week1Source?: string;
  week1Content?: string[];
}

export interface ItemInvestigationStep {
  id: string;
  label?: string;
  actionLabel?: string;
  actionText?: string;
  resultText?: string;
  revealedTitle?: string;
  updatedName?: string;
  revealedDesc?: string;
  updatedDesc?: string;
  revealedDetail?: string;
  updatedDetail?: string;
  soundEffect?: 'water' | 'switch' | 'knock' | 'paper' | 'glitch' | 'phone' | 'chime' | 'tension';
  isAudioPlayback?: boolean;
  audioTranscript?: string[];
  playbackAudioLines?: { speaker: string; text: string; delayMs?: number }[];
  sanDelta?: number;
  truthPointsDelta?: number;
  clueInsight?: string;
}

export interface DossierLockRequirement {
  requiredItemId?: string;
  requiredItemName?: string;
  requiredConditionDesc?: string;
  unlockHint?: string;
  lockTitle?: string;
  lockDescription?: string;
  unlockSuccessText?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  iconName: string;
  description: string;
  detail: string;
  desc?: string;
  inspectDesc?: string;
  actionText?: string;
  isKeyClue?: boolean;
  lockRequirement?: DossierLockRequirement;
  investigationSteps?: ItemInvestigationStep[];
  hallucinationWhisper?: string;
  isConsumable?: boolean;
  recoverySanAmount?: number;
  recoveryGrade?: 'slight' | 'moderate' | 'significant';
  week1Description?: string;
  week1Detail?: string;
}

export interface DialogueChoice {
  text: string;
  action?: () => void;
  nextDialogueId?: string;
  sanChange?: number;
  obtainItemId?: string;
  obtainRuleId?: string;
  endingTrigger?: EndingId;
  requireCondition?: (state: GameState) => boolean;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerRole?: string;
  avatarIcon?: string;
  text: string[];
  choices?: DialogueChoice[];
  nextDialogueId?: string;
  sanChange?: number;
  obtainItemId?: string;
  obtainRuleId?: string;
}

export interface EndingInfo {
  id: EndingId;
  title: string;
  type: 'normal' | 'bad' | 'true';
  description: string;
  story: string[];
  detectiveComment: string;
  unlockedAtSan: string;
  requirement: string;
}

export type JournalCategory = 'dialogue' | 'action' | 'system';

export interface JournalEntry {
  id: string;
  category: JournalCategory;
  timestamp: string;
  title: string;
  content: string;
  location?: string;
  speaker?: string;
  sanDelta?: number;
  highlightBadge?: string;
}

export type NoteColorTheme = 'amber' | 'crimson' | 'emerald' | 'cyan' | 'purple' | 'rose' | 'neutral';

export interface FreeNote {
  id: string;
  text: string;
  timestamp: string;
  location?: string;
  category?: 'clue' | 'rule' | 'suspect' | 'general';
  tags?: string[];
  colorTag?: NoteColorTheme;
  customTagLabel?: string;
}

export interface GameState {
  playerName: string;
  boardName?: string;
  articleTitle?: string;
  trait: TraitId;
  san: number; // 0 - 100
  currentChapter: ChapterId;
  currentLocationName: string;
  chapterStep: number;
  obtainedRules: string[];
  inventory: string[];
  unlockedEndings: EndingId[];
  isLetterAssembled: boolean;
  isCctvRebooted: boolean;
  visitedFloors: number[];
  deductionCorrectCount: number;
  currentEnding?: EndingId;
  soundEnabled: boolean;
  volume: number;
  inspectedHotspots: string[];
  freeNotes?: FreeNote[];
  foundContradictions?: string[];
  completedWeek1?: boolean;
  recoveryWindow?: number;
  failedDeductionCount?: number;
  detectiveIntuitionActive?: boolean;
}

export interface SavedGameData {
  version: number;
  saveTimestamp: string;
  slotId?: string;
  slotLabel?: string;
  playerName: string;
  boardName?: string;
  articleTitle?: string;
  selectedTrait: TraitId;
  isTraitRevealed: boolean;
  san: number;
  currentChapter: ChapterId;
  currentLocationName: string;
  obtainedRules: string[];
  inventory: string[];
  isCctvRebooted: boolean;
  currentEnding: EndingId | null;
  investigationDay: number;
  gameDate: { year: number; month: number; day: number };
  restCount: number;
  foundContradictions: string[];
  freeNotes: FreeNote[];
  journalLogs: JournalEntry[];
  unlockedEndings?: EndingId[];
  completedWeek1?: boolean;
  recoveryWindow?: number;
  failedDeductionCount?: number;
  detectiveIntuitionActive?: boolean;
}

export type SaveSlotId = 
  | 'slot1' 
  | 'ending_ending0'
  | 'ending_ending1' 
  | 'ending_ending2' 
  | 'ending_ending3' 
  | 'ending_ending4' 
  | 'ending_ending5' 
  | 'ending_ending6' 
  | 'ending_ending7' 
  | 'ending_ending8' 
  | 'auto' 
  | string;

export interface SaveSlotInfo {
  id: SaveSlotId;
  title: string;
  isAutoSave: boolean;
  endingId?: EndingId;
  data: SavedGameData | null;
}

export type UIStyleMode = 'retro2000' | 'modern';

