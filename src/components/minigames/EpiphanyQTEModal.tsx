import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Clock, AlertCircle, CheckCircle2, 
  Brain, ChevronRight, X, DoorOpen, Compass, Search
} from 'lucide-react';
import { EpiphanyQTEConfig, EpiphanyOption } from '../../data/epiphanyQTEData';
import { sound } from '../../services/soundEngine';
import { TraitId } from '../../types';
import { TRAIT_RESCUE_HINTS } from '../../data/traitMonologues';

interface EpiphanyQTEModalProps {
  config: EpiphanyQTEConfig;
  isOpen: boolean;
  trait?: TraitId;
  onSuccess: (configId: string) => void;
  onFailure?: (configId?: string) => void;
  onProceedAnyway?: (configId: string) => void;
  onClose: () => void;
}

export const EpiphanyQTEModal: React.FC<EpiphanyQTEModalProps> = ({
  config,
  isOpen,
  trait,
  onSuccess,
  onFailure,
  onProceedAnyway,
  onClose
}) => {
  // Countdown limit (configurable per QTE, default 10s)
  const TOTAL_TIME = config.timeLimit || 10;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME);
  const [selectedOption, setSelectedOption] = useState<EpiphanyOption | null>(null);
  const [status, setStatus] = useState<'thinking' | 'correct' | 'incorrect' | 'timeout'>('thinking');
  const timerRef = useRef<number | null>(null);

  // Initialize and run countdown
  useEffect(() => {
    if (!isOpen) return;

    const initialTime = config.timeLimit || 10;
    setTimeLeft(initialTime);
    setSelectedOption(null);
    setStatus('thinking');

    // Subtle audio cue for epiphany
    sound.playInspectSuccess();

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setStatus('timeout');
          sound.playClick();
          return 0;
        }
        // Subtle tick sound in last 4 seconds
        if (prev <= 4) {
          sound.playTimerTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, config.id, config.timeLimit]);

  if (!isOpen) return null;

  const handleSelectOption = (opt: EpiphanyOption) => {
    if (status !== 'thinking') return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(opt);
    if (opt.isCorrect) {
      setStatus('correct');
      sound.playContradictionBreakthrough();
    } else {
      setStatus('incorrect');
      sound.playClick();
    }
  };

  const correctOption = config.options.find(opt => opt.isCorrect);
  const progressPercent = (timeLeft / TOTAL_TIME) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="w-full max-w-xl bg-[#17120e] border-2 border-[#8c6b41] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col font-serif relative"
        >
          {/* Subtle Vintage Texture Accents */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-300/80 m-1 pointer-events-none" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-300/80 m-1 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-300/80 m-1 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-300/80 m-1 pointer-events-none" />

          {/* Top Vintage Brass Header */}
          <div className="bg-gradient-to-r from-[#2c1d14] via-[#3d2719] to-[#2c1d14] border-b-2 border-[#6d4d2b] p-3.5 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#20150e] text-amber-300 border border-[#8f683a] shadow-inner flex items-center justify-center">
                <Search className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-[11px] font-mono tracking-wider text-amber-400/90 font-bold flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-amber-400" />
                  <span>【私家偵探隨身筆記】思緒靈光一閃</span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-[#faedd9] tracking-wide mt-0.5">
                  {config.title}
                </h2>
              </div>
            </div>

            {/* Antique Clockwork Timer Gauge */}
            {status === 'thinking' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#120c08] border border-[#8a6538] shadow-inner shrink-0">
                <Clock className={`w-4 h-4 ${timeLeft <= 3 ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
                <span className={`font-mono text-sm font-bold tracking-wider ${timeLeft <= 3 ? 'text-rose-300 animate-pulse' : 'text-amber-200'}`}>
                  {timeLeft.toString().padStart(2, '0')}s
                </span>
              </div>
            )}

            {status !== 'thinking' && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-amber-300/70 hover:text-amber-100 hover:bg-black/40 transition-colors"
                title="關閉"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Antique Brass Countdown Ribbon */}
          {status === 'thinking' && (
            <div className="w-full h-1.5 bg-[#1f140e] overflow-hidden">
              <motion.div
                className={`h-full transition-all duration-1000 linear ${
                  timeLeft <= 3 ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-500' : 'bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Scenario Context & Observation Box */}
          <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#201712] border border-[#5a3e23] space-y-2.5 shadow-sm">
              <div className="text-xs sm:text-[13px] text-[#f2e2cc] leading-relaxed">
                {config.scenarioDesc}
              </div>
              <div className="text-[11px] text-amber-300/90 font-mono flex items-center gap-1.5 pt-2 border-t border-[#3e2917]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>現場關鍵特徵：{config.clueHint}</span>
              </div>
            </div>

            {/* Options List (When Thinking) */}
            {status === 'thinking' && (
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-amber-200/90 font-mono flex items-center justify-between px-0.5">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>面對眼前的線索痕跡，你認為……</span>
                  </span>
                  <span className="text-[10px] text-amber-400/70 font-normal">限時 {TOTAL_TIME} 秒</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {config.options.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      className="w-full p-3 sm:p-3.5 rounded-xl bg-[#211710] hover:bg-[#2b1f16] border border-[#5d4128] hover:border-amber-400 text-left text-xs sm:text-[12.5px] text-[#e8d7c1] hover:text-[#fff4e6] transition-all flex items-start gap-3 group cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#130d09] border border-[#755232] group-hover:border-amber-400 text-[10px] font-mono font-bold flex items-center justify-center text-amber-300/80 group-hover:text-amber-200 shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-relaxed flex-1">
                        {opt.text}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#8a6845] group-hover:text-amber-300 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Result: Correct */}
            {status === 'correct' && selectedOption && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-[#1e2718] border-2 border-[#63874c] space-y-3.5 shadow-lg"
              >
                <div className="flex items-center gap-2.5 text-[#a8d38d] font-bold text-sm sm:text-base border-b border-[#3b532d] pb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#88c563]" />
                  <span>【思緒貫通・線索咬合】正是如此！客觀物理條件不會說謊。</span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#141b10] border border-[#435e33] text-xs sm:text-[12.5px] text-[#d6ecd0] leading-relaxed space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 text-[11.5px]">
                    <span>✦ 你恍然大悟道：</span>
                  </div>
                  <div className="italic text-[#f4eedb]">
                    「原來如此！{config.correctDeductionThought}」
                  </div>
                </div>

                <div className="text-xs sm:text-[12px] text-[#e0ded5] leading-relaxed">
                  {selectedOption.explanation}
                </div>

                {/* Trait-specific rescue insight for mouse complaint / rescue QTE */}
                {trait && TRAIT_RESCUE_HINTS[trait] && config.id === 'mouse_scratch_wall_complaint' && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-[#2b2114] border border-[#8a6538] text-xs space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-amber-300 font-mono text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{TRAIT_RESCUE_HINTS[trait].badge}</span>
                    </div>
                    <p className="text-[#faeedd] font-serif leading-relaxed text-[11.5px]">
                      {TRAIT_RESCUE_HINTS[trait].step1WallHint}
                    </p>
                    <div className="text-[10.5px] text-amber-300/90 font-mono italic pt-1 border-t border-amber-800/40">
                      💡 現場應對：{TRAIT_RESCUE_HINTS[trait].rescueStrategyHint}
                    </div>
                  </motion.div>
                )}

                {/* Mental Recovery Notice */}
                <div className="p-2.5 rounded-lg bg-[#152112] border border-[#4d6f3b] text-xs text-[#c7e5bf] flex items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#88c563] shrink-0 animate-pulse" />
                    <span>{config.recoveryNote}</span>
                  </div>
                  <span className="font-sans font-bold text-[#88c563] bg-[#1a2f15] px-2 py-0.5 rounded border border-[#4d7838] shrink-0 text-xs">
                    心神重歸專注
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onSuccess(config.id);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-[#140e08] font-bold text-xs sm:text-sm font-serif shadow-md transition-all flex items-center gap-2 cursor-pointer border border-amber-400"
                  >
                    <span>{config.successButtonText || '融會貫通，繼續現場搜查 ➔'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Result: Incorrect -> Directly reveal the correct answer */}
            {status === 'incorrect' && selectedOption && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-[#251b14] border-2 border-[#8f5d37] space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-[#5e3c23] pb-2">
                  <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm sm:text-base">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <span>好像怪怪的……</span>
                  </div>
                </div>

                {/* What the player picked & why it is flawed */}
                <div className="p-3 rounded-lg bg-[#17100b] border border-[#51341e] text-xs text-[#d6c4ae] leading-relaxed space-y-1">
                  <div className="text-[11px] font-bold text-amber-400/90 flex items-center gap-1">
                    <span>✕ 方才的推論：</span>
                    <span className="text-[#fcefdc]">「{selectedOption.text}」</span>
                  </div>
                  <div className="text-[#b5a38e] text-[11.5px]">
                    {selectedOption.explanation}
                  </div>
                </div>

                {/* Directly Reveal the Correct Deduction Answer */}
                {correctOption && (
                  <div className="p-3.5 rounded-xl bg-[#1a2416] border-2 border-[#547a40] text-xs text-[#e1f0dc] leading-relaxed space-y-2 shadow-md">
                    <div className="font-bold text-[#9dd385] flex items-center gap-1.5 text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#88c563]" />
                      <span>經調查，答案應該是……</span>
                    </div>

                    <div className="text-sm font-bold text-[#f5fae8] pl-2 border-l-2 border-[#88c563]">
                      {correctOption.text}
                    </div>

                    <div className="text-[11.5px] text-[#cfe3ca] leading-relaxed pt-1">
                      {correctOption.explanation}
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#10170e] border border-[#38522b] text-[11.5px] text-[#e8ded0] italic">
                      ✦ 你恍然大悟道：「原來如此！{config.correctDeductionThought}」
                    </div>
                  </div>
                )}

                {/* Special Narrative Override for Story-critical QTEs (e.g. 1F Mouse Wall) */}
                {config.failureNoticeText && (
                  <div className="p-3.5 rounded-xl bg-[#2e1d13] border border-[#a16f43] text-xs text-[#fcefdc] font-serif leading-relaxed shadow-lg space-y-2">
                    <div className="font-bold text-amber-300 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>關鍵案件指引：</span>
                      </div>
                      {trait && TRAIT_RESCUE_HINTS[trait] && config.id === 'mouse_scratch_wall_complaint' && (
                        <span className="text-[11px] text-amber-300 font-mono font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/60">
                          {TRAIT_RESCUE_HINTS[trait].badge}
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed">
                      {config.failureNoticeText}
                    </p>
                    {trait && TRAIT_RESCUE_HINTS[trait] && config.id === 'mouse_scratch_wall_complaint' && (
                      <div className="text-[11px] text-amber-200/90 font-mono italic pt-1 border-t border-amber-800/50">
                        💡 救援方針：{TRAIT_RESCUE_HINTS[trait].rescueStrategyHint}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  {config.failureButtonText && onProceedAnyway ? (
                    <button
                      onClick={() => onProceedAnyway(config.id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-[#140e08] font-bold text-xs font-serif shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
                    >
                      <DoorOpen className="w-4 h-4 text-[#140e08]" />
                      <span>{config.failureButtonText}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (onFailure) {
                          onFailure(config.id);
                        } else {
                          onClose();
                        }
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-[#140e08] font-bold text-xs font-serif shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
                    >
                      <span>知曉真相，繼續搜查 ➔</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Result: Timeout -> Directly reveal the correct answer */}
            {status === 'timeout' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-[#251b14] border-2 border-[#735136] space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-[#4d3725] pb-2">
                  <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm sm:text-base">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>好像怪怪的……</span>
                  </div>
                </div>

                {/* Directly Reveal the Correct Deduction Answer */}
                {correctOption && (
                  <div className="p-3.5 rounded-xl bg-[#1a2416] border-2 border-[#547a40] text-xs text-[#e1f0dc] leading-relaxed space-y-2 shadow-md">
                    <div className="font-bold text-[#9dd385] flex items-center gap-1.5 text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#88c563]" />
                      <span>經調查，答案應該是……</span>
                    </div>

                    <div className="text-sm font-bold text-[#f5fae8] pl-2 border-l-2 border-[#88c563]">
                      {correctOption.text}
                    </div>

                    <div className="text-[11.5px] text-[#cfe3ca] leading-relaxed pt-1">
                      {correctOption.explanation}
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#10170e] border border-[#38522b] text-[11.5px] text-[#e8ded0] italic">
                      ✦ 你恍然大悟道：「原來如此！{config.correctDeductionThought}」
                    </div>
                  </div>
                )}

                {config.failureNoticeText && (
                  <div className="p-3.5 rounded-xl bg-[#2e1d13] border border-[#a16f43] text-xs text-[#fcefdc] font-serif leading-relaxed shadow-lg space-y-2">
                    <div className="font-bold text-amber-300 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>關鍵案件指引：</span>
                      </div>
                      {trait && TRAIT_RESCUE_HINTS[trait] && config.id === 'mouse_scratch_wall_complaint' && (
                        <span className="text-[11px] text-amber-300 font-mono font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/60">
                          {TRAIT_RESCUE_HINTS[trait].badge}
                        </span>
                      )}
                    </div>
                    <p className="leading-relaxed">
                      {config.failureNoticeText}
                    </p>
                    {trait && TRAIT_RESCUE_HINTS[trait] && config.id === 'mouse_scratch_wall_complaint' && (
                      <div className="text-[11px] text-amber-200/90 font-mono italic pt-1 border-t border-amber-800/50">
                        💡 救援方針：{TRAIT_RESCUE_HINTS[trait].rescueStrategyHint}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  {config.failureButtonText && onProceedAnyway ? (
                    <button
                      onClick={() => onProceedAnyway(config.id)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-[#140e08] font-bold text-xs font-serif shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
                    >
                      <DoorOpen className="w-4 h-4 text-[#140e08]" />
                      <span>{config.failureButtonText}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (onFailure) {
                          onFailure(config.id);
                        } else {
                          onClose();
                        }
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-[#140e08] font-bold text-xs font-serif shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
                    >
                      <span>知曉真相，繼續搜查 ➔</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
