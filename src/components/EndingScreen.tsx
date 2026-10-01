import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Briefcase,
  FileText,
  Newspaper
} from 'lucide-react';
import { EndingId, TraitId, JournalEntry, FreeNote, SavedGameData } from '../types';
import { ENDINGS_DATA, WEEK1_ENDINGS_DATA, INVENTORY_ITEMS } from '../data/rulesData';
import { sound } from '../services/soundEngine';
import { CaseReportModal } from './CaseReportModal';
import { EndingEpilogueModal } from './EndingEpilogueModal';
import { CANONICAL_TO_SHORT_ENDING_ID } from '../utils/endingCalculator';

interface EndingScreenProps {
  endingId: EndingId;
  san: number;
  playerName: string;
  trait?: TraitId;
  inventory: string[];
  obtainedRules?: string[];
  journalLogs?: JournalEntry[];
  freeNotes?: FreeNote[];
  investigationDay: number;
  investigationDateText: string;
  unlockedEndings?: EndingId[];
  completedWeek1?: boolean;
  onProceedToWeek2?: () => void;
  onRestart: () => void;
  onOpenGallery: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  endingId,
  san,
  playerName,
  trait = 'rationalist',
  inventory,
  obtainedRules = [],
  journalLogs = [],
  freeNotes = [],
  investigationDay,
  investigationDateText,
  unlockedEndings = [],
  completedWeek1 = false,
  onProceedToWeek2,
  onRestart,
  onOpenGallery
}) => {
  const ending = (!completedWeek1 && WEEK1_ENDINGS_DATA[endingId])
    ? WEEK1_ENDINGS_DATA[endingId]
    : (ENDINGS_DATA[endingId] || ENDINGS_DATA.ending1);
  const TOTAL_EVIDENCES = 6;
  const [showCaseReport, setShowCaseReport] = useState<boolean>(false);
  const [showEpilogueModal, setShowEpilogueModal] = useState<boolean>(false);

  useEffect(() => {
    if (!completedWeek1) {
      // In Week 1, keep sound atmospheric and grounded without supernatural glitch audio
      sound.playElevatorChime();
      return;
    }

    if (ending.type === 'true') {
      sound.playResolutionChord();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } else if (ending.type === 'bad') {
      sound.playGlitch();
    } else {
      sound.playElevatorChime();
    }
  }, [ending.type, completedWeek1]);

  const getEndingBadge = () => {
    if (!completedWeek1) {
      if (endingId === 'ending1') {
        return {
          label: 'CASE SUSPENDED // 退出調查・合約撤銷',
          bg: 'bg-stone-900 border-stone-600 text-stone-300'
        };
      }
      return {
        label: 'MEDICAL EVACUATION // 急性休克・送醫急救',
        bg: 'bg-slate-900 border-slate-600 text-slate-300'
      };
    }
    if (ending.type === 'true') {
      return {
        label: '★ TRUE ENDING // 真相大白',
        bg: 'bg-emerald-950 border-emerald-500 text-emerald-300'
      };
    }
    if (ending.type === 'bad') {
      return {
        label: '⚠ BAD ENDING // 精神迷失',
        bg: 'bg-red-950 border-red-500 text-red-300'
      };
    }
    return {
      label: 'NORMAL ENDING // 普通結局',
      bg: 'bg-amber-950 border-amber-500 text-amber-300'
    };
  };

  const badge = getEndingBadge();

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full bg-neutral-900 border border-neutral-700 rounded-2xl p-6 md:p-8 shadow-2xl text-neutral-200 relative overflow-hidden space-y-6"
      >
        {/* Ambient Top Glow */}
        <div 
          className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${
            !completedWeek1
              ? 'from-stone-600 via-amber-800 to-stone-700'
              : ending.type === 'true' 
                ? 'from-emerald-500 via-teal-400 to-emerald-600'
                : ending.type === 'bad'
                  ? 'from-red-600 via-rose-500 to-red-700'
                  : 'from-amber-500 via-yellow-400 to-amber-600'
          }`}
        />

        {/* Badge & Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-mono border font-bold bg-neutral-950 border-neutral-700 text-amber-300 shadow-sm">
              {CANONICAL_TO_SHORT_ENDING_ID[endingId] || 'ED?'}
            </span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono border font-bold ${badge.bg}`}>
              {badge.label}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-neutral-100 tracking-wide">
            {ending.title}
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 mt-1.5 font-serif">
            {ending.description}
          </p>
        </div>

        {/* Story Narrative Box */}
        <div className="bg-black/60 border border-neutral-800 rounded-xl p-5 md:p-6 font-serif space-y-3 leading-relaxed shadow-inner">
          <div className="border-b border-neutral-800/80 pb-2">
            <span className="text-xs font-mono text-neutral-400">結局事件紀實：</span>
          </div>
          {ending.story.map((paragraph, idx) => (
            <p key={idx} className="text-sm text-neutral-200">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Evidence Collection Audit (Requirement 3: Reveal total vs collected in ending) */}
        <div className="bg-neutral-950/90 border border-neutral-800 rounded-xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold font-mono text-neutral-200">
                【案件物證搜集盤點總覽】
              </span>
            </div>
            <div className="text-xs font-mono">
              收集進度：<b className="text-amber-400 text-sm">{inventory.length}</b> / <span className="text-neutral-400">{TOTAL_EVIDENCES} 件物證</span>
              <span className="ml-2 text-[11px] text-neutral-500">
                ({Math.round((inventory.length / TOTAL_EVIDENCES) * 100)}% 完整度)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {Object.values(INVENTORY_ITEMS).map((item) => {
              const hasObtained = inventory.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 font-serif ${
                    hasObtained
                      ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-200'
                      : 'bg-neutral-900/40 border-neutral-800/80 text-neutral-600 line-through'
                  }`}
                >
                  <span className={hasObtained ? 'text-indigo-400' : 'text-neutral-600'}>
                    {hasObtained ? '✓' : '✗'}
                  </span>
                  <span className="truncate">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detective Psychological Reflection & Investigation Metadata */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4">
          <div className="text-[11px] font-mono text-amber-400 font-bold mb-1.5 flex items-center justify-between">
            <span>【{playerName ? `${playerName} 的結案手記與後日談` : '調查員結案手記與後日談'}】：</span>
            <span className="text-neutral-500">結案日期：{investigationDateText} (歷時 {investigationDay} 天)</span>
          </div>
          <p className="text-xs text-neutral-300 italic font-serif leading-relaxed">
            {ending.detectiveComment}
          </p>
          <div className="mt-3 pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-500 gap-2">
            <span>結案時心智狀態：{san >= 70 ? '意識清醒・理智穩定' : san >= 40 ? '精神緊繃・心智受壓' : san > 0 ? '瀕臨崩潰・認知混亂' : '心智枯竭・同化'}</span>
            <span>達成條件：{ending.unlockedAtSan}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                sound.playPaper();
                setShowEpilogueModal(true);
              }}
              className="px-4 py-2.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/80 font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ring-1 ring-amber-500/50"
            >
              <Newspaper className="w-4 h-4 text-amber-400" />
              <span>📖 閱覽專屬後日談與人物命運</span>
            </button>

            <button
              onClick={() => {
                sound.playPaper();
                setShowCaseReport(true);
              }}
              className="px-4 py-2.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/70 font-semibold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>📄 案件調查報告書</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenGallery();
              }}
              className="px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <Trophy className="w-4 h-4" />
              全 8 種結局圖鑑
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!completedWeek1 && onProceedToWeek2 && (
              <button
                onClick={() => {
                  sound.playResolutionChord();
                  onProceedToWeek2();
                }}
                className="px-5 py-2.5 rounded-lg bg-red-950/90 hover:bg-red-900 text-red-200 border border-red-500/80 font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all cursor-pointer ring-1 ring-red-500/50 animate-pulse"
                title="重整案情，打破常規認知遮蔽，進入第二輪深度怪談篇"
              >
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>重整案情・啟動二週目破壁調查 ➔</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onRestart();
              }}
              className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              重新開始調查
            </button>
          </div>
        </div>

        {/* Ending Epilogue Modal Overlay */}
        {showEpilogueModal && (
          <EndingEpilogueModal
            endingId={endingId}
            savedData={{
              version: 1,
              saveTimestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
              playerName,
              selectedTrait: trait,
              isTraitRevealed: true,
              san,
              currentChapter: 'ending',
              currentLocationName: '案件終局紀錄',
              obtainedRules,
              inventory,
              isCctvRebooted: true,
              currentEnding: endingId,
              investigationDay,
              gameDate: { year: 2012, month: 10, day: investigationDay },
              restCount: 0,
              foundContradictions: [],
              freeNotes,
              journalLogs,
              unlockedEndings,
              completedWeek1
            }}
            onClose={() => setShowEpilogueModal(false)}
          />
        )}

        {/* Case Report Modal Fullscreen Overlay */}
        {showCaseReport && (
          <CaseReportModal
            playerName={playerName}
            trait={trait}
            san={san}
            endingId={endingId}
            investigationDay={investigationDay}
            investigationDateText={investigationDateText}
            inventory={inventory}
            obtainedRules={obtainedRules}
            journalLogs={journalLogs}
            freeNotes={freeNotes}
            completedWeek1={completedWeek1}
            onClose={() => setShowCaseReport(false)}
          />
        )}
      </motion.div>
    </div>
  );
};
