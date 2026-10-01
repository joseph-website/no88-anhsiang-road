import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  ChapterId, 
  EndingId, 
  TraitId, 
  JournalEntry, 
  FreeNote, 
  NoteColorTheme, 
  SavedGameData,
  UIStyleMode
} from '../types';
import { sound } from '../services/soundEngine';
import { VINTAGE_ENVELOPES } from '../data/envelopeData';
import { VintageEnvelopeData } from '../components/VintageEnvelopeModal';
import { SAVE_KEY } from '../components/TitleScreenModal';
import { autoSaveEndingClearance, wipeEntireGameProgress } from '../services/saveSystem';
import { VisualAtmosphereMode } from '../components/VintagePaperGrainOverlay';
import { 
  safeStorageGet, 
  safeStorageSet, 
  safeStorageRemove, 
  safeStorageGetJSON, 
  safeStorageSetJSON 
} from '../services/storageHelper';
import { INVENTORY_ITEMS } from '../data/rulesData';

export const ENDINGS_KEY = 'ROOM_404_UNLOCKED_ENDINGS_V2';

// SAN changes for consecutive rests: +8, +4, +1, -1, -5, -10
export const REST_SAN_DELTAS = [8, 4, 1, -1, -5, -10];

export const REST_DREAM_TEXTS = [
  '在事務所的舊皮沙發上合眼小睡了幾小時。窗外雨聲漸弱，你的心緒稍微平靜了些許。',
  '你試圖入眠，但耳邊隱隱迴盪著老舊電梯的嗡鳴與水滴聲。醒來時身軀沉重，只感到短暫的喘息。',
  '大腦如灌了鉛般昏沉。剛閉上眼，眼前便浮現安祥路大樓幽暗的走廊。睡眠未能帶來多少慰藉。',
  '你在午夜冷汗中驚醒——夢中一名身穿紅色制服的模糊人影正站在辦公桌前直視著你！心跳狂跳不止。',
  '惡夢如附骨之蛆！你夢見自己被反鎖在404號房，四周牆壁爬滿了相互矛盾的血色規則。醒來時頭痛欲裂，理智反遭侵蝕！',
  '無論你躲回哪裡，404號房的低語始終在你的耳膜深處共鳴。你深知時間所剩無幾，絕不能再拖延下去了！'
];

export const DETECTIVE_LOW_SAN_MONOLOGUES = [
  {
    minSan: 35,
    maxSan: 49,
    quotes: [
      '「走廊的腳步聲……到底是我自己的回音，還是門後面那個人的……？」',
      '「不要相信眼睛看到的號碼牌……冷靜點，林偵探，你的呼吸太急促了……」',
      '「手心全都是冷汗……剛才轉角處閃過的那抹紅色制服，絕對不是錯覺！」',
      '「冷靜……先回想一下住戶公約第三條……不對，那條到底是不是真的？！」',
      '「四周的空氣好沉重……這棟樓的走廊，怎麼好像比剛才進來時更窄了……」',
      '「耳朵裡一直有電流滋滋作響的雜音……是誰在監視我？還是電梯井的線路？」'
    ]
  },
  {
    minSan: 0,
    maxSan: 34,
    quotes: [
      '「腦袋快要裂開了……那些相互矛盾的條款……到底哪一條才不會讓我死在這裡？！」',
      '「打字機的聲音又響了！咔噠、咔噠……是誰在四樓沒日沒夜地敲那些紙條……？！」',
      '「張浩……你當時也是聽著這些混亂的低語，一步步走進404號房的嗎……？」',
      '「視線在模糊……牆上的水漬影子好像在呼吸蠕動……不可以眨眼，絕對不能！」',
      '「這棟樓根本沒有第四層……那現在踩在我腳底下的地板到底是什麼？！」',
      '「耳鳴聲越來越尖銳了……別聽它說話……別照著它唸……別回頭看身後！」',
      '「鏡子裡的倒影……剛才是不是比我慢了半秒才轉頭看我……？！」'
    ]
  }
];

export function generateInitialDate() {
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 26) + 1;
  return { year: 2012, month, day };
}

export function formatDateText(d: { year: number; month: number; day: number }) {
  return `${d.year}年${String(d.month).padStart(2, '0')}月${String(d.day).padStart(2, '0')}日`;
}

interface UseGameStateOptions {
  onOpenEnvelope?: (envelope: VintageEnvelopeData) => void;
}

export function useGameState(options: UseGameStateOptions = {}) {
  const { onOpenEnvelope } = options;

  // Load persisted unlocked endings from localStorage with safe fallback
  const [unlockedEndings, setUnlockedEndings] = useState<EndingId[]>(() => {
    return safeStorageGetJSON<EndingId[]>(ENDINGS_KEY, []);
  });

  // Date and rest tracking
  const [gameDate, setGameDate] = useState(() => generateInitialDate());
  const [investigationDay, setInvestigationDay] = useState<number>(1);
  const [restCount, setRestCount] = useState<number>(0);

  // Active rest narrative interstitial
  const [activeRestInfo, setActiveRestInfo] = useState<{
    prevDateText: string;
    newDateText: string;
    sanDelta: number;
    dreamText: string;
  } | null>(null);

  const [gameSessionKey, setGameSessionKey] = useState<number>(0);
  const [showTitleScreen, setShowTitleScreen] = useState<boolean>(true);

  // Core gameplay state
  const [playerName, setPlayerName] = useState<string>('');
  const [boardName, setBoardName] = useState<string>(() => {
    return safeStorageGet('ROOM404_BOARD_NAME') || '怪談';
  });
  const [articleTitle, setArticleTitle] = useState<string>(() => {
    return safeStorageGet('ROOM404_ARTICLE_TITLE') || '那棟大樓';
  });

  const handleUpdateBoardName = useCallback((name: string) => {
    const val = name && name.trim() ? name.trim() : '怪談';
    setBoardName(val);
    safeStorageSet('ROOM404_BOARD_NAME', val);
  }, []);

  const handleUpdateArticleTitle = useCallback((title: string) => {
    const val = title && title.trim() ? title : '那棟大樓';
    setArticleTitle(val);
    safeStorageSet('ROOM404_ARTICLE_TITLE', val);
  }, []);

  const [selectedTrait, setSelectedTrait] = useState<TraitId>('rationalist');
  const [isTraitRevealed, setIsTraitRevealed] = useState<boolean>(false);
  const [san, setSan] = useState<number>(100);
  const [currentChapter, setCurrentChapter] = useState<ChapterId>('prologue');
  const [currentLocationName, setCurrentLocationName] = useState<string>('私家偵探事務所');
  const [obtainedRules, setObtainedRules] = useState<string[]>([]);
  const [inventory, setInventory] = useState<string[]>([]);
  const [isCctvRebooted, setIsCctvRebooted] = useState<boolean>(false);
  const [currentEnding, setCurrentEnding] = useState<EndingId | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [visualMode, setVisualMode] = useState<VisualAtmosphereMode>('classic');

  // Reduce visual effects setting
  const [reduceEffects, setReduceEffects] = useState<boolean>(() => {
    return safeStorageGet('ROOM404_REDUCE_EFFECTS') === 'true';
  });

  // Week 1 / Week 2 state (localStorage backed)
  const [completedWeek1, setCompletedWeek1] = useState<boolean>(() => {
    return safeStorageGet('completed_week1') === 'true';
  });
  const [showMetaTransition, setShowMetaTransition] = useState<boolean>(false);
  const [showWeek2InteractiveTitle, setShowWeek2InteractiveTitle] = useState<boolean>(false);

  // Mental crisis modal state
  const [isMentalCrisisActive, setIsMentalCrisisActive] = useState<boolean>(false);
  const [crisisRetreatCount, setCrisisRetreatCount] = useState<number>(0);

  // Recovery Window after successfully disposing tier 2/3 anomalies (disables random anomalies)
  const [recoveryWindow, setRecoveryWindow] = useState<number>(0);

  // Found Rule Contradictions (localStorage backed)
  const [foundContradictions, setFoundContradictions] = useState<string[]>(() => {
    return safeStorageGetJSON<string[]>('ROOM404_FOUND_CONTRADICTIONS', []);
  });

  // Investigation Journal Logs state
  const [journalLogs, setJournalLogs] = useState<JournalEntry[]>([]);

  // Toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isResettingCaseRef = useRef<boolean>(false);

  // Detective internal monologue
  const [detectiveMonologue, setDetectiveMonologue] = useState<{
    id: string;
    text: string;
    isCritical: boolean;
  } | null>(null);
  const lastMonologueTextRef = useRef<string>('');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  const triggerDetectiveMonologue = useCallback((currentSan: number) => {
    const isCritical = currentSan <= 34;
    const tier = isCritical 
      ? DETECTIVE_LOW_SAN_MONOLOGUES[1] 
      : DETECTIVE_LOW_SAN_MONOLOGUES[0];

    const availableQuotes = tier.quotes.filter(q => q !== lastMonologueTextRef.current);
    const chosen = availableQuotes.length > 0
      ? availableQuotes[Math.floor(Math.random() * availableQuotes.length)]
      : tier.quotes[Math.floor(Math.random() * tier.quotes.length)];

    lastMonologueTextRef.current = chosen;
    const monologueId = `monologue_${Date.now()}`;
    setDetectiveMonologue({
      id: monologueId,
      text: chosen,
      isCritical
    });

    setTimeout(() => {
      setDetectiveMonologue(prev => (prev?.id === monologueId ? null : prev));
    }, 5500);
  }, []);

  const currentDateText = useMemo(() => formatDateText(gameDate), [gameDate]);

  // Free Notes State (localStorage backed)
  const [freeNotes, setFreeNotes] = useState<FreeNote[]>(() => {
    return safeStorageGetJSON<FreeNote[]>('ROOM404_FREE_NOTES', []);
  });

  // Helper for adding journal logs
  const handleAddJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    const newEntry: JournalEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: `${currentDateText} (第${investigationDay}天)`,
      ...entry
    };
    setJournalLogs(prev => [...prev, newEntry]);
  }, [currentDateText, investigationDay]);

  // Handle adding free notes
  const handleAddFreeNote = useCallback((
    text: string, 
    category: 'clue' | 'rule' | 'suspect' | 'general' = 'clue', 
    tags: string[] = [],
    colorTag: NoteColorTheme = 'amber',
    customTagLabel?: string
  ) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    sound.playPaper();

    const newNote: FreeNote = {
      id: `fnote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: trimmed,
      timestamp: `${currentDateText} (第${investigationDay}天)`,
      location: currentLocationName,
      category,
      tags,
      colorTag,
      customTagLabel
    };

    setFreeNotes(prev => {
      const next = [newNote, ...prev];
      safeStorageSetJSON('ROOM404_FREE_NOTES', next);
      return next;
    });

    // Synchronize to journalLogs
    const tagPrefix = tags.length > 0 ? tags.map(t => `[${t}]`).join('') + ' ' : '';
    const colorLabel = customTagLabel ? `[${customTagLabel}] ` : '';
    handleAddJournalEntry({
      category: 'action',
      title: `【偵探筆記】${colorLabel}${tagPrefix}手記線索記錄`,
      content: trimmed,
      location: currentLocationName,
      highlightBadge: '偵探手記'
    });

    showToast('★ 偵探手記已記錄並同步至活動紀錄！');
  }, [currentDateText, investigationDay, currentLocationName, handleAddJournalEntry, showToast]);

  const handleUpdateFreeNoteColor = useCallback((id: string, colorTag: NoteColorTheme, customTagLabel?: string) => {
    sound.playClick();
    setFreeNotes(prev => {
      const next = prev.map(note => {
        if (note.id === id) {
          return {
            ...note,
            colorTag,
            customTagLabel: customTagLabel !== undefined ? customTagLabel : note.customTagLabel
          };
        }
        return note;
      });
      safeStorageSetJSON('ROOM404_FREE_NOTES', next);
      return next;
    });
    showToast('★ 已更新筆記顏色標籤！');
  }, [showToast]);

  const handleDeleteFreeNote = useCallback((id: string) => {
    sound.playClick();
    setFreeNotes(prev => {
      const next = prev.filter(n => n.id !== id);
      safeStorageSetJSON('ROOM404_FREE_NOTES', next);
      return next;
    });
  }, []);

  const handleReorderFreeNotes = useCallback((newNotes: FreeNote[]) => {
    setFreeNotes(newNotes);
    safeStorageSetJSON('ROOM404_FREE_NOTES', newNotes);
  }, []);

  const handleAddContradiction = useCallback((title: string, _sanReward: number = 4) => {
    setFoundContradictions(prev => {
      if (prev.includes(title)) return prev;
      const next = [...prev, title];
      safeStorageSetJSON('ROOM404_FOUND_CONTRADICTIONS', next);
      return next;
    });
    showToast(`★ 破解規則矛盾【${title}】！思緒明朗，理智重獲鞏固。`);
  }, [showToast]);

  const handleToggleReduceEffects = useCallback(() => {
    setReduceEffects(prev => {
      const next = !prev;
      safeStorageSet('ROOM404_REDUCE_EFFECTS', next ? 'true' : 'false');
      sound.playClick();
      showToast(next ? '★ 特效減輕模式已開啟（全畫面覆蓋特效降為30%）' : '★ 特效減輕模式已關閉（還原標準視覺）');
      return next;
    });
  }, [showToast]);

  const handleToggleWeekMode = useCallback(() => {
    setCompletedWeek1(prev => {
      const nextVal = !prev;
      safeStorageSet('completed_week1', nextVal ? 'true' : 'false');
      return nextVal;
    });
  }, []);

  // Rules and Items Handlers
  const handleObtainRule = useCallback((ruleId: string) => {
    if (!obtainedRules.includes(ruleId)) {
      sound.playPaper();
      setObtainedRules(prev => [...prev, ruleId]);

      if (!completedWeek1) {
        showToast(`★ 已勘查客廳生活備忘單，確認租客近期生活跡證。`);
        return;
      }

      const isFirst = obtainedRules.length === 0;
      if (isFirst) {
        showToast(`★ 發現大樓管理規約！已解鎖頂部【大樓規則】查閱手冊。`);
      } else {
        showToast(`★ 新大樓規約已收錄至規則手冊！`);
      }

      if (VINTAGE_ENVELOPES[ruleId] && onOpenEnvelope) {
        setTimeout(() => {
          onOpenEnvelope(VINTAGE_ENVELOPES[ruleId]);
        }, 350);
      }
    }
  }, [obtainedRules, completedWeek1, showToast, onOpenEnvelope]);

  const handleObtainItem = useCallback((itemId: string) => {
    if (!inventory.includes(itemId)) {
      sound.playPaper();
      setInventory(prev => [...prev, itemId]);
      showToast(`★ 獲得關鍵物證！已收納至證物檔案袋。`);

      if (VINTAGE_ENVELOPES[itemId] && onOpenEnvelope) {
        setTimeout(() => {
          onOpenEnvelope(VINTAGE_ENVELOPES[itemId]);
        }, 350);
      }
    }
  }, [inventory, showToast, onOpenEnvelope]);

  const handleRemoveItem = useCallback((itemId: string) => {
    setInventory(prev => prev.filter(id => id !== itemId));
  }, []);

  // Sanity manipulation
  const handleModifySan = useCallback((delta: number) => {
    if (typeof delta !== 'number' || isNaN(delta)) return;

    if (!completedWeek1) {
      if (delta < 0) {
        const desc = delta <= -15
          ? '【初次調查・心理動搖】心頭一緊感到些許異樣，但偵探的職業經驗讓你深吸一口氣，維持冷靜專注'
          : '【初次調查・心緒微動】察覺到現場一絲不協調，但心智並未受到任何實質損耗';
        showToast(`★ ${desc}`);
      } else if (delta > 0) {
        const desc = '【初次調查・鎮定自持】深呼吸平復情緒，你的精神狀態始終維持在穩定狀態';
        showToast(`★ ${desc}`);
      }
      return;
    }

    setSan(prev => {
      const currentSan = typeof prev === 'number' && !isNaN(prev) ? prev : 100;
      const next = Math.max(0, Math.min(100, currentSan + delta));
      if (delta < 0) {
        sound.playGlitch();
        const desc = delta <= -15 ? '精神受到嚴重衝擊，思緒劇烈動盪' : '心緒瞬間混亂了一下，感到些微不安';
        showToast(`⚠ ${desc}`);

        if (next < 50) {
          setTimeout(() => {
            triggerDetectiveMonologue(next);
          }, 300);
        }
      } else if (delta > 0) {
        const desc = delta >= 10 ? '精神大幅振奮，重拾了清晰的理智' : '稍微提振精神，情緒穩定了一點';
        showToast(`★ ${desc}`);
      }
      if (next <= 0 && currentChapter !== 'ending') {
        setIsMentalCrisisActive(true);
      }
      return next;
    });
  }, [completedWeek1, showToast, triggerDetectiveMonologue, currentChapter]);

  // Mental Crisis Handlers
  const handleSuccessMentalRescue = useCallback((recoveredSan: number, methodDescription: string, consumedItemId?: string) => {
    setIsMentalCrisisActive(false);
    if (consumedItemId) {
      setInventory(prev => prev.filter(id => id !== consumedItemId));
    }
    setSan(recoveredSan);
    sound.playResolutionChord();
    showToast(`★ 意識重歸清明！成功驅散精神幻覺，脫離崩潰邊緣。`);
    handleAddJournalEntry({
      category: 'action',
      title: '意識崩潰自救成功 // MENTAL RECOVERY',
      content: methodDescription,
      location: currentLocationName,
      sanDelta: recoveredSan
    });
  }, [showToast, handleAddJournalEntry, currentLocationName]);

  const handleConsumeItem = useCallback((itemId: string) => {
    const item = INVENTORY_ITEMS[itemId];
    if (!item || !item.isConsumable) return false;
    if (!inventory.includes(itemId)) return false;

    // Consume item: remove from inventory
    setInventory(prev => prev.filter(id => id !== itemId));
    const amount = item.recoverySanAmount || 10;
    handleModifySan(amount);
    sound.playResolutionChord();

    const gradeText = item.recoveryGrade === 'significant'
      ? '大幅穩定精神'
      : item.recoveryGrade === 'moderate'
      ? '小幅穩定精神'
      : '稍微穩定精神';

    if (completedWeek1) {
      showToast(`★ 使用了【${item.name}】：${gradeText} (+${amount} SAN)！`);
    } else {
      showToast(`★ 使用了【${item.name}】，精神稍作舒緩放鬆。`);
    }

    handleAddJournalEntry({
      category: 'action',
      title: `使用物資 • ${item.name}`,
      content: completedWeek1
        ? `在安全區取出【${item.name}】使用。熟悉平凡的現實體驗讓緊繃的神經得以舒緩，精神狀態重獲穩定（${gradeText}）。`
        : `在安全區取出【${item.name}】食用，稍作歇息以提振精神。`,
      location: currentLocationName,
      sanDelta: amount,
      highlightBadge: '物資回復'
    });

    return true;
  }, [inventory, handleModifySan, completedWeek1, showToast, handleAddJournalEntry, currentLocationName]);

  const handleConsumeContradictionNote = useCallback(() => {
    if (san >= 30) return false;
    if (!inventory.includes('contradiction_deduction_note')) return false;

    // Consume note: remove from inventory
    setInventory(prev => prev.filter(id => id !== 'contradiction_deduction_note'));
    handleModifySan(15);
    sound.playPaper();
    sound.playResolutionChord();
    showToast('★ 研讀【怪談破綻筆記】：理性論證瓦解恐懼，精神狀態回穩，心智重獲鞏固！');

    handleAddJournalEntry({
      category: 'action',
      title: '研讀怪談破綻筆記 • 鞏固認知防線',
      content: '在理智即將失守之際，取出條理分明的規則矛盾手稿逐行細讀。客觀的邏輯漏洞徹底撕破了不可名狀的壓迫感，心智重獲寶貴的穩定錨點。',
      location: currentLocationName,
      sanDelta: 15,
      highlightBadge: 'LOGIC_ANCHOR'
    });

    return true;
  }, [san, inventory, handleModifySan, showToast, handleAddJournalEntry, currentLocationName]);

  const handleSuccessfulDisposal = useCallback((tier: 1 | 2 | 3) => {
    if (tier === 2 || tier === 3) {
      handleModifySan(5);
      setRecoveryWindow(2);
      showToast('★ 成功破解高危異象！精神壓力得以舒緩，爭取到安全呼吸窗口（移動2次內異象暫歇）。');
    }
  }, [handleModifySan, showToast]);

  const handleDecrementRecoveryWindow = useCallback(() => {
    setRecoveryWindow(prev => {
      if (prev <= 0) return 0;
      const next = prev - 1;
      if (next === 0) {
        showToast('ℹ 異象安全期已結束，請隨時提高警覺。');
      }
      return next;
    });
  }, [showToast]);

  // Trigger Ending
  const handleTriggerEnding = useCallback((endingId: EndingId) => {
    setCurrentEnding(endingId);
    setCurrentChapter('ending');
    setCurrentLocationName('案件終局紀錄');

    handleAddJournalEntry({
      category: 'system',
      title: `案件迎來終局判定 // CASE CONCLUSION`,
      content: `案件調查告一段落，觸發結局判定【${endingId}】。`,
      location: '安祥路88號'
    });

    setUnlockedEndings(prev => {
      const updated = !prev.includes(endingId) ? [...prev, endingId] : prev;
      if (!prev.includes(endingId)) {
        safeStorageSetJSON(ENDINGS_KEY, updated);
      }
      return updated;
    });

    // 結局結算時解鎖怪異工作手冊【調查員守則】（非正常探索取得，而是進入結局/接觸深淵時獲得）
    setObtainedRules(prev => {
      if (!prev.includes('rule_investigator')) {
        return [...prev, 'rule_investigator'];
      }
      return prev;
    });

    const finalObtainedRules = !obtainedRules.includes('rule_investigator')
      ? [...obtainedRules, 'rule_investigator']
      : obtainedRules;

    const endingSnapshot: SavedGameData = {
      version: 1,
      saveTimestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
      playerName,
      boardName,
      articleTitle,
      selectedTrait,
      isTraitRevealed,
      san,
      currentChapter: 'ending',
      currentLocationName: '案件終局紀錄',
      obtainedRules: finalObtainedRules,
      inventory,
      isCctvRebooted,
      currentEnding: endingId,
      investigationDay,
      gameDate,
      restCount,
      foundContradictions,
      freeNotes,
      journalLogs,
      unlockedEndings: !unlockedEndings.includes(endingId) ? [...unlockedEndings, endingId] : unlockedEndings,
      completedWeek1
    };

    autoSaveEndingClearance(endingId, endingSnapshot);
    showToast(`★ 達成結局！已自動將破關檔案與後日談封存至【結局專屬存檔槽位】。`);
  }, [
    handleAddJournalEntry,
    unlockedEndings,
    playerName,
    selectedTrait,
    isTraitRevealed,
    san,
    obtainedRules,
    inventory,
    isCctvRebooted,
    investigationDay,
    gameDate,
    restCount,
    foundContradictions,
    freeNotes,
    journalLogs,
    completedWeek1,
    showToast
  ]);

  const handleTotalBreakdownFromCrisis = useCallback(() => {
    setIsMentalCrisisActive(false);
    handleTriggerEnding('ending4');
  }, [handleTriggerEnding]);

  const MAX_CRISIS_RETREATS = 3;

  const handleEmergencyRetreatFromCrisis = useCallback(() => {
    setIsMentalCrisisActive(false);
    const nextCount = crisisRetreatCount + 1;
    setCrisisRetreatCount(nextCount);

    if (nextCount > MAX_CRISIS_RETREATS) {
      sound.playGlitch();
      showToast('💀 精神防線徹底崩解，已無法再承受更多折磨……');
      handleTotalBreakdownFromCrisis();
      return;
    }

    setSan(30);

    const nextDate = { ...gameDate };
    nextDate.day += 1;
    if (nextDate.day > 28) {
      nextDate.day = 1;
      nextDate.month = (nextDate.month % 12) + 1;
    }

    setGameDate(nextDate);
    setInvestigationDay(prev => prev + 1);
    setCurrentLocationName('安祥路88號 1F大廳');

    const remainingChances = MAX_CRISIS_RETREATS - nextCount;
    if (remainingChances > 0) {
      showToast(`★ 意識瀕危：再來${remainingChances}次可能精神會受不了`);
    } else {
      showToast('★ 意識瀕危：心智已逼近極限，已無退路可言！');
    }

    handleAddJournalEntry({
      category: 'action',
      title: '意識瀕危 • 狼狽逃離危險樓層',
      content: remainingChances > 0
        ? `在狂亂的幻聽與視野扭曲中盲目逃向一樓大廳，撞開大門摔在水泥地上大口喘息，勉強保住了理智。再來${remainingChances}次可能精神會受不了。整整耗費了一天的休整時間。`
        : `在狂亂的幻聽與視野扭曲中盲目逃向一樓大廳，撞開大門摔在水泥地上大口喘息。心智防線已徹底逼近極限，已無退路可言！整整耗費了一天的休整時間。`,
      location: '安祥路88號 1F大廳',
      sanDelta: 30
    });
  }, [crisisRetreatCount, handleTotalBreakdownFromCrisis, gameDate, showToast, handleAddJournalEntry]);

  // Rest in Office Mechanic
  const handleRestInOffice = useCallback(() => {
    sound.playPhoneTone();
    
    const deltaIndex = Math.min(restCount, REST_SAN_DELTAS.length - 1);
    const sanDelta = REST_SAN_DELTAS[deltaIndex];
    const dreamText = REST_DREAM_TEXTS[deltaIndex];

    const prevDateStr = formatDateText(gameDate);

    const nextDate = { ...gameDate };
    nextDate.day += 1;
    if (nextDate.day > 28) {
      nextDate.day = 1;
      nextDate.month = (nextDate.month % 12) + 1;
    }

    const newDateStr = formatDateText(nextDate);

    setGameDate(nextDate);
    setInvestigationDay(prev => prev + 1);
    setRestCount(prev => prev + 1);

    setSan(prev => Math.max(0, Math.min(100, prev + sanDelta)));

    handleAddJournalEntry({
      category: 'action',
      title: `返回事務所休整（第 ${investigationDay + 1} 天）`,
      content: `暫時離開安祥路88號大樓回到事務所沙發小憩。${dreamText}`,
      location: '私家偵探事務所',
      sanDelta
    });

    setActiveRestInfo({
      prevDateText: prevDateStr,
      newDateText: newDateStr,
      sanDelta,
      dreamText
    });
  }, [restCount, gameDate, investigationDay, handleAddJournalEntry]);

  // Audio Toggle
  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      sound.setMuted(!next);
      return next;
    });
  }, []);

  // Visual Filter Mode Toggle
  const handleToggleVisualMode = useCallback(() => {
    setVisualMode((prev) => {
      if (prev === 'classic') {
        showToast('已切換風格：【🗞️ 復古報紙印刷與網點】');
        return 'newspaper';
      }
      if (prev === 'newspaper') {
        showToast('已切換風格：【📺 懷舊顯像管 CRT 掃描線】');
        return 'crt';
      }
      if (prev === 'crt') {
        showToast('已切換風格：【📁 純淨清晰視野】');
        return 'clean';
      }
      showToast('已切換風格：【🗞️📺 報紙 × CRT 雙重沉浸】');
      return 'classic';
    });
  }, [showToast]);

  // UI Style Mode: 'retro2000' (2000s Web 1.5 / BBS Ghost Lore Forum - Direction B) vs 'modern'
  // Defaulting to 'retro2000' as requested by the user, while preserving immediate reversible switching
  const [uiStyleMode, setUiStyleMode] = useState<UIStyleMode>(() => {
    const saved = safeStorageGet('ROOM404_UI_STYLE_MODE');
    return (saved === 'modern' || saved === 'retro2000') ? saved : 'retro2000';
  });

  const handleToggleUiStyleMode = useCallback(() => {
    setUiStyleMode((prev) => {
      const next: UIStyleMode = prev === 'retro2000' ? 'modern' : 'retro2000';
      safeStorageSet('ROOM404_UI_STYLE_MODE', next);
      sound.playClick();
      showToast(next === 'retro2000' ? '已切換為【2000年代復古介面風格】' : '已恢復【現代偵探手冊風格】');
      return next;
    });
  }, [showToast]);

  // Current game state snapshot helper
  const currentGameStateSnapshot: SavedGameData = useMemo(() => ({
    version: 1,
    saveTimestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
    playerName,
    boardName,
    articleTitle,
    selectedTrait,
    isTraitRevealed,
    san,
    currentChapter,
    currentLocationName,
    obtainedRules,
    inventory,
    isCctvRebooted,
    currentEnding,
    investigationDay,
    gameDate,
    restCount,
    foundContradictions,
    freeNotes,
    journalLogs,
    unlockedEndings,
    completedWeek1,
    recoveryWindow
  }), [
    playerName,
    boardName,
    articleTitle,
    selectedTrait,
    isTraitRevealed,
    san,
    currentChapter,
    currentLocationName,
    obtainedRules,
    inventory,
    isCctvRebooted,
    currentEnding,
    investigationDay,
    gameDate,
    restCount,
    foundContradictions,
    freeNotes,
    journalLogs,
    unlockedEndings,
    completedWeek1,
    recoveryWindow
  ]);

  const saveGame = useCallback(() => {
    safeStorageSetJSON(SAVE_KEY, currentGameStateSnapshot);
  }, [currentGameStateSnapshot]);

  // Start New Game from Title Screen
  const handleStartNewGame = useCallback(() => {
    sound.playPaper();
    const initDate = generateInitialDate();
    setGameDate(initDate);
    setInvestigationDay(1);
    setRestCount(0);
    setSan(100);
    setCurrentChapter('prologue');
    setCurrentLocationName('私家偵探事務所');
    setObtainedRules([]);
    setInventory([]);
    setIsCctvRebooted(false);
    setJournalLogs([]);
    setCurrentEnding(null);
    setActiveRestInfo(null);
    setIsTraitRevealed(false);
    setSelectedTrait('rationalist');
    setFreeNotes([]);
    setFoundContradictions([]);
    setPlayerName('');
    setBoardName('怪談');
    setArticleTitle('那棟大樓');
    safeStorageSet('ROOM404_BOARD_NAME', '怪談');
    safeStorageSet('ROOM404_ARTICLE_TITLE', '那棟大樓');
    setRecoveryWindow(0);
    
    setCompletedWeek1(false);
    setShowWeek2InteractiveTitle(false);
    safeStorageRemove('completed_week1');
    safeStorageRemove('ROOM404_JUST_TRANSITIONED');
    safeStorageRemove('ROOM404_FREE_NOTES');
    safeStorageRemove('ROOM404_FOUND_CONTRADICTIONS');

    const initialSave: SavedGameData = {
      version: 1,
      saveTimestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
      playerName: '',
      boardName: '怪談',
      articleTitle: '那棟大樓',
      selectedTrait: 'rationalist',
      isTraitRevealed: false,
      san: 100,
      currentChapter: 'prologue',
      currentLocationName: '私家偵探事務所',
      obtainedRules: [],
      inventory: [],
      isCctvRebooted: false,
      currentEnding: null,
      investigationDay: 1,
      gameDate: initDate,
      restCount: 0,
      foundContradictions: [],
      freeNotes: [],
      journalLogs: [],
      unlockedEndings,
      completedWeek1: false
    };

    safeStorageSetJSON(SAVE_KEY, initialSave);

    setShowTitleScreen(false);
    setGameSessionKey(prev => prev + 1);
    showToast('★ 案件調查啟動！');
  }, [unlockedEndings, showToast]);

  // Continue Game from Title Screen
  const handleContinueGame = useCallback((saveData: SavedGameData | null) => {
    if (!saveData) {
      handleStartNewGame();
      return;
    }
    sound.playPaper();
    const isWeek2 = saveData.completedWeek1 === true;

    setPlayerName(saveData.playerName || '');
    const bName = '怪談';
    const aTitle = saveData.articleTitle || '那棟大樓';
    setBoardName(bName);
    setArticleTitle(aTitle);
    safeStorageSet('ROOM404_BOARD_NAME', bName);
    safeStorageSet('ROOM404_ARTICLE_TITLE', aTitle);
    setSelectedTrait(saveData.selectedTrait || 'rationalist');
    setIsTraitRevealed(saveData.isTraitRevealed ?? true);
    setSan(typeof saveData.san === 'number' ? saveData.san : 100);
    setCurrentChapter(saveData.currentChapter || 'exploration');
    setCurrentLocationName(saveData.currentLocationName || '安祥路88號大樓 • 一樓大廳');
    setObtainedRules(saveData.obtainedRules || []);
    setInventory(saveData.inventory || []);
    setIsCctvRebooted(saveData.isCctvRebooted ?? false);
    setCurrentEnding(saveData.currentEnding || null);
    setInvestigationDay(saveData.investigationDay || 1);
    if (saveData.gameDate) setGameDate(saveData.gameDate);
    setRestCount(saveData.restCount || 0);
    setFoundContradictions(saveData.foundContradictions || []);
    setFreeNotes(saveData.freeNotes || []);
    setJournalLogs(saveData.journalLogs || []);
    setRecoveryWindow(typeof saveData.recoveryWindow === 'number' ? saveData.recoveryWindow : 0);
    if (saveData.unlockedEndings && Array.isArray(saveData.unlockedEndings)) {
      setUnlockedEndings(saveData.unlockedEndings);
    }
    
    setCompletedWeek1(isWeek2);
    if (isWeek2) {
      safeStorageSet('completed_week1', 'true');
    } else {
      safeStorageRemove('completed_week1');
    }

    setShowTitleScreen(false);
    setGameSessionKey(prev => prev + 1);

    if (isWeek2) {
      setShowWeek2InteractiveTitle(true);
    } else {
      setShowWeek2InteractiveTitle(false);
      showToast(`★ 已讀取歷史調查進度！（第 ${saveData.investigationDay || 1} 天 • ${saveData.currentLocationName || '現場'}）`);
    }
  }, [handleStartNewGame, showToast]);

  const handleProceedWeek2FromInteractiveTitle = useCallback(() => {
    sound.playPaper();
    setShowWeek2InteractiveTitle(false);
    setInvestigationDay(prev => Math.max(8, prev));
    showToast('★ 認知對抗啟動！已進入二周目調查（第八日白晝）。');
  }, [showToast]);

  const handleReturnToTitle = useCallback(() => {
    saveGame();
    setShowWeek2InteractiveTitle(false);
    setShowTitleScreen(true);
    showToast('★ 調查進度已儲存，返回主選單。');
  }, [saveGame, showToast]);

  // Execute Complete Case Reset
  const executeFullReset = useCallback(() => {
    isResettingCaseRef.current = true;
    sound.playResolutionChord();
    const initDate = generateInitialDate();
    setGameDate(initDate);
    setInvestigationDay(1);
    setRestCount(0);
    setSan(100);
    setCurrentChapter('prologue');
    setCurrentLocationName('私家偵探事務所');
    setObtainedRules([]);
    setInventory([]);
    setIsCctvRebooted(false);
    setJournalLogs([]);
    setCurrentEnding(null);
    setActiveRestInfo(null);
    setIsTraitRevealed(false);
    setSelectedTrait('rationalist');
    setFreeNotes([]);
    setFoundContradictions([]);
    setPlayerName('');
    setUnlockedEndings([]);
    setCompletedWeek1(false);
    setRecoveryWindow(0);

    wipeEntireGameProgress();

    setShowWeek2InteractiveTitle(false);
    setShowTitleScreen(true);
    setGameSessionKey(prev => prev + 1);

    showToast('★ 遊戲進度與所有內容已全數移除！由第一輪重新開始。');

    setTimeout(() => {
      isResettingCaseRef.current = false;
    }, 600);
  }, [showToast]);

  // Derive contextual location ID
  const currentLocId = useMemo(() => {
    if (currentLocationName.includes('504')) return 'loc_504_interior';
    if (currentLocationName.includes('502')) return 'loc_502_interior';
    if (currentLocationName.includes('五樓') || currentLocationName.includes('5F') || currentLocationName.includes('5f')) return 'loc_5f_corridor';
    if (currentLocationName.includes('404') || currentLocationName.includes('四樓') || currentLocationName.includes('4F') || currentLocationName.includes('4f')) return 'loc_4f_hidden';
    if (currentLocationName.includes('303') || currentLocationName.includes('三樓') || currentLocationName.includes('3F') || currentLocationName.includes('3f')) return 'loc_3f_corridor';
    if (currentLocationName.includes('二樓') || currentLocationName.includes('2F') || currentLocationName.includes('2f')) return 'loc_2f_corridor';
    if (currentLocationName.includes('電梯')) return 'loc_elevator';
    if (currentLocationName.includes('樓梯') || currentLocationName.includes('安全梯')) return 'loc_stairwell';
    if (currentLocationName.includes('警衛')) return 'loc_1f_security';
    return 'loc_1f_lobby';
  }, [currentLocationName]);

  // Audio SAN Heartbeat Effect
  useEffect(() => {
    sound.updateSanHeartbeat(san);
  }, [san, soundEnabled]);

  // Auto-save whenever key gameplay state changes while playing
  useEffect(() => {
    if (isResettingCaseRef.current) return;
    if (!showTitleScreen && !showWeek2InteractiveTitle && currentChapter !== 'ending') {
      saveGame();
    }
  }, [
    showTitleScreen,
    showWeek2InteractiveTitle,
    san,
    playerName,
    selectedTrait,
    isTraitRevealed,
    currentChapter,
    currentLocationName,
    obtainedRules,
    inventory,
    isCctvRebooted,
    investigationDay,
    gameDate,
    restCount,
    foundContradictions,
    freeNotes,
    journalLogs,
    recoveryWindow,
    saveGame
  ]);

  // Global window.gameState sync for testing / inspection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).gameState = {
        san,
        playerName,
        selectedTrait,
        isTraitRevealed,
        currentChapter,
        currentLocationName,
        obtainedRules,
        inventory,
        isCctvRebooted,
        currentEnding,
        investigationDay,
        gameDate,
        foundContradictions,
        freeNotes,
        journalLogs,
        unlockedEndings
      };

      (window as any).modifySanity = (amount: number) => {
        handleModifySan(amount);
      };
    }
  }, [
    san,
    playerName,
    selectedTrait,
    isTraitRevealed,
    currentChapter,
    currentLocationName,
    obtainedRules,
    inventory,
    isCctvRebooted,
    currentEnding,
    investigationDay,
    gameDate,
    foundContradictions,
    freeNotes,
    journalLogs,
    unlockedEndings,
    handleModifySan
  ]);

  return {
    unlockedEndings,
    setUnlockedEndings,
    gameDate,
    setGameDate,
    investigationDay,
    setInvestigationDay,
    restCount,
    setRestCount,
    activeRestInfo,
    setActiveRestInfo,
    gameSessionKey,
    setGameSessionKey,
    showTitleScreen,
    setShowTitleScreen,
    playerName,
    setPlayerName,
    boardName,
    setBoardName: handleUpdateBoardName,
    articleTitle,
    setArticleTitle: handleUpdateArticleTitle,
    selectedTrait,
    setSelectedTrait,
    isTraitRevealed,
    setIsTraitRevealed,
    san,
    setSan,
    currentChapter,
    setCurrentChapter,
    currentLocationName,
    setCurrentLocationName,
    obtainedRules,
    setObtainedRules,
    inventory,
    setInventory,
    isCctvRebooted,
    setIsCctvRebooted,
    currentEnding,
    setCurrentEnding,
    soundEnabled,
    visualMode,
    reduceEffects,
    completedWeek1,
    setCompletedWeek1,
    showMetaTransition,
    setShowMetaTransition,
    showWeek2InteractiveTitle,
    setShowWeek2InteractiveTitle,
    isMentalCrisisActive,
    setIsMentalCrisisActive,
    crisisRetreatCount,
    maxCrisisRetreats: 3,
    handleConsumeItem,
    foundContradictions,
    journalLogs,
    toastMessage,
    detectiveMonologue,
    setDetectiveMonologue,
    freeNotes,
    currentDateText,
    currentLocId,
    currentGameStateSnapshot,
    showToast,
    triggerDetectiveMonologue,
    handleAddJournalEntry,
    handleAddFreeNote,
    handleUpdateFreeNoteColor,
    handleDeleteFreeNote,
    handleReorderFreeNotes,
    handleAddContradiction,
    handleToggleReduceEffects,
    handleToggleWeekMode,
    handleObtainRule,
    handleObtainItem,
    handleRemoveItem,
    handleModifySan,
    handleSuccessMentalRescue,
    handleEmergencyRetreatFromCrisis,
    handleTotalBreakdownFromCrisis,
    handleRestInOffice,
    handleTriggerEnding,
    handleToggleSound,
    handleToggleVisualMode,
    uiStyleMode,
    setUiStyleMode,
    handleToggleUiStyleMode,
    recoveryWindow,
    setRecoveryWindow,
    handleSuccessfulDisposal,
    handleDecrementRecoveryWindow,
    handleConsumeContradictionNote,
    saveGame,
    handleStartNewGame,
    handleContinueGame,
    handleProceedWeek2FromInteractiveTitle,
    handleReturnToTitle,
    executeFullReset
  };
}
