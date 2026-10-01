import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  X,
  Key,
  FileQuestion,
  Map,
  CreditCard,
  Mic,
  Sparkles,
  CheckCircle2,
  FileText,
  Search,
  Play,
  Disc,
  ShieldCheck,
  BookOpen,
  Settings,
  Layers,
  Zap,
  Lock,
  Unlock,
  KeyRound,
  Mail,
  EyeOff
} from 'lucide-react';
import { InventoryItem, ItemInvestigationStep } from '../types';
import { INVENTORY_ITEMS } from '../data/rulesData';
import { sound } from '../services/soundEngine';
import { safeStorageGetJSON, safeStorageSetJSON } from '../services/storageHelper';
import { AudioTapePlayerModal } from './AudioTapePlayerModal';
import { VintageEnvelopeModal, VintageEnvelopeData } from './VintageEnvelopeModal';
import { VINTAGE_ENVELOPES } from '../data/envelopeData';
import { InteractiveEvidenceInspector } from './InteractiveEvidenceInspector';

interface DossierModalProps {
  inventory: string[];
  playerName?: string;
  san?: number;
  onClose: () => void;
  onOpenLetterPuzzle?: () => void;
  isGameEnded?: boolean;
  onModifySan?: (delta: number) => void;
  onConsumeContradictionNote?: () => boolean;
  onConsumeItem?: (itemId: string) => boolean | void;
  completedWeek1?: boolean;
  onAddJournalEntry?: (entry: {
    category: 'system' | 'action' | 'dialogue';
    title: string;
    content: string;
    location?: string;
    sanDelta?: number;
    highlightBadge?: string;
  }) => void;
}

const STORAGE_INVESTIGATION_KEY = 'ROOM_404_ITEM_INVESTIGATION_PROGRESS_V1';
const STORAGE_DOSSIER_UNLOCKED_KEY = 'ROOM_404_DOSSIER_UNLOCKED_ITEMS_V1';

export const DossierModal: React.FC<DossierModalProps> = ({
  inventory,
  playerName = '',
  san = 100,
  onClose,
  onOpenLetterPuzzle,
  isGameEnded = false,
  onModifySan,
  onConsumeContradictionNote,
  onConsumeItem,
  completedWeek1 = false,
  onAddJournalEntry
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    inventory.length > 0 ? inventory[0] : null
  );

  // Investigation progress state mapping: itemId -> completed step index
  const [investigationProgress, setInvestigationProgress] = useState<Record<string, number>>(() => {
    return safeStorageGetJSON<Record<string, number>>(STORAGE_INVESTIGATION_KEY, {});
  });

  // Dossier unlock state mapping: unlocked item IDs
  const [unlockedDossierIds, setUnlockedDossierIds] = useState<string[]>(() => {
    return safeStorageGetJSON<string[]>(STORAGE_DOSSIER_UNLOCKED_KEY, []);
  });

  // Audio tape player modal state
  const [showAudioPlayerModal, setShowAudioPlayerModal] = useState<boolean>(false);

  // Vintage envelope opening modal state
  const [activeEnvelope, setActiveEnvelope] = useState<VintageEnvelopeData | null>(null);

  const totalItemsCount = Object.keys(INVENTORY_ITEMS).length;

  // Persist investigation progress
  useEffect(() => {
    safeStorageSetJSON(STORAGE_INVESTIGATION_KEY, investigationProgress);
  }, [investigationProgress]);

  // Persist dossier unlocked items
  useEffect(() => {
    safeStorageSetJSON(STORAGE_DOSSIER_UNLOCKED_KEY, unlockedDossierIds);
  }, [unlockedDossierIds]);

  // Sync selected item when inventory changes
  useEffect(() => {
    if (inventory.length > 0) {
      if (!selectedItemId || !inventory.includes(selectedItemId)) {
        setSelectedItemId(inventory[0]);
      }
    } else {
      setSelectedItemId(null);
    }
  }, [inventory, selectedItemId]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Key': return <Key className="w-4 h-4 text-amber-400" />;
      case 'FileQuestion': return <FileQuestion className="w-4 h-4 text-rose-400" />;
      case 'Map': return <Map className="w-4 h-4 text-indigo-400" />;
      case 'CreditCard': return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'Mic': return <Mic className="w-4 h-4 text-cyan-400" />;
      case 'FileText': return <FileText className="w-4 h-4 text-amber-300" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'Disc': return <Disc className="w-4 h-4 text-purple-400" />;
      case 'Settings': return <Settings className="w-4 h-4 text-orange-400" />;
      case 'Layers': return <Layers className="w-4 h-4 text-teal-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-yellow-400" />;
      default: return <Briefcase className="w-4 h-4 text-neutral-400" />;
    }
  };

  const handleSelectItem = (id: string) => {
    sound.playPaper();
    setSelectedItemId(id);
  };

  const rawItem: InventoryItem | undefined = selectedItemId ? INVENTORY_ITEMS[selectedItemId] : undefined;

  const isItemLocked = (item?: InventoryItem) => {
    if (!item?.lockRequirement) return false;
    return !unlockedDossierIds.includes(item.id);
  };

  // Unlock action
  const handleUnlockItem = (item: InventoryItem) => {
    if (!item.lockRequirement) return;
    const req = item.lockRequirement;
    if (req.requiredItemId && !inventory.includes(req.requiredItemId)) return;

    sound.playSwitch();
    sound.playChime();

    setUnlockedDossierIds(prev => [...prev, item.id]);

    onAddJournalEntry?.({
      category: 'action',
      title: `成功解密證物檔案：【${item.name}】`,
      content: `${req.unlockSuccessText || `使用【${req.requiredItemName || '對應道具'}】成功解鎖了該證物檔案！`}\n★ 檔案已解除封存，可展開完整內容進行深度剖析。`,
      highlightBadge: '檔案解密'
    });
  };

  // Derive dynamic item state based on investigation steps completed
  const currentStepCount = selectedItemId ? (investigationProgress[selectedItemId] || 0) : 0;
  const currentSteps = rawItem?.investigationSteps || [];
  const latestCompletedStep: ItemInvestigationStep | undefined = currentStepCount > 0 ? currentSteps[currentStepCount - 1] : undefined;

  const displayedItemName = latestCompletedStep?.updatedName || rawItem?.name || '';
  const displayedItemDesc = (!completedWeek1 && rawItem?.week1Description)
    ? rawItem.week1Description
    : (latestCompletedStep?.updatedDesc || rawItem?.description || '');
  const displayedItemDetail = (!completedWeek1 && rawItem?.week1Detail)
    ? rawItem.week1Detail
    : (latestCompletedStep?.updatedDetail || rawItem?.detail || '');

  const nextStepToExecute: ItemInvestigationStep | undefined = currentSteps[currentStepCount];

  // Perform an investigation step
  const handlePerformInvestigationStep = (step: ItemInvestigationStep) => {
    if (!selectedItemId) return;

    sound.playPaper();
    if (step.isAudioPlayback) {
      sound.playClick();
      setShowAudioPlayerModal(true);
    } else {
      sound.playSwitch();
    }

    const nextCount = currentStepCount + 1;
    setInvestigationProgress(prev => ({
      ...prev,
      [selectedItemId]: nextCount
    }));

    if (step.sanDelta && step.sanDelta !== 0) {
      onModifySan?.(step.sanDelta);
    }

    onAddJournalEntry?.({
      category: 'action',
      title: `深入調查物證：【${step.updatedName || rawItem?.name}】`,
      content: `在隨身物證檔案中進行深入調查：${step.actionLabel || step.label}\n★ 調查發現：${step.resultText || step.actionText}${step.clueInsight ? `\n★ 關鍵線索：${step.clueInsight}` : ''}`,
      sanDelta: step.sanDelta
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-1.5 sm:p-3 md:p-5 lg:p-6 select-none font-sans">
        <motion.div 
          initial={{ scale: 0.98, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.98, opacity: 0, y: 8 }}
          className="retro-forum-modal-window rounded-none w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl h-[95dvh] sm:h-[90vh] lg:h-[88vh] max-h-[95dvh] lg:max-h-[860px] xl:max-h-[920px] flex flex-col overflow-hidden text-[#333333]"
        >
          {/* Header - 2000s Portal Forum Style */}
          <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 retro-forum-modal-header shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-1 sm:p-1.5 rounded-xs bg-[#ffffff]/20 border border-[#ffffff]/40 text-[#ffffff] shrink-0">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#ffffff] tracking-wide truncate">
                    隨身物證檔案袋與現場搜查實物
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-xs bg-[#ffffff]/20 text-[#f0f9ee] border border-[#ffffff]/40 shrink-0">
                    證物 {inventory.length} 件
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#d8ecd2] mt-0.5 truncate hidden xs:block">
                  PHYSICAL EVIDENCE BAG // SPECIMEN ARCHIVE [NO.88 ANHSIANG]
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1 sm:p-1.5 rounded-xs border border-[#ffffff]/40 text-[#ffffff] hover:bg-[#ffffff]/20 transition-colors cursor-pointer min-h-[30px] min-w-[30px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center shrink-0 ml-2"
              title="關閉"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col md:grid md:grid-cols-12 flex-1 overflow-hidden min-h-0 bg-[#ffffff]">
            {/* Left/Top Inventory Items List (Horizontal on mobile, vertical on desktop) */}
            <div className="md:col-span-4 lg:col-span-4 border-b md:border-b-0 md:border-r border-[#7ca078] p-2 sm:p-3 overflow-x-auto md:overflow-y-auto bg-[#edf4ec] custom-scrollbar shrink-0 max-md:max-h-[110px] sm:max-md:max-h-[130px] flex md:flex-col gap-1.5 sm:gap-2">
              <div className="text-[11px] font-bold text-[#1c3819] px-1 mb-1 hidden md:flex items-center justify-between border-b border-[#a8c2a1] pb-1">
                <span>【證物袋清單 ({inventory.length})】</span>
                {isGameEnded && (
                  <span className="text-[10px] text-[#4d6645] font-normal">
                    {inventory.length} / {totalItemsCount}
                  </span>
                )}
              </div>

              {inventory.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#556652] leading-relaxed bg-[#ffffff] border border-dashed border-[#a8c2a1] w-full">
                  檔案袋內尚無物證。
                  <br />
                  請在大樓各處搜查關鍵物件。
                </div>
              ) : (
                inventory.map((itemId) => {
                  const item = INVENTORY_ITEMS[itemId];
                  if (!item) return null;
                  const isSelected = selectedItemId === itemId;
                  const progress = investigationProgress[itemId] || 0;
                  const itemSteps = item.investigationSteps || [];
                  const isInvestigated = progress > 0;
                  const currentDisplayName = (isInvestigated && itemSteps[progress - 1]?.updatedName) || item.name;
                  const hasMoreToInvestigate = progress < itemSteps.length;
                  const isLocked = isItemLocked(item);

                  return (
                    <button
                      key={itemId}
                      onClick={() => handleSelectItem(itemId)}
                      className={`min-h-[44px] text-left p-2 sm:p-2.5 border transition-all text-xs flex items-center gap-2 sm:gap-2.5 shrink-0 max-md:min-w-[155px] max-md:max-w-[210px] cursor-pointer ${
                        isSelected
                          ? 'bg-[#ffffff] border-[#1c3819] text-[#1c3819] shadow-sm font-bold ring-1 ring-[#1c3819]'
                          : 'bg-[#f6faf5] border-[#b0cead] text-[#2c4728] hover:bg-[#ffffff] hover:border-[#7ca078]'
                      }`}
                    >
                      <div className={`p-1 sm:p-1.5 border shrink-0 ${
                        isSelected 
                          ? 'bg-[#eaf2e8] border-[#1c3819] text-[#1c3819]' 
                          : 'bg-[#ffffff] border-[#c0d6bd] text-[#556e52]'
                      }`}>
                        {isLocked ? (
                          <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#854d0e]" />
                        ) : (
                          getIcon(item.iconName)
                        )}
                      </div>

                      <div className="overflow-hidden flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[#1c3819] truncate">
                            {currentDisplayName}
                          </span>
                          {isLocked ? (
                            <span className="text-[9px] px-1 sm:px-1.5 py-0.2 bg-[#fefce8] border border-[#fde047] text-[#854d0e] font-mono shrink-0 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> 鎖定
                            </span>
                          ) : hasMoreToInvestigate ? (
                            <span className="text-[9px] px-1 sm:px-1.5 py-0.2 bg-[#fff8e6] border border-[#e0c47e] text-[#855800] font-mono shrink-0 animate-pulse font-bold">
                              鑑識
                            </span>
                          ) : itemSteps.length > 0 ? (
                            <span className="text-[9px] px-1 sm:px-1.5 py-0.2 bg-[#eef7ec] border border-[#a8cda0] text-[#2b5420] font-mono shrink-0 font-bold">
                              已結
                            </span>
                          ) : null}
                          {san < 35 && item.hallucinationWhisper && (
                            <span className="text-[8px] px-1 py-0.2 bg-[#fee2e2] border border-[#f87171] text-[#991b1b] font-mono shrink-0 animate-pulse font-bold">
                              扭曲
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#556e52] truncate mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Right Item Details Area */}
            <div className="md:col-span-8 lg:col-span-8 p-3 sm:p-5 md:p-6 overflow-y-auto space-y-3 sm:space-y-4 bg-[#f4f8f3] custom-scrollbar flex-1 flex flex-col justify-between min-h-0">
              {rawItem ? (
                isItemLocked(rawItem) ? (
                  /* Locked Dossier Content View */
                  <div className="space-y-3.5">
                    {/* Locked Header */}
                    <div className="flex items-start justify-between gap-4 border-b-2 border-[#a8c2a1] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#fefce8] border border-[#fde047] shadow-sm text-[#854d0e]">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base md:text-lg font-bold text-[#1c3819]">
                              {rawItem.name}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 bg-[#fef2f2] border border-[#f87171] text-[#991b1b] font-mono font-bold">
                              RESTRICTED
                            </span>
                          </div>
                          <p className="text-xs text-[#556e52] mt-0.5">
                            {rawItem.description}
                          </p>
                        </div>
                      </div>

                      {rawItem.isKeyClue && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#fff8e6] border border-[#e0c47e] text-[#855800] font-mono font-bold">
                          KEY CLUE
                        </span>
                      )}
                    </div>

                    {/* Lock Container Box */}
                    <div className="p-4 bg-white border border-[#7ca078] text-[#1a2e18] shadow-sm space-y-3">
                      <div className="flex items-center gap-2 text-[#854d0e] font-bold text-sm border-b border-[#e2edd9] pb-2">
                        <KeyRound className="w-4 h-4 text-[#854d0e]" />
                        <span>{rawItem.lockRequirement?.lockTitle || '【證物檔案鎖定】'}</span>
                      </div>

                      <div className="text-xs text-[#2c4728] leading-relaxed space-y-2">
                        <p>{rawItem.lockRequirement?.lockDescription || '此證物設有特殊物理鎖扣或防護，需要取得對應工具/鑰匙方可解鎖。'}</p>
                        
                        {rawItem.lockRequirement?.unlockHint && (
                          <div className="p-2.5 bg-[#f6faf5] border border-[#c0d6bd] text-[11px] text-[#3d5e34] font-mono">
                            <span className="text-[#1c3819] font-bold">【偵探搜查線索】：</span>
                            {rawItem.lockRequirement.unlockHint}
                          </div>
                        )}
                      </div>

                      {/* Unlock Condition Button */}
                      {(() => {
                        const req = rawItem.lockRequirement;
                        const hasRequiredItem = !req?.requiredItemId || inventory.includes(req.requiredItemId);

                        return (
                          <div className="pt-2">
                            {hasRequiredItem ? (
                              <button
                                onClick={() => handleUnlockItem(rawItem)}
                                className="retro-web-btn w-full py-2 px-4 text-xs md:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer bg-[#1c3819] text-white border-[#1c3819] hover:bg-[#2b5828]"
                              >
                                <Unlock className="w-4 h-4" />
                                <span>使用【{req?.requiredItemName || '對應鑰匙'}】解除檔案鎖定</span>
                              </button>
                            ) : (
                              <div className="p-2.5 bg-[#f6faf5] border border-[#c0d6bd] text-[#556e52] text-xs flex items-center justify-center gap-2 font-mono">
                                <Lock className="w-4 h-4 text-[#778872]" />
                                <span>未持有【{req?.requiredItemName || '指定解鎖鑰匙'}】・無法查閱檔案內容</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  /* Unlocked Regular Dossier View */
                  <div className="space-y-3.5">
                    {/* Item Header */}
                    <div className="flex items-start justify-between gap-4 border-b-2 border-[#a8c2a1] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white border border-[#7ca078] shadow-xs text-[#1c3819]">
                          {getIcon(rawItem.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base md:text-lg font-bold text-[#1c3819]">
                              {displayedItemName}
                            </h4>
                            {currentStepCount > 0 ? (
                              <span className="text-[10px] px-2 py-0.5 bg-[#eef7ec] border border-[#a8cda0] text-[#2b5420] font-mono font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                二度鑑識完成
                              </span>
                            ) : rawItem.actionText || nextStepToExecute ? (
                              <span className="text-[10px] px-2 py-0.5 bg-[#fff8e6] border border-[#e0c47e] text-[#855800] font-mono font-bold flex items-center gap-1 animate-pulse">
                                <Search className="w-3 h-3 text-[#855800]" />
                                可進行二度鑑識
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-[#556e52] mt-0.5">
                            {displayedItemDesc}
                          </p>
                        </div>
                      </div>

                      {rawItem.isKeyClue && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#fff8e6] border border-[#e0c47e] text-[#855800] font-mono font-bold">
                          KEY EVIDENCE
                        </span>
                      )}
                    </div>

                    {/* Detective Observations */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-[#3d5e34] uppercase tracking-wider font-mono flex items-center justify-between">
                        <span>偵探觀察手記與物理物證詳情：</span>
                        <span>INVESTIGATION LOG</span>
                      </div>
                      <div className="p-3.5 bg-white border border-[#7ca078] text-xs md:text-sm text-[#1a2e18] leading-relaxed shadow-sm space-y-2">
                        <p>{displayedItemDetail}</p>
                        
                        {/* Deep Inspection Revealed Details */}
                        {currentStepCount > 0 && (rawItem.inspectDesc || latestCompletedStep?.resultText) && (
                          <div className="mt-2.5 p-2.5 bg-[#eef7ec] border border-[#a8cda0] text-xs text-[#2b5420] flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-[#2b5420] shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-bold font-mono text-[#1c3819]">【二度鑑識結果】：</span>
                              <p className="text-[#2b5420] leading-relaxed">{rawItem.inspectDesc || latestCompletedStep?.resultText}</p>
                            </div>
                          </div>
                        )}

                        {latestCompletedStep?.clueInsight && (
                          <div className="mt-2 p-2.5 bg-[#fff8e6] border border-[#e0c47e] text-xs text-[#855800] flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-[#855800] shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold font-mono">【核心線索推論】：</span>
                              {latestCompletedStep.clueInsight}
                            </div>
                          </div>
                        )}

                        {/* Low SAN Cognitive Distortion Whisper (< 35) */}
                        {san < 35 && rawItem.hallucinationWhisper && (
                          <motion.div 
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2.5 p-3 bg-[#fef2f2] border border-[#f87171] text-xs leading-relaxed relative overflow-hidden"
                          >
                            <div className="flex items-center gap-1.5 text-[#991b1b] font-bold text-[11px] font-mono mb-1">
                              <EyeOff className="w-3.5 h-3.5 animate-pulse text-[#dc2626]" />
                              <span className="tracking-wider">【理智侵蝕・認知扭曲】：</span>
                              <span className="text-[9px] px-1.5 py-0.2 bg-[#fee2e2] text-[#991b1b] border border-[#f87171] ml-auto font-mono">
                                SAN {san}
                              </span>
                            </div>
                            <p className="text-[#7f1d1d] italic pl-2 border-l-2 border-[#f87171]">
                              {rawItem.hallucinationWhisper}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Multi-stage Interactive Investigation / Deep Inspection Options */}
                    {nextStepToExecute && (
                      <div className="space-y-2.5 pt-1">
                        <InteractiveEvidenceInspector
                          itemId={rawItem.id}
                          itemName={rawItem.name}
                          step={nextStepToExecute}
                          onComplete={() => handlePerformInvestigationStep(nextStepToExecute)}
                        />
                      </div>
                    )}

                    {/* Dedicated Tape Recorder Player Entry Button */}
                    {rawItem.id === 'tape_recorder' && (
                      <div className="p-3.5 bg-white border border-[#0284c7] space-y-2.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#0369a1] font-bold text-xs">
                            <Disc className="w-4 h-4 text-[#0284c7] animate-spin" />
                            <span>張浩遺留的微型語音日誌磁帶模組</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#0284c7] bg-[#f0f9ff] px-2 py-0.5 border border-[#bae6fd]">
                            MICRO-CASSETTE
                          </span>
                        </div>
                        <p className="text-xs text-[#334155] leading-relaxed">
                          重現1990年代微型卡式磁帶機運轉、磁帶雜音與張浩失蹤前的最後調查口述錄音。
                        </p>
                        <button
                          onClick={() => {
                            sound.playSwitch();
                            setShowAudioPlayerModal(true);
                          }}
                          className="retro-web-btn w-full py-2 text-xs md:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer bg-[#0284c7] text-white border-[#0369a1] hover:bg-[#0369a1]"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>開啟【張浩語音日誌・微型磁帶播放器】</span>
                        </button>
                      </div>
                    )}

                    {/* Consumable Recovery Item Action Button */}
                    {rawItem.isConsumable && (
                      <div className="p-3 bg-[#f6faf5] border border-[#a8c2a1] space-y-2 mt-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#1c3819]">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#2e6d24]" />
                            <span>【隨身物資使用】</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#2e6d24] bg-[#eef7ec] px-1.5 py-0.5 border border-[#a8cda0]">
                            {completedWeek1 ? (rawItem.recoveryGrade === 'significant' ? '大幅穩定精神 (+25 SAN)' : rawItem.recoveryGrade === 'moderate' ? '小幅穩定精神 (+15 SAN)' : '稍微穩定精神 (+10 SAN)') : '隨身物資'}
                          </span>
                        </div>
                        <p className="text-xs text-[#445542] leading-relaxed">
                          {completedWeek1 
                            ? `在安全區或安靜處使用此物資，可${rawItem.recoveryGrade === 'significant' ? '大幅穩定精神 (+25 SAN)' : rawItem.recoveryGrade === 'moderate' ? '小幅穩定精神 (+15 SAN)' : '稍微穩定精神 (+10 SAN)'}。`
                            : '隨身攜帶的提神與應急乾糧，可食用以緩解疲憊、振奮精神。'}
                        </p>
                        <button
                          onClick={() => {
                            onConsumeItem?.(rawItem.id);
                            setSelectedItemId(inventory.find(id => id !== rawItem.id) || null);
                          }}
                          className="retro-web-btn w-full py-2 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer bg-[#2e6d24] text-white border-[#1c3819] hover:bg-[#3d8331]"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>
                            {completedWeek1 
                              ? `【立即使用】回復 +${rawItem.recoverySanAmount || 10} SAN` 
                              : `【立即使用】食用 / 使用此物資`}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Vintage Envelope Unseal Inspection Button */}
                    {VINTAGE_ENVELOPES[rawItem.id] && (
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            sound.playPaper();
                            setActiveEnvelope(VINTAGE_ENVELOPES[rawItem.id]);
                          }}
                          className="retro-web-btn w-full py-2 text-xs md:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer bg-[#eef7ec] text-[#1c3819] border-[#1c3819] hover:bg-[#d8edd4]"
                        >
                          <Mail className="w-4 h-4" />
                          <span>✉️ 拆開舊信封・檢視泛黃手書原件 (UNSEAL ENVELOPE)</span>
                        </button>
                      </div>
                    )}

                    {/* Special Action: Letter Puzzle trigger if item is letter */}
                    {rawItem.id === 'shredded_letter' && onOpenLetterPuzzle && (
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            sound.playPaper();
                            onOpenLetterPuzzle();
                          }}
                          className="retro-web-btn w-full py-2 text-xs md:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer bg-white text-[#1c3819] border-[#7ca078] hover:bg-[#f4f8f3]"
                        >
                          <Sparkles className="w-4 h-4 text-[#854d0e]" />
                          展開【碎紙信件手動拼圖桌】
                        </button>
                      </div>
                    )}

                    {/* Special Action: Contradiction Deduction Note Usage */}
                    {rawItem.id === 'contradiction_deduction_note' && (
                      <div className="pt-2 space-y-2">
                        {san < 30 ? (
                          <button
                            onClick={() => {
                              if (onConsumeContradictionNote) {
                                onConsumeContradictionNote();
                              }
                            }}
                            className="retro-web-btn w-full py-2 text-xs md:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer bg-[#1c3819] text-white border-[#1c3819] hover:bg-[#2b5828] animate-pulse"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#a3e635]" />
                            <span>研讀破綻手稿・平復心神穩固理智</span>
                          </button>
                        ) : (
                          <div className="p-2.5 bg-[#f6faf5] border border-[#c0d6bd] text-[11px] text-[#3d5e34] flex items-center gap-2 font-mono">
                            <ShieldCheck className="w-4 h-4 text-[#854d0e] shrink-0" />
                            <span>當前心智狀態尚稱穩定，手稿請留待意識危急或陷入崩潰邊緣時使用。</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#556652] space-y-2 py-16">
                  <Briefcase className="w-12 h-12 stroke-[1.2] opacity-40 text-[#7ca078]" />
                  <p className="text-xs">請在清單中選擇一項物證以檢視細節</p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-[#7ca078] text-[11px] text-[#385e35] flex items-center justify-between mt-3">
                <span className="font-mono text-[10px]">PHYSICAL EVIDENCE // INVESTIGATION ARCHIVE</span>
                <button
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="retro-web-btn px-3 py-1 text-xs cursor-pointer"
                >
                  關閉檔案袋
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pop-up Audio Tape Player Modal */}
      {showAudioPlayerModal && (
        <AudioTapePlayerModal
          playerName={playerName}
          onClose={() => setShowAudioPlayerModal(false)}
          onModifySan={onModifySan}
          onAddJournalEntry={onAddJournalEntry}
        />
      )}

      {/* Pop-up Vintage Envelope Modal */}
      {activeEnvelope && (
        <VintageEnvelopeModal
          envelope={activeEnvelope}
          onClose={() => setActiveEnvelope(null)}
        />
      )}
    </>
  );
};
