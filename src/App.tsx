/**
 * No. 88 An Hsiang Road - Immersive Detective Mystery Web Game
 * 安祥路88號 - 沉浸式偵探懸疑網頁解謎遊戲
 * 
 * Clean Presentation Component using modular useGameState and useModalManager hooks.
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, RotateCcw, AlertTriangle, 
  Sparkles, Moon, ArrowRight, Brain, X
} from 'lucide-react';
import { sound } from './services/soundEngine';
import { GlitchOverlay } from './components/GlitchOverlay';
import { VintagePaperGrainOverlay } from './components/VintagePaperGrainOverlay';
import { HUD } from './components/HUD';
import { TitleScreenModal } from './components/TitleScreenModal';
import { BuildingExplorer } from './components/BuildingExplorer';
import { PrologueView } from './components/chapters/PrologueView';

import { useModalManager } from './hooks/useModalManager';
import { useGameState } from './hooks/useGameState';

// Lazy-loaded secondary modals and views for fast initial load and optimized bundle
const LetterPuzzle = React.lazy(() => import('./components/minigames/LetterPuzzle').then(m => ({ default: m.LetterPuzzle })));
const RulesComparisonDeductionModal = React.lazy(() => import('./components/RulesComparisonDeductionModal').then(m => ({ default: m.RulesComparisonDeductionModal })));
const DossierModal = React.lazy(() => import('./components/DossierModal').then(m => ({ default: m.DossierModal })));
const JournalModal = React.lazy(() => import('./components/JournalModal').then(m => ({ default: m.JournalModal })));
const DetectiveNotesModal = React.lazy(() => import('./components/DetectiveNotesModal').then(m => ({ default: m.DetectiveNotesModal })));
const DeductionBoardModal = React.lazy(() => import('./components/DeductionBoardModal').then(m => ({ default: m.DeductionBoardModal })));
const EndingGalleryModal = React.lazy(() => import('./components/EndingGalleryModal').then(m => ({ default: m.EndingGalleryModal })));
const EndingScreen = React.lazy(() => import('./components/EndingScreen').then(m => ({ default: m.EndingScreen })));
const ED0CaseReportCard = React.lazy(() => import('./components/ED0CaseReportCard').then(m => ({ default: m.ED0CaseReportCard })));
const MetaTransitionModal = React.lazy(() => import('./components/MetaTransitionModal').then(m => ({ default: m.MetaTransitionModal })));
const MentalCrisisModal = React.lazy(() => import('./components/MentalCrisisModal').then(m => ({ default: m.MentalCrisisModal })));
const SaveSlotModal = React.lazy(() => import('./components/SaveSlotModal').then(m => ({ default: m.SaveSlotModal })));
const FloorCompassModal = React.lazy(() => import('./components/FloorCompassModal').then(m => ({ default: m.FloorCompassModal })));
const SecretArchiveModal = React.lazy(() => import('./components/SecretArchiveModal').then(m => ({ default: m.SecretArchiveModal })));
const KeyboardShortcutsModal = React.lazy(() => import('./components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));
const RetroForumWrapper = React.lazy(() => import('./components/RetroForumWrapper').then(m => ({ default: m.RetroForumWrapper })));
const VintageEnvelopeModal = React.lazy(() => import('./components/VintageEnvelopeModal').then(m => ({ default: m.VintageEnvelopeModal })));

export default function App() {
  // Modal & Overlay Manager Hook
  const modals = useModalManager();

  // Core Game State & Progress Hook
  const game = useGameState({
    onOpenEnvelope: (envelope) => modals.setActiveEnvelopeModal(envelope)
  });

  // Browser Web Audio Autoplay Policy unlocking on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      sound.unlockAudio();
    };
    window.addEventListener('click', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true, passive: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Global Detective Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // 1. ESC: Close all active overlays / modals
      if (e.key === 'Escape') {
        modals.closeAllModals();
        return;
      }

      // If game is in title screen or ending or mental crisis, avoid intercepting tool keys
      if (
        game.showTitleScreen || 
        game.showWeek2InteractiveTitle || 
        game.currentChapter === 'ending' || 
        game.isMentalCrisisActive
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // 2. Tab or 'i': Toggle Dossier (Evidence)
      if (e.key === 'Tab' || key === 'i') {
        e.preventDefault();
        sound.playPaper();
        modals.toggleInvestigationModal('dossier');
        return;
      }

      // 3. 'r': Toggle Rulebook / Resident Rules
      if (key === 'r') {
        e.preventDefault();
        if (game.obtainedRules.length > 0) {
          sound.playPaper();
          modals.toggleInvestigationModal('rulebook');
        } else {
          game.showToast(game.completedWeek1
            ? '尚未在現場獲取任何大樓規則。'
            : '尚未在現場取得任何奇怪的證物，請先勘查現場搜集線索。'
          );
        }
        return;
      }
      
      // 4. 'j' or 'l': Toggle Journal (Activity logs)
      if (key === 'j' || key === 'l') {
        e.preventDefault();
        sound.playPaper();
        modals.toggleInvestigationModal('journal');
        return;
      }

      // 5. 'n': Toggle Detective Notes
      if (key === 'n') {
        e.preventDefault();
        sound.playPaper();
        modals.toggleInvestigationModal('notes');
        return;
      }

      // 6. 'c': Toggle Floor Compass
      if (key === 'c') {
        e.preventDefault();
        sound.playPaper();
        modals.toggleInvestigationModal('compass');
        return;
      }

      // 7. 'd': Toggle Deduction Board
      if (key === 'd') {
        e.preventDefault();
        sound.playPaper();
        modals.toggleInvestigationModal('deduction');
        return;
      }

      // 8. 'g': Toggle Gallery (Only if at least one ending is unlocked, to prevent spoilers)
      if (key === 'g') {
        e.preventDefault();
        sound.playClick();
        if (game.unlockedEndings && game.unlockedEndings.length > 0) {
          modals.toggleInvestigationModal('gallery');
        } else {
          game.showToast('【真相鑑賞室未解鎖】完成首個結局調查後方可開啟查閱');
        }
        return;
      }

      // 9. 's': Toggle Save Slot Modal (Save)
      if (key === 's') {
        e.preventDefault();
        sound.playClick();
        modals.setSaveSlotModalState(prev => ({
          isOpen: !prev.isOpen,
          mode: 'save'
        }));
        return;
      }

      // 10. 'm': Toggle Sound Mute
      if (key === 'm') {
        e.preventDefault();
        game.handleToggleSound();
        return;
      }

      // 11. '?': Toggle Keyboard Shortcuts Help
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        sound.playClick();
        modals.setShowShortcutsHelp(prev => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    game.showTitleScreen,
    game.showWeek2InteractiveTitle,
    game.currentChapter,
    game.isMentalCrisisActive,
    game.obtainedRules.length,
    game.completedWeek1,
    game.handleToggleSound,
    game.showToast,
    modals
  ]);

  return (
    <div className={`h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 flex flex-col font-serif selection:bg-amber-800 selection:text-amber-100 relative ${game.completedWeek1 && game.san < 40 ? 'san-glitch' : ''}`}>
      {/* Glitch Overlay */}
      <GlitchOverlay 
        san={game.san} 
        reducedEffects={game.reduceEffects} 
        completedWeek1={game.completedWeek1} 
      />

      {/* 1990s Detective Dossier Paper, Newsprint & CRT Overlay - Disabled in retro2000 mode for a bright, clean forum appearance */}
      {game.uiStyleMode !== 'retro2000' && (
        <VintagePaperGrainOverlay mode={game.visualMode} reducedEffects={game.reduceEffects} />
      )}

      {/* Detective HUD Navbar */}
      <HUD
        playerName={game.playerName}
        boardName={game.boardName}
        onUpdateBoardName={game.setBoardName}
        articleTitle={game.articleTitle}
        onUpdateArticleTitle={game.setArticleTitle}
        trait={game.selectedTrait}
        isTraitRevealed={game.isTraitRevealed}
        san={game.san}
        currentLocationName={game.currentLocationName}
        investigationDateText={game.currentDateText}
        investigationDay={game.investigationDay}
        ruleCount={game.obtainedRules.length}
        itemCount={game.inventory.length}
        journalCount={game.journalLogs.length}
        noteCount={game.freeNotes.length}
        soundEnabled={game.soundEnabled}
        visualMode={game.visualMode}
        unlockedEndings={game.unlockedEndings}
        completedWeek1={game.completedWeek1}
        reduceEffects={game.reduceEffects}
        activeModal={modals.activeInvestigationModal}
        onCloseModal={modals.closeInvestigationModal}
        onToggleReduceEffects={game.handleToggleReduceEffects}
        onToggleVisualMode={game.handleToggleVisualMode}
        onToggleSound={game.handleToggleSound}
        onOpenRulebook={() => modals.toggleInvestigationModal('rulebook')}
        onOpenDossier={() => modals.toggleInvestigationModal('dossier')}
        onOpenJournal={() => modals.toggleInvestigationModal('journal')}
        onOpenDetectiveNotes={() => modals.toggleInvestigationModal('notes')}
        onOpenCompass={() => modals.toggleInvestigationModal('compass')}
        onOpenDeduction={() => modals.toggleInvestigationModal('deduction')}
        onOpenGallery={() => modals.toggleInvestigationModal('gallery')}
        onOpenSaveSlots={() => modals.setSaveSlotModalState({ isOpen: true, mode: 'save' })}
        onRestart={() => {
          sound.playClick();
          modals.setShowResetConfirmModal(true);
        }}
        onReturnToTitle={game.handleReturnToTitle}
        onTriggerCrisisRescue={() => game.setIsMentalCrisisActive(true)}
        onOpenShortcutsHelp={() => modals.setShowShortcutsHelp(true)}
        uiStyleMode={game.uiStyleMode}
        onToggleUiStyleMode={game.handleToggleUiStyleMode}
      />

      {/* Quick Discovery Toast Banner */}
      <AnimatePresence>
        {game.toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-28 sm:top-32 left-1/2 -translate-x-1/2 z-[200] bg-amber-950/95 border border-amber-500 text-amber-200 px-4 py-2 rounded-xl text-xs font-serif shadow-2xl shadow-black/80 flex items-center gap-2 pointer-events-none backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{game.toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detective Low SAN Internal Monologue Toast (< 50 SAN) */}
      <AnimatePresence>
        {game.detectiveMonologue && (
          <motion.div
            key={game.detectiveMonologue.id}
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`fixed top-36 sm:top-40 left-1/2 -translate-x-1/2 z-[200] max-w-xl w-[92%] sm:w-auto px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl shadow-black/90 flex items-start gap-3 ${
              game.detectiveMonologue.isCritical
                ? 'bg-red-950/95 border-red-500/80 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.25)] ring-1 ring-red-500/40 animate-pulse'
                : 'bg-purple-950/95 border-purple-500/80 text-purple-100 shadow-[0_0_25px_rgba(168,85,247,0.2)] ring-1 ring-purple-500/30'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              game.detectiveMonologue.isCritical 
                ? 'bg-red-900/80 border border-red-400 text-red-300 shadow-md' 
                : 'bg-purple-900/80 border border-purple-400 text-purple-300 shadow-md'
            }`}>
              <Brain className="w-4 h-4 animate-bounce" />
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider font-bold mb-0.5">
                <span className={game.detectiveMonologue.isCritical ? 'text-red-400' : 'text-purple-400'}>
                  {game.detectiveMonologue.isCritical ? '【偵探精神緊繃 // 混亂獨白】' : '【偵探內心獨白 // 思緒低語】'}
                </span>
                {game.uiStyleMode !== 'retro2000' && (
                  <span className="text-neutral-400">• 理智低落</span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-serif italic tracking-wide leading-relaxed text-neutral-100 font-medium">
                {game.detectiveMonologue.text}
              </p>
            </div>

            <button
              onClick={() => game.setDetectiveMonologue(null)}
              className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              title="關閉心理獨白"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chapter Content Switcher */}
      <RetroForumWrapper
        uiStyleMode={game.uiStyleMode}
        onToggleUiStyleMode={game.handleToggleUiStyleMode}
        playerName={game.playerName}
        boardName={game.boardName}
        articleTitle={game.articleTitle}
        investigationDay={game.investigationDay}
        investigationDateText={game.currentDateText}
        currentLocationName={game.currentLocationName}
        completedWeek1={game.completedWeek1}
      >
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-2 sm:px-4 py-1.5 min-h-0 overflow-hidden flex flex-col">
          {game.currentChapter === 'prologue' && (
            <PrologueView
              key={`prologue_${game.gameSessionKey}`}
              playerName={game.playerName}
              onUpdatePlayerName={game.setPlayerName}
              boardName={game.boardName}
              onUpdateBoardName={game.setBoardName}
              articleTitle={game.articleTitle}
              onUpdateArticleTitle={game.setArticleTitle}
              selectedTrait={game.selectedTrait}
              onSelectTrait={game.setSelectedTrait}
              onTraitRevealed={() => game.setIsTraitRevealed(true)}
              investigationDateText={game.currentDateText}
              unlockedEndings={game.unlockedEndings}
              completedWeek1={game.completedWeek1}
              onProceedToApartment={() => {
                game.setIsTraitRevealed(true);
                game.setCurrentChapter('exploration');
                game.setCurrentLocationName('安祥路88號大樓 • 一樓大廳');
                game.handleAddJournalEntry({
                  category: 'action',
                  title: game.completedWeek1 ? '重返安祥路88號大樓（第八日白晝）' : '抵達安祥路88號大樓現場',
                  content: game.completedWeek1
                    ? '重返安祥路88號大樓。白天的陽光雖然灑在門廊前，但大樓內部的空間摺疊與認知威脅依然深不見底。'
                    : '日間抵達安祥路88號大樓。門口被枯黃藤蔓與舊路障圍繞，跨過積水，刷卡打開社區大樓的一樓防盜鐵門。現場透著不尋常的死寂，必須儘快尋找張浩留下的線索。',
                  location: '安祥路88號 • 1F 大廳'
                });
              }}
              onObtainItem={game.handleObtainItem}
              onAddJournalEntry={game.handleAddJournalEntry}
            />
          )}

          {game.currentChapter === 'exploration' && (
            <BuildingExplorer
              key={`building_${game.gameSessionKey}`}
              playerName={game.playerName}
              trait={game.selectedTrait}
              san={game.san}
              obtainedRules={game.obtainedRules}
              inventory={game.inventory}
              isCctvRebooted={game.isCctvRebooted}
              unlockedEndings={game.unlockedEndings}
              completedWeek1={game.completedWeek1}
              uiStyleMode={game.uiStyleMode}
              onLocationChange={game.setCurrentLocationName}
              onObtainRule={game.handleObtainRule}
              onObtainItem={game.handleObtainItem}
              onModifySan={game.handleModifySan}
              onSetCctvRebooted={() => game.setIsCctvRebooted(true)}
              onTriggerEnding={game.handleTriggerEnding}
              onRestInOffice={game.handleRestInOffice}
              onAddJournalEntry={game.handleAddJournalEntry}
              reduceEffects={game.reduceEffects}
              recoveryWindow={game.recoveryWindow}
              onSuccessfulDisposal={game.handleSuccessfulDisposal}
              onDecrementRecoveryWindow={game.handleDecrementRecoveryWindow}
              onConsumeItem={game.handleConsumeItem}
              onRemoveItem={game.handleRemoveItem}
            />
          )}

          {game.currentChapter === 'ending' && game.currentEnding && (
            game.currentEnding === 'ending0' ? (
              <ED0CaseReportCard
                playerName={game.playerName}
                investigationDay={game.investigationDay}
                investigationDateText={game.currentDateText}
                onProceedToTransition={() => {
                  game.setShowMetaTransition(true);
                }}
              />
            ) : (
              <EndingScreen
                endingId={game.currentEnding}
                san={game.san}
                playerName={game.playerName}
                trait={game.selectedTrait}
                inventory={game.inventory}
                obtainedRules={game.obtainedRules}
                journalLogs={game.journalLogs}
                freeNotes={game.freeNotes}
                investigationDay={game.investigationDay}
                investigationDateText={game.currentDateText}
                unlockedEndings={game.unlockedEndings}
                completedWeek1={game.completedWeek1}
                onProceedToWeek2={() => {
                  game.setShowMetaTransition(true);
                }}
                onRestart={() => {
                  sound.playClick();
                  modals.setShowResetConfirmModal(true);
                }}
                onOpenGallery={() => modals.setShowGallery(true)}
              />
            )
          )}
        </main>
      </RetroForumWrapper>

      {/* Rest Interstitial Modal */}
      <AnimatePresence>
        {game.activeRestInfo && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 select-none font-sans">
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 5 }}
              className="retro-forum-modal-window max-w-lg w-full shadow-xl overflow-hidden text-center"
            >
              {/* Header */}
              <div className="retro-forum-window-header shrink-0 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-[#ffffff]" />
                  <span className="font-bold text-xs sm:text-sm tracking-wide">
                    【事務所深夜休整記錄】— 第 {game.investigationDay} 天
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-[#f7faf5] space-y-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono font-bold text-[#1f4717] px-2 py-0.5 rounded-xs bg-[#eef5ec] border border-[#83ab79] inline-block">
                    CASE ADVANCEMENT // 日期推進
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#1a3964]">
                    返回私家偵探事務所小憩沉澱
                  </h3>
                  <div className="text-xs font-mono text-[#556652]">
                    {game.activeRestInfo.prevDateText} ➔ <b className="text-[#b8502a]">{game.activeRestInfo.newDateText}</b>
                  </div>
                </div>

                {/* SAN Delta indicator */}
                <div className={`p-2.5 rounded-xs border text-xs font-mono font-bold inline-flex items-center gap-2 ${
                  game.activeRestInfo.sanDelta > 0
                    ? 'bg-[#eef5ec] border-[#83ab79] text-[#1f4717]'
                    : game.activeRestInfo.sanDelta === 0
                      ? 'bg-[#ffffff] border-[#a8c2a1] text-[#556652]'
                      : 'bg-[#fdf2f2] border-[#d68b8b] text-[#9c2e2e]'
                }`}>
                  <Heart className="w-4 h-4" />
                  <span>
                    心理狀態感受：{game.activeRestInfo.sanDelta > 0 
                      ? '稍微提振精神，情緒穩定了一點' 
                      : game.activeRestInfo.sanDelta === 0 
                        ? '心境平和無明顯起伏' 
                        : '心緒混亂動盪，受到惡夢與怪談低語侵蝕'}
                  </span>
                </div>

                {/* Dream / Mental State Narrative */}
                <div className="p-4 rounded-xs bg-[#ffffff] border border-[#a8c2a1] text-xs sm:text-sm text-[#333333] leading-relaxed text-left shadow-2xs">
                  {game.activeRestInfo.dreamText}
                </div>

                <button
                  onClick={() => {
                    sound.playElevatorChime();
                    game.setActiveRestInfo(null);
                  }}
                  className="w-full py-2.5 rounded-xs bg-[#3e6634] hover:bg-[#33552a] text-[#ffffff] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#2d4d25] shadow-2xs transition-all cursor-pointer"
                >
                  <span>重整心神，返回安祥路88號大樓</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info Bar */}
      <footer className="border-t border-neutral-900/80 bg-black/60 py-1.5 px-4 text-center text-[10px] text-neutral-500 font-mono shrink-0 hidden md:block">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>
            {game.completedWeek1 
              ? 'ROOM 404: RULES CREEPYPASTA ARG // 規則類怪談沉浸式解謎' 
              : 'CASE 404: MISSING PERSON INVESTIGATION // 安祥路88號失聯調查'}
          </span>
          {game.completedWeek1 && (
            <span>REALITY INTEGRITY: {game.san >= 70 ? 'STABLE' : game.san >= 40 ? 'STRAINED' : 'CRITICAL'}</span>
          )}
        </div>
      </footer>

      {/* Modals */}
      <React.Suspense fallback={null}>
        {modals.showRulebook && (
        <RulesComparisonDeductionModal
          obtainedRules={game.obtainedRules}
          completedWeek1={game.completedWeek1}
          foundContradictions={game.foundContradictions}
          onAddContradiction={game.handleAddContradiction}
          onModifySan={game.handleModifySan}
          onObtainItem={game.handleObtainItem}
          onAddJournalEntry={game.handleAddJournalEntry}
          onClose={() => modals.setShowRulebook(false)}
        />
      )}

      {modals.showDossier && (
        <DossierModal
          inventory={game.inventory}
          playerName={game.playerName}
          san={game.san}
          onClose={() => modals.setShowDossier(false)}
          onOpenLetterPuzzle={() => modals.setShowLetterPuzzleModal(true)}
          onModifySan={game.handleModifySan}
          onConsumeContradictionNote={game.handleConsumeContradictionNote}
          onConsumeItem={game.handleConsumeItem}
          completedWeek1={game.completedWeek1}
          onAddJournalEntry={game.handleAddJournalEntry}
        />
      )}

      {/* Investigation Activity Log Modal */}
      {modals.showJournal && (
        <JournalModal
          logs={game.journalLogs}
          currentLocationName={game.currentLocationName}
          investigationDateText={game.currentDateText}
          investigationDay={game.investigationDay}
          completedWeek1={game.completedWeek1}
          onClose={() => modals.setShowJournal(false)}
        />
      )}

      {/* Detective Notes Modal (Extracted Note-taking System) */}
      {modals.showDetectiveNotes && (
        <DetectiveNotesModal
          inventory={game.inventory}
          obtainedRules={game.obtainedRules}
          freeNotes={game.freeNotes}
          currentLocationName={game.currentLocationName}
          investigationDateText={game.currentDateText}
          investigationDay={game.investigationDay}
          completedWeek1={game.completedWeek1}
          onAddFreeNote={game.handleAddFreeNote}
          onUpdateFreeNoteColor={game.handleUpdateFreeNoteColor}
          onDeleteFreeNote={game.handleDeleteFreeNote}
          onReorderFreeNotes={game.handleReorderFreeNotes}
          onClose={() => modals.setShowDetectiveNotes(false)}
        />
      )}

      {/* Deduction & Reasoning Matrix Modal */}
      {modals.showDeduction && (
        <DeductionBoardModal
          currentChapter={game.currentChapter}
          currentLocationName={game.currentLocationName}
          obtainedRules={game.obtainedRules}
          inventory={game.inventory}
          isCctvRebooted={game.isCctvRebooted}
          san={game.san}
          freeNotes={game.freeNotes}
          trait={game.selectedTrait}
          completedWeek1={game.completedWeek1}
          onAddFreeNote={game.handleAddFreeNote}
          onUpdateFreeNoteColor={game.handleUpdateFreeNoteColor}
          onDeleteFreeNote={game.handleDeleteFreeNote}
          onModifySan={game.handleModifySan}
          onTriggerEnding={game.handleTriggerEnding}
          onAddJournalEntry={game.handleAddJournalEntry}
          onClose={() => modals.setShowDeduction(false)}
        />
      )}

      {modals.showGallery && (
        <EndingGalleryModal
          unlockedEndings={game.unlockedEndings}
          completedWeek1={game.completedWeek1}
          playerName={game.playerName}
          onOpenSecretArchive={() => modals.setShowSecretArchive(true)}
          onClose={() => modals.setShowGallery(false)}
        />
      )}

      {/* Director's Cut Secret Archive Modal (ED8 True Dawn Reward) */}
      {modals.showSecretArchive && (
        <SecretArchiveModal
          playerName={game.playerName}
          onClose={() => modals.setShowSecretArchive(false)}
        />
      )}

      {modals.showLetterPuzzleModal && (
        <LetterPuzzle
          onComplete={() => {
            modals.setShowLetterPuzzleModal(false);
            game.handleObtainItem('shredded_letter');
            game.showToast('信件拼湊成功！已獲得物證【寄給404號房的信】');
          }}
          onClose={() => modals.setShowLetterPuzzleModal(false)}
        />
      )}

      {/* Pop-up Vintage Envelope Modal */}
      {modals.activeEnvelopeModal && (
        <VintageEnvelopeModal
          envelope={modals.activeEnvelopeModal}
          onClose={() => modals.setActiveEnvelopeModal(null)}
          onFinishedOpening={() => {}}
        />
      )}

      {/* Keyboard Shortcuts Reference Modal */}
      <KeyboardShortcutsModal
        isOpen={modals.showShortcutsHelp}
        onClose={() => modals.setShowShortcutsHelp(false)}
        hasUnlockedEndings={Boolean(game.unlockedEndings && game.unlockedEndings.length > 0)}
      />

      {/* Case Reset Confirmation Modal */}
      <AnimatePresence>
        {modals.showResetConfirmModal && (
          <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4 select-none font-sans">
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 5 }}
              className="retro-forum-modal-window max-w-md w-full shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="retro-forum-window-header shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#ffffff]" />
                  <span className="font-bold text-xs sm:text-sm tracking-wide">
                    【系統警告】重置所有遊戲進度
                  </span>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    modals.setShowResetConfirmModal(false);
                  }}
                  className="retro-forum-close-btn flex items-center justify-center cursor-pointer"
                  title="關閉"
                >
                  <X className="w-3 h-3 text-[#333333]" />
                </button>
              </div>

              <div className="p-5 bg-[#f7faf5] space-y-4 text-[#333333]">
                <div className="space-y-2 text-xs leading-relaxed">
                  <h3 className="text-sm font-bold text-[#b8502a]">
                    確定要重置所有遊戲進度嗎？
                  </h3>
                  <p className="text-[#555555]">
                    此操作將完全移除至目前為止的所有遊戲進度與證物，並恢復為初始狀態：
                  </p>
                  <div className="bg-[#ffffff] border border-[#a8c2a1] rounded-xs p-3 space-y-2 text-[11px] shadow-2xs">
                    <div className="flex items-start gap-1.5 text-[#9c2e2e]">
                      <span className="shrink-0 font-bold">⚠️</span>
                      <span><b>全數移除所有內容</b>：已搜集物證、解鎖文件、所有存檔紀錄、偵探便箋與調查進度。</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[#1f4717]">
                      <span className="shrink-0 font-bold">🔄</span>
                      <span><b>重新開始遊戲</b>：重置後將直接返回主選單，點擊開始遊戲將從頭展開調查。</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      modals.setShowResetConfirmModal(false);
                    }}
                    className="px-3.5 py-1.5 rounded-xs bg-[#ffffff] hover:bg-[#f4f8f2] border border-[#a8c2a1] text-[#333333] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    取消，返回
                  </button>

                  <button
                    onClick={() => {
                      modals.closeAllModals();
                      game.executeFullReset();
                    }}
                    className="px-3.5 py-1.5 rounded-xs bg-[#b8502a] hover:bg-[#9c3f1d] border border-[#852b12] text-[#ffffff] text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>確定清除所有內容並重新開始</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Slot & Progress Archive Management Modal */}
      <SaveSlotModal
        isOpen={modals.saveSlotModalState.isOpen}
        mode={modals.saveSlotModalState.mode}
        currentGameState={game.currentGameStateSnapshot}
        unlockedEndings={game.unlockedEndings}
        onClose={() => modals.setSaveSlotModalState(prev => ({ ...prev, isOpen: false }))}
        onSelectLoadSlot={(slotData) => {
          game.handleContinueGame(slotData);
        }}
        onSaveSuccess={(slotId) => {
          game.showToast(`★ 進度已封存至【檔案槽位 ${slotId === 'auto' ? '自動' : slotId.replace('slot', '')}】！`);
        }}
        onResetAllProgress={() => {
          modals.closeAllModals();
          game.executeFullReset();
        }}
      />

      {/* Floor Investigation Compass Modal */}
      {modals.showFloorCompass && (
        <FloorCompassModal
          isOpen={modals.showFloorCompass}
          currentLocId={game.currentLocId}
          completedWeek1={game.completedWeek1}
          context={{
            inventory: game.inventory,
            obtainedRules: game.obtainedRules,
            isCctvRebooted: game.isCctvRebooted,
            discoveredHiddenTraces: [],
            inspectedHotspots: [],
            foundContradictions: game.foundContradictions,
            investigationDay: game.investigationDay,
            trait: game.selectedTrait,
            san: game.san,
            completedWeek1: game.completedWeek1
          }}
          onClose={() => modals.setShowFloorCompass(false)}
        />
      )}

      {/* Mental Crisis Emergency Rescue Modal */}
      <MentalCrisisModal
        isOpen={game.isMentalCrisisActive}
        san={game.san}
        inventory={game.inventory}
        currentLocationName={game.currentLocationName}
        crisisRetreatCount={game.crisisRetreatCount}
        maxCrisisRetreats={game.maxCrisisRetreats}
        completedWeek1={game.completedWeek1}
        onSuccessRescue={game.handleSuccessMentalRescue}
        onEmergencyRetreat={game.handleEmergencyRetreatFromCrisis}
        onTotalBreakdown={game.handleTotalBreakdownFromCrisis}
      />

      {/* Main Title Screen Menu Overlay */}
      <AnimatePresence>
        {game.showTitleScreen && (
          <TitleScreenModal
            onStartNewGame={game.handleStartNewGame}
            onContinueGame={game.handleContinueGame}
            onOpenGallery={() => modals.setShowGallery(true)}
            onOpenSaveSlots={() => modals.setSaveSlotModalState({ isOpen: true, mode: 'load' })}
            onOpenSecretArchive={() => modals.setShowSecretArchive(true)}
            unlockedEndings={game.unlockedEndings}
            soundEnabled={game.soundEnabled}
            onToggleSound={game.handleToggleSound}
            completedWeek1={false}
            isInteractiveWeek2={false}
            onResetAllProgress={() => {
              modals.closeAllModals();
              game.executeFullReset();
            }}
          />
        )}
      </AnimatePresence>

      {/* Week 2 Interactive Title Screen */}
      <AnimatePresence>
        {game.showWeek2InteractiveTitle && (
          <TitleScreenModal
            onContinueGame={game.handleProceedWeek2FromInteractiveTitle}
            soundEnabled={game.soundEnabled}
            onToggleSound={game.handleToggleSound}
            completedWeek1={true}
            isInteractiveWeek2={true}
            onResetAllProgress={() => {
              modals.closeAllModals();
              game.executeFullReset();
            }}
          />
        )}
      </AnimatePresence>

      {/* Meta Narrative Week 1 -> Week 2 Transition Sequence Modal */}
      <MetaTransitionModal
        isOpen={game.showMetaTransition}
        playerName={game.playerName}
        boardName={game.boardName}
        articleTitle={game.articleTitle}
        onFinishTransition={() => {
          game.setShowMetaTransition(false);
          game.setCompletedWeek1(true);
          try {
            localStorage.setItem('completed_week1', 'true');
          } catch {}
          game.setShowTitleScreen(false);
          game.setShowWeek2InteractiveTitle(true);
          game.setCurrentChapter('prologue');
          game.setCurrentLocationName('私家偵探事務所');
          game.setInvestigationDay(8);
          game.setGameDate(prev => {
            const next = { ...prev };
            next.day += 7;
            if (next.day > 28) {
              next.day = next.day - 28;
              next.month = (next.month % 12) + 1;
            }
            return next;
          });
        }}
      />
      </React.Suspense>
    </div>
  );
}
