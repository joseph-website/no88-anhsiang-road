import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderKanban,
  Save,
  Play,
  Trash2,
  X,
  Clock,
  Shield,
  FileText,
  CheckCircle2,
  AlertCircle,
  Archive,
  QrCode,
  Key,
  Copy,
  Upload,
  Trophy,
  Lock,
  Newspaper,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import QRCode from 'qrcode';
import { SaveSlotId, SaveSlotInfo, SavedGameData, EndingId } from '../types';
import { 
  getManualSaveSlot,
  getAllEndingSaveSlots,
  getAllSaveSlots, 
  saveToSlot, 
  deleteSaveSlot, 
  loadSaveSlot,
  exportSaveToKey,
  importSaveFromKey,
  generateShareableURL
} from '../services/saveSystem';
import { ENDINGS_DATA } from '../data/rulesData';
import { ENDING_EPILOGUES } from '../data/epiloguesData';
import { CANONICAL_TO_SHORT_ENDING_ID } from '../utils/endingCalculator';
import { sound } from '../services/soundEngine';
import { EndingEpilogueModal } from './EndingEpilogueModal';

const ALL_CANONICAL_ENDINGS: EndingId[] = [
  'ending0',
  'ending1',
  'ending2',
  'ending3',
  'ending4',
  'ending5',
  'ending6',
  'ending7',
  'ending8'
];

interface SaveSlotModalProps {
  isOpen: boolean;
  mode: 'save' | 'load'; // 'save' (HUD 內手動存檔) | 'load' (讀取進度)
  currentGameState?: SavedGameData; // 當在遊戲內存檔時傳入
  unlockedEndings?: EndingId[];
  onClose: () => void;
  onSelectLoadSlot: (slotData: SavedGameData) => void;
  onSaveSuccess?: (slotId: SaveSlotId) => void;
  onResetAllProgress?: () => void;
}

export const SaveSlotModal: React.FC<SaveSlotModalProps> = ({
  isOpen,
  mode,
  currentGameState,
  unlockedEndings = [],
  onClose,
  onSelectLoadSlot,
  onSaveSuccess,
  onResetAllProgress
}) => {
  const [activeTab, setActiveTab] = useState<'slots' | 'export' | 'import'>('slots');
  const [manualSlot, setManualSlot] = useState<SaveSlotInfo>(getManualSaveSlot());
  const [endingSlots, setEndingSlots] = useState<SaveSlotInfo[]>(getAllEndingSaveSlots());
  const [deleteConfirmSlotId, setDeleteConfirmSlotId] = useState<SaveSlotId | null>(null);
  const [showWipeAllConfirm, setShowWipeAllConfirm] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Ending Epilogue Viewer State
  const [selectedEndingEpilogue, setSelectedEndingEpilogue] = useState<{ endingId: EndingId; data: SavedGameData | null } | null>(null);

  // Export State
  const [exportSlotId, setExportSlotId] = useState<SaveSlotId | 'current'>('current');
  const [exportedKey, setExportedKey] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isUrlCopied, setIsUrlCopied] = useState<boolean>(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Import State
  const [importKeyInput, setImportKeyInput] = useState<string>('');
  const [parsedImportData, setParsedImportData] = useState<SavedGameData | null>(null);
  const [targetImportSlotId, setTargetImportSlotId] = useState<SaveSlotId>('slot1');
  const [importError, setImportError] = useState<string | null>(null);

  // Refresh slots on open
  useEffect(() => {
    if (isOpen) {
      refreshSlots();
      setDeleteConfirmSlotId(null);
      setStatusMessage(null);
      setActiveTab('slots');
      setSelectedEndingEpilogue(null);
    }
  }, [isOpen, mode]);

  const refreshSlots = () => {
    setManualSlot(getManualSaveSlot());
    setEndingSlots(getAllEndingSaveSlots());
  };

  // Generate Export Data when switching to export tab or changing export slot
  useEffect(() => {
    if (activeTab === 'export') {
      let dataToExport: SavedGameData | null = null;
      if (exportSlotId === 'current' && currentGameState) {
        dataToExport = currentGameState;
      } else if (exportSlotId !== 'current') {
        dataToExport = loadSaveSlot(exportSlotId as SaveSlotId);
      }

      if (dataToExport) {
        const key = exportSaveToKey(dataToExport);
        setExportedKey(key);
        setIsCopied(false);
        setIsUrlCopied(false);

        // Render QR Code to Canvas
        if (qrCanvasRef.current && key) {
          const shareUrl = generateShareableURL(key);
          const payload = shareUrl.length <= 2000 ? shareUrl : key;
          QRCode.toCanvas(qrCanvasRef.current, payload, {
            width: 220,
            margin: 2,
            color: {
              dark: '#1c130b',
              light: '#f5ecd7'
            }
          }, (err) => {
            if (err) console.error('QR generation error:', err);
          });
        }
      } else {
        setExportedKey('');
      }
    }
  }, [activeTab, exportSlotId, currentGameState]);

  // Parse key when typed in Import tab
  useEffect(() => {
    if (!importKeyInput.trim()) {
      setParsedImportData(null);
      setImportError(null);
      return;
    }

    const data = importSaveFromKey(importKeyInput.trim());
    if (data) {
      setParsedImportData(data);
      setImportError(null);
    } else {
      setParsedImportData(null);
      setImportError('金鑰代碼或網址格式無效，請確認是否完整複製。');
    }
  }, [importKeyInput]);

  if (!isOpen) return null;

  // Handle Manual Save
  const handlePerformManualSave = () => {
    if (!currentGameState) return;

    sound.playPaper();
    const success = saveToSlot('slot1', currentGameState);
    if (success) {
      sound.playResolutionChord();
      refreshSlots();
      setStatusMessage({ text: '★ 進度已成功手動封存至【手動調查存檔】！', type: 'success' });
      if (onSaveSuccess) onSaveSuccess('slot1');
      setTimeout(() => {
        setStatusMessage(null);
      }, 3500);
    } else {
      sound.playGlitch();
      setStatusMessage({ text: '存檔寫入失敗，請確認瀏覽器儲存空間。', type: 'error' });
    }
  };

  // Handle Delete
  const handleConfirmDelete = (slotId: SaveSlotId) => {
    sound.playGlitch();
    deleteSaveSlot(slotId);
    setDeleteConfirmSlotId(null);
    refreshSlots();
    setStatusMessage({ text: '已成功清除指定存檔！', type: 'info' });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  // Handle Import Apply
  const handleApplyImport = () => {
    if (!parsedImportData) return;

    sound.playPaper();
    const success = saveToSlot(targetImportSlotId, parsedImportData);
    if (success) {
      sound.playResolutionChord();
      refreshSlots();
      setStatusMessage({ text: `進度已成功匯入！`, type: 'success' });
      setActiveTab('slots');
      setImportKeyInput('');
      setParsedImportData(null);
    } else {
      sound.playGlitch();
      setImportError('匯入失敗，無法寫入儲存區。');
    }
  };

  const getEndingBadgeColor = (type?: string) => {
    switch (type) {
      case 'true':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-700';
      case 'bad':
        return 'text-rose-400 bg-rose-950/80 border-rose-800';
      default:
        return 'text-amber-400 bg-amber-950/80 border-amber-800';
    }
  };

  // Calculate total unlocked endings count across slots & unlockedEndings prop
  const totalUnlockedEndingsCount = ALL_CANONICAL_ENDINGS.filter(
    eid => endingSlots.some(s => s.endingId === eid && s.data !== null) || (unlockedEndings && unlockedEndings.includes(eid))
  ).length;

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-1 sm:p-4 md:p-6 select-none font-serif">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#1c120a] border-[3px] border-[#5a381e] rounded-2xl max-w-5xl w-full h-[96dvh] sm:h-[90vh] max-h-[96dvh] sm:max-h-[820px] flex flex-col shadow-[0_15px_60px_rgba(0,0,0,0.9),inset_0_0_40px_rgba(0,0,0,0.8)] overflow-hidden text-[#e8dac1] ring-1 ring-[#8a572a]/40"
      >
        {/* Header - Top Wood Cornice */}
        <div className="flex items-center justify-between border-b-2 border-[#422613] px-4 sm:px-6 py-3 bg-gradient-to-b from-[#2a1a10] to-[#1c120a] shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#331d10] border border-[#694220] text-[#deb887] shadow-inner">
              <FolderKanban className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-bold font-serif text-[#fbe9c8] tracking-wider drop-shadow-sm">
                  {mode === 'save' ? '檔案典藏室・調查進度存檔書架' : '檔案典藏室・結案卷宗後日談書櫃'}
                </h3>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-[#24170e] hover:bg-[#382416] border border-[#4d321d] text-[#9c846a] hover:text-[#f5ebd7] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Clearance Stamps Ribbon (進度檔案庫上方淡淡的小鋼印圖案) */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#170f09] border-b border-[#382516] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-[#deb887] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>【結案通關印記】</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300 font-bold">
              已封存 {totalUnlockedEndingsCount} / 9 結局
            </span>
          </div>

          {/* 9 Ending Mini Stamp Badges (淡淡的小鋼印) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {ALL_CANONICAL_ENDINGS.map((eid) => {
              const shortId = CANONICAL_TO_SHORT_ENDING_ID[eid] || eid;
              const isSlotUnlocked = endingSlots.some(s => s.endingId === eid && s.data !== null) || (unlockedEndings && unlockedEndings.includes(eid));
              return (
                <div
                  key={`top-stamp-${eid}`}
                  title={isSlotUnlocked ? `${shortId} 已達成並封存印記` : `${shortId} 尚未解明`}
                  className={`px-2 py-0.5 rounded border text-[10px] font-mono flex items-center gap-1 transition-all whitespace-nowrap select-none ${
                    isSlotUnlocked
                      ? 'border-red-600/70 bg-red-950/50 text-red-300 shadow-[0_0_8px_rgba(220,38,38,0.25)] font-bold'
                      : 'border-dashed border-neutral-800/80 bg-black/40 text-neutral-600 opacity-60'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSlotUnlocked ? 'bg-red-400 animate-pulse' : 'bg-neutral-700'}`} />
                  <span>{shortId}</span>
                  <span className="text-[9px]">{isSlotUnlocked ? '封存' : '未明'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="p-3 px-4 border-b-2 border-[#3d2714] bg-[#140e08] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => {
                sound.playPaper();
                setActiveTab('slots');
              }}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-serif transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'slots'
                  ? 'bg-[#b07d3b] text-[#1a120b] shadow-sm font-bold ring-1 ring-amber-400'
                  : 'bg-[#1c130b] text-[#9c846a] hover:text-[#f5ebd7] border border-[#382516]'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>存檔總覽 (手動 & 結局庫)</span>
            </button>

            <button
              onClick={() => {
                sound.playPaper();
                setActiveTab('export');
              }}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-serif transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-[#b07d3b] text-[#1a120b] shadow-sm font-bold ring-1 ring-amber-400'
                  : 'bg-[#1c130b] text-[#9c846a] hover:text-[#f5ebd7] border border-[#382516]'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>密鑰導出與 QR 碼</span>
            </button>

            <button
              onClick={() => {
                sound.playPaper();
                setActiveTab('import');
              }}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-serif transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-[#b07d3b] text-[#1a120b] shadow-sm font-bold ring-1 ring-amber-400'
                  : 'bg-[#1c130b] text-[#9c846a] hover:text-[#f5ebd7] border border-[#382516]'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>代碼匯入 / 跨設備同步</span>
            </button>
          </div>

          {statusMessage && (
            <div className={`text-xs px-3 py-1 rounded-xl flex items-center gap-1.5 shrink-0 ${
              statusMessage.type === 'success' ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300' :
              statusMessage.type === 'error' ? 'bg-red-950/80 border border-red-700 text-red-300' :
              'bg-blue-950/80 border border-blue-700 text-blue-300'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Content Area - Bookcase Interior */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-[#140c07]">
          {/* TAB 1: SLOTS OVERVIEW */}
          {activeTab === 'slots' && (
            <div className="space-y-6">
              {/* SECTION A: SINGLE MANUAL SAVE SLOT - TOP SHELF */}
              <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-[#1d120a] border border-[#4a2e16] shadow-md">
                <div className="flex items-center justify-between border-b border-[#3b2311] pb-2">
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm sm:text-base font-bold text-[#fbe9c8] flex items-center gap-2">
                      <span>【現行案卷】</span>
                      <span className="text-[10px] text-amber-500/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 font-mono">書架第 1 層・調查專用夾</span>
                    </h4>
                  </div>
                  {currentGameState && (
                    <button
                      onClick={handlePerformManualSave}
                      className="min-h-[36px] px-3.5 py-1 rounded-xl bg-gradient-to-b from-[#b8863f] to-[#9c6a2a] hover:from-[#c9954a] hover:to-[#ac7733] text-[#1a1006] font-bold text-xs font-serif flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border border-[#d6a55d]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>封存當前進度</span>
                    </button>
                  )}
                </div>

                {manualSlot.data ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#21160d] border-2 border-[#523720] space-y-3 relative overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[#b07d3b] text-[#1a120b]">
                          MANUAL SAVE
                        </span>
                        <h5 className="text-base font-bold text-[#fae0a5]">
                          {manualSlot.data.playerName ? `${manualSlot.data.playerName} 的調查進度` : '調查員進度檔案'}
                        </h5>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-[#a38b72]">
                        <Clock className="w-3.5 h-3.5 text-amber-500/80" />
                        <span>{manualSlot.data.saveTimestamp}</span>
                      </div>
                    </div>

                    {/* Snapshot Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-[#170e08] border border-[#382516] text-xs text-[#c9b79b] space-y-0.5">
                        <span className="text-[10px] text-[#8a725b] block font-typewriter">調查天數</span>
                        <span className="font-bold text-[#fae0a5]">第 {manualSlot.data.investigationDay} 天 ({manualSlot.data.gameDate?.year || 2012}年)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#170e08] border border-[#382516] text-xs text-[#c9b79b] space-y-0.5">
                        <span className="text-[10px] text-[#8a725b] block font-typewriter">心智狀態</span>
                        <span className="font-bold text-emerald-400">
                          {manualSlot.data.completedWeek1 
                            ? ((manualSlot.data.san ?? 100) >= 70 ? '理智冷靜' : (manualSlot.data.san ?? 100) >= 40 ? '精神緊繃' : '瀕臨崩潰')
                            : '冷靜理性'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#170e08] border border-[#382516] text-xs text-[#c9b79b] space-y-0.5">
                        <span className="text-[10px] text-[#8a725b] block font-typewriter">目前位置</span>
                        <span className="font-bold text-[#fae0a5] truncate block">{manualSlot.data.currentLocationName}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#170e08] border border-[#382516] text-xs text-[#c9b79b] space-y-0.5">
                        <span className="text-[10px] text-[#8a725b] block font-typewriter">已掌握物證與守則</span>
                        <span className="font-bold text-cyan-300">{(manualSlot.data.inventory?.length || 0) + (manualSlot.data.obtainedRules?.length || 0)} 件</span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-2 border-t border-[#382516] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            sound.playResolutionChord();
                            onSelectLoadSlot(manualSlot.data!);
                            onClose();
                          }}
                          className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#b07d3b] hover:bg-[#c99248] text-[#1a120b] font-bold text-xs font-serif flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>讀取此存檔</span>
                        </button>

                        <button
                          onClick={() => {
                            setExportSlotId('slot1');
                            setActiveTab('export');
                          }}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#2b1b11] hover:bg-[#3d2719] border border-[#523720] text-[#c9b79b] hover:text-[#f5ebd7] text-xs font-serif flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>導出密鑰 / QR 碼</span>
                        </button>
                      </div>

                      <div>
                        {deleteConfirmSlotId === 'slot1' ? (
                          <div className="flex items-center gap-2 bg-red-950/80 p-1 rounded-xl border border-red-800">
                            <span className="text-xs text-red-300 font-bold px-2">確定刪除？</span>
                            <button
                              onClick={() => handleConfirmDelete('slot1')}
                              className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-xs cursor-pointer"
                            >
                              確定
                            </button>
                            <button
                              onClick={() => setDeleteConfirmSlotId(null)}
                              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs cursor-pointer"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmSlotId('slot1')}
                            className="min-h-[36px] p-2 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                            title="清空此手動存檔"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>清空存檔</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#1a1209] border border-dashed border-[#422c19] text-center space-y-1.5">
                    <FileText className="w-7 h-7 mx-auto text-[#6e543e]" />
                    <p className="text-sm text-[#bda78e] font-serif">尚未建立調查存檔</p>
                  </div>
                )}
              </div>

              {/* Wooden Bookshelf Shelf Divider (實木隔板) */}
              <div className="h-3.5 bg-gradient-to-b from-[#3d2412] via-[#54331a] to-[#24140a] rounded shadow-[0_3px_10px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] border-t border-[#6b4221]/60" />

              {/* SECTION B: 9 DEDICATED ENDING AUTO-SAVE SLOTS - ARCHIVE SHELF */}
              <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-[#1d120a] border border-[#4a2e16] shadow-md">
                <div className="flex items-center justify-between border-b border-[#3b2311] pb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm sm:text-base font-bold text-[#fbe9c8] flex items-center gap-2">
                      <span>【結案典藏】</span>
                      <span className="text-[10px] text-amber-500/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 font-mono">書架第 2 層・九大結局典藏書盒</span>
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-[#deb887] bg-[#140b06] px-2.5 py-0.5 rounded border border-[#3b2311]">
                    已封存 {endingSlots.filter(s => s.data !== null).length} / 9 結局
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {endingSlots.map((slot, sIdx) => {
                    const endingId = slot.endingId!;
                    const endingInfo = ENDINGS_DATA[endingId];
                    const epilogueInfo = ENDING_EPILOGUES[endingId];
                    const isUnlocked = slot.data !== null || (unlockedEndings && unlockedEndings.includes(endingId));

                    return (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isUnlocked
                            ? 'bg-[#21160d] border-[#593c22] hover:border-[#8f6136]'
                            : 'bg-[#140e08] border-[#291a10] opacity-75'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                              isUnlocked ? getEndingBadgeColor(endingInfo?.type) : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                            }`}>
                              {isUnlocked ? (endingInfo?.title.split('：')[0] || slot.title) : `機密檔案 // 0${sIdx + 1}`}
                            </span>

                            {isUnlocked ? (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2b1b11] text-amber-300 border border-[#523720] flex items-center gap-1">
                                <span className="text-red-400 font-bold">【{epilogueInfo?.sealText || '檔案封存'}】</span>
                                <span className="hidden sm:inline">{epilogueInfo?.peerReview.summaryTag || '已結案'}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                                <Lock className="w-3 h-3 text-neutral-500" />
                                <span>檔案尚未解明</span>
                              </span>
                            )}
                          </div>

                          <h5 className={`font-bold text-sm ${isUnlocked ? 'text-[#fae0a5]' : 'text-neutral-500 font-mono'}`}>
                            {isUnlocked
                              ? (endingInfo?.title.split('：')[1] || endingInfo?.title || slot.title)
                              : `【未解明檔案・代號 ED-0${sIdx + 1}】`}
                          </h5>

                          <p className={`text-xs leading-relaxed ${isUnlocked ? 'text-[#a89078] line-clamp-2' : 'text-neutral-500 font-serif italic'}`}>
                            {isUnlocked
                              ? (epilogueInfo?.epilogueSubtitle || endingInfo?.description)
                              : '【案情尚未明朗】卷宗暫缺，尚待還原真相。'}
                          </p>

                          {isUnlocked && (
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#8a725b] pt-1">
                              <span>通關時間：{slot.data?.saveTimestamp || '歷史存檔已封存'}</span>
                              <span className="text-emerald-400">
                                心智狀態：{(slot.data?.san ?? 100) >= 70 ? '理智冷靜' : (slot.data?.san ?? 100) >= 40 ? '精神緊繃' : '瀕臨崩潰'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-3 mt-3 border-t border-[#382516] flex items-center justify-between gap-2">
                          {isUnlocked ? (
                            <>
                              <button
                                onClick={() => {
                                  sound.playPaper();
                                  const fallbackData: SavedGameData = slot.data || {
                                    version: 1,
                                    saveTimestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
                                    playerName: currentGameState?.playerName || '調查員',
                                    selectedTrait: currentGameState?.selectedTrait || 'rationalist',
                                    isTraitRevealed: true,
                                    san: 100,
                                    currentChapter: 'ending',
                                    currentLocationName: '案件終局紀錄',
                                    obtainedRules: [],
                                    inventory: [],
                                    isCctvRebooted: true,
                                    currentEnding: endingId,
                                    investigationDay: 3,
                                    gameDate: { year: 2012, month: 10, day: 3 },
                                    restCount: 0,
                                    foundContradictions: [],
                                    freeNotes: [],
                                    journalLogs: [],
                                    unlockedEndings
                                  };
                                  setSelectedEndingEpilogue({ endingId, data: fallbackData });
                                }}
                                className="min-h-[34px] px-3 py-1 rounded-lg bg-[#332014] hover:bg-[#472c1c] text-[#deb887] hover:text-[#fae0a5] border border-[#5c3e23] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Newspaper className="w-3.5 h-3.5 text-amber-400" />
                                <span>閱覽後日談與同業評價</span>
                              </button>

                              <button
                                onClick={() => {
                                  sound.playResolutionChord();
                                  const dataToLoad: SavedGameData = slot.data || {
                                    version: 1,
                                    saveTimestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
                                    playerName: currentGameState?.playerName || '調查員',
                                    selectedTrait: currentGameState?.selectedTrait || 'rationalist',
                                    isTraitRevealed: true,
                                    san: 100,
                                    currentChapter: 'ending',
                                    currentLocationName: '案件終局紀錄',
                                    obtainedRules: [],
                                    inventory: [],
                                    isCctvRebooted: true,
                                    currentEnding: endingId,
                                    investigationDay: 3,
                                    gameDate: { year: 2012, month: 10, day: 3 },
                                    restCount: 0,
                                    foundContradictions: [],
                                    freeNotes: [],
                                    journalLogs: [],
                                    unlockedEndings
                                  };
                                  onSelectLoadSlot(dataToLoad);
                                  onClose();
                                }}
                                className="min-h-[34px] px-3 py-1 rounded-lg bg-[#b07d3b] hover:bg-[#c99248] text-[#1a120b] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>載入存檔</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-serif">
                              <Lock className="w-3 h-3 text-neutral-600" />
                              <span>未結案</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION C: DANGER ZONE - WIPE ALL PROGRESS */}
              {onResetAllProgress && (
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>【全面重置所有遊戲進度】</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-serif mt-0.5 leading-relaxed">
                      徹底清除所有手動存檔、結局存檔、物證紀錄與第二輪進度，使遊戲完全回到第一輪（上禮拜）初始狀態。
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowWipeAllConfirm(true);
                    }}
                    className="min-h-[34px] px-3.5 py-1.5 rounded-lg bg-red-900/80 hover:bg-red-800 text-red-100 text-xs font-bold font-serif border border-red-700/80 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>全面重置所有進度</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPORT KEY & QR CODE */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#3d2714] pb-3">
                <div>
                  <h4 className="text-base font-bold text-[#fae0a5]">
                    案件進度導出與 QR 碼跨裝置同步
                  </h4>
                  <p className="text-xs text-[#9c846a]">
                    選擇要導出的存檔槽位，使用手機相機掃描二維碼即可秒速同步進度。
                  </p>
                </div>

                {/* Slot Selector */}
                <select
                  value={exportSlotId}
                  onChange={(e) => setExportSlotId(e.target.value as any)}
                  className="bg-[#21160d] border border-[#523720] text-[#f5ebd7] text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#b07d3b] font-serif cursor-pointer"
                >
                  {currentGameState && <option value="current">【當前調查即時狀態】</option>}
                  <option value="slot1">【手動調查存檔】</option>
                  {endingSlots.filter(s => s.data !== null).map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              {exportedKey ? (
                <div className="p-5 rounded-2xl bg-[#21160d] border border-[#523720] flex flex-col md:flex-row items-center gap-6">
                  {/* QR Canvas */}
                  <div className="p-3 bg-[#f5ecd7] rounded-xl shadow-lg shrink-0 flex items-center justify-center">
                    <canvas ref={qrCanvasRef} className="rounded" />
                  </div>

                  {/* Key and Actions */}
                  <div className="space-y-3 w-full">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                        KEY READY
                      </span>
                      <h5 className="text-base font-bold text-[#fae0a5]">
                        存檔密鑰代碼已產生
                      </h5>
                      <p className="text-xs text-[#a38c75]">
                        可複製代碼或掃描 QR 碼於其他設備同步案件進度。
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] text-[#9c846a] font-typewriter">金鑰代碼：</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={exportedKey}
                          className="w-full px-3 py-2 bg-[#120b06] border border-[#3d2714] rounded-xl text-xs font-mono text-amber-300 select-all"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(exportedKey);
                            sound.playResolutionChord();
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2500);
                          }}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#b07d3b] hover:bg-[#c99248] text-[#1a120b] font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                        >
                          {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{isCopied ? '已複製' : '複製代碼'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-[#8a725b] space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-sm">所選槽位目前無存檔數據可供導出。</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMPORT KEY */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              <div className="border-b border-[#3d2714] pb-3">
                <h4 className="text-base font-bold text-[#fae0a5]">
                  金鑰代碼匯入與跨裝置進度恢復
                </h4>
                <p className="text-xs text-[#9c846a]">
                  將在其他設備複製的「AX88-...」金鑰代碼或分享網址貼入下方文字框。
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-serif text-[#deb887] block">
                  貼上存檔金鑰代碼或分享網址：
                </label>
                <textarea
                  value={importKeyInput}
                  onChange={(e) => setImportKeyInput(e.target.value)}
                  placeholder="在此貼上 AX88-... 開頭的存檔密鑰代碼或分享網址..."
                  rows={3}
                  className="w-full p-3 bg-[#120b06] border border-[#422c19] rounded-xl text-xs font-mono text-[#f5ebd7] placeholder-[#664d36] focus:outline-none focus:border-[#b07d3b]"
                />
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {parsedImportData && (
                <div className="p-4 rounded-2xl bg-[#21160d] border border-emerald-700/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>驗證成功！偵測到有效的調查進度：</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[#c9b79b]">
                    <div><strong>註冊名稱：</strong>{parsedImportData.playerName || '尚未註冊'}</div>
                    <div><strong>調查天數：</strong>第 {parsedImportData.investigationDay} 天</div>
                    <div><strong>心智狀態：</strong>{(parsedImportData.san ?? 100) >= 70 ? '理智冷靜' : (parsedImportData.san ?? 100) >= 40 ? '精神緊繃' : '瀕臨崩潰'}</div>
                    <div><strong>當前地點：</strong>{parsedImportData.currentLocationName}</div>
                    <div><strong>物證與守則：</strong>{(parsedImportData.inventory?.length || 0) + (parsedImportData.obtainedRules?.length || 0)} 件</div>
                    <div><strong>存檔時間：</strong>{parsedImportData.saveTimestamp}</div>
                  </div>

                  <div className="pt-2 border-t border-[#382516] flex items-center justify-between">
                    <button
                      onClick={handleApplyImport}
                      className="min-h-[38px] px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>確認套用並寫入手動調查存檔</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Clearance Stamp Seal Bar (進度檔案庫下方淡淡的小鋼印圖案) */}
        <div className="px-4 sm:px-6 py-2 bg-[#140e08] border-t border-[#382516] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none opacity-85">
            {ALL_CANONICAL_ENDINGS.map((eid) => {
              const shortId = CANONICAL_TO_SHORT_ENDING_ID[eid] || eid;
              const isSlotUnlocked = endingSlots.some(s => s.endingId === eid && s.data !== null) || (unlockedEndings && unlockedEndings.includes(eid));
              return (
                <div
                  key={`bottom-stamp-${eid}`}
                  className={`px-2 py-0.5 rounded border text-[9px] font-mono tracking-wider flex items-center gap-1 select-none whitespace-nowrap ${
                    isSlotUnlocked
                      ? 'border-amber-700/60 bg-[#24170d] text-amber-300/90 font-bold shadow-sm'
                      : 'border-neutral-900 bg-neutral-950/70 text-neutral-600'
                  }`}
                >
                  <span className="text-[8px]">〘公會鋼印〙</span>
                  <span>{shortId}</span>
                  <span>{isSlotUnlocked ? '✓ 封存' : '— 待解'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 border-t border-[#382516] bg-[#100b06] flex items-center justify-end text-xs font-serif text-[#78614c]">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="min-h-[36px] px-4 py-1.5 rounded-lg bg-[#24170e] hover:bg-[#382416] border border-[#523720] text-[#c9b79b] hover:text-[#f5ebd7] text-xs font-serif transition-colors cursor-pointer shadow-sm"
          >
            關閉存檔庫
          </button>
        </div>
      </motion.div>

      {/* Dedicated Ending Epilogue & Clearance Modal */}
      {selectedEndingEpilogue && (
        <EndingEpilogueModal
          endingId={selectedEndingEpilogue.endingId}
          savedData={selectedEndingEpilogue.data}
          onClose={() => setSelectedEndingEpilogue(null)}
          onLoadSave={(saveData) => {
            onSelectLoadSlot(saveData);
            setSelectedEndingEpilogue(null);
            onClose();
          }}
        />
      )}

      {/* Wipe All Confirmation Modal */}
      {showWipeAllConfirm && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1c120a] border-2 border-red-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-[#e5dac6]">
            <div className="flex items-center gap-3 border-b border-[#3d2315] pb-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-600/70 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider font-bold">
                  【全面重置遊戲進度 // RESET ALL DATA】
                </div>
                <h3 className="text-base font-bold font-serif text-[#f7ecd5]">
                  確定要全面清除所有遊戲進度嗎？
                </h3>
              </div>
            </div>
            <div className="space-y-2 text-xs font-serif leading-relaxed text-[#cbb9a1]">
              <p>
                此操作將完全移除至目前為止的所有遊戲進度、物證與存檔：
              </p>
              <div className="bg-[#140c07] border border-[#3b1f11] rounded-xl p-3 space-y-1.5 text-[11px]">
                <div className="flex items-start gap-1.5 text-rose-300">
                  <span className="shrink-0">⚠️</span>
                  <span><b>所有內容將全數清除</b>：手動存檔、結局紀錄、已搜集物證與所有調查紀錄。</span>
                </div>
                <div className="flex items-start gap-1.5 text-amber-300">
                  <span className="shrink-0">🔄</span>
                  <span><b>重新開始遊戲</b>：重置後將直接回到遊戲主選單，點擊開始遊戲將從頭展開調查。</span>
                </div>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowWipeAllConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[#26180f] hover:bg-[#382316] border border-[#523520] text-[#d4c2a7] hover:text-white text-xs font-serif cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  sound.playResolutionChord();
                  setShowWipeAllConfirm(false);
                  if (onResetAllProgress) {
                    onResetAllProgress();
                  }
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-900 to-rose-700 hover:from-rose-800 hover:to-rose-600 border border-rose-500 text-rose-100 text-xs font-bold font-serif shadow-lg shadow-rose-950/60 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>確定清除所有內容並重新開始</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
