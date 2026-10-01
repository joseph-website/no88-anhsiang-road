import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Layers,
  CheckCircle2,
  Lock,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { CaseHypothesis } from '../data/deductionData';
import { RULES_DATA, INVENTORY_ITEMS } from '../data/rulesData';
import { sound } from '../services/soundEngine';

interface HypothesisLinkVisualizerProps {
  hypothesis: CaseHypothesis;
  inventory: string[];
  obtainedRules: string[];
  completedWeek1?: boolean;
  onEstablishThoughtLink?: (clueA: string, clueB: string, deductionTitle: string, insightText: string) => void;
}

export const HypothesisLinkVisualizer: React.FC<HypothesisLinkVisualizerProps> = ({
  hypothesis,
  inventory,
  obtainedRules,
  completedWeek1 = false,
  onEstablishThoughtLink,
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [hasManuallySynthesized, setHasManuallySynthesized] = useState<boolean>(false);

  const requiredRules = hypothesis.requiredRuleIds || [];
  const requiredItems = hypothesis.requiredItemIds || [];

  const collectedRules = requiredRules.filter(rId => obtainedRules.includes(rId));
  const collectedItems = requiredItems.filter(iId => inventory.includes(iId));

  const totalRequired = requiredRules.length + requiredItems.length;
  const totalCollected = collectedRules.length + collectedItems.length;
  const isFullyUnlocked = totalRequired > 0 && totalCollected === totalRequired;

  const handleTriggerSynthesis = () => {
    sound.playElevatorChime();
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      setHasManuallySynthesized(true);
      sound.playElevatorChime();

      // Retrieve first two names for thought link notification
      const firstRuleName = requiredRules[0] && RULES_DATA[requiredRules[0]]?.title ? RULES_DATA[requiredRules[0]].title : (completedWeek1 ? '搜集之守則' : '現場文件');
      const secondClueName = requiredItems[0] && INVENTORY_ITEMS[requiredItems[0]]?.name 
        ? INVENTORY_ITEMS[requiredItems[0]].name 
        : (requiredRules[1] && RULES_DATA[requiredRules[1]]?.title ? RULES_DATA[requiredRules[1]].title : '現場實證');

      onEstablishThoughtLink?.(firstRuleName, secondClueName, hypothesis.title, hypothesis.keyDeduction);
    }, 1200);
  };

  return (
    <div className={`rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden transition-all ${
      completedWeek1
        ? 'bg-neutral-950/90 border border-neutral-800'
        : 'bg-[#f7faf5] border border-[#a8c2a1] text-[#222222]'
    }`}>
      {/* Background Subtle Tech Grid & Radiant Glow */}
      {completedWeek1 && (
        <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
      )}
      {completedWeek1 && isFullyUnlocked && (
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Top Status & Synthesis Trigger */}
      <div className={`flex flex-wrap items-center justify-between gap-2 pb-3 relative z-10 border-b ${
        completedWeek1 ? 'border-neutral-800' : 'border-[#c5d8c1]'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${
            isFullyUnlocked 
              ? (completedWeek1 ? 'bg-emerald-950 border-emerald-600/80 text-emerald-400' : 'bg-[#e4efe0] border-[#3e6634] text-[#2e6d24]') 
              : (completedWeek1 ? 'bg-neutral-900 border-neutral-700 text-neutral-400' : 'bg-[#ffffff] border-[#a8c2a1] text-[#555555]')
          }`}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 ${
              completedWeek1 ? 'text-neutral-400' : 'text-[#556652]'
            }`}>
              <span>{completedWeek1 ? 'MIND WEB // 物證與規則思維鏈路' : 'INVESTIGATION // 現場搜查線索鏈路'}</span>
              <span>•</span>
              <span className={isFullyUnlocked ? (completedWeek1 ? 'text-emerald-400 font-bold' : 'text-[#2e6d24] font-bold') : (completedWeek1 ? 'text-amber-400' : 'text-[#b8502a] font-bold')}>
                {totalCollected} / {totalRequired} 條線索已串聯
              </span>
            </div>
            <h4 className={`text-xs sm:text-sm font-bold font-serif ${
              completedWeek1 ? 'text-neutral-200' : 'text-[#1a3964]'
            }`}>
              {completedWeek1 ? '真相拼圖整合面板' : '現場搜查線索整合'}
            </h4>
          </div>
        </div>

        {/* Synthesis Status Badge or Action Button */}
        {isFullyUnlocked ? (
          <div className="flex items-center gap-2">
            {!hasManuallySynthesized ? (
              <button
                onClick={handleTriggerSynthesis}
                disabled={isSynthesizing}
                className={`px-3.5 py-1.5 rounded-xl font-serif font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                  completedWeek1
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 hover:opacity-90 text-white shadow-indigo-950'
                    : 'bg-[#3e6634] hover:bg-[#2d4d25] text-white shadow-[#3e6634]/30'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {isSynthesizing 
                    ? (completedWeek1 ? '拼湊真相中...' : '梳理思路中...') 
                    : (completedWeek1 ? '發動思維鏈接：拼合真相' : '整理現場調查思路')}
                </span>
              </button>
            ) : (
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm ${
                completedWeek1 
                  ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-600/70' 
                  : 'text-[#2e6d24] bg-[#e4efe0] border border-[#83ab79]'
              }`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${completedWeek1 ? 'text-emerald-400' : 'text-[#2e6d24]'}`} />
                <span>{completedWeek1 ? '真相已完全拼合 (TRUTH INTEGRATED)' : '搜查思路已釐清 (ORGANIZED)'}</span>
              </span>
            )}
          </div>
        ) : (
          <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
            completedWeek1 
              ? 'text-neutral-400 bg-neutral-900 border-neutral-800' 
              : 'text-[#556652] bg-[#ffffff] border-[#a8c2a1]'
          }`}>
            尚缺 {totalRequired - totalCollected} 處線索以接通鏈路
          </span>
        )}
      </div>

      {/* Synthesis Active Burst Overlay */}
      <AnimatePresence>
        {isSynthesizing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 bg-indigo-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-14 h-14 rounded-full border-2 border-indigo-400 border-t-amber-400 flex items-center justify-center shadow-xl shadow-indigo-500/50"
            >
              <Sparkles className="w-7 h-7 text-amber-300" />
            </motion.div>
            <div className="space-y-1">
              <h4 className="text-base font-bold font-serif text-amber-200">
                正在將破碎的規則與物證熔鑄為客觀真相……
              </h4>
              <p className="text-xs text-indigo-300 font-serif">
                擊碎 404 號房的集體認知催眠，還原客觀物理事實！
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-Column Mind Connection Web Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 relative z-10 items-center">
        {/* Left Column: Rule Fragments */}
        <div className="md:col-span-4 space-y-2">
          <div className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 ${
            completedWeek1 ? 'text-neutral-400' : 'text-[#556652]'
          }`}>
            <FileText className={`w-3 h-3 ${completedWeek1 ? 'text-amber-400' : 'text-[#2e6d24]'}`} />
            <span>{completedWeek1 ? '矛盾規則來源' : '現場相關文件'} ({collectedRules.length}/{requiredRules.length})</span>
          </div>

          <div className="space-y-2">
            {requiredRules.length === 0 ? (
              <div className={`p-3 rounded-xl border text-xs font-serif text-center ${
                completedWeek1 ? 'bg-neutral-900/30 border-neutral-800 text-neutral-500' : 'bg-[#ffffff] border-[#c5d8c1] text-[#777777]'
              }`}>
                無須額外文件即可推進
              </div>
            ) : requiredRules.map((ruleId) => {
              const ruleData = RULES_DATA[ruleId];
              const isFound = obtainedRules.includes(ruleId);
              const displayRuleTitle = ruleData 
                ? ((!completedWeek1 && ruleData.week1Title) ? ruleData.week1Title : ruleData.title) 
                : ruleId;
              const displayObtainedAt = ruleData
                ? ((!completedWeek1 && ruleData.week1Source) ? ruleData.week1Source : ruleData.obtainedAt)
                : '已在現場獲得文件';

              return (
                <div
                  key={ruleId}
                  className={`p-3 rounded-xl border text-xs font-serif transition-all relative overflow-hidden ${
                    completedWeek1
                      ? (isFound ? 'bg-amber-950/30 border-amber-500/70 text-amber-100 shadow-sm' : 'bg-neutral-900/50 border-neutral-800 text-neutral-500')
                      : (isFound ? 'bg-[#ffffff] border-[#83ab79] text-[#1a3964] shadow-2xs' : 'bg-[#ffffff]/60 border-[#c5d8c1] text-[#888888]')
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="font-bold flex items-center gap-1">
                      {isFound ? (
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${completedWeek1 ? 'text-amber-400' : 'text-[#2e6d24]'}`} />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      )}
                      <span>{displayRuleTitle}</span>
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                      isFound 
                        ? (completedWeek1 ? 'bg-amber-950 border-amber-600/70 text-amber-300' : 'bg-[#e4efe0] border-[#83ab79] text-[#2e6d24]') 
                        : (completedWeek1 ? 'bg-neutral-950 border-neutral-800 text-neutral-600' : 'bg-[#f4f8f2] border-[#c5d8c1] text-[#777777]')
                    }`}>
                      {isFound ? '已獲取' : '未搜獲'}
                    </span>
                  </div>
                  <p className={`text-[11px] line-clamp-2 leading-relaxed ${
                    completedWeek1 ? 'text-neutral-400' : 'text-[#555555]'
                  }`}>
                    {isFound ? displayObtainedAt : (completedWeek1 ? '需在現場勘查以獲取此項規則。' : '需在現場勘查以獲取此項文件。')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Central Truth Core / Hypothesis Node with Animated SVG Link Threads */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 relative">
          {/* Animated Connecting Visual Threads (Desktop / Tablet) */}
          <div className="w-full flex items-center justify-center py-2">
            <div className={`w-full max-w-[200px] p-4 rounded-2xl border text-center space-y-2 relative transition-all duration-700 ${
              completedWeek1
                ? (isFullyUnlocked 
                    ? 'bg-gradient-to-b from-indigo-950/90 to-purple-950/90 border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-950/80' 
                    : 'bg-neutral-900/80 border-neutral-800')
                : (isFullyUnlocked
                    ? 'bg-[#ffffff] border-[#3e6634] ring-2 ring-[#83ab79] shadow-md text-[#1a3964]'
                    : 'bg-[#ffffff] border-[#c5d8c1] text-[#555555]')
            }`}>
              {/* Rotating Ambient Ring if Unlocked */}
              {completedWeek1 && isFullyUnlocked && (
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 via-indigo-500/30 to-purple-500/20 blur-sm -z-10 animate-pulse" />
              )}

              <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center border shadow-inner ${
                completedWeek1
                  ? (isFullyUnlocked ? 'bg-indigo-600 border-indigo-300 text-white shadow-indigo-400/50 animate-bounce' : 'bg-neutral-950 border-neutral-800 text-neutral-600')
                  : (isFullyUnlocked ? 'bg-[#3e6634] border-[#83ab79] text-white shadow-xs' : 'bg-[#f4f8f2] border-[#c5d8c1] text-[#777777]')
              }`}>
                {isFullyUnlocked ? <Sparkles className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
              </div>

              <div className="space-y-0.5">
                <div className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                  completedWeek1 ? 'text-indigo-300' : 'text-[#3e6634]'
                }`}>
                  {completedWeek1 ? 'TRUTH CORE' : 'TARGET OBJECTIVE'}
                </div>
                <div className={`text-xs font-serif font-bold line-clamp-1 ${
                  completedWeek1 ? 'text-neutral-100' : 'text-[#1a3964]'
                }`}>
                  {hypothesis.title}
                </div>
              </div>

              <div className={`pt-1 border-t ${completedWeek1 ? 'border-neutral-800/80' : 'border-[#c5d8c1]'}`}>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full inline-block ${
                  isFullyUnlocked 
                    ? (completedWeek1 ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/70 font-bold' : 'bg-[#e4efe0] text-[#2e6d24] border border-[#83ab79] font-bold')
                    : (completedWeek1 ? 'bg-neutral-950 text-neutral-500' : 'bg-[#ffffff] text-[#777777] border border-[#c5d8c1]')
                }`}>
                  {isFullyUnlocked ? (completedWeek1 ? '★ 鏈路閉合' : '✓ 搜查完畢') : (completedWeek1 ? '等待物證串聯' : '等待線索齊全')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Evidence Items */}
        <div className="md:col-span-4 space-y-2">
          <div className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 ${
            completedWeek1 ? 'text-neutral-400' : 'text-[#556652]'
          }`}>
            <Layers className={`w-3 h-3 ${completedWeek1 ? 'text-emerald-400' : 'text-[#2e6d24]'}`} />
            <span>{completedWeek1 ? '現場客觀物證' : '現場關鍵證物'} ({collectedItems.length}/{requiredItems.length})</span>
          </div>

          <div className="space-y-2">
            {requiredItems.length === 0 ? (
              <div className={`p-3 rounded-xl border text-xs font-serif text-center ${
                completedWeek1 ? 'bg-neutral-900/30 border-neutral-800 text-neutral-500' : 'bg-[#ffffff] border-[#c5d8c1] text-[#777777]'
              }`}>
                無須額外實體證物
              </div>
            ) : requiredItems.map((itemId) => {
              const itemData = INVENTORY_ITEMS[itemId];
              const isFound = inventory.includes(itemId);

              return (
                <div
                  key={itemId}
                  className={`p-3 rounded-xl border text-xs font-serif transition-all relative overflow-hidden ${
                    completedWeek1
                      ? (isFound ? 'bg-emerald-950/30 border-emerald-500/70 text-emerald-100 shadow-sm' : 'bg-neutral-900/50 border-neutral-800 text-neutral-500')
                      : (isFound ? 'bg-[#ffffff] border-[#83ab79] text-[#1a3964] shadow-2xs' : 'bg-[#ffffff]/60 border-[#c5d8c1] text-[#888888]')
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span className="font-bold flex items-center gap-1">
                      {isFound ? (
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${completedWeek1 ? 'text-emerald-400' : 'text-[#2e6d24]'}`} />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      )}
                      <span>{itemData ? itemData.name : itemId}</span>
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                      isFound 
                        ? (completedWeek1 ? 'bg-emerald-950 border-emerald-600/70 text-emerald-300' : 'bg-[#e4efe0] border-[#83ab79] text-[#2e6d24]') 
                        : (completedWeek1 ? 'bg-neutral-950 border-neutral-800 text-neutral-600' : 'bg-[#f4f8f2] border-[#c5d8c1] text-[#777777]')
                    }`}>
                      {isFound ? '已持有' : '未尋獲'}
                    </span>
                  </div>
                  <p className={`text-[11px] line-clamp-2 leading-relaxed ${
                    completedWeek1 ? 'text-neutral-400' : 'text-[#555555]'
                  }`}>
                    {isFound ? (itemData?.description || '已收納於公事包證物袋') : '需在大樓房間或隱蔽角落搜尋此物證。'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insight Footer */}
      <div className={`p-3 rounded-xl border text-xs font-serif leading-relaxed flex items-start gap-2.5 ${
        completedWeek1
          ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300'
          : 'bg-[#ffffff] border-[#c5d8c1] text-[#333333]'
      }`}>
        <div className={`p-1 rounded shrink-0 mt-0.5 border ${
          completedWeek1 
            ? 'bg-indigo-950 border-indigo-700/60 text-indigo-400' 
            : 'bg-[#e4efe0] border-[#83ab79] text-[#2e6d24]'
        }`}>
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div>
          {completedWeek1 ? (
            <>
              <span className="font-bold text-amber-300">【拼湊真相原理】：</span>
              單憑「守則」只會陷入怪異的認知循環；唯有結合大樓實體藍圖、水電電表、磁帶錄音等「客觀物證」，才能在邏輯上徹底擊碎 404 的存在假象！
            </>
          ) : (
            <>
              <span className="font-bold text-[#2e6d24]">【現場調查心得】：</span>
              將租客遺留的隨身物證與大樓相關文件相互對照，能協助釐清失蹤者張浩的最後行蹤，避免被含糊的片面說辭誤導。
            </>
          )}
        </div>
      </div>
    </div>
  );
};
