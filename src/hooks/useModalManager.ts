import { useState, useCallback } from 'react';
import { VintageEnvelopeData } from '../components/VintageEnvelopeModal';

export type ActiveInvestigationModal =
  | 'rulebook'
  | 'dossier'
  | 'journal'
  | 'notes'
  | 'compass'
  | 'deduction'
  | 'gallery'
  | null;

export interface SaveSlotModalState {
  isOpen: boolean;
  mode: 'save' | 'load';
}

export function useModalManager() {
  // Main investigation modal state (single-active at a time)
  const [activeInvestigationModal, setActiveInvestigationModal] = useState<ActiveInvestigationModal>(null);

  const toggleInvestigationModal = useCallback((modal: ActiveInvestigationModal) => {
    setActiveInvestigationModal(prev => (prev === modal ? null : modal));
  }, []);

  const closeInvestigationModal = useCallback(() => {
    setActiveInvestigationModal(null);
  }, []);

  // Backward-compatibility getters
  const showRulebook = activeInvestigationModal === 'rulebook';
  const showDossier = activeInvestigationModal === 'dossier';
  const showJournal = activeInvestigationModal === 'journal';
  const showDetectiveNotes = activeInvestigationModal === 'notes';
  const showFloorCompass = activeInvestigationModal === 'compass';
  const showDeduction = activeInvestigationModal === 'deduction';
  const showGallery = activeInvestigationModal === 'gallery';

  // Backward-compatibility setters
  const setShowRulebook = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setActiveInvestigationModal(prev => {
      const isCur = prev === 'rulebook';
      const next = typeof open === 'function' ? open(isCur) : open;
      return next ? 'rulebook' : (isCur ? null : prev);
    });
  }, []);

  const setShowDossier = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setActiveInvestigationModal(prev => {
      const isCur = prev === 'dossier';
      const next = typeof open === 'function' ? open(isCur) : open;
      return next ? 'dossier' : (isCur ? null : prev);
    });
  }, []);

  const setShowJournal = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setActiveInvestigationModal(prev => {
      const isCur = prev === 'journal';
      const next = typeof open === 'function' ? open(isCur) : open;
      return next ? 'journal' : (isCur ? null : prev);
    });
  }, []);

  const setShowDetectiveNotes = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setActiveInvestigationModal(prev => {
      const isCur = prev === 'notes';
      const next = typeof open === 'function' ? open(isCur) : open;
      return next ? 'notes' : (isCur ? null : prev);
    });
  }, []);

  const setShowFloorCompass = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setActiveInvestigationModal(prev => {
      const isCur = prev === 'compass';
      const next = typeof open === 'function' ? open(isCur) : open;
      return next ? 'compass' : (isCur ? null : prev);
    });
  }, []);

  const setShowDeduction = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setActiveInvestigationModal(prev => {
      const isCur = prev === 'deduction';
      const next = typeof open === 'function' ? open(isCur) : open;
      return next ? 'deduction' : (isCur ? null : prev);
    });
  }, []);

  const setShowGallery = useCallback((open: boolean | ((prev: boolean) => boolean)) => {
    setActiveInvestigationModal(prev => {
      const isCur = prev === 'gallery';
      const next = typeof open === 'function' ? open(isCur) : open;
      return next ? 'gallery' : (isCur ? null : prev);
    });
  }, []);

  // Auxiliary overlays and modals
  const [showSecretArchive, setShowSecretArchive] = useState<boolean>(false);
  const [showLetterPuzzleModal, setShowLetterPuzzleModal] = useState<boolean>(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [activeEnvelopeModal, setActiveEnvelopeModal] = useState<VintageEnvelopeData | null>(null);
  const [saveSlotModalState, setSaveSlotModalState] = useState<SaveSlotModalState>({
    isOpen: false,
    mode: 'load'
  });

  const closeAllModals = useCallback(() => {
    setActiveInvestigationModal(null);
    setShowSecretArchive(false);
    setShowLetterPuzzleModal(false);
    setShowShortcutsHelp(false);
    setActiveEnvelopeModal(null);
    setShowResetConfirmModal(false);
    setSaveSlotModalState(prev => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  }, []);

  return {
    activeInvestigationModal,
    setActiveInvestigationModal,
    toggleInvestigationModal,
    closeInvestigationModal,
    showRulebook,
    showDossier,
    showJournal,
    showDetectiveNotes,
    showFloorCompass,
    showDeduction,
    showGallery,
    setShowRulebook,
    setShowDossier,
    setShowJournal,
    setShowDetectiveNotes,
    setShowFloorCompass,
    setShowDeduction,
    setShowGallery,
    showSecretArchive,
    setShowSecretArchive,
    showLetterPuzzleModal,
    setShowLetterPuzzleModal,
    showShortcutsHelp,
    setShowShortcutsHelp,
    showResetConfirmModal,
    setShowResetConfirmModal,
    activeEnvelopeModal,
    setActiveEnvelopeModal,
    saveSlotModalState,
    setSaveSlotModalState,
    closeAllModals
  };
}
