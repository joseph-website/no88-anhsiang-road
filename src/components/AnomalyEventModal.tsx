import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Sparkles,
  Brain,
  ArrowRight,
  Flashlight
} from 'lucide-react';
import { AnomalyEvent, AnomalyChoice } from '../data/anomalyEventsData';
import { sound } from '../services/soundEngine';
import { EndingId } from '../types';
import { AnomalyAftermathModal, AnomalyAftermathData } from './AnomalyAftermathModal';

interface AnomalyEventModalProps {
  event: AnomalyEvent;
  obtainedRules: string[];
  inventory: string[];
  isFlashlightOn: boolean;
  san: number;
  unlockedEndings?: EndingId[];
  onModifySan: (delta: number) => void;
  onAddJournalEntry: (entry: {
    category: 'system' | 'action' | 'dialogue';
    title: string;
    content: string;
    location?: string;
    sanDelta?: number;
  }) => void;
  onSuccessfulDisposal?: (tier: 1 | 2 | 3) => void;
  onComplete: () => void;
}

export const AnomalyEventModal: React.FC<AnomalyEventModalProps> = ({
  event,
  obtainedRules,
  inventory,
  isFlashlightOn,
  san,
  unlockedEndings = [],
  onModifySan,
  onAddJournalEntry,
  onSuccessfulDisposal,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(event.timeLimit);
  const [selectedChoice, setSelectedChoice] = useState<AnomalyChoice | null>(null);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [aftermathData, setAftermathData] = useState<AnomalyAftermathData | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play sound on mount
  useEffect(() => {
    sound.playAnomalyWarning(event.tier);
    if (event.soundEffect === 'heartbeat') sound.playHeartbeat();
    else if (event.soundEffect === 'glitch') sound.playGlitch();
    else if (event.soundEffect === 'tension') sound.playTensionSting();
    else if (event.soundEffect === 'violin') sound.playViolinStab();
  }, [event]);

  // Countdown timer loop
  useEffect(() => {
    if (isResolved || isTimedOut) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        if (prev <= 4) {
          sound.playTimerTick();
          if (prev <= 3) {
            sound.playHeartbeat();
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isResolved, isTimedOut]);

  // Timeout handler
  const handleTimeout = () => {
    setIsTimedOut(true);
    setIsResolved(true);
    sound.playGlitch();
    onModifySan(event.timeoutResult.sanDelta);
    onAddJournalEntry({
      category: 'system',
      title: `【怪談異常結算】：${event.name}（逾時未決）`,
      content: `${event.timeoutResult.description}`,
      sanDelta: event.timeoutResult.sanDelta
    });

    setAftermathData({
      title: '【異常事件處置結算】',
      anomalyName: event.name,
      threatLevel: event.threatLevel,
      eventRecap: `${event.sceneDescription} ${event.flavorText ? `（${event.flavorText}）` : ''}`,
      playerDecision: '你在極度驚恐與猶豫中錯失了黃金應對窗口，未能在時限內採取任何防範措施。',
      decisionOutcome: event.timeoutResult.description,
      psychologicalImpact: '精神受到衝擊',
      isSuccess: false,
      environmentalStatus: '空間扭曲在達到臨界峰值後驟然斷裂，空氣中的異常電磁雜音緩緩平息，現場暫時回歸死寂。',
      ruleCitation: event.loreOrigin
    });
  };

  // Choice selection handler
  const handleSelectChoice = (choice: AnomalyChoice) => {
    if (isResolved) return;
    if (timerRef.current) clearInterval(timerRef.current);

    // If choice requires flashlight but flashlight is off, the defense fails!
    const isFlashlightMissing = choice.requiredFlashlight && !isFlashlightOn;

    const effectiveIsCorrect = isFlashlightMissing ? false : choice.isCorrect;
    const effectiveSanDelta = isFlashlightMissing ? -12 : choice.sanDelta;
    const effectiveResultTitle = isFlashlightMissing ? '【防禦失敗・未持光源遭襲】' : choice.resultTitle;
    const effectiveResultText = isFlashlightMissing
      ? '你試圖執行強光防禦，但手電筒尚未開啟！黑暗中的異象趁虛而入，冰冷刺骨的陰寒瞬間穿透身體，心智受到劇烈衝擊！'
      : choice.resultText;

    setSelectedChoice(choice);
    setIsResolved(true);

    if (effectiveIsCorrect) {
      sound.playContradictionBreakthrough();
      if ((event.tier === 2 || event.tier === 3) && onSuccessfulDisposal) {
        onSuccessfulDisposal(event.tier);
      }
    } else {
      sound.playGlitch();
    }

    onModifySan(effectiveSanDelta);
    onAddJournalEntry({
      category: 'action',
      title: `【怪談異常處置】：${event.name} ── ${effectiveResultTitle}`,
      content: `${effectiveResultText} ${isFlashlightMissing ? '（致命失誤：未開啟戰術手電筒）' : choice.journalNote || ''}`,
      sanDelta: effectiveSanDelta
    });

    const isPositive = effectiveSanDelta >= 0;
    const impactText = isPositive
      ? '心神稍微平復'
      : effectiveSanDelta <= -15
        ? '精神受到劇烈衝擊'
        : '心緒受到擾動';

    setAftermathData({
      title: '【異常事件處置結算】',
      anomalyName: event.name,
      threatLevel: event.threatLevel,
      eventRecap: `${event.sceneDescription} ${event.flavorText ? `（${event.flavorText}）` : ''}`,
      playerDecision: choice.label,
      decisionOutcome: effectiveResultText,
      psychologicalImpact: impactText,
      isSuccess: effectiveIsCorrect,
      environmentalStatus: effectiveIsCorrect
        ? '由於處置得當，周遭空氣中的異壓與雜音迅速消散，大樓暫時回歸平靜，為後續探索爭取到了安全窗口。'
        : '雖然勉強脫離了直接威脅，但周圍牆面與空氣中仍殘留著令人不安的異味與震顫，隨時可能再次觸發異象。',
      ruleCitation: isFlashlightMissing ? '警告：身處未照明區域直面怪異，無視光源必招致反噬。' : (choice.subLabel || event.loreOrigin)
    });
  };

  const timerPercentage = (timeLeft / event.timeLimit) * 100;

  if (isResolved && aftermathData) {
    return (
      <AnomalyAftermathModal
        isOpen={true}
        data={aftermathData}
        unlockedEndings={unlockedEndings}
        onClose={onComplete}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Glitch & Red Aberration Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`w-full h-full ${
          event.tier === 3 
            ? 'bg-red-950/20' 
            : event.tier === 2 
              ? 'bg-amber-950/15' 
              : 'bg-black/30'
        }`} />
      </div>

      <motion.div 
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className={`relative w-full max-w-2xl retro-forum-modal-window shadow-2xl overflow-hidden z-10 font-sans border-2 ${
          event.tier === 3 
            ? 'border-[#8b1515]' 
            : event.tier === 2 
              ? 'border-[#b45309]' 
              : 'border-[#1c3819]'
        }`}
      >
        {/* Header Bar with Danger Level & Timer */}
        <div className={`p-3 sm:p-3.5 border-b-2 text-white flex flex-col gap-2.5 select-none ${
          event.tier === 3 
            ? 'bg-[#781717] border-[#540c0c]' 
            : event.tier === 2 
              ? 'bg-[#854d0e] border-[#5c3407]' 
              : 'retro-forum-modal-header border-[#1c3819]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">⚠️</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-black/40 border border-white/30 font-bold uppercase text-[#fef08a]">
                    [{event.threatLevel}]
                  </span>
                  <span className="text-xs text-[#f4f8f3] font-mono">
                    危險階級: 階層 {event.tier} (已持有 {obtainedRules.length} 份守則)
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5 tracking-wide">
                  【突發異常事件】{event.name}
                </h3>
              </div>
            </div>

            {/* Countdown Display */}
            {!isResolved && (
              <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 border border-white/30 text-white font-mono shadow-inner">
                <Clock className={`w-3.5 h-3.5 ${timeLeft <= 3 ? 'text-red-400 animate-spin' : 'text-[#fef08a]'}`} />
                <span className={`text-sm font-bold ${
                  timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-[#fef08a]'
                }`}>
                  00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </span>
              </div>
            )}
          </div>

          {/* Time Progress Bar */}
          {!isResolved && (
            <div className="w-full bg-black/40 h-2 border border-white/20 overflow-hidden">
              <motion.div 
                className={`h-full transition-all duration-300 ${
                  timerPercentage < 25 
                    ? 'bg-[#ef4444]' 
                    : timerPercentage < 50 
                      ? 'bg-[#f59e0b]' 
                      : 'bg-[#a3e635]'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto bg-[#f4f8f3] text-[#1a2e18]">
          {/* Flavor Text / Scene Description */}
          <div className="space-y-2.5">
            <div className="text-xs text-[#85250c] bg-white p-2.5 border border-[#d99c89] leading-relaxed">
              {event.flavorText}
            </div>

            <p className="text-xs sm:text-sm text-[#1a2e18] bg-white p-3 border border-[#7ca078] leading-relaxed shadow-sm">
              {event.sceneDescription}
            </p>

            <div className="text-[11px] text-[#2b5828] bg-[#e8f2e6] p-2 border border-[#7ca078] flex items-center gap-1.5 font-mono">
              <Brain className="w-3.5 h-3.5 text-[#2b5828] shrink-0" />
              <span>【探員心智解析】：{event.loreOrigin}</span>
            </div>
          </div>

          {/* Choices Section */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-[#1c3819] flex items-center justify-between border-b border-[#a8c9a5] pb-1">
              <span>面對突發異象，你打算……</span>
            </div>

            {event.choices.map((choice) => {
              const hasRequiredRule = !choice.requiredRuleId || obtainedRules.includes(choice.requiredRuleId);
              const hasRequiredItem = !choice.requiredItemId || inventory.includes(choice.requiredItemId);
              const hasFlashlightCondition = !choice.requiredFlashlight || isFlashlightOn;
              const canUseAdvantage = hasRequiredRule && hasRequiredItem && hasFlashlightCondition;

              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelectChoice(choice)}
                  className={`w-full text-left p-3 border transition-all duration-150 group cursor-pointer shadow-sm ${
                    choice.isCorrect && canUseAdvantage
                      ? 'bg-white hover:bg-[#eaf5e8] border-[#2b5828] shadow'
                      : 'bg-white hover:bg-[#f0f6ef] border-[#7ca078] hover:border-[#2b5828]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 pr-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {choice.isCorrect && canUseAdvantage && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#d8edd4] text-[#1c4718] border border-[#2b5828] flex items-center gap-1 font-bold">
                            <Sparkles className="w-3 h-3 text-[#2b5828]" />
                            規則/物證破解
                          </span>
                        )}
                        {choice.requiredFlashlight && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 border flex items-center gap-1 font-bold ${
                            isFlashlightOn 
                              ? 'bg-[#fef9c3] text-[#854d0e] border-[#ca8a04]' 
                              : 'bg-[#fee2e2] text-[#991b1b] border-[#dc2626] animate-pulse'
                          }`}>
                            <Flashlight className="w-3 h-3" />
                            {isFlashlightOn ? '[手電筒已照亮]' : '[警告：未開手電筒將無法抵禦]'}
                          </span>
                        )}
                        <span className="font-bold text-xs sm:text-sm text-[#1a2e18] group-hover:text-[#2b5828] transition-colors">
                          {choice.label}
                        </span>
                      </div>
                      {choice.subLabel && (
                        <div className="text-[11px] text-[#556953] group-hover:text-[#334731]">
                          {choice.subLabel}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#7ca078] group-hover:text-[#2b5828] group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

