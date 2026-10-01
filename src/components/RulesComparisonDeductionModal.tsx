import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  X,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Sparkles,
  Scale,
  Split,
  ArrowLeftRight,
  Check
} from 'lucide-react';
import { RuleItem } from '../types';
import { RULES_DATA } from '../data/rulesData';
import { sound } from '../services/soundEngine';

export interface RuleContradictionDefinition {
  id: string;
  title: string;
  ruleAId: string;
  ruleBId: string;
  clauseKeywordsA: string[];
  clauseKeywordsB: string[];
  explanation: string;
  deductionSummary: string;
  sanReward?: number;
}

export const RULE_CONTRADICTIONS_LIST: RuleContradictionDefinition[] = [
  {
    id: 'contra_floor_count',
    title: '大樓層數與四樓存在性悖論',
    ruleAId: 'rule_resident',
    ruleBId: 'rule_cleaner',
    clauseKeywordsA: ['沒有4樓', '共四層樓'],
    clauseKeywordsB: ['包含四樓', '共五層樓', '略過該房間'],
    explanation: '【住戶規則】宣稱大樓僅四層樓絕無四樓；然而【清潔人員規則】明確指出包含四樓在內共五層樓，且要求清潔作業略過404號房。',
    deductionSummary: '大樓在物理結構上實質存在五個樓層與四樓，住戶規則刻意對常住居民抹去四樓認知。',
    sanReward: 4
  },
  {
    id: 'contra_elevator_vs_stairs',
    title: '緊急逃生與動線指引衝突',
    ruleAId: 'rule_resident',
    ruleBId: 'rule_cleaner',
    clauseKeywordsA: ['如發生任何異常', '使用電梯移動'],
    clauseKeywordsB: ['非必要情況下', '優先使用樓梯移動', '停止使用電梯'],
    explanation: '【住戶規則】指示異常時請使用電梯；【清潔規則】卻警告遇到異常按鈕停止使用電梯，並優先使用樓梯。',
    deductionSummary: '電梯是怪異操控空間位移的主要媒介，盲目遵從住戶規則搭乘電梯將使人深陷異常。',
    sanReward: 4
  },
  {
    id: 'contra_cctv_blindness',
    title: '警衛盲從條款與安控主機客觀紀錄悖論',
    ruleAId: 'rule_guard',
    ruleBId: 'rule_cctv',
    clauseKeywordsA: ['忽略監視系統操作手冊', '沒有4樓'],
    clauseKeywordsB: ['所有樓層皆應顯示', '包含四樓', '本系統不會出錯'],
    explanation: '【警衛規則】第10條明文要求「忽略監視系統操作手冊」；而【監視系統指引】強調「所有樓層皆應顯示於監視器中包含四樓，本系統不會出錯」。',
    deductionSummary: '物業高層制定了自我蒙蔽協議強制警衛不看主機，而客觀運行的監視器忠實捕捉了四樓通道。',
    sanReward: 5
  },
  {
    id: 'contra_red_uniform_trap',
    title: '紅色制服專案人員誘餌與血淚求生筆記',
    ruleAId: 'rule_fake_evacuation',
    ruleBId: 'rule_handwritten',
    clauseKeywordsA: ['紅色制服', '專案人員', '404號房暫定為專案辦公室'],
    clauseKeywordsB: ['規則是要管理「它」', '快逃', '假裝不知道你知道'],
    explanation: '【大樓緊急避難指引】聲稱穿著紅色制服的專案人員在404號房辦公；而【手寫的規則】揭露規則是在管理怪異「它」，並警告調查員快逃。',
    deductionSummary: '紅色制服專案指引為404怪異實體化的捕食誘餌，企圖以官方口吻誘騙調查員進入房間成為規則養分。',
    sanReward: 5
  },
  {
    id: 'contra_guard_vs_cleaner_silence',
    title: '基層員工互不拆穿的集體緘默協議',
    ruleAId: 'rule_cleaner',
    ruleBId: 'rule_guard',
    clauseKeywordsA: ['不要與他爭辯', '包含四樓在內共五層樓'],
    clauseKeywordsB: ['共四層樓', '沒有4樓'],
    explanation: '【清潔規則】記載「若警衛堅持四樓不存在，請不要與他爭辯」；而【警衛規則】堅稱「沒有4樓」。',
    deductionSummary: '各單位基層明知規則互相牴觸，但為了自保簽訂了「互不揭穿」的盲從協議，放任認知扭曲擴大。',
    sanReward: 4
  }
];

interface RulesComparisonDeductionModalProps {
  obtainedRules: string[];
  completedWeek1?: boolean;
  foundContradictions?: string[];
  onAddContradiction?: (title: string, sanReward?: number) => void;
  onModifySan?: (delta: number) => void;
  onObtainItem?: (itemId: string) => void;
  onAddJournalEntry?: (entry: {
    category: 'system' | 'action' | 'dialogue';
    title: string;
    content: string;
    location?: string;
    sanDelta?: number;
    highlightBadge?: string;
  }) => void;
  onClose: () => void;
}

export const RulesComparisonDeductionModal: React.FC<RulesComparisonDeductionModalProps> = ({
  obtainedRules,
  completedWeek1 = false,
  foundContradictions = [],
  onAddContradiction,
  onModifySan,
  onObtainItem,
  onAddJournalEntry,
  onClose
}) => {
  const isFirstWeek = !completedWeek1;

  // Available rules
  const availableRules = useMemo(() => {
    const list = obtainedRules.map(id => RULES_DATA[id]).filter(Boolean);
    return list;
  }, [obtainedRules]);

  // Mode: 'comparison' (雙欄對照推理盤) vs 'browse' (單本詳細查閱)
  const [activeTab, setActiveTab] = useState<'comparison' | 'browse'>(
    isFirstWeek || availableRules.length <= 1 ? 'browse' : 'comparison'
  );

  // Selected Rule IDs for Left and Right Panels (Empty by default if no rules obtained)
  const [leftRuleId, setLeftRuleId] = useState<string>(
    availableRules[0]?.id || ''
  );
  const [rightRuleId, setRightRuleId] = useState<string>(
    availableRules.length > 1 ? availableRules[1].id : (availableRules[0]?.id || '')
  );

  // Selected single rule for browse mode (Empty by default if no rules obtained)
  const [singleRuleId, setSingleRuleId] = useState<string>(
    availableRules[0]?.id || ''
  );

  // Synchronize selected rule IDs whenever availableRules changes
  useEffect(() => {
    if (availableRules.length > 0) {
      if (!leftRuleId || !availableRules.some(r => r.id === leftRuleId)) {
        setLeftRuleId(availableRules[0].id);
      }
      if (!rightRuleId || !availableRules.some(r => r.id === rightRuleId)) {
        setRightRuleId(availableRules.length > 1 ? availableRules[1].id : availableRules[0].id);
      }
      if (!singleRuleId || !availableRules.some(r => r.id === singleRuleId)) {
        setSingleRuleId(availableRules[0].id);
      }
    } else {
      setLeftRuleId('');
      setRightRuleId('');
      setSingleRuleId('');
    }
  }, [availableRules, leftRuleId, rightRuleId, singleRuleId]);

  // Selected clause indices in comparison panels
  const [selectedLeftClauseIdx, setSelectedLeftClauseIdx] = useState<number | null>(null);
  const [selectedRightClauseIdx, setSelectedRightClauseIdx] = useState<number | null>(null);

  // Local recorded found contradictions to ensure instant UI responsiveness
  const [localFoundContradictions, setLocalFoundContradictions] = useState<string[]>(foundContradictions);

  // Active detected match
  const activeMatchedContradiction = useMemo(() => {
    if (selectedLeftClauseIdx === null || selectedRightClauseIdx === null) {
      return null;
    }

    const ruleA = RULES_DATA[leftRuleId];
    const ruleB = RULES_DATA[rightRuleId];
    if (!ruleA || !ruleB || ruleA.id === ruleB.id) return null;

    const clauseTextA = ruleA.content[selectedLeftClauseIdx] || '';
    const clauseTextB = ruleB.content[selectedRightClauseIdx] || '';

    // Check predefined list
    return RULE_CONTRADICTIONS_LIST.find(def => {
      const matchDirect = 
        def.ruleAId === ruleA.id && 
        def.ruleBId === ruleB.id &&
        def.clauseKeywordsA.some(kw => clauseTextA.includes(kw)) &&
        def.clauseKeywordsB.some(kw => clauseTextB.includes(kw));

      const matchReverse = 
        def.ruleAId === ruleB.id && 
        def.ruleBId === ruleA.id &&
        def.clauseKeywordsA.some(kw => clauseTextB.includes(kw)) &&
        def.clauseKeywordsB.some(kw => clauseTextA.includes(kw));

      return matchDirect || matchReverse;
    });
  }, [leftRuleId, rightRuleId, selectedLeftClauseIdx, selectedRightClauseIdx]);

  // Handle Clause Selection
  const handleSelectClause = (side: 'left' | 'right', index: number) => {
    sound.playPaper();
    if (side === 'left') {
      setSelectedLeftClauseIdx(prev => (prev === index ? null : index));
    } else {
      setSelectedRightClauseIdx(prev => (prev === index ? null : index));
    }
  };

  // Confirm / Record Contradiction
  const handleConfirmContradiction = () => {
    if (!activeMatchedContradiction) return;

    sound.playContradictionBreakthrough();
    const title = activeMatchedContradiction.title;
    const sanReward = activeMatchedContradiction.sanReward || 4;

    if (!localFoundContradictions.includes(title)) {
      const updated = [...localFoundContradictions, title];
      setLocalFoundContradictions(updated);
      onAddContradiction?.(title, sanReward);
      onModifySan?.(sanReward);
      onObtainItem?.('contradiction_deduction_note');

      onAddJournalEntry?.({
        category: 'action',
        title: `【規則推理盤】成功破解矛盾：${title}`,
        content: `${activeMatchedContradiction.explanation}\n★ 推論共識：${activeMatchedContradiction.deductionSummary}`,
        sanDelta: sanReward,
        highlightBadge: 'LOGIC_SOLVED'
      });
    }
  };

  const leftRule = RULES_DATA[leftRuleId];
  const rightRule = RULES_DATA[rightRuleId];
  const singleRule = RULES_DATA[singleRuleId];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-1.5 sm:p-3 md:p-5 lg:p-6 select-none">
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="retro-forum-modal-window rounded-none w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl h-[95dvh] sm:h-[90vh] lg:h-[88vh] max-h-[95dvh] lg:max-h-[860px] xl:max-h-[920px] flex flex-col overflow-hidden text-[#333333] relative font-sans"
      >
        {/* Top Header (2000s Forum Portal Style) */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 retro-forum-modal-header shrink-0 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1 sm:p-1.5 rounded-xs bg-[#ffffff]/20 border border-[#ffffff]/40 text-[#ffffff] shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#ffffff] tracking-wide truncate">
                  {isFirstWeek 
                    ? '📜 安祥路88號・《奇怪的證物》查閱' 
                    : '📜 規則彙編與邏輯對照盤 (Rules & Deduction Modal)'}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-xs bg-[#ffffff]/20 text-[#f0f9ee] border border-[#ffffff]/40 shrink-0">
                  {isFirstWeek ? '奇怪的證物' : `已收錄 ${availableRules.length} 份規則`}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#d8ecd2] mt-0.5 truncate hidden xs:block">
                {isFirstWeek
                  ? 'STRANGE EVIDENCE // 在安祥路88號大樓現場拾獲的字條與異常文本'
                  : 'PARADOX INFERENCE MATRIX // 左右對照條文以找出隱藏於大樓規則中的矛盾與謊言'}
              </p>
            </div>
          </div>

          {/* Mode Switcher & Close Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isFirstWeek && availableRules.length > 1 && (
              <div className="flex items-center bg-[#ffffff]/20 border border-[#ffffff]/30 rounded-xs p-0.5 text-xs">
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('comparison');
                  }}
                  className={`min-h-[28px] sm:min-h-[30px] px-2.5 sm:px-3 py-0.5 rounded-xs transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer font-bold ${
                    activeTab === 'comparison'
                      ? 'bg-[#ffffff] text-[#2b5420] shadow-xs'
                      : 'text-[#eef8eb] hover:bg-[#ffffff]/15'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">雙欄對照推理盤</span>
                  <span className="sm:hidden">雙欄對照</span>
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('browse');
                  }}
                  className={`min-h-[28px] sm:min-h-[30px] px-2.5 sm:px-3 py-0.5 rounded-xs transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer font-bold ${
                    activeTab === 'browse'
                      ? 'bg-[#ffffff] text-[#2b5420] shadow-xs'
                      : 'text-[#eef8eb] hover:bg-[#ffffff]/15'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">單本詳細查閱</span>
                  <span className="sm:hidden">單本查閱</span>
                </button>
              </div>
            )}

            <button 
              onClick={onClose}
              className="text-[#ffffff] hover:bg-[#ffffff]/20 transition-colors p-1 sm:p-1.5 rounded-xs border border-[#ffffff]/40 min-h-[30px] min-w-[30px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center shrink-0 ml-1 cursor-pointer"
              title="關閉視窗 (ESC)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: If no rules have been obtained, show empty state without leaking spoilers */}
        {availableRules.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f7faf5]">
            <div className="w-16 h-16 rounded-xs bg-[#ffffff] border-2 border-[#a8c2a1] flex items-center justify-center text-[#4a723e] mb-4 shadow-xs">
              <BookOpen className="w-8 h-8 opacity-70" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-[#23451b] mb-2">
              {isFirstWeek ? '尚未取得奇怪的證物' : '尚未取得大樓規則'}
            </h4>
            <p className="max-w-md text-xs sm:text-sm text-[#556652] leading-relaxed mb-5">
              {isFirstWeek ? (
                <>
                  現場勘查尚未獲取任何可疑字條或特殊文件。
                  <br />
                  請先在大樓現場（如五樓 504 號房等處）搜集檔案線索。
                </>
              ) : (
                <>
                  現場搜查尚未獲取任何大樓規則或工作指引。
                  <br />
                  請先在大樓現場搜集檔案線索。
                </>
              )}
            </p>
            <button
              onClick={onClose}
              className="retro-web-btn px-4 py-1.5 text-xs font-bold text-[#1a3964] cursor-pointer"
            >
              [返回現場調查]
            </button>
          </div>
        ) : !isFirstWeek && activeTab === 'comparison' ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#eef3ec]">
            
            {/* Split 50% / 50% Rule Panels */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 overflow-hidden min-h-0">
              
              {/* Left Panel */}
              <div className="flex flex-col bg-[#ffffff] border border-[#a8c2a1] rounded-xs p-3 overflow-hidden shadow-2xs">
                <div className="mb-2.5 space-y-1.5 shrink-0 border-b border-[#cde0c7] pb-2">
                  <div className="flex items-center justify-between text-xs text-[#4a6b42]">
                    <span className="flex items-center gap-1 font-bold text-[#2b5420]">
                      <Scale className="w-3.5 h-3.5" /> 選擇對照規約（左欄）：
                    </span>
                    <span className="text-[10px] font-mono text-[#778872]">PANEL_LEFT</span>
                  </div>
                  <select
                    value={leftRuleId}
                    onChange={(e) => {
                      sound.playPaper();
                      setLeftRuleId(e.target.value);
                      setSelectedLeftClauseIdx(null);
                    }}
                    className="w-full bg-[#f7faf5] text-[#223320] border border-[#9bb793] rounded-xs p-1.5 text-xs font-sans outline-none focus:border-[#4a723e] cursor-pointer"
                  >
                    {availableRules.map(r => (
                      <option key={`left_${r.id}`} value={r.id}>
                        【{r.title}】— {r.obtainedAt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Left Clauses List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {leftRule ? (
                    leftRule.content.map((clause, idx) => {
                      const isSelected = selectedLeftClauseIdx === idx;
                      const isHeading = clause.startsWith('本規則') || clause.startsWith('※') || clause.endsWith('敬上');

                      return (
                        <div
                          key={`left_clause_${idx}`}
                          onClick={() => !isHeading && handleSelectClause('left', idx)}
                          className={`p-2.5 rounded-xs border transition-all text-xs leading-relaxed select-none ${
                            isHeading
                              ? 'bg-[#f0f5ee] border-[#d0dfcc] text-[#556b50] italic text-right'
                              : isSelected
                                ? activeMatchedContradiction
                                  ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-xs border-l-4 border-l-rose-600 scale-[1.01]'
                                  : 'bg-[#e2edd9] border-[#4a723e] text-[#1c3a14] shadow-xs border-l-4 border-l-[#4a723e]'
                                : 'bg-[#ffffff] border-[#c5d8bf] text-[#2f3d2b] hover:bg-[#f2f7ef] hover:border-[#8bb082] cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!isHeading && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs shrink-0 ${
                                isSelected ? 'bg-[#4a723e] text-[#ffffff]' : 'bg-[#eef4ec] text-[#4d6645] border border-[#c3d7bd]'
                              }`}>
                                #{idx + 1}
                              </span>
                            )}
                            <p className="flex-1">{clause}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-xs text-[#6e8568]">尚未收錄左側規約</div>
                  )}
                </div>
              </div>

              {/* Right Panel */}
              <div className="flex flex-col bg-[#ffffff] border border-[#a8c2a1] rounded-xs p-3 overflow-hidden shadow-2xs">
                <div className="mb-2.5 space-y-1.5 shrink-0 border-b border-[#cde0c7] pb-2">
                  <div className="flex items-center justify-between text-xs text-[#4a6b42]">
                    <span className="flex items-center gap-1 font-bold text-[#2b5420]">
                      <Scale className="w-3.5 h-3.5" /> 選擇對照規約（右欄）：
                    </span>
                    <span className="text-[10px] font-mono text-[#778872]">PANEL_RIGHT</span>
                  </div>
                  <select
                    value={rightRuleId}
                    onChange={(e) => {
                      sound.playPaper();
                      setRightRuleId(e.target.value);
                      setSelectedRightClauseIdx(null);
                    }}
                    className="w-full bg-[#f7faf5] text-[#223320] border border-[#9bb793] rounded-xs p-1.5 text-xs font-sans outline-none focus:border-[#4a723e] cursor-pointer"
                  >
                    {availableRules.map(r => (
                      <option key={`right_${r.id}`} value={r.id}>
                        【{r.title}】— {r.obtainedAt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Right Clauses List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {rightRule ? (
                    rightRule.content.map((clause, idx) => {
                      const isSelected = selectedRightClauseIdx === idx;
                      const isHeading = clause.startsWith('本規則') || clause.startsWith('※') || clause.endsWith('敬上');

                      return (
                        <div
                          key={`right_clause_${idx}`}
                          onClick={() => !isHeading && handleSelectClause('right', idx)}
                          className={`p-2.5 rounded-xs border transition-all text-xs leading-relaxed select-none ${
                            isHeading
                              ? 'bg-[#f0f5ee] border-[#d0dfcc] text-[#556b50] italic text-right'
                              : isSelected
                                ? activeMatchedContradiction
                                  ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-xs border-l-4 border-l-rose-600 scale-[1.01]'
                                  : 'bg-[#e2edd9] border-[#4a723e] text-[#1c3a14] shadow-xs border-l-4 border-l-[#4a723e]'
                                : 'bg-[#ffffff] border-[#c5d8bf] text-[#2f3d2b] hover:bg-[#f2f7ef] hover:border-[#8bb082] cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!isHeading && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs shrink-0 ${
                                isSelected ? 'bg-[#4a723e] text-[#ffffff]' : 'bg-[#eef4ec] text-[#4d6645] border border-[#c3d7bd]'
                              }`}>
                                #{idx + 1}
                              </span>
                            )}
                            <p className="flex-1">{clause}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-xs text-[#6e8568]">尚未收錄右側規約</div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Contradiction Inspection Status & Deduction Verdict Bar */}
            <div className="border-t border-[#a8c2a1] p-3 bg-[#ffffff] shrink-0 shadow-xs">
              {activeMatchedContradiction ? (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xs bg-rose-50 border border-rose-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-xs bg-rose-600 text-[#ffffff] text-[11px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        【⚠️ 發現規則衝突與認知謊言】
                      </span>
                      <span className="text-sm font-bold text-rose-900">
                        {activeMatchedContradiction.title}
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      {activeMatchedContradiction.explanation}
                    </p>
                    <p className="text-[11px] text-[#4a6b42] font-mono">
                      ★ 偵探推論：{activeMatchedContradiction.deductionSummary}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
                    {localFoundContradictions.includes(activeMatchedContradiction.title) ? (
                      <span className="px-3 py-1.5 rounded-xs bg-[#eef7ec] border border-[#7ba770] text-[#275a1e] text-xs font-bold flex items-center gap-1.5 shadow-2xs w-full sm:w-auto justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        已記錄至推理盤
                      </span>
                    ) : (
                      <button
                        onClick={handleConfirmContradiction}
                        className="retro-web-btn px-4 py-2 text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>[指證矛盾並記錄（獲得心理支撐）]</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#556b50] gap-2 px-2 py-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-xs bg-[#f0f5ee] border border-[#c5d8bf] text-[#2e5e22]">
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </span>
                    <span>
                      {selectedLeftClauseIdx !== null && selectedRightClauseIdx !== null
                        ? '條文比對完成：此兩條文暫未構成直接邏輯衝突，可嘗試比對其他條款。'
                        : selectedLeftClauseIdx !== null || selectedRightClauseIdx !== null
                          ? '已選取單側條文，請在另一欄選取待比對的條款進行交叉指證。'
                          : '比對左右兩側條文之邏輯抵觸...'}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#2e5e22] font-bold shrink-0">
                    已破解矛盾：<b className="text-[#1a3964]">{localFoundContradictions.length}</b> / {RULE_CONTRADICTIONS_LIST.length} 處
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Single Browse View */
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden bg-[#ffffff]">
            
            {/* Sidebar list */}
            <div className="md:col-span-1 border-r border-[#a8c2a1] p-3 space-y-2 overflow-y-auto retro-forum-sidebar">
              <div className="text-[11px] font-bold text-[#3d5e34] px-1 mb-1 border-b border-[#cde0c7] pb-1">
                【規約卷宗目錄索引】
              </div>
              {availableRules.map(rule => (
                <button
                  key={`browse_tab_${rule.id}`}
                  onClick={() => {
                    sound.playPaper();
                    setSingleRuleId(rule.id);
                  }}
                  className={`w-full text-left p-2.5 rounded-xs border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                    singleRuleId === rule.id
                      ? 'bg-[#e2edd9] border-[#6b945f] text-[#1c3a14] font-bold shadow-2xs'
                      : 'bg-[#ffffff] border-[#cde0c7] text-[#3d4d39] hover:bg-[#f2f7ef]'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>【{rule.title}】</span>
                    {rule.isFake && (
                      <span className="text-[9px] px-1 py-0.2 rounded-xs bg-rose-100 text-rose-700 border border-rose-300">
                        偽造
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#6e8568] truncate">
                    {rule.obtainedAt}
                  </div>
                </button>
              ))}
            </div>

            {/* Document Content View */}
            <div className="md:col-span-2 p-5 sm:p-6 overflow-y-auto bg-[#ffffff] text-[#333333] flex flex-col justify-between custom-scrollbar">
              {singleRule ? (
                <div className="space-y-4">
                  <div className="border-b border-[#cde0c7] pb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base sm:text-lg font-bold text-[#23451b]">
                          【{singleRule.title}】
                        </h4>
                        {!isFirstWeek && singleRule.isFake && (
                          <span className="text-[10px] px-2 py-0.5 rounded-xs bg-rose-100 text-rose-700 border border-rose-300 font-mono">
                            VOID / FAKE COGNITION
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#556652] italic">
                        發佈來源／機構：{singleRule.source}
                      </div>
                    </div>

                    <span className="text-[11px] text-[#4d6645] shrink-0 px-2 py-1 rounded-xs bg-[#f0f5ee] border border-[#c3d7bd]">
                      {singleRule.obtainedAt}
                    </span>
                  </div>

                  <div className="p-4 rounded-xs bg-[#f9fbf8] border border-[#cde0c7] space-y-2 text-xs md:text-sm leading-relaxed text-[#2a3826]">
                    {singleRule.content.map((line, idx) => (
                      <p 
                        key={idx}
                        className={
                          line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.') || line.startsWith('6.') || line.startsWith('7.') || line.startsWith('8.') || line.startsWith('9.') || line.startsWith('10.')
                            ? 'text-[#1c3a14] font-bold pl-2 border-l-3 border-[#5d8752] py-0.5 my-1.5'
                            : 'text-[#384834]'
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="pt-3 border-t border-[#cde0c7] text-[10px] text-[#6e8568] flex items-center justify-between">
                <span>CASE ARCHIVE // CODEX COMPARISON MODULE</span>
                <span>PRESS [ESC] OR [X] TO CLOSE</span>
              </div>
            </div>

          </div>
        )}

      </motion.div>
    </div>
  );
};
