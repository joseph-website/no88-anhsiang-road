import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  AlertTriangle,
  ShieldAlert,
  FileWarning,
  Eye,
  ArrowRight
} from 'lucide-react';
import { sound } from '../services/soundEngine';

interface MetaTransitionModalProps {
  isOpen: boolean;
  playerName: string;
  boardName?: string;
  articleTitle?: string;
  onFinishTransition: () => void;
}

type TransitionStep = 'sanatorium' | 'office_forum' | 'meta_glitch';

export const MetaTransitionModal: React.FC<MetaTransitionModalProps> = ({
  isOpen,
  playerName,
  boardName = '怪談',
  articleTitle = '那棟大樓',
  onFinishTransition
}) => {
  const [step, setStep] = useState<TransitionStep>('sanatorium');
  const [dialogueIndex, setDialogueIndex] = useState<number>(0);
  const [forumScrolled, setForumScrolled] = useState<boolean>(false);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);

  // Reset step on open
  useEffect(() => {
    if (isOpen) {
      setStep('sanatorium');
      setDialogueIndex(0);
      setForumScrolled(false);
      setIsGlitching(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Dialogue lines for Sanatorium
  const sanatoriumDialogues = [
    {
      speaker: '旁白記錄',
      text: '【案件結案後第七天・市立醫院．普通病房】\n午後的陽光被百葉窗切成冰冷的條紋。空氣中瀰漫著濃重的消毒水氣味。'
    },
    {
      speaker: `${playerName || '林偵探'}`,
      text: '「張浩，我帶了你最常喝的黑咖啡。醫生說你的生理指數正在回穩，委託人陳先生也很關心你的復原進度……」'
    },
    {
      speaker: '張浩（雙眼空洞・蜷縮在病床角落）',
      text: '（他死死盯著病房白牆，雙手指甲深深摳進床單，嘴唇慘白顫抖，完全沒有看你一眼）\n「……不是我的問題……不是欠債……」'
    },
    {
      speaker: '張浩（極度驚恐・喃喃自語）',
      text: '「警衛根本沒下樓……那身紅衣服……別相信剛印出來的指引……\n聽鍵盤聲……聽打字機……看清楚規則……一旦看錯就再也出不去了……」'
    },
    {
      speaker: `${playerName || '林偵探'}`,
      text: '「張浩？你在說什麼？哪裡來的打字機和紅色衣服？504 號房不是只有你的電腦和設計圖稿嗎？」'
    },
    {
      speaker: '張浩（突然轉過頭・瞳孔劇烈收縮）',
      text: '「你根本沒救我出來！你以為你走出了那棟大樓？！\n它在編寫我們……它一直在敲鍵盤……它在看著你啊——！！」\n（儀器發出刺耳警報，護理人員急忙衝入注射鎮靜劑，張浩被按倒在床上抽搐昏睡）'
    },
    {
      speaker: '旁白記錄',
      text: '那一夜，張浩癲狂的眼神與嘶啞的警告，像燒紅的鐵烙一樣印在你的腦海深處。\n你帶著滿腹疑竇返回了私家偵探事務所。張浩在醫院整整住了七天，第八日的陽光已然昇起，但那座大樓的陰影從未消散。'
    }
  ];

  const handleNextSanatorium = () => {
    sound.playPaper();
    if (dialogueIndex < sanatoriumDialogues.length - 1) {
      setDialogueIndex(prev => prev + 1);
    } else {
      // Advance to Office Forum
      sound.playClick();
      setStep('office_forum');
    }
  };

  const handleTriggerMetaGlitch = () => {
    sound.playMetaGlitchBurst();
    setStep('meta_glitch');
    setIsGlitching(true);

    // Save completed_week1 flag to localStorage
    try {
      localStorage.setItem('completed_week1', 'true');
      localStorage.setItem('ROOM404_JUST_TRANSITIONED', 'true');
    } catch (e) {
      console.error('Failed to set completed_week1:', e);
    }

    // Auto complete transition after glitch animation
    setTimeout(() => {
      onFinishTransition();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none font-serif">
      <AnimatePresence mode="wait">
        {/* STEP 1: SANATORIUM VISIT */}
        {step === 'sanatorium' && (
          <motion.div
            key="sanatorium"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full bg-[#121417] border border-[#2a3038] rounded-2xl p-6 sm:p-8 shadow-2xl text-neutral-200 space-y-6 relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-sky-400 font-mono text-xs">
                <Heart className="w-4 h-4 animate-pulse" />
                <span className="font-bold tracking-wider">後日談紀錄 // 市立醫院．普通病房探視（第七天）</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">SCENE 01 / 03</span>
            </div>

            {/* Visual Sketch Area */}
            <div className="relative h-44 sm:h-52 bg-gradient-to-b from-[#090b0d] to-[#161a20] rounded-xl border border-neutral-800 overflow-hidden flex flex-col items-center justify-center p-4 text-center">
              {/* Rain on window overlay */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 space-y-2 max-w-md">
                <div className="w-12 h-12 mx-auto rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 shadow-inner">
                  <Eye className="w-6 h-6 text-sky-400/80" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-neutral-100 font-serif">
                  病患：張浩（原室內設計師）
                </h4>
                <p className="text-xs text-neutral-400 font-serif leading-relaxed italic">
                  「神智嚴重退化、伴隨急性迫害妄想與反覆規約囈語。臨床診斷對特定樓層與打字聲存在異常病理性恐懼。」
                </p>
              </div>
            </div>

            {/* Current Dialogue Box */}
            <div className="bg-black/60 border border-neutral-800/90 rounded-xl p-5 min-h-[130px] flex flex-col justify-between space-y-3 shadow-inner">
              <div className="text-xs font-bold font-mono text-sky-300">
                {sanatoriumDialogues[dialogueIndex].speaker}
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-line font-serif">
                {sanatoriumDialogues[dialogueIndex].text}
              </p>
              <div className="text-right text-[10px] font-mono text-neutral-500">
                對話進度 {dialogueIndex + 1} / {sanatoriumDialogues.length}
              </div>
            </div>

            {/* Advance Button */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleNextSanatorium}
                className="px-6 py-2.5 rounded-xl bg-sky-950 hover:bg-sky-900 border border-sky-600/80 text-sky-200 text-xs font-serif font-bold tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-sky-950/40 cursor-pointer"
              >
                <span>{dialogueIndex < sanatoriumDialogues.length - 1 ? '繼續聆聽' : '整理卷宗返回事務所'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: LATE-NIGHT OFFICE FORUM */}
        {step === 'office_forum' && (
          <motion.div
            key="office_forum"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl w-full bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 sm:p-7 shadow-2xl text-neutral-200 space-y-5 relative overflow-hidden"
          >
            {/* Retro Browser Header */}
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                </div>
                <span className="text-neutral-300 ml-2 font-mono text-[11px] truncate max-w-xs sm:max-w-none">
                  https://bbs.urban-legend.tw/board/{boardName === '怪談' ? 'ghost_stories' : 'marvel'}/thread_building88.html
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">SCENE 02 / 03</span>
            </div>

            {/* Forum Post Content */}
            <div 
              onScroll={() => setForumScrolled(true)}
              className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 sm:p-5 max-h-[380px] overflow-y-auto space-y-4 font-mono text-xs leading-relaxed text-neutral-300"
            >
              {/* Post Title */}
              <div className="border-b border-[#30363d] pb-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm sm:text-base">
                  <FileWarning className="w-4 h-4 shrink-0" />
                  <span>【怪談】[經驗] {articleTitle}（千萬別靠近）</span>
                </div>
                <div className="text-[10px] text-neutral-500 mt-1 flex flex-wrap items-center gap-3">
                  <span>發文者：NightWalker_99</span>
                  <span>時間：2019-10-14 02:44:19</span>
                  <span>人氣：48,912 點閱</span>
                </div>
              </div>

              {/* Forum Post Body */}
              <div className="space-y-3 font-serif text-neutral-200">
                <p className="text-neutral-300">
                  看到最近又有人在問安祥路那棟跳過 4 樓的老公寓，身為前住客的家屬，我鄭重警告各位：
                  <b>那裡根本不是人住的地方。</b>
                </p>

                <div className="bg-black/50 border border-neutral-700/80 rounded-lg p-3 space-y-2 text-xs font-mono text-amber-200">
                  <div className="font-bold text-amber-400 border-b border-neutral-800 pb-1">
                    【流傳於深層論壇的大樓非官方生存守則摘錄】：
                  </div>
                  <ul className="list-decimal list-inside space-y-1.5 leading-relaxed text-neutral-300">
                    <li>
                      <span className="text-neutral-200">本大樓在物理上沒有 4 樓。</span>
                      若搭乘電梯時指示燈熄滅或水平停靠在無數字樓層，<b>切勿踏出車廂</b>。
                    </li>
                    <li>
                      值班警衛<b>只穿白色制服（白衣黑褲）</b>。若在大廳或走廊看見身著<b>紅色制服</b>或非白色制服的管理員，請立刻背對、切勿理會並保持絕對安靜。
                    </li>
                    <li>
                      <span className="text-rose-400 font-bold">【核心警訊】：</span>
                      若在走廊聽見極為急促微弱的<b>「電腦鍵盤敲擊聲」</b>，代表<b>怪異正在即時編寫全新的誘捕假規則</b>！請勿相信任何剛被貼在牆壁上的白色指引！
                    </li>
                    <li>
                      504 號房的水電表與被抹消的 404 號房共用。所有住進 504 的人，最後都會被當成替身拖入摺疊空間。
                    </li>
                  </ul>
                </div>

                {/* Detective's Shock Realization */}
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs space-y-1">
                  <div className="text-rose-400 font-bold font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>【調查員的即時認知震撼】</span>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed italic">
                    「張浩在病床上反覆說的……『別相信剛印出來的指引』、『聽鍵盤聲』……竟然字字句句與這份五年前的怪談守則完全吻合！
                    我在 504 房聽到的打字聲，根本不是張浩在用電腦……而是那棟大樓的本體在編造規則？！」
                  </p>
                </div>
              </div>
            </div>

            {/* Forum Action */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] font-mono text-neutral-400">
                撕開表面常態偽裝，直面隱匿的怪異本質。
              </div>
              <button
                onClick={handleTriggerMetaGlitch}
                className="px-6 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-600 text-red-100 text-xs font-serif font-bold tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-red-950/60 cursor-pointer animate-pulse"
              >
                <span>破壁解構 // 揭開真實真相</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: META SYSTEM GLITCH & RECONSTRUCTION */}
        {step === 'meta_glitch' && (
          <motion.div
            key="meta_glitch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center space-y-6"
          >
            {/* Heavy CRT Scanlines & Glitch Displacement */}
            <div className="absolute inset-0 bg-red-950/20 mix-blend-color-dodge pointer-events-none animate-ping" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.1)_50%,rgba(0,0,0,0.9)_50%)] bg-[length:100%_4px] pointer-events-none" />

            <div className="space-y-4 max-w-xl relative z-10 font-mono">
              <motion.div
                animate={{ 
                  x: [-5, 5, -3, 3, 0],
                  filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)']
                }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                className="w-16 h-16 mx-auto rounded-2xl bg-red-950 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.8)]"
              >
                <ShieldAlert className="w-8 h-8" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-red-500 tracking-wider">
                [SYSTEM REALITY CORRUPTION]
              </h2>

              <div className="bg-black/90 border border-red-800/80 rounded-xl p-4 text-xs text-red-300 text-left space-y-1 shadow-2xl">
                <p>&gt; COGNITIVE SHELL COMPROMISED...</p>
                <p>&gt; DECONSTRUCTING SOCIAL DETECTIVE ILLUSION...</p>
                <p>&gt; REVEALING ROOM 404 FOLDED ENTITY...</p>
                <p className="text-amber-400 font-bold">&gt; UNLOCKING: COGNITIVE METERS / 7 RULES / 6 EVIDENCES / 8 ENDINGS</p>
                <p className="text-emerald-400 font-bold">&gt; SAVE STATE WRITTEN: completed_week1 = true</p>
              </div>

              <div className="text-xs text-neutral-400 font-serif pt-2 animate-pulse">
                正在重構大樓世界觀……即將返回主選單……
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
