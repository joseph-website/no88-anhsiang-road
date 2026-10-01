import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GitBranch,
  Trophy,
  CheckCircle,
  Lock,
  Sparkles,
  X,
  ArrowRight,
  Compass,
  BookOpen
} from 'lucide-react';
import { EndingId, SavedGameData } from '../types';
import { ENDINGS_DATA } from '../data/rulesData';
import { sound } from '../services/soundEngine';
import { CANONICAL_TO_SHORT_ENDING_ID } from '../utils/endingCalculator';
import { EndingEpilogueModal } from './EndingEpilogueModal';
import { loadSaveSlot } from '../services/saveSystem';

interface DecisionNode {
  id: string;
  stage: string;
  stageName: string;
  desc: string;
  branches: {
    choiceSummary: string;
    targetEndingId?: EndingId;
    nextNodeId?: string;
    hint: string;
  }[];
}

// Case Flowchart Decision Nodes (無劇透設計)
const DECISION_FLOW_NODES: DecisionNode[] = [
  {
    id: 'node_start',
    stage: 'STAGE 1',
    stageName: '大廳與委託初探',
    desc: '初抵安祥路88號大樓，面對陰森的門廳與詭譎的警衛工作守則。',
    branches: [
      {
        choiceSummary: '感到畏懼，在1F大廳直接放棄委託轉身離去',
        targetEndingId: 'ending1',
        hint: '（線索未明，尚待深入調查）'
      },
      {
        choiceSummary: '出示委託書並深入安控中心或梯間繼續搜查',
        nextNodeId: 'node_security',
        hint: '（深入大樓內部開展勘驗）'
      }
    ]
  },
  {
    id: 'node_security',
    stage: 'STAGE 2',
    stageName: '警衛室與動線搜查',
    desc: '在大樓低層與各樓層搜查住戶生活痕跡與失聯疑點。',
    branches: [
      {
        choiceSummary: '直面監視器異象時退縮，盲從表面規約順從撤退',
        targetEndingId: 'ending2',
        hint: '（線索未明，尚待深入調查）'
      },
      {
        choiceSummary: '【常態破案】合力搜查暗室移開遮蔽，成功救出失聯者',
        targetEndingId: 'ending0',
        hint: '（線索未明，尚待深入調查）'
      },
      {
        choiceSummary: '破解電梯PLC跳線或尋獲關鍵門禁，直抵封鎖核心區',
        nextNodeId: 'node_room404',
        hint: '（突破樓層封鎖直擊核心區域）'
      }
    ]
  },
  {
    id: 'node_room404',
    stage: 'STAGE 3',
    stageName: '404號房核心對峙',
    desc: '探索大樓核心隱蔽區域，直面深層異常與迷局真相。',
    branches: [
      {
        choiceSummary: '心智負荷崩潰歸零，屈服於規則暗示',
        targetEndingId: 'ending4',
        hint: '（線索未明，尚待深入調查）'
      },
      {
        choiceSummary: '不深究概念本質，強行拽起友人倉皇破門突圍',
        targetEndingId: 'ending3',
        hint: '（線索未明，尚待深入調查）'
      },
      {
        choiceSummary: '憤怒失控，以純物理暴力砸毀核心設備',
        targetEndingId: 'ending7',
        hint: '（線索未明，尚待深入調查）'
      },
      {
        choiceSummary: '試圖以善意傾聽庇護所有人，卻因心智防線潰竭陷入狂亂行無邪之惡',
        targetEndingId: 'ending6',
        hint: '（線索未明，尚待深入調查）'
      },
      {
        choiceSummary: '以充足理智出示物證，完成邏輯概念解構',
        targetEndingId: 'ending5',
        hint: '（線索未明，尚待深入調查）'
      },
      {
        choiceSummary: '集齊全部6件核心物證，形成完整證據鏈實現全員解救',
        targetEndingId: 'ending8',
        hint: '（線索未明，尚待深入調查）'
      }
    ]
  }
];

interface EndingGalleryModalProps {
  unlockedEndings: EndingId[];
  completedWeek1?: boolean;
  playerName?: string;
  onOpenSecretArchive?: () => void;
  onClose: () => void;
}

export const EndingGalleryModal: React.FC<EndingGalleryModalProps> = ({
  unlockedEndings,
  completedWeek1 = false,
  playerName = '',
  onOpenSecretArchive,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'flowchart'>('flowchart');
  const [filter, setFilter] = useState<'all' | 'true' | 'normal' | 'bad'>('all');
  const [selectedEndingPreview, setSelectedEndingPreview] = useState<EndingId | null>(null);
  const [selectedEpilogueEndingId, setSelectedEpilogueEndingId] = useState<EndingId | null>(null);

  // Week 1 only shows initial endings to prevent spoilers
  const allEndings: EndingId[] = completedWeek1
    ? ['ending0', 'ending1', 'ending2', 'ending3', 'ending4', 'ending5', 'ending6', 'ending7', 'ending8']
    : ['ending0', 'ending1', 'ending2', 'ending4'];

  // Filter decision nodes based on progression
  const displayDecisionNodes: DecisionNode[] = completedWeek1
    ? DECISION_FLOW_NODES
    : [
        DECISION_FLOW_NODES[0],
        {
          ...DECISION_FLOW_NODES[1],
          branches: DECISION_FLOW_NODES[1].branches.filter(b => b.targetEndingId !== undefined)
        },
        {
          id: 'node_locked_depth',
          stage: 'STAGE ???',
          stageName: '【深層異象・檔案封存中】',
          desc: '此因果節點涉及大樓深層之謎。需完成第一階段現場勘查並順利破案結案後，方可開啟深度分歧。',
          branches: []
        }
      ];

  const getEndingBadge = (type: 'true' | 'bad' | 'normal') => {
    switch (type) {
      case 'true':
        return { label: '★ TRUE ENDING // 真結局', color: 'text-[#1c5e18] bg-[#eef8ed] border-[#7ca078]' };
      case 'bad':
        return { label: '⚠ BAD ENDING // 壞結局', color: 'text-[#8c2727] bg-[#fff0f0] border-[#d9a8a8]' };
      default:
        return { label: 'NORMAL ENDING // 普通結局', color: 'text-[#854d0e] bg-[#fcf8ec] border-[#d8c38c]' };
    }
  };

  const filteredEndings = allEndings.filter(eid => {
    const ending = ENDINGS_DATA[eid];
    if (!ending) return false;
    if (filter === 'all') return true;
    return ending.type === filter;
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-1.5 sm:p-3 md:p-5 select-none font-sans">
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="retro-forum-modal-window rounded-none max-w-4xl w-full h-[96dvh] sm:h-[88vh] max-h-[96dvh] sm:max-h-[760px] flex flex-col shadow-xl overflow-hidden text-[#1a2e18]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 retro-forum-modal-header text-[#ffffff] shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1 sm:p-1.5 rounded-xs bg-[#ffffff]/20 border border-[#ffffff]/40 text-[#ffffff] shrink-0">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#ffffff] tracking-wide truncate">
                  因果分歧與全結局檔案 // ENDINGS ARCHIVE
                </h3>
                <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-xs bg-[#ffffff]/20 border border-[#ffffff]/50 text-[#ffffff] font-bold shrink-0">
                  {unlockedEndings.filter(e => allEndings.includes(e)).length} / {allEndings.length} 達成
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#ffffff]/80 font-mono mt-0.5 truncate hidden xs:block">
                {completedWeek1 
                  ? 'INVESTIGATION CAUSALITY TREE // 8 ENDINGS FLOWCHART' 
                  : 'INVESTIGATION CAUSALITY // WEEK 1 INVESTIGATION ENDINGS'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xs border border-[#ffffff]/40 text-[#ffffff] hover:bg-[#ffffff]/20 cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0 ml-1"
            title="關閉"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>

        {/* View Mode & Filter Sub-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2.5 bg-neutral-950 border-b border-neutral-800 text-xs font-mono shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => {
                sound.playClick();
                setViewMode('flowchart');
              }}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'flowchart'
                  ? 'bg-amber-950 border border-amber-500 text-amber-300 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>因果分歧樹狀圖</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setViewMode('cards');
              }}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? 'bg-amber-950 border border-amber-500 text-amber-300 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>結局圖鑑清單</span>
            </button>
          </div>

          {/* Cards View Filters (Only visible in cards mode) */}
          {viewMode === 'cards' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setFilter('all');
                }}
                className={`px-2.5 py-1 rounded border transition-all ${filter === 'all' ? 'bg-amber-950/80 border-amber-500 text-amber-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}
              >
                全部 ({allEndings.length})
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setFilter('true');
                }}
                className={`px-2.5 py-1 rounded border transition-all ${filter === 'true' ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}
              >
                真結局 (2)
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setFilter('normal');
                }}
                className={`px-2.5 py-1 rounded border transition-all ${filter === 'normal' ? 'bg-amber-950/80 border-amber-500 text-amber-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}
              >
                普通 (5)
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setFilter('bad');
                }}
                className={`px-2.5 py-1 rounded border transition-all ${filter === 'bad' ? 'bg-rose-950/80 border-rose-500 text-rose-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}
              >
                壞結局 (1)
              </button>
            </div>
          )}

          {/* Special Unlockable: ED8 True Dawn Director's Cut Archive Banner */}
          {unlockedEndings.includes('ending8') && onOpenSecretArchive && (
            <button
              onClick={() => {
                sound.playResolutionChord();
                onOpenSecretArchive();
              }}
              className="ml-auto px-3.5 py-1 rounded-lg bg-gradient-to-r from-emerald-950 to-emerald-900 border border-emerald-500 text-emerald-300 hover:text-emerald-100 flex items-center gap-1.5 text-xs font-serif font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] animate-pulse cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>🎬 開啟【機密檔案館】後日談</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-950/50">
          {viewMode === 'flowchart' ? (
            /* Flowchart Tree View */
            <div className="space-y-8 max-w-3xl mx-auto">
              <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-lg text-xs font-serif text-neutral-400 leading-relaxed flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  本分歧圖展示案件核心關鍵抉擇點。所有未解鎖節點均隱去具體情節，僅提供客觀探索指引，方便偵探進行案件全線索補完。
                </span>
              </div>

              {displayDecisionNodes.map((node, nodeIdx) => (
                <div key={node.id} className="relative">
                  {/* Node Header Box */}
                  <div className="bg-neutral-900 border-2 border-neutral-700 rounded-xl p-4 shadow-lg mb-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-600 text-amber-300">
                          {node.stage}
                        </span>
                        <h4 className="text-base font-bold text-neutral-100 font-serif">
                          {node.stageName}
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-neutral-500">
                        關鍵抉擇點 0{nodeIdx + 1}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-serif leading-relaxed">
                      {node.desc}
                    </p>
                  </div>

                  {/* Branches Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-dashed border-neutral-800 ml-4">
                    {node.branches.map((branch, bIdx) => {
                      if (branch.targetEndingId) {
                        const targetId = branch.targetEndingId;
                        const isUnlocked = unlockedEndings.includes(targetId);
                        const ending = ENDINGS_DATA[targetId];
                        const shortId = CANONICAL_TO_SHORT_ENDING_ID[targetId] || 'ED?';
                        const badge = ending ? getEndingBadge(ending.type) : null;

                        return (
                          <div
                            key={bIdx}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isUnlocked
                                ? ending?.type === 'true'
                                  ? 'bg-emerald-950/30 border-emerald-500/70 text-emerald-200 shadow-md'
                                  : ending?.type === 'bad'
                                    ? 'bg-rose-950/30 border-rose-600/70 text-rose-200'
                                    : 'bg-amber-950/30 border-amber-500/70 text-amber-200'
                                : 'bg-neutral-900/50 border-neutral-800/80 text-neutral-500'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${isUnlocked ? 'bg-black/50 text-amber-400' : 'bg-neutral-800 text-neutral-600'}`}>
                                  {isUnlocked ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                </div>
                                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 border border-neutral-700 text-amber-300">
                                  {shortId}
                                </span>
                              </div>
                              {isUnlocked && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-neutral-700 text-neutral-300">
                                  已解鎖
                                </span>
                              )}
                            </div>

                            <div className="font-serif text-sm font-bold text-neutral-100 mb-1">
                              {isUnlocked ? ending?.title : '【？？？ 未解鎖結局】'}
                            </div>

                            <p className="text-xs font-serif leading-relaxed text-neutral-400">
                              {isUnlocked ? branch.choiceSummary : branch.hint}
                            </p>

                            {isUnlocked && badge && (
                              <div className="mt-2.5 pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono">
                                <span className={`px-2 py-0.5 rounded border ${badge.color}`}>
                                  {badge.label}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={bIdx}
                          className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/30 flex items-center justify-between gap-3 text-neutral-300 font-serif text-xs md:col-span-2"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{completedWeek1 ? branch.choiceSummary : (branch.hint || branch.choiceSummary)}</span>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-800 px-2 py-1 rounded shrink-0">
                            推進至下一階段 ➔
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Cards Gallery List View */
            <div className="space-y-4">
              {filteredEndings.map((eid) => {
                const ending = ENDINGS_DATA[eid];
                if (!ending) return null;
                const isUnlocked = unlockedEndings.includes(eid);
                const badge = getEndingBadge(ending.type);
                const shortId = CANONICAL_TO_SHORT_ENDING_ID[eid] || 'ED?';

                return (
                  <div
                    key={eid}
                    className={`p-4 rounded-xl border transition-all ${
                      isUnlocked
                        ? ending.type === 'true'
                          ? 'bg-emerald-950/20 border-emerald-500/60 text-emerald-200'
                          : ending.type === 'bad'
                            ? 'bg-red-950/20 border-red-600/60 text-red-200'
                            : 'bg-amber-950/20 border-amber-500/60 text-amber-200'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-500 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-black/50 text-amber-400' : 'bg-neutral-800 text-neutral-600'}`}>
                          {isUnlocked ? <CheckCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-black/60 border border-neutral-700 font-bold text-amber-300">
                              {shortId}
                            </span>
                            <h4 className={`text-base font-bold font-serif ${isUnlocked ? 'text-neutral-100' : 'text-neutral-500'}`}>
                              {isUnlocked ? ending.title : '【未解鎖結局】'}
                            </h4>
                          </div>
                          <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded border font-mono ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {isUnlocked && (
                        <span className="text-xs px-2.5 py-1 rounded bg-black/40 border border-neutral-700 font-mono text-neutral-300">
                          已達成
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-serif leading-relaxed mt-2 pl-10 text-neutral-300">
                      {isUnlocked ? ending.description : '【檔案封存中】需於案件調查中達成特定關鍵抉擇與心理狀態後方可解鎖此結局。'}
                    </p>

                    <div className="mt-3 pt-2 border-t border-neutral-800/80 pl-10 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-400 gap-2">
                      <span>線索提示：{isUnlocked ? ending.requirement : '尚未達成觸發條件，請於大樓探索中留意各項異常。'}</span>
                      <div className="flex items-center gap-3">
                        <span>心理狀態要求：{isUnlocked ? ending.unlockedAtSan : '條件未知'}</span>
                        {isUnlocked && (
                          <button
                            onClick={() => {
                              sound.playPaper();
                              setSelectedEpilogueEndingId(eid);
                            }}
                            className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-300 text-xs font-serif font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>閱覽後日談</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Ending Epilogue & After-Story Modal Overlay */}
      {selectedEpilogueEndingId && (
        <EndingEpilogueModal
          endingId={selectedEpilogueEndingId}
          savedData={loadSaveSlot(`ending_${selectedEpilogueEndingId}` as any)}
          onClose={() => setSelectedEpilogueEndingId(null)}
        />
      )}
    </div>
  );
};
