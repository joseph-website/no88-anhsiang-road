import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, Lock, Unlock, RotateCcw, CheckCircle2, 
  FileText, X, BookOpen, RotateCw, Hash, SlidersHorizontal
} from 'lucide-react';
import { sound } from '../../services/soundEngine';

interface SafeDialMinigameModalProps {
  isOpen: boolean;
  clues: Array<{ id: string; title: string; riddleText: string; codeHint: string }>;
  onUnlockSuccess: () => void;
  onClose: () => void;
}

const DEG_PER_TICK = 36; // 360 / 10 = 36 deg

interface LockAngles {
  inner: number; // degrees (clockwise positive)
  outer: number; // degrees (counter-clockwise negative)
}

export const SafeDialMinigameModal: React.FC<SafeDialMinigameModalProps> = ({
  isOpen,
  clues,
  onUnlockSuccess,
  onClose
}) => {
  // Mode: 'dial' (side-by-side mechanical dual-ring) | 'directInput' (4-digit keypad)
  const [activeMode, setActiveMode] = useState<'dial' | 'directInput'>('dial');

  // Continuous angles for Lock 1 and Lock 2
  const [angles1, setAngles1] = useState<LockAngles>({ inner: 0, outer: 0 });
  const [angles2, setAngles2] = useState<LockAngles>({ inner: 0, outer: 0 });

  // Which ring is currently being actively dragged by the user
  const [draggingRing, setDraggingRing] = useState<{ lockNum: 1 | 2; ring: 'inner' | 'outer' } | null>(null);

  // Direct keypad input
  const [directInput, setDirectInput] = useState<string>('');

  // Unlocked & lever animation states
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [leverRotated, setLeverRotated] = useState<boolean>(false);
  const [shakeError, setShakeError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showNotes, setShowNotes] = useState<boolean>(false);

  // Dial element DOM refs
  const dial1Ref = useRef<HTMLDivElement>(null);
  const dial2Ref = useRef<HTMLDivElement>(null);

  // Active dragging tracking ref
  const dragRef = useRef<{
    lockNum: 1 | 2;
    ring: 'inner' | 'outer';
    lastPointerAngle: number;
    lastTickAngle: number;
    lastJamSoundTime: number;
  } | null>(null);

  // Keep references to latest angles to avoid stale closures in listeners
  const anglesRef = useRef<{ 1: LockAngles; 2: LockAngles }>({ 1: angles1, 2: angles2 });
  useEffect(() => {
    anglesRef.current = { 1: angles1, 2: angles2 };
  }, [angles1, angles2]);

  // Sound cooldown
  const lastTickTimeRef = useRef<number>(0);
  const playTickSound = useCallback((frequencyOffset: number = 0) => {
    const now = performance.now();
    if (now - lastTickTimeRef.current > 40) {
      sound.playSafeDialTick(frequencyOffset);
      lastTickTimeRef.current = now;
    }
  }, []);

  // Ratchet jam sound when turning in forbidden direction
  const triggerRatchetJam = useCallback(() => {
    const now = performance.now();
    if (!dragRef.current || now - dragRef.current.lastJamSoundTime > 180) {
      sound.playRatchetLockJam();
      if (dragRef.current) {
        dragRef.current.lastJamSoundTime = now;
      }
    }
  }, []);

  // Compute current discrete digits (0-9)
  const getDigits = useCallback((angles: LockAngles) => {
    const innerDigit = ((Math.round(angles.inner / DEG_PER_TICK) % 10) + 10) % 10;
    const outerDigit = ((Math.round(Math.abs(angles.outer) / DEG_PER_TICK) % 10) + 10) % 10;
    return { inner: innerDigit, outer: outerDigit };
  }, []);

  // STEP BUTTON: INNER RING (Clockwise +1 tick = +36 deg)
  const stepInner = useCallback((lockNum: 1 | 2) => {
    if (isUnlocked) return;
    playTickSound(260);
    setErrorMessage('');

    const currentAngles = anglesRef.current[lockNum];
    const currentTick = Math.round(currentAngles.inner / DEG_PER_TICK);
    const nextAngle = (currentTick + 1) * DEG_PER_TICK;
    anglesRef.current[lockNum] = { ...currentAngles, inner: nextAngle };

    const setter = lockNum === 1 ? setAngles1 : setAngles2;
    setter(prev => ({ ...prev, inner: nextAngle }));
  }, [isUnlocked, playTickSound]);

  // STEP BUTTON: OUTER RING (Counter-Clockwise +1 tick = -36 deg)
  const stepOuter = useCallback((lockNum: 1 | 2) => {
    if (isUnlocked) return;
    playTickSound(140);
    setErrorMessage('');

    const currentAngles = anglesRef.current[lockNum];
    const currentTick = Math.round(currentAngles.outer / DEG_PER_TICK);
    const nextAngle = (currentTick - 1) * DEG_PER_TICK;
    anglesRef.current[lockNum] = { ...currentAngles, outer: nextAngle };

    const setter = lockNum === 1 ? setAngles1 : setAngles2;
    setter(prev => ({ ...prev, outer: nextAngle }));
  }, [isUnlocked, playTickSound]);

  // Calculate pointer angle relative to center of dial
  const getAngleAndRadiusRatio = (e: MouseEvent | TouchEvent, rect: DOMRect) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const ratio = distance / (rect.width / 2);
    return { angle, ratio };
  };

  // Pointer Down on Dial
  const handlePointerDownDial = (e: React.MouseEvent | React.TouchEvent, lockNum: 1 | 2) => {
    if (isUnlocked) return;
    const dialEl = lockNum === 1 ? dial1Ref.current : dial2Ref.current;
    if (!dialEl) return;

    const rect = dialEl.getBoundingClientRect();
    const { angle, ratio } = getAngleAndRadiusRatio(e.nativeEvent, rect);

    // Outer ring: ratio between 0.58 and 1.10
    // Inner ring: ratio between 0.22 and 0.58
    let ring: 'inner' | 'outer' | null = null;
    if (ratio >= 0.58 && ratio <= 1.10) {
      ring = 'outer';
    } else if (ratio >= 0.22 && ratio < 0.58) {
      ring = 'inner';
    }

    if (!ring) return;

    const currentRingAngle = ring === 'inner' 
      ? anglesRef.current[lockNum].inner 
      : anglesRef.current[lockNum].outer;

    dragRef.current = {
      lockNum,
      ring,
      lastPointerAngle: angle,
      lastTickAngle: currentRingAngle,
      lastJamSoundTime: 0
    };
    setDraggingRing({ lockNum, ring });
    setErrorMessage('');
  };

  // Smooth dragging & Release snapping listener
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const drag = dragRef.current;
      if (!drag || isUnlocked) return;
      const { lockNum, ring, lastPointerAngle } = drag;
      const dialEl = lockNum === 1 ? dial1Ref.current : dial2Ref.current;
      if (!dialEl) return;

      const rect = dialEl.getBoundingClientRect();
      const { angle } = getAngleAndRadiusRatio(e, rect);
      let delta = angle - lastPointerAngle;

      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      // Update pointer angle for next move
      drag.lastPointerAngle = angle;

      const currentAngles = anglesRef.current[lockNum];

      if (ring === 'inner') {
        // Inner ring: Clockwise only (delta > 0)
        if (delta < -1.2) {
          triggerRatchetJam();
          return;
        }
        if (delta > 0) {
          const newAngle = currentAngles.inner + delta;
          const prevTick = Math.floor(drag.lastTickAngle / DEG_PER_TICK);
          const nextTick = Math.floor(newAngle / DEG_PER_TICK);
          if (prevTick !== nextTick) {
            playTickSound(260);
            drag.lastTickAngle = newAngle;
          }
          anglesRef.current[lockNum] = { ...currentAngles, inner: newAngle };
          const setter = lockNum === 1 ? setAngles1 : setAngles2;
          setter(prev => ({ ...prev, inner: newAngle }));
        }
      } else if (ring === 'outer') {
        // Outer ring: Counter-Clockwise only (delta < 0)
        if (delta > 1.2) {
          triggerRatchetJam();
          return;
        }
        if (delta < 0) {
          const newAngle = currentAngles.outer + delta;
          const prevTick = Math.floor(Math.abs(drag.lastTickAngle) / DEG_PER_TICK);
          const nextTick = Math.floor(Math.abs(newAngle) / DEG_PER_TICK);
          if (prevTick !== nextTick) {
            playTickSound(140);
            drag.lastTickAngle = newAngle;
          }
          anglesRef.current[lockNum] = { ...currentAngles, outer: newAngle };
          const setter = lockNum === 1 ? setAngles1 : setAngles2;
          setter(prev => ({ ...prev, outer: newAngle }));
        }
      }
    };

    // RELEASE: Smoothly snap to the nearest digit tick!
    const handlePointerUp = () => {
      const drag = dragRef.current;
      if (!drag) return;
      const { lockNum, ring } = drag;
      dragRef.current = null;
      setDraggingRing(null);

      const currentAngles = anglesRef.current[lockNum];
      const setter = lockNum === 1 ? setAngles1 : setAngles2;

      if (ring === 'inner') {
        const nearestTick = Math.round(currentAngles.inner / DEG_PER_TICK);
        const snappedAngle = nearestTick * DEG_PER_TICK;
        anglesRef.current[lockNum] = { ...currentAngles, inner: snappedAngle };
        playTickSound(260);
        setter(prev => ({ ...prev, inner: snappedAngle }));
      } else {
        const nearestTick = Math.round(Math.abs(currentAngles.outer) / DEG_PER_TICK);
        const snappedAngle = -nearestTick * DEG_PER_TICK;
        anglesRef.current[lockNum] = { ...currentAngles, outer: snappedAngle };
        playTickSound(140);
        setter(prev => ({ ...prev, outer: snappedAngle }));
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isUnlocked, playTickSound, triggerRatchetJam]);

  // Reset all locks to 0 smoothly
  const handleResetLocks = () => {
    sound.playClick();
    anglesRef.current = {
      1: { inner: 0, outer: 0 },
      2: { inner: 0, outer: 0 }
    };
    setAngles1({ inner: 0, outer: 0 });
    setAngles2({ inner: 0, outer: 0 });
    setErrorMessage('');
  };

  // Mechanical Unlock Check
  // Rule: Lock 1 inner = 8, outer = 8 (88)
  //       Lock 2 inner = 0, outer = 4 (04)
  const handleTryMechanicalUnlock = () => {
    if (isUnlocked) return;

    const d1 = getDigits(angles1);
    const d2 = getDigits(angles2);

    const isLock1Correct = d1.inner === 8 && d1.outer === 8;
    const isLock2Correct = d2.inner === 0 && d2.outer === 4;

    if (isLock1Correct && isLock2Correct) {
      sound.playKeyUnlock();
      setLeverRotated(true);
      setTimeout(() => {
        setIsUnlocked(true);
        sound.playContradictionBreakthrough();
      }, 300);
      setErrorMessage('');
    } else {
      triggerRatchetJam();
      setShakeError(true);
      setTimeout(() => setShakeError(false), 380);
      setErrorMessage('鎖芯齒輪未完全吻合，保險栓未能開啟。請比對線索重新校準刻度。');
    }
  };

  // Direct 4-digit input verification (target: 8804)
  const handleVerifyDirectInput = () => {
    if (isUnlocked) return;
    const clean = directInput.trim();

    if (clean === '8804') {
      sound.playKeyUnlock();
      setLeverRotated(true);
      setTimeout(() => {
        setIsUnlocked(true);
        sound.playContradictionBreakthrough();
      }, 300);
      setErrorMessage('');
    } else {
      triggerRatchetJam();
      setShakeError(true);
      setTimeout(() => setShakeError(false), 380);
      setErrorMessage('輸入之密碼未能釋放保險栓，請重新核對線索。');
    }
  };

  if (!isOpen) return null;

  const digits1 = getDigits(angles1);
  const digits2 = getDigits(angles2);

  // Render a single Dual-Ring Dial
  const renderDial = (
    lockNum: 1 | 2,
    angles: LockAngles,
    digits: { inner: number; outer: number },
    ref: React.RefObject<HTMLDivElement>
  ) => {
    const isInnerDragging = draggingRing?.lockNum === lockNum && draggingRing?.ring === 'inner';
    const isOuterDragging = draggingRing?.lockNum === lockNum && draggingRing?.ring === 'outer';

    return (
      <div className="flex flex-col items-center space-y-1.5 p-2 sm:p-2.5 rounded-xl bg-black/45 border border-[#3b2716] shadow-inner select-none">
        {/* Dial Title & Current Reading */}
        <div className="w-full flex items-center justify-between px-1 text-xs font-mono">
          <span className="text-amber-400 font-bold">
            {lockNum === 1 ? '一號鎖芯（左）' : '二號鎖芯（右）'}
          </span>
          <span className="text-neutral-300 font-bold bg-black/40 px-1.5 py-0.5 rounded border border-neutral-800">
            內 {digits.inner} • 外 {digits.outer}
          </span>
        </div>

        {/* DIAL HOUSING */}
        <div className="relative flex items-center justify-center my-0.5">
          {/* 12 o'clock Alignment Pointer Marker */}
          <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-rose-500 drop-shadow-[0_2px_5px_rgba(244,63,94,0.95)]" />
          </div>

          {/* Dial Base Container (touch/mouse draggable) */}
          <div
            ref={ref}
            onMouseDown={(e) => handlePointerDownDial(e, lockNum)}
            onTouchStart={(e) => handlePointerDownDial(e, lockNum)}
            style={{ touchAction: 'none' }}
            className="w-[196px] h-[196px] sm:w-[236px] sm:h-[236px] rounded-full p-1.5 bg-gradient-to-br from-[#4a321c] via-[#2a1b0e] to-[#0e0703] border-4 border-[#6b4725] shadow-[0_6px_24px_rgba(0,0,0,0.9),inset_0_2px_6px_rgba(255,215,0,0.2)] relative flex items-center justify-center cursor-pointer select-none"
          >
            {/* 1. OUTER RING (Second Digit, Counter-Clockwise Only, 10 Ticks 0-9) */}
            <div
              style={{ 
                transform: `rotate(${angles.outer}deg)`,
                transition: isOuterDragging ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2)'
              }}
              className="absolute inset-1.5 rounded-full bg-gradient-to-br from-[#2a1d12] via-[#191007] to-[#0a0502] border-2 border-amber-500/80 shadow-[inset_0_0_14px_rgba(0,0,0,0.95)] flex items-center justify-center pointer-events-none"
            >
              {/* Primary Ticks & Clear Enlarged Numbers */}
              {Array.from({ length: 10 }).map((_, i) => {
                const angle = i * DEG_PER_TICK;
                return (
                  <div
                    key={`outer-${i}`}
                    className="absolute inset-0 flex justify-center pointer-events-none"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <div className="w-1 sm:w-1.5 h-3 sm:h-3.5 bg-amber-400 rounded-b shadow-[0_0_5px_rgba(245,158,11,0.9)]" />
                    <span 
                      className="absolute top-3.5 sm:top-4 text-xs sm:text-sm font-mono font-black text-amber-100 select-none tracking-normal drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                    >
                      {i}
                    </span>
                  </div>
                );
              })}

              {/* Intermediate sub-ticks between digits */}
              {Array.from({ length: 10 }).map((_, i) => {
                const subAngle = i * DEG_PER_TICK + 18;
                return (
                  <div
                    key={`outer-sub-${i}`}
                    className="absolute inset-0 flex justify-center pointer-events-none"
                    style={{ transform: `rotate(${subAngle}deg)` }}
                  >
                    <div className="w-0.5 h-1.5 sm:h-2 bg-amber-500/40 rounded-b" />
                  </div>
                );
              })}
            </div>

            {/* Subtle Ring Divider Groove */}
            <div className="absolute w-[124px] h-[124px] sm:w-[150px] sm:h-[150px] rounded-full border-2 border-[#523519] pointer-events-none" />

            {/* 2. INNER RING (First Digit, Clockwise Only, 10 Ticks 0-9) */}
            <div
              style={{ 
                transform: `rotate(${angles.inner}deg)`,
                transition: isInnerDragging ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2)'
              }}
              className="absolute w-[124px] h-[124px] sm:w-[150px] sm:h-[150px] rounded-full bg-gradient-to-br from-[#1c120a] via-[#110904] to-[#070301] border-2 border-cyan-500/70 shadow-[inset_0_0_10px_rgba(0,0,0,0.95)] flex items-center justify-center pointer-events-none"
            >
              {Array.from({ length: 10 }).map((_, i) => {
                const angle = -i * DEG_PER_TICK;
                return (
                  <div
                    key={`inner-${i}`}
                    className="absolute inset-0 flex justify-center pointer-events-none"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <div className="w-0.5 sm:w-1 h-2.5 sm:h-3 bg-cyan-400 rounded-b shadow-[0_0_4px_rgba(34,211,238,0.9)]" />
                    <span 
                      className="absolute top-3 sm:top-3.5 text-[11px] sm:text-xs font-mono font-black text-cyan-100 select-none tracking-normal drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                    >
                      {i}
                    </span>
                  </div>
                );
              })}

              {/* Intermediate sub-ticks for inner ring */}
              {Array.from({ length: 10 }).map((_, i) => {
                const subAngle = -(i * DEG_PER_TICK + 18);
                return (
                  <div
                    key={`inner-sub-${i}`}
                    className="absolute inset-0 flex justify-center pointer-events-none"
                    style={{ transform: `rotate(${subAngle}deg)` }}
                  >
                    <div className="w-0.5 h-1 sm:h-1.5 bg-cyan-600/40 rounded-b" />
                  </div>
                );
              })}
            </div>

            {/* 3. CENTER BRASS KNOB */}
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-br from-[#52371d] via-[#2c1d0f] to-[#140b05] border-2 border-amber-400/80 shadow-[0_3px_10px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center pointer-events-none z-10">
              <div className="text-sm sm:text-base font-mono font-black text-amber-100 flex items-center gap-0.5">
                <span className="text-cyan-300">{digits.inner}</span>
                <span className="text-neutral-500 text-xs">:</span>
                <span className="text-amber-300">{digits.outer}</span>
              </div>
              <div className="text-[7px] sm:text-[8px] font-mono text-neutral-400">
                內 : 外
              </div>
            </div>
          </div>
        </div>

        {/* STEP BUTTONS PER DIAL */}
        <div className="w-full grid grid-cols-2 gap-1 pt-0.5">
          <button
            onClick={() => stepInner(lockNum)}
            disabled={isUnlocked}
            className="py-1 px-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 active:scale-95 border border-cyan-600/70 text-cyan-100 text-[10px] sm:text-[11px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-40 shadow-sm"
          >
            <span>內圈 ⟳</span>
            <RotateCw className="w-2.5 h-2.5 text-cyan-400" />
          </button>

          <button
            onClick={() => stepOuter(lockNum)}
            disabled={isUnlocked}
            className="py-1 px-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900/90 active:scale-95 border border-amber-600/70 text-amber-100 text-[10px] sm:text-[11px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-40 shadow-sm"
          >
            <RotateCcw className="w-2.5 h-2.5 text-amber-400" />
            <span>外圈 ⟲</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-3 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          className={`w-full max-w-xl sm:max-w-2xl md:max-w-3xl max-h-[95vh] retro-forum-modal-window rounded-none shadow-2xl overflow-hidden flex flex-col relative ${
            shakeError ? 'animate-shake' : ''
          }`}
        >
          {/* Header */}
          <div className="retro-forum-modal-header px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-between border-b border-[#2e4d26] shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-[#24421f] text-white">
                {isUnlocked ? <Unlock className="w-4 h-4 text-[#a8e69e]" /> : <Lock className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white">
                  發財樹暗格雙環機械保險鎖
                </h2>
                <div className="text-[10px] font-mono text-[#d8ecd2]">
                  並列雙鎖芯機構 // 內圈為首位數字，外圈為次位數字
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Mode switch */}
              <div className="flex items-center p-0.5 bg-[#24421f] border border-[#3e6634]">
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveMode('dial');
                  }}
                  className={`px-2 py-0.5 text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                    activeMode === 'dial'
                      ? 'bg-[#ffffff] text-[#1a3964] font-bold shadow-xs'
                      : 'text-[#d8ecd2] hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>機械轉盤</span>
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveMode('directInput');
                  }}
                  className={`px-2 py-0.5 text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                    activeMode === 'directInput'
                      ? 'bg-[#ffffff] text-[#1a3964] font-bold shadow-xs'
                      : 'text-[#d8ecd2] hover:text-white'
                  }`}
                >
                  <Hash className="w-3 h-3" />
                  <span>直接輸入</span>
                </button>
              </div>

              {/* Notes toggle */}
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`p-1 border text-xs transition-colors cursor-pointer ${
                  showNotes ? 'bg-[#ffffff] border-[#3e6634] text-[#1a3964] font-bold' : 'bg-[#24421f] border-[#3e6634] text-[#d8ecd2]'
                }`}
                title="切換線索備忘"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className="p-1 text-[#d8ecd2] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="bg-[#ffffff] p-2.5 sm:p-3.5 space-y-2.5 overflow-y-auto custom-scrollbar flex-1 text-[#222222]">
            
            {/* Clue Notes Accordion */}
            {showNotes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-2.5 bg-[#f7faf5] border border-[#a8c2a1] text-[11px] space-y-1 shadow-2xs"
              >
                <div className="text-[#1a3964] font-mono font-bold">
                  【現場勘查筆記摘要】：
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {clues.map((c) => (
                    <div key={c.id} className="p-1.5 bg-[#ffffff] border border-[#d8ecd2] space-y-0.5">
                      <div className="text-[#1a3964] font-bold text-[10px]">{c.title}</div>
                      <div className="text-[#444444] leading-relaxed text-[10px]">{c.riddleText}</div>
                      <div className="text-[#2b5420] font-mono font-bold text-[9px]">{c.codeHint}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* MODE 1: SIDE-BY-SIDE DUAL DIALS */}
            {activeMode === 'dial' && (
              <div className="space-y-2">
                
                {/* Mechanical Rules */}
                <div className="px-2.5 py-1 bg-[#f0f8ed] border border-[#b2cca9] text-[10px] sm:text-[11px] font-mono text-[#2b5420] font-bold flex flex-wrap items-center justify-between gap-1.5">
                  <div>
                    <span>內圈（首位）：順時針</span>
                  </div>
                  <div>
                    <span>外圈（次位）：逆時針</span>
                  </div>
                </div>

                {/* TWO DIALS SIDE-BY-SIDE IN 2 COLUMNS */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3.5 w-full">
                  {renderDial(1, angles1, digits1, dial1Ref)}
                  {renderDial(2, angles2, digits2, dial2Ref)}
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-0.5 flex flex-col items-center space-y-1.5">
                  <div className="w-full flex items-center justify-between text-xs font-mono text-[#556652] px-1">
                    <div>
                      對齊狀態：一號 [{digits1.inner}{digits1.outer}] • 二號 [{digits2.inner}{digits2.outer}]
                    </div>
                    <button
                      onClick={handleResetLocks}
                      disabled={isUnlocked}
                      className="retro-web-btn px-2.5 py-0.5 text-[#1a3964] text-xs font-bold cursor-pointer"
                    >
                      [ 歸零重置 ]
                    </button>
                  </div>

                  {/* Lever button */}
                  <button
                    onClick={handleTryMechanicalUnlock}
                    disabled={isUnlocked}
                    className={`w-full py-2 sm:py-2.5 border flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer ${
                      isUnlocked
                        ? 'bg-[#eef5eb] border-[#3e6634] text-[#1c3a14]'
                        : 'retro-web-btn text-[#1a3964] hover:text-[#b30000]'
                    }`}
                  >
                    <Key className={`w-4 h-4 transition-transform duration-300 ${leverRotated ? 'rotate-90 text-[#2b5420]' : ''}`} />
                    <span>{isUnlocked ? '✓ 鎖芯已彈開，保險箱已開啟' : '[ 扳動連動保險栓開鎖 ]'}</span>
                  </button>

                  {errorMessage && (
                    <div className="text-xs text-red-600 font-mono text-center font-bold">
                      {errorMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODE 2: DIRECT KEYPAD INPUT */}
            {activeMode === 'directInput' && (
              <div className="p-3 sm:p-4 bg-[#f7faf5] border border-[#a8c2a1] flex flex-col items-center justify-center space-y-3 select-none shadow-2xs">
                <div className="text-center space-y-0.5">
                  <div className="text-xs font-mono text-[#1a3964] font-bold uppercase">
                    四位數保險密碼輸入
                  </div>
                  <div className="text-xs text-[#556652]">
                    依據現場線索推導之四位數暗格密碼進行驗證。
                  </div>
                </div>

                {/* 4 Digit Slots */}
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3].map((idx) => {
                    const char = directInput[idx] || '';
                    return (
                      <div
                        key={idx}
                        className={`w-10 h-12 sm:w-12 sm:h-14 border-2 flex items-center justify-center text-xl sm:text-2xl font-mono font-black transition-all ${
                          char
                            ? 'bg-[#ffffff] border-[#2b5420] text-[#1a3964]'
                            : 'bg-[#eef5eb] border-[#b2cca9] text-[#777777]'
                        }`}
                      >
                        {char || '—'}
                      </div>
                    );
                  })}
                </div>

                {/* Virtual Keypad */}
                <div className="w-full max-w-xs space-y-1.5">
                  <div className="grid grid-cols-3 gap-1.5">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        onClick={() => {
                          if (directInput.length < 4) {
                            sound.playClick();
                            setDirectInput(prev => prev + digit);
                          }
                        }}
                        disabled={isUnlocked || directInput.length >= 4}
                        className="retro-web-btn py-1.5 text-[#1a3964] hover:text-[#b30000] font-mono font-bold text-base cursor-pointer disabled:opacity-40"
                      >
                        {digit}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        sound.playClick();
                        setDirectInput('');
                      }}
                      disabled={isUnlocked || directInput.length === 0}
                      className="retro-web-btn py-1.5 text-[#666666] hover:text-[#b30000] text-xs font-bold cursor-pointer disabled:opacity-40"
                    >
                      清除
                    </button>

                    <button
                      onClick={() => {
                        if (directInput.length < 4) {
                          sound.playClick();
                          setDirectInput(prev => prev + '0');
                        }
                      }}
                      disabled={isUnlocked || directInput.length >= 4}
                      className="retro-web-btn py-1.5 text-[#1a3964] hover:text-[#b30000] font-mono font-bold text-base cursor-pointer disabled:opacity-40"
                    >
                      0
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setDirectInput(prev => prev.slice(0, -1));
                      }}
                      disabled={isUnlocked || directInput.length === 0}
                      className="retro-web-btn py-1.5 text-[#666666] hover:text-[#b30000] text-xs font-bold cursor-pointer disabled:opacity-40"
                    >
                      ⌫
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleVerifyDirectInput}
                      disabled={isUnlocked || directInput.length !== 4}
                      className={`w-full py-2 border flex items-center justify-center gap-2 text-xs font-bold shadow-xs transition-all cursor-pointer ${
                        isUnlocked
                          ? 'bg-[#eef5eb] border-[#3e6634] text-[#1c3a14]'
                          : directInput.length === 4
                            ? 'retro-web-btn text-[#1a3964] hover:text-[#b30000]'
                            : 'bg-[#f0f0f0] border-[#cccccc] text-[#999999] cursor-not-allowed'
                      }`}
                    >
                      <Key className="w-4 h-4" />
                      <span>{isUnlocked ? '✓ 密碼吻合，暗格已開啟' : '[ 驗證密碼並開啟保險栓 ]'}</span>
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="text-xs text-red-600 font-mono text-center font-bold">
                    {errorMessage}
                  </div>
                )}
              </div>
            )}

            {/* Unlock Success Reveal */}
            {isUnlocked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-[#eef5eb] border border-[#7ba770] space-y-2 shadow-sm"
              >
                <div className="flex items-center gap-2 text-[#1c3a14] font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#2b5420]" />
                  <span>【保險箱解鎖成功】暗格精鋼櫃門已開啟！</span>
                </div>
                <div className="text-xs text-[#222222] leading-relaxed bg-[#ffffff] p-2.5 border border-[#a8c2a1] space-y-1">
                  <div>
                    伴隨沉重的金屬轉軸聲，保險箱門順利彈開。最底層整齊存放著老所長當年封存的<b>【安祥路88號舊案卷宗】</b>。
                  </div>
                  <div className="text-[#556652] text-[11px] italic">
                    「記錄顯示半年前曾有前任房客在搬入後離奇失聯，房東當時宣稱房客違約搬走，但所有個人證件與隨身物資皆留在屋內……」
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onUnlockSuccess();
                    }}
                    className="retro-web-btn px-4 py-2 text-[#1a3964] hover:text-[#b30000] font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>[ 收納舊案卷宗，備案接待委託人 ➔ ]</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
