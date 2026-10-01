import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  BookOpen,
  Briefcase,
  Terminal,
  Volume2,
  VolumeX,
  Trophy,
  RotateCcw,
  Brain,
  FileText,
  StickyNote,
  Tv,
  Compass,
  Sliders,
  Settings,
  ChevronDown,
  Keyboard,
  Save,
  Download,
  Monitor
} from 'lucide-react';
import { ChapterId, EndingId, TraitId, UIStyleMode } from '../types';
import { sound } from '../services/soundEngine';
import { INVESTIGATOR_TRAITS, UNKNOWN_TRAIT_PLACEHOLDER } from '../data/traitsData';
import { VisualAtmosphereMode } from './VintagePaperGrainOverlay';
import { VolumeControlPopover } from './VolumeControlPopover';
import { downloadAuditSpecMarkdown } from '../utils/exportAuditDoc';
import { RetroForumHUD } from './RetroForumHUD';

interface HUDProps {
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
  visualMode?: VisualAtmosphereMode;
  unlockedEndings?: EndingId[];
  onToggleVisualMode?: () => void;
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
  completedWeek1?: boolean;
  reduceEffects?: boolean;
  onToggleReduceEffects?: () => void;
  activeModal?: 'rulebook' | 'dossier' | 'journal' | 'notes' | 'compass' | 'deduction' | 'gallery' | null;
  onCloseModal?: () => void;
  uiStyleMode?: UIStyleMode;
  onToggleUiStyleMode?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  playerName,
  boardName,
  onUpdateBoardName,
  articleTitle,
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
  visualMode = 'classic',
  unlockedEndings = [],
  completedWeek1 = false,
  reduceEffects = false,
  activeModal = null,
  uiStyleMode = 'retro2000',
  onToggleUiStyleMode,
  onCloseModal,
  onToggleVisualMode,
  onToggleSound,
  onToggleAmbient,
  onToggleReduceEffects,
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
  const [showReturnTitleConfirm, setShowReturnTitleConfirm] = useState(false);
  const [showVolumePopover, setShowVolumePopover] = useState(false);
  const [showSystemMenu, setShowSystemMenu] = useState(false);

  const systemMenuRef = useRef<HTMLDivElement>(null);

  // Close system menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (systemMenuRef.current && !systemMenuRef.current.contains(e.target as Node)) {
        setShowSystemMenu(false);
      }
    };
    if (showSystemMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showSystemMenu]);

  // If 2000s Retro Detective Terminal style (Direction B) is active, render RetroForumHUD
  if (uiStyleMode === 'retro2000') {
    return (
      <RetroForumHUD
        playerName={playerName}
        boardName={boardName}
        onUpdateBoardName={onUpdateBoardName}
        articleTitle={articleTitle}
        onUpdateArticleTitle={onUpdateArticleTitle}
        trait={trait}
        isTraitRevealed={isTraitRevealed}
        san={san}
        currentLocationName={currentLocationName}
        investigationDateText={investigationDateText}
        investigationDay={investigationDay}
        ruleCount={ruleCount}
        itemCount={itemCount}
        journalCount={journalCount}
        noteCount={noteCount}
        soundEnabled={soundEnabled}
        ambientEnabled={ambientEnabled}
        unlockedEndings={unlockedEndings}
        completedWeek1={completedWeek1}
        activeModal={activeModal}
        uiStyleMode={uiStyleMode}
        onToggleUiStyleMode={onToggleUiStyleMode || (() => {})}
        onCloseModal={onCloseModal}
        onToggleSound={onToggleSound}
        onToggleAmbient={onToggleAmbient}
        onOpenRulebook={onOpenRulebook}
        onOpenDossier={onOpenDossier}
        onOpenJournal={onOpenJournal}
        onOpenDetectiveNotes={onOpenDetectiveNotes}
        onOpenCompass={onOpenCompass}
        onOpenDeduction={onOpenDeduction}
        onOpenGallery={onOpenGallery}
        onOpenSaveSlots={onOpenSaveSlots}
        onRestart={onRestart}
        onReturnToTitle={onReturnToTitle}
        onTriggerCrisisRescue={onTriggerCrisisRescue}
        onOpenShortcutsHelp={onOpenShortcutsHelp}
      />
    );
  }

  const traitData = isTraitRevealed 
    ? (INVESTIGATOR_TRAITS[trait] || INVESTIGATOR_TRAITS.rationalist)
    : UNKNOWN_TRAIT_PLACEHOLDER;

  const getSanStatus = () => {
    if (!completedWeek1) {
      return { 
        label: '理智穩定', 
        color: 'text-sky-300 font-serif', 
        needleDeg: -45,
        desc: '面對異常仍堅守理性調查信念，維持意識清醒。'
      };
    }
    if (san >= 70) return { label: '理智冷靜', color: 'text-sky-400', needleDeg: -45 + (100 - san) * 0.9, desc: '思緒清晰，對異常現象具備高度抵抗力。' };
    if (san >= 40) return { label: '精神緊繃', color: 'text-amber-400', needleDeg: -45 + (100 - san) * 0.9, desc: '心緒開始動搖，視野邊緣偶爾浮現干擾。' };
    return { label: '瀕臨崩潰', color: 'text-rose-500 animate-pulse', needleDeg: Math.min(45, -45 + (100 - san) * 0.9), desc: '意識受認知污染重創，行動受到怪異阻撓。' };
  };

  const sanStatus = getSanStatus();

  // Needle angle for mechanical gauge: 100 SAN = -45 deg (left/green), 0 SAN = +45 deg (right/danger)
  const needleAngle = !completedWeek1 ? -45 : Math.max(-45, Math.min(45, 45 - (san / 100) * 90));

  return (
    <header className="shrink-0 z-30 bg-[#140e0a] border-b-2 border-[#3d2919] shadow-xl text-[#e8dac1] relative">
      {/* Top Wood/Leather Desk Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 md:px-6 pt-2 pb-1.5 flex flex-wrap items-center justify-between gap-2.5 border-b border-[#2b1c11]">
        
        {/* Left: Detective ID Card */}
        <div className="flex items-center gap-2">
          {/* Laminated ID Card Aesthetic */}
          <div className="flex items-center gap-2 bg-[#1e150e] border border-[#523924] px-2.5 py-1 rounded-md shadow-inner">
            <div className="w-6 h-6 rounded bg-[#2b1d12] border border-[#785227] flex items-center justify-center text-[#d4a359] font-bold text-xs">
              偵
            </div>
            <div>
              <div className="text-xs font-bold text-[#fae0a5] font-serif leading-none flex items-center gap-1.5">
                <span>{playerName || '尚未註冊'}</span>
                <span className="text-[10px] font-typewriter text-[#a88f72] border-l border-[#523924] pl-1 hidden sm:inline">
                  AN-2012-088
                </span>
              </div>
              <div className="text-[10px] text-[#b8a284] font-serif mt-0.5 flex items-center gap-1">
                <span className="text-[#d4a359]">特質：</span>
                <span className={isTraitRevealed ? 'text-[#f5ebd7]' : 'text-neutral-500 italic'}>
                  {traitData.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Location Stamp & Vintage Mechanical Sanity Meter */}
        <div className="flex items-center gap-2">
          {/* Location & Time Stamp */}
          <div className="flex items-center gap-1.5 text-xs font-serif bg-[#18110b] border border-[#422c19] px-2.5 py-1 rounded">
            <span className="text-[#a88f72] hidden sm:inline">現勘：</span>
            <span className="text-[#f5ebd7] font-bold truncate max-w-[110px] sm:max-w-[160px] md:max-w-[200px]">{currentLocationName}</span>
            <span className="text-[#6b523a]">|</span>
            <span className="text-[#d4a359] font-typewriter whitespace-nowrap">第 {investigationDay} 日</span>
          </div>

          {/* Sanity Meter / Focus Indicator */}
          {!completedWeek1 ? (
            <div className="flex items-center gap-1.5 bg-[#1c1209] border border-[#4a301a] px-2.5 py-1 rounded shadow-inner">
              <span className="text-[11px] font-serif text-[#c7b79d] hidden md:inline">精神狀態：</span>
              <span className="text-xs font-serif font-bold text-amber-300">
                穩定 (100%)
              </span>
            </div>
          ) : (
            <div className="relative group cursor-help">
              <div className="flex items-center gap-1.5 bg-[#1c1209] border border-[#4a301a] px-2.5 py-1 rounded shadow-inner">
                <span className="text-[11px] font-serif text-[#c7b79d] hidden md:inline">心智狀態：</span>
                
                {/* Visual Gauge dial */}
                <div className="relative w-8 h-4 bg-[#120b06] border border-[#3b2515] rounded-t-full overflow-hidden flex items-end justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-amber-950 to-rose-950 opacity-60" />
                  {/* Mechanical Needle */}
                  <div 
                    className="w-0.5 h-3 bg-rose-400 origin-bottom transition-transform duration-500 shadow-[0_0_4px_rgba(244,63,94,0.8)]"
                    style={{ transform: `rotate(${needleAngle}deg)` }}
                  />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute bottom-0 z-10" />
                </div>

                <span className={`text-xs font-serif font-bold ${sanStatus.color}`}>
                  {sanStatus.label}
                </span>
              </div>

              {/* Tooltip for sanity guide */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-[#1e130a] border border-[#6b4728] rounded shadow-2xl text-xs z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between border-b border-[#3d2716] pb-1.5 mb-2">
                  <div>
                    <div className="text-[10px] font-typewriter text-[#d4a359] font-bold">
                      【指針式理智計讀數】
                    </div>
                    <div className="text-sm font-bold font-serif text-[#f5ebd7] flex items-center gap-1.5">
                      <span>心智指針狀態：</span>
                      <span className={`text-sm ${sanStatus.color}`}>【{sanStatus.label}】</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded bg-[#2d140e] border border-[#8c3b28] flex items-center justify-center text-rose-400">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1 text-xs text-[#d1c2a5] font-serif leading-relaxed">
                  <p>
                    <b>指針偏向危險紅區</b>：代表精神承壓過重。理智不足時將出現視線雜訊與幻聽干擾。
                  </p>
                  <div className="bg-[#1c1109] p-2 rounded border border-[#3b2416] text-[11px] space-y-0.5 font-serif text-[#b8a68b]">
                    <div className="text-[#deb887] font-bold">維持心智指針指引：</div>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>返回事務所沙發休整。</li>
                      <li>搜集客觀物證與分析規則矛盾。</li>
                      <li>避免盲從不可信的虛假標語。</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Audio Mixer & System & Save Slot Controls */}
        <div className="flex items-center gap-1.5 relative">
          
          {/* Audio Mixer Popover Button */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick();
                setShowVolumePopover(!showVolumePopover);
              }}
              title="音訊調音台"
              className={`min-h-[36px] px-2 py-1.5 rounded border text-xs transition-all flex items-center gap-1 font-serif cursor-pointer ${
                soundEnabled || ambientEnabled
                  ? 'bg-[#2b1d12] hover:bg-[#3d2919] border-[#6b4928] text-[#e5b364]'
                  : 'bg-[#140e08] border-[#2e1d10] text-[#735d49]'
              }`}
            >
              {soundEnabled || ambientEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#e5b364]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
              <span className="text-[11px] font-medium hidden md:inline">音訊</span>
              <ChevronDown className="w-3 h-3 text-[#a88f72]" />
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

          {/* Ending Gallery: Only show if player has unlocked at least 1 ending to prevent spoilers */}
          {unlockedEndings && unlockedEndings.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenGallery();
              }}
              title="結局成就 [快捷鍵 G]"
              className="min-h-[36px] px-2 py-1.5 rounded bg-[#2b1d12] hover:bg-[#3d2919] border border-[#6b4928] text-[#facc15] text-xs transition-all cursor-pointer flex items-center gap-1 font-serif"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden md:inline">成就</span>
            </button>
          )}

          {/* Manual Save Slots Button */}
          {onOpenSaveSlots && (
            <button
              onClick={() => {
                sound.playPaper();
                onOpenSaveSlots();
              }}
              title="手動存檔與檔案庫 [快捷鍵 S]"
              className="min-h-[36px] px-2.5 py-1.5 rounded bg-gradient-to-r from-[#2e1a0e] to-[#3a2213] hover:from-[#3d2414] hover:to-[#4a2c19] border border-amber-600/80 hover:border-amber-400 text-amber-300 text-xs transition-all flex items-center gap-1.5 font-serif shadow-sm cursor-pointer active:scale-98"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold">手動存檔</span>
            </button>
          )}

          {/* Streamlined System Dropdown Menu (Guaranteed above all screen overlays) */}
          <div className="relative z-[80]" ref={systemMenuRef}>
            <button
              onClick={() => {
                sound.playClick();
                setShowSystemMenu(!showSystemMenu);
              }}
              title="系統設置"
              className="min-h-[36px] p-2 rounded bg-[#211710] hover:bg-[#35251a] border border-[#6b4728] hover:border-amber-500 text-[#d4c2a7] hover:text-amber-200 text-xs transition-all flex items-center gap-1 font-serif shadow-md cursor-pointer ring-1 ring-amber-500/20"
            >
              <Settings className="w-3.5 h-3.5 text-[#d4a359]" />
              <ChevronDown className="w-3 h-3 text-[#a88f72]" />
            </button>

            {showSystemMenu && (
              <div className="absolute right-0 top-11 z-[90] w-68 bg-[#1b120a] border-2 border-[#6b4728] rounded-xl shadow-2xl p-2.5 text-[#f2e6d0] select-none font-serif text-xs space-y-1 backdrop-blur-md">
                {/* Secondary Investigation Tools Header */}
                <div className="text-[11px] text-[#e5b364] px-2.5 py-1 bg-[#281a0e] rounded-md font-bold border border-[#523720] flex items-center justify-between">
                  <span>【案件輔助調查】</span>
                  <span className="text-[10px] text-[#a88f72] font-normal">速記與日誌</span>
                </div>

                {/* Auxiliary 1: Journal */}
                <button
                  onClick={() => {
                    sound.playPaper();
                    setShowSystemMenu(false);
                    onOpenJournal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2e1d10] flex items-center justify-between text-[#c084fc] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#c084fc]" />
                    <span>調查活動紀錄</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {journalCount > 0 && (
                      <span className="w-4 h-4 rounded text-[10px] font-typewriter flex items-center justify-center bg-[#581c87] text-[#fae8ff]">
                        {journalCount}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-[#a88f72]">[J]</span>
                  </div>
                </button>

                {/* Auxiliary 2: Notes */}
                {onOpenDetectiveNotes && (
                  <button
                    onClick={() => {
                      sound.playPaper();
                      setShowSystemMenu(false);
                      onOpenDetectiveNotes();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2e1d10] flex items-center justify-between text-[#f59e0b] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-3.5 h-3.5 text-[#f59e0b]" />
                      <span>現場手記便籤</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {noteCount > 0 && (
                        <span className="w-4 h-4 rounded text-[10px] font-typewriter flex items-center justify-center bg-[#78350f] text-[#fef3c7]">
                          {noteCount}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[#a88f72]">[N]</span>
                    </div>
                  </button>
                )}

                {/* Auxiliary 3: Compass */}
                {onOpenCompass && (
                  <button
                    onClick={() => {
                      sound.playPaper();
                      setShowSystemMenu(false);
                      onOpenCompass();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2e1d10] flex items-center justify-between text-emerald-400 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-emerald-400" />
                      <span>樓層結構羅盤</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#a88f72]">[C]</span>
                  </button>
                )}

                {/* Auxiliary 4: Endings Gallery: Only show if player has unlocked at least 1 ending */}
                {unlockedEndings && unlockedEndings.length > 0 && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowSystemMenu(false);
                      onOpenGallery();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2e1d10] flex items-center justify-between text-[#fbbf24] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-[#fbbf24]" />
                      <span>結局圖鑑鑑賞室</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#a88f72]">[G]</span>
                  </button>
                )}

                <div className="text-[11px] text-[#e5b364] px-2.5 py-1 bg-[#281a0e] rounded-md font-bold border border-[#523720] mt-1.5 flex items-center justify-between">
                  <span>【系統管理與存檔】</span>
                </div>

                {/* Manual Save / Export in Menu */}
                {onOpenSaveSlots && (
                  <button
                    onClick={() => {
                      sound.playPaper();
                      setShowSystemMenu(false);
                      onOpenSaveSlots();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2e1d10] flex items-center justify-between text-amber-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Save className="w-3.5 h-3.5 text-amber-400" />
                      <span>檔案庫與手動存檔</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-500">[S]</span>
                  </button>
                )}

                {/* Effect Reduction Toggle (Requirement 6: Reduces overlay effects to 30%) */}
                {onToggleReduceEffects && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onToggleReduceEffects();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2e1d10] flex items-center justify-between text-[#e8dac1] transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Sliders className={`w-3.5 h-3.5 ${reduceEffects ? 'text-amber-400' : 'text-neutral-400'}`} />
                      <div className="flex flex-col">
                        <span>畫面特效減輕</span>
                        <span className="text-[9px] text-neutral-400">將全螢幕覆蓋特效降為 30%</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                      reduceEffects 
                        ? 'bg-amber-950/90 border-amber-500 text-amber-300 font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                    }`}>
                      {reduceEffects ? '30% 減輕' : '100% 完整'}
                    </span>
                  </button>
                )}

                {/* Visual Atmosphere Switch */}
                {onToggleVisualMode && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onToggleVisualMode();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2e1d10] flex items-center justify-between text-[#e8dac1] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Tv className="w-3.5 h-3.5 text-amber-400" />
                      <span>畫面風格濾鏡</span>
                    </div>
                    <span className="text-[10px] font-typewriter text-[#d4a359]">
                      {visualMode === 'classic' ? '雙重' : visualMode === 'newspaper' ? '報紙' : visualMode === 'crt' ? 'CRT' : '清晰'}
                    </span>
                  </button>
                )}

                {/* UI Theme Switch (2000s BBS vs Modern) */}
                {onToggleUiStyleMode && (
                  <button
                    onClick={() => {
                      setShowSystemMenu(false);
                      onToggleUiStyleMode();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2e1d10] flex items-center justify-between text-amber-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="w-3.5 h-3.5 text-amber-400" />
                      <span>啟用 2000年代復古介面風格</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-500">[切換]</span>
                  </button>
                )}

                {/* Keyboard Shortcuts Help */}
                {onOpenShortcutsHelp && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowSystemMenu(false);
                      onOpenShortcutsHelp();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2e1d10] flex items-center justify-between text-[#e8dac1] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Keyboard className="w-3.5 h-3.5 text-sky-400" />
                      <span>快捷鍵說明</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">[?]</span>
                  </button>
                )}

                {/* Export Markdown Specification */}
                <button
                  onClick={() => {
                    sound.playPaper();
                    setShowSystemMenu(false);
                    downloadAuditSpecMarkdown();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2e1d10] flex items-center justify-between text-[#e8dac1] transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>下載案件全案卷與設計手冊</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/40 border border-emerald-800/50 px-1.5 py-0.5 rounded">.MD</span>
                </button>

                <div className="my-1 border-t border-[#3b2416]" />

                {/* Return to Title */}
                {onReturnToTitle && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowSystemMenu(false);
                      setShowReturnTitleConfirm(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2e1d10] flex items-center gap-2 text-[#d4c2a7] hover:text-amber-200 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>返回標題主選單</span>
                  </button>
                )}

                {/* Reset Case */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowSystemMenu(false);
                    onRestart();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#381a14] flex items-center gap-2 text-rose-300 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>重置劇情並跳回主選單</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Manila Folder Navigation Tabs: Strictly Three Core Pillars (三大核心支柱) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 flex items-center justify-between sm:justify-start gap-2 pt-1 pb-1 overflow-x-auto scrollbar-none touch-pan-x">
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Core 1: Rulebook - 第一輪維持住戶守則（對所有住戶公開的文件），二周目為守則彙編 */}
          {(() => {
            const isActive = activeModal === 'rulebook';
            return (
              <button
                onClick={() => {
                  sound.playPaper();
                  if (isActive) {
                    onCloseModal ? onCloseModal() : onOpenRulebook();
                  } else {
                    onOpenRulebook();
                  }
                }}
                title="快捷鍵 [R]"
                className={`dossier-tab min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4.5 py-1.5 text-xs sm:text-sm font-serif flex items-center gap-2 cursor-pointer group shrink-0 active:scale-98 transition-all ${
                  isActive
                    ? 'dossier-tab-active ring-1 ring-amber-400/80 shadow-[0_0_12px_rgba(212,163,89,0.4)] text-[#fae0a5] font-bold'
                    : 'dossier-tab-inactive text-[#a89279]'
                }`}
              >
                <BookOpen className={`w-4 h-4 transition-transform ${isActive ? 'text-amber-300 scale-110' : 'text-[#d4a359] group-hover:scale-110'}`} />
                <span className="tracking-wide">
                  {completedWeek1 ? '📜 規則' : '📜 奇怪的證物'}
                </span>
                <span className="text-[10px] font-mono text-[#a88f72] font-normal hidden sm:inline">[R]</span>
                {ruleCount > 0 && (
                  <span className={`w-4 h-4 rounded text-[10px] font-typewriter flex items-center justify-center ${
                    isActive ? 'bg-amber-500 text-black font-bold' : 'bg-[#4a3420] text-[#f5ebd7]'
                  }`}>
                    {ruleCount}
                  </span>
                )}
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />}
              </button>
            );
          })()}

          {/* Core 2: Evidence Dossier */}
          {(() => {
            const isActive = activeModal === 'dossier';
            return (
              <button
                onClick={() => {
                  sound.playPaper();
                  if (isActive) {
                    onCloseModal ? onCloseModal() : onOpenDossier();
                  } else {
                    onOpenDossier();
                  }
                }}
                title="快捷鍵 [Tab] 或 [I]"
                className={`dossier-tab min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4.5 py-1.5 text-xs sm:text-sm font-serif flex items-center gap-2 cursor-pointer group shrink-0 active:scale-98 transition-all ${
                  isActive
                    ? 'dossier-tab-active ring-1 ring-indigo-400/80 shadow-[0_0_12px_rgba(129,140,248,0.4)] text-[#fae0a5] font-bold'
                    : 'dossier-tab-inactive text-[#a89279]'
                }`}
              >
                <Briefcase className={`w-4 h-4 transition-transform ${isActive ? 'text-indigo-300 scale-110' : 'text-[#818cf8] group-hover:scale-110'}`} />
                <span className="tracking-wide">隨身物證</span>
                <span className="text-[10px] font-mono text-[#a88f72] font-normal hidden sm:inline">[Tab]</span>
                {itemCount > 0 && (
                  <span className={`w-4 h-4 rounded text-[10px] font-typewriter flex items-center justify-center ${
                    isActive ? 'bg-indigo-400 text-black font-bold' : 'bg-[#312e81] text-[#e0e7ff]'
                  }`}>
                    {itemCount}
                  </span>
                )}
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse ml-0.5" />}
              </button>
            );
          })()}

          {/* Core 3: Deduction & Case Thinking */}
          {(() => {
            const isActive = activeModal === 'deduction';
            return (
              <button
                onClick={() => {
                  sound.playPaper();
                  if (isActive) {
                    onCloseModal ? onCloseModal() : onOpenDeduction();
                  } else {
                    onOpenDeduction();
                  }
                }}
                title="快捷鍵 [D]"
                className={`dossier-tab min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4.5 py-1.5 text-xs sm:text-sm font-serif flex items-center gap-2 cursor-pointer group shrink-0 active:scale-98 transition-all ${
                  isActive
                    ? 'dossier-tab-active ring-1 ring-sky-400/80 shadow-[0_0_12px_rgba(56,189,248,0.4)] text-[#fae0a5] font-bold'
                    : 'dossier-tab-inactive text-[#a89279]'
                }`}
              >
                <Brain className={`w-4 h-4 transition-transform ${isActive ? 'text-sky-300 scale-110' : 'text-[#38bdf8] group-hover:scale-110'}`} />
                <span className="tracking-wide">案情推演</span>
                <span className="text-[10px] font-mono text-[#38bdf8]/70 font-normal hidden sm:inline">[D]</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse ml-0.5" />}
              </button>
            );
          })()}
        </div>

        {/* Secondary Tools Reminder */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#a89279] font-serif ml-auto">
          <span>輔助工具（日誌 / 便籤 / 存檔）請見右上角</span>
          <button
            onClick={() => {
              sound.playClick();
              setShowSystemMenu(true);
            }}
            className="text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>【選單】</span>
          </button>
        </div>
      </div>

      {/* Return to Title Confirmation Modal */}
      {showReturnTitleConfirm && (
        <div className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18110a] border-2 border-[#785227] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-[#ebd9be] text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-[#2d1b0d] border border-[#d4a359] mx-auto flex items-center justify-center text-[#e5b364] shadow-lg">
              <FileText className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold font-serif text-[#f7ebd4]">
                返回標題主選單
              </h3>
              <p className="text-xs text-[#c2b093] leading-relaxed font-serif">
                本遊戲採用純手動存檔制。若您尚未手動存檔，建議先開啟檔案庫進行封存；確定要返回主選單嗎？
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowReturnTitleConfirm(false);
                }}
                className="flex-1 min-h-[42px] py-2 px-3 rounded-xl bg-[#261910] hover:bg-[#382618] border border-[#523720] text-[#c9b79b] text-xs font-serif transition-colors cursor-pointer"
              >
                留在現場
              </button>
              {onOpenSaveSlots && (
                <button
                  onClick={() => {
                    sound.playPaper();
                    setShowReturnTitleConfirm(false);
                    onOpenSaveSlots();
                  }}
                  className="flex-1 min-h-[42px] py-2 px-3 rounded-xl bg-[#382414] hover:bg-[#4d321d] border border-amber-600 text-amber-200 text-xs font-serif transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>先手動存檔</span>
                </button>
              )}
              <button
                onClick={() => {
                  sound.playResolutionChord();
                  setShowReturnTitleConfirm(false);
                  if (onReturnToTitle) onReturnToTitle();
                }}
                className="w-full sm:w-auto flex-1 min-h-[42px] py-2 px-3 rounded-xl bg-gradient-to-r from-amber-900 to-amber-800 hover:from-amber-800 hover:to-amber-700 border border-amber-500 text-amber-100 font-bold text-xs font-serif transition-all shadow-md cursor-pointer"
              >
                確認返回標題
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
