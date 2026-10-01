import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCw,
  Sparkles,
  CheckCircle2,
  Search,
  Lightbulb,
  Eye,
  X,
  Film,
  Zap,
  Wrench,
  Gauge,
  Power
} from 'lucide-react';
import { sound } from '../services/soundEngine';
import { ItemInvestigationStep } from '../types';

interface InteractiveEvidenceInspectorProps {
  itemId: string;
  itemName: string;
  step: ItemInvestigationStep;
  onComplete: () => void;
}

export const InteractiveEvidenceInspector: React.FC<InteractiveEvidenceInspectorProps> = ({
  itemId,
  itemName,
  step,
  onComplete
}) => {
  // Mode-specific interactive state
  const isPen = itemId === 'tape_recorder';
  const isFilm = itemId === 'old_camera_film';
  const isKnife = itemId === 'old_case_file' || (step.actionLabel && (step.actionLabel.includes('美工刀') || step.actionLabel.includes('劃開')));
  const isKeycard = itemId === 'guard_keycard' || (step.actionLabel && step.actionLabel.includes('酒精棉片'));
  const isBlueprint = itemId === 'building_blueprints' || (step.actionLabel && (step.actionLabel.includes('暗折頁') || step.actionLabel.includes('剖面')));
  const isMeter = itemId === 'tenant_diary_fragment' || (step.actionLabel && (step.actionLabel.includes('電表') || step.actionLabel.includes('水電')));
  const isElevatorManual = itemId === 'elevator_service_manual' || (step.actionLabel && (step.actionLabel.includes('跳線') || step.actionLabel.includes('PLC')));

  // 1. Pen rotation state
  const [penRotation, setPenRotation] = useState<number>(0);
  const [isPenUnscrewed, setIsPenUnscrewed] = useState<boolean>(false);

  // 2. Film light intensity state
  const [filmLightIntensity, setFilmLightIntensity] = useState<number>(10);
  const [isFilmRevealed, setIsFilmRevealed] = useState<boolean>(false);

  // 3. Box cutter knife slicing state
  const [cutProgress, setCutProgress] = useState<number>(0);
  const [isCutCompleted, setIsCutCompleted] = useState<boolean>(false);
  const [isCutting, setIsCutting] = useState<boolean>(false);
  const cutTrackRef = useRef<HTMLDivElement>(null);

  // 4. Keycard alcohol swab wipe state
  const [swabProgress, setSwabProgress] = useState<number>(0);
  const [isSwabCompleted, setIsSwabCompleted] = useState<boolean>(false);
  const [isSwabbing, setIsSwabbing] = useState<boolean>(false);
  const swabBoxRef = useRef<HTMLDivElement>(null);

  // 5. Blueprint fold peel state
  const [foldProgress, setFoldProgress] = useState<number>(0);
  const [isFoldCompleted, setIsFoldCompleted] = useState<boolean>(false);
  const [isFolding, setIsFolding] = useState<boolean>(false);
  const foldTrackRef = useRef<HTMLDivElement>(null);

  // 6. Meter Magnifying glass focus state
  const [glassPos, setGlassPos] = useState<{ x: number; y: number }>({ x: 20, y: 30 });
  const [isGlassFocused, setIsGlassFocused] = useState<boolean>(false);
  const [isDraggingGlass, setIsDraggingGlass] = useState<boolean>(false);
  const meterBoxRef = useRef<HTMLDivElement>(null);

  // 7. Elevator PLC jumper switch state
  const [jumperSwitches, setJumperSwitches] = useState<{ b404: boolean; alarm5f: boolean; bypass: boolean }>({
    b404: false,
    alarm5f: false,
    bypass: false
  });
  const [isJumperCompleted, setIsJumperCompleted] = useState<boolean>(false);

  // Generic fallback rub state
  const [rubProgress, setRubProgress] = useState<number>(0);
  const [isRubCompleted, setIsRubCompleted] = useState<boolean>(false);

  const [isActionTriggered, setIsActionTriggered] = useState<boolean>(false);

  // 1. Pen rotation handler
  const handleRotatePen = () => {
    sound.playSwitch();
    const nextRot = penRotation + 60;
    setPenRotation(nextRot);
    if (nextRot >= 360 && !isPenUnscrewed) {
      sound.playChime();
      sound.playResolutionChord();
      setIsPenUnscrewed(true);
    }
  };

  // 2. Film light slider handler
  const handleLightSlider = (val: number) => {
    setFilmLightIntensity(val);
    if (val >= 90 && !isFilmRevealed) {
      sound.playChime();
      sound.playResolutionChord();
      setIsFilmRevealed(true);
    }
  };

  // 3. Box cutter drag & slice handlers
  const handlePointerDownCut = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCutCompleted) return;
    setIsCutting(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    handlePointerMoveCut(e);
  };

  const handlePointerMoveCut = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isCutting && e.buttons !== 1) return;
    if (isCutCompleted) return;
    if (!cutTrackRef.current) return;
    const rect = cutTrackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));

    if (pct > cutProgress) {
      if (Math.floor(pct / 15) > Math.floor(cutProgress / 15)) {
        sound.playPaper();
      }
      setCutProgress(pct);
      if (pct >= 95) {
        setCutProgress(100);
        setIsCutCompleted(true);
        sound.playChime();
        sound.playResolutionChord();
      }
    }
  };

  const handlePointerUpCut = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsCutting(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // 4. Alcohol Swab Wiping Handlers
  const handlePointerDownSwab = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isSwabCompleted) return;
    setIsSwabbing(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    handlePointerMoveSwab(e);
  };

  const handlePointerMoveSwab = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSwabbing && e.buttons !== 1) return;
    if (isSwabCompleted) return;
    const next = Math.min(100, swabProgress + 3);
    setSwabProgress(next);
    if (Math.floor(next / 10) > Math.floor(swabProgress / 10)) {
      sound.playPaper();
    }
    if (next >= 100 && !isSwabCompleted) {
      setIsSwabCompleted(true);
      sound.playChime();
      sound.playResolutionChord();
    }
  };

  const handlePointerUpSwab = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsSwabbing(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // 5. Blueprint Fold Drag Handlers
  const handlePointerDownFold = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isFoldCompleted) return;
    setIsFolding(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    handlePointerMoveFold(e);
  };

  const handlePointerMoveFold = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isFolding && e.buttons !== 1) return;
    if (isFoldCompleted) return;
    if (!foldTrackRef.current) return;
    const rect = foldTrackRef.current.getBoundingClientRect();
    const y = rect.bottom - e.clientY;
    const pct = Math.max(0, Math.min(100, (y / rect.height) * 100));

    if (pct > foldProgress) {
      if (Math.floor(pct / 15) > Math.floor(foldProgress / 15)) {
        sound.playPaper();
      }
      setFoldProgress(pct);
      if (pct >= 90) {
        setFoldProgress(100);
        setIsFoldCompleted(true);
        sound.playChime();
        sound.playResolutionChord();
      }
    }
  };

  const handlePointerUpFold = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsFolding(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // 6. Meter Magnifying Glass Drag Handlers
  const handlePointerDownGlass = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingGlass(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    handlePointerMoveGlass(e);
  };

  const handlePointerMoveGlass = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingGlass && e.buttons !== 1) return;
    if (!meterBoxRef.current) return;
    const rect = meterBoxRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100));
    setGlassPos({ x, y });

    // Target focus sweet spot: right-bottom (x between 50 and 85, y between 45 and 85)
    if (x >= 52 && x <= 88 && y >= 45 && y <= 85) {
      if (!isGlassFocused) {
        sound.playChime();
        sound.playResolutionChord();
        setIsGlassFocused(true);
      }
    }
  };

  const handlePointerUpGlass = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingGlass(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // 7. Elevator PLC Jumper toggle handler
  const handleToggleJumper = (key: 'b404' | 'alarm5f' | 'bypass') => {
    sound.playSwitch();
    const nextState = {
      ...jumperSwitches,
      [key]: !jumperSwitches[key]
    };
    setJumperSwitches(nextState);

    // Required combo: B-404 bridged (true) AND alarm5f primed (true)
    if (nextState.b404 && nextState.alarm5f && !isJumperCompleted) {
      sound.playChime();
      sound.playResolutionChord();
      setIsJumperCompleted(true);
    }
  };

  // Generic Rub / Wipe progress handler
  const handleRub = () => {
    sound.playPaper();
    const next = rubProgress + 20;
    setRubProgress(next);
    if (next >= 100 && !isRubCompleted) {
      sound.playChime();
      sound.playResolutionChord();
      setIsRubCompleted(true);
    }
  };

  const handleFinishInspection = () => {
    setIsActionTriggered(true);
    sound.playPaper();
    onComplete();
  };

  const isCurrentStepFinished = isPen 
    ? isPenUnscrewed 
    : isFilm 
    ? isFilmRevealed 
    : isKnife 
    ? isCutCompleted 
    : isKeycard 
    ? isSwabCompleted 
    : isBlueprint 
    ? isFoldCompleted 
    : isMeter 
    ? isGlassFocused 
    : isElevatorManual 
    ? isJumperCompleted 
    : isRubCompleted;

  return (
    <div className="p-4 rounded-xl bg-[#21160e] border-2 border-[#8c5828] text-[#f2e6d0] space-y-4 shadow-xl select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#47301c] pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d4a359] animate-pulse" />
          <span className="font-bold text-xs md:text-sm font-serif text-[#fae0a5]">
            【偵探二度鑑識工作台】：{step.actionLabel || step.label}
          </span>
        </div>
        <span className="text-[10px] font-typewriter px-2 py-0.5 rounded bg-[#382314] text-[#d4a359] border border-[#6b4728]">
          INTERACTIVE INSPECTION
        </span>
      </div>

      {/* 1. Tape Recorder Pen */}
      {isPen && (
        <div className="p-4 rounded-lg bg-[#140e08] border border-[#382516] space-y-4 text-center">
          <p className="text-xs text-[#c7b79d] font-serif">
            手動旋轉筆桿頂端螺旋金屬組件，將筆身完整拆解以檢驗內部晶片：
          </p>

          <div className="py-4 flex flex-col items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: penRotation }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              onClick={handleRotatePen}
              className="w-20 h-20 rounded-full border-4 border-dashed border-[#d4a359] bg-[#2b1b11] flex flex-col items-center justify-center cursor-pointer shadow-lg hover:border-[#fae0a5] hover:scale-105 active:scale-95 transition-all"
            >
              <RotateCw className="w-8 h-8 text-[#d4a359]" />
            </motion.div>

            <span className="text-xs font-typewriter text-[#a88f72]">
              {isPenUnscrewed ? '✓ 筆身螺旋已旋開' : `旋轉解開筆身螺紋 (${Math.min(100, Math.round((penRotation / 360) * 100))}%)`}
            </span>
          </div>

          {isPenUnscrewed && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-[#18261b] border border-[#2e5e39] rounded-lg text-xs text-[#86efac] font-serif space-y-2"
            >
              <div className="flex items-center justify-center gap-1.5 font-bold text-[#4ade80]">
                <CheckCircle2 className="w-4 h-4" />
                <span>筆身內部彈出微型錄音模組與磁帶晶片！</span>
              </div>
              <p className="text-[#bbf7d0] text-center">
                確認原子筆內部實為專業錄音設備，可立即啟動磁帶播放介面聆聽張浩的最後遺言。
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* 2. Kodak Film Lightbox */}
      {isFilm && (
        <div className="p-4 rounded-lg bg-[#140e08] border border-[#382516] space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-[#fae0a5] font-serif font-bold">
              🎞️ 拖曳強光手電筒逆光照射強度，透視黑白負片隱藏的真實顯影：
            </p>
            <p className="text-[11px] text-[#a88f72] font-serif">
              將 35mm 膠卷置於看片燈箱上方，隨著光束穿透乳劑層，隱藏的歷史全家福將由暗轉明
            </p>
          </div>

          {/* 35mm Film Strip Container */}
          <div className="relative bg-[#0c0805] rounded-xl border-2 border-[#422915] p-3 shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] overflow-hidden">
            {/* Top Sprocket Holes (底片齒孔) */}
            <div className="flex justify-between items-center px-2 py-1 mb-2 border-b border-[#2d1b0e] opacity-80 select-none">
              <span className="text-[9px] font-mono text-amber-600/80 font-bold tracking-widest">KODAK PLUS-X 125 // SAFETY FILM • 1998</span>
              <div className="flex gap-2.5">
                {[...Array(9)].map((_, i) => (
                  <div key={`sprocket-top-${i}`} className="w-2.5 h-3.5 rounded-xs bg-[#050302] border border-[#2b190c] shadow-inner" />
                ))}
              </div>
              <span className="text-[9px] font-mono text-amber-600/80 font-bold">FRAME 24A</span>
            </div>

            {/* Central Negative Frame */}
            <div 
              className="relative h-44 rounded-lg border-2 border-[#54351b] flex items-center justify-center overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: `rgb(${Math.round(15 + filmLightIntensity * 1.8)}, ${Math.round(12 + filmLightIntensity * 1.6)}, ${Math.round(10 + filmLightIntensity * 1.3)})`
              }}
            >
              {/* Halftone / Negative Film Grain Overlay */}
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fae0a5_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />

              {/* Underlying Real 1998 Photo */}
              <div 
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 font-serif text-center px-4"
                style={{ opacity: filmLightIntensity / 100 }}
              >
                <div className="bg-[#1c120a]/90 backdrop-blur-xs p-3.5 rounded-xl border border-[#c4924a] text-xs text-[#fae0a5] shadow-2xl max-w-md space-y-1.5">
                  <div className="flex items-center justify-center gap-1.5 font-bold text-sm text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>【1998年404號房住戶全家福真實顯影】</span>
                  </div>
                  <p className="text-[11px] text-[#fbe9c8] leading-relaxed">
                    底片在強光透射下清晰顯影：四樓走廊擺滿搬家紙箱，老少住戶滿臉笑容合影。根本沒有任何怪物，只有普通人溫暖的生活回憶與大樓曾有的煙火氣息！
                  </p>
                  <span className="text-[9px] font-mono text-amber-400/90 block pt-1 border-t border-[#4a2e16]">
                    ISO 125 • EXPOSURE 1/60s • 1998/11/04 ARCHIVED
                  </span>
                </div>
              </div>

              {filmLightIntensity < 40 && (
                <div className="text-center space-y-1 z-10 select-none">
                  <Film className="w-8 h-8 mx-auto text-[#4a3220] animate-pulse" />
                  <span className="text-xs font-mono text-[#8a684a] block">
                    （光線微弱・膠卷一片漆黑，請向右拖曳強光手電筒）
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Sprocket Holes */}
            <div className="flex justify-between items-center px-2 py-1 mt-2 border-t border-[#2d1b0e] opacity-80 select-none">
              <span className="text-[9px] font-mono text-amber-600/80 font-bold">EMULSION 8804</span>
              <div className="flex gap-2.5">
                {[...Array(9)].map((_, i) => (
                  <div key={`sprocket-bot-${i}`} className="w-2.5 h-3.5 rounded-xs bg-[#050302] border border-[#2b190c] shadow-inner" />
                ))}
              </div>
              <span className="text-[9px] font-mono text-amber-600/80 font-bold">24 ►►</span>
            </div>
          </div>

          {/* Handheld Flashlight Slider */}
          <div className="space-y-2 bg-[#1c120a] p-3 rounded-lg border border-[#422915]">
            <div className="flex justify-between text-xs font-mono text-[#fae0a5]">
              <span className="flex items-center gap-1.5 font-bold">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                手電筒逆光照射強度
              </span>
              <span className="text-[#d4a359] font-bold">{filmLightIntensity}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={filmLightIntensity} 
              onChange={(e) => handleLightSlider(Number(e.target.value))}
              className="w-full accent-[#d4a359] cursor-pointer h-2 bg-[#0d0703] rounded-lg border border-[#523319]"
            />
          </div>
        </div>
      )}

      {/* 3. Old Case File Knife Slicing */}
      {isKnife && (
        <div className="p-4 rounded-lg bg-[#140e08] border border-[#382516] space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-[#fae0a5] font-serif font-bold">
              🔪 按住美工刀，沿著舊案卷宗封底虛線向右平整劃開：
            </p>
            <p className="text-[11px] text-[#a88f72] font-serif">
              請用滑鼠或手指按住美工刀圖示，由左至右平直拖曳劃破夾層
            </p>
          </div>

          {/* Slicing Cardboard Surface */}
          <div 
            ref={cutTrackRef}
            onPointerDown={handlePointerDownCut}
            onPointerMove={handlePointerMoveCut}
            onPointerUp={handlePointerUpCut}
            onPointerCancel={handlePointerUpCut}
            className={`relative h-36 rounded-lg bg-[#24170d] border-2 ${
              isCutCompleted ? 'border-emerald-700/80 bg-[#1e130a]' : 'border-[#59391e] cursor-ew-resize active:cursor-grabbing'
            } overflow-hidden shadow-inner p-3 flex flex-col justify-between select-none touch-none`}
          >
            {/* Folder paper texture background detail */}
            <div className="absolute top-2 left-3 text-[10px] font-typewriter text-[#66462c] tracking-widest uppercase">
              CONFIDENTIAL // DOSSIER BACKBOARD SEAM
            </div>

            {/* Polaroid photo hidden inside peering through */}
            <div 
              className="absolute inset-x-4 top-3 bottom-3 bg-[#110b06] rounded border border-[#442c19] flex items-center justify-center p-3 text-center transition-all duration-500 overflow-hidden"
              style={{
                clipPath: isCutCompleted 
                  ? 'inset(0% 0% 0% 0%)' 
                  : `inset(0% ${Math.max(0, 100 - cutProgress)}% 0% 0%)`
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 bg-[#f4ebd0] p-1 border border-[#8f7556] shadow-md shrink-0 flex flex-col items-center justify-between rotate-[-4deg]">
                  <div className="w-full h-8 bg-[#3d3226] flex items-center justify-center text-[7px] text-neutral-300 font-mono">
                    1998 PHOTO
                  </div>
                  <span className="text-[8px] font-serif text-red-700 font-bold">4F走廊</span>
                </div>
                <div className="text-left space-y-0.5">
                  <span className="text-xs font-bold font-serif text-emerald-300 block">
                    ★ 發現封底夾層密件：1998年拍立得
                  </span>
                  <span className="text-[10px] text-[#fae0a5] font-serif block leading-tight">
                    背面血字：「不要相信守則，不要相信白衣警衛的點名。」
                  </span>
                </div>
              </div>
            </div>

            {/* Dotted cutting track seam line */}
            <div className="relative my-auto py-2 z-10 pointer-events-none">
              <div className="w-full h-1 border-b-2 border-dashed border-[#8c5828] relative">
                {/* Completed Cut Slice Line */}
                <div 
                  className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  style={{ width: `${cutProgress}%` }}
                />
              </div>

              {/* Utility Knife (美工刀) Blade Cursor */}
              {!isCutCompleted && (
                <div 
                  className="absolute -top-7 -ml-5 flex flex-col items-center transition-transform duration-75 pointer-events-none"
                  style={{ left: `${cutProgress}%` }}
                >
                  <div className="relative group flex items-center">
                    <div className="relative filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] transform -rotate-45">
                      <div className="w-4 h-6 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-400 border border-slate-500 shadow-sm rounded-t-xs" />
                      <div className="w-5 h-9 bg-amber-500 rounded-b-sm border border-amber-700 -mt-1 flex flex-col items-center justify-center">
                        <div className="w-2.5 h-3 bg-black/70 rounded-xs mb-1" />
                        <div className="w-3 h-0.5 bg-amber-800" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600/70 whitespace-nowrap mt-1 shadow-sm font-bold">
                    {cutProgress === 0 ? '按住劃開 ➔' : `${Math.round(cutProgress)}%`}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Status / Instructions */}
            <div className="flex items-center justify-between text-[11px] font-mono z-10">
              <span className={isCutCompleted ? 'text-emerald-400 font-bold' : 'text-[#a88f72]'}>
                {isCutCompleted ? '✓ 硬紙板封底已完全劃開！' : '沿著中央接縫由左往右割劃'}
              </span>
              <span className="text-[#d4a359] font-bold">
                {Math.round(cutProgress)}%
              </span>
            </div>
          </div>

          {isCutCompleted && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-[#18261b] border border-[#2e5e39] rounded-lg text-xs text-[#86efac] font-serif space-y-1.5"
            >
              <div className="flex items-center justify-center gap-1.5 font-bold text-[#4ade80]">
                <CheckCircle2 className="w-4 h-4" />
                <span>舊案卷宗封底已被美工刀挑開！</span>
              </div>
              <p className="text-[#bbf7d0] text-center leading-relaxed">
                掉出 1998 年第一任失蹤者的四樓走廊拍立得，背面血書警告：「第一任失蹤者留：不要看鏡子，不要回答電梯對講機，不要相信白衣警衛的點名。」，證實大樓自落成起便已存在被封閉的四樓！
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* 4. Guard Keycard Alcohol Swab Wiping */}
      {isKeycard && (
        <div className="p-4 rounded-lg bg-[#140e08] border border-[#382516] space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-[#fae0a5] font-serif font-bold">
              🧼 酒精棉片擦拭磁扣表面油漬：
            </p>
            <p className="text-[11px] text-[#a88f72] font-serif">
              在黑色機油區域來回擦拭，顯露底層被掩蓋的刻字
            </p>
          </div>

          <div
            ref={swabBoxRef}
            onPointerDown={handlePointerDownSwab}
            onPointerMove={handlePointerMoveSwab}
            onPointerUp={handlePointerUpSwab}
            onPointerCancel={handlePointerUpSwab}
            className={`relative h-44 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 border-2 ${
              isSwabCompleted ? 'border-emerald-600 shadow-emerald-950/40 shadow-lg' : 'border-[#6e4e32] cursor-pointer'
            } overflow-hidden p-4 flex flex-col justify-between select-none touch-none shadow-inner`}
          >
            {/* Magnetic Stripe / RFID Chip outline */}
            <div className="absolute top-4 left-4 right-4 h-6 bg-neutral-900 border border-neutral-700 rounded-sm flex items-center px-3 justify-between">
              <span className="text-[9px] font-mono text-neutral-400">RFID SECURITY ACCESS 13.56MHz</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>

            {/* Revealed Text Beneath Grease */}
            <div className="my-auto pt-7 text-center space-y-1 relative z-0">
              <div className="text-xs font-mono font-bold tracking-widest text-amber-300">
                超頻代碼：OVERCLOCK-88404-SEC
              </div>
              <div className="text-[11px] font-serif font-bold text-red-400 bg-red-950/40 py-1 px-2 rounded border border-red-900/60 inline-block">
                「若在監視器第4頻道看見自己，立刻反鎖鐵門，切勿外出求救！」
              </div>
              <div className="text-[9px] font-mono text-neutral-400">
                — 1999 值班警衛留
              </div>
            </div>

            {/* Dark Oil Grease Layer that fades away */}
            <div 
              className="absolute inset-0 bg-[#1a1208]/95 flex flex-col items-center justify-center p-4 transition-opacity duration-150 pointer-events-none z-10"
              style={{ opacity: Math.max(0, 1 - (swabProgress / 100)) }}
            >
              <div className="text-center space-y-1">
                <span className="text-xs font-mono text-[#a88f72] font-bold block">
                  【厚重機油與炭黑附著覆蓋】
                </span>
                <span className="text-[10px] text-[#78593a] font-serif block">
                  按住棉片在卡面均勻來回擦拭
                </span>
              </div>
            </div>

            {/* Interactive Swab Cursor Widget */}
            {!isSwabCompleted && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20 pointer-events-none">
                <div className="w-7 h-7 rounded-full bg-white/90 border-2 border-slate-300 shadow-md flex items-center justify-center text-xs animate-pulse">
                  🧼
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 text-amber-300 border border-amber-600/60">
                  清潔度: {swabProgress}%
                </span>
              </div>
            )}

            {/* Footer status */}
            <div className="flex items-center justify-between text-[11px] font-mono z-20 pt-2 border-t border-neutral-700/50">
              <span className={isSwabCompleted ? 'text-emerald-400 font-bold' : 'text-[#a88f72]'}>
                {isSwabCompleted ? '✓ 油污完全清除！顯現前輩手寫警語' : '來回抹動清潔棉片'}
              </span>
              <span className="text-[#d4a359] font-bold">
                {swabProgress}%
              </span>
            </div>
          </div>

          {isSwabCompleted && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-[#18261b] border border-[#2e5e39] rounded-lg text-xs text-[#86efac] font-serif space-y-1.5"
            >
              <div className="flex items-center justify-center gap-1.5 font-bold text-[#4ade80]">
                <CheckCircle2 className="w-4 h-4" />
                <span>磁扣背面手寫警語與超頻指令已清晰可見！</span>
              </div>
              <p className="text-[#bbf7d0] text-center leading-relaxed">
                證實警衛室過去曾發生嚴重的監視畫面認知侵蝕，歷任警衛皆靠此磁扣反鎖避難。
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* 5. Building Blueprints Fold Peel */}
      {isBlueprint && (
        <div className="p-4 rounded-lg bg-[#140e08] border border-[#382516] space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-[#fae0a5] font-serif font-bold">
              📐 按住圖紙右下角折頁角，向上拖曳翻開黏貼暗層：
            </p>
            <p className="text-[11px] text-[#a88f72] font-serif">
              大樓原始藍圖右下角黏有工務局封存的機房剖面暗頁，請由下往上掀開
            </p>
          </div>

          <div
            ref={foldTrackRef}
            onPointerDown={handlePointerDownFold}
            onPointerMove={handlePointerMoveFold}
            onPointerUp={handlePointerUpFold}
            onPointerCancel={handlePointerUpFold}
            className={`relative h-52 rounded-xl bg-[#0a1620] border-2 ${
              isFoldCompleted ? 'border-cyan-400 shadow-cyan-950/60 shadow-xl' : 'border-[#1e3c54] cursor-ns-resize'
            } overflow-hidden p-3 flex flex-col justify-between select-none touch-none shadow-inner`}
          >
            {/* Blueprint Grid Lines Background with Architectural Scales */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#132f45_1px,transparent_1px),linear-gradient(to_bottom,#132f45_1px,transparent_1px)] bg-[size:14px_14px] opacity-60 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(5,15,25,0.8)_100%)] pointer-events-none" />

            {/* Architectural Blueprint Header */}
            <div className="relative z-0 flex items-center justify-between border-b border-cyan-800/80 pb-1.5 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                  ANHSIANG NO.88 // 1998 MEZZANINE SECTION
                </span>
                <span className="text-[8px] font-mono text-cyan-400/80 border border-cyan-700/80 px-1 rounded">
                  SCALE 1:50
                </span>
              </div>
              <span className="text-[9px] font-mono text-rose-300 font-bold border border-rose-600/80 bg-rose-950/70 px-2 py-0.5 rounded shadow-xs">
                ⚠️ 工務局勒令拆除封存
              </span>
            </div>

            {/* Revealed 4F Central Machinery Core Structural Cross Section */}
            <div className="relative z-0 space-y-1.5 my-auto">
              <div className="p-2.5 bg-[#07131b]/95 rounded-lg border border-cyan-500/70 space-y-1 text-left shadow-lg">
                <div className="text-xs font-serif font-bold text-cyan-200 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                  <span>中央巨型密閉打字機房（通風管道貫穿全棟）</span>
                </div>
                <div className="text-[10px] font-mono text-cyan-300/80 flex items-center gap-3">
                  <span>► 機房尺寸: 14.2m × 8.6m</span>
                  <span>► 隔音夾層: 鉛板 + 雙層石膏</span>
                  <span>► 管道: 直通504號房下緣</span>
                </div>
                <p className="text-[10px] font-serif text-slate-200 leading-relaxed pt-1 border-t border-cyan-900/60">
                  圖紙手繪剖面有力地證實：4樓整層中央根本不是住宅，而是一間被鋼板與鉛板完全封死的大型機房！空氣流與敲擊聲直接透過通風管道灌入各樓層。
                </p>
              </div>
            </div>

            {/* Foldable Top Layer Flap with Real Paper Creases */}
            <div 
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#162e42] via-[#102434] to-transparent border-t-2 border-dashed border-amber-400/90 p-3 pointer-events-none transition-all duration-100 flex flex-col justify-end shadow-2xl"
              style={{
                height: `${Math.max(0, 100 - foldProgress)}%`,
                opacity: foldProgress >= 95 ? 0 : 1
              }}
            >
              {/* Fold Crease Shadow */}
              <div className="absolute top-0 inset-x-0 h-2 bg-black/40 blur-[2px]" />

              <div className="text-center pb-2">
                <span className="text-[11px] font-serif font-bold text-amber-200 bg-[#0c1a24]/95 px-3 py-1 rounded-md border border-amber-400/80 shadow-md">
                  ▲ 按住邊角向上翻開藍圖暗折頁 ({Math.round(foldProgress)}%)
                </span>
              </div>
            </div>

            {/* Bottom Status */}
            <div className="flex items-center justify-between text-[11px] font-mono z-10 pt-1.5 border-t border-cyan-900/80 bg-[#0a1620]/90 px-1">
              <span className={isFoldCompleted ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                {isFoldCompleted ? '✓ 藍圖暗折頁已掀開！機房結構剖面曝光' : '由下往上拖曳折角揭露機密夾層'}
              </span>
              <span className="text-cyan-400 font-bold">
                {Math.round(foldProgress)}%
              </span>
            </div>
          </div>

          {isFoldCompleted && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-[#0d222d] border border-[#1b506b] rounded-lg text-xs text-cyan-200 font-serif space-y-1.5"
            >
              <div className="flex items-center justify-center gap-1.5 font-bold text-cyan-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>四樓中央機房管道物理結構一覽無遺！</span>
              </div>
              <p className="text-cyan-100 text-center leading-relaxed">
                解開了電梯與樓梯間總能聞到機油味並聽見打字機聲的物理原因：全來自中央相通的巨型通風管道。
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* 6. Utility Bill Meter Focus */}
      {isMeter && (
        <div className="p-4 rounded-lg bg-[#140e08] border border-[#382516] space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-[#fae0a5] font-serif font-bold">
              🔍 拖曳隨身放大鏡至存根右下方，對焦核對電表度數與編號：
            </p>
            <p className="text-[11px] text-[#a88f72] font-serif">
              滑動圓形放大鏡至右下角瓦時電表欄位，透光比對總表編號
            </p>
          </div>

          <div
            ref={meterBoxRef}
            onPointerDown={handlePointerDownGlass}
            onPointerMove={handlePointerMoveGlass}
            onPointerUp={handlePointerUpGlass}
            onPointerCancel={handlePointerUpGlass}
            className={`relative h-52 rounded-xl bg-[#282116] border-2 ${
              isGlassFocused ? 'border-amber-500 shadow-amber-950/60 shadow-lg' : 'border-[#63482a] cursor-crosshair'
            } overflow-hidden p-3 select-none touch-none shadow-inner`}
          >
            {/* Bill Receipt Vintage Paper Texture Background */}
            <div className="absolute inset-0 bg-[#352c1e] opacity-90 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#1f170e_1px,transparent_1px)] [background-size:12px_12px] opacity-30 pointer-events-none" />

            {/* Left Edge Perforated Stub Line (打孔齒孔撕痕) */}
            <div className="absolute left-0 inset-y-0 w-3 border-r-2 border-dashed border-[#574328] bg-[#221a11] flex flex-col justify-around items-center py-2 pointer-events-none select-none">
              {[...Array(6)].map((_, i) => (
                <div key={`perf-${i}`} className="w-1.5 h-2.5 rounded-full bg-[#120d08] border border-[#4d381f]" />
              ))}
            </div>

            {/* Water / Coffee Ring Stain (水漬防偽痕跡) */}
            <div className="absolute top-2 right-12 w-24 h-24 rounded-full border-4 border-[#4f3a22]/40 bg-[#302314]/30 blur-[1px] pointer-events-none -rotate-12" />

            {/* Red Management Seal Stamp (管理處紅色方形印泥章) */}
            <div className="absolute right-4 top-2 pointer-events-none border-2 border-red-800/80 bg-red-950/20 text-red-700/80 font-serif font-bold text-[9px] p-1 rounded rotate-[12deg] tracking-widest text-center shadow-xs">
              <div>安祥大樓</div>
              <div>物業管理章</div>
              <div className="text-[7px] border-t border-red-800/60 mt-0.5 font-mono">1998.11.05</div>
            </div>

            {/* Bill Receipt Document Layout */}
            <div className="space-y-1.5 pl-3 text-left font-typewriter text-[#e2d2b8] opacity-90 pointer-events-none relative z-0">
              <div className="flex justify-between border-b-2 border-[#544026] pb-1.5 text-[10px]">
                <span className="font-bold text-[#f7e3c1] tracking-wide">安祥物業管理處・住戶瓦時電費收據存根</span>
                <span className="font-mono text-[#d4a359]">NO. 1998-0504</span>
              </div>
              <div className="text-[11px] font-semibold text-[#fae0a5]">承租地址：安祥路88號 5樓504號房</div>
              <div className="text-[10px] text-neutral-300 font-mono">抄表月份：1998年11月 / 契約容量：15kW / 用電種類：分路表燈</div>
            </div>

            {/* Target Area Outline in Bottom-Right */}
            <div className="absolute right-3 bottom-2.5 w-44 h-22 border-2 border-dashed border-amber-500/80 rounded bg-[#1c140c]/90 p-2 flex flex-col justify-between pointer-events-none shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-amber-400 font-bold uppercase">
                  [ 瓦時電表總號欄位 ]
                </span>
                <span className="text-[8px] bg-red-900/60 text-red-300 px-1 rounded font-mono border border-red-700/50">
                  共用專線
                </span>
              </div>
              <div className="font-mono text-sm font-bold text-amber-200 tracking-wider">
                MTR-0404-X
              </div>
              <span className="text-[8px] font-serif text-amber-400/90 leading-tight">
                【鉛筆批註】：404機房總動力電線路直通，併入504分攤結算
              </span>
            </div>

            {/* Draggable Magnifying Glass Lens */}
            <div
              className={`absolute w-22 h-22 rounded-full border-4 ${
                isGlassFocused ? 'border-emerald-400 bg-emerald-950/50 ring-4 ring-emerald-500/30' : 'border-amber-400 bg-amber-950/40'
              } shadow-2xl flex flex-col items-center justify-center pointer-events-none transition-transform duration-75 backdrop-blur-[0.5px]`}
              style={{
                left: `${glassPos.x}%`,
                top: `${glassPos.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Glass Reflection Glare highlight */}
              <div className="absolute top-1 left-2 w-8 h-4 rounded-full bg-white/30 -rotate-45 pointer-events-none" />
              <Search className={`w-5 h-5 ${isGlassFocused ? 'text-emerald-300' : 'text-amber-300'} mb-0.5`} />
              <span className="text-[8px] font-mono font-bold text-white px-1.5 py-0.5 rounded bg-black/80 border border-white/20">
                {isGlassFocused ? '✓ 對焦命中' : '拖曳放大鏡'}
              </span>
            </div>

            {/* Footer tip */}
            <div className="absolute left-5 bottom-2 text-[10px] font-mono text-[#a88f72] pointer-events-none">
              {isGlassFocused ? '★ 電表代號對焦清晰' : '將放大鏡對準右下方瓦時電表'}
            </div>
          </div>

          {isGlassFocused && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-[#18261b] border border-[#2e5e39] rounded-lg text-xs text-[#86efac] font-serif space-y-1.5"
            >
              <div className="flex items-center justify-center gap-1.5 font-bold text-[#4ade80]">
                <CheckCircle2 className="w-4 h-4" />
                <span>電表號碼「MTR-0404-X」完全吻合！</span>
              </div>
              <p className="text-[#bbf7d0] text-center leading-relaxed">
                504 號房的瓦時電表直通 404 機房專線，證實三十年來管理處皆將 504 號房作為 404 的存在替身！
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* 7. Elevator PLC Jumper Board */}
      {isElevatorManual && (
        <div className="p-4 rounded-lg bg-[#140e08] border border-[#382516] space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-[#fae0a5] font-serif font-bold">
              ⚡ 切換 PLC 控制板電路跳線，驗證 4 樓繞行與強制停靠邏輯：
            </p>
            <p className="text-[11px] text-[#a88f72] font-serif">
              撥動【B-404繞行跳線】與【警報+5F連動開關】，驗證工程師機械防護機制
            </p>
          </div>

          <div className={`p-4 rounded-xl bg-[#121c16] border-2 ${
            isJumperCompleted ? 'border-emerald-500 shadow-emerald-950/60 shadow-lg' : 'border-[#284a37]'
          } space-y-3`}>
            <div className="flex items-center justify-between border-b border-[#284a37] pb-2 text-xs font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                PLC 曳引機主機板跳線模擬器 (YONGDA 1999)
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isJumperCompleted ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-neutral-900 text-neutral-400'
              }`}>
                {isJumperCompleted ? '電路校準完畢' : '等待撥動跳線'}
              </span>
            </div>

            {/* Interactive Toggle Switches Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Switch 1: B-404 Jumper */}
              <button
                type="button"
                onClick={() => handleToggleJumper('b404')}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                  jumperSwitches.b404 
                    ? 'bg-amber-950/60 border-amber-500/80 text-amber-200' 
                    : 'bg-neutral-900/80 border-neutral-700 text-neutral-400 hover:border-neutral-500'
                }`}
              >
                <div>
                  <div className="text-xs font-mono font-bold flex items-center gap-1.5">
                    <Power className={`w-3.5 h-3.5 ${jumperSwitches.b404 ? 'text-amber-400' : 'text-neutral-500'}`} />
                    <span>【跳線 B-404】樓層繞行閉合</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    焊線使指示燈由 3F 逕跳 5F
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  jumperSwitches.b404 ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-500'
                }`}>
                  {jumperSwitches.b404 ? 'ON (通電)' : 'OFF'}
                </span>
              </button>

              {/* Switch 2: Alarm + 5F Force Level */}
              <button
                type="button"
                onClick={() => handleToggleJumper('alarm5f')}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                  jumperSwitches.alarm5f 
                    ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200' 
                    : 'bg-neutral-900/80 border-neutral-700 text-neutral-400 hover:border-neutral-500'
                }`}
              >
                <div>
                  <div className="text-xs font-mono font-bold flex items-center gap-1.5">
                    <Gauge className={`w-3.5 h-3.5 ${jumperSwitches.alarm5f ? 'text-emerald-400' : 'text-neutral-500'}`} />
                    <span>【警報鍵 + 5F】強制停靠</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    長按5秒解鎖四樓安全鉗
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  jumperSwitches.alarm5f ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-500'
                }`}>
                  {jumperSwitches.alarm5f ? 'ON (就緒)' : 'OFF'}
                </span>
              </button>
            </div>

            {isJumperCompleted && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-[#0d2618] border border-[#225e3b] rounded-lg text-xs text-emerald-200 font-serif space-y-1"
              >
                <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>電梯人為跳線原理完全破解！</span>
                </div>
                <p className="text-emerald-100 text-center leading-relaxed">
                  電梯跳過四樓純屬物理焊線繞行，只要長按【警報鍵】+【5樓鍵】即可強制水平校準停靠四樓。
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Fallback Generic Rub / Wipe Inspector */}
      {!isPen && !isFilm && !isKnife && !isKeycard && !isBlueprint && !isMeter && !isElevatorManual && (
        <div className="p-4 rounded-lg bg-[#140e08] border border-[#382516] space-y-4 text-center">
          <p className="text-xs text-[#c7b79d] font-serif">
            使用隨身放大鏡與鑑識工具逐格擦拭、比對物證表面關鍵細節：
          </p>

          <div className="py-2 flex flex-col items-center justify-center gap-3">
            <button
              onClick={handleRub}
              disabled={isRubCompleted}
              className={`px-5 py-2.5 rounded-lg border text-xs font-serif font-bold transition-all shadow-md flex items-center gap-2 ${
                isRubCompleted
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  : 'bg-[#332012] hover:bg-[#47301c] border-[#785227] text-[#fae0a5] active:scale-95'
              }`}
            >
              <Eye className="w-4 h-4 text-[#d4a359]" />
              <span>{isRubCompleted ? '✓ 鑑識比對完畢' : `擦拭透光比對 (${rubProgress}%)`}</span>
            </button>
          </div>

          {isRubCompleted && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-[#18261b] border border-[#2e5e39] rounded-lg text-xs text-[#86efac] font-serif text-center"
            >
              <div className="flex items-center justify-center gap-1.5 font-bold text-[#4ade80] mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>細部實質線索已清晰顯現！</span>
              </div>
              <p className="text-[#bbf7d0]">
                {step.actionText}
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Completion Button */}
      <div className="pt-2">
        <button
          onClick={handleFinishInspection}
          disabled={!isCurrentStepFinished}
          className={`w-full py-2.5 px-4 rounded font-bold text-xs md:text-sm font-serif flex items-center justify-center gap-2 shadow-lg transition-all ${
            isCurrentStepFinished
              ? 'bg-gradient-to-r from-[#b07d3b] via-[#d4a359] to-[#b07d3b] hover:brightness-110 text-[#1a120b] cursor-pointer'
              : 'bg-[#1c120a] border border-[#382516] text-[#6b523b] cursor-not-allowed opacity-60'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>確認鑑識成果・登錄偵探手記</span>
        </button>
      </div>
    </div>
  );
};

