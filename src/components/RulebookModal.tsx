import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  X,
  AlertTriangle,
  FileText,
  Bookmark,
  Lock,
  Image as ImageIcon,
  ZoomIn,
  Stamp
} from 'lucide-react';
import { RuleItem } from '../types';
import { RULES_DATA } from '../data/rulesData';
import { sound } from '../services/soundEngine';
import handwrittenRulesImg from '../assets/images/handwritten_rules_paper_1788704097666.jpg';

interface RulebookModalProps {
  obtainedRules: string[];
  completedWeek1?: boolean;
  onClose: () => void;
}

export const RulebookModal: React.FC<RulebookModalProps> = ({
  obtainedRules,
  completedWeek1 = false,
  onClose
}) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(
    obtainedRules.length > 0 ? obtainedRules[0] : ''
  );
  const [showHandwrittenPhotoModal, setShowHandwrittenPhotoModal] = useState<boolean>(false);

  useEffect(() => {
    if (obtainedRules.length > 0 && !obtainedRules.includes(selectedRuleId)) {
      setSelectedRuleId(obtainedRules[0]);
    }
  }, [obtainedRules, selectedRuleId]);

  const handleSelectRule = (id: string) => {
    if (obtainedRules.includes(id)) {
      sound.playPaper();
      setSelectedRuleId(id);
    }
  };

  const selectedRule = obtainedRules.includes(selectedRuleId) ? RULES_DATA[selectedRuleId] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6 select-none">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-[#18110b] border-2 border-[#5c3e23] rounded-2xl max-w-4xl w-full h-[88vh] max-h-[740px] flex flex-col shadow-2xl overflow-hidden text-[#e8dac1]"
      >
        {/* Header - Stamped Dossier Binder Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3d2714] px-4 sm:px-6 py-3 bg-[#21160e] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#2b1b11] border border-[#523720] text-[#d4a359]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-bold text-[#f5ebd7] tracking-wider font-serif">
                  {completedWeek1 ? '安祥路88號・大樓規約比對卷宗' : '安祥路88號・奇怪的證物'}
                </h3>
                <span className="text-[10px] font-typewriter px-2 py-0.5 rounded bg-[#382314] text-[#deb887] border border-[#664326]">
                  {completedWeek1 ? `已收錄 ${obtainedRules.length} 份` : `已收錄 ${obtainedRules.length} 件證物`}
                </span>
              </div>
              <p className="text-[11px] text-[#9c846a] font-typewriter mt-0.5">
                {completedWeek1 
                  ? 'DOC_ARCHIVE // CODEX COMPARISON DOSSIER [1998-2012]' 
                  : 'STRANGE_EVIDENCE // 在大樓現場拾獲的異常字條與文件'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-[#24170e] hover:bg-[#382416] border border-[#4d321d] text-[#9c846a] hover:text-[#f5ebd7] transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Sidebar Tabs + Typewritten Document Sheet */}
        <div className="flex flex-col md:grid md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Rules List Sidebar (Horizontal on Mobile, Vertical on Desktop) */}
          <div className="md:col-span-4 border-b-2 md:border-b-0 md:border-r-2 border-[#3d2714] p-3 overflow-x-auto md:overflow-y-auto bg-[#140e08] custom-scrollbar shrink-0 max-md:max-h-[140px] flex md:flex-col gap-2">
            <div className="text-[10px] font-typewriter text-[#a88d70] uppercase tracking-wider px-1 mb-1 hidden md:flex items-center justify-between">
              <span>{completedWeek1 ? '已歸檔規約索引' : '已收錄證物索引'}</span>
              <span>INDEX</span>
            </div>

            {obtainedRules.map((ruleId) => {
              const rule = RULES_DATA[ruleId];
              if (!rule) return null;
              const isSelected = selectedRuleId === ruleId;
              const displayTitle = !completedWeek1 && rule.week1Title ? rule.week1Title : rule.title;
              const displaySubtitle = !completedWeek1 && rule.week1Subtitle ? rule.week1Subtitle : rule.subtitle;

              return (
                <button
                  key={ruleId}
                  onClick={() => handleSelectRule(ruleId)}
                  className={`min-h-[42px] text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-center gap-0.5 shrink-0 max-md:min-w-[170px] max-md:max-w-[220px] cursor-pointer ${
                    isSelected
                      ? 'bg-[#332214] border-[#b07d3b] text-[#fae0a5] shadow-md ring-1 ring-amber-500/40'
                      : 'bg-[#1c130b] border-[#382516] text-[#b09b82] hover:bg-[#261a10] hover:text-[#e0cfb8]'
                  }`}
                >
                  <div className="font-bold font-serif flex items-center justify-between gap-1">
                    <span className="truncate">【{displayTitle}】</span>
                    {rule.isFake && (
                      <span className="text-[9px] font-typewriter px-1.5 py-0.2 rounded bg-red-950 text-rose-300 border border-red-700 shrink-0">
                        偽造
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-typewriter text-[#8c745a] truncate">
                    {displaySubtitle}
                  </div>
                </button>
              );
            })}

            {obtainedRules.length === 0 && (
              <div className="text-center py-6 px-3 bg-[#19110a] border border-dashed border-[#422d1b] rounded-lg my-2 w-full">
                <Lock className="w-5 h-5 text-[#6b4e33] mx-auto mb-1" />
                <p className="text-xs text-[#b89f84] font-serif font-bold">檔案袋內暫無條款</p>
                <p className="text-[10px] text-[#78614c] font-serif mt-0.5 leading-relaxed">
                  {completedWeek1 ? '請在大樓大廳、佈告欄與各房間中調查搜尋規則。' : '請在大樓大廳與各房間中調查搜尋線索。'}
                </p>
              </div>
            )}
          </div>

          {/* Rule Detail Paper View */}
          <div className="md:col-span-8 p-4 sm:p-6 overflow-y-auto bg-[#18110a] text-[#e8dac1] flex flex-col justify-between custom-scrollbar flex-1">
            {selectedRule ? (
              <div className="space-y-4">
                
                {/* Paper Title Header */}
                <div className="border-b-2 border-[#3d2714] pb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base sm:text-lg md:text-xl font-bold font-serif text-[#fae0a5] tracking-wide">
                        【{!completedWeek1 && selectedRule.week1Title ? selectedRule.week1Title : selectedRule.title}】
                      </h4>
                      {selectedRule.isFake && (
                        <span className="stamp-classified text-[10px]">
                          VOID / FAKE
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#a88f72] font-serif italic flex items-center gap-2">
                      <Bookmark className="w-3.5 h-3.5 text-[#c48d48]" />
                      <span>發佈來源：{!completedWeek1 && selectedRule.week1Source ? selectedRule.week1Source : selectedRule.source}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-typewriter text-[#8c7256] shrink-0 px-2.5 py-1 rounded bg-[#24170d] border border-[#422b19]">
                    {!completedWeek1 && selectedRule.week1Subtitle ? selectedRule.week1Subtitle : selectedRule.obtainedAt}
                  </span>
                </div>

                {/* Fake Warning Banner if applicable */}
                {selectedRule.isFake && (
                  <div className="p-3 bg-red-950/50 border border-red-700/80 rounded-xl text-xs text-rose-200 flex items-start gap-2.5 shadow-md font-serif">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-300 font-typewriter">【怪異認知偽造警報】：</span>
                      <p className="mt-0.5 leading-relaxed">{selectedRule.notes}</p>
                    </div>
                  </div>
                )}

                {/* Main Typewritten Rule Body */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#1f160e] border border-[#47301c] font-typewriter space-y-2 shadow-inner leading-relaxed text-xs sm:text-sm text-[#ded0b6]">
                  {(!completedWeek1 && selectedRule.week1Content ? selectedRule.week1Content : selectedRule.content).map((line, idx) => (
                    <p 
                      key={idx}
                      className={`${
                        line.startsWith('【') || line.endsWith('敬上') || line.startsWith('本規則經')
                          ? 'text-[#a89074] text-xs italic text-right'
                          : line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.') || line.startsWith('6.') || line.startsWith('7.') || line.startsWith('8.') || line.startsWith('9.') || line.startsWith('10.')
                            ? 'text-[#f5ebd7] font-bold pl-2 border-l-2 border-[#785227] py-0.5 my-1'
                            : 'text-[#c7b79d]'
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Detective Analysis Annotation Box */}
                <div className="p-3.5 bg-[#261a10] border border-[#6b4728] rounded-xl text-xs text-[#ded0b6] flex items-start gap-2.5 shadow-sm font-serif">
                  <FileText className="w-4 h-4 text-[#d4a359] shrink-0 mt-0.5" />
                  <div className="space-y-0.5 w-full">
                    <span className="font-bold text-[#fae0a5] font-typewriter">【偵探交互邏輯筆記】：</span>
                    <p className="text-[#bfae95] leading-relaxed">
                      {!completedWeek1 ? (
                        '紙條上提及的古怪注意事項，透露這棟大樓有著某種令人不安的隱情。張浩匆忙離開房間時，顯然留下了這張紙條作為重要警示。'
                      ) : (
                        <>
                          {selectedRule.id === 'rule_resident' && '住戶規則強調「沒有4樓，若在4樓請搭電梯回1樓」。這說明4樓確實會被意外觸發進入。'}
                          {selectedRule.id === 'rule_cleaner' && '清潔員規則與住戶規則直接衝突！清潔規則寫明「包含四樓共五層樓，404不接受打擾」，且建議「優先走樓梯」。'}
                          {selectedRule.id === 'rule_guard' && '警衛規則第10條要求「忽略監視系統」，但第6條稱「警衛室是安全的」。究竟誰在隱瞞真相？'}
                          {selectedRule.id === 'rule_cctv' && '監視系統宣稱「本系統不會出錯」，並允許在監視器中觀測四樓與404號房。'}
                          {selectedRule.id === 'rule_handwritten' && '這份規則點破了怪異的致命核心：「規則是要管理它，不是管理你」！'}
                          {selectedRule.id === 'rule_fake_evacuation' && '這是怪異偽造的規則，企圖引導調查員穿上紅衣、前往404送死。絕對不可信任！'}
                          {selectedRule.id === 'rule_investigator' && '深淵誕生的同化規則，記載著無數失敗調查員的悲慘結局。'}
                        </>
                      )}
                    </p>

                    {selectedRule.id === 'rule_handwritten' && (
                      <div className="pt-2 mt-2 border-t border-[#4d321d] flex items-center justify-between">
                        <span className="text-[11px] text-amber-300 font-serif flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          已解鎖前任受害者血淚手寫原件照片
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playPaper();
                            setShowHandwrittenPhotoModal(true);
                          }}
                          className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-600 text-amber-200 text-xs rounded font-serif flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          檢視手寫原件
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#8c745a] font-serif">
                <BookOpen className="w-12 h-12 text-[#47301c] mb-3" />
                <h4 className="text-base font-bold text-[#bfae95] mb-1">
                  {completedWeek1 ? '尚未收錄任何規則' : '尚未收錄任何奇怪的證物'}
                </h4>
                <p className="text-xs text-[#78614c] max-w-sm leading-relaxed">
                  {completedWeek1 ? '在大樓調查過程中，尋找張貼、掉落或暗藏的各方規章規則。' : '在大樓調查過程中，尋找現場留存的各項生活跡證與文件。'}
                </p>
              </div>
            )}

            {/* Footer - Unified Standard */}
            <div className="pt-3.5 border-t border-[#382516] text-[11px] text-[#78614c] font-serif flex items-center justify-between mt-3">
              <span className="font-typewriter text-[10px]">CASE ARCHIVE // CODEX COMPARISON MODULE</span>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-[#24170e] hover:bg-[#382416] border border-[#523720] text-[#c9b79b] hover:text-[#f5ebd7] text-xs font-serif transition-colors cursor-pointer"
              >
                關閉卷宗
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Full-screen High-Resolution Lightbox for Handwritten Rule Specimen */}
      <AnimatePresence>
        {showHandwrittenPhotoModal && (
          <div 
            onClick={() => setShowHandwrittenPhotoModal(false)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHandwrittenPhotoModal(false);
                }}
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[90vh] overflow-auto rounded-2xl border-2 border-amber-600/80 shadow-2xl bg-neutral-950 p-2 relative"
            >
              <img
                src={handwrittenRulesImg}
                alt="手寫的規則高解析原件"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
              />
              <div className="p-3 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between text-xs font-serif text-neutral-300">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Stamp className="w-4 h-4 text-amber-500" />
                  前人血淚手寫筆記原件（筆記紙撕頁 • 油墨塗改 • 紅筆眉批）
                </span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  RULE CODE 05 // AUTHENTIC HANDWRITTEN ARTIFACT
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
