import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCheck,
  ArrowRight,
  XOctagon
} from 'lucide-react';
import { sound } from '../../services/soundEngine';
import { EndingId } from '../../types';
import { ChaseSequence } from '../minigames/ChaseSequence';

interface Chapter2ViewProps {
  playerName: string;
  onObtainRule: (ruleId: string) => void;
  onModifySan: (delta: number) => void;
  onTriggerEnding: (endingId: EndingId) => void;
  onProceedToChapter3: () => void;
  hasCleanerRule: boolean;
  hasGuardRule: boolean;
}

export const Chapter2View: React.FC<Chapter2ViewProps> = ({
  playerName,
  onObtainRule,
  onModifySan,
  onTriggerEnding,
  onProceedToChapter3,
  hasCleanerRule,
  hasGuardRule
}) => {
  const [step, setStep] = useState<'lobby_dialogue' | 'floor2_cleaner' | 'floor3_navigation'>('lobby_dialogue');
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
  const [showChase, setShowChase] = useState<boolean>(false);
  const [explored2F, setExplored2F] = useState<boolean>(false);
  const [explored3F, setExplored3F] = useState<boolean>(false);

  // Guard conversation at 1F
  const handleGuardInvestigation = (topic: 'red_guard' | 'cctv' | 'guard_rules') => {
    sound.playPaper();
    if (topic === 'red_guard') {
      setActiveDialogue(
        '警衛（白衣黑褲，神色如常）：「先生您在開玩笑吧？我今晚一步也沒有離開過警衛室。而且我們大樓只有一位警衛值班，制服也只有白衣黑褲，哪來的紅衣警衛？」'
      );
    } else if (topic === 'cctv') {
      setActiveDialogue(
        '警衛調閱一樓監視器畫面：「您看，畫面裡只有您一個人搭電梯下樓。而且……畫面顯示您00:15走進504，但直到現在，504門口的監視器都沒有拍到您『走出來』的影像……」'
      );
    } else if (topic === 'guard_rules') {
      if (!hasGuardRule) {
        onObtainRule('rule_guard');
      }
      setActiveDialogue(
        '★ 獲得【警衛工作守則（警衛提供）】！警衛：「這是我們保全公司的守則，您看看吧。第10條寫著『請忽略監視系統操作手冊』，所以監視器的怪事您別多想了。」'
      );
    }
  };

  const handleAbandonCase = () => {
    sound.playGlitch();
    onTriggerEnding('ending1');
  };

  const handleGoTo2F = () => {
    sound.playElevatorChime();
    setStep('floor2_cleaner');
    setActiveDialogue(null);
  };

  const handleTalkToCleaner = () => {
    sound.playPaper();
    setExplored2F(true);
    setActiveDialogue(
      '清潔員阿姨（推著清潔車，面露驚訝）：「哎呀，沒想到404號房居然有訪客？你剛才不是才剛走進404號房嗎？……什麼？我看錯？不會吧。啊！難道你是新來的警衛？嗯？你問警衛制服？我們大樓的警衛哪有穿什麼制服啊，都是穿自己的便服呀！」'
    );
  };

  const handleGoTo3F = () => {
    sound.playElevatorChime();
    setStep('floor3_navigation');
    setActiveDialogue(null);
  };

  // 3F to 1F navigation choices
  const handleElevatorTo1F = (button: '1' | 'blank') => {
    if (button === '1') {
      sound.playElevatorChime();
      setActiveDialogue('【遵守規則】：你無視閃爍著詭異微光的空白按鈕，果斷按下「1」樓。電梯平穩降回一樓大廳。');
      setTimeout(() => {
        onProceedToChapter3();
      }, 2500);
    } else {
      sound.playGlitch();
      onModifySan(-4);
      setActiveDialogue('【按下空白按鈕】：電梯發出刺耳的金屬摩擦聲，指示燈顯示【4F】！一隻猩紅的手臂猛然卡在門縫中！(心理受挫 -4)');
      setShowChase(true);
    }
  };

  const handleStairsTo1F = () => {
    sound.playGlitch();
    onModifySan(-3);
    setActiveDialogue('【走樓梯】：無論你往下走還是往上走，樓梯平台的牆面數字始終固定在鮮紅的【4F】！身後傳來急促的重靴追逐聲！(心理受挫 -3)');
    setShowChase(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Chapter Header */}
        <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
          <div>
            <span className="text-amber-500 font-mono text-xs">CHAPTER 02 // WHOSE RULES?</span>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-neutral-100 mt-0.5">
              第二章：誰的規則？
            </h2>
          </div>
          <span className="text-xs px-3 py-1 rounded bg-neutral-800 text-neutral-300 font-mono border border-neutral-700">
            核心：搜集矛盾與地圖探索
          </span>
        </div>

        {/* Step 1: 1F Lobby Dialogue with Guard & Branch Point */}
        {step === 'lobby_dialogue' && (
          <div className="space-y-6">
            <p className="text-xs md:text-sm text-neutral-300 font-serif leading-relaxed">
              回到一樓，白衣黑褲的值班警衛依舊坐在警衛室內。你手中捏著剛在電梯撿到的【清潔人員工作守則】，兩套規則的矛盾在腦海中盤旋。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleGuardInvestigation('red_guard')}
                className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 transition-all text-left"
              >
                <div className="text-xs font-bold text-neutral-100 mb-1">
                  質問紅衣假警衛的事
                </div>
                <div className="text-[11px] text-neutral-500">
                  確認警衛是否曾離開崗位
                </div>
              </button>

              <button
                onClick={() => handleGuardInvestigation('cctv')}
                className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 transition-all text-left"
              >
                <div className="text-xs font-bold text-neutral-100 mb-1">
                  要求調閱一樓監視錄影
                </div>
                <div className="text-[11px] text-neutral-500">
                  確認504號房與電梯影像
                </div>
              </button>

              <button
                onClick={() => handleGuardInvestigation('guard_rules')}
                className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 transition-all text-left"
              >
                <div className="text-xs font-bold text-amber-300 mb-1">
                  索取【警衛工作守則】
                </div>
                <div className="text-[11px] text-neutral-500">
                  {hasGuardRule ? '已取得警衛守則' : '查閱警衛規定'}
                </div>
              </button>
            </div>

            {/* Dialogue feedback */}
            {activeDialogue && (
              <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl text-xs md:text-sm text-neutral-200 font-serif leading-relaxed">
                {activeDialogue}
              </div>
            )}

            {/* Investigation Branch Choices */}
            <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleAbandonCase}
                className="px-4 py-2.5 rounded-lg bg-red-950/50 hover:bg-red-900/80 border border-red-800 text-red-300 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <XOctagon className="w-4 h-4" />
                放棄委託，離開大樓
              </button>

              <button
                onClick={handleGoTo2F}
                disabled={!hasGuardRule}
                className={`px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
                  hasGuardRule
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30'
                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
              >
                繼續調查：前往二樓
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 2F Cleaner Encounter */}
        {step === 'floor2_cleaner' && (
          <div className="space-y-6">
            <p className="text-xs md:text-sm text-neutral-300 font-serif leading-relaxed">
              搭乘電梯來到二樓走廊。走廊上瀰漫著漂白水的刺鼻氣味，一名推著清潔推車的中年婦女正在拖地。
            </p>

            <button
              onClick={handleTalkToCleaner}
              className="w-full p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 text-left transition-all flex items-start gap-3"
            >
              <UserCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-neutral-100">
                  與清潔員阿姨交談
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  詢問清潔守則、404號房與警衛制服之謎
                </div>
              </div>
            </button>

            {activeDialogue && (
              <div className="bg-neutral-950 border border-amber-900/60 p-4 rounded-xl text-xs md:text-sm text-neutral-200 font-serif leading-relaxed">
                {activeDialogue}
              </div>
            )}

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-mono">
                {explored2F ? '已獲取二樓關鍵證言' : '請先與清潔員交談'}
              </span>

              <button
                onClick={handleGoTo3F}
                disabled={!explored2F}
                className={`px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
                  explored2F
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
              >
                前往三樓與梯間調查
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 3F Navigation & Return Trap */}
        {step === 'floor3_navigation' && (
          <div className="space-y-6">
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
              <div className="text-xs font-bold text-amber-400 font-mono">
                【三樓調查與空間異常觀測】：
              </div>
              <p className="text-xs md:text-sm text-neutral-200 font-serif leading-relaxed">
                三樓的住戶房門全數緊閉。當你走回電梯時，驚訝地發現電梯控制按鈕在「3」與「5」之間，多出了一顆沒有任何標記的<span className="text-amber-400 font-bold">「空白按鈕」</span>！
                <br />
                而如果往樓梯間望去，牆上的標示在綠色「3」與鮮紅「4」之間微微閃爍。
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                回到一樓大廳前，你打算……
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleElevatorTo1F('1')}
                  className="p-4 rounded-xl bg-neutral-950/80 hover:bg-emerald-950/40 border border-neutral-800 hover:border-emerald-500 text-left transition-all"
                >
                  <div className="text-xs font-bold text-emerald-300 mb-1">
                    搭電梯按下「1」樓（遵守住戶規則第5條）
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    「電梯出現空白按鈕仍可使用，但請勿按下空白按鈕。」
                  </div>
                </button>

                <button
                  onClick={() => handleElevatorTo1F('blank')}
                  className="p-4 rounded-xl bg-neutral-950/80 hover:bg-red-950/40 border border-neutral-800 hover:border-red-500 text-left transition-all"
                >
                  <div className="text-xs font-bold text-red-300 mb-1">
                    搭電梯按下「空白按鈕」 (直覺強烈預警：違反守則)
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    試圖強行進入空白樓層（按鍵泛著令人心悸的血光）
                  </div>
                </button>

                <button
                  onClick={handleStairsTo1F}
                  className="p-4 rounded-xl bg-neutral-950/80 hover:bg-orange-950/40 border border-neutral-800 hover:border-orange-500 text-left transition-all"
                >
                  <div className="text-xs font-bold text-orange-300 mb-1">
                    走樓梯下樓 (直覺感應：樓梯間瀰漫著異樣壓迫感)
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    聽信清潔員守則「優先走樓梯」（深處隱隱傳來回音）
                  </div>
                </button>
              </div>
            </div>

            {activeDialogue && (
              <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl text-xs md:text-sm text-neutral-200 font-serif leading-relaxed">
                {activeDialogue}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chase Sequence Minigame Modal */}
      {showChase && (
        <ChaseSequence
          title="空間混亂追逐：迷失於四樓異常迴圈！"
          reason="你觸碰了異常的空白按鈕或踏入了樓梯陷阱，怪異在無限延伸的走廊中發起追殺！"
          onSuccess={() => {
            setShowChase(false);
            sound.playElevatorChime();
            setActiveDialogue('你及時衝進電梯並按下一樓，電梯門閉合，帶你成功脫離了四樓空間迴圈！');
            setTimeout(() => {
              onProceedToChapter3();
            }, 2500);
          }}
          onFail={() => {
            setShowChase(false);
            onModifySan(-4);
            setActiveDialogue('你被冰冷的霧氣吞沒，失去知覺……當你再度睜開眼時，警衛室的燈光正映在你的臉上。');
            setTimeout(() => {
              onProceedToChapter3();
            }, 2500);
          }}
        />
      )}
    </div>
  );
};
