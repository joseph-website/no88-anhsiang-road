import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
  X,
  Layers,
  Target,
  Compass,
  MapPin,
  Briefcase,
  Zap,
  Check
} from 'lucide-react';
import { 
  CASE_HYPOTHESES, WEEK1_CASE_HYPOTHESES, RULE_CONTRADICTIONS, EVIDENCE_NETWORK, CaseHypothesis 
} from '../data/deductionData';
import { RULES_DATA, INVENTORY_ITEMS } from '../data/rulesData';
import { sound } from '../services/soundEngine';
import { safeStorageGetJSON, safeStorageSetJSON } from '../services/storageHelper';
import { LogicContradictionInspector } from './LogicContradictionInspector';
import { HypothesisLinkVisualizer } from './HypothesisLinkVisualizer';
import { CorkboardRelationGraph } from './CorkboardRelationGraph';
import { FreeNote, NoteColorTheme, EndingId, GameState } from '../types';

export interface NoteColorConfig {
  id: NoteColorTheme;
  name: string;
  label: string;
  accentBorder: string;
  cardBg: string;
  cardHoverBorder: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotColor: string;
  chipActiveBg: string;
  chipBg: string;
  description: string;
  suggestedCategory: 'clue' | 'rule' | 'suspect' | 'general';
}

export const NOTE_COLOR_THEMES: Record<NoteColorTheme, NoteColorConfig> = {
  amber: {
    id: 'amber',
    name: '關鍵案情',
    label: '琥珀金',
    accentBorder: 'border-l-4 border-l-amber-500',
    cardBg: 'bg-amber-950/20',
    cardHoverBorder: 'hover:border-amber-500/70',
    badgeBg: 'bg-amber-950/90',
    badgeBorder: 'border-amber-600/70',
    badgeText: 'text-amber-300',
    dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    chipActiveBg: 'bg-amber-500 border-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-950/70 ring-2 ring-amber-400/40',
    chipBg: 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/60',
    description: '核心真相、失蹤者張浩軌跡、主線推進',
    suggestedCategory: 'clue'
  },
  crimson: {
    id: 'crimson',
    name: '規則矛盾',
    label: '赤血紅',
    accentBorder: 'border-l-4 border-l-red-500',
    cardBg: 'bg-red-950/25',
    cardHoverBorder: 'hover:border-red-500/70',
    badgeBg: 'bg-red-950/90',
    badgeBorder: 'border-red-600/70',
    badgeText: 'text-red-300',
    dotColor: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    chipActiveBg: 'bg-red-600 border-red-400 text-white font-bold shadow-md shadow-red-950/70 ring-2 ring-red-400/40',
    chipBg: 'bg-red-950/40 border-red-800/60 text-red-300 hover:bg-red-900/60',
    description: '違章條款互斥、偽造規則、致命規則衝突',
    suggestedCategory: 'rule'
  },
  emerald: {
    id: 'emerald',
    name: '現場實證',
    label: '翡翠綠',
    accentBorder: 'border-l-4 border-l-emerald-500',
    cardBg: 'bg-emerald-950/20',
    cardHoverBorder: 'hover:border-emerald-500/70',
    badgeBg: 'bg-emerald-950/90',
    badgeBorder: 'border-emerald-600/70',
    badgeText: 'text-emerald-300',
    dotColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    chipActiveBg: 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-md shadow-emerald-950/70 ring-2 ring-emerald-400/40',
    chipBg: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60',
    description: '建築違建藍圖、水電迴路、實體磁扣鑰匙',
    suggestedCategory: 'clue'
  },
  cyan: {
    id: 'cyan',
    name: '空間悖論',
    label: '青冷藍',
    accentBorder: 'border-l-4 border-l-cyan-500',
    cardBg: 'bg-cyan-950/20',
    cardHoverBorder: 'hover:border-cyan-500/70',
    badgeBg: 'bg-cyan-950/90',
    badgeBorder: 'border-cyan-600/70',
    badgeText: 'text-cyan-300',
    dotColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]',
    chipActiveBg: 'bg-cyan-500 border-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-950/70 ring-2 ring-cyan-400/40',
    chipBg: 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/60',
    description: '四樓消失之謎、樓梯階數差異、夾層結構',
    suggestedCategory: 'clue'
  },
  purple: {
    id: 'purple',
    name: '已解開疑點',
    label: '已解開疑點',
    accentBorder: 'border-l-4 border-l-purple-500',
    cardBg: 'bg-purple-950/25',
    cardHoverBorder: 'hover:border-purple-500/70',
    badgeBg: 'bg-purple-950/90',
    badgeBorder: 'border-purple-600/70',
    badgeText: 'text-purple-300',
    dotColor: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]',
    chipActiveBg: 'bg-purple-600 border-purple-400 text-white font-bold shadow-md shadow-purple-950/70 ring-2 ring-purple-400/40',
    chipBg: 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/60',
    description: '已成功關聯之矛盾線索、解構之客觀事實、疑點突破',
    suggestedCategory: 'rule'
  },
  rose: {
    id: 'rose',
    name: '人物證詞',
    label: '玫瑰粉',
    accentBorder: 'border-l-4 border-l-pink-500',
    cardBg: 'bg-pink-950/20',
    cardHoverBorder: 'hover:border-pink-500/70',
    badgeBg: 'bg-pink-950/90',
    badgeBorder: 'border-pink-600/70',
    badgeText: 'text-pink-300',
    dotColor: 'bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.6)]',
    chipActiveBg: 'bg-pink-600 border-pink-400 text-white font-bold shadow-md shadow-pink-950/70 ring-2 ring-pink-400/40',
    chipBg: 'bg-pink-950/40 border-pink-800/60 text-pink-300 hover:bg-pink-900/60',
    description: '警衛證言、房東供述、委託人陳先生記憶',
    suggestedCategory: 'suspect'
  },
  neutral: {
    id: 'neutral',
    name: '調查隨筆',
    label: '黑鉛灰',
    accentBorder: 'border-l-4 border-l-neutral-500',
    cardBg: 'bg-neutral-900/40',
    cardHoverBorder: 'hover:border-neutral-500/70',
    badgeBg: 'bg-neutral-900/90',
    badgeBorder: 'border-neutral-700',
    badgeText: 'text-neutral-300',
    dotColor: 'bg-neutral-400 shadow-[0_0_8px_rgba(163,163,163,0.6)]',
    chipActiveBg: 'bg-neutral-300 border-neutral-100 text-neutral-950 font-bold shadow-md ring-2 ring-neutral-400/40',
    chipBg: 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800',
    description: '日常行動規劃、搜查清單、臨時備忘',
    suggestedCategory: 'general'
  }
};

export const getNoteColorTheme = (note: FreeNote): NoteColorConfig => {
  if (note.colorTag && NOTE_COLOR_THEMES[note.colorTag]) {
    return NOTE_COLOR_THEMES[note.colorTag];
  }
  // Fallback inferred by category
  if (note.category === 'rule') return NOTE_COLOR_THEMES.crimson;
  if (note.category === 'suspect') return NOTE_COLOR_THEMES.rose;
  if (note.category === 'general') return NOTE_COLOR_THEMES.neutral;
  return NOTE_COLOR_THEMES.amber;
};

interface DeductionBoardModalProps {
  currentChapter?: string;
  currentLocationName?: string;
  obtainedRules: string[];
  inventory: string[];
  isCctvRebooted: boolean;
  san: number;
  freeNotes?: FreeNote[];
  onAddFreeNote?: (
    text: string, 
    category?: 'clue' | 'rule' | 'suspect' | 'general', 
    tags?: string[],
    colorTag?: NoteColorTheme,
    customTagLabel?: string
  ) => void;
  onUpdateFreeNoteColor?: (id: string, colorTag: NoteColorTheme, customTagLabel?: string) => void;
  onDeleteFreeNote?: (id: string) => void;
  onModifySan?: (delta: number) => void;
  onTriggerEnding?: (endingId: EndingId) => void;
  trait?: any;
  completedWeek1?: boolean;
  onAddJournalEntry?: (entry: {
    category: 'system' | 'action' | 'dialogue';
    title: string;
    content: string;
    location?: string;
    sanDelta?: number;
    highlightBadge?: string;
  }) => void;
  onClose: () => void;
}

export const DeductionBoardModal: React.FC<DeductionBoardModalProps> = ({
  currentChapter = 'exploration',
  currentLocationName = '安祥路88號大樓',
  obtainedRules,
  inventory,
  isCctvRebooted,
  san,
  freeNotes = [],
  trait = 'rationalist',
  completedWeek1 = false,
  onAddFreeNote,
  onUpdateFreeNoteColor,
  onDeleteFreeNote,
  onModifySan,
  onTriggerEnding,
  onAddJournalEntry,
  onClose
}) => {
  const activeHypotheses = completedWeek1 ? CASE_HYPOTHESES : WEEK1_CASE_HYPOTHESES;
  const [activeTab, setActiveTab] = useState<'hypotheses' | 'inspector' | 'contradictions' | 'evidence' | 'hints'>('hypotheses');
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string>(activeHypotheses[0].id);
  const [selectedContradictionId, setSelectedContradictionId] = useState<string>(RULE_CONTRADICTIONS[0].id);
  const [pinpointedContradictions, setPinpointedContradictions] = useState<string[]>([]);
  const [breakthroughEffect, setBreakthroughEffect] = useState<string | null>(null);

  // Free Notes Tab local state with Custom Color Tagging
  const [freeNoteInput, setFreeNoteInput] = useState<string>('');
  const [freeNoteColorTag, setFreeNoteColorTag] = useState<NoteColorTheme>('amber');
  const [freeNoteCategory, setFreeNoteCategory] = useState<'clue' | 'rule' | 'suspect' | 'general'>('clue');
  const [customTagLabel, setCustomTagLabel] = useState<string>('案情線索');
  const [notesFilterCategory, setNotesFilterCategory] = useState<'all' | 'clue' | 'rule' | 'suspect' | 'general'>('all');
  const [notesFilterColor, setNotesFilterColor] = useState<'all' | NoteColorTheme>('all');
  const [notesSearchQuery, setNotesSearchQuery] = useState<string>('');
  const [activeEditingColorNoteId, setActiveEditingColorNoteId] = useState<string | null>(null);

  // Thought link notification toast state
  const [thoughtLinkToast, setThoughtLinkToast] = useState<{
    id: string;
    title: string;
    clueA: string;
    clueB: string;
    deductionTitle: string;
    insight: string;
  } | null>(null);

  // Selected note IDs for manual multi-note association linking
  const [selectedNoteIdsForLink, setSelectedNoteIdsForLink] = useState<string[]>([]);
  const [isLinkingModeActive, setIsLinkingModeActive] = useState<boolean>(false);

  // Truth fragments saved state
  const [unlockedTruthFragmentIds, setUnlockedTruthFragmentIds] = useState<string[]>(() => {
    return safeStorageGetJSON<string[]>('ROOM404_TRUTH_FRAGMENTS', []);
  });

  const handleUnlockTruthFragment = (fragmentId: string) => {
    setUnlockedTruthFragmentIds(prev => {
      if (prev.includes(fragmentId)) return prev;
      const next = [...prev, fragmentId];
      safeStorageSetJSON('ROOM404_TRUTH_FRAGMENTS', next);
      return next;
    });
  };

  // Handler to establish a thought link, tag detective notes as 'purple' (已解開疑點), and show Toast
  const handleEstablishThoughtLink = (
    clueA: string,
    clueB: string,
    deductionTitle: string,
    insightText: string
  ) => {
    sound.playContradictionBreakthrough();

    // 1. Scan and update all related notes with purple '已解開疑點' tag
    let matchedCount = 0;
    if (freeNotes && freeNotes.length > 0) {
      const qA = clueA.toLowerCase();
      const qB = clueB.toLowerCase();
      const qT = deductionTitle.toLowerCase();

      freeNotes.forEach((note) => {
        const textLower = note.text.toLowerCase();
        const tagMatches = note.tags?.some(t => t.toLowerCase().includes(qA) || t.toLowerCase().includes(qB));
        if (
          textLower.includes(qA) ||
          textLower.includes(qB) ||
          textLower.includes(qT) ||
          tagMatches
        ) {
          onUpdateFreeNoteColor?.(note.id, 'purple', '已解開疑點');
          matchedCount++;
        }
      });
    }

    // 2. If no existing notes matched, or to guarantee record in detective notes
    if (matchedCount === 0) {
      onAddFreeNote?.(
        `【已解開疑點】${deductionTitle}\n思維關聯：【${clueA}】✕【${clueB}】\n★ 洞察解析：${insightText}`,
        'rule',
        ['已解開疑點', '思維連結'],
        'purple',
        '已解開疑點'
      );
    }

    // 3. Trigger Thought Link Established Toast
    const toastId = `link_${Date.now()}`;
    setThoughtLinkToast({
      id: toastId,
      title: '思維連結建立',
      clueA,
      clueB,
      deductionTitle,
      insight: insightText
    });

    setTimeout(() => {
      setThoughtLinkToast((prev) => (prev?.id === toastId ? null : prev));
    }, 4500);
  };

  const handleManualLinkSelectedNotes = () => {
    if (selectedNoteIdsForLink.length < 2) return;
    const note1 = freeNotes.find(n => n.id === selectedNoteIdsForLink[0]);
    const note2 = freeNotes.find(n => n.id === selectedNoteIdsForLink[1]);
    if (!note1 || !note2) return;

    // Update both notes to purple tag
    onUpdateFreeNoteColor?.(note1.id, 'purple', '已解開疑點');
    onUpdateFreeNoteColor?.(note2.id, 'purple', '已解開疑點');

    const snippet1 = note1.customTagLabel || note1.tags?.[0] || note1.text.slice(0, 14);
    const snippet2 = note2.customTagLabel || note2.tags?.[0] || note2.text.slice(0, 14);

    handleEstablishThoughtLink(
      snippet1,
      snippet2,
      '手動線索交叉比對',
      `偵探手動將【${snippet1}】與【${snippet2}】之疑點進行邏輯貫通，確認其內在關聯！`
    );

    setSelectedNoteIdsForLink([]);
    setIsLinkingModeActive(false);
  };

  // Compute comprehension progress
  const unlockedHypothesesCount = useMemo(() => {
    return activeHypotheses.filter(hypo => {
      const hasAllRules = hypo.requiredRuleIds.every(r => obtainedRules.includes(r));
      const hasAllItems = hypo.requiredItemIds.every(i => inventory.includes(i));
      return hasAllRules && hasAllItems;
    }).length;
  }, [activeHypotheses, obtainedRules, inventory]);

  const deductionProgress = Math.round((unlockedHypothesesCount / activeHypotheses.length) * 100);

  const selectedHypo = activeHypotheses.find(h => h.id === selectedHypothesisId) || activeHypotheses[0];
  const selectedContra = RULE_CONTRADICTIONS.find(c => c.id === selectedContradictionId) || RULE_CONTRADICTIONS[0];

  const isHypoUnlocked = (hypo: CaseHypothesis) => {
    const hasAllRules = hypo.requiredRuleIds.every(r => obtainedRules.includes(r));
    const hasAllItems = hypo.requiredItemIds.every(i => inventory.includes(i));
    return hasAllRules && hasAllItems;
  };

  // Dynamic context-sensitive hint based on current environment and held items
  const currentHintData = useMemo(() => {
    const isOffice = currentChapter === 'prologue' || currentLocationName.includes('事務所') || currentLocationName.includes('辦公室');
    const isLobby = currentLocationName.includes('大廳') || currentLocationName.includes('門廳');
    const isSecurity = currentLocationName.includes('警衛') || currentLocationName.includes('安控');
    const isFloor2 = currentLocationName.includes('二樓') || currentLocationName.includes('2F');
    const isFloor3 = currentLocationName.includes('三樓') || currentLocationName.includes('3F');
    const isFloor5 = currentLocationName.includes('五樓') || currentLocationName.includes('504') || currentLocationName.includes('5F');
    const isFloor4 = currentLocationName.includes('四樓') || currentLocationName.includes('404') || currentLocationName.includes('4F');

    let locationLabel = currentLocationName;
    let mainHint = '';
    let envDetail = '';
    let safeOfficeChecklist: string[] = [];
    let safeOfficeDeductionFocus = '';

    if (!completedWeek1) {
      if (isOffice) {
        locationLabel = '私家偵探事務所（安全環境）';
        mainHint = '在安靜的事務所內，你可以泡杯咖啡，從容審視委託書與現場筆記，梳理搜救失蹤者張浩的行動計畫。';
        envDetail = '安全無虞的環境讓思維高度清晰，專注於規劃前往安祥路88號大樓的調查步驟。';
        if (!inventory.includes('key_504')) {
          safeOfficeDeductionFocus = '現場初訪規劃：前往安祥路88號大樓，展開第一階段搜查。';
          safeOfficeChecklist = [
            '前往安祥路88號大樓，實地了解現場環境。',
            '尋訪大樓值班人員與周遭住戶，打聽張浩的日常動態。',
            '留意大樓出入動線與周圍環境，探尋進一步線索。'
          ];
        } else {
          safeOfficeDeductionFocus = '504號房室內搜查：深入張浩房內展開地毯式搜查。';
          safeOfficeChecklist = [
            '前往五樓 504 號房，開啟房門入內。',
            '勘查房內生活跡證（桌椅、咖啡杯、個人物品動靜）。',
            '仔細檢驗房間內部格局，尋找失蹤者留下的關鍵蛛絲馬跡。'
          ];
        }
      } else {
        locationLabel = isLobby ? '一樓大廳（現場搜查）' : isFloor5 ? '五樓 504 號房周邊（現場搜查）' : `${currentLocationName}（現場勘查）`;
        mainHint = !inventory.includes('key_504')
          ? '當前首要目標為與大樓管理人員交涉，設法前往五樓展開搜查。'
          : '已持有 504 號房鑰匙，搭乘電梯前往五樓 504 號房搜查生活跡證與房間異常！';
        envDetail = '專注搜查眼前跡證，確認失蹤者張浩的安全。';
      }
    } else if (isOffice) {
      locationLabel = '私家偵探事務所（安全環境）';
      mainHint = '在安靜的事務所內，你可以泡杯咖啡，從容翻閱所有搜集到的證物與筆記，進行全盤邏輯推演。';
      envDetail = '安全無虞的辦公環境讓思維高度清晰，可比對所有規則漏洞並擬定後續調查步驟。';
      
      // Detailed investigative roadmaps for safe office environment
      if (inventory.length === 0 && obtainedRules.length === 0) {
        safeOfficeDeductionFocus = '初次接案準備：前往安祥路88號大樓，探詢504號房狀況與現場動態。';
        safeOfficeChecklist = [
          '向委託人確認失蹤者張浩的最後通聯細節與門牌號。',
          '抵達大樓後，檢查一樓大廳周邊環境與張貼資訊。',
          '與現場值班人員交涉，探詢進入失蹤者房間的途徑。'
        ];
      } else if (!inventory.includes('key_504')) {
        safeOfficeDeductionFocus = '大樓現場勘查：前往安祥路88號大樓，探詢504號房動向。';
        safeOfficeChecklist = [
          '回到大樓一樓值班台，向警衛打聽504號房現況。',
          '觀察大廳公布欄資訊，留意大樓可能存在的不尋常之處。'
        ];
      } else if (!inventory.includes('shredded_letter') || !obtainedRules.includes('rule_resident')) {
        safeOfficeDeductionFocus = '失蹤者現場勘查：前往五樓504號房，尋找張浩遺留的個人紀錄。';
        safeOfficeChecklist = [
          '搭乘外側電梯或安全梯登上五樓，用鑰匙開啟504號房。',
          '翻查504房內桌上的【住戶手冊】與垃圾桶中的【撕碎信件】。',
          '在「物證檔案」中拼湊撕碎的信件，確認寄件人與收件地址之謎。'
        ];
      } else if (!inventory.includes('building_blueprints') || !isCctvRebooted) {
        safeOfficeDeductionFocus = '大樓結構與監視系統：掌握1998～2002年違建圖紙並重置警衛中控主機。';
        safeOfficeChecklist = [
          '趁警衛離開值班台時進入「一樓警衛安控室」。',
          '拉開辦公桌底層抽屜，取出【1998～2002年大樓違章加蓋圖紙與歷史產權封存卷宗】。',
          '坐上中控台進行【深度推理】，比對各方規則矛盾，重置監視器揭露404空間。'
        ];
      } else if (!inventory.includes('tape_recorder')) {
        safeOfficeDeductionFocus = '突破遮蔽層：監視系統重置後，尋找隱藏的四樓通道。';
        safeOfficeChecklist = [
          '搭乘電梯（按下原本無效的空白鍵）或走安全梯前往顯現的四樓。',
          '在四樓走廊搜查失蹤者的隨身【錄音筆】，掌握核心對峙真相。',
          '確認理智值狀態，準備直面404號房深處的規則源頭。'
        ];
      } else {
        safeOfficeDeductionFocus = '真相對峙決戰：掌握全部物證與矛盾破綻，進行最終解構！';
        safeOfficeChecklist = [
          '攜帶【違建藍圖】、【撕碎信件】與【張浩錄音筆】。',
          '推開404號房大門，在對峙中逐一出示證據摧毀規則同化。'
        ];
      }
    } else {
      // Inside Building (Real-time environment)
      if (isLobby) {
        locationLabel = '一樓大廳（現場搜查）';
        mainHint = '空氣沉悶，日光燈不時閃爍。專注觀察周遭環境與可能留下的痕跡。';
        envDetail = '隨時保持警惕，仔細記錄值班台與公布欄的蛛絲馬跡。';
      } else if (isSecurity) {
        locationLabel = '一樓警衛安控室（現場搜查）';
        mainHint = '監視器螢幕閃爍著雪花與雜訊，主機發出低沉嗡鳴。專注眼前控制台與抽屜檔案。';
        envDetail = '留意螢幕顯示的畫面異常與可能遺留的工作紀錄。';
      } else if (isFloor2) {
        locationLabel = '二樓梯廳走廊（現場搜查）';
        mainHint = '走廊寂靜無聲，只有微弱的水滴聲。留意周遭門扇與清潔車。';
        envDetail = '通道兩側雜物堆疊，尋找任何與失蹤案有關的關聯物。';
      } else if (isFloor3) {
        locationLabel = '三樓配電機房（現場搜查）';
        mainHint = '電箱發出滋滋電流聲，空氣中彌漫著潮濕鐵鏽味。小心突發聲響。';
        envDetail = '配電管線錯綜複雜，注意管線佈局與設備開關。';
      } else if (isFloor5) {
        locationLabel = '五樓走廊與套房（現場搜查）';
        mainHint = '數天前留下的生活痕跡與壓抑的氣氛交織。專注搜查眼前室內的線索。';
        envDetail = '仔細翻查失蹤者房間的私人物品與門牌編號。';
      } else if (isFloor4) {
        locationLabel = '四樓未知空間（現場搜查）';
        mainHint = '空間極度不穩定，耳邊迴盪著打字機敲擊聲！依靠直覺與手中物證果斷行動！';
        envDetail = '保持理智與專注，不要被周遭異狀動搖信念。';
      } else {
        locationLabel = `${currentLocationName}（現場搜查）`;
        mainHint = '專注眼前搜查，留意任何可能被忽略的細微線索。';
        envDetail = '綜合手邊證物與現場觀察，推進調查進度。';
      }
    }

    // Held inventory quick notes (only for items the player actually holds)
    const heldNotes: { itemTitle: string; note: string }[] = [];
    if (inventory.includes('key_504')) {
      heldNotes.push({ itemTitle: '504號房鑰匙', note: '已在身邊，可用於開啟五樓對應套房大門。' });
    }
    if (inventory.includes('shredded_letter')) {
      heldNotes.push({ itemTitle: '撕碎的信件', note: '碎片已收納，可於「物證檔案」中點擊進行拼圖還原。' });
    }
    if (inventory.includes('building_blueprints')) {
      heldNotes.push({ itemTitle: '1998～2002違建圖紙與公文', note: '記錄了大樓實際的建築隔間與2002～2012長達十年的產權空白歷史。' });
    }
    if (inventory.includes('tape_recorder')) {
      heldNotes.push({ itemTitle: '張浩錄音筆', note: '記錄了失蹤者在現場所留下的口述錄音。' });
    }
    if (inventory.includes('old_case_file')) {
      heldNotes.push({ itemTitle: '陳年怪異案卷', note: '記錄了過去相關案件之背景資料。' });
    }

    return {
      isOffice,
      locationLabel,
      mainHint,
      envDetail,
      safeOfficeChecklist,
      safeOfficeDeductionFocus,
      heldNotes
    };
  }, [currentChapter, currentLocationName, inventory, obtainedRules, isCctvRebooted]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-1 sm:p-3 md:p-5 lg:p-6 select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="retro-forum-modal-window rounded-none w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl h-[96dvh] sm:h-[90vh] lg:h-[88vh] max-h-[96dvh] lg:max-h-[860px] xl:max-h-[920px] flex flex-col shadow-2xl overflow-hidden text-[#222222]"
      >
        {/* Header */}
        <div className="px-3 sm:px-5 py-2 sm:py-2.5 retro-forum-modal-header text-[#ffffff] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xs bg-[#ffffff]/20 border border-[#ffffff]/40 text-[#ffffff] shrink-0">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#ffffff] tracking-wide truncate">
                  {completedWeek1 ? '案情推演與邏輯解析' : '安祥路88號・失蹤案現場搜查備忘'}
                  <span className="hidden sm:inline font-normal text-xs text-[#d6ecd0] ml-1.5">
                    {completedWeek1 ? '// DEDUCTION' : '// INVESTIGATION'}
                  </span>
                </h3>
                <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-xs bg-[#ffffff]/20 text-[#ffffff] border border-[#ffffff]/40 shrink-0 font-bold">
                  {completedWeek1 ? `真相解構率 ${deductionProgress}%` : `現場搜查進度 ${deductionProgress}%`}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#d6ecd0] truncate hidden xs:block">
                {completedWeek1 
                  ? '比對規則矛盾、交叉驗證客觀物證，解構安祥路88號的認知怪異' 
                  : '搜查五樓 504 號房，尋獲失蹤者張浩之現場生活跡證與破案線索'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-xs border border-[#ffffff]/40 text-[#ffffff] hover:bg-[#ffffff]/20 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0 ml-1"
            title="關閉"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>

        {/* Progress and Top Navigation */}
        <div className="p-2 sm:px-4 retro-forum-modal-subnav flex flex-wrap items-center justify-between gap-2 shrink-0 border-b border-[#a8c2a1]">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full touch-pan-x scrollbar-none">
            <button
              onClick={() => {
                sound.playPaper();
                setActiveTab('hypotheses');
              }}
              className={`px-3 py-1 rounded-xs text-xs font-sans transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'hypotheses'
                  ? 'bg-[#3e6634] text-[#ffffff] font-bold shadow-2xs border border-[#2d4d25]'
                  : 'bg-[#ffffff] hover:bg-[#eef5ec] text-[#33522c] border border-[#a8c2a1]'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{completedWeek1 ? '核心假說' : '搜查推論'} ({unlockedHypothesesCount}/{activeHypotheses.length})</span>
            </button>

            {/* Spoiler-heavy tabs only available in Round 2 (completedWeek1 === true) */}
            {completedWeek1 && (
              <>
                <button
                  onClick={() => {
                    sound.playPaper();
                    setActiveTab('inspector');
                  }}
                  className={`px-3 py-1 rounded-xs text-xs font-sans transition-all flex items-center gap-1.5 whitespace-nowrap relative cursor-pointer ${
                    activeTab === 'inspector'
                      ? 'bg-[#3e6634] text-[#ffffff] font-bold shadow-2xs border border-[#2d4d25]'
                      : obtainedRules.length >= 3
                        ? 'bg-[#fbeeed] hover:bg-[#f8dedd] text-[#b83828] border border-[#e0a8a3] animate-pulse'
                        : 'bg-[#ffffff] hover:bg-[#eef5ec] text-[#33522c] border border-[#a8c2a1]'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${obtainedRules.length >= 3 ? 'text-[#b83828]' : 'text-[#779471]'}`} />
                  <span>邏輯矛盾檢查器</span>
                  {obtainedRules.length >= 3 ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-[#c93b2b] text-[#ffffff] font-mono">
                      {unlockedTruthFragmentIds.length}/6 碎片
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-[#eef5ec] text-[#556652] font-mono border border-[#a8c2a1]">
                      需3份規則 ({obtainedRules.length}/3)
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    sound.playPaper();
                    setActiveTab('contradictions');
                  }}
                  className={`px-3 py-1 rounded-xs text-xs font-sans transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'contradictions'
                      ? 'bg-[#3e6634] text-[#ffffff] font-bold shadow-2xs border border-[#2d4d25]'
                      : 'bg-[#ffffff] hover:bg-[#eef5ec] text-[#33522c] border border-[#a8c2a1]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>規則矛盾對照</span>
                </button>

                <button
                  onClick={() => {
                    sound.playPaper();
                    setActiveTab('evidence');
                  }}
                  className={`px-3 py-1 rounded-xs text-xs font-sans transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'evidence'
                      ? 'bg-[#3e6634] text-[#ffffff] font-bold shadow-2xs border border-[#2d4d25]'
                      : 'bg-[#ffffff] hover:bg-[#eef5ec] text-[#33522c] border border-[#a8c2a1]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>物證邏輯網</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                sound.playPaper();
                setActiveTab('hints');
              }}
              className={`px-3 py-1 rounded-xs text-xs font-sans transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'hints'
                  ? 'bg-[#3e6634] text-[#ffffff] font-bold shadow-2xs border border-[#2d4d25]'
                  : 'bg-[#ffffff] hover:bg-[#eef5ec] text-[#33522c] border border-[#a8c2a1]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>線索提示</span>
            </button>
          </div>

          {/* Right Action: Investigation Deduction Progress */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-[#ffffff] px-2.5 py-1 rounded-xs border border-[#a8c2a1] shadow-2xs">
              <span className="text-[11px] font-bold text-[#3c5535]">邏輯解析進度:</span>
              <div className="w-20 md:w-28 h-2 bg-[#e4efe0] rounded-xs overflow-hidden border border-[#a8c2a1]">
                <div 
                  className="h-full bg-gradient-to-r from-[#537e47] to-[#3e6634] transition-all duration-500"
                  style={{ width: `${deductionProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-[#1f4717]">{deductionProgress}%</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Core Hypotheses */}
        {activeTab === 'hypotheses' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 bg-[#f7faf5] min-h-0">
            {/* Left list of hypotheses */}
            <div className="md:col-span-5 space-y-2.5">
              <div className="text-xs font-bold text-[#1a3964] uppercase tracking-wider mb-2">
                {completedWeek1 ? '案件四大核心謎團 (CORE THEMES)' : '現場搜查核心疑點 (INVESTIGATION HYPOTHESES)'}
              </div>
              {activeHypotheses.map((hypo, idx) => {
                const unlocked = isHypoUnlocked(hypo);
                const isSelected = hypo.id === selectedHypothesisId;
                return (
                  <button
                    key={hypo.id}
                    onClick={() => {
                      sound.playPaper();
                      setSelectedHypothesisId(hypo.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-xs border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#eaf3e8] border-[#3e6634] ring-1 ring-[#3e6634] shadow-2xs text-[#1a3316]'
                        : 'bg-[#ffffff] border-[#a8c2a1] hover:bg-[#f4f8f2] text-[#222222]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#1a3964]">
                        {unlocked ? hypo.title : (completedWeek1 ? `【核心假說 ${idx + 1}】尚未解構` : `【搜查疑點 ${idx + 1}】尚未解明`)}
                      </span>
                      {unlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2e6d24] shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#555555] mt-1 line-clamp-2 leading-relaxed">
                      {unlocked 
                        ? hypo.summary 
                        : (completedWeek1 ? '需在現場搜集關鍵物證與規則後解鎖分析。' : '需在現場搜集關鍵物證後解鎖分析。')}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right Hypothesis Detail */}
            <div className="md:col-span-7 bg-[#ffffff] border border-[#a8c2a1] rounded-xs p-4 sm:p-5 space-y-4 shadow-2xs">
              {/* Dynamic Mind Web / Evidence Linking Visualizer */}
              <HypothesisLinkVisualizer
                hypothesis={selectedHypo}
                inventory={inventory}
                obtainedRules={obtainedRules}
                completedWeek1={completedWeek1}
                onEstablishThoughtLink={handleEstablishThoughtLink}
              />

              {isHypoUnlocked(selectedHypo) ? (
                <>
                  <div className="border-b border-[#c5d8c1] pb-3">
                    <div className="text-[10px] font-bold text-[#2e6d24] uppercase tracking-widest flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      <span>{completedWeek1 ? '已完全解構此推論 // VERIFIED HYPOTHESIS' : '已釐清現場搜查目標 // VERIFIED OBJECTIVE'}</span>
                    </div>
                    <h4 className="text-base font-bold text-[#1a3964] mt-1">
                      {selectedHypo.title}
                    </h4>
                  </div>

                  <div className="p-3.5 rounded-xs bg-[#eef5ec] border border-[#a8c2a1] text-xs text-[#24421e] leading-relaxed">
                    <span className="font-bold text-[#1f4717]">【核心洞察】</span> {selectedHypo.summary}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#333333]">
                      偵探完整分析紀錄：
                    </div>
                    <p className="text-xs md:text-sm text-[#222222] leading-relaxed whitespace-pre-line bg-[#fbfdfa] p-4 rounded-xs border border-[#c5d8c1]">
                      {selectedHypo.fullAnalysis}
                    </p>
                  </div>

                  <div className="p-3 rounded-xs bg-[#e5f0e1] border border-[#83ab79] text-xs text-[#1f4717] flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#2e6d24] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">【推論結論】: </span>
                      {selectedHypo.keyDeduction}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center space-y-3 bg-[#f7faf5] rounded-xs border border-[#c5d8c1] p-4">
                  <div className="w-10 h-10 rounded-full bg-[#ffffff] border border-[#a8c2a1] flex items-center justify-center mx-auto text-[#777777]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#333333]">
                    推論尚未解構（關鍵線索不足）
                  </h4>
                  <p className="text-xs text-[#b8502a] max-w-sm mx-auto font-mono">
                    【解鎖條件】：{selectedHypo.unlockHint}
                  </p>
                  <p className="text-[11px] text-[#666666] max-w-sm mx-auto">
                    上方思維鏈路顯示了當前收集進度。請在大樓各樓層、警衛室與房間進行實地勘查。
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Logic Contradiction Inspector (Interactive) */}
        {activeTab === 'inspector' && (
          !completedWeek1 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f7faf5] select-none min-h-[360px]">
              <div className="w-16 h-16 rounded-xs bg-[#ffffff] border border-[#a8c2a1] flex items-center justify-center text-[#4a723e] shadow-2xs mb-4">
                <Lock className="w-8 h-8 opacity-80" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-[#1a3964] mb-2">
                【邏輯矛盾檢查器・二周目解鎖】
              </h4>
              <p className="max-w-md text-xs sm:text-sm text-[#445544] leading-relaxed mb-4">
                當前第一輪調查目標為前往五樓 504 號房搜查生活跡證，確認失蹤者張浩的安危。
                <br className="hidden sm:inline" />
                大樓深層之規約悖論、真相碎片與認知解構功能將於第一輪破案結案後全面解鎖。
              </p>
              <div className="px-3 py-1.5 rounded-xs bg-[#ffffff] border border-[#a8c2a1] text-[11px] font-mono text-[#b8502a]">
                當前目標：搜查 504 號房，確認張浩下落。
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 bg-[#f7faf5] min-h-0">
              <LogicContradictionInspector
                obtainedRules={obtainedRules}
                san={san}
                onModifySan={onModifySan}
                onAddJournalEntry={onAddJournalEntry}
                currentLocationName={currentLocationName}
                unlockedTruthFragmentIds={unlockedTruthFragmentIds}
                onUnlockTruthFragment={handleUnlockTruthFragment}
                freeNotes={freeNotes}
                onAddFreeNote={onAddFreeNote}
                onUpdateFreeNoteColor={onUpdateFreeNoteColor}
                onDeleteFreeNote={onDeleteFreeNote}
                onEstablishThoughtLink={handleEstablishThoughtLink}
              />
            </div>
          )
        )}

        {/* Tab 2: Rule Contradictions */}
        {activeTab === 'contradictions' && (
          !completedWeek1 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f7faf5] select-none min-h-[360px]">
              <div className="w-16 h-16 rounded-xs bg-[#ffffff] border border-[#a8c2a1] flex items-center justify-center text-[#4a723e] shadow-2xs mb-4">
                <Lock className="w-8 h-8 opacity-80" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-[#1a3964] mb-2">
                【規則矛盾對照・二周目解鎖】
              </h4>
              <p className="max-w-md text-xs sm:text-sm text-[#445544] leading-relaxed mb-4">
                第一輪調查期間，請專注於搜集現場線索與五樓 504 號房的搜救任務。
                <br className="hidden sm:inline" />
                各方關係人與深層大樓規約之矛盾比對，將於第一輪結案後展開。
              </p>
              <div className="px-3 py-1.5 rounded-xs bg-[#ffffff] border border-[#a8c2a1] text-[11px] font-mono text-[#b8502a]">
                確認張浩下落並結案後解鎖規約矛盾比對。
              </div>
            </div>
          ) : (
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 bg-[#f7faf5] min-h-0">
            <div className="md:col-span-5 space-y-2.5">
              <div className="text-xs font-bold text-[#1a3964] uppercase tracking-wider mb-2">
                三大關鍵規則矛盾 (RULE CONTRADICTIONS)
              </div>
              {RULE_CONTRADICTIONS.map((contra, idx) => {
                const hasA = obtainedRules.includes(contra.ruleAId);
                const hasB = obtainedRules.includes(contra.ruleBId);
                const isFullyUnlocked = hasA && hasB;
                const isPartiallyUnlocked = hasA || hasB;
                const isSelected = contra.id === selectedContradictionId;

                return (
                  <button
                    key={contra.id}
                    onClick={() => {
                      sound.playPaper();
                      setSelectedContradictionId(contra.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-xs border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#fff8ea] border-[#d97706] ring-1 ring-[#d97706] shadow-2xs'
                        : 'bg-[#ffffff] border-[#a8c2a1] hover:bg-[#f4f8f2] text-[#222222]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#1a3964]">
                        {isFullyUnlocked 
                          ? contra.title 
                          : isPartiallyUnlocked 
                            ? `【部分掌握 ${idx + 1}】缺少對照規則` 
                            : `【未知矛盾 ${idx + 1}】尚未發現規約`}
                      </span>
                      {isFullyUnlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2e6d24] shrink-0" />
                      ) : isPartiallyUnlocked ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#555555] mt-1 leading-relaxed">
                      {isFullyUnlocked 
                        ? contra.clashSummary 
                        : isPartiallyUnlocked 
                          ? `已收錄單一規則，需在現場搜集另一份對應規約進行交叉比對。`
                          : `尚未在現場發現相關規約。`}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Contradiction Detail */}
            <div className="md:col-span-7 bg-[#ffffff] border border-[#a8c2a1] rounded-xs p-5 space-y-4 shadow-2xs">
              {(() => {
                const hasA = obtainedRules.includes(selectedContra.ruleAId);
                const hasB = obtainedRules.includes(selectedContra.ruleBId);
                const isFullyUnlocked = hasA && hasB;
                const isPartiallyUnlocked = hasA || hasB;

                if (isFullyUnlocked) {
                  return (
                    <>
                      <div className="border-b border-[#c5d8c1] pb-3">
                        <div className="text-[10px] font-bold text-[#b8502a] uppercase tracking-widest">
                          RULE CROSS-EXAMINATION // 規約衝突解析
                        </div>
                        <h4 className="text-base font-bold text-[#1a3964] mt-1">
                          {selectedContra.title}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-bold text-[#333333]">
                          【具體衝突條款】:
                        </span>
                        <div className="p-3.5 rounded-xs bg-[#fdf2f2] border border-[#f5c2c7] text-xs text-[#721c24] leading-relaxed whitespace-pre-line">
                          {selectedContra.pointOfContradiction}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-bold text-[#333333]">
                          【偵探交叉剖析】:
                        </span>
                        <div className="p-3.5 rounded-xs bg-[#f7faf5] border border-[#c5d8c1] text-xs text-[#222222] leading-relaxed">
                          {selectedContra.detectiveInsight}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xs bg-[#e5f0e1] border border-[#83ab79] text-xs text-[#1f4717] flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-[#2e6d24] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">【揭露之客觀真相】: </span>
                          {selectedContra.truthRevealed}
                        </div>
                      </div>

                      {/* Interactive Pinpoint Contradiction Challenge Button */}
                      <div className="pt-2">
                        {pinpointedContradictions.includes(selectedContra.id) ? (
                          <div className="p-3 rounded-xs bg-[#eef5ec] border border-[#83ab79] text-[#1f4717] text-xs flex items-center justify-between shadow-2xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#2e6d24] shrink-0" />
                              <span className="font-bold">【已完成邏輯指證】認知幻覺已被擊碎，思緒已貫通！</span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#ffffff] border border-[#83ab79]">
                              精神已平復
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              sound.playContradictionBreakthrough();
                              setPinpointedContradictions(prev => [...prev, selectedContra.id]);
                              setBreakthroughEffect(selectedContra.id);
                              onModifySan?.(4);
                              onAddJournalEntry?.({
                                category: 'action',
                                title: `邏輯突破：指證【${selectedContra.title}】之衝突！`,
                                content: `在推理板上成功完成了規則矛盾指證：${selectedContra.pointOfContradiction} ── 證實：${selectedContra.truthRevealed}`,
                                location: currentLocationName,
                                sanDelta: 4
                              });
                              setTimeout(() => setBreakthroughEffect(null), 2500);
                            }}
                            className="w-full py-2.5 px-4 rounded-xs bg-[#3e6634] hover:bg-[#33552a] text-[#ffffff] font-bold text-xs sm:text-sm font-sans flex items-center justify-center gap-2 shadow-2xs transition-all border border-[#2d4d25] cursor-pointer"
                          >
                            <Brain className="w-4 h-4 text-[#ffffff]" />
                            <span>發動邏輯指證：擊碎認知遮蔽（精神平復）</span>
                            <Sparkles className="w-4 h-4 text-[#ffffff]" />
                          </button>
                        )}

                        {breakthroughEffect === selectedContra.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 p-2.5 rounded-xs bg-[#fff8ea] border border-[#d97706] text-[#b45309] text-xs text-center font-bold shadow-2xs"
                          >
                            ✨ 邏輯思維瞬間貫通！你以客觀事實駁斥了虛構認知，心智獲得穩固支撐！
                          </motion.div>
                        )}
                      </div>
                    </>
                  );
                } else if (isPartiallyUnlocked) {
                  return (
                    <div className="py-14 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#fff8ea] border border-[#f59e0b] flex items-center justify-center mx-auto text-[#d97706]">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[#1a3964]">
                        規約矛盾對照未完全解鎖
                      </h4>
                      <p className="text-xs text-[#555555] max-w-sm mx-auto">
                        已收錄部分規則，但尚缺少另一份關鍵規約。
                      </p>
                      <p className="text-[11px] text-[#b8502a] font-mono">
                        需在大樓現場同時搜集兩份規則，才能在推理板進行邏輯交叉比對。
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div className="py-14 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#ffffff] border border-[#a8c2a1] flex items-center justify-center mx-auto text-[#777777]">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[#333333]">
                        尚未探索到相關規則
                      </h4>
                      <p className="text-xs text-[#666666] max-w-sm mx-auto">
                        請在大樓一樓大廳、二樓、三樓、五樓及警衛室調查尋找規則手冊。
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
          )
        )}

        {/* Tab 3: Evidence Network */}
        {activeTab === 'evidence' && (
          !completedWeek1 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f7faf5] select-none min-h-[360px]">
              <div className="w-16 h-16 rounded-xs bg-[#ffffff] border border-[#a8c2a1] flex items-center justify-center text-[#4a723e] shadow-2xs mb-4">
                <Lock className="w-8 h-8 opacity-80" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-[#1a3964] mb-2">
                【物證邏輯網・二周目解鎖】
              </h4>
              <p className="max-w-md text-xs sm:text-sm text-[#445544] leading-relaxed mb-4">
                第一輪調查期間，物證檔案以 504 號房現場搜查跡證為主。
                <br className="hidden sm:inline" />
                大樓深層之客觀物證網絡將於失聯調查結案後的後續深入章節展開。
              </p>
              <div className="px-3 py-1.5 rounded-xs bg-[#ffffff] border border-[#a8c2a1] text-[11px] font-mono text-[#b8502a]">
                完成失蹤者張浩現場搜查後解鎖物證網絡。
              </div>
            </div>
          ) : (
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-4 bg-[#f7faf5] min-h-0">
            <div className="text-xs font-bold text-[#1a3964] uppercase tracking-wider">
              物證如何擊碎「404號房」的認知幻覺 (EVIDENCE CONNECTIONS)
            </div>

            {inventory.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-[#ffffff] rounded-xs border border-[#a8c2a1] shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-[#f7faf5] border border-[#a8c2a1] flex items-center justify-center mx-auto text-[#777777]">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#333333]">
                  物證檔案袋暫無關鍵物件
                </h4>
                <p className="text-xs text-[#666666] max-w-sm mx-auto">
                  請在大樓各樓層搜查以獲取關鍵物證（如鑰匙、違建藍圖、碎紙信件、錄音筆等）。
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(EVIDENCE_NETWORK).map((itemId) => {
                  const link = EVIDENCE_NETWORK[itemId];
                  const itemInfo = INVENTORY_ITEMS[itemId];
                  const isPossessed = inventory.includes(itemId);

                  if (!isPossessed) return null; // Only show discovered items

                  return (
                    <div
                      key={itemId}
                      className="p-4 rounded-xs border bg-[#ffffff] border-[#a8c2a1] shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-[#c5d8c1] pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-xs border bg-[#eef5ec] border-[#a8c2a1] text-[#2e6d24]">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-xs md:text-sm text-[#1a3964]">
                            {itemInfo?.name || itemId}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#eef5ec] text-[#2e6d24] border border-[#a8c2a1]">
                          已歸檔證物
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-[#333333] leading-relaxed">
                        <div>
                          <span className="text-[#b8502a] font-bold">關聯真相：</span>
                          {link.relevanceTo404}
                        </div>
                        <div>
                          <span className="text-[#1a3964] font-bold">解析洞察：</span>
                          {link.keyInsight}
                        </div>
                        <div className="text-[11px] text-[#1f4717] bg-[#eef5ec] p-2 rounded-xs border border-[#a8c2a1]">
                          ★ {link.revealedParadox}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )
        )}

        {/* Tab 4: Investigation Clue Hints */}
        {activeTab === 'hints' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4 bg-[#f7faf5] min-h-0">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#1a3964] uppercase tracking-wider">
                偵探調查備忘與環境提示 (INVESTIGATION HINTS)
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-xs font-mono border ${
                currentHintData.isOffice 
                  ? 'bg-[#eef5ec] border-[#83ab79] text-[#1f4717]' 
                  : 'bg-[#fff8ea] border-[#c5d8c1] text-[#2d4d25]'
              }`}>
                {currentHintData.isOffice 
                  ? (completedWeek1 ? '★ 事務所安全推演' : '★ 事務所搜查規劃') 
                  : (completedWeek1 ? '大樓現場即時推演' : '現場搜查備忘')}
              </span>
            </div>

            <div className="space-y-4">
              {/* Card 1: Current Environment Status */}
              <div className="border border-[#a8c2a1] rounded-xs p-4 sm:p-5 space-y-3.5 bg-[#ffffff] shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#c5d8c1] pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-xs border ${
                      currentHintData.isOffice
                        ? 'bg-[#eef5ec] border-[#83ab79] text-[#1f4717]'
                        : 'bg-[#f7faf5] border-[#a8c2a1] text-[#2e6d24]'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[#556652] uppercase tracking-wider">
                        當前所在環境
                      </div>
                      <h4 className="text-sm md:text-base font-bold text-[#1a3964]">
                        【{currentHintData.locationLabel}】
                      </h4>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-xs font-mono border ${
                    currentHintData.isOffice
                      ? 'bg-[#eef5ec] text-[#1f4717] border-[#83ab79]'
                      : 'bg-[#f7faf5] text-[#2e6d24] border-[#a8c2a1]'
                  }`}>
                    {currentHintData.isOffice ? '安全環境' : (completedWeek1 ? '現場勘查' : '調查現場')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xs bg-[#f7faf5] border border-[#c5d8c1] text-xs md:text-sm text-[#222222] leading-relaxed">
                  <span className={currentHintData.isOffice ? 'text-[#1f4717] font-bold' : 'text-[#b8502a] font-bold'}>
                    {currentHintData.isOffice ? '深思結論：' : '直覺感應：'}
                  </span>
                  {currentHintData.mainHint}
                </div>

                {currentHintData.envDetail && (
                  <p className="text-xs text-[#556652] leading-relaxed px-1 font-serif">
                    {currentHintData.envDetail}
                  </p>
                )}
              </div>

              {/* Office-Only Deep Investigation Checklist & Focus */}
              {currentHintData.isOffice && (
                <div className="bg-[#ffffff] border border-[#83ab79] rounded-xs p-4 sm:p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#c5d8c1] pb-2">
                    <h4 className="text-xs font-bold text-[#1f4717] uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#2e6d24]" />
                      <span>事務所深度搜查策略清單 (SAFE ZONE DEDUCTION)</span>
                    </h4>
                    <span className="text-[10px] text-[#556652] font-mono">
                      思緒清晰度 100%
                    </span>
                  </div>

                  {currentHintData.safeOfficeDeductionFocus && (
                    <div className="p-3 rounded-xs bg-[#eef5ec] border border-[#a8c2a1] text-xs text-[#1f4717] leading-relaxed">
                      <span className="font-bold text-[#1a4b2a]">當前推演重點：</span>
                      {currentHintData.safeOfficeDeductionFocus}
                    </div>
                  )}

                  {currentHintData.safeOfficeChecklist.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-[#445544]">
                        推薦調查步驟：
                      </div>
                      <div className="space-y-1.5">
                        {currentHintData.safeOfficeChecklist.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-start gap-2 p-2.5 rounded-xs bg-[#f7faf5] border border-[#c5d8c1] text-xs text-[#222222]"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#2e6d24] text-[#ffffff] flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5 font-bold">
                              {sIdx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Card 2: Held Items Status Assessment */}
              <div className="bg-[#ffffff] border border-[#a8c2a1] rounded-xs p-4 sm:p-5 space-y-3 shadow-2xs">
                <h4 className="text-xs font-bold text-[#1a3964] uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#3e6634]" />
                  <span>手上證物狀態評估 ({inventory.length} 件)</span>
                </h4>

                {currentHintData.heldNotes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentHintData.heldNotes.map((note, idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-xs bg-[#f7faf5] border border-[#c5d8c1] text-xs space-y-1"
                      >
                        <div className="font-bold text-[#1a3964] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2e6d24]" />
                          <span>{note.itemTitle}</span>
                        </div>
                        <p className="text-[11px] text-[#555555] leading-relaxed">
                          {note.note}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#777777] p-3 bg-[#f7faf5] rounded-xs border border-[#c5d8c1]">
                    隨身公事包中目前僅有標準偵探工具，尚未在現場取得特殊物證。
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-2.5 border-t border-[#a8c2a1] bg-[#e8f0e5] text-center text-xs font-sans text-[#445544]">
          {completedWeek1
            ? '邏輯與理性是抵抗認知侵蝕的最強武器 • 比對物證與規則破綻以瓦解虛妄'
            : '縝密觀察與冷靜推論是破案的最強武器 • 收集更多現場物證以推進搜查進度'}
        </div>

        {/* Thought Link Breakthrough Toast */}
        <AnimatePresence>
          {thoughtLinkToast && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg bg-neutral-950/95 border-2 border-purple-500 rounded-2xl p-4 shadow-[0_0_30px_rgba(168,85,247,0.4)] backdrop-blur-xl flex items-start gap-3.5 text-neutral-100"
            >
              <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-500 text-purple-300 shadow-md shrink-0">
                <Sparkles className="w-5 h-5 text-purple-300 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>思維關聯成功建立 // THOUGHT LINK ESTABLISHED</span>
                  </span>
                  <button
                    onClick={() => setThoughtLinkToast(null)}
                    className="text-neutral-400 hover:text-neutral-200 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-bold font-serif text-amber-300">
                  {thoughtLinkToast.deductionTitle}
                </h4>
                <div className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2 py-1 rounded border border-purple-800/60">
                  【{thoughtLinkToast.clueA}】 ✕ 【{thoughtLinkToast.clueB}】
                </div>
                <p className="text-xs text-neutral-300 font-serif leading-relaxed line-clamp-2">
                  {thoughtLinkToast.insight}
                </p>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 pt-0.5">
                  <Check className="w-3 h-3" />
                  <span>已自動於偵探手記套用【已解開疑點】暗紫標籤</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
