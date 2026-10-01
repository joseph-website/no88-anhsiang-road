import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Brain,
  Clock,
  Bookmark,
  X,
  Layers,
  FileCheck
} from 'lucide-react';
import { EndingId, TraitId, JournalEntry, FreeNote } from '../types';
import { ENDINGS_DATA, WEEK1_ENDINGS_DATA, INVENTORY_ITEMS, RULES_DATA } from '../data/rulesData';
import { INVESTIGATOR_TRAITS } from '../data/traitsData';
import { sound } from '../services/soundEngine';
import { EndingCertificateCard } from './EndingCertificateCard';
import { ElectronicCaseReportCard } from './ElectronicCaseReportCard';

interface CaseReportModalProps {
  playerName: string;
  trait: TraitId;
  san: number;
  endingId: EndingId;
  investigationDay: number;
  investigationDateText: string;
  inventory: string[];
  obtainedRules: string[];
  journalLogs: JournalEntry[];
  freeNotes?: FreeNote[];
  completedWeek1?: boolean;
  onClose: () => void;
}

export const CaseReportModal: React.FC<CaseReportModalProps> = ({
  playerName,
  trait,
  san,
  endingId,
  investigationDay,
  investigationDateText,
  inventory,
  obtainedRules,
  journalLogs,
  freeNotes = [],
  completedWeek1 = false,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'certificate' | 'summary' | 'timeline' | 'evidence' | 'psychology'>('certificate');

  const ending = (!completedWeek1 && WEEK1_ENDINGS_DATA[endingId])
    ? WEEK1_ENDINGS_DATA[endingId]
    : (ENDINGS_DATA[endingId] || ENDINGS_DATA.ending1);
  const traitInfo = INVESTIGATOR_TRAITS[trait] || INVESTIGATOR_TRAITS.rationalist;

  // Calculate San Grade
  const getSanGrade = (score: number) => {
    if (score >= 80) return { grade: 'S', label: '極度堅定 (Ultra Stable)', color: 'text-emerald-400', bg: 'bg-emerald-950 border-emerald-500' };
    if (score >= 60) return { grade: 'A', label: '良好冷靜 (Stable & Rational)', color: 'text-teal-400', bg: 'bg-teal-950 border-teal-500' };
    if (score >= 40) return { grade: 'B', label: '輕度緊繃 (Moderate Tension)', color: 'text-amber-400', bg: 'bg-amber-950 border-amber-500' };
    if (score >= 20) return { grade: 'C', label: '高度創傷 (High Stress Impact)', color: 'text-rose-400', bg: 'bg-rose-950 border-rose-500' };
    return { grade: 'D', label: '精神崩潰邊緣 (Critical Delirium)', color: 'text-red-500', bg: 'bg-red-950 border-red-500' };
  };

  const sanGrade = getSanGrade(san);

  // Dynamic Investigator Special Title
  const getInvestigatorEvaluation = () => {
    if (!completedWeek1) {
      if (endingId === 'ending1') {
        return {
          title: '【謹慎撤案的調查員 // Cautious Investigator - Contract Suspended】',
          evalComment: '主辦調查員在面對大樓極端壓迫與不配合的非理性住戶環境時，審慎評估風險後選擇終止委託並全額退款。雖未能尋獲失蹤者張浩，但合規完成避險退出程序。'
        };
      }
      return {
        title: '【遭遇急性恐慌的調查員 // Overwhelmed Field Investigator】',
        evalComment: '主辦調查員於安祥路88號梯間搜查時，因通風不良與劇烈精神壓力引發急性過度換氣與休克昏厥，由保全通報119緊急送醫，調查因不可抗力暫告中斷。'
      };
    }
    if (endingId === 'ending8') {
      return {
        title: '【傳奇真理洞悉大師 // Grandmaster of Truth & Logic】',
        evalComment: '主辦調查員集齊六大核心物證並構建完整物證鏈，以極致的理性思維撕碎了三十年的集體認知遮蔽，不僅成功解救友人，更讓歷年受困失蹤者全員奇蹟生還，創下調查局歷史最高破案典範。'
      };
    }
    if (endingId === 'ending5') {
      return {
        title: san >= 70 ? '【傳奇理性解構者 // Mythical Deconstruction Master】' : '【浴血真理追尋者 // Unwavering Truth Seeker】',
        evalComment: '主辦調查員在面對極具侵蝕性的規則怪異時，始終保持無懈可擊的邏輯批判力。不僅徹底破解了1998年違建歷史與集體認知遮蔽，更成功解救失蹤友人張浩，徹底終結404空間威脅。'
      };
    }
    if (endingId === 'ending6') {
      return {
        title: '【深層執念撫平者 // Empathetic Reconciler】',
        evalComment: '調查員展現了非凡的同理心與直覺洞察，跳脫針鋒相對的對立思維，以誠摯的溝通簽下《互諒共生條約》，安撫了三十年來流離失所者的悲痛執念，化身大樓永恆守護者。'
      };
    }
    if (endingId === 'ending7') {
      return {
        title: '【因果循環記錄者 // Time-Loop Observer】',
        evalComment: '調查員以物理手段強行破壞設備引發空間因果坍塌，時空回溯至接案原點。手腕烙印的404印記保留了上輪輪迴的記憶，賦予打破循環的第二次機會。'
      };
    }
    if (endingId === 'ending3') {
      return {
        title: '【果敢的救援倖存者 // Pragmatic Life Rescuer】',
        evalComment: '調查員在危急時刻做出了最務實的判斷，成功將委託人友人張浩帶離險境，雖未完全抹除大樓異常核心，但達成了救人的核心目標。'
      };
    }
    if (endingId === 'ending4' || ending.type === 'bad') {
      return {
        title: '【沉淪於規約的同化者 // Lost in the Protocol】',
        evalComment: '調查員在調查過程中未能抵禦404認知實體的偽造規則與精神污染，心智枯竭後穿上紅色制服，成為大樓規則生態的新代言人。'
      };
    }
    if (endingId === 'ending2') {
      return {
        title: '【明哲保身的倖存者 // Cautious Case Survivor】',
        evalComment: '調查員在面對超出常理的空間怪異時選擇了謹慎撤退，雖未能完全揭開404號房的終極真相，但成功保全了自身與調查紀錄。'
      };
    }
    return {
      title: '【深淵凝視者 // Gaze into the Abyss】',
      evalComment: '調查員在調查初期畏懼放棄委託離去，雖保全一時安寧，但名字已悄然被大樓列入住戶名冊之中。'
    };
  };

  const evalInfo = getInvestigatorEvaluation();

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="retro-forum-modal-window max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#1a2e18]"
      >
        {/* Top Header */}
        <div className="retro-forum-modal-header p-3 sm:p-3.5 border-b-2 border-[#1c3819] flex flex-wrap items-center justify-between gap-2.5 select-none">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📁</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#173a14] border border-[#a3e635] text-[#a3e635] font-bold">
                  [OFFICIAL CASE REPORT]
                </span>
                <span className="text-xs font-mono text-[#cfebd0]">
                  CASE-2012-AH88-FINAL
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide mt-0.5">
                【結案檔案】安祥路88號大樓事件・調查結案全貌報告書
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="text-[11px] font-mono font-bold text-[#fef08a] hover:text-white px-2 py-0.5 bg-[#1a3818] border border-[#a3e635]/60 hover:bg-[#2b5828] cursor-pointer"
              title="關閉報告"
            >
              [關閉 X]
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-3 py-2 border-b border-[#7ca078] bg-[#eaf2e8] flex items-center gap-1.5 overflow-x-auto text-xs font-mono shrink-0">
          <button
            onClick={() => {
              sound.playPaper();
              setActiveTab('certificate');
            }}
            className={`px-2.5 py-1 border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              activeTab === 'certificate'
                ? 'bg-[#1c3819] border-[#1c3819] text-white font-bold'
                : 'bg-white border-[#a8c9a5] text-[#2b5828] hover:bg-[#f4f8f3]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>A4 結案報告書</span>
          </button>

          <button
            onClick={() => {
              sound.playPaper();
              setActiveTab('summary');
            }}
            className={`px-2.5 py-1 border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              activeTab === 'summary'
                ? 'bg-[#1c3819] border-[#1c3819] text-white font-bold'
                : 'bg-white border-[#a8c9a5] text-[#2b5828] hover:bg-[#f4f8f3]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>電子鑑識公文</span>
          </button>

          <button
            onClick={() => {
              sound.playPaper();
              setActiveTab('timeline');
            }}
            className={`px-2.5 py-1 border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              activeTab === 'timeline'
                ? 'bg-[#1c3819] border-[#1c3819] text-white font-bold'
                : 'bg-white border-[#a8c9a5] text-[#2b5828] hover:bg-[#f4f8f3]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>行動時間線 ({journalLogs.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playPaper();
              setActiveTab('evidence');
            }}
            className={`px-2.5 py-1 border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              activeTab === 'evidence'
                ? 'bg-[#1c3819] border-[#1c3819] text-white font-bold'
                : 'bg-white border-[#a8c9a5] text-[#2b5828] hover:bg-[#f4f8f3]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>物證規約鏈 ({inventory.length + obtainedRules.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playPaper();
              setActiveTab('psychology');
            }}
            className={`px-2.5 py-1 border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              activeTab === 'psychology'
                ? 'bg-[#1c3819] border-[#1c3819] text-white font-bold'
                : 'bg-white border-[#a8c9a5] text-[#2b5828] hover:bg-[#f4f8f3]'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>心理與理智評估</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 custom-scrollbar bg-[#f4f8f3] text-[#1a2e18]">
          {/* TAB 0: CERTIFICATE CARD */}
          {activeTab === 'certificate' && (
            <EndingCertificateCard
              playerName={playerName}
              san={san}
              endingId={endingId}
              investigationDay={investigationDay}
              investigationDateText={investigationDateText}
              inventoryCount={inventory.length}
              obtainedRulesCount={obtainedRules.length}
              journalLogsCount={journalLogs.length}
              completedWeek1={completedWeek1}
            />
          )}
          {activeTab === 'summary' && (
            <ElectronicCaseReportCard
              endingId={endingId}
              playerName={playerName}
              san={san}
              investigationDay={investigationDay}
              investigationDateText={investigationDateText}
              inventoryCount={inventory.length}
              totalInventoryCount={6}
            />
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <div className="text-xs font-mono text-[#2b5828] flex items-center justify-between border-b border-[#a8c9a5] pb-1.5 font-bold">
                <span>【全流程行動與抉擇歷程時間軸】(共 {journalLogs.length} 條現場紀錄)</span>
                <span className="text-[#456942]">依時序編排</span>
              </div>

              <div className="space-y-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#a8c9a5]">
                {journalLogs.map((log, idx) => (
                  <div key={log.id || idx} className="relative pl-7 text-xs">
                    {/* Dot */}
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-[#2b5828] border-2 border-white shadow-sm" />
                    <div className="bg-white p-3 border border-[#7ca078] space-y-1 shadow-sm">
                      <div className="flex items-center justify-between gap-2 flex-wrap text-[#587854] font-mono text-[11px]">
                        <span className="text-[#1c4718] font-bold">[{log.timestamp}]</span>
                        {log.location && <span className="bg-[#eaf2e8] px-1.5 py-0.2 border border-[#a8c9a5] text-[#2b5828]">{log.location}</span>}
                      </div>
                      <h5 className="text-xs sm:text-sm font-bold text-[#1a2e18]">
                        {log.title}
                      </h5>
                      <p className="text-[#324a30] leading-relaxed">
                        {log.content}
                      </p>
                      {log.sanDelta !== undefined && log.sanDelta !== 0 && (
                        <div className={`text-[10px] font-mono font-bold pt-1 ${log.sanDelta > 0 ? 'text-[#1c4718]' : 'text-[#8b1515]'}`}>
                          {log.sanDelta > 0 ? '▲ 精神提振' : '▼ 心理衝擊'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EVIDENCE & RULES */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              {/* Evidence Section */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-[#1c4718] font-bold flex items-center justify-between border-b border-[#a8c9a5] pb-1">
                  <span>搜集之關鍵實體物證 ({inventory.length} 件)</span>
                  <span className="text-[#557852]">實物勘驗鏈</span>
                </div>
                {inventory.length === 0 ? (
                  <div className="text-xs text-[#557852] italic p-3 bg-white border border-[#a8c9a5]">
                    本輪調查未取得任何實體物證。
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {inventory.map(id => {
                      const item = INVENTORY_ITEMS[id];
                      return (
                        <div key={id} className="bg-white p-3 border border-[#7ca078] space-y-1 shadow-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#2b5828]" />
                            <h5 className="text-xs font-bold text-[#1c3819]">
                              {item?.name || id}
                            </h5>
                          </div>
                          <p className="text-[11px] text-[#426140] leading-relaxed line-clamp-3">
                            {item?.detail || item?.description || '已收納於調查公事包。'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Rules Section */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-[#8b1515] font-bold flex items-center justify-between border-b border-[#d99c89] pb-1">
                  <span>收錄與鑑別之大樓規約 ({obtainedRules.length} 份)</span>
                  <span className="text-[#557852]">公文邏輯鏈</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {obtainedRules.map(id => {
                    const rule = RULES_DATA[id];
                    return (
                      <div key={id} className="bg-white p-3 border border-[#d99c89] space-y-1 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-[#85250c]">
                            {rule?.title || id}
                          </h5>
                          {rule?.isFake && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#fee2e2] text-[#991b1b] border border-[#dc2626] font-bold">
                              偽造誘餌
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#556953] leading-relaxed">
                          {rule?.subtitle}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PSYCHOLOGY */}
          {activeTab === 'psychology' && (
            <div className="space-y-3.5">
              <div className="bg-white p-4 border border-[#7ca078] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#2b5828]" />
                    <h4 className="text-sm font-bold text-[#1c3819]">
                      【精神狀態與理智評估報告】
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 border text-xs font-mono font-bold bg-[#eaf2e8] border-[#7ca078] text-[#1c3819]">
                    狀態評估：{sanGrade.label}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono text-[#426140]">
                    <span>心理認知狀態：</span>
                    <span className="font-bold text-[#1c3819]">{sanGrade.label}</span>
                  </div>
                  <div className="w-full h-3 bg-[#e0ede0] border border-[#a8c9a5] overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        san >= 70 ? 'bg-[#2b5828]' : san >= 40 ? 'bg-[#ca8a04]' : 'bg-[#dc2626] animate-pulse'
                      }`}
                      style={{ width: `${san}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#f7faf6] border border-[#a8c9a5] text-xs text-[#2c4728] leading-relaxed space-y-1.5">
                  <div className="font-bold text-[#1c3819] font-mono">
                    ★ 心理防衛機制總評：
                  </div>
                  <p>
                    {san >= 75
                      ? '調查員展現出極為罕見的高超心理韌性，即使目睹了多次空間扭曲與認知干擾，依然能藉由理性思維與證物錨定自我，毫無精神崩潰跡象。'
                      : san >= 50
                        ? '調查員在探索過程中承受了顯著的心理重壓，幾度處於焦慮邊緣，但憑藉關鍵時刻的冷靜決策與休整成功遏止了深層瘋狂的蔓延。'
                        : '調查員大腦神經網絡受到規則怪談的強烈侵蝕，思維邏輯出現部分斷層與幻聽症狀，建議於案後進行深度的心理去同化治療。'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 sm:p-3 border-t border-[#7ca078] bg-[#eaf2e8] flex items-center justify-between text-xs font-mono text-[#385e35]">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#2b5828]" />
            <span>特搜檔案局審核完畢 // 密級：DECLASSIFIED</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="retro-web-btn px-3 py-1 text-xs font-bold"
          >
            關閉報告書
          </button>
        </div>
      </motion.div>
    </div>
  );
};
