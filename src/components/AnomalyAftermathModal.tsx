import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Brain,
  Activity,
  Compass,
  ArrowRight,
  FileText
} from 'lucide-react';
import { sound } from '../services/soundEngine';
import { EndingId } from '../types';

export interface AnomalyAftermathData {
  title: string;
  anomalyName: string;
  threatLevel?: string;
  eventRecap: string;
  playerDecision: string;
  decisionOutcome: string;
  psychologicalImpact: string;
  isSuccess: boolean;
  environmentalStatus: string;
  ruleCitation?: string;
}

interface AnomalyAftermathModalProps {
  isOpen: boolean;
  data: AnomalyAftermathData | null;
  onClose: () => void;
  unlockedEndings?: EndingId[];
}

export const AnomalyAftermathModal: React.FC<AnomalyAftermathModalProps> = ({
  isOpen,
  data,
  onClose,
  unlockedEndings = []
}) => {
  if (!isOpen || !data) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl retro-forum-modal-window shadow-2xl overflow-hidden z-10 text-[#1a2e18] font-sans"
        >
          {/* Header Banner */}
          <div className="retro-forum-modal-header p-2.5 sm:p-3 flex items-center justify-between border-b-2 border-[#1c3819] select-none">
            <div className="flex items-center gap-2">
              <span className="text-base">{data.isSuccess ? '🛡️' : '⚠️'}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    [事件事後處置報告] {data.anomalyName}
                  </h3>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 border ${
                    data.isSuccess
                      ? 'bg-[#1a3d16] text-[#a3e635] border-[#a3e635]'
                      : 'bg-[#451212] text-[#fca5a5] border-[#f87171]'
                  }`}>
                    {data.isSuccess ? '處置平息' : '受挫擾動'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="text-[11px] font-mono font-bold text-[#fef08a] hover:text-white px-2 py-0.5 bg-[#1a3818] border border-[#a3e635]/60 hover:bg-[#2b5828] cursor-pointer"
            >
              [關閉 X]
            </button>
          </div>

          {/* Modal Content Sections */}
          <div className="p-3 sm:p-4 space-y-3 max-h-[72vh] overflow-y-auto font-sans text-xs bg-[#f4f8f3]">
            {/* Threat Level Bar */}
            <div className="px-3 py-1.5 bg-[#e4ede2] border border-[#7ca078] flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#1c3819] font-mono">
                檔案等級：{data.threatLevel || '【異常事件事後結算】'}
              </span>
              <span className="text-[#3c6139]">
                {data.isSuccess ? '【處置得宜・心智穩固】' : '【應對受挫・精神動搖】'}
              </span>
            </div>

            {/* Section 1: Event Recap */}
            <div className="bg-white p-3 border border-[#7ca078] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#2b5828]">
                <Compass className="w-3.5 h-3.5 text-[#2b5828]" />
                <span>【異常現象回顧】</span>
              </div>
              <p className="text-[#2c452b] leading-relaxed pl-5 text-xs">
                {data.eventRecap}
              </p>
            </div>

            {/* Section 2: Player's Choice & Rule Connection */}
            <div className="bg-white p-3 border border-[#7ca078] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#1e4e69]">
                <Brain className="w-3.5 h-3.5 text-[#1e4e69]" />
                <span>【應變處置與決策】</span>
              </div>
              <p className="text-[#1c3c4f] leading-relaxed pl-5 text-xs">
                {data.playerDecision}
              </p>
              {data.ruleCitation && (
                <div className="mt-1.5 ml-5 text-[11px] text-[#2c4e5b] bg-[#eef7fb] p-2 border border-[#a2cbdd] flex items-start gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#1e4e69] shrink-0 mt-0.5" />
                  <span>{data.ruleCitation}</span>
                </div>
              )}
            </div>

            {/* Section 3: Consequence & Psychological Impact */}
            <div className={`p-3 border space-y-1.5 ${
              data.isSuccess
                ? 'bg-[#eaf5e8] border-[#8cb887] text-[#1c4718]'
                : 'bg-[#fdf3f0] border-[#d99c89] text-[#782810]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                  <Activity className={`w-3.5 h-3.5 ${data.isSuccess ? 'text-[#2b7524]' : 'text-[#ba3818]'}`} />
                  <span>【抉擇後果與心理衝擊】</span>
                </div>
                <span className={`text-[11px] px-2 py-0.2 border font-bold ${
                  data.isSuccess
                    ? 'bg-[#d8edd4] border-[#7ca078] text-[#1a4417]'
                    : 'bg-[#fae2dc] border-[#cb816d] text-[#85250c]'
                }`}>
                  {data.psychologicalImpact}
                </span>
              </div>
              <p className="text-xs leading-relaxed pl-5">
                {data.decisionOutcome}
              </p>
            </div>

            {/* Section 4: Current Environmental Status */}
            <div className="bg-white p-2.5 border border-[#7ca078] flex items-start gap-2 text-[11px] text-[#3d593a]">
              <Sparkles className="w-3.5 h-3.5 text-[#2b5828] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="text-[#1c3819] font-bold font-mono mr-1">【當前現場態勢】：</span>
                {data.environmentalStatus}
              </p>
            </div>
          </div>

          {/* Footer Action Button */}
          <div className="p-2.5 bg-[#e4ede2] border-t border-[#7ca078] flex justify-end">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="retro-web-btn px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>整理思緒，重返調查現場</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
