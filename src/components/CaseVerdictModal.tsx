import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCheck,
  Sparkles,
  CheckCircle2,
  X,
  Check,
  Map,
  ArrowRight,
  Trophy,
  Briefcase
} from 'lucide-react';
import { EndingId, GameState } from '../types';
import { INVENTORY_ITEMS, RULES_DATA } from '../data/rulesData';
import { sound } from '../services/soundEngine';
import { 
  checkEndingConditions, 
  EndingApproachStyle, 
  countCoreEvidenceItems, 
  CORE_EVIDENCE_ITEM_IDS 
} from '../utils/endingCalculator';

interface CaseVerdictModalProps {
  gameState: GameState;
  onClose: () => void;
  onTriggerEnding: (endingId: EndingId) => void;
}

export const CaseVerdictModal: React.FC<CaseVerdictModalProps> = ({
  gameState,
  onClose,
  onTriggerEnding
}) => {
  const { inventory, obtainedRules, san, trait } = gameState;

  // Selected deductions
  const [anomalyNatureChoice, setAnomalyNatureChoice] = useState<string | null>(null);
  const [rulesSourceChoice, setRulesSourceChoice] = useState<string | null>(null);
  const [finalActionChoice, setFinalActionChoice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verdictResult, setVerdictResult] = useState<{
    endingId: EndingId;
    title: string;
    description: string;
    type: 'true' | 'normal' | 'bad';
    soundFn: () => void;
  } | null>(null);

  // Core items count using ending calculator standard
  const heldCoreItemsCount = countCoreEvidenceItems(inventory);

  const isFormComplete = anomalyNatureChoice !== null && rulesSourceChoice !== null && finalActionChoice !== null;

  const handleExecuteVerdict = () => {
    if (!isFormComplete) return;
    setIsSubmitting(true);
    sound.playTypewriter();

    setTimeout(() => {
      // Map player's choices to ending calculator parameters
      let approachStyle: EndingApproachStyle = 'retreat';
      let isDeconstructed = false;

      if (finalActionChoice === 'rational_deconstruct') {
        const isDeductionCorrect = 
          anomalyNatureChoice === 'illegal_blueprint_fear' && 
          rulesSourceChoice === 'management_fraud';

        if (isDeductionCorrect) {
          approachStyle = 'deconstruct';
          isDeconstructed = true;
        } else {
          // Flawed logic, fallback to fleeing with target
          approachStyle = 'flee_with_target';
          isDeconstructed = false;
        }
      } else if (finalActionChoice === 'empath_reconciliation') {
        approachStyle = 'listen';
        isDeconstructed = false;
      } else if (finalActionChoice === 'brute_force') {
        approachStyle = 'violence';
        isDeconstructed = false;
      } else {
        approachStyle = 'succumb';
        isDeconstructed = false;
      }

      // Execute 8 Endings Evaluation Calculator
      const calcResult = checkEndingConditions({
        san,
        core_items_count: heldCoreItemsCount,
        is_deconstructed: isDeconstructed,
        approach_style: approachStyle,
        trait
      });

      const soundFn = calcResult.rawType === 'true' 
        ? () => sound.playResolutionChord()
        : calcResult.rawType === 'bad' 
          ? () => sound.playPsychologicalDissonance() 
          : () => sound.playContradictionBreakthrough();

      soundFn();

      setVerdictResult({
        endingId: calcResult.endingId,
        title: `${calcResult.id} ${calcResult.name}`,
        description: calcResult.desc,
        type: calcResult.rawType,
        soundFn
      });
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="retro-forum-modal-window max-w-4xl w-full h-[92vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden text-[#1a2e18] relative"
      >
        {/* Header */}
        <div className="retro-forum-modal-header px-4 py-3 border-b-2 border-[#1c3819] flex items-center justify-between gap-3 shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">⚖️</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  【結案方針推演】偵探最終結案報告與真相指證書
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 bg-[#173a14] border border-[#a3e635] text-[#a3e635] font-mono font-bold">
                  決戰推演
                </span>
              </div>
              <p className="text-xs text-[#cfebd0] mt-0.5">
                根據現場物證與邏輯鏈，確立對安祥路88號大樓事件的最終裁決方針
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-[11px] font-mono font-bold text-[#fef08a] hover:text-white px-2 py-0.5 bg-[#1a3818] border border-[#a3e635]/60 hover:bg-[#2b5828] cursor-pointer"
            title="關閉"
          >
            [關閉 X]
          </button>
        </div>

        {/* Verdict Form Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 custom-scrollbar bg-[#f4f8f3]">
          {/* Section 1: Core Evidence Chain Status */}
          <div className="p-3 bg-white border border-[#7ca078] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#2b5828]" />
                <h4 className="text-xs sm:text-sm font-bold text-[#1c3819]">
                  【物證鏈完整度評估】
                </h4>
              </div>
              <span className="text-xs font-mono text-[#426140]">
                核心物證：<span className="text-[#1c4718] font-bold">{heldCoreItemsCount}</span> / 6 件
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {CORE_EVIDENCE_ITEM_IDS.map(id => {
                const isHeld = inventory.includes(id);
                const item = INVENTORY_ITEMS[id];
                return (
                  <div
                    key={id}
                    className={`p-2 border text-center transition-all ${
                      isHeld
                        ? 'bg-[#f0f7ef] border-[#2b5828] text-[#1c4718]'
                        : 'bg-[#f9faf8] border-[#cfdacf] text-[#8fa08e] opacity-65'
                    }`}
                  >
                    <div className="text-[11px] font-bold line-clamp-1">
                      {item?.name || id}
                    </div>
                    <div className="text-[10px] font-mono mt-0.5 flex items-center justify-center gap-1">
                      {isHeld ? (
                        <span className="text-[#1c4718] font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3 text-[#2b5828]" /> 已查獲
                        </span>
                      ) : (
                        <span className="text-[#8fa08e]">未取得</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Question 1 - Nature of Room 404 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1c3819] border-b border-[#a8c9a5] pb-1">
              <span className="w-5 h-5 bg-[#1c3819] text-white flex items-center justify-center text-xs font-mono">
                1
              </span>
              <span>指證一：消失的404號房與空間扭曲之客觀真相？</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'illegal_blueprint_fear',
                  title: '【違建機房與集體認知牢籠】',
                  desc: '1998年建商私自加蓋之封閉機房，三十年來在產權糾紛與管理謊言下，被住戶盲從恐懼具現化為認知怪異。'
                },
                {
                  id: 'lovecraft_anomaly',
                  title: '【超自然外維度怪物實體】',
                  desc: '不可名狀的空間惡魔降臨公寓，任何人類邏輯均無意義，只能嚴格遵照每一條怪異規約苟活。'
                },
                {
                  id: 'hallucination_schizo',
                  title: '【失蹤者個人的精神妄想】',
                  desc: '大樓一切正常，只是張浩因租約壓力產生嚴重精神幻覺，四樓根本從未存在過。'
                }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    sound.playClick();
                    setAnomalyNatureChoice(opt.id);
                  }}
                  className={`p-3 border text-left transition-all cursor-pointer shadow-sm ${
                    anomalyNatureChoice === opt.id
                      ? 'bg-[#eaf5e8] border-[#1c3819] ring-1 ring-[#1c3819] text-[#1c3819]'
                      : 'bg-white border-[#b0c7af] hover:border-[#2b5828] text-[#2c4728]'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm text-[#1c3819]">
                    {opt.title}
                  </div>
                  <div className="text-xs text-[#556953] mt-1 leading-relaxed">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Question 2 - Source of Contradictory Rules */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1c3819] border-b border-[#a8c9a5] pb-1">
              <span className="w-5 h-5 bg-[#1c3819] text-white flex items-center justify-center text-xs font-mono">
                2
              </span>
              <span>指證二：互相衝突的《住戶守則》與《警衛守則》真實來源？</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'management_fraud',
                  title: '【管理方免責欺瞞公約】',
                  desc: '物業與建商為掩蓋私設夾層及非法施工事故，刻意編造多套互斥守則以推卸責任並控制住戶心理。'
                },
                {
                  id: 'absolute_curse',
                  title: '【絕對不可違逆的古老詛咒】',
                  desc: '自古流傳於安祥路的神秘法則，只要違反任一條守則便會立刻遭到抹殺。'
                }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    sound.playClick();
                    setRulesSourceChoice(opt.id);
                  }}
                  className={`p-3 border text-left transition-all cursor-pointer shadow-sm ${
                    rulesSourceChoice === opt.id
                      ? 'bg-[#eaf5e8] border-[#1c3819] ring-1 ring-[#1c3819] text-[#1c3819]'
                      : 'bg-white border-[#b0c7af] hover:border-[#2b5828] text-[#2c4728]'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm text-[#1c3819]">
                    {opt.title}
                  </div>
                  <div className="text-xs text-[#556953] mt-1 leading-relaxed">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Question 3 - Final Confrontation Resolution */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1c3819] border-b border-[#a8c9a5] pb-1">
              <span className="w-5 h-5 bg-[#1c3819] text-white flex items-center justify-center text-xs font-mono">
                3
              </span>
              <span>指證三：偵探林辰直面404打字機核心之破局方針？</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: 'rational_deconstruct',
                  title: '★【理性實證解構】',
                  desc: '出示違建圖紙、信件與錄音筆，以客觀事實撕碎謊言，徹底瓦解恐懼概念！（真結局路線）',
                  badge: '真相大白'
                },
                {
                  id: 'empath_reconciliation',
                  title: '【傾聽悲鳴・以善庇護】',
                  desc: '傾聽三十年來被遺忘者的悲鳴，試圖以自身力量庇護所有人。（無邪之惡）',
                  badge: '無邪之惡'
                },
                {
                  id: 'brute_force',
                  title: '【暴力物理摧毀】',
                  desc: '持鐵棍直接砸碎打字機與紙條，以暴力強行中斷空間。（因果悖論）',
                  badge: '執念輪迴'
                },
                {
                  id: 'yield_to_rule',
                  title: '【順從規則同化】',
                  desc: '穿上紅色制服，成為大樓的新任打字機守則撰寫員。（沉淪）',
                  badge: '成為規則'
                }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    sound.playClick();
                    setFinalActionChoice(opt.id);
                  }}
                  className={`p-3 border text-left transition-all cursor-pointer shadow-sm ${
                    finalActionChoice === opt.id
                      ? 'bg-[#eaf5e8] border-[#1c3819] ring-1 ring-[#1c3819] text-[#1c3819]'
                      : 'bg-white border-[#b0c7af] hover:border-[#2b5828] text-[#2c4728]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs sm:text-sm text-[#1c3819]">
                      {opt.title}
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#e0ede0] text-[#1c4718] border border-[#7ca078] font-bold">
                      {opt.badge}
                    </span>
                  </div>
                  <div className="text-xs text-[#556953] mt-1 leading-relaxed">
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Submit Button */}
        <div className="p-3 sm:px-5 border-t border-[#7ca078] bg-[#eaf2e8] flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-mono text-[#385e35] hidden sm:block">
            {isFormComplete ? (
              <span className="text-[#1c4718] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#2b7524]" /> 結案論述完備，隨時可送交裁決
              </span>
            ) : (
              <span className="text-[#85250c]">
                待確立上述三項關鍵推論方針
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="retro-web-btn px-3 py-1 text-xs"
            >
              稍後再議
            </button>

            <button
              disabled={!isFormComplete || isSubmitting}
              onClick={handleExecuteVerdict}
              className={`retro-web-btn px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 ${
                isFormComplete && !isSubmitting
                  ? 'bg-[#1c3819] text-white border-[#1c3819] hover:bg-[#2b5828]'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? '正在驗證...' : '簽署結案裁決書並破局'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Final Verdict Result Modal / Splash */}
        <AnimatePresence>
          {verdictResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 bg-[#f4f8f3]/98 flex flex-col items-center justify-center p-6 text-center space-y-4"
            >
              <div className={`p-4 border-2 shadow-lg ${
                verdictResult.type === 'true'
                  ? 'bg-[#eaf5e8] border-[#1c3819] text-[#1c4718]'
                  : verdictResult.type === 'bad'
                    ? 'bg-[#fee2e2] border-[#dc2626] text-[#991b1b]'
                    : 'bg-[#fef9c3] border-[#ca8a04] text-[#854d0e]'
              }`}>
                {verdictResult.type === 'true' ? (
                  <Trophy className="w-10 h-10 text-[#1c4718]" />
                ) : (
                  <FileCheck className="w-10 h-10 text-[#854d0e]" />
                )}
              </div>

              <div className="space-y-1.5 max-w-lg">
                <span className="text-xs font-mono uppercase tracking-widest text-[#2b5828] font-bold">
                  【偵探結案裁決確認 // VERDICT CONFIRMED】
                </span>
                <h3 className="text-xl font-bold text-[#1c3819]">
                  {verdictResult.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#385e35] leading-relaxed">
                  {verdictResult.description}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onTriggerEnding(verdictResult.endingId);
                  }}
                  className="retro-web-btn px-6 py-2 bg-[#1c3819] text-white border-[#1c3819] hover:bg-[#2b5828] font-bold text-xs shadow-md flex items-center gap-1.5 mx-auto cursor-pointer"
                >
                  <span>前往終局章節結算</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
