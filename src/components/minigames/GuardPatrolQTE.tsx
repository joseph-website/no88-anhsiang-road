import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Eye,
  EyeOff,
  Skull,
  CheckCircle2,
  Brain,
  Activity
} from 'lucide-react';
import { sound } from '../../services/soundEngine';

export interface GuardPatrolQTEProps {
  floor: string;
  san: number;
  obtainedRules: string[];
  onSuccess: (recoveredSan: number) => void;
  onFailure: (damageSan: number, reason: string) => void;
  onClose?: () => void;
}

export type GuardPosture = 'breathing' | 'turning_soon' | 'gazing_at_player' | 'walking_away';

export const GuardPatrolQTE: React.FC<GuardPatrolQTEProps> = ({
  floor,
  san,
  obtainedRules,
  onSuccess,
  onFailure,
  onClose
}) => {
  // State Machine: 3 Stages of Encounter
  // Stage 1: Audio cue (Heavy leather shoes pacing closer, flashlight beam sweeps)
  // Stage 2: Guard turning round & calling names (Player must hold breath and maintain eye line avoidance)
  // Stage 3: Guard checking flashlight & marching away
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [posture, setPosture] = useState<GuardPosture>('breathing');
  const [isHoldingBreath, setIsHoldingBreath] = useState<boolean>(false);
  const [isLookingAway, setIsLookingAway] = useState<boolean>(false);
  const [breathLeft, setBreathLeft] = useState<number>(100);
  const [detectionMeter, setDetectionMeter] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [outcome, setOutcome] = useState<'pending' | 'survived' | 'caught'>('pending');
  const [failureReason, setFailureReason] = useState<string>('');
  
  // Visual Anomaly Overlay Flash
  const [ambientGlitch, setAmbientGlitch] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Audio ambiance when QTE starts
  useEffect(() => {
    sound.playTensionSting();
    const footstepInterval = setInterval(() => {
      sound.playKnock();
    }, 1200);

    return () => clearInterval(footstepInterval);
  }, []);

  // Timer progression and Stage controller
  useEffect(() => {
    if (outcome !== 'pending') return;

    const timer = setInterval(() => {
      setElapsedTime(prev => {
        const next = prev + 1;
        
        // Stage 1 -> 2 transition at 3s
        if (next === 3) {
          setStage(2);
          setPosture('turning_soon');
          sound.playAnomalyWarning(2);
        }

        // Turning gaze at 5s ~ 9s
        if (next === 5) {
          setPosture('gazing_at_player');
          sound.playGlitch();
          setAmbientGlitch(true);
          setTimeout(() => setAmbientGlitch(false), 600);
        }

        if (next === 10) {
          setPosture('walking_away');
          setStage(3);
          sound.playSingleHeartbeat();
        }

        // Survived all stages at 13s
        if (next >= 13) {
          clearInterval(timer);
          handleSurvivalSuccess();
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [outcome]);

  // Detection & Breath Depletion Loop (Runs every 100ms)
  useEffect(() => {
    if (outcome !== 'pending') return;

    const loop = setInterval(() => {
      // Breath management
      if (isHoldingBreath) {
        setBreathLeft(prev => {
          const next = prev - 3.5;
          if (next <= 0) {
            // Suffocation gasp!
            setIsHoldingBreath(false);
            sound.playGlitch();
            return 0;
          }
          return next;
        });
      } else {
        setBreathLeft(prev => Math.min(100, prev + 4));
      }

      // Detection calculation during Stage 2
      if (posture === 'gazing_at_player') {
        let riskScore = 0;
        if (!isLookingAway) {
          riskScore += 18; // Eye contact is extremely dangerous
        }
        if (!isHoldingBreath) {
          riskScore += 14; // Breathing audible in corridor
        }

        if (riskScore > 0) {
          setDetectionMeter(prev => {
            const next = prev + riskScore * 0.25;
            if (next >= 100) {
              handleCaughtByGuard(
                !isLookingAway 
                  ? '【視線直視禁忌】：你在白衣警衛轉頭時直視了他的空洞雙眼，被其鎖定了存在！' 
                  : '【沉重喘息暴露】：你在警衛駐足點名時劇烈喘息，腳步聲瞬間朝你的藏身處逼近！'
              );
              return 100;
            }
            return next;
          });
        } else {
          // Decreasing meter if perfectly complying
          setDetectionMeter(prev => Math.max(0, prev - 4));
        }
      } else if (posture === 'turning_soon') {
        if (!isLookingAway) {
          setDetectionMeter(prev => Math.min(60, prev + 2));
        }
      }
    }, 100);

    return () => clearInterval(loop);
  }, [posture, isHoldingBreath, isLookingAway, outcome]);

  const handleSurvivalSuccess = () => {
    setOutcome('survived');
    sound.playInspectSuccess();
    const bonus = 4;
    setTimeout(() => {
      onSuccess(bonus);
    }, 2200);
  };

  const handleCaughtByGuard = (reason: string) => {
    setOutcome('caught');
    setFailureReason(reason);
    sound.playGlitch();
    sound.playTensionSting();
    const penalty = 14;
    setTimeout(() => {
      onFailure(penalty, reason);
    }, 2500);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 ${ambientGlitch ? 'animate-pulse' : ''}`}>
      {/* Dynamic Scanline & Cold Blue/Green Corridor Flash */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(10,18,16,0)_50%,rgba(0,0,0,0.7)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="bg-neutral-950 border-2 border-emerald-900/80 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative text-neutral-200 overflow-hidden space-y-4"
      >
        {/* Top Header */}
        <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-400 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-emerald-400 tracking-wider flex items-center gap-1.5 font-bold uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                TACTICAL STEALTH // 走廊巡邏白衣警衛點名迴避
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-neutral-100 mt-0.5">
                【{floor} 走廊】沉重的皮鞋腳步聲逼近
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">
            倒數: {Math.max(0, 13 - elapsedTime)}s
          </span>
        </div>

        {/* Dynamic Scene State Box */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> 警戒狀態：
            </span>
            <span className={`font-bold uppercase ${
              posture === 'gazing_at_player' ? 'text-red-400 animate-pulse' :
              posture === 'turning_soon' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {posture === 'breathing' && '【聽見遠處巡邏點名】'}
              {posture === 'turning_soon' && '【警衛腳步停下・正在緩緩轉身】'}
              {posture === 'gazing_at_player' && '⚠️【警衛手電筒橫掃・視線凝視中】⚠️'}
              {posture === 'walking_away' && '【未察覺異常・翻閱日誌離去】'}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-serif text-neutral-300 leading-relaxed bg-black/60 p-3 rounded-lg border border-neutral-800/80">
            {posture === 'breathing' && '走廊盡頭傳來白衣警衛拖曳的步伐：「……401號房確認……402號房確認……」手電筒微弱的光束在潮濕的牆面跳躍。'}
            {posture === 'turning_soon' && '警衛突然在拐角處止步，手電筒光束定在離你不到三公尺的滅火箱旁，頭部正發出關節喀喀的僵硬扭轉聲！'}
            {posture === 'gazing_at_player' && '（他停在你前方，臉龐蒼白無血色，雙目空洞死寂，低聲念道）：「……非住戶人員……請立刻現身登記……」此時絕對不能與其對視，更不可發出喘息！'}
            {posture === 'walking_away' && '警衛低下頭在泛黃的值班簿上記下一筆，旋即轉身邁著沉重的步調朝樓梯間走去，危機逐漸解除……'}
          </p>

          {/* Detection Risk Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Skull className="w-3 h-3" /> 被辨識風險值 (Detection):
              </span>
              <span className={`font-bold ${detectionMeter > 70 ? 'text-red-400 animate-pulse' : 'text-neutral-300'}`}>
                {Math.round(detectionMeter)}%
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-950 rounded-full border border-neutral-800 overflow-hidden">
              <div 
                className={`h-full transition-all duration-200 ${
                  detectionMeter > 70 ? 'bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                  detectionMeter > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${detectionMeter}%` }}
              />
            </div>
          </div>

          {/* Breath Left Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <Brain className="w-3 h-3" /> 屏息肺活量存量 (Breath):
              </span>
              <span className={`font-bold ${breathLeft < 30 ? 'text-red-400 animate-pulse' : 'text-neutral-300'}`}>
                {Math.round(breathLeft)}%
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-950 rounded-full border border-neutral-800 overflow-hidden">
              <div 
                className={`h-full transition-all duration-200 ${
                  breathLeft < 30 ? 'bg-red-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${breathLeft}%` }}
              />
            </div>
          </div>
        </div>

        {/* Outcome Overlays */}
        {outcome === 'survived' && (
          <div className="bg-emerald-950/90 border border-emerald-600 p-3.5 rounded-xl text-center space-y-1">
            <div className="text-sm font-bold text-emerald-300 font-serif flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              【屏息避開・成功規避巡邏點名】
            </div>
            <p className="text-xs text-neutral-300 font-serif">
              你嚴格踐行了《住戶守則》中「忽視非正常警衛與不直視」的準則，心神逐漸平復。
            </p>
          </div>
        )}

        {outcome === 'caught' && (
          <div className="bg-red-950/90 border border-red-600 p-3.5 rounded-xl text-center space-y-1">
            <div className="text-sm font-bold text-red-300 font-serif flex items-center justify-center gap-1.5">
              <Skull className="w-4 h-4 text-red-400" />
              【遭到鎖定・精神劇烈震盪】
            </div>
            <p className="text-xs text-red-200 font-serif">
              {failureReason}（受到強烈恐懼衝擊）
            </p>
          </div>
        )}

        {/* Interactive Controls */}
        {outcome === 'pending' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Control 1: Look Away / Avoid Direct Gaze */}
            <button
              onClick={() => {
                sound.playClick();
                setIsLookingAway(prev => !prev);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                isLookingAway
                  ? 'bg-indigo-950/90 border-indigo-500 text-indigo-100 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold font-serif flex items-center gap-1.5">
                  {isLookingAway ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-neutral-400" />}
                  {isLookingAway ? '【保持低頭・絕不直視】' : '【低頭避開視線】'}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {isLookingAway ? '已緊盯地板裂縫，避開警衛面容' : '目前正抬頭望向走廊（容易被察覺）'}
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                isLookingAway ? 'bg-indigo-900 text-indigo-300' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {isLookingAway ? 'ACTIVE' : 'OFF'}
              </span>
            </button>

            {/* Control 2: Hold Breath */}
            <button
              disabled={breathLeft <= 0}
              onClick={() => {
                sound.playClick();
                setIsHoldingBreath(prev => !prev);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                isHoldingBreath
                  ? 'bg-cyan-950/90 border-cyan-500 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold font-serif flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  {isHoldingBreath ? '【緊閉呼吸中……】' : '【屏息壓低聲息】'}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {isHoldingBreath ? '極度安靜（消耗肺活量）' : '正常喘息（警衛凝視時會暴露）'}
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                isHoldingBreath ? 'bg-cyan-900 text-cyan-300' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {isHoldingBreath ? 'HOLDING' : 'OFF'}
              </span>
            </button>
          </div>
        )}

        {/* Footer Rules Reminder */}
        <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between font-mono">
          <span>《住戶守則》第3條：遇非白衣黑褲或異常警衛，切勿理會與直視</span>
          <span>按住操作 • 避免任何衝動之舉</span>
        </div>
      </motion.div>
    </div>
  );
};
