import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flashlight,
  Hammer,
  Sparkles,
  Volume2,
  CheckCircle2,
  ShieldAlert,
  Heart,
  User,
  Activity
} from 'lucide-react';
import { sound } from '../services/soundEngine';
import { TraitId, EndingId } from '../types';
import { TRAIT_RESCUE_HINTS } from '../data/traitMonologues';

interface ZhangHaoRescueModalProps {
  isOpen: boolean;
  trait: TraitId;
  initialStep?: 1 | 2 | 3;
  isFlashlightOn: boolean;
  onToggleFlashlight: () => void;
  onCompleteRescue: (endingId: EndingId) => void;
  onClose: () => void;
}

export const ZhangHaoRescueModal: React.FC<ZhangHaoRescueModalProps> = ({
  isOpen,
  trait,
  initialStep = 1,
  isFlashlightOn,
  onToggleFlashlight,
  onCompleteRescue,
  onClose
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  const [isStriking, setIsStriking] = useState<boolean>(false);
  const [strikeCount, setStrikeCount] = useState<number>(0);
  const [isRescued, setIsRescued] = useState<boolean>(false);

  const rescueHint = TRAIT_RESCUE_HINTS[trait];

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setIsRescued(false);
      setStrikeCount(0);
      // Play scratch sound tension on enter
      sound.playTension();
    }
  }, [isOpen, initialStep]);

  if (!isOpen) return null;

  // Step 1: Discover fissure with flashlight
  const handleStep1Observe = () => {
    if (!isFlashlightOn) {
      sound.playPaper();
      return;
    }
    sound.playKnock();
    setStep(2);
  };

  // Step 2: Peer inside crack and discover Zhang Hao
  const handleStep2Explore = () => {
    if (!isFlashlightOn) {
      sound.playPaper();
      return;
    }
    sound.playInspectSuccess();
    setStep(3);
  };

  // Step 3: Axe striking sequence
  const handleStrikeWall = () => {
    if (isStriking || isRescued) return;
    setIsStriking(true);
    sound.playKnock();

    const nextCount = strikeCount + 1;
    setStrikeCount(nextCount);

    setTimeout(() => {
      setIsStriking(false);
      if (nextCount >= 3) {
        // Complete breakthrough!
        sound.playContradictionBreakthrough();
        setIsRescued(true);
      }
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-black/95 backdrop-blur-md font-serif select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="w-full max-w-4xl bg-[#140e0a] border-2 border-[#825c33] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col relative my-auto"
        >
          {/* Subtle Vintage Corner Brackets */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400 m-1 pointer-events-none" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400 m-1 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400 m-1 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400 m-1 pointer-events-none" />

          {/* Top Emergency Stage Header */}
          <div className="bg-gradient-to-r from-[#24150c] via-[#3a2214] to-[#24150c] border-b-2 border-[#6d4d2b] px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1a0f08] border border-amber-600/80 text-amber-400 flex items-center justify-center shadow-inner">
                <Hammer className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase bg-[#26150a] px-2 py-0.5 rounded border border-amber-800">
                    502 室內緊急現場勘查
                  </span>
                  <span className="text-[11px] font-mono text-amber-200/80">
                    階段 {step}/3：{step === 1 ? '異音定位' : step === 2 ? '夾層窺探' : '實施破拆'}
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-bold text-[#faeedc] tracking-wide mt-0.5">
                  安祥路88號・隔間牆西西酥酥怪聲與救援行動
                </h1>
              </div>
            </div>

            {/* Tactical Flashlight Control Button in Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleFlashlight();
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isFlashlightOn
                    ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow-amber-500/20'
                    : 'bg-[#221610] text-amber-300 border-[#69482b] hover:border-amber-400'
                }`}
              >
                <Flashlight className={`w-3.5 h-3.5 ${isFlashlightOn ? 'text-neutral-950 fill-neutral-950' : 'text-amber-400'}`} />
                <span>{isFlashlightOn ? '手電筒：開啟' : '手電筒：關閉'}</span>
              </button>

              {!isRescued && (
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-[#20150e] hover:bg-[#2b1d14] text-neutral-400 hover:text-neutral-200 text-xs transition-colors border border-[#483320] cursor-pointer"
                >
                  暫時後退
                </button>
              )}
            </div>
          </div>

          {/* Main Visual & Interactive Stage */}
          <div className="p-4 sm:p-6 space-y-5">
            {/* Visual Simulated Wall Canvas */}
            <div className="relative w-full h-56 sm:h-72 rounded-xl border-2 border-[#543b22] bg-[#1a130e] overflow-hidden flex items-center justify-center shadow-inner">
              {/* Wallpaper & Texture */}
              <div 
                className="absolute inset-0 opacity-40 mix-blend-multiply bg-[radial-gradient(#4a3320_1px,transparent_1px)] [background-size:16px_16px]"
              />

              {/* Darkness Overlay if Flashlight is OFF */}
              {!isFlashlightOn && (
                <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center mb-3">
                    <Flashlight className="w-6 h-6 text-neutral-500" />
                  </div>
                  <h3 className="text-amber-200 font-bold text-sm mb-1">室內視線昏暗・陰影覆蓋</h3>
                  <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
                    房間光線昏暗，牆角裂縫處深不見底，僅憑肉眼無法看清內部結構，需開啟隨身強光手電筒照射探測。
                  </p>
                  <button
                    onClick={() => {
                      sound.playClick();
                      onToggleFlashlight();
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <Flashlight className="w-4 h-4 fill-neutral-950" />
                    <span>立即開啟強光手電筒</span>
                  </button>
                </div>
              )}

              {/* Flashlight Spotlight Glow Effect when ON */}
              {isFlashlightOn && (
                <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,236,180,0.18)_0%,rgba(20,14,10,0.85)_75%)]" />
              )}

              {/* STEP 1: The Wall & Fissure View */}
              {step === 1 && isFlashlightOn && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative z-10 flex flex-col items-center text-center p-4"
                >
                  {/* Wall Crack Graphic */}
                  <div className="w-24 sm:w-32 h-36 border-l-2 border-r-2 border-dashed border-[#855e34] relative flex items-center justify-center my-2">
                    <div className="w-0.5 h-full bg-neutral-950 shadow-[0_0_8px_rgba(0,0,0,0.9)]" />
                    <div className="absolute top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#2a1b12] border border-[#6d4d2b] text-[10px] text-amber-300 font-mono animate-pulse flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-amber-400" />
                      <span>沙沙……抓撓聲源頭</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-[13px] text-[#f0e0cc] font-serif max-w-lg mt-2 leading-relaxed">
                    壁紙翹起發黃的縫隙深處，傳來極為急促的抓撓聲，且夾雜著微弱的斷續喘息！
                  </p>
                </motion.div>
              )}

              {/* STEP 2: The Face Inside The Crack */}
              {step === 2 && isFlashlightOn && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 flex flex-col items-center text-center p-4 max-w-lg"
                >
                  <div className="w-24 h-24 rounded-full border-2 border-rose-600/70 bg-[#1f110c] shadow-[0_0_25px_rgba(225,29,72,0.2)] flex items-center justify-center relative overflow-hidden mb-2">
                    <User className="w-12 h-12 text-rose-300/80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 via-transparent to-transparent" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-950/80 border border-rose-600/80 text-rose-300 font-mono text-[11px] font-bold mb-2">
                    <Activity className="w-3 h-3 text-rose-400 animate-pulse" />
                    <span>確認生命體徵：失蹤者【張浩】受困中空夾層！</span>
                  </div>
                  <p className="text-xs sm:text-[12.5px] text-[#f5ebd9] leading-relaxed">
                    強光直射夾層——赫然映出一張因恐懼與極度脫水而蒼白的青年面容！滿是血漬的指甲正在刮擦石膏內壁求救，正是張浩！
                  </p>
                </motion.div>
              )}

              {/* STEP 3: Breaching The Wall */}
              {step === 3 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative z-10 flex flex-col items-center text-center p-4 w-full"
                >
                  {!isRescued ? (
                    <div className="space-y-3 flex flex-col items-center">
                      {/* Strike Progress */}
                      <div className="flex items-center gap-2">
                        {[1, 2, 3].map((idx) => (
                          <div
                            key={idx}
                            className={`w-12 h-2.5 rounded-full transition-all border ${
                              strikeCount >= idx
                                ? 'bg-amber-500 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                : 'bg-[#2b1c12] border-[#5a3b22]'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="text-xs text-amber-200 font-mono">
                        破拆進度：{strikeCount} / 3 擊【{strikeCount === 0 ? '蓄力中' : strikeCount === 1 ? '石膏開裂' : '龍骨鬆脫'}】
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        disabled={isStriking}
                        onClick={handleStrikeWall}
                        className={`px-6 sm:px-8 py-3.5 rounded-xl font-bold font-serif text-sm sm:text-base shadow-xl transition-all flex items-center gap-3 cursor-pointer border ${
                          isStriking 
                            ? 'bg-neutral-800 text-neutral-400 border-neutral-700' 
                            : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-neutral-950 border-amber-300 hover:brightness-110'
                        }`}
                      >
                        <Hammer className={`w-5 h-5 ${isStriking ? 'animate-spin' : ''}`} />
                        <span>{isStriking ? '全力揮擊中……' : '掄起消防斧・全力破拆隔板！'}</span>
                      </motion.button>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 rounded-xl bg-[#1e2718] border-2 border-[#5b8344] max-w-lg text-center space-y-2 shadow-2xl"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#151f11] border border-[#6b9651] text-[#9bd183] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#b4e69a]">
                        【破牆成功！張浩獲救！】
                      </h3>
                      <p className="text-xs sm:text-[13px] text-[#e3edd9] leading-relaxed">
                        伴隨轟然巨響，石膏隔板徹底崩開！你伸手探入夾層，將虛弱無比、嚴重脫水的張浩安全拉出，平放在通風地毯上！
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Detective Trait Guidance & Thought Box */}
            <div className="p-4 rounded-xl bg-[#1d140e] border border-[#5d4128] space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#432d1c] pb-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{rescueHint.badge}</span>
                </div>
                <span className="text-[11px] font-mono text-amber-400/80 bg-[#291b12] px-2 py-0.5 rounded border border-[#614227]">
                  救援戰略指示
                </span>
              </div>

              <div className="text-xs sm:text-[12.5px] text-[#f2e4d0] leading-relaxed font-serif">
                {step === 1 && rescueHint.step1WallHint}
                {step === 2 && rescueHint.step2CrackHint}
                {step === 3 && !isRescued && rescueHint.step3BreakHint}
                {isRescued && rescueHint.actionCompletionText}
              </div>

              <div className="text-[11px] text-amber-300/90 font-mono italic pt-1 border-t border-[#3c2819] flex items-center gap-1.5">
                <span>💡 戰略核心：</span>
                <span>{rescueHint.rescueStrategyHint}</span>
              </div>
            </div>

            {/* Bottom Actions based on Step */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#3a2719]">
              <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>受困者的氣息逐漸微弱，你打算……</span>
              </div>

              <div className="flex items-center gap-3">
                {step === 1 && (
                  <button
                    onClick={handleStep1Observe}
                    disabled={!isFlashlightOn}
                    className={`px-5 py-2.5 rounded-xl font-bold font-serif text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                      isFlashlightOn
                        ? 'bg-amber-600 hover:bg-amber-500 text-neutral-950 border border-amber-300 shadow-md'
                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                    }`}
                  >
                    <span>【步驟 1】強光照射觀察裂痕 ➔</span>
                  </button>
                )}

                {step === 2 && (
                  <button
                    onClick={handleStep2Explore}
                    disabled={!isFlashlightOn}
                    className={`px-5 py-2.5 rounded-xl font-bold font-serif text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                      isFlashlightOn
                        ? 'bg-amber-600 hover:bg-amber-500 text-neutral-950 border border-amber-300 shadow-md'
                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                    }`}
                  >
                    <span>【步驟 2】向夾層深處探照 ➔</span>
                  </button>
                )}

                {isRescued && (
                  <button
                    onClick={() => {
                      sound.playContradictionBreakthrough();
                      onCompleteRescue('ending0');
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:brightness-110 text-neutral-950 font-bold font-serif text-sm transition-all shadow-xl flex items-center gap-2 border border-emerald-300 cursor-pointer animate-pulse"
                  >
                    <Heart className="w-4 h-4 fill-neutral-950" />
                    <span>撥打119緊急送醫，圓滿破案→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
