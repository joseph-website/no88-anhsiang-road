import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Brain,
  ArrowRight,
  Skull,
  Zap,
  Layers
} from 'lucide-react';
import { sound } from '../../services/soundEngine';
import { EndingId, TraitId } from '../../types';
import { checkEndingConditions, EndingApproachStyle } from '../../utils/endingCalculator';

interface BossDeconstructionProps {
  san: number;
  playerName: string;
  trait: TraitId;
  hasKeyLetter: boolean;
  hasBlueprints: boolean;
  hasHandwrittenRule: boolean;
  hasOldCaseFile?: boolean;
  inventory?: string[];
  onFinishBattle: (ending: EndingId) => void;
}

export const BossDeconstruction: React.FC<BossDeconstructionProps> = ({
  san,
  playerName,
  trait,
  hasKeyLetter,
  hasBlueprints,
  hasHandwrittenRule,
  hasOldCaseFile = false,
  inventory = [],
  onFinishBattle
}) => {
  // Boss Phase State Machine: 0 (Phase 1), 1 (Phase 2), 2 (Phase 3 Final Choice)
  const [phase, setPhase] = useState<number>(0);
  const [typewriterHP, setTypewriterHP] = useState<number>(100);
  const [currentSan, setCurrentSan] = useState<number>(san);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isTypingAnimation, setIsTypingAnimation] = useState<boolean>(false);
  const [anomalyFlash, setAnomalyFlash] = useState<boolean>(false);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);
  const [isCognitiveGlitch, setIsCognitiveGlitch] = useState<boolean>(false);

  // Calculate core items count
  const coreEvidenceIds = [
    'old_case_file',
    'key_504',
    'shredded_letter',
    'building_blueprints',
    'guard_keycard',
    'tape_recorder'
  ];
  const coreItemsCount = coreEvidenceIds.filter(id => 
    inventory.includes(id) || 
    (id === 'old_case_file' && hasOldCaseFile) ||
    (id === 'shredded_letter' && hasKeyLetter) ||
    (id === 'building_blueprints' && hasBlueprints)
  ).length;

  // Typewriter background clatter sound (accelerates in Phase 3)
  useEffect(() => {
    const baseInterval = phase === 2 ? 220 : 450;
    const randomRange = phase === 2 ? 200 : 550;
    const clatter = setInterval(() => {
      sound.playTypewriter();
    }, baseInterval + Math.random() * randomRange);
    return () => clearInterval(clatter);
  }, [phase]);

  const triggerSevereAnomaly = () => {
    setAnomalyFlash(true);
    sound.playGlitch();
    setTimeout(() => {
      setAnomalyFlash(false);
    }, 450);
  };

  const bossAttacks = [
    {
      title: '階段一：【空間認知障壁 - 否定四樓的存在與偽造避難指引】',
      phaseBadge: '階段 1：偽造規則的指證',
      entityDialogue: '「住戶守則第一條：本大樓共四層樓，編號1至5樓，沒有四樓……請穿著紅色制服的專案人員立即進入 404 號房避難……違背規則的人，都必須消失。」',
      friendDialogue: '（張浩雙眼無神，機械式重複）：「安全……這裡沒有四樓……穿上紅色制服就安全了……」',
      prompt: '出示物證以揭露大樓抹消四樓的真相，並戳破偽造避難陷阱：',
      choices: [
        {
          id: 'blueprints',
          title: '出示【1998年建築違建藍圖與稽查公文】',
          detail: '指出四樓是1998年建商私自加蓋的違章建築，為了躲避拆除才刻意在動線上抹消並對住戶洗腦！',
          isCorrect: true,
          hpDamage: 35,
          counterSpeech: '「給我看清楚！這棟大樓根本不是什麼神祕不可違逆的空間，而是三十年前建商為了貪圖租金、逃避拆除稽查私自加蓋的違建！所謂的『沒有四樓』，只是建商製造的第一個謊言！」'
        },
        {
          id: 'resident_rule',
          title: '出示【住戶守則】並大聲朗讀條文',
          detail: '試圖按照守則條文與房間交涉',
          isCorrect: false,
          hpDamage: 0,
          counterSpeech: '（你朗讀了守則，但房間內傳來尖銳的嘲笑聲，數台打字機敲擊得更加狂亂！強烈的心理威壓令呼吸受阻。）'
        },
        {
          id: 'punch',
          title: '上前強行推翻打字機與辦公桌',
          detail: '進行物理破壞',
          isCorrect: false,
          hpDamage: 0,
          counterSpeech: '（打字機化為虛影，冰冷的鐵絲纏繞了你的手腕！一陣劇烈的劇痛與精神震盪襲來。）'
        }
      ]
    },
    {
      title: '階段二：【因果閉環的破除 - 戳破守則保護人類的假象】',
      phaseBadge: '階段 2：因果閉環的破除',
      entityDialogue: '「大樓管理處敬告：規則是為了保護大樓住戶與訪客的安全……只要穿上紅色制服，成為專案人員，你就能獲得永遠的平靜……四周鏡面皆為客觀現實，你逃不出這座牢籠！」',
      friendDialogue: '（張浩雙手顫抖，試圖抓取旁邊的紅色制服外套）：「穿上它……穿上就安全了……」',
      prompt: '出示證據以戳破規則的虛偽核心，擊碎四周恐懼鏡面：',
      choices: [
        {
          id: 'handwritten',
          title: '出示【手寫的規則（便條紙）】與【錄音筆筆跡】',
          detail: '揭露「規則是要管理它，不是管理你」以及「假裝不知道你知道」的核心真相！',
          isCorrect: true,
          hpDamage: 35,
          counterSpeech: '「省省吧！這張便條紙寫得很清楚——『規則是要管理它，不是管理你』！所謂的安全承諾，只是怪異為了捕獲新意識編造的陷阱！你一直在靠我們的恐懼與盲從在壯大自己！」'
        },
        {
          id: 'cleaner_rule',
          title: '出示【清潔人員工作守則】',
          detail: '試圖用清潔守則第2條「略過404」反駁',
          isCorrect: false,
          hpDamage: 0,
          counterSpeech: '（房間毫不理會：「清潔員早就放棄了思考，甘願成為大樓的齒輪……」意識受到劇烈拉扯。）'
        },
        {
          id: 'fake_evacuation',
          title: '出示【大樓緊急避難指引】',
          detail: '試圖按照避難指引要求專案人員協助',
          isCorrect: false,
          hpDamage: 0,
          counterSpeech: '（這正是怪異偽造的認知陷阱！你竟然採信了偽造規則，視野瞬間泛起刺目的血紅！）'
        }
      ]
    },
    {
      title: '階段三：【終局意志抉擇 - 決定安祥路88號與張浩的命運】',
      phaseBadge: '階段 3：終局意志抉擇',
      entityDialogue: '「不……不可能……你們不能否定規則……如果沒有規則，我們是什麼？404是什麼？！我們存在了三十年啊！！」',
      friendDialogue: '（張浩眼中的神采開始閃動）：「我……我當初只是想租一間便宜的套房……為什麼會變成這樣……？」',
      prompt: '打字機停止敲擊，四周恐懼鏡面已碎裂！請做出終局決斷：',
      choices: [
        {
          id: 'letter_truth',
          title: '⚖️ 邏輯解構・否定存在',
          detail: '出示拼湊完整的信件與歷史公文，宣告：404本質是人類集體恐懼具現化的概念，只要認清它，它就毫無威脅！',
          isCorrect: true,
          hpDamage: 30,
          approachStyle: 'deconstruct' as EndingApproachStyle,
          counterSpeech: '「404不是神祇，也不是不可違逆的法則！它只是三十年來無數被恐懼支配的人類意識所凝聚的幻影！當我們不再恐懼、當我們認清這一切只是一間違建的破房間——你的規則，就徹底失去了力量！」'
        },
        ...(trait === 'intuitive' || trait === 'empath' ? [
          {
            id: 'listen_reconcile',
            title: '👂 ★【直覺／共感專屬】：直覺共感・傾聽執念',
            detail: '傾聽1998年第一任失蹤者的孤獨悲傷，寫下互諒共生條約，撫平大樓創傷。',
            isCorrect: false,
            hpDamage: 30,
            approachStyle: 'listen' as EndingApproachStyle,
            counterSpeech: '「我們聽見了你們三十年來的痛苦與孤獨。四樓不會再被抹消，你們的名字將被永遠銘記。」'
          }
        ] : []),
        {
          id: 'claim_typewriter',
          title: '🔨 暴力摧毀・以暴制暴',
          detail: '上前砸毀打字機色帶與機芯，強行終止規則。',
          isCorrect: false,
          hpDamage: 30,
          approachStyle: 'violence' as EndingApproachStyle,
          counterSpeech: '「既然規則由文字而生，那麼就用物理粉碎這一切！」'
        },
        {
          id: 'grab_and_run',
          title: '🏃 倉皇撤退・帶走張浩',
          detail: '拉起張浩，轉身奪門狂奔衝向一樓正門出口。',
          isCorrect: false,
          hpDamage: 0,
          approachStyle: 'flee_with_target' as EndingApproachStyle,
          counterSpeech: '「張浩，快跟我走！別再理會這些紙條了，我們直接回一樓！」'
        }
      ]
    }
  ];

  const currentAttack = bossAttacks[phase];

  const handleChoice = (choice: {
    id: string;
    title: string;
    isCorrect: boolean;
    hpDamage?: number;
    approachStyle?: EndingApproachStyle;
    counterSpeech: string;
  }) => {
    sound.playClick();
    setIsTypingAnimation(true);
    setFeedback(choice.counterSpeech);

    if (choice.isCorrect) {
      sound.playResolutionChord();
      triggerSevereAnomaly();
      const updatedSan = Math.min(100, currentSan + 4);
      const newHp = Math.max(0, typewriterHP - (choice.hpDamage || 35));
      setCurrentSan(updatedSan);
      setTypewriterHP(newHp);

      setTimeout(() => {
        setIsTypingAnimation(false);
        if (phase < bossAttacks.length - 1) {
          setPhase(prev => prev + 1);
          setFeedback(null);
        } else {
          // Final phase completed with logic deconstruction!
          const result = checkEndingConditions({
            san: updatedSan,
            core_items_count: coreItemsCount,
            is_deconstructed: true,
            approach_style: 'deconstruct',
            trait
          });
          onFinishBattle(result.endingId);
        }
      }, 2400);
    } else if (choice.approachStyle) {
      sound.playResolutionChord();
      triggerSevereAnomaly();
      const newHp = Math.max(0, typewriterHP - (choice.hpDamage || 30));
      setTypewriterHP(newHp);
      setTimeout(() => {
        const result = checkEndingConditions({
          san: currentSan,
          core_items_count: coreItemsCount,
          is_deconstructed: false,
          approach_style: choice.approachStyle!,
          trait
        });
        onFinishBattle(result.endingId);
      }, 2200);
    } else {
      sound.playGlitch();
      triggerSevereAnomaly();
      setIsScreenShaking(true);
      setIsCognitiveGlitch(true);
      setTimeout(() => setIsScreenShaking(false), 1200);
      setTimeout(() => setIsCognitiveGlitch(false), 1600);

      const penalty = choice.id === 'fake_evacuation' ? 12 : 8;
      const newSan = Math.max(0, currentSan - penalty);
      setCurrentSan(newSan);

      setTimeout(() => {
        if (newSan > 0) {
          setIsTypingAnimation(false);
        } else {
          // Defensive locking: keep buttons disabled when SAN hits zero to prevent race conditions
          const result = checkEndingConditions({
            san: 0,
            core_items_count: coreItemsCount,
            is_deconstructed: false,
            approach_style: 'succumb',
            trait
          });
          onFinishBattle(result.endingId);
        }
      }, 2000);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 ${anomalyFlash ? 'animate-pulse' : ''}`}>
      <motion.div 
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-neutral-950 border-2 transition-all duration-300 ${
          isCognitiveGlitch 
            ? 'border-red-600 shadow-[0_0_35px_rgba(239,68,68,0.7)]' 
            : 'border-red-900/80 shadow-2xl'
        } rounded-xl max-w-4xl w-full p-5 sm:p-6 relative text-neutral-200 overflow-hidden flex flex-col max-h-[92vh] ${
          isScreenShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Dynamic Scanline Overlay */}
        <div className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
          phase === 2 
            ? 'bg-[linear-gradient(rgba(24,10,10,0)_50%,rgba(180,20,20,0.35)_50%)] bg-[length:100%_2px] opacity-75 animate-pulse' 
            : 'bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.6)_50%)] bg-[length:100%_4px] opacity-40'
        }`} />

        {/* Top Battle Header with HP Compression Bar */}
        <div className="border-b border-neutral-800 pb-3 mb-4 relative z-10 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500 animate-pulse" />
              <h3 className="text-base md:text-lg font-bold text-neutral-100 font-serif">
                404 號房實體 • 自動敲擊打字機對峙
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-xs font-mono font-bold">
                {currentAttack.phaseBadge}
              </span>
              {phase === 2 && (
                <span className="px-2 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-600 text-[11px] font-mono font-bold animate-pulse flex items-center gap-1">
                  <Zap className="w-3 h-3 text-rose-400" />
                  【404空間坍塌臨界】
                </span>
              )}
            </div>
          </div>

          {/* Typewriter HP Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Skull className="w-3.5 h-3.5" /> 怪異概念壓迫值 (HP):
              </span>
              <span className="text-amber-300 font-bold">{typewriterHP} / 100</span>
            </div>
            <div className="w-full h-2.5 bg-neutral-900 rounded-full border border-red-900/60 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-purple-600 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                style={{ width: `${typewriterHP}%` }}
                animate={{ width: `${typewriterHP}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* SAN & Core Items Counter */}
          <div className="flex items-center justify-between text-xs font-mono pt-1 text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-rose-400" />
              <span>心理防線:</span>
              <span className={`font-bold ${currentSan > 60 ? 'text-emerald-400' : currentSan > 30 ? 'text-amber-400' : 'text-red-500 animate-pulse'}`}>
                {currentSan > 60 ? '穩固' : currentSan > 30 ? '動搖' : '崩解'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400/90">
              <Layers className="w-3.5 h-3.5" />
              <span>核心物證鏈: {coreItemsCount}/6 件</span>
            </div>
          </div>
        </div>

        {/* Boss Monologue Box with Cognitive Distortion Feedback */}
        <div className={`rounded-lg p-4 mb-4 relative z-10 space-y-2.5 shadow-inner transition-all duration-300 ${
          isCognitiveGlitch 
            ? 'bg-red-950/80 border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-shake' 
            : 'bg-neutral-900/90 border border-neutral-700'
        }`}>
          <div className="text-xs font-mono text-red-400 font-semibold tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Skull className="w-3.5 h-3.5" />
              {currentAttack.title}
            </span>
            {isCognitiveGlitch && (
              <span className="text-[10px] text-rose-200 font-bold font-mono animate-pulse bg-red-900/80 px-2 py-0.5 rounded border border-red-500">
                ⚠️ 認知反噬・打字機尖嘯
              </span>
            )}
          </div>
          
          <p className={`text-xs sm:text-sm font-serif italic leading-relaxed p-3 rounded border transition-colors duration-300 ${
            isCognitiveGlitch 
              ? 'bg-black/90 text-red-400 border-red-500 font-bold tracking-wide animate-pulse' 
              : 'bg-black/50 text-red-200 border-red-950/80'
          }`}>
            {currentAttack.entityDialogue}
          </p>

          <p className="text-xs text-amber-200/90 font-serif pl-2.5 border-l-2 border-amber-600">
            {currentAttack.friendDialogue}
          </p>
        </div>

        {/* Counter-attack Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-indigo-950/90 border border-indigo-500/70 p-3 rounded-lg mb-3 text-xs md:text-sm font-serif text-indigo-100 leading-relaxed shadow-lg relative z-10"
            >
              <div className="font-bold text-indigo-300 mb-0.5">【{playerName || '調查員'} 的對應】：</div>
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Choices */}
        <div className="relative z-10 space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
            {currentAttack.prompt}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {currentAttack.choices.map((choice) => (
              <button
                key={choice.id}
                disabled={isTypingAnimation}
                onClick={() => handleChoice(choice)}
                className={`p-3 rounded-lg border text-left transition-all flex items-start justify-between group ${
                  isTypingAnimation
                    ? 'bg-neutral-900/40 border-neutral-800 text-neutral-600 cursor-not-allowed'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 hover:border-amber-500 text-neutral-200 cursor-pointer'
                }`}
              >
                <div>
                  <div className="text-xs md:text-sm font-bold text-neutral-100 group-hover:text-amber-300 mb-0.5 font-serif">
                    {choice.title}
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-relaxed font-serif">
                    {choice.detail}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 mt-1 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Status */}
        <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 relative z-10 font-mono">
          <span>提示：根據大樓歷史公文、碎紙信件與手寫規則進行邏輯反擊</span>
          <span>404 因果閉環 // 概念解構進度 {phase + 1}/3</span>
        </div>
      </motion.div>
    </div>
  );
};
