import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  MessageSquare,
  Footprints,
  Bell,
  Search,
  X,
  Filter,
  Heart,
  Sparkles,
  FileText,
  Brain
} from 'lucide-react';
import { JournalEntry, JournalCategory } from '../types';
import { sound } from '../services/soundEngine';
import { getDetectiveIntuition } from '../utils/detectiveIntuition';

interface JournalModalProps {
  logs: JournalEntry[];
  obtainedRules?: string[];
  inventory?: string[];
  currentLocationName?: string;
  investigationDateText?: string;
  investigationDay?: number;
  completedWeek1?: boolean;
  onClose: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  logs,
  obtainedRules = [],
  inventory = [],
  currentLocationName = '安祥路88號大樓',
  investigationDateText = '2012年 (第1天)',
  investigationDay = 1,
  completedWeek1 = false,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | JournalCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const dialogueCount = useMemo(() => logs.filter(l => l.category === 'dialogue').length, [logs]);
  const actionCount = useMemo(() => logs.filter(l => l.category === 'action').length, [logs]);
  const systemCount = useMemo(() => logs.filter(l => l.category === 'system').length, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchCat = selectedCategory === 'all' || log.category === selectedCategory;
      if (!matchCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(q) ||
        log.content.toLowerCase().includes(q) ||
        (log.speaker && log.speaker.toLowerCase().includes(q)) ||
        (log.location && log.location.toLowerCase().includes(q))
      );
    });
  }, [logs, selectedCategory, searchQuery]);

  const getCategoryIcon = (category: JournalCategory) => {
    switch (category) {
      case 'dialogue':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'action':
        return <Footprints className="w-4 h-4 text-amber-400" />;
      case 'system':
        return <Bell className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getCategoryBadge = (category: JournalCategory) => {
    switch (category) {
      case 'dialogue':
        return <span className="text-[10px] px-2 py-0.5 rounded-xs bg-[#eef2fa] border border-[#9fb3d8] text-[#1a3964] font-sans">對話紀錄</span>;
      case 'action':
        return <span className="text-[10px] px-2 py-0.5 rounded-xs bg-[#eef7ec] border border-[#a8cda0] text-[#2b5420] font-sans">行動調查</span>;
      case 'system':
        return <span className="text-[10px] px-2 py-0.5 rounded-xs bg-[#fff8e6] border border-[#e0c47e] text-[#855800] font-mono">系統通知</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-1.5 sm:p-3 md:p-5 lg:p-6 select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        className="retro-forum-modal-window rounded-none w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[95dvh] sm:h-[90vh] lg:h-[88vh] max-h-[95dvh] lg:max-h-[860px] xl:max-h-[920px] flex flex-col overflow-hidden text-[#222222]"
      >
        {/* Header - 2000s Forum Portal Style */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 retro-forum-modal-header shrink-0 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1 sm:p-1.5 rounded-xs bg-[#ffffff]/20 border border-[#ffffff]/40 text-[#ffffff] shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#ffffff] tracking-wide truncate">
                  現場勘查日誌與行動記錄簿
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-xs bg-[#ffffff]/20 text-[#f0f9ee] border border-[#ffffff]/40 shrink-0">
                  共 {logs.length} 則紀錄
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-[#d8ecd2] flex items-center gap-2 mt-0.5 truncate hidden xs:flex">
                <span>{investigationDateText} (第 {investigationDay} 天)</span>
                <span>•</span>
                <span className="text-[#ffffff] font-bold">{currentLocationName}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 sm:p-1.5 rounded-xs border border-[#ffffff]/40 text-[#ffffff] hover:bg-[#ffffff]/20 transition-colors cursor-pointer min-h-[30px] min-w-[30px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center shrink-0 ml-2"
            title="關閉視窗 (ESC)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Filter Controls Bar (2000s Subnav Style) */}
        <div className="p-2 sm:p-2.5 px-3 sm:px-4 retro-forum-modal-subnav flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full touch-pan-x scrollbar-none">
            <button
              onClick={() => {
                sound.playPaper();
                setSelectedCategory('all');
              }}
              className={`min-h-[28px] px-2.5 py-1 rounded-xs text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer font-bold ${
                selectedCategory === 'all'
                  ? 'bg-[#ffffff] text-[#2b5420] border border-[#5d8752] shadow-2xs'
                  : 'bg-[#f4f7f2] text-[#4d6645] hover:bg-[#ffffff] border border-[#b8ceb1]'
              }`}
            >
              <span>全部紀錄</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-xs font-mono ${
                selectedCategory === 'all' ? 'bg-[#3e6634] text-white' : 'bg-[#e2edd9] text-[#2b5420]'
              }`}>
                {logs.length}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playPaper();
                setSelectedCategory('dialogue');
              }}
              className={`min-h-[28px] px-2.5 py-1 rounded-xs text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer font-bold ${
                selectedCategory === 'dialogue'
                  ? 'bg-[#ffffff] text-[#1a3964] border border-[#6b89b4] shadow-2xs'
                  : 'bg-[#f4f7f2] text-[#4d6645] hover:bg-[#ffffff] border border-[#b8ceb1]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>對話</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-xs font-mono ${
                selectedCategory === 'dialogue' ? 'bg-[#1a3964] text-white' : 'bg-[#e2edd9] text-[#2b5420]'
              }`}>
                {dialogueCount}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playPaper();
                setSelectedCategory('action');
              }}
              className={`min-h-[28px] px-2.5 py-1 rounded-xs text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer font-bold ${
                selectedCategory === 'action'
                  ? 'bg-[#ffffff] text-[#2b5420] border border-[#5d8752] shadow-2xs'
                  : 'bg-[#f4f7f2] text-[#4d6645] hover:bg-[#ffffff] border border-[#b8ceb1]'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>行動</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-xs font-mono ${
                selectedCategory === 'action' ? 'bg-[#3e6634] text-white' : 'bg-[#e2edd9] text-[#2b5420]'
              }`}>
                {actionCount}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playPaper();
                setSelectedCategory('system');
              }}
              className={`min-h-[28px] px-2.5 py-1 rounded-xs text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer font-bold ${
                selectedCategory === 'system'
                  ? 'bg-[#ffffff] text-[#855800] border border-[#c49a38] shadow-2xs'
                  : 'bg-[#f4f7f2] text-[#4d6645] hover:bg-[#ffffff] border border-[#b8ceb1]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>通知</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-xs font-mono ${
                selectedCategory === 'system' ? 'bg-[#855800] text-white' : 'bg-[#e2edd9] text-[#2b5420]'
              }`}>
                {systemCount}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#556652] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋日誌關鍵字..."
              className="w-full pl-8 pr-3 py-1 bg-[#ffffff] border border-[#9bb793] rounded-xs text-xs text-[#222222] placeholder-[#778872] focus:outline-none focus:border-[#4a723e]"
            />
          </div>
        </div>

        {/* Logs List Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3 custom-scrollbar min-h-0 bg-[#f7faf5]">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-[#556652] space-y-2">
              <BookOpen className="w-10 h-10 mx-auto opacity-40 text-[#3e6634]" />
              <p className="text-sm font-bold">此分類尚無相關紀錄，或搜尋無匹配項目。</p>
              <p className="text-xs text-[#778872]">在安祥路88號大樓各樓層調查探索時，所有事件與對話均會自動建檔存儲於此。</p>
            </div>
          ) : (
            filteredLogs.slice().reverse().map((log) => {
              return (
                <div
                  key={log.id}
                  className={`p-3 sm:p-3.5 rounded-xs border transition-all bg-[#ffffff] ${
                    log.category === 'dialogue'
                      ? 'border-[#9fb3d8] hover:border-[#6b89b4] shadow-2xs'
                      : log.category === 'action'
                        ? 'border-[#a8cda0] hover:border-[#5d8752] shadow-2xs'
                        : 'border-[#e0c47e] hover:border-[#c49a38] shadow-2xs'
                  }`}
                >
                  {/* Top line: Category, Speaker/Title, Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5efe2] pb-1.5 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-xs bg-[#f4f7f2] border border-[#c3d7bd]">
                        {getCategoryIcon(log.category)}
                      </div>
                      <div>
                        <span className="font-bold text-xs md:text-sm text-[#1c3a14]">
                          {log.title}
                        </span>
                        {log.speaker && (
                          <span className="ml-2 text-[11px] text-[#1a3964] font-bold">
                            【發話者: {log.speaker}】
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#556652]">
                      {log.location && (
                        <span className="text-[#667763] hidden sm:inline">{log.location}</span>
                      )}
                      <span className="font-mono">{log.timestamp}</span>
                      {getCategoryBadge(log.category)}
                    </div>
                  </div>

                  {/* Body text */}
                  <p className="text-xs md:text-sm text-[#2a3826] leading-relaxed whitespace-pre-line pl-1">
                    {log.content}
                  </p>

                  {/* Highlights / Badges */}
                  {(() => {
                    const intuition = getDetectiveIntuition(
                      `${log.title} ${log.content} ${log.speaker || ''}`,
                      obtainedRules,
                      inventory,
                      completedWeek1
                    );
                    return (
                      <div className="mt-2 pt-1.5 border-t border-[#edf4ea] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {log.sanDelta !== undefined && (
                            <div className={`text-[10px] px-2 py-0.5 rounded-xs font-mono font-bold flex items-center gap-1 ${
                              log.sanDelta > 0
                                ? 'bg-[#eef7ec] border border-[#7ba770] text-[#275a1e]'
                                : log.sanDelta === 0
                                  ? 'bg-[#f4f7f2] text-[#667763] border border-[#d2ded0]'
                                  : 'bg-[#fdeeed] border border-[#e49b99] text-[#991b1b]'
                            }`}>
                              <Heart className="w-3 h-3" />
                              <span>{log.sanDelta > 0 ? '心神平復提振' : log.sanDelta === 0 ? '心緒未受干擾' : '承受心理衝擊'}</span>
                            </div>
                          )}

                          {log.highlightBadge && (
                            <div className="text-[10px] px-2 py-0.5 rounded-xs bg-[#fff8e6] border border-[#d4b455] text-[#855800] font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>{log.highlightBadge}</span>
                            </div>
                          )}
                        </div>

                        {/* Subtle Intuition Hint */}
                        {intuition && (
                          <div className={`text-[11px] px-2 py-0.5 rounded-xs border flex items-center gap-1.5 ${
                            intuition.type === 'contradiction'
                              ? 'bg-[#fdeeed] border-[#e49b99] text-[#991b1b]'
                              : 'bg-[#fff8e6] border-[#d4b455] text-[#855800]'
                          }`}>
                            <Brain className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-bold">【直覺聯想】{intuition.text}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2 sm:px-4 border-t border-[#a8c2a1] bg-[#ffffff] flex items-center justify-between text-xs text-[#556652] shrink-0">
          <span className="text-[10px] font-mono text-[#778872]">ACTIVITY LOGS // REAL-TIME INVESTIGATION DIARY</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="retro-web-btn px-4 py-1 text-xs font-bold text-[#1a3964] cursor-pointer"
          >
            [關閉日誌]
          </button>
        </div>
      </motion.div>
    </div>
  );
};
