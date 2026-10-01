import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mic,
  FileText,
  ArrowRight
} from 'lucide-react';
import { sound } from '../../services/soundEngine';
import { EndingId, TraitId } from '../../types';
import { BossDeconstruction } from '../minigames/BossDeconstruction';

interface Chapter4ViewProps {
  san: number;
  playerName: string;
  trait?: TraitId;
  onObtainItem: (itemId: string) => void;
  onObtainRule: (ruleId: string) => void;
  onTriggerEnding: (endingId: EndingId) => void;
  hasKeyLetter: boolean;
  hasBlueprints: boolean;
  hasHandwrittenRule: boolean;
  hasRecorder: boolean;
}

export const Chapter4View: React.FC<Chapter4ViewProps> = ({
  san,
  playerName,
  trait = 'rationalist',
  onObtainItem,
  onObtainRule,
  onTriggerEnding,
  hasKeyLetter,
  hasBlueprints,
  hasHandwrittenRule,
  hasRecorder
}) => {
  const [step, setStep] = useState<'corridor' | 'door_404' | 'boss_battle'>('corridor');
  const [activeDialogue, setActiveDialogue] = useState<string | null>(null);

  const handleInspectCorridor = (type: 'recorder' | 'fake_rule') => {
    sound.playPaper();
    if (type === 'recorder') {
      if (!hasRecorder) {
        onObtainItem('tape_recorder');
      }
      setActiveDialogue(
        '【拾獲錄音筆】：在404門口的舊報紙堆裡找到了張浩的微型錄音筆！按下播放鍵，裡面傳出張浩急促崩潰的喘息：「它們在打字……那些打字機每敲一下，大樓就多出一條規則……只要大家害怕，404就會一直吃人……」'
      );
    } else if (type === 'fake_rule') {
      onObtainRule('rule_fake_evacuation');
      setActiveDialogue(
        '【大樓緊急避難指引】：門上貼著整疊紅色字樣的告示，聲稱「已恢復四樓、專案人員穿紅衣」。但依據手寫便條紙，你一眼看出這是怪異為了誘捕人類編造的假象！'
      );
    }
  };

  const handleEnterRoom404 = () => {
    sound.playTensionSting();
    setStep('boss_battle');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Chapter Header */}
        <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
          <div>
            <span className="text-red-500 font-mono text-xs">CHAPTER 04 // FINAL DECONSTRUCTION</span>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-neutral-100 mt-0.5">
              第四章：解構 404
            </h2>
          </div>
          <span className="text-xs px-3 py-1 rounded bg-red-950 text-red-300 font-mono border border-red-800">
            終局決戰：理性與恐懼的對峙
          </span>
        </div>

        {/* Phase 1: 4F Corridor */}
        {step === 'corridor' && (
          <div className="space-y-6">
            <p className="text-xs md:text-sm text-neutral-300 font-serif leading-relaxed">
              踏出電梯，你站在了真實的四樓走廊上。這裡沒有大理石地面，只有斑駁的水泥灰牆與蛛網。走廊深處，掛著鏽蝕門牌『404』的鐵門正敞開一條縫隙，裡面傳出連綿不絕的機械打字機敲擊聲。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleInspectCorridor('recorder')}
                className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 text-left transition-all flex items-start gap-3"
              >
                <Mic className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-neutral-100 mb-1">
                    調查門邊散落的舊物
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {hasRecorder ? '已獲取張浩的錄音筆' : '翻查地上的錄音裝置'}
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleInspectCorridor('fake_rule')}
                className="p-4 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500 text-left transition-all flex items-start gap-3"
              >
                <FileText className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-neutral-100 mb-1">
                    撕下門上的紅色避難公告
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    檢閱怪異偽造的緊急避難指引
                  </div>
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
                張浩的微弱聲音正從404房內傳出
              </span>

              <button
                onClick={handleEnterRoom404}
                className="px-6 py-2.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-lg shadow-red-950/50"
              >
                推開 404 號房門，直面怪異本體！
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Boss Battle Modal */}
        {step === 'boss_battle' && (
          <BossDeconstruction
            san={san}
            playerName={playerName}
            trait={trait}
            hasKeyLetter={hasKeyLetter}
            hasBlueprints={hasBlueprints}
            hasHandwrittenRule={hasHandwrittenRule}
            onFinishBattle={(endingId) => {
              onTriggerEnding(endingId);
            }}
          />
        )}
      </div>
    </div>
  );
};
