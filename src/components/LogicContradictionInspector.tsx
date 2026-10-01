import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Brain,
  CheckCircle2,
  Lock,
  Sparkles,
  Skull,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  BookOpen,
  Quote,
  PenTool,
  Plus,
  Trash2,
  Tag,
  Check,
  Radio,
  AlertOctagon,
  X
} from 'lucide-react';
import { 
  RULE_CONTRADICTIONS, TRUTH_FRAGMENTS, DELIRIUM_WHISPERS, 
  TruthFragment, RuleContradictionPair 
} from '../data/deductionData';
import { RULES_DATA } from '../data/rulesData';
import { sound } from '../services/soundEngine';
import { FreeNote, NoteColorTheme } from '../types';

interface AnomalyToastData {
  id: string;
  glitchCode: string;
  tag: string;
  rawText: string;
  displayText: string;
  posStyle: React.CSSProperties;
}

const ANOMALY_CORRUPTED_WHISPERS = [
  {
    raw: "「這不是真的……這不是真的……」",
    glitchCode: "0x404_MIND_CORRUPTION",
    tag: "COGNITIVE_FAULT"
  },
  {
    raw: "「你被盯上了……它正貼在你的後頸呼吸……」",
    glitchCode: "0x88_RED_ENTITY_DETECTED",
    tag: "ENTITY_GAZE"
  },
  {
    raw: "「§̸Ø̵R̶R̴Ø̶R̴_404: 你的眼睛背叛了你……」",
    glitchCode: "0xDEAD_OPTIC_OVERRIDE",
    tag: "OPTIC_PARADOX"
  },
  {
    raw: "「別信那份守則……快逃……」",
    glitchCode: "0x13_RULE_FABRICATION",
    tag: "RULE_TAMPERED"
  },
  {
    raw: "「不要回頭。它就在你身後0.5公分處。」",
    glitchCode: "0x66_PROXIMITY_ALERT",
    tag: "BEHIND_YOU"
  },
  {
    raw: "「聽見敲門聲了嗎？三長兩短……咚、咚、咚……」",
    glitchCode: "0x404_DOOR_KNOCK_LOOP",
    tag: "AUDITORY_HALLUCINATION"
  },
  {
    raw: "「【警告】你以為你還在安祥路88號嗎？」",
    glitchCode: "0x00_DIMENSIONAL_SHIFT",
    tag: "REALITY_DISTORTION"
  },
  {
    raw: "「▓▓▒▒░░ 你的名字已被刻在404的門牌上 ░░▒▒▓▓」",
    glitchCode: "0xFF_ENGRAVED_FATE",
    tag: "SANITY_COLLAPSE"
  }
];

interface LogicContradictionInspectorProps {
  obtainedRules: string[];
  san: number;
  onModifySan?: (delta: number) => void;
  onAddJournalEntry?: (entry: {
    category: 'system' | 'action' | 'dialogue';
    title: string;
    content: string;
    location?: string;
    sanDelta?: number;
    highlightBadge?: string;
  }) => void;
  currentLocationName?: string;
  unlockedTruthFragmentIds: string[];
  onUnlockTruthFragment: (fragmentId: string) => void;
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
  onEstablishThoughtLink?: (clueA: string, clueB: string, deductionTitle: string, insightText: string) => void;
}

export const LogicContradictionInspector: React.FC<LogicContradictionInspectorProps> = ({
  obtainedRules,
  san,
  onModifySan,
  onAddJournalEntry,
  currentLocationName = '安祥路88號大樓',
  unlockedTruthFragmentIds,
  onUnlockTruthFragment,
  freeNotes = [],
  onAddFreeNote,
  onUpdateFreeNoteColor,
  onDeleteFreeNote,
  onEstablishThoughtLink
}) => {
  // Available rules collected by player
  const availableRules = useMemo(() => {
    return obtainedRules
      .map(id => RULES_DATA[id])
      .filter(Boolean);
  }, [obtainedRules]);

  // Selected Rule A and Rule B
  const [selectedRuleAId, setSelectedRuleAId] = useState<string>(
    availableRules[0]?.id || ''
  );
  const [selectedRuleBId, setSelectedRuleBId] = useState<string>(
    availableRules.length > 1 ? availableRules[1]?.id : (availableRules[0]?.id || '')
  );

  // Selected Clause highlights
  const [selectedClauseAIndex, setSelectedClauseAIndex] = useState<number | null>(null);
  const [selectedClauseBIndex, setSelectedClauseBIndex] = useState<number | null>(null);

  // Quick notes in inspector
  const [quickNoteText, setQuickNoteText] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('邏輯衝突');
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(true);

  // Feedback State
  const [isDeliriumGlitching, setIsDeliriumGlitching] = useState<boolean>(false);
  const [deliriumMessage, setDeliriumMessage] = useState<string | null>(null);
  const [breakthroughData, setBreakthroughData] = useState<{
    fragment: TruthFragment;
    pair: RuleContradictionPair;
    isNew: boolean;
  } | null>(null);

  // Active fragment detail modal
  const [inspectingFragment, setInspectingFragment] = useState<TruthFragment | null>(null);

  // Transient Anomaly Micro-Toast & Operation Interference State
  const [anomalyToast, setAnomalyToast] = useState<AnomalyToastData | null>(null);
  const [isInterferenceLocked, setIsInterferenceLocked] = useState<boolean>(false);
  const [isToastShaking, setIsToastShaking] = useState<boolean>(false);

  // Active timers tracking for safe unmounting
  const activeTimersRef = useRef<(NodeJS.Timeout | number)[]>([]);

  const registerTimer = (timer: NodeJS.Timeout | number) => {
    activeTimersRef.current.push(timer);
    return timer;
  };

  const clearAllTimers = () => {
    activeTimersRef.current.forEach(t => clearTimeout(t as any));
    activeTimersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  const dismissAnomalyInterference = () => {
    sound.playGlitch();
    setAnomalyToast(null);
    setIsInterferenceLocked(false);
    setIsToastShaking(false);
  };

  const isRequirementMet = obtainedRules.length >= 3;

  const ruleA = RULES_DATA[selectedRuleAId];
  const ruleB = RULES_DATA[selectedRuleBId];

  const quickTags = ['邏輯衝突', '條款疑點', '空間悖論', '疑似偽造', '紅衣人', '物證關聯'];

  const handleQuickInsertClause = (clauseText: string, ruleTitle: string) => {
    sound.playTypewriter();
    const snippet = `【${ruleTitle}】「${clauseText}」`;
    setQuickNoteText(prev => (prev ? `${prev}\n${snippet}` : snippet));
  };

  const handleAddNoteSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickNoteText.trim()) return;
    onAddFreeNote?.(quickNoteText.trim(), 'rule', [selectedTag], 'crimson', selectedTag);
    setQuickNoteText('');
  };

  // Helper to check if current pairing is valid in predefined contradiction set
  const checkContradiction = () => {
    if (!ruleA || !ruleB || ruleA.id === ruleB.id) {
      sound.playGlitch();
      return;
    }

    sound.playPaper();

    // Check match against RULE_CONTRADICTIONS
    const matchedPair = RULE_CONTRADICTIONS.find(pair => 
      (pair.ruleAId === ruleA.id && pair.ruleBId === ruleB.id) ||
      (pair.ruleAId === ruleB.id && pair.ruleBId === ruleA.id)
    );

    if (matchedPair && matchedPair.fragmentId && TRUTH_FRAGMENTS[matchedPair.fragmentId]) {
      // SUCCESS: Correct Contradiction Verified!
      const fragment = TRUTH_FRAGMENTS[matchedPair.fragmentId];
      const isAlreadyUnlocked = unlockedTruthFragmentIds.includes(fragment.id);

      sound.playContradictionBreakthrough();

      if (!isAlreadyUnlocked) {
        onUnlockTruthFragment(fragment.id);
        const sanReward = matchedPair.sanReward || fragment.sanReward || 4;
        onModifySan?.(sanReward);

        onAddJournalEntry?.({
          category: 'action',
          title: `【邏輯辨析】成功指證矛盾：${matchedPair.title}`,
          content: `在邏輯矛盾檢查器中成功比對【${ruleA.title}】與【${ruleB.title}】的致命衝突！\n${matchedPair.pointOfContradiction}\n★ 關鍵真相：${matchedPair.truthRevealed}`,
          location: currentLocationName,
          sanDelta: sanReward
        });
      }

      // Establish thought link & apply purple '已解開疑點' tag to detective notes
      onEstablishThoughtLink?.(
        ruleA.title,
        ruleB.title,
        matchedPair.title,
        matchedPair.truthRevealed
      );

      setBreakthroughData({
        fragment,
        pair: matchedPair,
        isNew: !isAlreadyUnlocked
      });
    } else {
      // FAILURE: Delirium / Wrong Pair Penalty
      sound.playGlitch();
      sound.playHallucinationWhisper();

      const penalty = 5;
      onModifySan?.(-penalty);

      const randomWhisper = DELIRIUM_WHISPERS[Math.floor(Math.random() * DELIRIUM_WHISPERS.length)];
      setDeliriumMessage(randomWhisper);
      setIsDeliriumGlitching(true);

      onAddJournalEntry?.({
        category: 'system',
        title: `【認知逆流・精神錯亂】矛盾指證失誤`,
        content: `在邏輯矛盾檢查器中誤將【${ruleA.title}】與【${ruleB.title}】判定為衝突。無效的邏輯強行拼湊引發精神反噬，精神受到衝擊。耳旁響起怪異的冷酷低語……`,
        location: currentLocationName,
        sanDelta: -penalty
      });

      // Clear standard delirium overlay after 2.6 seconds
      registerTimer(
        setTimeout(() => {
          setIsDeliriumGlitching(false);
        }, 2600)
      );

      // Low-probability trigger for the Transient Anomaly Micro-Toast (微型浮窗與操作干擾)
      if (Math.random() < 0.45) {
        const chosen = ANOMALY_CORRUPTED_WHISPERS[Math.floor(Math.random() * ANOMALY_CORRUPTED_WHISPERS.length)];
        const toastId = `anomaly_${Date.now()}`;
        
        // Random floating offsets in the viewport
        const positions: React.CSSProperties[] = [
          { top: '15%', right: '5%', transform: 'rotate(-1.2deg)' },
          { top: '38%', left: '6%', transform: 'rotate(1.2deg)' },
          { bottom: '22%', right: '6%', transform: 'rotate(-1.5deg)' },
          { top: '24%', left: '50%', transform: 'translateX(-50%) rotate(0.6deg)' },
          { bottom: '30%', left: '8%', transform: 'rotate(-1.0deg)' }
        ];
        const posStyle = positions[Math.floor(Math.random() * positions.length)];

        setIsInterferenceLocked(true);
        setIsToastShaking(true);
        sound.playTinnitus();

        const newToast: AnomalyToastData = {
          id: toastId,
          glitchCode: chosen.glitchCode,
          tag: chosen.tag,
          rawText: chosen.raw,
          displayText: '§̷̸0x404_NULL_▓▓▒▒░░',
          posStyle
        };
        setAnomalyToast(newToast);

        // Scramble decoding effect for ~800ms
        let step = 0;
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:<>?/~`§±×÷█▓▒░';
        const scrambleInterval = registerTimer(
          setInterval(() => {
            step++;
            const scrambled = chosen.raw
              .split('')
              .map((c) => (Math.random() < 0.4 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : c))
              .join('');

            setAnomalyToast(prev => (prev && prev.id === toastId ? { ...prev, displayText: scrambled } : null));

            if (step >= 8) {
              clearInterval(scrambleInterval as any);
              setAnomalyToast(prev => (prev && prev.id === toastId ? { ...prev, displayText: chosen.raw } : null));
            }
          }, 85)
        );

        // Brief shake effect
        registerTimer(setTimeout(() => setIsToastShaking(false), 450));

        // Release temporary operation interference lock after 1.8s
        registerTimer(
          setTimeout(() => {
            setIsInterferenceLocked(false);
          }, 1800)
        );

        // Auto-dismiss anomaly toast after 3.8s
        registerTimer(
          setTimeout(() => {
            setAnomalyToast(prev => (prev?.id === toastId ? null : prev));
          }, 3800)
        );
      }
    }
  };

  // Check if current selected pair is already unlocked
  const isCurrentPairAlreadyUnlocked = useMemo(() => {
    if (!ruleA || !ruleB) return false;
    const pair = RULE_CONTRADICTIONS.find(p => 
      (p.ruleAId === ruleA.id && p.ruleBId === ruleB.id) ||
      (p.ruleAId === ruleB.id && p.ruleBId === ruleA.id)
    );
    return pair && pair.fragmentId && unlockedTruthFragmentIds.includes(pair.fragmentId);
  }, [ruleA, ruleB, unlockedTruthFragmentIds]);

  return (
    <div className={`space-y-6 relative ${isToastShaking ? 'animate-[wiggle_0.2s_ease-in-out_infinite]' : ''}`}>
      {/* Transient Anomaly Micro-Toast (低機率微型浮窗・低語亂碼干擾) */}
      <AnimatePresence>
        {anomalyToast && (
          <motion.div
            key={anomalyToast.id}
            initial={{ opacity: 0, scale: 0.85, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
            style={anomalyToast.posStyle}
            className="fixed md:absolute z-50 max-w-sm w-[90vw] md:w-96 rounded-xl bg-neutral-950/95 border-2 border-red-500/90 p-3.5 shadow-2xl shadow-red-950/90 backdrop-blur-md overflow-hidden text-left pointer-events-auto"
          >
            {/* Analog horror scanlines simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(#ff0000_1px,transparent_1px)] [background-size:12px_12px] opacity-30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-black/40 pointer-events-none animate-pulse" />

            <div className="relative z-10 space-y-2.5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-red-900/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded bg-red-950 border border-red-600 text-red-400 animate-pulse">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
                    {anomalyToast.glitchCode}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-900/60 border border-red-700/80 text-red-200 font-mono">
                    #{anomalyToast.tag}
                  </span>
                </div>

                <button
                  onClick={dismissAnomalyInterference}
                  className="p-1 rounded text-red-400 hover:text-red-100 hover:bg-red-900/50 transition-colors"
                  title="強制關閉干擾"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Garbled Whisper Body */}
              <div className="p-2.5 rounded-lg bg-black/90 border border-red-900/90 shadow-inner">
                <div className="text-xs md:text-sm font-serif font-bold text-red-200 tracking-wide leading-relaxed drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] select-none">
                  {anomalyToast.displayText}
                </div>
              </div>

              {/* Status footer with transient decay progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-red-400/90">
                  <span className="flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3 text-red-500 animate-bounce" />
                    <span>【精神侵蝕・操作短暫受阻】</span>
                  </span>
                  <span className="text-[9px] text-red-400/70">TRANSIENT_ANOMALY</span>
                </div>
                {/* Progress bar decaying */}
                <div className="w-full h-1 bg-red-950 rounded-full overflow-hidden border border-red-900/50">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 3.8, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_6px_#ef4444]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ephemeral Interaction Interference Overlay */}
      <AnimatePresence>
        {isInterferenceLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissAnomalyInterference}
            className="absolute inset-0 z-30 bg-red-950/15 backdrop-blur-[1px] rounded-2xl flex items-center justify-center cursor-pointer border border-red-500/20 pointer-events-auto"
            title="凝聚精神驅散干擾"
          >
            <div className="px-3.5 py-2 rounded-lg bg-black/90 border border-red-600 text-red-300 text-xs font-serif font-bold flex items-center gap-2.5 shadow-2xl animate-pulse">
              <ShieldAlert className="w-4 h-4 text-red-400 animate-spin" />
              <span>意識受到未名低語擾動……凝神抵抗干擾</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delirium / Hallucination Glitch Overlay */}
      <AnimatePresence>
        {isDeliriumGlitching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute inset-0 z-40 rounded-2xl bg-red-950/95 border-2 border-red-500/90 p-6 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-md overflow-hidden"
          >
            {/* Scanlines / Noise simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(#ff0000_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none animate-pulse" />
            
            <div className="relative z-10 space-y-4 max-w-lg">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-900/80 border border-red-500 text-red-300 animate-bounce">
                <Skull className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <div className="text-xs font-mono text-red-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>COGNITIVE DELIRIUM // 精神錯亂・邏輯逆流</span>
                </div>
                <h4 className="text-lg md:text-xl font-bold font-serif text-red-100">
                  【邏輯判定失誤：非衝突規約】
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-black/80 border border-red-800/80 text-red-200 font-serif italic text-sm md:text-base leading-relaxed shadow-inner">
                {deliriumMessage || '「這兩份規則根本沒有衝突……你的神智正在被虛無的妄想吞噬……」'}
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-900/60 border border-red-700 text-red-300 text-xs font-mono">
                <span>⚠ 心理承受力嚴重折損: -5</span>
                <span>(幻聽干擾中...)</span>
              </div>

              <p className="text-[11px] text-red-400/80 font-mono">
                須謹慎比對各方發行單位、樓層宣告與動線指示之客觀邏輯破綻。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breakthrough / Truth Fragment Modal Popup */}
      <AnimatePresence>
        {breakthroughData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-neutral-950 border-2 border-amber-500/90 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl shadow-amber-950/80 relative">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-950 border border-amber-500 text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                      LOGIC BREAKTHROUGH // 邏輯思維突破
                    </div>
                    <h3 className="text-base md:text-lg font-bold font-serif text-neutral-100">
                      {breakthroughData.fragment.title}
                    </h3>
                  </div>
                </div>
                {breakthroughData.isNew ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono font-bold animate-pulse">
                    心神稍微平復
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-400 font-mono">
                    已收錄檔案
                  </span>
                )}
              </div>

              <div className="space-y-3 text-xs md:text-sm font-serif">
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 space-y-1">
                  <div className="font-bold text-amber-300 text-xs font-mono uppercase tracking-wider">
                    【核心衝突悖論】:
                  </div>
                  <p className="leading-relaxed">
                    {breakthroughData.fragment.coreParadox}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 space-y-1">
                  <div className="font-bold text-emerald-400 text-xs font-mono uppercase tracking-wider">
                    【揭露之客觀真相】:
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">
                    {breakthroughData.fragment.truthRevelation}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 text-neutral-400 italic text-xs flex items-start gap-2">
                  <Quote className="w-4 h-4 text-amber-400/70 shrink-0 mt-0.5" />
                  <span>{breakthroughData.fragment.detectiveQuote}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                <span className="text-[11px] font-mono text-neutral-500">
                  真相碎片已自動收錄至【真相檔案庫】
                </span>
                <button
                  onClick={() => {
                    sound.playClick();
                    setBreakthroughData(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold font-serif text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all active:scale-95"
                >
                  <span>收納碎片並繼續推演</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Requirement Lock Banner (if < 3 rules) */}
      {!isRequirementMet ? (
        <div className="p-8 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold font-serif text-neutral-200">
              邏輯矛盾檢查器
            </h4>
            <p className="text-xs text-amber-400 font-mono">
              【啟動條件】：需搜集至少 3 份以上不同來源的大樓守則（進度：{obtainedRules.length}/3）
            </p>
          </div>
          <p className="text-xs text-neutral-400 max-w-md mx-auto font-serif leading-relaxed">
            單一守則難以進行交叉驗證。請持續探索大樓各處搜集更多規約手冊。
          </p>
        </div>
      ) : (
        <>
          {/* Active Status Banner */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/50 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-900/80 border border-indigo-400 text-indigo-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold font-serif text-neutral-100">
                    交互式邏輯衝突比對中樞 (LOGIC CONFLICT INSPECTOR)
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono">
                    系統已就緒
                  </span>
                </div>
                <p className="text-xs text-neutral-300 font-serif">
                  從手中搜集的規約中挑選兩份進行矛盾指證。正確可解鎖真相碎片並恢復理智；妄想誤判將引發精神逆流。
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-mono text-neutral-400">已破解真相碎片</div>
                <div className="text-xs font-bold font-mono text-amber-400">
                  {unlockedTruthFragmentIds.length} / {Object.keys(TRUTH_FRAGMENTS).length}
                </div>
              </div>
              <div className="text-right border-l border-neutral-800 pl-3">
                <div className="text-[10px] font-mono text-neutral-400">當前心理狀態</div>
                <div className={`text-xs font-bold font-mono ${san <= 35 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {san >= 70 ? '理智冷靜' : san >= 40 ? '精神緊繃' : '瀕臨崩潰'}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Dual Rule Comparison Deck */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Rule A */}
            <div className="lg:col-span-5 bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-500 text-indigo-300 flex items-center justify-center text-xs font-mono font-bold">
                    A
                  </span>
                  <span className="text-xs font-bold font-serif text-neutral-200">
                    第一份比對規約 (RULE A)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  {availableRules.length} 份可用
                </span>
              </div>

              {/* Selector Tabs for Rule A */}
              <div className="flex flex-wrap gap-1.5">
                {availableRules.map((rule) => {
                  const isSelected = rule.id === selectedRuleAId;
                  const isSameAsB = rule.id === selectedRuleBId;
                  return (
                    <button
                      key={rule.id}
                      onClick={() => {
                        sound.playPaper();
                        setSelectedRuleAId(rule.id);
                        setSelectedClauseAIndex(null);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-serif transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-md'
                          : isSameAsB
                            ? 'bg-neutral-900/60 text-neutral-500 border border-neutral-800'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                      }`}
                    >
                      {rule.title}
                    </button>
                  );
                })}
              </div>

              {/* Rule A Content Deck */}
              {ruleA ? (
                <div className="space-y-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-neutral-900/70 border border-neutral-800 space-y-0.5">
                    <div className="text-xs font-bold font-serif text-amber-300 flex items-center justify-between">
                      <span>{ruleA.title}</span>
                      {ruleA.isFake && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 border border-red-700 text-red-300 font-mono">
                          偽造公約
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-serif">
                      來源: {ruleA.source} ({ruleA.obtainedAt})
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase flex items-center justify-between">
                      <span>條款清單：</span>
                    </div>
                    {ruleA.content.map((clause, idx) => {
                      const isHighlighted = selectedClauseAIndex === idx;
                      return (
                        <div key={idx} className="space-y-1">
                          <button
                            onClick={() => {
                              sound.playClick();
                              setSelectedClauseAIndex(isHighlighted ? null : idx);
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs font-serif leading-relaxed transition-all ${
                              isHighlighted
                                ? 'bg-indigo-950/80 border border-indigo-400 text-indigo-100 shadow-sm'
                                : 'bg-neutral-900/40 hover:bg-neutral-900 text-neutral-300 border border-neutral-800/60'
                            }`}
                          >
                            {clause}
                          </button>
                          {isHighlighted && (
                            <div className="flex justify-end px-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickInsertClause(clause, ruleA.title);
                                }}
                                className="text-[10px] px-2 py-0.5 rounded bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-600 flex items-center gap-1 font-serif transition-colors"
                              >
                                <Quote className="w-2.5 h-2.5" />
                                <span>引用至速記</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500 font-serif">
                  請先選擇一份守則
                </div>
              )}
            </div>

            {/* Middle Action / Collision Nexus */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-3 py-2">
              <div className="p-3 rounded-full bg-neutral-950 border border-neutral-800 text-amber-400 shadow-lg">
                <Zap className="w-6 h-6 animate-pulse text-amber-400" />
              </div>

              <div className="text-center space-y-1">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                  CROSS-EXAMINE
                </div>
                <div className="text-xs font-serif font-bold text-neutral-300">
                  邏輯衝突比對
                </div>
              </div>

              <button
                onClick={checkContradiction}
                disabled={!ruleA || !ruleB || ruleA.id === ruleB.id || isInterferenceLocked}
                className={`w-full py-3.5 px-3 rounded-xl font-bold font-serif text-xs md:text-sm flex flex-col items-center justify-center gap-1 shadow-xl transition-all active:scale-95 ${
                  isInterferenceLocked
                    ? 'bg-red-950/90 text-red-300 border-2 border-red-500/80 animate-pulse cursor-not-allowed shadow-red-950/80'
                    : !ruleA || !ruleB || ruleA.id === ruleB.id
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                      : isCurrentPairAlreadyUnlocked
                        ? 'bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white border border-emerald-500 shadow-emerald-950/50'
                        : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-neutral-950 border border-amber-400 shadow-amber-950/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isInterferenceLocked ? (
                    <Radio className="w-4 h-4 text-red-400 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  <span>
                    {isInterferenceLocked
                      ? '§̷̸ 意識受阻中 ▒▓'
                      : isCurrentPairAlreadyUnlocked
                        ? '檢視已解鎖真相'
                        : '執行矛盾驗證'}
                  </span>
                </div>
                <span className="text-[10px] font-mono opacity-85">
                  {isInterferenceLocked
                    ? '(低語干擾中...)'
                    : isCurrentPairAlreadyUnlocked
                      ? '(已解析)'
                      : '(正解平復心神 / 誤判受精神衝擊)'}
                </span>
              </button>

              {ruleA && ruleB && ruleA.id === ruleB.id && (
                <p className="text-[10px] text-amber-400/90 font-mono text-center">
                  ⚠ 請選擇兩份不同的守則
                </p>
              )}
            </div>

            {/* Right Column: Rule B */}
            <div className="lg:col-span-5 bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-500 text-purple-300 flex items-center justify-center text-xs font-mono font-bold">
                    B
                  </span>
                  <span className="text-xs font-bold font-serif text-neutral-200">
                    第二份比對規約 (RULE B)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  {availableRules.length} 份可用
                </span>
              </div>

              {/* Selector Tabs for Rule B */}
              <div className="flex flex-wrap gap-1.5">
                {availableRules.map((rule) => {
                  const isSelected = rule.id === selectedRuleBId;
                  const isSameAsA = rule.id === selectedRuleAId;
                  return (
                    <button
                      key={rule.id}
                      onClick={() => {
                        sound.playPaper();
                        setSelectedRuleBId(rule.id);
                        setSelectedClauseBIndex(null);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-serif transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white font-bold shadow-md'
                          : isSameAsA
                            ? 'bg-neutral-900/60 text-neutral-500 border border-neutral-800'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                      }`}
                    >
                      {rule.title}
                    </button>
                  );
                })}
              </div>

              {/* Rule B Content Deck */}
              {ruleB ? (
                <div className="space-y-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-neutral-900/70 border border-neutral-800 space-y-0.5">
                    <div className="text-xs font-bold font-serif text-amber-300 flex items-center justify-between">
                      <span>{ruleB.title}</span>
                      {ruleB.isFake && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 border border-red-700 text-red-300 font-mono">
                          偽造公約
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-serif">
                      來源: {ruleB.source} ({ruleB.obtainedAt})
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase flex items-center justify-between">
                      <span>條款清單：</span>
                    </div>
                    {ruleB.content.map((clause, idx) => {
                      const isHighlighted = selectedClauseBIndex === idx;
                      return (
                        <div key={idx} className="space-y-1">
                          <button
                            onClick={() => {
                              sound.playClick();
                              setSelectedClauseBIndex(isHighlighted ? null : idx);
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs font-serif leading-relaxed transition-all ${
                              isHighlighted
                                ? 'bg-purple-950/80 border border-purple-400 text-purple-100 shadow-sm'
                                : 'bg-neutral-900/40 hover:bg-neutral-900 text-neutral-300 border border-neutral-800/60'
                            }`}
                          >
                            {clause}
                          </button>
                          {isHighlighted && (
                            <div className="flex justify-end px-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickInsertClause(clause, ruleB.title);
                                }}
                                className="text-[10px] px-2 py-0.5 rounded bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-600 flex items-center gap-1 font-serif transition-colors"
                              >
                                <Quote className="w-2.5 h-2.5" />
                                <span>引用至速記</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-500 font-serif">
                  請先選擇一份守則
                </div>
              )}
            </div>
          </div>

          {/* Interactive Free Notes Scratchpad (自由筆記速記區) */}
          <div className="bg-neutral-950/95 border border-amber-500/40 rounded-xl p-4 md:p-5 space-y-3.5 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-600/70 text-amber-400">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold font-serif text-neutral-100 flex items-center gap-2">
                    <span>偵探自由速記・矛盾線索記錄 (FREE SCRATCHPAD)</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300 font-mono">
                      已同步至調查日誌
                    </span>
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-serif">
                    比對規則時可手動輸入短句記錄疑點，或點選上方條款「引用至速記」。
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setShowNotesDrawer(!showNotesDrawer);
                }}
                className="text-xs font-serif text-amber-400/90 hover:text-amber-300 flex items-center gap-1"
              >
                <span>{showNotesDrawer ? '收起速記列表' : `檢視速記 (${freeNotes.length})`}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showNotesDrawer ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {/* Note Creation Form */}
            <form onSubmit={handleAddNoteSubmit} className="space-y-2.5">
              {/* Tags Preset */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-400" />
                  <span>標籤分類:</span>
                </span>
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedTag(tag);
                    }}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-serif transition-all ${
                      selectedTag === tag
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/80'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Input / Textarea */}
              <div className="relative">
                <textarea
                  value={quickNoteText}
                  onChange={(e) => setQuickNoteText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleAddNoteSubmit();
                    }
                  }}
                  rows={2}
                  placeholder="在此輸入偵探推論短句或可疑條款細節... (例如：清潔守則與404公約在門禁時間上有明顯衝突。可按 Ctrl+Enter 快速記錄)"
                  className="w-full bg-neutral-900/90 border border-neutral-700 rounded-xl p-3 text-xs md:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 font-serif leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[10px] font-mono text-neutral-500">
                  <span>共 {freeNotes.length} 則已儲存筆記 • 自動存檔於 GameState & 調查日誌</span>
                </div>

                <div className="flex items-center gap-2">
                  {quickNoteText.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setQuickNoteText('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-serif border border-neutral-800"
                    >
                      清空
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!quickNoteText.trim()}
                    className={`px-4 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all ${
                      quickNoteText.trim()
                        ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-950/60'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>記錄手記 (寫入日誌)</span>
                  </button>
                </div>
              </div>
            </form>

            {/* List of Recent Notes */}
            {showNotesDrawer && (
              <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                {freeNotes.length === 0 ? (
                  <div className="py-4 text-center text-neutral-500 text-xs font-serif">
                    目前尚未建立任何自訂筆記。可於上方輸入框記錄你的第一條線索！
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                    {freeNotes.slice(0, 8).map((note) => (
                      <div
                        key={note.id}
                        className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 flex items-start justify-between gap-3 text-xs font-serif"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {note.tags && note.tags.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300 font-mono">
                                #{note.tags[0]}
                              </span>
                            )}
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {note.timestamp}
                            </span>
                            {note.location && (
                              <span className="text-[10px] text-neutral-500 font-serif">
                                • {note.location}
                              </span>
                            )}
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 font-mono flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              已同步日誌
                            </span>
                          </div>
                          <p className="text-neutral-200 leading-relaxed whitespace-pre-line">
                            {note.text}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm('確定刪除此筆記嗎？')) {
                              onDeleteFreeNote?.(note.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-red-950/80 text-neutral-500 hover:text-red-300 transition-colors shrink-0"
                          title="刪除筆記"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Truth Fragments Archive / Collection Deck */}
          <div className="bg-neutral-950/90 border border-neutral-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs md:text-sm font-bold font-serif text-neutral-200">
                  已解析之真相碎片檔案庫 (TRUTH FRAGMENTS ARCHIVE)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-amber-400">
                已收集 {unlockedTruthFragmentIds.length} / {Object.keys(TRUTH_FRAGMENTS).length} 碎片
              </span>
            </div>

            {unlockedTruthFragmentIds.length === 0 ? (
              <div className="py-8 text-center space-y-2 font-serif text-neutral-500">
                <BookOpen className="w-8 h-8 mx-auto text-neutral-600" />
                <p className="text-xs">
                  尚未成功指證任何守則矛盾。請於上方選擇兩份具有邏輯衝突的守則進行驗證！
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {Object.values(TRUTH_FRAGMENTS).map((frag) => {
                  const isUnlocked = unlockedTruthFragmentIds.includes(frag.id);
                  if (!isUnlocked) return null;

                  return (
                    <div
                      key={frag.id}
                      className="p-3.5 rounded-xl bg-neutral-900/80 border border-amber-500/60 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                        <div className="font-bold text-xs font-serif text-amber-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{frag.title}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300">
                          已解構
                        </span>
                      </div>

                      <div className="text-xs text-neutral-300 font-serif leading-relaxed">
                        <span className="text-neutral-400 font-bold">【衝突對象】:</span> {frag.sourceRuleNames.join(' ⚡ ')}
                      </div>

                      <div className="p-2.5 rounded-lg bg-black/50 border border-neutral-800/80 text-[11px] text-neutral-300 font-serif leading-relaxed">
                        <span className="text-amber-400/90 font-bold">【核心真相】:</span> {frag.truthRevelation}
                      </div>

                      <div className="text-[10px] text-neutral-400 italic font-serif">
                        {frag.detectiveQuote}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
