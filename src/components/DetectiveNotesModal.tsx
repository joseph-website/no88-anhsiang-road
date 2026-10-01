import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  StickyNote,
  PenTool,
  Plus,
  Trash2,
  Tag,
  Search,
  Filter,
  Palette,
  X,
  Sparkles,
  MapPin,
  ArrowUp,
  ArrowDown,
  Pin,
  AlertTriangle
} from 'lucide-react';
import { FreeNote, NoteColorTheme } from '../types';
import { sound } from '../services/soundEngine';
import { CorkboardRelationGraph } from './CorkboardRelationGraph';

export type NoteTagFilter = 'all' | 'ghost_lore' | 'logic_contradiction' | 'env_clues';

export interface TagFilterConfig {
  id: NoteTagFilter;
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  description: string;
}

export const TAG_FILTER_CONFIGS: TagFilterConfig[] = [
  {
    id: 'all',
    label: '全部手記',
    badgeBg: 'bg-neutral-900',
    badgeBorder: 'border-neutral-700',
    badgeText: 'text-neutral-300',
    activeBg: 'bg-[#d4a359]',
    activeBorder: 'border-[#f5ebd7]',
    activeText: 'text-neutral-950 font-bold shadow-md shadow-amber-950/50',
    description: '檢視所有保存的偵探手記與隨筆推論'
  },
  {
    id: 'ghost_lore',
    label: '怪談類',
    badgeBg: 'bg-purple-950/60',
    badgeBorder: 'border-purple-800/60',
    badgeText: 'text-purple-300',
    activeBg: 'bg-purple-600',
    activeBorder: 'border-purple-400',
    activeText: 'text-white font-bold shadow-md shadow-purple-950/50',
    description: '都市怪談、空間摺疊悖論、打字機預兆、紅衣怪影等異象記錄'
  },
  {
    id: 'logic_contradiction',
    label: '邏輯矛盾類',
    badgeBg: 'bg-red-950/60',
    badgeBorder: 'border-red-800/60',
    badgeText: 'text-red-300',
    activeBg: 'bg-red-600',
    activeBorder: 'border-red-400',
    activeText: 'text-white font-bold shadow-md shadow-red-950/50',
    description: '大樓守則條款衝突、偽造規約、邏輯疑點與反差指證'
  },
  {
    id: 'env_clues',
    label: '環境線索類',
    badgeBg: 'bg-amber-950/60',
    badgeBorder: 'border-amber-800/60',
    badgeText: 'text-amber-300',
    activeBg: 'bg-amber-500',
    activeBorder: 'border-amber-300',
    activeText: 'text-neutral-950 font-bold shadow-md shadow-amber-950/50',
    description: '現場物證、房間調查、物理痕跡、道具與空間佈局筆記'
  }
];

export const matchesNoteTag = (note: FreeNote, filter: NoteTagFilter): boolean => {
  if (filter === 'all') return true;

  const textLower = (note.text || '').toLowerCase();
  const customLabel = (note.customTagLabel || '').toLowerCase();
  const tags = (note.tags || []).map(t => t.toLowerCase());
  const category = note.category;
  const colorTag = note.colorTag;

  if (filter === 'ghost_lore') {
    // 1. Explicit tag or label
    if (customLabel.includes('怪談') || customLabel.includes('異象') || customLabel.includes('精神') || customLabel.includes('空間') || customLabel.includes('認知')) return true;
    if (tags.some(t => t.includes('怪談') || t.includes('異象') || t.includes('超自然') || t.includes('精神') || t.includes('認知') || t.includes('sanity') || t.includes('404') || t.includes('四樓') || t.includes('紅衣'))) return true;
    // 2. Color theme or category
    if (colorTag === 'purple' || colorTag === 'cyan') return true;
    // 3. Keyword matches in content
    if (textLower.includes('怪談') || textLower.includes('異象') || textLower.includes('404') || textLower.includes('四樓') || textLower.includes('紅衣') || textLower.includes('幻覺') || textLower.includes('打字機') || textLower.includes('陰影') || textLower.includes('扭曲') || textLower.includes('同化')) return true;
    return false;
  }

  if (filter === 'logic_contradiction') {
    // 1. Explicit tag or label
    if (customLabel.includes('矛盾') || customLabel.includes('衝突') || customLabel.includes('規則') || customLabel.includes('守則') || customLabel.includes('疑點') || customLabel.includes('破綻')) return true;
    if (tags.some(t => t.includes('矛盾') || t.includes('衝突') || t.includes('規則') || t.includes('守則') || t.includes('破綻') || t.includes('rule') || t.includes('已解開疑點') || t.includes('思維連結'))) return true;
    // 2. Color theme or category
    if (colorTag === 'crimson' || category === 'rule') return true;
    // 3. Keyword matches in content
    if (textLower.includes('矛盾') || textLower.includes('衝突') || textLower.includes('守則') || textLower.includes('規約') || textLower.includes('條款') || textLower.includes('偽造') || textLower.includes('謊言') || textLower.includes('相左') || textLower.includes('疑點')) return true;
    return false;
  }

  if (filter === 'env_clues') {
    // 1. Explicit tag or label
    if (customLabel.includes('線索') || customLabel.includes('環境') || customLabel.includes('現場') || customLabel.includes('物證') || customLabel.includes('實證') || customLabel.includes('案情')) return true;
    if (tags.some(t => t.includes('線索') || t.includes('環境') || t.includes('現場') || t.includes('物證') || t.includes('實證') || t.includes('clue') || t.includes('evid') || t.includes('痕跡') || t.includes('道具') || t.includes('鑰匙'))) return true;
    // 2. Color theme or category
    if (colorTag === 'emerald' || colorTag === 'amber' || category === 'clue') return true;
    // 3. Keyword matches in content
    if (textLower.includes('現場') || textLower.includes('房間') || textLower.includes('物證') || textLower.includes('痕跡') || textLower.includes('手電筒') || textLower.includes('道具') || textLower.includes('鑰匙') || textLower.includes('抽屜') || textLower.includes('大廳') || textLower.includes('警衛室') || textLower.includes('電箱')) return true;
    // 4. Default general notes
    if (category === 'general' && (colorTag === 'neutral' || !colorTag)) return true;
    return false;
  }

  return false;
};

export interface NoteColorConfig {
  id: NoteColorTheme;
  name: string;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  chipBg: string;
  chipActiveBg: string;
  cardBg: string;
  cardHoverBorder: string;
  accentBorder: string;
  description: string;
  suggestedCategory?: 'clue' | 'rule' | 'suspect' | 'general';
}

export const NOTE_COLOR_THEMES: Record<NoteColorTheme, NoteColorConfig> = {
  amber: {
    id: 'amber',
    name: '琥珀（關鍵案情）',
    label: 'CLUE',
    dotColor: 'bg-amber-400',
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-600/70',
    badgeText: 'text-amber-300',
    chipBg: 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60',
    chipActiveBg: 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-900/40',
    cardBg: 'bg-amber-950/15',
    cardHoverBorder: 'hover:border-amber-500/60',
    accentBorder: 'border-l-4 border-l-amber-500',
    description: '核心案情推論、命案關鍵證詞、現場重大物證',
    suggestedCategory: 'clue'
  },
  crimson: {
    id: 'crimson',
    name: '赤紅（規則矛盾）',
    label: 'RULE',
    dotColor: 'bg-red-400',
    badgeBg: 'bg-red-950/80',
    badgeBorder: 'border-red-600/70',
    badgeText: 'text-red-300',
    chipBg: 'bg-red-950/40 text-red-300 hover:bg-red-900/60',
    chipActiveBg: 'bg-red-600 text-white font-bold shadow-md shadow-red-900/40',
    cardBg: 'bg-red-950/15',
    cardHoverBorder: 'hover:border-red-500/60',
    accentBorder: 'border-l-4 border-l-red-500',
    description: '違章條款互斥、偽造守則、致命規則衝突、陷阱標語',
    suggestedCategory: 'rule'
  },
  emerald: {
    id: 'emerald',
    name: '翡翠（現場實證）',
    label: 'EVID',
    dotColor: 'bg-emerald-400',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-600/70',
    badgeText: 'text-emerald-300',
    chipBg: 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60',
    chipActiveBg: 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/40',
    cardBg: 'bg-emerald-950/15',
    cardHoverBorder: 'hover:border-emerald-500/60',
    accentBorder: 'border-l-4 border-l-emerald-500',
    description: '物理調查紀錄、鑰匙與工具道具、配電與圖紙回路',
    suggestedCategory: 'clue'
  },
  cyan: {
    id: 'cyan',
    name: '青冷（空間悖論）',
    label: 'SPATIAL',
    dotColor: 'bg-cyan-400',
    badgeBg: 'bg-cyan-950/80',
    badgeBorder: 'border-cyan-600/70',
    badgeText: 'text-cyan-300',
    chipBg: 'bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60',
    chipActiveBg: 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/40',
    cardBg: 'bg-cyan-950/15',
    cardHoverBorder: 'hover:border-cyan-500/60',
    accentBorder: 'border-l-4 border-l-cyan-500',
    description: '三四五樓空間迴路、階梯異變、建築幾何異常現象',
    suggestedCategory: 'clue'
  },
  purple: {
    id: 'purple',
    name: '暗紫（精神認知）',
    label: 'COGNITION',
    dotColor: 'bg-purple-400',
    badgeBg: 'bg-purple-950/80',
    badgeBorder: 'border-purple-600/70',
    badgeText: 'text-purple-300',
    chipBg: 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/60',
    chipActiveBg: 'bg-purple-600 text-white font-bold shadow-md shadow-purple-900/40',
    cardBg: 'bg-purple-950/15',
    cardHoverBorder: 'hover:border-purple-500/60',
    accentBorder: 'border-l-4 border-l-purple-500',
    description: '打字機幻音、紅衣人視線、心智狀態波動、同化暗示',
    suggestedCategory: 'rule'
  },
  rose: {
    id: 'rose',
    name: '品紅（人物證詞）',
    label: 'TESTIMONY',
    dotColor: 'bg-pink-400',
    badgeBg: 'bg-pink-950/80',
    badgeBorder: 'border-pink-600/70',
    badgeText: 'text-pink-300',
    chipBg: 'bg-pink-950/40 text-pink-300 hover:bg-pink-900/60',
    chipActiveBg: 'bg-pink-600 text-white font-bold shadow-md shadow-pink-900/40',
    cardBg: 'bg-pink-950/15',
    cardHoverBorder: 'hover:border-pink-500/60',
    accentBorder: 'border-l-4 border-l-pink-500',
    description: '警衛口供、受害人字條、委託人陳述、嫌疑人動向',
    suggestedCategory: 'suspect'
  },
  neutral: {
    id: 'neutral',
    name: '蒼灰（調查隨筆）',
    label: 'NOTE',
    dotColor: 'bg-neutral-400',
    badgeBg: 'bg-neutral-900',
    badgeBorder: 'border-neutral-700',
    badgeText: 'text-neutral-300',
    chipBg: 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800',
    chipActiveBg: 'bg-neutral-300 text-neutral-950 font-bold shadow-md',
    cardBg: 'bg-neutral-950/20',
    cardHoverBorder: 'hover:border-neutral-600',
    accentBorder: 'border-l-4 border-l-neutral-600',
    description: '一般備忘、推論雜記、待辦清單、探索草稿',
    suggestedCategory: 'general'
  }
};

export const getNoteColorTheme = (note: FreeNote): NoteColorConfig => {
  if (note.colorTag && NOTE_COLOR_THEMES[note.colorTag]) {
    return NOTE_COLOR_THEMES[note.colorTag];
  }
  const cat = note.category || 'clue';
  if (cat === 'rule') return NOTE_COLOR_THEMES.crimson;
  if (cat === 'suspect') return NOTE_COLOR_THEMES.rose;
  if (cat === 'general') return NOTE_COLOR_THEMES.neutral;
  return NOTE_COLOR_THEMES.amber;
};

interface DetectiveNotesModalProps {
  inventory?: string[];
  obtainedRules?: string[];
  freeNotes: FreeNote[];
  currentLocationName?: string;
  investigationDateText?: string;
  investigationDay?: number;
  completedWeek1?: boolean;
  onAddFreeNote: (
    text: string, 
    category?: 'clue' | 'rule' | 'suspect' | 'general', 
    tags?: string[],
    colorTag?: NoteColorTheme,
    customTagLabel?: string
  ) => void;
  onUpdateFreeNoteColor: (id: string, colorTag: NoteColorTheme, customTagLabel?: string) => void;
  onDeleteFreeNote: (id: string) => void;
  onReorderFreeNotes?: (newNotes: FreeNote[]) => void;
  onClose: () => void;
}

export const DetectiveNotesModal: React.FC<DetectiveNotesModalProps> = ({
  inventory = [],
  obtainedRules = [],
  freeNotes = [],
  currentLocationName = '安祥路88號大樓',
  investigationDateText = '2012年 (第1天)',
  investigationDay = 1,
  completedWeek1 = false,
  onAddFreeNote,
  onUpdateFreeNoteColor,
  onDeleteFreeNote,
  onReorderFreeNotes,
  onClose
}) => {
  // Main view tab: Corkboard vs. Free Notes
  const [activeTab, setActiveTab] = useState<'corkboard' | 'notes'>('corkboard');

  // Input state
  const [noteInput, setNoteInput] = useState<string>('');
  const [noteCategory, setNoteCategory] = useState<'clue' | 'rule' | 'suspect' | 'general'>('clue');
  const [customTagLabel, setCustomTagLabel] = useState<string>('案情線索');
  const [noteColorTag, setNoteColorTag] = useState<NoteColorTheme>('amber');

  // Filter state
  const [selectedTagFilter, setSelectedTagFilter] = useState<NoteTagFilter>('all');
  const [notesFilterCategory, setNotesFilterCategory] = useState<'all' | 'clue' | 'rule' | 'suspect' | 'general'>('all');
  const [notesFilterColor, setNotesFilterColor] = useState<'all' | NoteColorTheme>('all');
  const [notesSearchQuery, setNotesSearchQuery] = useState<string>('');
  const [activeEditingColorNoteId, setActiveEditingColorNoteId] = useState<string | null>(null);

  // Drag and drop reordering state
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [dragOverNoteId, setDragOverNoteId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null);
  const dragItemRef = useRef<string | null>(null);

  const handleSubmitNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!noteInput.trim()) return;

    sound.playPaper();
    onAddFreeNote(
      noteInput.trim(),
      noteCategory,
      [customTagLabel.trim() || '偵探手記'],
      noteColorTag,
      customTagLabel.trim() || undefined
    );
    setNoteInput('');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragItemRef.current = id;
    setDraggedNoteId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    dragItemRef.current = null;
    setDraggedNoteId(null);
    setDragOverNoteId(null);
    setDropPosition(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (!dragItemRef.current || dragItemRef.current === targetId) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const isAbove = offsetY < rect.height / 2;

    setDragOverNoteId(targetId);
    setDropPosition(isAbove ? 'above' : 'below');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const related = e.relatedTarget as HTMLElement | null;
    if (!e.currentTarget.contains(related)) {
      setDragOverNoteId(null);
      setDropPosition(null);
    }
  };

  const applyReorder = (sourceId: string, targetId: string, position: 'above' | 'below') => {
    if (sourceId === targetId) return;

    const sourceIndex = freeNotes.findIndex(n => n.id === sourceId);
    const targetIndex = freeNotes.findIndex(n => n.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const updated = [...freeNotes];
    const [movedItem] = updated.splice(sourceIndex, 1);

    let insertIndex = updated.findIndex(n => n.id === targetId);
    if (position === 'below') {
      insertIndex += 1;
    }

    updated.splice(insertIndex, 0, movedItem);

    try {
      localStorage.setItem('ROOM404_FREE_NOTES', JSON.stringify(updated));
    } catch {}

    onReorderFreeNotes?.(updated);
    sound.playPaper();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const sourceId = dragItemRef.current || e.dataTransfer.getData('text/plain');
    const pos = dropPosition || 'above';

    if (sourceId && sourceId !== targetId) {
      applyReorder(sourceId, targetId, pos);
    }

    setDraggedNoteId(null);
    setDragOverNoteId(null);
    setDropPosition(null);
    dragItemRef.current = null;
  };

  // Move a note up or down using buttons
  const handleMoveNoteStep = (id: string, direction: 'up' | 'down' | 'top') => {
    const idx = freeNotes.findIndex(n => n.id === id);
    if (idx === -1) return;

    const updated = [...freeNotes];
    const [item] = updated.splice(idx, 1);

    if (direction === 'top') {
      updated.unshift(item);
    } else if (direction === 'up') {
      const newIdx = Math.max(0, idx - 1);
      updated.splice(newIdx, 0, item);
    } else if (direction === 'down') {
      const newIdx = Math.min(updated.length, idx + 1);
      updated.splice(newIdx, 0, item);
    }

    try {
      localStorage.setItem('ROOM404_FREE_NOTES', JSON.stringify(updated));
    } catch {}

    onReorderFreeNotes?.(updated);
    sound.playClick();
  };

  const filteredNotes = freeNotes.filter(n => {
    // 1. Tag category filter: 怪談類 / 邏輯矛盾類 / 環境線索類
    if (!matchesNoteTag(n, selectedTagFilter)) return false;

    // 2. Category filter
    const matchCat = notesFilterCategory === 'all' || (n.category || 'clue') === notesFilterCategory;
    if (!matchCat) return false;

    // 3. Color theme filter
    const colorCfg = getNoteColorTheme(n);
    const matchColor = notesFilterColor === 'all' || colorCfg.id === notesFilterColor;
    if (!matchColor) return false;

    // 4. Keyword search query
    if (!notesSearchQuery.trim()) return true;
    const q = notesSearchQuery.toLowerCase();
    const tagMatch = n.tags && n.tags.some(t => t.toLowerCase().includes(q));
    const customLabelMatch = n.customTagLabel && n.customTagLabel.toLowerCase().includes(q);
    const colorNameMatch = colorCfg.name.toLowerCase().includes(q) || colorCfg.label.toLowerCase().includes(q);
    const locationMatch = n.location && n.location.toLowerCase().includes(q);
    return n.text.toLowerCase().includes(q) || tagMatch || customLabelMatch || colorNameMatch || locationMatch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-1.5 sm:p-3 md:p-5 lg:p-6 select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="retro-forum-modal-window w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl h-[95dvh] sm:h-[90vh] lg:h-[88vh] max-h-[95dvh] lg:max-h-[880px] xl:max-h-[940px] flex flex-col shadow-2xl overflow-hidden text-[#1a2e18]"
      >
        {/* Modal Top Bar */}
        <div className="retro-forum-modal-header px-3 sm:px-5 py-2.5 sm:py-3 border-b-2 border-[#1c3819] flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 rounded-xs bg-[#ffffff]/20 border border-[#ffffff]/40 text-white shrink-0">
              <StickyNote className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-wide truncate">
                  偵探隨身備忘筆記與軟木塞線索板
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#173a14] text-[#a3e635] border border-[#a3e635]/60 font-bold shrink-0">
                  {freeNotes.length} 則便箋
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#cfebd0] flex items-center gap-2 mt-0.5 truncate hidden xs:flex">
                <span>{investigationDateText} (第 {investigationDay} 天)</span>
                <span>•</span>
                <span className="text-[#fef08a] font-bold">{currentLocationName}</span>
              </div>
            </div>
          </div>

          {/* Tab Switcher and Close in Header */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex items-center p-0.5 bg-[#132c11] border border-[#3b6635]">
              <button
                onClick={() => {
                  sound.playPaper();
                  setActiveTab('corkboard');
                }}
                className={`px-2.5 sm:px-3 py-1 text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                  activeTab === 'corkboard'
                    ? 'bg-[#ffffff] text-[#1c3819] shadow-sm font-bold'
                    : 'text-[#cfebd0] hover:text-white'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">軟木塞線索牆</span>
                <span className="sm:hidden">線索牆</span>
              </button>

              <button
                onClick={() => {
                  sound.playPaper();
                  setActiveTab('notes');
                }}
                className={`px-2.5 sm:px-3 py-1 text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-[#ffffff] text-[#1c3819] shadow-sm font-bold'
                    : 'text-[#cfebd0] hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>便箋隨筆</span>
                {freeNotes.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 font-mono font-bold ${
                    activeTab === 'notes' ? 'bg-[#1c3819] text-[#a3e635]' : 'bg-[#274f23] text-[#d1e7cf]'
                  }`}>
                    {freeNotes.length}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="text-[11px] font-mono font-bold text-[#fef08a] hover:text-white px-2 py-0.5 bg-[#1a3818] border border-[#a3e635]/60 hover:bg-[#2b5828] cursor-pointer"
              title="關閉"
            >
              [關閉 X]
            </button>
          </div>
        </div>

        {/* Tab 1: Corkboard Relation Graph */}
        {activeTab === 'corkboard' && (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#e6ede4]">
            <CorkboardRelationGraph
              inventory={inventory}
              obtainedRules={obtainedRules}
              freeNotes={freeNotes}
              completedWeek1={completedWeek1}
            />
          </div>
        )}

        {/* Tab 2: Free Notes Manager */}
        {activeTab === 'notes' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4 min-h-0 bg-[#f4f8f3]">
            {/* Quick Note Input Form */}
            <div className="bg-white border border-[#7ca078] p-3 sm:p-4 space-y-2.5 sm:space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1c3819] flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#2b5828]" />
                  <span>記錄新線索手記 / 隨筆推論</span>
                </span>
              </div>

              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="在此輸入調查推論、發現的矛盾、對話疑點或探索備忘..."
                rows={2}
                className="w-full bg-[#f9fcf8] border border-[#96b893] p-2.5 text-xs md:text-sm text-[#1a2e18] placeholder:text-[#88a085] focus:outline-none focus:border-[#1c3819] resize-none leading-relaxed"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    handleSubmitNote();
                  }
                }}
              />

              {/* Tag Quick Presets and Color Pills */}
              <div className="space-y-2 pt-1">
                {/* 3 Core Detective Categories */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[#3e593b] mr-1 flex items-center gap-1 font-bold">
                    <Tag className="w-3 h-3 text-[#2b5828]" />
                    <span>核心分類：</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setNoteColorTag('purple');
                      setNoteCategory('general');
                      setCustomTagLabel('怪談類');
                    }}
                    className={`text-[11px] px-2.5 py-0.5 border transition-all flex items-center gap-1.5 cursor-pointer ${
                      customTagLabel === '怪談類'
                        ? 'bg-[#581c87] text-white font-bold border-[#3b0764] shadow-sm'
                        : 'bg-[#faf5ff] border-[#d8b4fe] text-[#6b21a8] hover:bg-[#f3e8ff]'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>怪談類</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setNoteColorTag('crimson');
                      setNoteCategory('rule');
                      setCustomTagLabel('邏輯矛盾類');
                    }}
                    className={`text-[11px] px-2.5 py-0.5 border transition-all flex items-center gap-1.5 cursor-pointer ${
                      customTagLabel === '邏輯矛盾類'
                        ? 'bg-[#991b1b] text-white font-bold border-[#7f1d1d] shadow-sm'
                        : 'bg-[#fef2f2] border-[#fca5a5] text-[#991b1b] hover:bg-[#fee2e2]'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span>邏輯矛盾類</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setNoteColorTag('amber');
                      setNoteCategory('clue');
                      setCustomTagLabel('環境線索類');
                    }}
                    className={`text-[11px] px-2.5 py-0.5 border transition-all flex items-center gap-1.5 cursor-pointer ${
                      customTagLabel === '環境線索類'
                        ? 'bg-[#854d0e] text-white font-bold border-[#713f12] shadow-sm'
                        : 'bg-[#fefce8] border-[#fde047] text-[#854d0e] hover:bg-[#fef9c3]'
                    }`}
                  >
                    <MapPin className="w-3 h-3 text-amber-500" />
                    <span>環境線索類</span>
                  </button>
                </div>

                {/* Color Preset Pills and Submit Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#d5e3d3]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-[#556e52] mr-1">顏色調色盤：</span>
                    {(Object.keys(NOTE_COLOR_THEMES) as NoteColorTheme[]).map((cKey) => {
                      const cfg = NOTE_COLOR_THEMES[cKey];
                      const isSelected = noteColorTag === cKey;
                      return (
                        <button
                          key={cKey}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setNoteColorTag(cKey);
                            if (cfg.suggestedCategory) {
                              setNoteCategory(cfg.suggestedCategory);
                            }
                            setCustomTagLabel(cfg.name.split('（')[0]);
                          }}
                          className={`text-[11px] px-2 py-0.5 border transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-[#1c3819] text-white border-[#1c3819] font-bold'
                              : 'bg-white border-[#cfdacf] text-[#365233] hover:border-[#7ca078]'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                          <span>{cfg.name.split('（')[0]}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubmitNote()}
                    disabled={!noteInput.trim()}
                    className="retro-web-btn px-3 py-1 text-xs font-bold flex items-center gap-1 bg-[#1c3819] text-white border-[#1c3819] hover:bg-[#2b5828] disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>記錄手記</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Tag Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#eaf2e8] border border-[#7ca078]">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#2b5828]" />
                <span className="text-xs font-bold text-[#1c3819]">
                  標籤分類篩選：
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {TAG_FILTER_CONFIGS.map(cfg => {
                  const isSelected = selectedTagFilter === cfg.id;
                  const count = cfg.id === 'all' 
                    ? freeNotes.length 
                    : freeNotes.filter(n => matchesNoteTag(n, cfg.id)).length;

                  return (
                    <button
                      key={cfg.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedTagFilter(cfg.id);
                      }}
                      title={cfg.description}
                      className={`text-xs px-2.5 py-1 border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1c3819] text-white border-[#1c3819] font-bold'
                          : 'bg-white border-[#9ec49b] text-[#2c4b29] hover:bg-[#f0f7ef]'
                      }`}
                    >
                      {cfg.id === 'all' && <Tag className="w-3 h-3" />}
                      {cfg.id === 'ghost_lore' && <Sparkles className="w-3 h-3 text-purple-500" />}
                      {cfg.id === 'logic_contradiction' && <AlertTriangle className="w-3 h-3 text-red-500" />}
                      {cfg.id === 'env_clues' && <MapPin className="w-3 h-3 text-amber-600" />}
                      <span>{cfg.label}</span>
                      <span className={`text-[10px] px-1 font-mono font-bold ${
                        isSelected ? 'bg-black/20 text-[#a3e635]' : 'bg-[#e4ede2] text-[#3e593b]'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-2.5 border border-[#7ca078] shadow-sm">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-[#587355]" />
                <input
                  type="text"
                  value={notesSearchQuery}
                  onChange={(e) => setNotesSearchQuery(e.target.value)}
                  placeholder="搜尋筆記關鍵字、地點或標籤..."
                  className="bg-transparent text-xs text-[#1a2e18] placeholder:text-[#88a085] focus:outline-none w-full"
                />
              </div>

              {/* Color filter */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setNotesFilterColor('all')}
                  className={`text-[10px] px-2 py-0.5 border ${
                    notesFilterColor === 'all' ? 'bg-[#1c3819] text-white font-bold border-[#1c3819]' : 'bg-[#f0f7ef] text-[#3b5e38] border-[#b0cead] hover:text-[#1c3819]'
                  }`}
                >
                  全部色調
                </button>
                {(Object.keys(NOTE_COLOR_THEMES) as NoteColorTheme[]).map((cKey) => {
                  const cfg = NOTE_COLOR_THEMES[cKey];
                  const isSel = notesFilterColor === cKey;
                  return (
                    <button
                      key={cKey}
                      onClick={() => setNotesFilterColor(cKey)}
                      title={cfg.name}
                      className={`w-3.5 h-3.5 rounded-full ${cfg.dotColor} transition-transform ${
                        isSel ? 'ring-2 ring-[#1c3819] scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Notes List */}
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-[#587355] space-y-2 bg-white border border-[#7ca078]">
                <StickyNote className="w-8 h-8 mx-auto text-[#88a085] stroke-[1.5]" />
                <p className="text-xs">
                  {freeNotes.length === 0
                    ? '目前尚未記錄任何偵探手記。可在上方輸入框快速記錄線索！'
                    : selectedTagFilter !== 'all'
                      ? `目前沒有符合「${TAG_FILTER_CONFIGS.find(t => t.id === selectedTagFilter)?.label}」的偵探手記。`
                      : '找不到符合搜尋條件的筆記。'}
                </p>
                {selectedTagFilter !== 'all' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedTagFilter('all');
                    }}
                    className="retro-web-btn px-3 py-1 text-xs inline-flex items-center gap-1"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>查看全部手記 ({freeNotes.length})</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
                {filteredNotes.map((note, displayIndex) => {
                  const colorCfg = getNoteColorTheme(note);
                  const isEditingColor = activeEditingColorNoteId === note.id;

                  return (
                    <div
                      key={note.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, note.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, note.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, note.id)}
                      className={`p-3 bg-white border border-[#7ca078] shadow-sm transition-all space-y-2 relative ${colorCfg.accentBorder} ${
                        draggedNoteId === note.id ? 'opacity-40 border-dashed border-[#1c3819]' : ''
                      } ${
                        dragOverNoteId === note.id && dropPosition === 'above' ? 'border-t-2 border-t-[#1c3819]' : ''
                      } ${
                        dragOverNoteId === note.id && dropPosition === 'below' ? 'border-b-2 border-b-[#1c3819]' : ''
                      }`}
                    >
                      {/* Note Header */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#587355]">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold ${colorCfg.badgeBg} ${colorCfg.badgeText} border ${colorCfg.badgeBorder}`}>
                            {note.customTagLabel || colorCfg.label}
                          </span>
                          <span className="text-[10px] text-[#365233] font-sans">{note.location || currentLocationName}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Reorder Up/Down */}
                          <button
                            type="button"
                            onClick={() => handleMoveNoteStep(note.id, 'up')}
                            disabled={displayIndex === 0}
                            className="p-1 hover:bg-[#e4ede2] text-[#365233] disabled:opacity-30 cursor-pointer"
                            title="上移"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveNoteStep(note.id, 'down')}
                            disabled={displayIndex === filteredNotes.length - 1}
                            className="p-1 hover:bg-[#e4ede2] text-[#365233] disabled:opacity-30 cursor-pointer"
                            title="下移"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>

                          {/* Quick Color Tag Change */}
                          <div className="relative">
                            <button
                              onClick={() => {
                                sound.playClick();
                                setActiveEditingColorNoteId(isEditingColor ? null : note.id);
                              }}
                              className="p-1 hover:bg-[#e4ede2] text-[#365233] hover:text-[#1c3819] cursor-pointer"
                              title="更換標籤顏色"
                            >
                              <Palette className="w-3 h-3" />
                            </button>

                            {isEditingColor && (
                              <div className="absolute right-0 top-full mt-1 z-30 p-2 bg-white border-2 border-[#1c3819] shadow-xl space-y-1.5 w-48 text-[#1a2e18]">
                                <div className="text-[9px] font-mono text-[#587355] px-1 font-bold">
                                  快速標籤分類
                                </div>
                                <div className="grid grid-cols-1 gap-1 pb-1 border-b border-[#cfdacf]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateFreeNoteColor?.(note.id, 'purple', '怪談類');
                                      setActiveEditingColorNoteId(null);
                                    }}
                                    className="w-full text-left px-2 py-1 text-[10px] flex items-center gap-1.5 bg-[#faf5ff] hover:bg-[#f3e8ff] text-[#6b21a8] border border-[#d8b4fe] cursor-pointer"
                                  >
                                    <Sparkles className="w-3 h-3 text-purple-500" />
                                    <span>設定為「怪談類」</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateFreeNoteColor?.(note.id, 'crimson', '邏輯矛盾類');
                                      setActiveEditingColorNoteId(null);
                                    }}
                                    className="w-full text-left px-2 py-1 text-[10px] flex items-center gap-1.5 bg-[#fef2f2] hover:bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] cursor-pointer"
                                  >
                                    <AlertTriangle className="w-3 h-3 text-red-500" />
                                    <span>設定為「邏輯矛盾類」</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateFreeNoteColor?.(note.id, 'amber', '環境線索類');
                                      setActiveEditingColorNoteId(null);
                                    }}
                                    className="w-full text-left px-2 py-1 text-[10px] flex items-center gap-1.5 bg-[#fefce8] hover:bg-[#fef9c3] text-[#854d0e] border border-[#fde047] cursor-pointer"
                                  >
                                    <MapPin className="w-3 h-3 text-amber-600" />
                                    <span>設定為「環境線索類」</span>
                                  </button>
                                </div>

                                <div className="text-[9px] font-mono text-[#587355] px-1 font-bold">
                                  選擇便箋色系
                                </div>
                                {(Object.keys(NOTE_COLOR_THEMES) as NoteColorTheme[]).map((cKey) => {
                                  const cfg = NOTE_COLOR_THEMES[cKey];
                                  return (
                                    <button
                                      key={cKey}
                                      type="button"
                                      onClick={() => {
                                        onUpdateFreeNoteColor?.(note.id, cKey, cfg.name.split('（')[0]);
                                        setActiveEditingColorNoteId(null);
                                      }}
                                      className="w-full text-left px-2 py-1 text-[10px] flex items-center gap-1.5 hover:bg-[#f0f7ef] text-[#2c4b29] cursor-pointer"
                                    >
                                      <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                                      <span>{cfg.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              onDeleteFreeNote(note.id);
                            }}
                            className="p-1 hover:bg-[#fee2e2] text-[#587355] hover:text-[#991b1b] cursor-pointer"
                            title="刪除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Note Content */}
                      <p className="text-xs text-[#1a2e18] leading-relaxed whitespace-pre-line font-sans">
                        {note.text}
                      </p>

                      <div className="text-[10px] text-[#718d6e] font-mono">
                        {note.timestamp}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-2.5 sm:px-5 border-t border-[#7ca078] bg-[#eaf2e8] flex items-center justify-between text-xs text-[#385e35]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2b7524] animate-pulse" />
            <span className="text-[11px] font-mono">偵探便箋與線索樹狀關聯即時封存中</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="retro-web-btn px-3 py-1 text-xs cursor-pointer"
          >
            關閉筆記
          </button>
        </div>
      </motion.div>
    </div>
  );
};
