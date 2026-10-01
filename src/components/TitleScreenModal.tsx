import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  BookOpen,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Brain,
  Search,
  Sparkles,
  AlertTriangle,
  FolderKanban,
  Info,
  X,
  UserPlus
} from 'lucide-react';
import { SavedGameData, EndingId } from '../types';
import { sound } from '../services/soundEngine';
import { getLatestManualSave, getManualSaveSlot } from '../services/saveSystem';
import { safeStorageGet, safeStorageRemove } from '../services/storageHelper';

export const SAVE_KEY = 'anhsiang_88_save';
export const OLD_SAVE_KEY = 'anxiang_88_save';

interface TitleScreenModalProps {
  onStartNewGame?: () => void;
  onContinueGame: (saveData: SavedGameData | null) => void;
  onOpenGallery?: () => void;
  onOpenSaveSlots?: () => void;
  onOpenSecretArchive?: () => void;
  unlockedEndings?: EndingId[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  completedWeek1?: boolean;
  onToggleWeekMode?: () => void;
  isInteractiveWeek2?: boolean;
  onResetAllProgress?: () => void;
}

export const TitleScreenModal: React.FC<TitleScreenModalProps> = ({
  onStartNewGame,
  onContinueGame,
  onOpenGallery,
  onOpenSaveSlots,
  onOpenSecretArchive,
  unlockedEndings = [],
  soundEnabled,
  onToggleSound,
  completedWeek1 = false,
  onToggleWeekMode,
  isInteractiveWeek2 = false,
  onResetAllProgress
}) => {
  const [saveData, setSaveData] = useState<SavedGameData | null>(null);
  const [showConfirmNewGame, setShowConfirmNewGame] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isGlitchingTitle, setIsGlitchingTitle] = useState<boolean>(false);
  const [glitchPhase, setGlitchPhase] = useState<number>(0);
  const [typedSuffixCount, setTypedSuffixCount] = useState<number>(() => isInteractiveWeek2 ? 0 : 0);
  const [isAfter15s, setIsAfter15s] = useState<boolean>(false);
  const [isTwitching, setIsTwitching] = useState<boolean>(false);
  const [twitchType, setTwitchType] = useState<'shake' | 'rgb_split' | 'scanline_flash' | 'flicker'>('shake');

  // Interactive variable: Detective anxiety level (0.0 to 1.0) simulating psychological tension via mouse movement
  const [anxietyLevel, setAnxietyLevel] = useState<number>(0);
  const anxietyRef = useRef<number>(0);
  const lastMousePosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const isTwitchingRef = useRef<boolean>(false);
  const nextTwitchTimeoutRef = useRef<any>(null);
  const twitchDurationTimeoutRef = useRef<any>(null);
  const nextTwitchDueTimeRef = useRef<number>(0);

  // Blood streams measurement config so blood stops at bottom of viewport and accumulates
  const titleSuffixRef = useRef<HTMLSpanElement>(null);
  const deCharRef = useRef<HTMLSpanElement>(null);
  const shouCharRef = useRef<HTMLSpanElement>(null);
  const zeCharRef = useRef<HTMLSpanElement>(null);
  const [bloodStreamsConfig, setBloodStreamsConfig] = useState<{
    maxHeight: number;
    dripPoints: { id: string; x: number; delay: number; width: number }[];
  }>({
    maxHeight: 520,
    dripPoints: []
  });

  // After 15s on Week 2 title screen, start intermittent noise and twitch effects (reduced from 30s)
  useEffect(() => {
    if (!isInteractiveWeek2) {
      setIsAfter15s(false);
      setIsTwitching(false);
      return;
    }

    const timer15s = setTimeout(() => {
      setIsAfter15s(true);
    }, 15000); // 15 seconds

    return () => {
      clearTimeout(timer15s);
    };
  }, [isInteractiveWeek2]);

  // Mouse trajectory tracking: accumulates detective anxiety based on speed and movement distance
  useEffect(() => {
    if (!isInteractiveWeek2) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const last = lastMousePosRef.current;
      if (last.time === 0) {
        lastMousePosRef.current = { x: e.clientX, y: e.clientY, time: now };
        return;
      }

      const dt = Math.max(16, now - last.time);
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      const dist = Math.hypot(dx, dy);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY, time: now };

      if (dist < 2) return;

      const speed = dist / dt; // px/ms
      // Gain anxiety from speed and trajectory movement
      const gain = Math.min(0.24, (dist / 80) * (0.06 + Math.min(0.35, speed * 0.16)));
      const newAnxiety = Math.min(1.0, anxietyRef.current + gain);
      anxietyRef.current = newAnxiety;
      setAnxietyLevel(newAnxiety);

      // Expedite twitch when anxiety rises sharply or is high
      if (newAnxiety > 0.25 && !isTwitchingRef.current) {
        const remaining = nextTwitchDueTimeRef.current - Date.now();
        const expeditedThreshold = Math.max(280, Math.floor(1000 * (1 - newAnxiety * 0.75)));
        if (remaining > expeditedThreshold) {
          clearTimeout(nextTwitchTimeoutRef.current);
          const expeditedDelay = Math.max(80, Math.floor(expeditedThreshold * 0.45));
          nextTwitchDueTimeRef.current = Date.now() + expeditedDelay;
          nextTwitchTimeoutRef.current = setTimeout(triggerTwitch, expeditedDelay);
        }
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
    };
  }, [isInteractiveWeek2]);

  // Anxiety decay loop: when mouse stops or leaves, anxiety smoothly relaxes
  useEffect(() => {
    if (!isInteractiveWeek2) return;

    const decayInterval = setInterval(() => {
      if (anxietyRef.current > 0.005) {
        const nextVal = Math.max(0, anxietyRef.current * 0.88 - 0.015);
        anxietyRef.current = nextVal;
        setAnxietyLevel(nextVal);
      } else if (anxietyRef.current !== 0) {
        anxietyRef.current = 0;
        setAnxietyLevel(0);
      }
    }, 100);

    return () => clearInterval(decayInterval);
  }, [isInteractiveWeek2]);

  // Twitch trigger helper
  const triggerTwitch = () => {
    if (isTwitchingRef.current) return;
    isTwitchingRef.current = true;
    setIsTwitching(true);

    const currentAnxiety = anxietyRef.current;
    const types: ('shake' | 'rgb_split' | 'scanline_flash' | 'flicker')[] = [
      'shake',
      'rgb_split',
      'scanline_flash',
      'flicker'
    ];
    const chosen = types[Math.floor(Math.random() * types.length)];
    setTwitchType(chosen);

    if (soundEnabled && (Math.random() > 0.35 || currentAnxiety > 0.45)) {
      try {
        sound.playGlitch();
      } catch {}
    }

    const duration = Math.floor(Math.random() * 120) + (currentAnxiety > 0.5 ? 240 : 160);
    twitchDurationTimeoutRef.current = setTimeout(() => {
      isTwitchingRef.current = false;
      setIsTwitching(false);
      scheduleNextTwitch();
    }, duration);
  };

  // Schedule next twitch with dynamic frequency based on anxietyLevel
  const scheduleNextTwitch = () => {
    clearTimeout(nextTwitchTimeoutRef.current);
    if (!isInteractiveWeek2) return;
    if (!isAfter15s && anxietyRef.current < 0.35) return;

    // Base interval: 3.5s to 6.5s
    const baseDelay = Math.floor(Math.random() * 3000) + 3500;
    const anxietyFactor = anxietyRef.current;
    // Accelerate frequency: drops down to 450ms - 900ms under high anxiety
    const delay = Math.max(450, Math.floor(baseDelay * (1 - anxietyFactor * 0.85)));

    nextTwitchDueTimeRef.current = Date.now() + delay;
    nextTwitchTimeoutRef.current = setTimeout(triggerTwitch, delay);
  };

  // Periodic random twitch effect after 15s or when anxiety surges
  useEffect(() => {
    if (!isInteractiveWeek2) return;

    if (isAfter15s || anxietyLevel > 0.35) {
      if (!isTwitchingRef.current && nextTwitchDueTimeRef.current <= Date.now()) {
        scheduleNextTwitch();
      }
    }

    return () => {
      clearTimeout(nextTwitchTimeoutRef.current);
      clearTimeout(twitchDurationTimeoutRef.current);
    };
  }, [isInteractiveWeek2, isAfter15s, anxietyLevel > 0.35]);

  // Dynamic measurement to ensure blood stream stops exactly at current bottom of screen and aligns puddles
  useEffect(() => {
    if (!isInteractiveWeek2) return;

    const updateBloodMeasurements = () => {
      const vh = window.innerHeight;
      let maxHeight = 520;

      if (titleSuffixRef.current) {
        const rect = titleSuffixRef.current.getBoundingClientRect();
        const streamOriginY = rect.top + rect.height * 0.8;
        maxHeight = Math.max(80, Math.floor(vh - streamOriginY));
      }

      const points: { id: string; x: number; delay: number; width: number }[] = [];
      if (deCharRef.current) {
        const r = deCharRef.current.getBoundingClientRect();
        points.push({ id: 'de-1', x: r.left + r.width * 0.25, delay: 6.5, width: 44 });
        points.push({ id: 'de-2', x: r.left + r.width * 0.70, delay: 7.2, width: 36 });
      }
      if (shouCharRef.current) {
        const r = shouCharRef.current.getBoundingClientRect();
        points.push({ id: 'shou-1', x: r.left + r.width * 0.36, delay: 8.0, width: 48 });
        points.push({ id: 'shou-2', x: r.left + r.width * 0.76, delay: 8.8, width: 38 });
      }
      if (zeCharRef.current) {
        const r = zeCharRef.current.getBoundingClientRect();
        points.push({ id: 'ze-1', x: r.left + r.width * 0.26, delay: 9.5, width: 46 });
        points.push({ id: 'ze-2', x: r.left + r.width * 0.82, delay: 10.2, width: 50 });
      }

      setBloodStreamsConfig({
        maxHeight,
        dripPoints: points
      });
    };

    updateBloodMeasurements();
    window.addEventListener('resize', updateBloodMeasurements);
    window.addEventListener('scroll', updateBloodMeasurements, true);

    const t1 = setTimeout(updateBloodMeasurements, 200);
    const t2 = setTimeout(updateBloodMeasurements, 1100);
    const t3 = setTimeout(updateBloodMeasurements, 1900);
    const t4 = setTimeout(updateBloodMeasurements, 2700);

    return () => {
      window.removeEventListener('resize', updateBloodMeasurements);
      window.removeEventListener('scroll', updateBloodMeasurements, true);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isInteractiveWeek2, typedSuffixCount]);

  // When isInteractiveWeek2 is active, execute the sequential typewriter effect for "的守則"
  useEffect(() => {
    if (!isInteractiveWeek2) {
      setTypedSuffixCount(0);
      return;
    }

    // Reset to 0 then type sequentially with deliberate horror typewriter delay
    setTypedSuffixCount(0);
    const timer1 = setTimeout(() => {
      setTypedSuffixCount(1); // '的'
      sound.playTypewriter();
    }, 1000);

    const timer2 = setTimeout(() => {
      setTypedSuffixCount(2); // '的守'
      sound.playTypewriter();
    }, 1800);

    const timer3 = setTimeout(() => {
      setTypedSuffixCount(3); // '的守則'
      sound.playTypewriter();
    }, 2600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isInteractiveWeek2]);

  // Check and read save on mount & check for live glitch animation trigger
  useEffect(() => {
    try {
      const latest = getLatestManualSave(false);
      if (latest && latest.data && latest.data.playerName) {
        setSaveData(latest.data);
      } else {
        const raw = safeStorageGet(SAVE_KEY) || safeStorageGet(OLD_SAVE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as SavedGameData;
            if (parsed && typeof parsed === 'object' && parsed.playerName) {
              setSaveData(parsed);
            } else {
              setSaveData(null);
            }
          } catch {
            setSaveData(null);
          }
        } else {
          setSaveData(null);
        }
      }
    } catch (e) {
      console.error('Failed to read save data:', e);
      setSaveData(null);
    }

    // Check if player just completed the meta transition
    try {
      const justTransitioned = safeStorageGet('ROOM404_JUST_TRANSITIONED');
      if (justTransitioned === 'true') {
        safeStorageRemove('ROOM404_JUST_TRANSITIONED');
        setIsGlitchingTitle(true);
        setGlitchPhase(1);
        setTimeout(() => setGlitchPhase(2), 700);
        setTimeout(() => setGlitchPhase(3), 1500);
        setTimeout(() => {
          setIsGlitchingTitle(false);
          setGlitchPhase(0);
        }, 2400);
      }
    } catch (e) {
      // ignore
    }

    setIsLoaded(true);
  }, []);

  const handleContinueClick = () => {
    sound.unlockAudio();
    if (!saveData) return;
    sound.playPaper();
    onContinueGame(saveData);
  };

  const handleNewGameClick = () => {
    sound.unlockAudio();
    if (saveData) {
      sound.playClick();
      setShowConfirmNewGame(true);
    } else {
      sound.playPaper();
      onStartNewGame();
    }
  };

  const confirmNewGame = () => {
    sound.unlockAudio();
    sound.playPaper();
    setShowConfirmNewGame(false);
    setSaveData(null);
    if (onStartNewGame) {
      onStartNewGame();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 ${
        isInteractiveWeek2 ? 'bg-[#0a0705] text-[#f4ecd8]' : 'bg-[#eef3ec] text-[#222222]'
      } flex flex-col items-center justify-between p-2 sm:p-4 select-none overflow-y-auto font-serif transition-transform duration-150 ${
        isTwitching && twitchType === 'shake' 
          ? (anxietyLevel > 0.5 ? 'translate-x-2.5 -translate-y-2 skew-x-2' : 'translate-x-1.5 -translate-y-1 skew-x-1') 
          : ''
      } ${
        isTwitching && twitchType === 'flicker' ? 'opacity-40 brightness-150' : ''
      } ${
        isTwitching && twitchType === 'scanline_flash' ? 'invert-[0.2] contrast-150' : ''
      }`}
      style={{
        ...(isTwitching && twitchType === 'rgb_split'
          ? {
              filter: anxietyLevel > 0.5
                ? 'drop-shadow(7px 0 0 rgba(255, 0, 50, 0.95)) drop-shadow(-7px 0 0 rgba(0, 240, 255, 0.95))'
                : 'drop-shadow(5px 0 0 rgba(255, 0, 50, 0.85)) drop-shadow(-5px 0 0 rgba(0, 240, 255, 0.85))'
            }
          : {}),
        ['--max-blood-height' as any]: `${bloodStreamsConfig.maxHeight}px`
      }}
    >
      {/* Viscous Slow Blood Trail CSS Keyframes */}
      <style>{`
        @keyframes viscousBloodCreep1 {
          0% { height: 0px; opacity: 0; }
          3% { height: 14px; opacity: 0.95; }
          18% { height: calc(var(--max-blood-height, 500px) * 0.22); opacity: 0.95; }
          40% { height: calc(var(--max-blood-height, 500px) * 0.52); opacity: 0.92; }
          68% { height: calc(var(--max-blood-height, 500px) * 0.82); opacity: 0.90; }
          88% { height: calc(var(--max-blood-height, 500px) * 0.96); opacity: 0.88; }
          100% { height: var(--max-blood-height, 500px); opacity: 0.85; }
        }
        @keyframes viscousBloodCreep2 {
          0% { height: 0px; opacity: 0; }
          3% { height: 10px; opacity: 0.95; }
          20% { height: calc(var(--max-blood-height, 500px) * 0.25); opacity: 0.95; }
          45% { height: calc(var(--max-blood-height, 500px) * 0.56); opacity: 0.92; }
          72% { height: calc(var(--max-blood-height, 500px) * 0.84); opacity: 0.90; }
          90% { height: calc(var(--max-blood-height, 500px) * 0.97); opacity: 0.88; }
          100% { height: var(--max-blood-height, 500px); opacity: 0.85; }
        }
        @keyframes viscousBloodCreep3 {
          0% { height: 0px; opacity: 0; }
          2.5% { height: 16px; opacity: 0.95; }
          16% { height: calc(var(--max-blood-height, 500px) * 0.20); opacity: 0.95; }
          38% { height: calc(var(--max-blood-height, 500px) * 0.48); opacity: 0.92; }
          65% { height: calc(var(--max-blood-height, 500px) * 0.78); opacity: 0.90; }
          86% { height: calc(var(--max-blood-height, 500px) * 0.95); opacity: 0.88; }
          100% { height: var(--max-blood-height, 500px); opacity: 0.85; }
        }
        @keyframes viscousBloodCreep4 {
          0% { height: 0px; opacity: 0; }
          4% { height: 8px; opacity: 0.95; }
          22% { height: calc(var(--max-blood-height, 500px) * 0.28); opacity: 0.95; }
          50% { height: calc(var(--max-blood-height, 500px) * 0.60); opacity: 0.92; }
          75% { height: calc(var(--max-blood-height, 500px) * 0.86); opacity: 0.90; }
          92% { height: calc(var(--max-blood-height, 500px) * 0.98); opacity: 0.88; }
          100% { height: var(--max-blood-height, 500px); opacity: 0.85; }
        }
        .viscous-blood-stream-1 {
          animation: viscousBloodCreep1 14s cubic-bezier(0.2, 0.7, 0.25, 1) forwards;
          max-height: var(--max-blood-height, 500px);
        }
        .viscous-blood-stream-2 {
          animation: viscousBloodCreep2 16s cubic-bezier(0.18, 0.65, 0.3, 1) 0.5s forwards;
          max-height: var(--max-blood-height, 500px);
        }
        .viscous-blood-stream-3 {
          animation: viscousBloodCreep3 18s cubic-bezier(0.15, 0.68, 0.22, 1) 0.3s forwards;
          max-height: var(--max-blood-height, 500px);
        }
        .viscous-blood-stream-4 {
          animation: viscousBloodCreep4 15s cubic-bezier(0.22, 0.72, 0.28, 1) 0.8s forwards;
          max-height: var(--max-blood-height, 500px);
        }

        /* Bottom Puddle Accumulation Animations */
        @keyframes bloodPuddleExpand {
          0% {
            transform: scaleX(0.1) scaleY(0);
            opacity: 0;
            height: 0px;
          }
          15% {
            transform: scaleX(0.3) scaleY(0.4);
            opacity: 0.5;
            height: 3px;
          }
          40% {
            transform: scaleX(0.7) scaleY(0.75);
            opacity: 0.85;
            height: 8px;
          }
          70% {
            transform: scaleX(0.9) scaleY(0.9);
            opacity: 0.92;
            height: 12px;
          }
          100% {
            transform: scaleX(1) scaleY(1);
            opacity: 0.96;
            height: 16px;
          }
        }
        @keyframes bloodFloorAccumulation {
          0% {
            height: 0px;
            opacity: 0;
          }
          15% {
            height: 3px;
            opacity: 0.45;
          }
          45% {
            height: 8px;
            opacity: 0.78;
          }
          75% {
            height: 13px;
            opacity: 0.88;
          }
          100% {
            height: 18px;
            opacity: 0.95;
          }
        }
        @keyframes bloodGlisten {
          0%, 100% { opacity: 0.6; filter: drop-shadow(0 -2px 6px rgba(185, 28, 28, 0.5)); }
          50% { opacity: 0.95; filter: drop-shadow(0 -3px 12px rgba(239, 68, 68, 0.8)); }
        }
      `}</style>

      {/* Week 2 Cognitive Anomaly & Detective Anxiety Badge (Positioned at bottom right to not block top header buttons) */}
      {isInteractiveWeek2 && (
        <div className="fixed bottom-12 right-4 sm:bottom-10 sm:right-6 z-30 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/90 border border-red-600/70 text-[10px] font-mono text-red-300 shadow-[0_0_18px_rgba(239,68,68,0.7)] backdrop-blur-sm">
          <span className={`w-2 h-2 rounded-full ${isTwitching ? 'bg-red-400 animate-ping' : anxietyLevel > 0.3 ? 'bg-amber-400 animate-pulse' : 'bg-red-600'}`} />
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 font-bold tracking-wider">
              <span>{isAfter15s ? '認知干擾信號疊加 // 404 NOISE SYNC' : '認知對抗監測 // ANOMALY PROBING'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-red-300/90 font-mono mt-0.5">
              <span>偵探焦慮指數:</span>
              <div className="w-14 h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-red-900/80 inline-flex">
                <div 
                  className={`h-full transition-all duration-150 ${anxietyLevel > 0.5 ? 'bg-gradient-to-r from-amber-400 to-red-500 shadow-[0_0_6px_#f59e0b]' : 'bg-red-700'}`}
                  style={{ width: `${Math.round(anxietyLevel * 100)}%` }}
                />
              </div>
              <span className="font-bold text-amber-300">{Math.round(anxietyLevel * 100)}%</span>
              {anxietyLevel > 0.35 && (
                <span className="text-[8px] text-amber-300 font-bold animate-pulse ml-0.5">⚡ 抽搐頻率加速</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Twitch Scanline Flash Overlay */}
      {isTwitching && (
        <div className="fixed inset-0 pointer-events-none z-40 bg-red-950/20 mix-blend-color-dodge bg-[linear-gradient(rgba(255,0,0,0.25)_50%,rgba(0,0,0,0.6)_50%)] bg-[length:100%_3px]" />
      )}

      {!isInteractiveWeek2 ? (
        /* ========================================================================= */
        /* WEEK 1: 2000s Classic Taiwanese Forum / BBS Retro Portal Cover            */
        /* ========================================================================= */
        <div className="w-full max-w-4xl mx-auto my-auto flex flex-col bg-[#ffffff] border-2 border-[#6d8e63] shadow-md overflow-hidden text-[#222222] font-serif z-10">
          {/* Top Portal Utility Bar: Only 【怪談】 is retained */}
          <div className="bg-[#ffffff] border-b border-[#c8d8c3] px-3 sm:px-5 py-1.5 flex items-center text-xs text-[#444444]">
            <span className="font-bold text-[#b83828] shrink-0 font-sans">
              【怪談】
            </span>
          </div>

          {/* Banner & Identity Header (Classic Taiwanese Forum / Yahoo Club Green Theme) */}
          <div className="retro-web-banner px-3 sm:px-6 py-3.5 text-[#ffffff] flex flex-wrap items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#ffffff] border-2 border-[#284420] flex items-center justify-center text-[#284420] font-bold text-xl sm:text-2xl shadow-sm select-none font-serif shrink-0">
                談
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] sm:text-xs px-2 py-0.5 bg-[#ffffff]/25 border border-[#ffffff]/50 rounded-xs text-[#ffffff] font-bold">
                    當前位置【怪談】
                  </span>
                </div>
                <div className="text-xs text-[#d6ecd0] flex flex-wrap items-center gap-2 mt-1">
                  <span>版主：mawei</span>
                  <span>•</span>
                  <span>伺服器狀態：正常</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Forum Body */}
          <div className="p-4 sm:p-6 bg-[#fbfdfa] space-y-4">
            {/* Thread Lead / Synopsis Box */}
            <div className="bg-[#ffffff] border border-[#a8c2a1] p-4 sm:p-5 space-y-3 text-xs sm:text-sm leading-relaxed text-[#222222] shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#cde0c7] pb-2">
                <span className="text-xs font-bold text-[#1a4b2a] flex items-center gap-1.5">
                  <FolderKanban className="w-4 h-4 text-[#2e6d24]" />
                  <span>【進版畫面徵求中】近期安祥路88號連環失蹤案，你有頭緒嗎？</span>
                </span>
              </div>
              <p className="indent-6 text-[#333333]">
                你是一名私家偵探，接獲委託前往老舊公寓「安祥路88號」，調查無故失聯的友人張浩。這棟大樓外表尋常，房號編排為 101~505，唯獨跳過了 4 樓……值班警衛聲稱張浩早已退租，但張浩遺留的最後租約與通聯記錄，分明指向這裡。請手持手電筒與搜查筆記，抽絲剝繭拼湊出客觀真相。
              </p>
            </div>

            {/* Save File Preview Card */}
            {saveData && (
              <div className="bg-[#f0f6ee] border border-[#a8c2a1] p-3.5 rounded-xs space-y-2 shadow-2xs text-xs font-sans">
                <div className="flex items-center justify-between border-b border-[#cde0c7] pb-1.5 text-xs text-[#1a4b2a] font-bold">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#2e6d24]" />
                    <span>歷史調查存檔進度</span>
                  </div>
                  <span className="text-[#666666] font-mono text-[11px]">{saveData.saveTimestamp || '近期存檔'}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[#666666] block text-[11px]">註冊名稱：</span>
                    <span className="font-bold text-[#111111]">{(saveData.playerName && saveData.playerName !== '調查員') ? saveData.playerName : '尚未註冊'}</span>
                  </div>
                  <div>
                    <span className="text-[#666666] block text-[11px]">調查日程：</span>
                    <span className="font-bold text-[#1a4b2a]">第 {saveData.investigationDay || 1} 天</span>
                  </div>
                  <div>
                    <span className="text-[#666666] block text-[11px]">當前位置：</span>
                    <span className="truncate block text-[#333333]">{saveData.currentLocationName || '大樓現場'}</span>
                  </div>
                  <div>
                    <span className="text-[#666666] block text-[11px]">已獲物證：</span>
                    <span className="font-bold text-[#111111]">{saveData.inventory?.length || 0} 件</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons Section */}
            <div className="space-y-2.5 pt-1 font-sans">
              {/* Register / New Game Button */}
              <button
                onClick={handleNewGameClick}
                className="w-full py-3 px-6 bg-[#2e6d24] hover:bg-[#24591c] text-[#ffffff] font-bold text-sm sm:text-base border-2 border-[#1c4b16] flex items-center justify-center gap-2 cursor-pointer shadow-sm active:translate-y-[1px] transition-all"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffffff]" />
                <span>【註冊帳號】（新遊戲）</span>
              </button>

              {/* Login / Continue Game Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  if (onOpenSaveSlots) {
                    onOpenSaveSlots();
                  } else if (saveData) {
                    handleContinueClick();
                  }
                }}
                className="w-full py-2.5 px-6 bg-[#ffffff] hover:bg-[#edf5ec] text-[#284420] font-bold text-xs sm:text-sm border border-[#a8c2a1] flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:translate-y-[1px] transition-all"
              >
                <FolderKanban className="w-4 h-4 text-[#2e6d24]" />
                <span>【登入帳號】（繼續遊戲）</span>
              </button>
            </div>
          </div>

          {/* 2000s Web Portal Footer */}
          <div className="bg-[#e8f0e5] border-t border-[#a8c2a1] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#555555]">
            <div className="flex items-center gap-2">
              <span>© 2004-2012 伺服器狀態：正常</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-sans">
              <span>最佳瀏覽解析度：1024×768 (全彩)</span>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* WEEK 2: Dark Horror Cognitive Warfare Anomaly Mode                        */
        /* ========================================================================= */
        <>
          {/* Ambient background styling with subtle amber vignette */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay bg-repeat"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 30%, rgba(180, 83, 9, 0.15) 0%, rgba(0, 0, 0, 0.95) 75%)`
            }}
          />

          {/* Retro CRT Scanlines & Noise */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px]" />

          {/* Top Header Bar */}
          <header className="w-full max-w-5xl flex items-center justify-between z-10 pt-2 text-xs font-mono text-amber-500/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="tracking-widest uppercase">CASE FILE // ANHSIANG-RD-88</span>
            </div>

            <div className="flex items-center gap-2.5">
              {onResetAllProgress && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowResetConfirm(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900/90 border border-red-800/80 text-red-300 hover:text-red-100 transition-all text-xs cursor-pointer shadow"
                  title="重置所有遊戲進度，清除所有存檔並自第一輪重新開始"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                  <span>重置遊戲進度</span>
                </button>
              )}

              <button
                onClick={() => {
                  sound.playClick();
                  onToggleSound();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-amber-200 transition-all text-xs cursor-pointer shadow"
                title="音效開關"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-500" />}
                <span>{soundEnabled ? '音效已開啟' : '靜音中'}</span>
              </button>
            </div>
          </header>

          {/* Center Main Stage */}
          <main className="w-full max-w-3xl my-auto py-8 z-10 flex flex-col items-center text-center space-y-7">
            {/* Game Title & Dynamic Subtitle */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-red-950/80 border border-red-500/80 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span>二周目・規則類怪談認知對抗篇 // WEEK 2</span>
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="relative"
              >
                {isGlitchingTitle ? (
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)] flex items-center justify-center flex-wrap">
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffe4e6] via-[#ef4444] to-[#991b1b]">
                      《安祥路88號
                    </span>
                    <span className="inline-flex items-center ml-0.5 sm:ml-1 font-serif tracking-normal">
                      <span className="text-[#990000] drop-shadow-[0_0_14px_rgba(153,0,0,0.95)] drop-shadow-[0_0_28px_rgba(90,0,0,0.85)]">
                        {glitchPhase === 1 ? '' : glitchPhase === 2 ? '……' : '的守則'}
                      </span>
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffe4e6] via-[#ef4444] to-[#991b1b]">
                      》
                    </span>
                  </h1>
                ) : (
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] flex items-center justify-center flex-wrap">
                    <span className="flex items-center justify-center flex-wrap">
                      <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffe4e6] via-[#ef4444] to-[#991b1b]">
                        《安祥路88號
                      </span>
                      <span 
                        ref={titleSuffixRef}
                        className="inline-flex items-center ml-0.5 sm:ml-1 font-serif tracking-normal relative"
                      >
                        {typedSuffixCount >= 1 && (
                          <span 
                            ref={deCharRef}
                            className="relative inline-block select-none group"
                          >
                            <span className="animate-fade-in inline-block font-extrabold text-[#990000] drop-shadow-[0_0_14px_rgba(153,0,0,0.95)] drop-shadow-[0_0_28px_rgba(90,0,0,0.85)]">
                              的
                            </span>
                            <span className="absolute top-[80%] left-[25%] pointer-events-none overflow-visible z-20">
                              <span className="viscous-blood-stream-1 block w-[2.5px] bg-gradient-to-b from-[#990000] via-[#5a0000] to-[#200000] rounded-b-full shadow-[0_0_6px_rgba(153,0,0,0.8)] relative">
                                <span className="absolute -bottom-1 -left-[2px] w-2 h-2.5 rounded-full bg-gradient-to-b from-[#990000] to-[#200000] shadow-[0_0_8px_rgba(153,0,0,0.9)]" />
                              </span>
                            </span>
                            <span className="absolute top-[85%] left-[70%] pointer-events-none overflow-visible z-20">
                              <span className="viscous-blood-stream-2 block w-[2px] bg-gradient-to-b from-[#990000] via-[#5a0000] to-[#200000] rounded-b-full shadow-[0_0_5px_rgba(153,0,0,0.7)] relative">
                                <span className="absolute -bottom-1 -left-[1.5px] w-1.5 h-2 rounded-full bg-gradient-to-b from-[#990000] to-[#200000] shadow-[0_0_6px_rgba(153,0,0,0.8)]" />
                              </span>
                            </span>
                          </span>
                        )}
                        {typedSuffixCount >= 2 && (
                          <span 
                            ref={shouCharRef}
                            className="relative inline-block select-none group ml-0.5"
                          >
                            <span className="animate-fade-in inline-block font-extrabold text-[#990000] drop-shadow-[0_0_14px_rgba(153,0,0,0.95)] drop-shadow-[0_0_28px_rgba(90,0,0,0.85)]">
                              守
                            </span>
                            <span className="absolute top-[80%] left-[36%] pointer-events-none overflow-visible z-20">
                              <span className="viscous-blood-stream-3 block w-[3px] bg-gradient-to-b from-[#990000] via-[#5a0000] to-[#200000] rounded-b-full shadow-[0_0_6px_rgba(153,0,0,0.8)] relative">
                                <span className="absolute -bottom-1.5 -left-[2px] w-2.5 h-3 rounded-full bg-gradient-to-b from-[#990000] to-[#200000] shadow-[0_0_9px_rgba(153,0,0,0.9)]" />
                              </span>
                            </span>
                            <span className="absolute top-[88%] left-[76%] pointer-events-none overflow-visible z-20">
                              <span className="viscous-blood-stream-4 block w-[2px] bg-gradient-to-b from-[#990000] via-[#5a0000] to-[#200000] rounded-b-full shadow-[0_0_5px_rgba(153,0,0,0.7)] relative">
                                <span className="absolute -bottom-1 -left-[1.5px] w-1.5 h-2 rounded-full bg-gradient-to-b from-[#990000] to-[#200000] shadow-[0_0_6px_rgba(153,0,0,0.8)]" />
                              </span>
                            </span>
                          </span>
                        )}
                        {typedSuffixCount >= 3 && (
                          <span 
                            ref={zeCharRef}
                            className="relative inline-block select-none group ml-0.5"
                          >
                            <span className="animate-fade-in inline-block font-extrabold text-[#990000] drop-shadow-[0_0_14px_rgba(153,0,0,0.95)] drop-shadow-[0_0_28px_rgba(90,0,0,0.85)]">
                              則
                            </span>
                            <span className="absolute top-[82%] left-[26%] pointer-events-none overflow-visible z-20">
                              <span className="viscous-blood-stream-2 block w-[2.5px] bg-gradient-to-b from-[#990000] via-[#5a0000] to-[#200000] rounded-b-full shadow-[0_0_6px_rgba(153,0,0,0.8)] relative">
                                <span className="absolute -bottom-1 -left-[2px] w-2 h-2.5 rounded-full bg-gradient-to-b from-[#990000] to-[#200000] shadow-[0_0_8px_rgba(153,0,0,0.9)]" />
                              </span>
                            </span>
                            <span className="absolute top-[80%] left-[82%] pointer-events-none overflow-visible z-20">
                              <span className="viscous-blood-stream-1 block w-[3px] bg-gradient-to-b from-[#990000] via-[#5a0000] to-[#200000] rounded-b-full shadow-[0_0_7px_rgba(153,0,0,0.8)] relative">
                                <span className="absolute -bottom-1.5 -left-[2px] w-2.5 h-3 rounded-full bg-gradient-to-b from-[#990000] to-[#200000] shadow-[0_0_10px_rgba(153,0,0,0.9)]" />
                              </span>
                            </span>
                          </span>
                        )}
                        {typedSuffixCount < 3 && (
                          <span className="inline-block w-1.5 sm:w-2 h-7 sm:h-10 bg-[#990000] shadow-[0_0_14px_#990000] ml-1.5 animate-pulse align-middle rounded-sm" />
                        )}
                      </span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffe4e6] via-[#ef4444] to-[#991b1b]">
                        》
                      </span>
                    </span>
                  </h1>
                )}
              </motion.div>
            </div>

            {/* Synopsis / Case Briefing */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="max-w-xl text-xs sm:text-sm leading-relaxed font-serif px-5 py-4 rounded-2xl backdrop-blur-md text-left shadow-2xl space-y-2 border bg-red-950/20 border-red-900/60 text-neutral-200 shadow-red-950/30"
            >
              <div className="flex items-center justify-between border-b border-red-900/40 pb-1.5">
                <div className="flex items-center gap-2 text-red-400 font-mono text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-bold tracking-wider text-red-400">
                    認知對抗警示 // COGNITIVE WARFARE BRIEF
                  </span>
                </div>
              </div>

              <p className="indent-6 leading-relaxed">
                張浩（至少當時）並未精神失常。那棟大樓看似被某種「異常」侵蝕，也許除了他，還有其他失蹤者被困在裡面？也許，我有必要再回去一次。這次，我必須注意自己的精神狀態、留心張浩提到的守則、以及讓人信賴的物證，迎戰並找到最後的真相。
              </p>
            </motion.div>

            {/* Main Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="w-full max-w-md flex flex-col gap-3 pt-1"
            >
              <button
                onClick={handleContinueClick}
                className="w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold tracking-widest bg-gradient-to-r from-red-700 via-rose-600 to-red-800 hover:from-red-600 hover:to-red-700 text-white shadow-xl shadow-red-950/80 border border-red-500/80 cursor-pointer scale-[1.01] hover:scale-[1.03] transition-all duration-300 animate-pulse"
              >
                <Play className="w-4 h-4 fill-current text-white" />
                <span>繼續遊戲</span>
              </button>
            </motion.div>
          </main>

          <footer className="w-full max-w-5xl z-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-red-500/70 border-t border-red-950/60 pt-3 pb-1">
            <div>
              <span>安祥路88號 // 認知重構程序 • 第二循環</span>
            </div>
            <div className="flex items-center gap-3">
              <span>AX88 COGNITIVE RECONSTRUCTION // CYCLE 2</span>
            </div>
          </footer>
        </>
      )}

      {/* Week 2: Bottom of webpage blood accumulation & puddles (網頁底端緩慢堆積的血跡與血泊) */}
      {isInteractiveWeek2 && typedSuffixCount >= 1 && (
        <div 
          className="fixed bottom-0 left-0 right-0 pointer-events-none z-20 overflow-hidden"
          style={{ height: '36px' }}
        >
          {/* Base slow-rising congealed blood layer spanning across the bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#120000] via-[#480000] to-[#800000]/80 border-t border-red-700/60 shadow-[0_-4px_24px_rgba(160,0,0,0.85)]"
            style={{
              animation: 'bloodFloorAccumulation 26s cubic-bezier(0.15, 0.7, 0.25, 1) 7s forwards',
              height: '0px'
            }}
          >
            {/* Specular crimson shine along surface */}
            <div 
              className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-red-400/80 to-transparent"
              style={{ animation: 'bloodGlisten 3s ease-in-out infinite' }}
            />
          </div>

          {/* Targeted puddles that expand and thicken directly beneath each blood stream landing point */}
          {bloodStreamsConfig.dripPoints.map((pt) => (
            <div
              key={pt.id}
              className="absolute bottom-0 -translate-x-1/2 pointer-events-none"
              style={{ left: `${pt.x}px` }}
            >
              <div
                className="rounded-t-[100%] bg-gradient-to-t from-[#0e0000] via-[#560000] to-[#990000] shadow-[0_-3px_16px_rgba(220,38,38,0.9)] relative"
                style={{
                  width: `${pt.width}px`,
                  animation: `bloodPuddleExpand 20s cubic-bezier(0.12, 0.75, 0.25, 1) ${pt.delay}s forwards`,
                  height: '0px'
                }}
              >
                {/* Surface tension glistening light on pooled blood */}
                <div className="absolute top-0.5 left-2 right-2 h-[2px] rounded-full bg-red-300/70 blur-[0.5px]" />
                {/* Satellite drops splashed sideways */}
                <span className="absolute -left-2.5 bottom-0 w-2 h-1.5 rounded-full bg-[#3d0000] shadow-[0_0_4px_#900]" />
                <span className="absolute -right-3 bottom-0 w-2.5 h-2 rounded-full bg-[#330000] shadow-[0_0_4px_#900]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overwrite Save Confirmation Modal (2000s Retro Window Style) */}
      <AnimatePresence>
        {showConfirmNewGame && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none font-sans">
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 8 }}
              className="retro-forum-modal-window rounded-none max-w-md w-full shadow-lg overflow-hidden text-[#1a2e18]"
            >
              <div className="flex items-center justify-between px-3.5 py-2 retro-forum-modal-header text-[#ffffff]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#ffffff]" />
                  <h3 className="text-xs sm:text-sm font-bold tracking-wide">
                    覆蓋舊存檔確認 // OVERWRITE CONFIRMATION
                  </h3>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowConfirmNewGame(false);
                  }}
                  className="p-1 rounded-xs border border-[#ffffff]/40 text-[#ffffff] hover:bg-[#ffffff]/20 cursor-pointer"
                  title="關閉"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 bg-[#f4f8f3] space-y-3">
                <p className="text-xs leading-relaxed text-[#1a2e18]">
                  偵測到您已有正在進行中的案件調查進度（第 {saveData?.investigationDay || 1} 天）。開始新遊戲將覆蓋此存檔。
                </p>

                <div className="p-2.5 bg-[#ffffff] border border-[#a8c2a1] text-xs text-[#2b5420] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#854d0e] shrink-0" />
                  <span>★ 您的 <b>【已解鎖結局成就】</b> 將完整保留，不會遺失。</span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#cde0c7]">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowConfirmNewGame(false);
                    }}
                    className="retro-web-btn px-3.5 py-1 text-xs cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmNewGame}
                    className="retro-web-btn px-3.5 py-1 text-xs font-bold text-[#8c3a27] border-[#8c3a27] hover:bg-[#ffebeb] cursor-pointer"
                  >
                    確認覆蓋並開始新遊戲
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Progress Reset Confirmation Modal (全面重置遊戲進度視窗 - 2000s Retro Style) */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none font-sans">
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 8 }}
              className="retro-forum-modal-window rounded-none max-w-md w-full shadow-lg overflow-hidden text-[#1a2e18]"
            >
              <div className="flex items-center justify-between px-3.5 py-2 retro-forum-modal-header text-[#ffffff]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#ffffff] animate-pulse" />
                  <h3 className="text-xs sm:text-sm font-bold tracking-wide">
                    全面重置遊戲進度 // RESET ALL DATA
                  </h3>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowResetConfirm(false);
                  }}
                  className="p-1 rounded-xs border border-[#ffffff]/40 text-[#ffffff] hover:bg-[#ffffff]/20 cursor-pointer"
                  title="關閉"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 bg-[#f4f8f3] space-y-3">
                <p className="text-xs leading-relaxed text-[#1a2e18]">
                  此操作將完全移除至目前為止的所有遊戲進度與證物，並恢復為初始狀態：
                </p>

                <div className="bg-[#ffffff] border border-[#d9a8a8] p-3 space-y-2 text-xs text-[#1a2e18]">
                  <div className="flex items-start gap-1.5 text-[#8c2727]">
                    <span className="shrink-0 font-bold">⚠️</span>
                    <span><b>全數移除所有內容</b>：所有存檔紀錄、結局檔案、已搜集物證、偵探便箋與調查進度。</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[#854d0e]">
                    <span className="shrink-0 font-bold">🔄</span>
                    <span><b>重新開始遊戲</b>：重置後將直接返回主選單，點擊開始遊戲將從頭展開調查。</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#cde0c7]">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowResetConfirm(false);
                    }}
                    className="retro-web-btn px-3.5 py-1 text-xs cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      sound.playResolutionChord();
                      setShowResetConfirm(false);
                      setSaveData(null);
                      if (onResetAllProgress) {
                        onResetAllProgress();
                      }
                    }}
                    className="retro-web-btn px-3.5 py-1 text-xs font-bold text-[#8c2727] border-[#8c2727] hover:bg-[#fff0f0] cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>確定清除所有內容並重新開始</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Investigation Notice Modal (調查須知輕量提示框 - 2000s Retro Style) */}
      <AnimatePresence>
        {showNoticeModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none font-sans">
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 8 }}
              className="retro-forum-modal-window rounded-none max-w-md w-full shadow-lg overflow-hidden text-[#1a2e18]"
            >
              <div className="flex items-center justify-between px-3.5 py-2 retro-forum-modal-header text-[#ffffff]">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#ffffff]" />
                  <h3 className="text-xs sm:text-sm font-bold tracking-wide">
                    安祥路88號 • 偵探調查須知
                  </h3>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowNoticeModal(false);
                  }}
                  className="p-1 rounded-xs border border-[#ffffff]/40 text-[#ffffff] hover:bg-[#ffffff]/20 cursor-pointer"
                  title="關閉"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 bg-[#f4f8f3] space-y-3">
                <div className="space-y-2.5 text-xs leading-relaxed text-[#1a2e18]">
                  <div className="flex items-start gap-2.5 p-3 bg-[#ffffff] border border-[#a8c2a1]">
                    <Brain className="w-4 h-4 text-[#8c2727] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1c3819] block text-xs">注意心智指針狀態變化</span>
                      <p className="text-[#3d5e34] text-[11px] mt-0.5">
                        身處未明空間或目睹違常景象會對精神帶來負擔。當指針偏向危險紅區時，視野將產生雜訊與干擾，請務必尋求安全方式平復心智。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-[#ffffff] border border-[#a8c2a1]">
                    <Search className="w-4 h-4 text-[#1a3964] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1c3819] block text-xs">物證深度鑑識</span>
                      <p className="text-[#3d5e34] text-[11px] mt-0.5">
                        搜集到的證物暗藏玄機。隨身物證可放大檢視細節，尋找未被注意的線索或標記。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-[#ffffff] border border-[#a8c2a1]">
                    <BookOpen className="w-4 h-4 text-[#854d0e] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1c3819] block text-xs">比對各處張貼的守則</span>
                      <p className="text-[#3d5e34] text-[11px] mt-0.5">
                        大樓內張貼著不同單位的公告與工作守則。在推演手冊中比對彼此相異的規定，有助於釐清現場事態。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end border-t border-[#cde0c7]">
                  <button
                    onClick={() => {
                      sound.playPaper();
                      setShowNoticeModal(false);
                    }}
                    className="retro-web-btn w-full py-1.5 px-4 text-xs font-bold text-[#1c3819] cursor-pointer"
                  >
                    我已瞭解，準備調查
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
