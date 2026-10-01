import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wind,
  Sparkles,
  Footprints,
  Heart,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { sound } from '../services/soundEngine';
import { INVENTORY_ITEMS } from '../data/rulesData';

interface MentalCrisisModalProps {
  isOpen: boolean;
  san: number;
  inventory: string[];
  currentLocationName: string;
  crisisRetreatCount?: number;
  maxCrisisRetreats?: number;
  completedWeek1?: boolean;
  onSuccessRescue: (recoveredSan: number, methodDescription: string, consumedItemId?: string) => void;
  onEmergencyRetreat: () => void;
  onTotalBreakdown: () => void;
}

export const MentalCrisisModal: React.FC<MentalCrisisModalProps> = ({
  isOpen,
  san,
  inventory,
  currentLocationName,
  crisisRetreatCount = 0,
  maxCrisisRetreats = 3,
  completedWeek1 = false,
  onSuccessRescue,
  onEmergencyRetreat,
  onTotalBreakdown
}) => {
  // Mode: 'menu' (選擇自救方式) | 'breathing_qte' (深呼吸對焦小遊戲) | 'item_use' (使用道具) | 'retreat_confirm' (逃跑)
  const [currentMode, setCurrentMode] = useState<'menu' | 'breathing_qte' | 'item_use' | 'retreat_confirm'>('menu');

  const remainingChances = Math.max(0, maxCrisisRetreats - crisisRetreatCount);

  // Countdown timer for crisis (35 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(35);
  const timerRef = useRef<number | null>(null);

  // QTE Mini-game states
  // Cursor pos: 0 to 100%
  const [cursorPos, setCursorPos] = useState<number>(50);
  const [cursorSpeed, setCursorSpeed] = useState<number>(1.8);
  const [cursorDir, setCursorDir] = useState<number>(1);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [targetZone, setTargetZone] = useState<{ start: number; width: number }>({ start: 38, width: 24 });
  const [qteFeedback, setQteFeedback] = useState<{ text: string; type: 'success' | 'fail' } | null>(null);
  const [qteShake, setQteShake] = useState<boolean>(false);

  // Distorted hallucinatory thoughts floating across the screen
  const [hallucinationText, setHallucinationText] = useState<string>('意識正在下沉……眼前的走廊在扭曲旋轉……');

  const HALLUCINATIONS = [
    '「牆壁在呼吸……所有房號都在往後退……」',
    '「那是張浩的聲音嗎？不……那是電梯鋼纜的摩擦聲……」',
    '「不能閉上眼睛！一旦閉上，影子就會走出來……」',
    '「冷靜！穩住呼吸！按住脈搏……這只是認知過載！」',
    '「安祥路88號……沒有第4層……只有無盡的迴廊……」'
  ];

  // Initialize crisis effects and countdown timer
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Reset states
    setTimeLeft(25);
    setCurrentMode('menu');
    setSuccessCount(0);
    setCursorPos(20);
    setCursorDir(1);
    setTargetZone({ start: 36, width: 26 });
    setQteFeedback(null);

    // Play panic audio
    sound.playTensionSting();
    sound.playSingleHeartbeat();
    sound.playTinnitus();
    sound.playHallucinationWhisper();

    // Loop heartbeat & hallucinations
    const sfxInterval = window.setInterval(() => {
      sound.playSingleHeartbeat();
      if (Math.random() > 0.4) {
        sound.playHallucinationWhisper();
      }
      setHallucinationText(HALLUCINATIONS[Math.floor(Math.random() * HALLUCINATIONS.length)]);
    }, 1400);

    // Countdown timer (Auto-triggers emergency survival retreat upon expiry to prevent forced death)
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          clearInterval(sfxInterval);
          // 超時啟動本能撤退，保護玩家不被迫遭遇失敗結局
          onEmergencyRetreat();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(sfxInterval);
    };
  }, [isOpen]);

  // Breathing QTE cursor movement loop
  useEffect(() => {
    if (!isOpen || currentMode !== 'breathing_qte') return;

    let animFrame: number;
    const animateCursor = () => {
      setCursorPos(prev => {
        let next = prev + cursorSpeed * cursorDir;
        if (next >= 96) {
          setCursorDir(-1);
          next = 96;
        } else if (next <= 4) {
          setCursorDir(1);
          next = 4;
        }
        return next;
      });
      animFrame = requestAnimationFrame(animateCursor);
    };

    animFrame = requestAnimationFrame(animateCursor);
    return () => cancelAnimationFrame(animFrame);
  }, [isOpen, currentMode, cursorSpeed, cursorDir]);

  if (!isOpen) return null;

  // Handle QTE Click (Breathing Alignment)
  const handleQteClick = () => {
    const inZone = cursorPos >= targetZone.start && cursorPos <= (targetZone.start + targetZone.width);

    if (inZone) {
      sound.playInspectSuccess();
      const nextCount = successCount + 1;
      setSuccessCount(nextCount);
      setQteFeedback({ text: `神經迴路對齊成功！(${nextCount}/3) 意識開始凝聚……`, type: 'success' });
      
      // Shift target zone and increase speed slightly for next stage
      setTargetZone({
        start: Math.max(15, Math.min(65, Math.floor(Math.random() * 50) + 15)),
        width: Math.max(18, 26 - nextCount * 3)
      });
      setCursorSpeed(prev => prev + 0.4);

      if (nextCount >= 3) {
        sound.playResolutionChord();
        setTimeout(() => {
          onSuccessRescue(28, '藉由意志對焦與深層吐納，成功驅散精神幻覺，心智回穩！');
        }, 500);
      }
    } else {
      sound.playGlitch();
      setQteShake(true);
      setTimeout(() => setQteShake(false), 300);
      setQteFeedback({ text: '吸氣節奏紊亂！心跳加速……再次嘗試抓住平衡！', type: 'fail' });
      // Minor penalty on remaining time
      setTimeLeft(prev => Math.max(2, prev - 2));
    }
  };

  // Find usable rescue items in inventory
  const usableItems = inventory.map(id => INVENTORY_ITEMS[id]).filter(Boolean);

  // Usable item handler
  const handleUseItemForRescue = (itemId: string) => {
    sound.playPaper();
    sound.playResolutionChord();
    
    let recoverAmount = 30;
    let description = '使用了隨身應急物品，藉由熟悉的現實物件平復了失控的思緒。';

    if (itemId === 'contradiction_deduction_note' || itemId.includes('contradiction')) {
      recoverAmount = 45;
      description = '攤開隨身攜帶的【怪談破綻筆記】，逐行默唸條文的邏輯衝突。清晰客觀的理智論證如重錨般撕裂了荒誕幻象，心智重新建立防禦陣線！';
    } else if (itemId.includes('coffee')) {
      recoverAmount = 35;
      description = '大口飲下冰涼苦澀的冷萃黑咖啡，濃郁的咖啡因與苦味刺激味蕾，思緒瞬間洗滌清明，精神防線重新穩固！';
    } else if (itemId.includes('mint') || itemId.includes('candy') || itemId.includes('snack')) {
      recoverAmount = 30;
      description = '吃下高能蘇打餅乾與醒腦零食，糖分與清涼強烈刺激大腦，強行驅散了眼前的扭曲幻象！';
    } else if (itemId.includes('cigarette')) {
      recoverAmount = 40;
      description = '劃亮火柴點燃老牌濾嘴香菸，深吸一口焦香的煙霧，微弱的橘紅火光在黑暗中宛如燈塔，徹底瓦解了恐慌！';
    } else if (itemId.includes('thermos') || itemId.includes('water')) {
      recoverAmount = 35;
      description = '飲下微溫的開水，暖流順著喉嚨化解了胸口的寒顫與恐慌，神智重歸清明。';
    } else if (itemId.includes('recorder')) {
      recoverAmount = 32;
      description = '撥動口袋錄音機的倒帶鍵，耳邊傳來清晰的機械雜音與自己的聲音，將意識強行拉回現實。';
    } else if (itemId.includes('badge') || itemId.includes('flashlight')) {
      recoverAmount = 28;
      description = '握緊金屬器具的冷冽邊角，強烈的觸覺刺激驅散了視野中蔓延的幻象。';
    }

    onSuccessRescue(recoverAmount, description, itemId);
  };

  // Pinch / Pain Focus Rescue (Fallback if no items)
  const handlePhysicalPainRescue = () => {
    sound.playGlitch();
    sound.playInspectSuccess();
    onSuccessRescue(20, '用力咬破舌尖，藉由強烈的痛覺與血腥味強行驅散幻象，奪回軀體控制權！');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden select-none">
      {/* Heavy Red / Vignette Background Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />

      {/* Red Glitch Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(180,20,20,0.45)_95%)] animate-pulse" />
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.2)_0px,rgba(0,0,0,0.2)_2px,transparent_2px,transparent_4px)] opacity-60" />

      {/* Floating Hallucinatory Text in Background */}
      <div className="absolute top-8 sm:top-12 left-1/2 -translate-x-1/2 max-w-xl w-full px-4 text-center pointer-events-none z-10">
        <motion.p 
          key={hallucinationText}
          initial={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
          animate={{ opacity: 0.85, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
          className="text-xs sm:text-sm font-serif italic text-rose-300/80 tracking-widest drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]"
        >
          {hallucinationText}
        </motion.p>
      </div>

      {/* Main Crisis Dialogue Container */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={`relative z-20 w-full max-w-2xl retro-forum-modal-window shadow-2xl overflow-hidden text-[#1a2e18] flex flex-col font-sans border-2 border-[#8b1515] ${
          qteShake ? 'translate-x-1 duration-75' : ''
        }`}
      >
        {/* Top Emergency Status Bar */}
        <div className="bg-[#781717] text-white p-2.5 sm:p-3 flex items-center justify-between border-b-2 border-[#540c0c] select-none">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">⚠️</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[10px] text-[#fca5a5] uppercase tracking-wider">
                  [緊急警報] 意識崩潰臨界
                </span>
                <span className="text-[10px] px-1 py-0.2 bg-[#450d0d] text-[#fca5a5] border border-[#f87171] font-mono">
                  指針歸零
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                心智指針失衡 • 緊急自救程序
              </h2>
            </div>
          </div>

          {/* 25s Countdown Progress */}
          <div className="text-right flex items-center gap-2 bg-[#450d0d] border border-[#f87171] px-2.5 py-1 text-white font-mono shadow-inner">
            <span className="text-[10px] text-[#fca5a5]">崩潰倒數</span>
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-[#f87171] animate-pulse" />
              <span className={`text-sm font-bold ${
                timeLeft <= 8 ? 'text-[#fca5a5] animate-ping' : 'text-[#fef08a]'
              }`}>
                00:{String(timeLeft).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 space-y-3.5 bg-[#fdf5f5] text-[#2c1212]">
          {/* Dynamic Center Modes */}
          {currentMode === 'menu' && (
            <div className="space-y-3">
              <div className="p-2.5 bg-white border border-[#d99c89] text-xs text-[#521b12] leading-relaxed">
                當前身處 <span className="text-[#85250c] font-bold">【{currentLocationName}】</span>。四周景物正在劇烈褪色與扭曲，大樓的異象正試圖侵蝕你的認知。你必須在理智徹底潰散前奪回意識主導權！
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {/* Option 1: Steady Breath Mini-Game */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentMode('breathing_qte');
                  }}
                  className="w-full group text-left p-3 bg-white hover:bg-[#eef8ed] border border-[#7ca078] hover:border-[#2b5828] transition-all flex items-center justify-between cursor-pointer shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-[#e4ede2] border border-[#7ca078] text-[#2b5828] mt-0.5 shrink-0">
                      <Wind className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#1c4718]">
                          【深呼吸節奏調節】專注心智對焦
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#d8edd4] text-[#1c4718] border border-[#7ca078] font-mono">
                          意志檢定
                        </span>
                      </div>
                      <p className="text-[11px] text-[#426140] mt-0.5">
                        閉上雙眼進行規律吐納，依心跳節奏調校神經迴路，重振精神。
                      </p>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#7ca078] group-hover:text-[#2b5828] shrink-0 ml-2" />
                </button>

                {/* Option 2: Use Inventory Item */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentMode('item_use');
                  }}
                  className="w-full group text-left p-3 bg-white hover:bg-[#fffbe6] border border-[#c4ab58] hover:border-[#856117] transition-all flex items-center justify-between cursor-pointer shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-[#fef5d0] border border-[#c4ab58] text-[#856117] mt-0.5 shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#664609]">
                          【使用隨身物品應急】尋找現實錨點
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#fdf2c2] text-[#664609] border border-[#c4ab58] font-mono">
                          物品支援
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6b5220] mt-0.5">
                        檢視隨身背包中的物證或隨身物品，藉由熟悉物品平復恐慌與混亂。
                      </p>
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#c4ab58] group-hover:text-[#856117] shrink-0 ml-2" />
                </button>

                {/* Option 3: Emergency Retreat */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentMode('retreat_confirm');
                  }}
                  className="w-full group text-left p-3 bg-white hover:bg-[#fdf3f0] border border-[#d99c89] hover:border-[#ba3818] transition-all flex items-center justify-between cursor-pointer shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-[#fceae6] border border-[#d99c89] text-[#ba3818] mt-0.5 shrink-0">
                      <Footprints className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#85250c]">
                          【放棄當前勘驗】狼狽撤逃至一樓安全區
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#fadbd4] text-[#85250c] border border-[#d99c89] font-mono">
                          {remainingChances > 1 ? `再來${remainingChances - 1}次可能精神會受不了` : '心智承受力已瀕臨最後極限'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#783626] mt-0.5">
                        抱頭狂奔逃離危險樓層直奔大門。重置回 1F 大廳喘息，勉強穩固心神。
                      </p>
                    </div>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-[#d99c89] group-hover:text-[#ba3818] shrink-0 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Mode: Breathing QTE Mini-Game */}
          {currentMode === 'breathing_qte' && (
            <div className="space-y-3 text-center">
              <div className="text-left bg-white p-2.5 border border-[#7ca078]">
                <span className="text-xs text-[#1c4718] block font-bold">
                  🎯 當擺動光標進入【綠色冷靜區間】時按下「呼氣 / 穩定脈搏」，對齊 3 次即可平復恐慌！
                </span>
              </div>

              {/* QTE Gauge Track */}
              <div className="relative w-full h-10 bg-[#e4ede2] border-2 border-[#557852] overflow-hidden shadow-inner flex items-center my-2">
                {/* Target Focus Zone */}
                <div 
                  className="absolute top-0 bottom-0 bg-[#a4d79d] border-x-2 border-[#2b5828] flex items-center justify-center transition-all duration-300"
                  style={{
                    left: `${targetZone.start}%`,
                    width: `${targetZone.width}%`
                  }}
                >
                  <span className="text-[10px] font-mono font-bold text-[#1c4718] tracking-wider">
                    平衡區間
                  </span>
                </div>

                {/* Moving Pulse Cursor */}
                <div 
                  className="absolute top-1 bottom-1 w-3 bg-[#dc2626] border border-[#7f1d1d] shadow-md z-10 transition-transform"
                  style={{
                    left: `${cursorPos}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>

              {/* Progress Badges */}
              <div className="flex items-center justify-center gap-2 text-xs font-mono">
                {[1, 2, 3].map((step) => (
                  <div 
                    key={step}
                    className={`px-2.5 py-0.5 flex items-center gap-1 border transition-all ${
                      successCount >= step 
                        ? 'bg-[#d8edd4] border-[#2b5828] text-[#1c4718] font-bold' 
                        : 'bg-white border-[#b0c4ae] text-[#7a9478]'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${successCount >= step ? 'text-[#2b5828]' : 'text-[#b0c4ae]'}`} />
                    <span>迴路對齊 {step}/3</span>
                  </div>
                ))}
              </div>

              {/* Feedback Message */}
              {qteFeedback && (
                <p className={`text-xs font-bold ${qteFeedback.type === 'success' ? 'text-[#1c4718]' : 'text-[#b91c1c]'}`}>
                  {qteFeedback.text}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentMode('menu');
                  }}
                  className="px-3 py-1.5 bg-[#e4ede2] hover:bg-[#d5e5d3] border border-[#7ca078] text-xs text-[#244222] font-bold cursor-pointer"
                >
                  ← 返回自救選單
                </button>

                <button
                  onClick={handleQteClick}
                  className="retro-web-btn flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Wind className="w-4 h-4" />
                  <span>【深層吐氣 • 專注心智】</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode: Item Use */}
          {currentMode === 'item_use' && (
            <div className="space-y-3">
              <div className="text-left bg-white p-2.5 border border-[#c4ab58]">
                <span className="text-xs text-[#664609] block font-bold">
                  🔍 選擇一件隨身物品作為現實錨點，透過物理刺激強行切斷思維幻象：
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto pr-1 space-y-2">
                {usableItems.length > 0 ? (
                  usableItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleUseItemForRescue(item.id)}
                      className="w-full text-left p-2.5 bg-white hover:bg-[#fffbe6] border border-[#c4ab58] hover:border-[#856117] transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#fef5d0] border border-[#c4ab58] text-[#856117]">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-[#1a2e18] group-hover:text-[#856117]">
                            {item.name}
                          </span>
                          <p className="text-[11px] text-[#556953] line-clamp-1">
                            {(!completedWeek1 && item.week1Description) ? item.week1Description : (item.description || item.detail)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-sans text-[#2b5828] shrink-0 ml-2 font-bold">
                        {completedWeek1 
                          ? (item.recoveryGrade === 'significant' ? '大幅穩定' : item.recoveryGrade === 'moderate' ? '小幅穩定' : '稍微穩定') 
                          : '穩定心神'}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-3 text-xs text-[#6e5858]">
                    背包內暫無可直接飲用或特殊的安神器具。
                  </div>
                )}

                {/* Physical Fallback Option */}
                <button
                  onClick={handlePhysicalPainRescue}
                  className="w-full text-left p-2.5 bg-white hover:bg-[#fdf3f0] border border-[#d99c89] hover:border-[#ba3818] transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-[#fceae6] border border-[#d99c89] text-[#ba3818]">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#85250c]">
                        【用力咬破舌尖】劇痛清醒法
                      </span>
                      <p className="text-[11px] text-[#63352b]">
                        不需任何道具。藉由強烈痛覺與口腔鐵鏽味驅散幻聽，強行清醒。
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-sans text-[#85250c] shrink-0 ml-2 font-bold">
                    強行清醒
                  </span>
                </button>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentMode('menu');
                  }}
                  className="w-full py-1.5 bg-[#e4ede2] hover:bg-[#d5e5d3] border border-[#7ca078] text-xs text-[#244222] font-bold cursor-pointer"
                >
                  ← 返回自救選單
                </button>
              </div>
            </div>
          )}

          {/* Mode: Retreat Confirm */}
          {currentMode === 'retreat_confirm' && (
            <div className="space-y-3 text-center">
              <div className="p-3 bg-white border border-[#d99c89] text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#85250c] font-bold text-xs sm:text-sm border-b border-[#eec2b5] pb-1">
                  <AlertTriangle className="w-4 h-4 text-[#ba3818]" />
                  <span>緊急撤退代價確認</span>
                </div>
                <p className="text-xs text-[#3a1d17] leading-relaxed">
                  你將在極度恐慌中不顧一切衝下樓梯逃向一樓大門。
                  <br />
                  • 位置強制轉移至：<strong className="text-[#85250c]">一樓大廳 / 事務所</strong>
                  <br />
                  • 調查進度：<strong className="text-[#85250c]">推進 1 天（日曆翻頁）</strong>
                  <br />
                  • 心智狀態：<strong className="text-[#1c4718]">脫離險境，平復急促喘息並穩定心神</strong>
                  <br />
                  • 精神耐受：<strong className="text-[#ba3818]">{remainingChances > 1 ? `再來${remainingChances - 1}次可能精神會受不了` : '心智承受力已瀕臨最後極限，無法再承受任何衝擊！'}</strong>
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentMode('menu');
                  }}
                  className="px-4 py-1.5 bg-[#e4ede2] hover:bg-[#d5e5d3] border border-[#7ca078] text-xs text-[#244222] font-bold cursor-pointer"
                >
                  再想想
                </button>

                <button
                  onClick={() => {
                    sound.playKnock();
                    onEmergencyRetreat();
                  }}
                  className="retro-web-btn flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Footprints className="w-4 h-4" />
                  <span>【確認狂奔撤退】</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
