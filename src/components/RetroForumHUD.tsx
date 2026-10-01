import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Briefcase,
  Volume2,
  VolumeX,
  Trophy,
  RotateCcw,
  Brain,
  FileText,
  StickyNote,
  Compass,
  Save,
  Settings,
  Monitor,
  AlertTriangle
} from 'lucide-react';
import { EndingId, TraitId, UIStyleMode } from '../types';
import { sound } from '../services/soundEngine';
import { INVESTIGATOR_TRAITS, UNKNOWN_TRAIT_PLACEHOLDER } from '../data/traitsData';
import { VolumeControlPopover } from './VolumeControlPopover';

interface RetroForumHUDProps {
  playerName: string;
  boardName?: string;
  onUpdateBoardName?: (name: string) => void;
  articleTitle?: string;
  onUpdateArticleTitle?: (title: string) => void;
  trait: TraitId;
  isTraitRevealed?: boolean;
  san: number;
  currentLocationName: string;
  investigationDateText: string;
  investigationDay: number;
  ruleCount: number;
  itemCount: number;
  journalCount: number;
  noteCount?: number;
  soundEnabled: boolean;
  ambientEnabled?: boolean;
  unlockedEndings?: EndingId[];
  completedWeek1?: boolean;
  activeModal?: 'rulebook' | 'dossier' | 'journal' | 'notes' | 'compass' | 'deduction' | 'gallery' | null;
  uiStyleMode: UIStyleMode;
  onToggleUiStyleMode: () => void;
  onCloseModal?: () => void;
  onToggleSound: () => void;
  onToggleAmbient?: () => void;
  onOpenRulebook: () => void;
  onOpenDossier: () => void;
  onOpenJournal: () => void;
  onOpenDetectiveNotes?: () => void;
  onOpenCompass?: () => void;
  onOpenDeduction: () => void;
  onOpenGallery: () => void;
  onOpenSaveSlots?: () => void;
  onRestart: () => void;
  onReturnToTitle?: () => void;
  onTriggerCrisisRescue?: () => void;
  onOpenShortcutsHelp?: () => void;
}

export const RetroForumHUD: React.FC<RetroForumHUDProps> = ({
  playerName,
  boardName = '怪談',
  onUpdateBoardName,
  articleTitle = '那棟大樓',
  onUpdateArticleTitle,
  trait,
  isTraitRevealed = false,
  san,
  currentLocationName,
  investigationDateText,
  investigationDay,
  ruleCount,
  itemCount,
  journalCount,
  noteCount = 0,
  soundEnabled,
  ambientEnabled = false,
  unlockedEndings = [],
  completedWeek1 = false,
  activeModal = null,
  uiStyleMode,
  onToggleUiStyleMode,
  onCloseModal,
  onToggleSound,
  onToggleAmbient,
  onOpenRulebook,
  onOpenDossier,
  onOpenJournal,
  onOpenDetectiveNotes,
  onOpenCompass,
  onOpenDeduction,
  onOpenGallery,
  onOpenSaveSlots,
  onRestart,
  onReturnToTitle,
  onTriggerCrisisRescue,
  onOpenShortcutsHelp
}) => {
  const [showVolumePopover, setShowVolumePopover] = useState(false);
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [showReturnTitleConfirm, setShowReturnTitleConfirm] = useState(false);

  const systemMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (systemMenuRef.current && !systemMenuRef.current.contains(e.target as Node)) {
        setShowSystemMenu(false);
      }
    };
    if (showSystemMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showSystemMenu]);

  const traitConfig = INVESTIGATOR_TRAITS[trait] || UNKNOWN_TRAIT_PLACEHOLDER;

  // Neutral psychological / mental condition terminology (non-SAN, objective investigative mental status)
  const getMentalStatus = () => {
    if (san >= 75) {
      return { label: '專注良好', colorText: 'text-[#2e6d24]', barColor: 'bg-[#4b913f]', desc: '神經系統運作穩定，思維清晰敏銳' };
    }
    if (san >= 50) {
      return { label: '輕度緊繃', colorText: 'text-[#856404]', barColor: 'bg-[#d39e00]', desc: '略感環境壓迫，需留意周遭異常' };
    }
    if (san >= 30) {
      return { label: '認知疲勞', colorText: 'text-[#c85a17]', barColor: 'bg-[#e06c10]', desc: '精神負荷偏高，感知易受干擾' };
    }
    return { label: '負荷超載', colorText: 'text-[#b21f2d]', barColor: 'bg-[#c82333]', desc: '精神狀態瀕臨極限，建議暫緩行動' };
  };

  const mentalStatus = getMentalStatus();

  return (
    <header className="w-full bg-[#f0f4ee] border-b-2 border-[#6d8e63] text-[#222222] font-serif select-none shadow-sm z-40 shrink-0">
      {/* 1. Top Portal Utility Bar (Classic 2000s Web: 台灣論壇/奇摩家族頂部實用功能列) */}
      <div className="bg-[#ffffff] border-b border-[#c8d8c3] px-3 sm:px-5 py-1 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-[13px]">
        {/* Left Portal Breadcrumbs & Status */}
        <div className="flex items-center gap-1.5 overflow-hidden text-[#444444]">
          <span className="font-bold text-[#b83828] shrink-0 font-sans">
            【怪談】
          </span>
          <span className="text-[#999999]">&gt;</span>
          <span className="font-bold text-[#1f4a7d] hover:text-[#b83828] cursor-pointer truncate max-w-[130px] sm:max-w-none" title={articleTitle || '那棟大樓'}>
            [連載] {articleTitle || '那棟大樓'}
          </span>
          <span className="text-[#999999] hidden sm:inline">&gt;</span>
          <span className="text-[#555555] hidden sm:inline truncate">
            {currentLocationName.replace('安祥路88號大樓 • ', '')}
          </span>
          <span className="text-[#999999] hidden md:inline">|</span>
          <span className="text-[#444444] hidden md:inline">
            發文者：<b className="text-[#1a4b2a]">mawei</b>
          </span>
          <span className="text-[#999999] hidden lg:inline">|</span>
          <span className="text-[#444444] hidden lg:inline">
            使用者：<b className="text-[#1a4b2a]">{playerName || '尚未註冊'}</b>
          </span>
          <span className="text-[#999999] hidden lg:inline">|</span>
          <span className="text-[#555555] hidden lg:inline">
            日程：Day {investigationDay} ({investigationDateText})
          </span>
        </div>

        {/* Right Portal Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto text-xs sm:text-[13px]">
          {/* Mental Crisis Alert Button (Only shown in extreme emergency) */}
          {san < 35 && onTriggerCrisisRescue && (
            <button
              onClick={() => {
                sound.playChime();
                onTriggerCrisisRescue();
              }}
              className="px-2.5 py-0.5 bg-[#f8d7da] hover:bg-[#f5c6cb] border border-[#f5c6cb] text-[#721c24] font-bold animate-pulse flex items-center gap-1 cursor-pointer rounded-xs"
              title="精神負荷超載，可進行心理調節"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#721c24]" />
              <span>[ ⚠️ 精神負荷超載：緊急調節 ]</span>
            </button>
          )}

          {/* Audio Volume Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick();
                setShowVolumePopover(!showVolumePopover);
              }}
              className="retro-web-btn px-2 py-0.5 text-xs sm:text-[13px] text-[#333333] flex items-center gap-1"
              title="音效與背景聲開關"
            >
              {soundEnabled || ambientEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#2e6d24]" /> : <VolumeX className="w-3.5 h-3.5 text-[#888888]" />}
              <span className="hidden sm:inline">音訊</span>
            </button>
            <VolumeControlPopover
              isOpen={showVolumePopover}
              onClose={() => setShowVolumePopover(false)}
              soundEnabled={soundEnabled}
              ambientEnabled={ambientEnabled}
              onToggleSound={onToggleSound}
              onToggleAmbient={() => onToggleAmbient && onToggleAmbient()}
            />
          </div>

          {/* System Menu Dropdown */}
          <div className="relative" ref={systemMenuRef}>
            <button
              onClick={() => {
                sound.playClick();
                setShowSystemMenu(!showSystemMenu);
              }}
              className="retro-web-btn px-2 py-0.5 text-xs sm:text-[13px] text-[#333333] flex items-center gap-1"
              title="系統管理"
            >
              <Settings className="w-3.5 h-3.5 text-[#555555]" />
              <span>選單</span>
            </button>

            {showSystemMenu && (
              <div className="absolute right-0 top-7 z-[90] w-64 bg-[#ffffff] border-2 border-[#6d8e63] p-1.5 text-[#222222] text-xs sm:text-[13px] space-y-1 shadow-2xl">
                <div className="text-[11px] text-[#4a723e] px-2 py-0.5 bg-[#eaf1e7] font-bold border-b border-[#c8d8c3] flex items-center justify-between">
                  <span>【案件輔助調查】</span>
                  <span className="text-[10px] text-[#777777] font-normal">次要速記與日誌</span>
                </div>

                <button
                  onClick={() => {
                    sound.playPaper();
                    setShowSystemMenu(false);
                    onOpenJournal();
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-[#eaf1e7] text-[#411f4d] flex items-center justify-between cursor-pointer rounded-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#5a3268]" />
                    <span>調查活動日誌</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {journalCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-[#5a3268] text-white text-[10px] rounded-xs font-sans">
                        {journalCount}
                      </span>
                    )}
                    <span className="text-xs text-[#888888] font-mono">[J]</span>
                  </div>
                </button>

                {onOpenDetectiveNotes && (
                  <button
                    onClick={() => {
                      sound.playPaper();
                      setShowSystemMenu(false);
                      onOpenDetectiveNotes();
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#eaf1e7] text-[#543813] flex items-center justify-between cursor-pointer rounded-xs"
                  >
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-3.5 h-3.5 text-[#7d5622]" />
                      <span>現場手記便籤</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {noteCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-[#7d5622] text-white text-[10px] rounded-xs font-sans">
                          {noteCount}
                        </span>
                      )}
                      <span className="text-xs text-[#888888] font-mono">[N]</span>
                    </div>
                  </button>
                )}

                {onOpenCompass && (
                  <button
                    onClick={() => {
                      sound.playPaper();
                      setShowSystemMenu(false);
                      onOpenCompass();
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#eaf1e7] text-[#134232] flex items-center justify-between cursor-pointer rounded-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-[#20634c]" />
                      <span>樓層結構羅盤</span>
                    </div>
                    <span className="text-xs text-[#888888] font-mono">[C]</span>
                  </button>
                )}

                {/* 結局圖鑑鑑賞室：僅在通關解鎖首個結局後顯示，避免首輪調查劇透 */}
                {unlockedEndings && unlockedEndings.length > 0 && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowSystemMenu(false);
                      onOpenGallery();
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#eaf1e7] text-[#8a6800] flex items-center justify-between cursor-pointer rounded-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-[#c2960a]" />
                      <span>結局圖鑑鑑賞室</span>
                    </div>
                    <span className="text-xs text-[#888888] font-mono">[G]</span>
                  </button>
                )}

                <div className="text-[11px] text-[#4a723e] px-2 py-0.5 bg-[#eaf1e7] font-bold border-b border-[#c8d8c3] mt-1 flex items-center justify-between">
                  <span>【系統管理控制】</span>
                </div>

                {onOpenSaveSlots && (
                  <button
                    onClick={() => {
                      sound.playPaper();
                      setShowSystemMenu(false);
                      onOpenSaveSlots();
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#eaf1e7] text-[#333333] flex items-center justify-between cursor-pointer rounded-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Save className="w-3.5 h-3.5 text-[#a87422]" />
                      <span>檔案存檔備份庫</span>
                    </div>
                    <span className="text-xs text-[#888888] font-mono">[S]</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    sound.playClick();
                    setShowSystemMenu(false);
                    onToggleUiStyleMode();
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-[#eaf1e7] text-[#113366] flex items-center justify-between cursor-pointer font-bold border-b border-[#e0ece0] rounded-xs"
                >
                  <div className="flex items-center gap-2">
                    <Monitor className="w-3.5 h-3.5 text-[#113366]" />
                    <span>切換介面風格（現代手冊風）</span>
                  </div>
                  <span className="text-xs text-[#2e6d24] font-mono">[切換]</span>
                </button>

                {onOpenShortcutsHelp && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowSystemMenu(false);
                      onOpenShortcutsHelp();
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#eaf1e7] text-[#333333] flex items-center justify-between cursor-pointer rounded-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">⌨️</span>
                      <span>鍵盤快捷鍵一覽</span>
                    </div>
                    <span className="text-xs text-[#888888] font-mono">[?]</span>
                  </button>
                )}

                {onReturnToTitle && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowSystemMenu(false);
                      setShowReturnTitleConfirm(true);
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#eaf1e7] text-[#555555] flex items-center justify-between cursor-pointer rounded-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">🚪</span>
                      <span>返回遊戲標題畫面</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    sound.playClick();
                    setShowSystemMenu(false);
                    onRestart();
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-[#fde8e8] text-[#b83828] flex items-center justify-between cursor-pointer rounded-xs"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-[#b83828]" />
                    <span>重置調查進度 (重新開案)</span>
                  </div>
                  <span className="text-xs">⚠️</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Banner & Identity Header (Classic Taiwanese Forum / Yahoo Club Green Theme) */}
      <div className="retro-web-banner px-3 sm:px-6 py-2 sm:py-3 text-[#ffffff] flex flex-wrap items-center justify-between gap-3 shadow-inner">
        {/* Left: Club Logo & Name */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              if (onReturnToTitle) {
                setShowReturnTitleConfirm(true);
              }
            }}
            title="返回遊戲標題畫面"
            className="w-10 h-10 sm:w-11 sm:h-11 bg-[#ffffff] hover:bg-[#edf5ec] active:translate-y-[1px] border-2 border-[#284420] hover:border-[#1a3314] flex items-center justify-center text-[#284420] hover:text-[#1a3314] font-bold text-lg sm:text-xl shadow-sm cursor-pointer select-none font-serif transition-colors"
          >
            談
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] sm:text-xs px-2 py-0.5 bg-[#ffffff]/25 border border-[#ffffff]/50 rounded-xs text-[#ffffff] font-bold">
                當前位置【怪談】
              </span>
              <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-wide text-[#ffffff] drop-shadow-sm flex items-center gap-1.5">
                <span className="text-[#d8ecd2] font-normal text-xs sm:text-sm">[連載]</span>
                <span>{articleTitle || '那棟大樓'}</span>
              </h1>
              <span className="text-[11px] sm:text-xs px-1.5 py-0.5 bg-[#ffffff]/20 border border-[#ffffff]/40 rounded-xs text-[#f0f9ee]">
                {completedWeek1 ? '第八日・白晝勘察' : '第一週・夜間搜查'}
              </span>
            </div>
            <div className="text-xs sm:text-[13px] text-[#d6ecd0] flex flex-wrap items-center gap-2 mt-0.5">
              <span>版主：mawei</span>
              <span>•</span>
              <span>發文者：mawei</span>
              <span>•</span>
              <span>使用者：{playerName || '尚未註冊'}</span>
              <span>•</span>
              <span>特質：{isTraitRevealed ? traitConfig.name : '隱藏'}</span>
            </div>
          </div>
        </div>

        {/* Right: Neutral Mental Condition & Case Counters */}
        <div className="flex items-center gap-3 sm:gap-4 bg-[#2f4f25]/70 border border-[#68945a] px-3 py-1.5 rounded-xs text-xs sm:text-[13px]">
          {/* Neutral Mental Status (Non-SAN explicit wording) */}
          <div className="space-y-0.5 min-w-[130px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#cce8c5]">調查身心狀態：</span>
              <span className="font-bold text-[#ffffff]">{mentalStatus.label}</span>
            </div>
            {/* Health Meter Bar */}
            <div className="w-full h-2 bg-[#1b3015] border border-[#527d45] rounded-xs overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${mentalStatus.barColor}`}
                style={{ width: `${Math.max(10, san)}%` }}
              />
            </div>
          </div>

          <div className="h-6 w-px bg-[#4a723e] hidden sm:block" />

          {/* Investigation Stats */}
          <div className="text-right text-xs leading-tight hidden sm:block text-[#e0f2dc]">
            <div>{completedWeek1 ? '已掌握規則：' : '已搜查文件：'}<b className="text-[#ffffff]">{ruleCount}</b> 條</div>
            <div>證物袋保管：<b className="text-[#ffffff]">{itemCount}</b> 件</div>
          </div>
        </div>
      </div>

      {/* 3. Category & Features Bar: Strictly Three Core Pillars (三大核心支柱) */}
      <div className="retro-web-bar px-3 sm:px-6 py-2 flex items-center justify-between sm:justify-start gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Core 1: Rules (大樓規則) */}
          <button
            onClick={() => {
              sound.playPaper();
              if (activeModal === 'rulebook') {
                onCloseModal ? onCloseModal() : onOpenRulebook();
              } else {
                onOpenRulebook();
              }
            }}
            className={`px-3.5 py-1.5 text-xs sm:text-[13px] border-2 font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all active:translate-y-[1px] ${
              activeModal === 'rulebook'
                ? 'bg-[#ffffff] border-[#3e6334] text-[#284420] shadow-sm'
                : 'retro-web-btn text-[#26451e] hover:text-[#b83828]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#3e6334]" />
            <span>{completedWeek1 ? '📜 規則' : '📋 奇怪的證物'}</span>
            <span className="text-xs text-[#666666] font-mono">[R]</span>
            {ruleCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#3e6334] text-[#ffffff] text-[11px] rounded-xs font-sans">
                {ruleCount}
              </span>
            )}
          </button>

          {/* Core 2: Dossier / Inventory (隨身物證) */}
          <button
            onClick={() => {
              sound.playPaper();
              if (activeModal === 'dossier') {
                onCloseModal ? onCloseModal() : onOpenDossier();
              } else {
                onOpenDossier();
              }
            }}
            className={`px-3.5 py-1.5 text-xs sm:text-[13px] border-2 font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all active:translate-y-[1px] ${
              activeModal === 'dossier'
                ? 'bg-[#ffffff] border-[#29538c] text-[#1a3964] shadow-sm'
                : 'retro-web-btn text-[#1a3964] hover:text-[#b83828]'
            }`}
          >
            <Briefcase className="w-4 h-4 text-[#29538c]" />
            <span>🎒 隨身物證檔案</span>
            <span className="text-xs text-[#666666] font-mono">[Tab]</span>
            {itemCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#29538c] text-[#ffffff] text-[11px] rounded-xs font-sans">
                {itemCount}
              </span>
            )}
          </button>

          {/* Core 3: Deduction / Case Reasoning (案件思維) */}
          <button
            onClick={() => {
              sound.playPaper();
              if (activeModal === 'deduction') {
                onCloseModal ? onCloseModal() : onOpenDeduction();
              } else {
                onOpenDeduction();
              }
            }}
            className={`px-3.5 py-1.5 text-xs sm:text-[13px] border-2 font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all active:translate-y-[1px] ${
              activeModal === 'deduction'
                ? 'bg-[#ffffff] border-[#1d4f7c] text-[#113354] shadow-sm'
                : 'retro-web-btn text-[#113354] hover:text-[#b83828]'
            }`}
          >
            <Brain className="w-4 h-4 text-[#1d4f7c]" />
            <span>🧠 案件思維推演</span>
            <span className="text-xs text-[#666666] font-mono">[D]</span>
          </button>
        </div>

        {/* Helpful Indicator: Secondary Tools in System Menu */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#555555] ml-auto font-sans">
          <span>輔助工具（日誌 / 便籤 / 存檔）請見右上角</span>
          <button
            onClick={() => {
              sound.playClick();
              setShowSystemMenu(true);
            }}
            className="text-[#2e6d24] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <Settings className="w-3 h-3" />
            <span>【選單】</span>
          </button>
        </div>
      </div>

      {/* Return to Title Confirmation Modal */}
      {showReturnTitleConfirm && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border-2 border-[#3e6334] max-w-sm w-full p-5 space-y-4 text-[#222222] shadow-2xl">
            <h3 className="text-base font-bold text-[#284420] border-b border-[#c8d8c3] pb-2">
              確定要返回遊戲標題畫面嗎？
            </h3>
            <p className="text-xs sm:text-[13px] text-[#555555] leading-relaxed">
              當前章節的自動存檔與手動存檔均會妥善保留，您隨時可從主選單讀取存檔繼續調查。
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReturnTitleConfirm(false)}
                className="retro-web-btn px-3 py-1 text-xs sm:text-[13px]"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowReturnTitleConfirm(false);
                  if (onReturnToTitle) onReturnToTitle();
                }}
                className="retro-web-btn-accent px-3 py-1 text-xs sm:text-[13px] font-bold"
              >
                確定返回
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

