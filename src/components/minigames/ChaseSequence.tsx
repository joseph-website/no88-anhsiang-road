import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  ArrowRight,
  DoorClosed,
  AlertTriangle
} from 'lucide-react';
import { sound } from '../../services/soundEngine';

interface ChaseSequenceProps {
  onSuccess: () => void;
  onFail: () => void;
  title?: string;
  reason?: string;
  san?: number;
}

export const ChaseSequence: React.FC<ChaseSequenceProps> = ({
  onSuccess,
  onFail,
  title = '緊急追逐戰：違反規則引發怪異糾纏！',
  reason = '你違反了「身處4樓應使用電梯」的規則，紅衣怪影在身後的樓梯間急速逼近！',
  san
}) => {
  const [stage, setStage] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(100); // 100% down to 0
  const [status, setStatus] = useState<'running' | 'escaped' | 'caught'>('running');

  // Trigger tension sound on mount
  useEffect(() => {
    sound.playTensionSting();
  }, []);

  const stages = [
    {
      prompt: '樓梯轉角處傳來沉重拖沓的踏地聲，紅衣身影從上方俯衝而下。你打算……',
      options: [
        { text: '急轉彎破門衝回走廊，尋找客用電梯！', isCorrect: true },
        { text: '繼續往樓下狂奔，試圖跑出一樓大門！', isCorrect: false },
        { text: '停下來亮出偵探手冊質問對方身分！', isCorrect: false }
      ]
    },
    {
      prompt: '走廊燈光瘋狂閃爍，電梯門正緩緩關閉，手爪逼近肩膀。你打算……',
      options: [
        { text: '雙手護頭，側身滑步衝入即將關閉的電梯門縫！', isCorrect: true },
        { text: '轉身揮拳反擊試圖擊退怪異！', isCorrect: false },
        { text: '躲進旁邊虛掩的404號房門！', isCorrect: false }
      ]
    },
    {
      prompt: '跌進電梯車廂，面板上多個按鈕明暗閃爍。你打算……',
      options: [
        { text: '迅速按下「1」樓按鈕並狂按關門鍵！', isCorrect: true },
        { text: '按下那顆發出幽綠光芒的「空白按鈕」！', isCorrect: false },
        { text: '按下「5」樓按鈕躲避！', isCorrect: false }
      ]
    }
  ];

  // Timer countdown
  useEffect(() => {
    if (status !== 'running') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 2) {
          clearInterval(timer);
          handleCaught();
          return 0;
        }
        return prev - 2.5;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [status, stage]);

  const handleCaught = () => {
    sound.playGlitch();
    setStatus('caught');
    setTimeout(() => {
      onFail();
    }, 2000);
  };

  const handleChoice = (isCorrect: boolean) => {
    sound.playClick();
    if (!isCorrect) {
      handleCaught();
      return;
    }

    if (stage < stages.length - 1) {
      sound.playPaper();
      setStage(prev => prev + 1);
      setTimeLeft(100); // Reset timer for next quick decision
    } else {
      sound.playElevatorChime();
      setStatus('escaped');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-950 border-2 border-red-700/80 rounded-xl max-w-xl w-full p-6 shadow-2xl relative text-neutral-200 overflow-hidden"
      >
        {/* Flashing Red Alert Border Light */}
        <div className="absolute inset-0 bg-red-950/20 pointer-events-none animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-900/50 pb-3 mb-4 relative z-10">
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
            <h3 className="text-base md:text-lg font-bold tracking-wide">
              {title}
            </h3>
          </div>
          <span className="text-xs font-mono bg-red-950 px-2.5 py-1 rounded text-red-300 border border-red-800">
            PHASE {stage + 1}/3
          </span>
        </div>

        <p className="text-xs text-red-300/80 mb-3 relative z-10 leading-relaxed font-mono">
          {reason}
        </p>

        {/* Low SAN Critical Hazard Warning Banner */}
        {san !== undefined && san <= 25 && (
          <div className="flex items-center gap-2 p-2.5 bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold animate-pulse mb-4 rounded-sm shadow-md relative z-10">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>【⚠ 警告：精神狀態不佳！貿然面對怪異也許會有生命危險！】</span>
          </div>
        )}

        {/* Time Bar */}
        <div className="mb-6 relative z-10">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
            <span>反應時限 (REACTION TIME)</span>
            <span className="text-red-400 font-bold">{Math.ceil(timeLeft / 10)}s</span>
          </div>
          <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <div 
              className={`h-full transition-all duration-100 ${
                timeLeft > 50 ? 'bg-amber-500' : 'bg-red-600 animate-pulse'
              }`}
              style={{ width: `${timeLeft}%` }}
            />
          </div>
        </div>

        {/* Stage Question & Action Choices */}
        {status === 'running' && (
          <div className="relative z-10 space-y-4">
            <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-lg text-sm font-semibold text-neutral-100 leading-relaxed">
              {stages[stage].prompt}
            </div>

            <div className="space-y-2.5">
              {stages[stage].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(opt.isCorrect)}
                  className="w-full text-left p-3 rounded-lg bg-neutral-900 hover:bg-red-950/60 border border-neutral-700 hover:border-red-500 transition-all text-xs md:text-sm text-neutral-200 hover:text-white flex items-center justify-between group"
                >
                  <span>{opt.text}</span>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Escaped State */}
        {status === 'escaped' && (
          <div className="relative z-10 text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
              <DoorClosed className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-emerald-300">
              電梯門及時緊閉！成功擺脫追擊！
            </h4>
            <p className="text-xs text-neutral-300 font-serif">
              紅衣怪異的手掌在電梯外猛烈拍打幾聲後逐漸平息。電梯齒輪平穩運轉，帶著你降回了一樓。
            </p>
          </div>
        )}

        {/* Caught State */}
        {status === 'caught' && (
          <div className="relative z-10 text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-950 border border-red-500 text-red-400 flex items-center justify-center mx-auto animate-ping">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-red-400">
              {san !== undefined && san <= 25 ? '心智崩潰！在怪異的撕扯中無力掙脫！' : '你被怪異的冰冷氣息捕獲！'}
            </h4>
            <p className="text-xs text-neutral-300 font-mono">
              {san !== undefined && san <= 25 
                ? '精神狀態已處於極度衰弱臨界，遲緩的反應力讓你被怪異瞬間吞噬，理智與意識徹底沉淪……' 
                : '眼前被無盡的血紅覆蓋。當你再次醒來時，自己正狼狽地跌坐在大樓一樓的大廳地板上……'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
