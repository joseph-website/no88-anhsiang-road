import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, CheckCircle2, AlertOctagon, RotateCcw, X } from 'lucide-react';
import { sound } from '../../services/soundEngine';

interface DeductionMatrixProps {
  obtainedRules?: string[];
  inventory?: string[];
  onSuccess: (handwrittenRule: boolean) => void;
  onFailSanPenalty: (penalty: number) => void;
  onSanReward?: (reward: number) => void;
  onClose: () => void;
}

export const DeductionMatrix: React.FC<DeductionMatrixProps> = ({
  obtainedRules = [],
  inventory = [],
  onSuccess,
  onFailSanPenalty,
  onSanReward,
  onClose
}) => {
  // Mode: set1 or set2
  const [currentSet, setCurrentSet] = useState<'set1' | 'set2'>('set1');
  const [step, setStep] = useState<number>(0);
  const [, setSelectedHistory] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<'success' | 'fail' | null>(null);

  const hasCleanerRule = obtainedRules.includes('rule_cleaner');
  const hasBlueprints = inventory.includes('building_blueprints');
  const hasGuardRule = obtainedRules.includes('rule_guard');

  // Dynamically constructed question 1 based on actual possessed evidence
  const q1Text = hasCleanerRule
    ? '1. 警衛說沒有四樓、清潔員守則提及四樓、監視系統也有四樓，所以四樓……'
    : hasBlueprints
      ? '1. 警衛堅稱沒有四樓，但建築藍圖明確標示四樓、監視系統亦顯示四樓，所以四樓……'
      : '1. 警衛口述大樓無四樓，但中控監視系統各頻道與操作指引明確記錄四樓，所以四樓……';

  const set2Q1Text = hasCleanerRule
    ? '1. 如果堅持認為四樓不存在，那麼監視畫面與清潔員守則的記載出自於……'
    : '1. 如果堅持認為四樓不存在，那麼監視系統所捕捉到的實體畫面出自於……';

  const set2Q1Opt1 = hasCleanerRule
    ? '清潔員守則與監視器都是大樓怪異為了誤導人的幻覺'
    : '監視器畫面只是大樓怪異為了誤導人的虛假投影';

  // Set 1 questions
  const set1Questions = [
    {
      question: q1Text,
      options: [
        { text: '存在', isCorrect: true, feedback: '沒錯，多重客觀證據與監視畫面證明四樓確有實體空間。' },
        { text: '不存在', isCorrect: false, nextSet: 'set2' as const, feedback: '如果四樓不存在，那監視器拍到的樓層與404又是什麼？你的思緒陷入矛盾……' }
      ]
    },
    {
      question: '2. 如果四樓確實存在，但大樓對外的公開登記卻沒有標示，那表示……',
      options: [
        { text: '其實四樓不存在', isCorrect: false, nextSet: 'set2' as const, feedback: '你又縮回了鴕鳥心態，邏輯倒退回原地。' },
        { text: '設計圖遭到隱瞞或大樓當年私自違建', isCorrect: true, feedback: '正確！大樓的藍圖與公開登記資料被人為動過手腳。' }
      ]
    },
    {
      question: '3. 設計圖被隱瞞、四樓確實存在，但電梯與樓梯在平時都會讓人忽略它，這意味著……',
      options: [
        { text: '這棟大樓正透過某種規則影響訪客的認知', isCorrect: true, feedback: '「這棟大樓會扭曲人的認知與空間感知。」' },
        { text: '電梯與樓梯的動線被刻意設計成讓人忽略四樓', isCorrect: true, feedback: '「四樓確實存在，但大樓動線引導人將其無視。」' },
        { text: '我自己的精神與認知正被大樓和破爛規則同化', isCorrect: true, feedback: '「我的認知正被這套規則悄悄污染……我必須打破它！」' }
      ]
    },
    {
      question: '4. 如果大樓在扭曲認知，那我此時唯一可以信任、且能指出「真實異常」的依據應該是……',
      options: [
        { 
          text: hasGuardRule ? '警衛工作守則（第10條：忽略監視系統）' : '盲目遵從管理方指示，忽視一切眼前異常', 
          isCorrect: false, 
          nextSet: 'set2' as const, 
          feedback: '守則要你忽視一切異常當鴕鳥，這正是怪異想看到的！' 
        },
        { text: '監視系統操作指引（第8條：本系統不會出錯）', isCorrect: true, feedback: '監視指引教導如何處理看到自己的異常——那就是「重啟系統」！' }
      ]
    },
    {
      question: '5. 當我在監視器第4頻道看到「自己正站在404門前」時，我現在最該執行的動作是……',
      options: [
        { text: '執行操作指引第7條：立即重啟監視系統以重置認知', isCorrect: true, isFinal: true, feedback: '重啟並不是修復機器，而是重置我被污染的認知！' }
      ]
    }
  ];

  // Set 2 questions (Denial path)
  const set2Questions = [
    {
      question: set2Q1Text,
      options: [
        { text: set2Q1Opt1, isCorrect: true, feedback: '你試圖用「一切都是幻覺」來解釋矛盾。' },
        { text: '有人在大樓系統中植入了病毒與假畫面', isCorrect: true, feedback: '你試圖尋找常理藉口，但心裡愈發不安。' }
      ]
    },
    {
      question: '2. 既然如此，那我可以相信且能明哲保身的規則應該是……',
      options: [
        { 
          text: hasGuardRule ? '警衛工作守則（回到一樓、當作什麼都沒發生）' : '管理員口頭指示（回到一樓、當作什麼都沒發生）', 
          isCorrect: true, 
          feedback: '你選擇了聽從警衛的建議，徹底忽視監視器。' 
        }
      ]
    },
    {
      question: '3. 面對眼前的矛盾與混亂，你認為……',
      options: [
        { text: '無視監視系統，強行離開警衛室（鴕鳥心態，逃避真相）', isCorrect: false, isFail: true, feedback: '你選擇了無視眼前的事實。一陣嚴重的劇痛穿透大腦，印表機吐出了一份偽造的避難指引！' },
        { text: '慢著……不對！我前面推論的矛盾太大了，讓我重新回到事實推論！', isCorrect: true, backToSet1: true, feedback: '你及時煞住車，重拾了身為偵探的冷靜與理性！' }
      ]
    }
  ];

  const currentQuestions = currentSet === 'set1' ? set1Questions : set2Questions;
  const currentQ = currentQuestions[step];

  const handleOptionClick = (option: {
    text: string;
    isCorrect?: boolean;
    nextSet?: 'set1' | 'set2';
    backToSet1?: boolean;
    isFinal?: boolean;
    isFail?: boolean;
    feedback: string;
  }) => {
    sound.playClick();
    setSelectedHistory(prev => [...prev, `Q${step + 1}: ${option.text}`]);

    if (option.backToSet1) {
      setCurrentSet('set1');
      setStep(0);
      setSelectedHistory([]);
      return;
    }

    if (option.nextSet) {
      setCurrentSet(option.nextSet);
      setStep(0);
      return;
    }

    if (option.isFinal) {
      sound.playResolutionChord();
      setOutcome('success');
      if (onSanReward) {
        onSanReward(5);
      }
      onSuccess(true);
      return;
    }

    if (option.isFail) {
      sound.playGlitch();
      onFailSanPenalty(5);
      setOutcome('fail');
      return;
    }

    // Advance to next step
    if (step < currentQuestions.length - 1) {
      setStep(step + 1);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setCurrentSet('set1');
    setStep(0);
    setSelectedHistory([]);
    setOutcome(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative text-neutral-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-neutral-100 tracking-wide">
              偵探深度推理：認知與規則解析
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {outcome === null ? (
          <div>
            {/* Progress & Current Status */}
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-4">
              <span>推演階段：{currentSet === 'set1' ? '【邏輯突破 (題組一)】' : '【自我懷疑 (題組二)】'}</span>
              <span>步驟 {step + 1} / {currentQuestions.length}</span>
            </div>

            {/* Question Box */}
            <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-lg mb-6 shadow-inner">
              <div className="text-xs font-mono text-indigo-400 mb-2 uppercase tracking-wider">
                [LOGICAL PREMISE ANALYSIS]
              </div>
              <h4 className="text-base font-semibold text-neutral-100 leading-relaxed font-serif">
                {currentQ.question}
              </h4>
            </div>

            {/* Options List */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  className="w-full text-left p-3.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 hover:border-indigo-500 transition-all text-sm text-neutral-200 flex items-start gap-3 group"
                >
                  <span className="w-5 h-5 rounded-full bg-neutral-700 group-hover:bg-indigo-600 text-neutral-300 group-hover:text-white flex items-center justify-center text-xs shrink-0 font-mono">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{option.text}</span>
                </button>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重新整理思路
              </button>
              <span className="text-neutral-500 font-mono">
                依據搜集到的守則與監視錄影進行嚴密推導
              </span>
            </div>
          </div>
        ) : outcome === 'success' ? (
          /* Success Outcome */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-emerald-300 font-serif">
              認知重置成功：監視系統重啟！
            </h4>
            <div className="bg-neutral-950 border border-emerald-900/50 p-4 rounded-lg text-left max-w-lg mx-auto text-xs text-neutral-300 leading-relaxed font-serif">
              <p className="mb-2 text-neutral-100 font-bold">
                「原來如此……重啟監視器不是為了修理機器，而是『重置我被大樓規則污染的認知』！」
              </p>
              <p className="text-neutral-400">
                CRT螢幕上的雪花雜訊瞬間褪去，CAM-04頻道恢復了即時監控畫面。畫面上清楚捕捉到了通往四樓的折返樓梯間與404號房大門的即時動態！
              </p>
              <div className="mt-3 p-3 bg-amber-950/30 border border-amber-800/60 rounded text-amber-200 font-mono">
                ★ 監視主機重啟成功：CAM-04 頻道恢復連線！
                <br />
                <span className="text-[11px] text-amber-400">
                  四樓隱藏空間的認知遮蔽已完全瓦解。通往四樓的樓梯通道與暗角死角現已開放深入探查！
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg cursor-pointer"
            >
              返回警衛室繼續調查
            </button>
          </div>
        ) : (
          /* Fail Outcome (Ostrich Path) */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-500 text-red-400 flex items-center justify-center mx-auto shadow-lg">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-red-300 font-serif">
              認知受挫：強行忽視監視系統
            </h4>
            <div className="bg-neutral-950 border border-red-900/50 p-4 rounded-lg text-left max-w-lg mx-auto text-xs text-neutral-300 leading-relaxed">
              <p className="mb-2 text-red-200">
                你強行說服自己「這一切都只是錯覺」，大腦傳來陣陣撕裂般的劇痛。
              </p>
              <p className="text-neutral-400">
                監視主機持續傳出刺耳的雪花噪點，思緒陷入邏輯矛盾的泥淖中。請重新整理推論思路，唯有直面客觀事實方能解除認知遮蔽！
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重新整理邏輯推論
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-all shadow-lg cursor-pointer"
              >
                暫時退出思考
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
