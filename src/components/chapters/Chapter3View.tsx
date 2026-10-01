import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Brain,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { sound } from '../../services/soundEngine';
import { CCTVTerminal } from '../minigames/CCTVTerminal';
import { DeductionMatrix } from '../minigames/DeductionMatrix';
import { EndingId } from '../../types';

interface Chapter3ViewProps {
  playerName: string;
  onObtainRule: (ruleId: string) => void;
  onObtainItem: (itemId: string) => void;
  onModifySan: (delta: number) => void;
  onTriggerEnding: (endingId: EndingId) => void;
  onProceedToChapter4: () => void;
  isCctvRebooted: boolean;
  onSetCctvRebooted: () => void;
  hasCctvRule: boolean;
  hasHandwrittenRule: boolean;
  hasBlueprints: boolean;
}

export const Chapter3View: React.FC<Chapter3ViewProps> = ({
  playerName,
  onObtainRule,
  onObtainItem,
  onModifySan,
  onTriggerEnding,
  onProceedToChapter4,
  isCctvRebooted,
  onSetCctvRebooted,
  hasCctvRule,
  hasHandwrittenRule,
  hasBlueprints
}) => {
  const [showDeduction, setShowDeduction] = useState<boolean>(false);
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);
  const [exploredDrawer, setExploredDrawer] = useState<boolean>(false);

  const handleInspectGuardDesk = () => {
    sound.playPaper();
    setExploredDrawer(true);
    if (!hasCctvRule) {
      onObtainRule('rule_cctv');
    }
    if (!hasBlueprints) {
      onObtainItem('building_blueprints');
    }
    setActiveDialogue(
      '【翻找警衛桌抽屜】：警衛不知去向，值班日誌停留在昨晚。你在抽屜底層翻出了【監視系統操作指引】以及一份泛黃的【1998年建築違建藍圖與稽查公文】！公文記載：大樓建商當年曾私自加蓋4樓，為了逃避工務局拆除，私自將動線遮蔽！'
    );
  };

  const handleDeductionSuccess = (isRealHandwrittenRule: boolean) => {
    onSetCctvRebooted();
    if (isRealHandwrittenRule) {
      onObtainRule('rule_handwritten');
      setActiveDialogue(
        '【認知重置完成】：印表機吐出了逃脫者留下的【手寫便條紙】！「4樓與404一直都在……規則是要管理它，不是管理你……假裝不知道你知道。」現在，四樓的真實樣貌已經被你完全看穿！'
      );
    } else {
      onObtainRule('rule_fake_evacuation');
      setActiveDialogue(
        '【獲得避難指引】：你雖然強行重啟了系統，但心存懷疑，印表機吐出了一份字跡鮮紅的【大樓緊急避難指引】……'
      );
    }
  };

  const handleDeductionSanPenalty = (penalty: number) => {
    onModifySan(-penalty);
  };

  const handleOstrichRetreat = () => {
    sound.playGlitch();
    onTriggerEnding('ending2');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Chapter Header */}
        <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
          <div>
            <span className="text-amber-500 font-mono text-xs">CHAPTER 03 // ITS RULES</span>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-neutral-100 mt-0.5">
              第三章：它的規則
            </h2>
          </div>
          <span className="text-xs px-3 py-1 rounded bg-neutral-800 text-neutral-300 font-mono border border-neutral-700">
            核心：解析矛盾與重置認知
          </span>
        </div>

        {/* Narrative Intro */}
        <div className="space-y-4">
          <p className="text-xs md:text-sm text-neutral-300 font-serif leading-relaxed">
            當你再次回到一樓大廳時，警衛室的門虛掩著，裡面的警衛竟然<span className="text-amber-400 font-bold">憑空消失了</span>。
            桌上的監視螢幕正在劇烈閃爍，主機發出低沉的嗡嗡聲。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleInspectGuardDesk}
              className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 text-left transition-all flex items-start gap-3"
            >
              <FileText className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-neutral-100 mb-1">
                  搜索警衛辦公桌抽屜
                </div>
                <div className="text-[11px] text-neutral-500">
                  {hasCctvRule ? '已取得監視手冊與違建藍圖' : '翻查安控文件與機密歷史'}
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                sound.playCctvBeep();
                setShowDeduction(true);
              }}
              className="p-4 rounded-xl bg-neutral-950/80 hover:bg-indigo-950/50 border border-neutral-800 hover:border-indigo-500 text-left transition-all flex items-start gap-3"
            >
              <Brain className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-indigo-300 mb-1">
                  展開邏輯推理矩陣
                </div>
                <div className="text-[11px] text-neutral-500">
                  {isCctvRebooted ? '認知已校準・複查邏輯' : '對比規約衝突並校準監視系統'}
                </div>
              </div>
            </button>
          </div>

          {activeDialogue && (
            <div className="bg-neutral-950 border border-amber-900/60 p-4 rounded-xl text-xs md:text-sm text-neutral-200 font-serif leading-relaxed">
              {activeDialogue}
            </div>
          )}
        </div>

        {/* Interactive CCTV Console Component */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
            <span>警衛室監視系統主控制台 (CCTV TERMINAL)：</span>
            {isCctvRebooted && (
              <span className="text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                真實認知解析完成
              </span>
            )}
          </div>

          <CCTVTerminal
            onStartDeduction={() => setShowDeduction(true)}
            isRebooted={isCctvRebooted}
            playerName={playerName}
          />
        </div>

        {/* Branch Actions */}
        <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleOstrichRetreat}
            className="px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs font-semibold transition-all"
          >
            當鴕鳥：遵從警衛守則撤退大樓
          </button>

          <button
            onClick={() => {
              sound.playElevatorChime();
              onProceedToChapter4();
            }}
            disabled={!isCctvRebooted}
            className={`px-6 py-2.5 rounded-lg text-xs md:text-sm font-bold flex items-center gap-2 transition-all ${
              isCctvRebooted
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40'
                : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            突破認知障壁：直上四樓 404 號房
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deduction Matrix Modal */}
      {showDeduction && (
        <DeductionMatrix
          onSuccess={handleDeductionSuccess}
          onFailSanPenalty={handleDeductionSanPenalty}
          onClose={() => setShowDeduction(false)}
        />
      )}
    </div>
  );
};
