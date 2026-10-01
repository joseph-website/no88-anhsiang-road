import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  Circle,
  MapPin,
  ChevronRight,
  FileQuestion
} from 'lucide-react';
import { 
  FLOOR_CHECKLIST_DATA, 
  FloorChecklistItem, 
  FloorChecklistContext,
  getVisibleFloors,
  calculateFloorInvestigationProgress,
  calculateOverallBuildingProgress 
} from '../data/floorChecklistData';
import { sound } from '../services/soundEngine';

interface FloorCompassModalProps {
  isOpen?: boolean;
  currentLocId?: string;
  context?: FloorChecklistContext;
  inventory?: string[];
  obtainedRules?: string[];
  isCctvRebooted?: boolean;
  discoveredHiddenTraces?: string[];
  inspectedHotspots?: string[];
  foundContradictions?: string[];
  investigationDay?: number;
  trait?: any;
  san?: number;
  completedWeek1?: boolean;
  onClose: () => void;
}

export const FloorCompassModal: React.FC<FloorCompassModalProps> = ({
  isOpen = true,
  currentLocId = 'loc_1f_lobby',
  context: propsContext,
  inventory = [],
  obtainedRules = [],
  isCctvRebooted = false,
  discoveredHiddenTraces = [],
  inspectedHotspots = [],
  foundContradictions = [],
  investigationDay = 1,
  trait = 'rationalist',
  san = 100,
  completedWeek1 = false,
  onClose
}) => {
  const isWeek1 = propsContext?.completedWeek1 !== undefined 
    ? !propsContext.completedWeek1 
    : !completedWeek1;

  // Build full context
  const context: FloorChecklistContext = propsContext || {
    inventory,
    obtainedRules,
    isCctvRebooted,
    discoveredHiddenTraces,
    inspectedHotspots,
    foundContradictions,
    investigationDay,
    trait,
    san,
    completedWeek1: !isWeek1
  };

  const visibleFloors = getVisibleFloors(context);

  // Determine current floor default
  const effectiveLocId = currentLocId || 'loc_1f_lobby';
  const getDefaultFloorId = (): string => {
    if (effectiveLocId.includes('5f') || effectiveLocId.includes('504') || effectiveLocId.includes('502')) return 'floor_5f';
    if (!isWeek1) {
      if (effectiveLocId.includes('2f')) return 'floor_2f';
      if (effectiveLocId.includes('3f')) return 'floor_3f';
      if (effectiveLocId.includes('4f') || effectiveLocId.includes('404')) return 'floor_4f';
    }
    return 'floor_1f';
  };

  const defaultFloor = getDefaultFloorId();
  const initialFloorId = visibleFloors.some(f => f.floorId === defaultFloor)
    ? defaultFloor
    : (visibleFloors[0]?.floorId || 'floor_1f');

  const [selectedFloorId, setSelectedFloorId] = useState<string>(initialFloorId);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const overallProgress = calculateOverallBuildingProgress(context);
  const currentFloor = visibleFloors.find(f => f.floorId === selectedFloorId) || visibleFloors[0] || FLOOR_CHECKLIST_DATA[0];
  const floorProgress = calculateFloorInvestigationProgress(currentFloor, context);

  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-1 sm:p-3 md:p-5 lg:p-6 select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="retro-forum-modal-window w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl h-[96dvh] sm:h-[90vh] lg:h-[88vh] max-h-[96dvh] lg:max-h-[860px] xl:max-h-[920px] flex flex-col shadow-2xl overflow-hidden text-[#1a2e18]"
      >
        {/* Header */}
        <div className="retro-forum-modal-header px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between border-b-2 border-[#1c3819] shrink-0 gap-2 select-none">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-base text-[#a3e635]">🧭</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-wide truncate font-mono">
                  [{isWeek1 ? '委託搜查羅盤' : '大樓勘驗羅盤'}]
                  <span className="hidden sm:inline font-normal text-xs text-[#cfebd0] ml-1.5">
                    {isWeek1 ? '// ROUND 1 INVESTIGATION' : '// BUILDING COMPASS'}
                  </span>
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#173a14] text-[#a3e635] border border-[#a3e635] shrink-0">
                  {isWeek1 ? '委託搜救' : '全棟探索'} {overallProgress.percentage}% ({overallProgress.completed}/{overallProgress.total})
                </span>
                {isWeek1 && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#2d5c28] text-white border border-[#52944a] shrink-0">
                    目標：搜查現場・救出張浩
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#cfebd0] mt-0.5 truncate hidden xs:block">
                {isWeek1 
                  ? '【第一輪：常態探案】搜查一樓大廳管理處與五樓失蹤現場，掌握關鍵線索直至救出張浩。'
                  : '【二周目：深層探索】盤點各樓層尚未解明的異常疑點與已掌握的物證紀錄。'
                }
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-[11px] font-mono font-bold text-[#fef08a] hover:text-white px-2 py-0.5 bg-[#1a3818] border border-[#a3e635]/60 hover:bg-[#2b5828] cursor-pointer shrink-0"
            title="關閉"
          >
            [關閉 X]
          </button>
        </div>

        {/* Main Grid: Floors Tabs (Left/Top) + Floor Details (Right) */}
        <div className="flex flex-col md:grid md:grid-cols-12 flex-1 overflow-hidden min-h-0 bg-[#f4f8f3]">
          {/* Left Floor Selector List */}
          <div className="md:col-span-4 lg:col-span-4 border-b md:border-b-0 md:border-r border-[#7ca078] p-2 sm:p-3 overflow-x-auto md:overflow-y-auto bg-[#eaf2e8] custom-scrollbar shrink-0 max-md:max-h-[120px] sm:max-md:max-h-[140px] flex md:flex-col gap-1.5 sm:gap-2">
            <div className="hidden md:block text-[11px] font-bold text-[#234520] border-b border-[#a8c9a5] pb-1 font-mono">
              [樓層索引分區表]
            </div>
            {visibleFloors.map((floor) => {
              const progress = calculateFloorInvestigationProgress(floor, context);
              const isSelected = floor.floorId === selectedFloorId;
              const isCurrentPlayerFloor = (
                (currentLocId.includes('1f') && floor.floorCode === '1F') ||
                (currentLocId.includes('2f') && floor.floorCode === '2F') ||
                (currentLocId.includes('3f') && floor.floorCode === '3F') ||
                ((currentLocId.includes('4f') || currentLocId.includes('404')) && floor.floorCode === '4F') ||
                ((currentLocId.includes('5f') || currentLocId.includes('504') || currentLocId.includes('502')) && floor.floorCode === '5F')
              );

              return (
                <button
                  key={floor.floorId}
                  onClick={() => {
                    sound.playClick();
                    setSelectedFloorId(floor.floorId);
                    setExpandedItemId(null);
                  }}
                  className={`p-2 border text-left transition-all relative flex flex-col justify-center gap-1 shrink-0 max-md:min-w-[170px] max-md:max-w-[220px] cursor-pointer shadow-sm ${
                    isSelected
                      ? 'bg-white border-[#1c3819] text-[#1c3819] font-bold ring-1 ring-[#1c3819]'
                      : 'bg-[#f7faf6] border-[#a8c9a5] text-[#3e5e3a] hover:bg-white hover:border-[#1c3819]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.2 font-mono font-bold text-[11px] border ${
                        isSelected 
                          ? 'bg-[#1c3819] text-white border-[#1c3819]' 
                          : 'bg-[#e0ede0] text-[#2b5828] border-[#a8c9a5]'
                      }`}>
                        {floor.floorCode}
                      </span>
                      <span className="font-bold text-xs truncate">
                        {floor.floorName.split('與')[0]}
                      </span>
                    </div>

                    {isCurrentPlayerFloor && (
                      <span className="flex items-center gap-0.5 text-[9px] font-mono text-[#1c4718] bg-[#d8edd4] px-1 py-0.2 border border-[#7ca078] shrink-0 font-bold">
                        <MapPin className="w-2.5 h-2.5 text-[#2b5828]" />
                        <span>當前</span>
                      </span>
                    )}
                  </div>

                  {/* Floor Progress Bar */}
                  <div className="w-full bg-[#d5e5d3] h-1.5 border border-[#a8c9a5] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        progress.isAllCompleted
                          ? 'bg-[#2b5828]'
                          : progress.percentage > 0
                          ? 'bg-[#4a8a44]'
                          : 'bg-[#b0c7af]'
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#587854]">
                    <span>進度 {progress.completed}/{progress.total}</span>
                    {progress.isAllCompleted && (
                      <span className="text-[#1c4718] flex items-center gap-0.5 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-[#2b5828]" />
                        <span>完全掌握</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Checklist & Details Column */}
          <div className="md:col-span-8 lg:col-span-8 bg-[#f4f8f3] p-3 sm:p-5 flex flex-col justify-between overflow-y-auto custom-scrollbar flex-1 min-h-0">
            <div className="space-y-3.5">
              {/* Current Floor Banner */}
              <div className="border-b-2 border-[#a8c9a5] pb-2.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#1c3819]">
                    【{currentFloor.floorName}】
                  </h4>
                  <p className="text-xs text-[#456942] mt-0.5">
                    {currentFloor.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#1c4718] bg-[#d8edd4] px-2 py-0.5 border border-[#7ca078]">
                    樓層掌握度 {floorProgress.percentage}%
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {currentFloor.checklist.map((item) => {
                  const completed = item.isCompleted(context);
                  const isExpanded = expandedItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`border transition-all overflow-hidden shadow-sm ${
                        completed
                          ? 'bg-[#f0f7ef] border-[#7ca078]'
                          : 'bg-white border-[#b0c7af] hover:border-[#4a8a44]'
                      }`}
                    >
                      <button
                        onClick={() => {
                          sound.playPaper();
                          setExpandedItemId(isExpanded ? null : item.id);
                        }}
                        className="w-full p-2.5 text-left flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#2b7524] shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#859f82] shrink-0" />
                          )}
                          <span className={`text-xs sm:text-sm font-bold truncate ${
                            completed ? 'text-[#385e35] line-through opacity-85' : 'text-[#1a2e18]'
                          }`}>
                            {item.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] px-1.5 py-0.2 font-mono border font-bold ${
                            completed 
                              ? 'bg-[#d8edd4] text-[#1c4718] border-[#2b5828]'
                              : 'bg-[#f4f8f3] text-[#557852] border-[#a8c9a5]'
                          }`}>
                            {completed ? '已調查' : '未解明'}
                          </span>
                          <ChevronRight className={`w-3.5 h-3.5 text-[#557852] transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-3 pb-2.5 pt-1 border-t border-[#d5e5d3] bg-[#fbfdfa] text-xs flex flex-col gap-1"
                          >
                            {completed ? (
                              <div className="flex items-start gap-1.5 text-[#1c4718]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#2b7524] shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-[#1c4718]">調查結案紀錄：</strong>
                                  <span className="text-[#2c4728]">{item.completedSummary}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-1.5 text-[#42613f]">
                                <FileQuestion className="w-3.5 h-3.5 text-[#638760] shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-[#1c4718]">環境感知：</strong>
                                  <span className="text-[#456142]">{item.ambientClue}</span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#a8c9a5] text-[11px] text-[#587854] flex items-center justify-between mt-3">
              <span className="font-mono text-[10px]">
                {isWeek1 ? 'ROUND 1 INVESTIGATION // RESCUE TARGET STATUS' : 'BUILDING INVESTIGATION // OBJECTIVE STATUS COMPASS'}
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="retro-web-btn px-3 py-1 text-xs font-bold"
              >
                關閉羅盤
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
