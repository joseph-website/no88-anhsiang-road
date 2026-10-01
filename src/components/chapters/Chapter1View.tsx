import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  ArrowUpCircle,
  DoorOpen,
  Shield,
  AlertTriangle,
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { sound } from '../../services/soundEngine';
import { LetterPuzzle } from '../minigames/LetterPuzzle';
import { ChaseSequence } from '../minigames/ChaseSequence';

interface Chapter1ViewProps {
  playerName: string;
  onObtainRule: (ruleId: string) => void;
  onObtainItem: (itemId: string) => void;
  onModifySan: (delta: number) => void;
  onProceedToChapter2: () => void;
  hasResidentRule: boolean;
  hasKey504: boolean;
  hasLetterPiece: boolean;
}

export const Chapter1View: React.FC<Chapter1ViewProps> = ({
  playerName,
  onObtainRule,
  onObtainItem,
  onModifySan,
  onProceedToChapter2,
  hasResidentRule,
  hasKey504,
  hasLetterPiece
}) => {
  const [phase, setPhase] = useState<'guard_room' | 'in_504' | 'red_guard_encounter'>('guard_room');
  const [explored1F, setExplored1F] = useState<string[]>([]);
  const [explored504, setExplored504] = useState<string[]>([]);
  const [showLetterPuzzle, setShowLetterPuzzle] = useState<boolean>(false);
  const [showChase, setShowChase] = useState<boolean>(false);
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);

  // 1F Guard conversation
  const handleTalkToGuard = () => {
    sound.playPaper();
    setActiveDialogue(
      '警衛（白衣黑褲）：「先生您好。找張浩？我對這個名字沒有印象。我們大樓只有四層樓，房號從101到505，但絕對沒有404。504號房一年多前房客就搬走了，目前是空屋。既然您有委託書，這把『504號房鑰匙』借您上去看看吧，看完記得還我。」'
    );
    if (!hasKey504) {
      onObtainItem('key_504');
    }
  };

  const handleInspect1F = (type: 'mailbox' | 'elevator' | 'stairs') => {
    sound.playClick();
    if (!explored1F.includes(type)) {
      setExplored1F(prev => [...prev, type]);
    }
    if (type === 'mailbox') {
      setActiveDialogue('【大廳信箱區】：一整排金屬信箱整齊排列著：101~105、201~205、301~305、501~505。完全沒有任何以「4」開頭的信箱格號。');
    } else if (type === 'elevator') {
      setActiveDialogue('【客用電梯外面板】：外側按鈕面板與指示燈上，樓層只有『1、2、3、5』四個按鍵。');
    } else if (type === 'stairs') {
      setActiveDialogue('【樓梯間】：走上樓梯查看，3樓上方的下一段階梯平台，牆壁漆著鮮明的綠色數字『5F』。4樓似乎被徹底抹消了。');
    }
  };

  const handleGoTo504 = () => {
    sound.playElevatorChime();
    setPhase('in_504');
    setActiveDialogue(null);
  };

  const handleInspect504 = (item: 'living_traces' | 'rules' | 'trash_bin') => {
    sound.playPaper();
    if (!explored504.includes(item)) {
      setExplored504(prev => [...prev, item]);
    }

    if (item === 'living_traces') {
      setActiveDialogue('【504號房廚房與客廳】：茶几上的咖啡早已乾涸結塊，冰箱冷藏室放著四天前過期的鮮奶……這證實張浩在數天前仍在此生活，絕非警衛所宣稱的「空置一年」！');
    } else if (item === 'rules') {
      if (!hasResidentRule) {
        onObtainRule('rule_resident');
      }
      setActiveDialogue('★ 獲得【住戶規則（504號房取得）】！上面寫明：「本大樓共四層樓，編號1至5樓，沒有4樓。若身處4樓，請利用電梯回到1樓……」');
    } else if (item === 'trash_bin') {
      if (!hasLetterPiece) {
        onObtainItem('shredded_letter');
      }
      setShowLetterPuzzle(true);
    }
  };

  const handleFinish504 = () => {
    sound.playTensionSting();
    setPhase('red_guard_encounter');
    setActiveDialogue(null);
  };

  const handleTakeElevator = () => {
    sound.playElevatorChime();
    // Correctly following resident rule #2
    onObtainRule('rule_cleaner');
    setActiveDialogue('【遵守規則】：你嚴格依據住戶規則第2條：「若身處4樓請搭電梯回到1樓」，果斷轉身走進電梯。紅衣警衛的嘴角有一瞬間猙獰扭曲！電梯平穩降回一樓，你在電梯地毯邊角撿到了【清潔人員工作規則】！');
    setTimeout(() => {
      onProceedToChapter2();
    }, 2800);
  };

  const handleTakeStairs = () => {
    sound.playGlitch();
    onModifySan(-3);
    setShowChase(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Chapter Title Header */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
          <div>
            <span className="text-amber-500 font-mono text-xs">CHAPTER 01 // CALM WATERS</span>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-neutral-100 mt-0.5">
              第一章：風平浪靜
            </h2>
          </div>
          <span className="text-xs px-3 py-1 rounded bg-neutral-800 text-neutral-300 font-mono border border-neutral-700">
            規則核心：遵守既定規則
          </span>
        </div>

        {/* Phase 1: 1F Guard Room */}
        {phase === 'guard_room' && (
          <div className="space-y-6">
            <p className="text-xs md:text-sm text-neutral-300 font-serif leading-relaxed">
              你站在大樓一樓門廳。明亮的大理石地面一塵不染，警衛室窗口透出白熾燈光。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleTalkToGuard}
                className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 transition-all text-left flex items-start gap-3"
              >
                <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-neutral-100">
                    向值班警衛打招呼與詢問
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {hasKey504 ? '已取得504號房鑰匙' : '打聽失蹤者與404號房'}
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleInspect1F('mailbox')}
                className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 transition-all text-left flex items-start gap-3"
              >
                <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-neutral-100">調查一樓住戶信箱格</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">確認全棟房號分配</div>
                </div>
              </button>

              <button
                onClick={() => handleInspect1F('elevator')}
                className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 transition-all text-left flex items-start gap-3"
              >
                <ArrowUpCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-neutral-100">檢查客用電梯按鈕</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">觀察樓層按鍵</div>
                </div>
              </button>

              <button
                onClick={() => handleInspect1F('stairs')}
                className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 transition-all text-left flex items-start gap-3"
              >
                <DoorOpen className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-neutral-100">檢查樓梯間樓層指示</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">查看樓層號碼牌</div>
                </div>
              </button>
            </div>

            {/* Dialogue / Inspection Box */}
            {activeDialogue && (
              <div className="bg-neutral-950 border border-amber-900/60 p-4 rounded-xl text-xs md:text-sm text-neutral-200 font-serif leading-relaxed">
                {activeDialogue}
              </div>
            )}

            {/* Elevator Trigger */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-mono">
                {hasKey504 ? '鑰匙已在手中，可前往五樓' : '請先與警衛交談取得鑰匙'}
              </span>

              <button
                onClick={handleGoTo504}
                disabled={!hasKey504}
                className={`px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
                  hasKey504
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30'
                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
              >
                搭乘電梯前往五樓 504 號房
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: In 504 */}
        {phase === 'in_504' && (
          <div className="space-y-6">
            <p className="text-xs md:text-sm text-neutral-300 font-serif leading-relaxed">
              用鑰匙轉開504號房的大門。房間內飄著一股淡淡的空氣清新劑氣味，但隱約能察覺有人居住的溫熱氣息。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleInspect504('living_traces')}
                className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 transition-all text-left"
              >
                <div className="text-xs font-bold text-neutral-100 mb-1">
                  調查廚房與生活痕跡
                </div>
                <div className="text-[11px] text-neutral-500">
                  檢查水電、瓦斯、冰箱
                </div>
              </button>

              <button
                onClick={() => handleInspect504('rules')}
                className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 transition-all text-left"
              >
                <div className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  茶几上的【住戶規則】
                </div>
                <div className="text-[11px] text-neutral-500">
                  {hasResidentRule ? '已收入規則手冊' : '翻閱拾取'}
                </div>
              </button>

              <button
                onClick={() => handleInspect504('trash_bin')}
                className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 transition-all text-left"
              >
                <div className="text-xs font-bold text-rose-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  垃圾桶內的碎紙片
                </div>
                <div className="text-[11px] text-neutral-500">
                  {hasLetterPiece ? '已拼湊完成' : '拼湊檢視'}
                </div>
              </button>
            </div>

            {activeDialogue && (
              <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl text-xs md:text-sm text-neutral-200 font-serif leading-relaxed">
                {activeDialogue}
              </div>
            )}

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-mono">
                {hasResidentRule && hasLetterPiece ? '已搜集504所有關鍵線索' : '請查閱茶几上的住戶規則與垃圾桶信件'}
              </span>

              <button
                onClick={handleFinish504}
                disabled={!hasResidentRule}
                className={`px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
                  hasResidentRule
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
              >
                調查完畢，走出504號房
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Red Guard Encounter (4F Anomaly) */}
        {phase === 'red_guard_encounter' && (
          <div className="space-y-6">
            <div className="p-4 bg-red-950/40 border border-red-800/70 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                【異常遭遇】：走廊上的紅衣警衛與扭曲的樓層牌
              </div>
              <p className="text-xs md:text-sm text-neutral-200 font-serif leading-relaxed">
                走出504號房關上門，你抬頭看了一眼走廊牆壁上的樓層牌，心臟猛地一跳——牌子上清清楚楚寫著：
                <span className="text-red-400 font-bold font-mono ml-1">『4F』</span>！
                你剛才明明進入的是五樓，不知何時竟然身處於不存在的四樓！
              </p>
              <p className="text-xs text-neutral-300 font-serif leading-relaxed">
                此時，走廊盡頭走來一名自稱警衛的男子，但他的制服赫然是<span className="text-red-400 font-bold">紅色外套配黑褲</span>！
                <br />
                紅衣男子對著你露出詭異的笑容：「電梯剛才發生故障正在維修，先生若要下樓，請走那邊的樓梯吧。」
              </p>
            </div>

            {/* Interactive Decision */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                面對男子的引導與緊閉的電梯門，你打算……
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleTakeElevator}
                  className="p-4 rounded-xl bg-neutral-900 hover:bg-emerald-950/60 border border-neutral-700 hover:border-emerald-500 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200 mb-1">
                    堅持走向客用電梯（遵守規則第2/3/4條）
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    「若身處4樓，請利用電梯回到1樓。忽略非白衣黑褲的警衛。」
                  </div>
                </button>

                <button
                  onClick={handleTakeStairs}
                  className="p-4 rounded-xl bg-neutral-900 hover:bg-red-950/60 border border-neutral-700 hover:border-red-500 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-red-300 group-hover:text-red-200 mb-1">
                    聽從紅衣警衛建議，走向樓梯間 (直覺預警：違反規則)
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    「既然電梯壞了，那就走樓梯吧……」（後頸隱隱泛起刺骨寒意）
                  </div>
                </button>
              </div>
            </div>

            {activeDialogue && (
              <div className="bg-neutral-950 border border-emerald-800 p-4 rounded-xl text-xs md:text-sm text-neutral-200 font-serif leading-relaxed">
                {activeDialogue}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Letter Puzzle Minigame Modal */}
      {showLetterPuzzle && (
        <LetterPuzzle
          onComplete={() => {
            setShowLetterPuzzle(false);
            onObtainItem('shredded_letter');
            setActiveDialogue('信件已拼湊完整！寄件人與收件地址竟然都寫著「404號房」！');
          }}
          onClose={() => setShowLetterPuzzle(false)}
        />
      )}

      {/* Chase Sequence Minigame Modal */}
      {showChase && (
        <ChaseSequence
          title="緊急逃脫：紅衣怪影自樓梯間追擊！"
          reason="你聽從了紅衣假警衛的誘騙走向樓梯，違反了「身處4樓應使用電梯」的住戶規則！"
          onSuccess={() => {
            setShowChase(false);
            sound.playElevatorChime();
            onObtainRule('rule_cleaner');
            setActiveDialogue('你驚險地衝回電梯並按下一樓，紅衣怪異在門外尖嘯！電梯回到了一樓，你在地上撿到【清潔人員工作規則】。');
            setTimeout(() => {
              onProceedToChapter2();
            }, 2500);
          }}
          onFail={() => {
            setShowChase(false);
            onModifySan(-4);
            onObtainRule('rule_cleaner');
            setActiveDialogue('你被怪異重重撲倒，眼前一黑……醒來時自己倒在一樓大廳地板上，身邊掉落著【清潔人員工作規則】。');
            setTimeout(() => {
              onProceedToChapter2();
            }, 2500);
          }}
        />
      )}
    </div>
  );
};
