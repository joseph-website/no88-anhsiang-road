import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Mail,
  FileText,
  Coffee,
  Flame,
  CreditCard,
  Tv,
  Folder,
  Book,
  Phone,
  User,
  ShoppingBag,
  Trash2,
  DoorClosed,
  Compass,
  Zap,
  Maximize2,
  ShieldAlert,
  Sliders,
  FileQuestion,
  Footprints,
  Refrigerator,
  Sparkles,
  Clock,
  SunMedium,
  Bookmark,
  Radio,
  Layers,
  Hash,
  Wind,
  Volume2,
  DoorOpen,
  Mic,
  FileWarning,
  Droplets,
  ArrowRight,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Key,
  Search,
  ChevronRight,
  Eye,
  RefreshCw,
  Building,
  MapPin,
  LogOut,
  BedDouble,
  AlertCircle,
  ArrowUpDown,
  X,
  Brain,
  Flashlight,
  PanelLeftClose,
  PanelLeftOpen,
  Hammer
} from 'lucide-react';
import { 
  BUILDING_LOCATIONS, BuildingLocation, HotspotItem, HotspotAction,
  STAIR_CORNER_HOTSPOTS_1F, STAIR_CORNER_HOTSPOTS_2F 
} from '../data/explorationData';
import { sound } from '../services/soundEngine';
import { EndingId, TraitId, JournalEntry, UIStyleMode } from '../types';
import { INVESTIGATOR_TRAITS } from '../data/traitsData';
import { INVENTORY_ITEMS, RULES_DATA } from '../data/rulesData';
import { getAmbientObservation, AmbientObservationSnippet } from '../data/ambientObservations';
import { getDetectiveIntuition, getSixthSensePremonition } from '../utils/detectiveIntuition';
import { getRandomAnomalyEvent, AnomalyEvent } from '../data/anomalyEventsData';
import { AnomalyAftermathData } from './AnomalyAftermathModal';
import { EPIPHANY_QTE_CONFIGS } from '../data/epiphanyQTEData';
import { TRAIT_RESCUE_HINTS } from '../data/traitMonologues';
import { SanityGlitchText } from './common/SanityGlitchText';

// Lazy-loaded modal overlays & minigames to optimize memory and initial load speed
const LetterPuzzle = React.lazy(() => import('./minigames/LetterPuzzle').then(m => ({ default: m.LetterPuzzle })));
const DeductionMatrix = React.lazy(() => import('./minigames/DeductionMatrix').then(m => ({ default: m.DeductionMatrix })));
const ChaseSequence = React.lazy(() => import('./minigames/ChaseSequence').then(m => ({ default: m.ChaseSequence })));
const BossDeconstruction = React.lazy(() => import('./minigames/BossDeconstruction').then(m => ({ default: m.BossDeconstruction })));
const AnomalyEventModal = React.lazy(() => import('./AnomalyEventModal').then(m => ({ default: m.AnomalyEventModal })));
const AnomalyAftermathModal = React.lazy(() => import('./AnomalyAftermathModal').then(m => ({ default: m.AnomalyAftermathModal })));
const GuardPatrolQTE = React.lazy(() => import('./minigames/GuardPatrolQTE').then(m => ({ default: m.GuardPatrolQTE })));
const StaircaseMeasureMinigameModal = React.lazy(() => import('./minigames/StaircaseMeasureMinigameModal').then(m => ({ default: m.StaircaseMeasureMinigameModal })));
const EpiphanyQTEModal = React.lazy(() => import('./minigames/EpiphanyQTEModal').then(m => ({ default: m.EpiphanyQTEModal })));
const ZhangHaoRescueModal = React.lazy(() => import('./ZhangHaoRescueModal').then(m => ({ default: m.ZhangHaoRescueModal })));

interface BuildingExplorerProps {
  playerName: string;
  trait: TraitId;
  san: number;
  obtainedRules: string[];
  inventory: string[];
  isCctvRebooted: boolean;
  unlockedEndings?: EndingId[];
  completedWeek1?: boolean;
  uiStyleMode?: UIStyleMode;
  onLocationChange?: (locationName: string) => void;
  onObtainRule: (ruleId: string) => void;
  onObtainItem: (itemId: string) => void;
  onModifySan: (delta: number) => void;
  onSetCctvRebooted: () => void;
  onTriggerEnding: (endingId: EndingId) => void;
  onRestInOffice: () => void;
  onAddJournalEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
  reduceEffects?: boolean;
  recoveryWindow?: number;
  onSuccessfulDisposal?: (tier: 1 | 2 | 3) => void;
  onDecrementRecoveryWindow?: () => void;
  onConsumeItem?: (itemId: string) => boolean | void;
  onRemoveItem?: (itemId: string) => void;
}

// Rare Sensory Visual & Auditory Anomaly Events Library (罕見大樓異象視覺/音效效果庫)
export interface RareSensoryAnomaly {
  id: string;
  type: 'blood_red_corridor' | 'ominous_distant_knocking' | 'wall_bleeding_text' | 'temporal_rewind_stutter' | 'faceless_shadow_gaze';
  title: string;
  description: string;
  quote: string;
  duration: number;
  sanLoss: number;
}

const RARE_SENSORY_ANOMALIES: RareSensoryAnomaly[] = [
  {
    id: 'rare_blood_red_corridor',
    type: 'blood_red_corridor',
    title: '走廊燈光瞬間轉為血紅色',
    description: '天花板所有日光燈管在一瞬間爆發出刺目欲滴的血紅光芒，整條走廊如同浸泡在溫熱鮮血之中，數秒後隨電流炸裂聲驟然熄滅重啟。',
    quote: '「……大樓電力系統正遭受未知的深層污染……」',
    duration: 2400,
    sanLoss: 3
  },
  {
    id: 'rare_ominous_distant_knocking',
    type: 'ominous_distant_knocking',
    title: '遠處傳來異常急促的沉重敲門聲',
    description: '走廊盡頭緊鎖的未標號鐵門深處，傳來極為沉重、緩慢而規律的「咚……咚……咚……」金屬敲擊聲，伴隨門把手劇烈上下扳動的刺耳聲響！',
    quote: '「咚、咚、咚……門後有東西想要出來……」',
    duration: 2700,
    sanLoss: 3
  },
  {
    id: 'rare_wall_bleeding_text',
    type: 'wall_bleeding_text',
    title: '水泥牆縫滲出狂亂血字與禁忌條文',
    description: '兩側牆面斑駁的水泥灰漿間，如活物般蠕動著滲出鮮紅色的打字機墨跡，密密麻麻排列出「404號房從未消失」的瘋狂條文！',
    quote: '「文字……在水泥牆壁內部呼吸……」',
    duration: 2300,
    sanLoss: 3
  },
  {
    id: 'rare_temporal_rewind_stutter',
    type: 'temporal_rewind_stutter',
    title: '梯廳掛鐘指針瘋狂逆轉與時空停滯',
    description: '電梯旁的機械掛鐘齒輪發出高頻尖叫，三根指針以不可思議的速度逆時針旋轉，周遭的空氣與光線彷彿凍結在十年前的某個瞬間。',
    quote: '「……空間被困在十年前的某個午夜……」',
    duration: 2200,
    sanLoss: 2
  },
  {
    id: 'rare_faceless_shadow_gaze',
    type: 'faceless_shadow_gaze',
    title: '轉角水窪倒映出無臉白衣輪廓',
    description: '在低頭避開燈光的瞬間，地面積水的黑色倒影中突兀顯現出一個身著白衣、面部光滑如紙的無臉身影，正自下而上無聲地凝視著你！',
    quote: '「……他在看著你，即使他沒有眼睛……」',
    duration: 2400,
    sanLoss: 3
  }
];

export const BuildingExplorer: React.FC<BuildingExplorerProps> = ({
  playerName,
  trait,
  san,
  obtainedRules,
  inventory,
  isCctvRebooted,
  unlockedEndings = [],
  completedWeek1 = false,
  onLocationChange,
  onObtainRule,
  onObtainItem,
  onModifySan,
  onSetCctvRebooted,
  onTriggerEnding,
  onRestInOffice,
  onAddJournalEntry,
  reduceEffects = false,
  recoveryWindow = 0,
  onSuccessfulDisposal,
  onDecrementRecoveryWindow,
  onConsumeItem,
  onRemoveItem,
  uiStyleMode = 'modern'
}) => {
  const isRetro = uiStyleMode === 'retro2000';

  // Current active location
  const [currentLocId, setCurrentLocId] = useState<string>('loc_1f_lobby');
  const [visitedLocations, setVisitedLocations] = useState<string[]>(['loc_1f_lobby']);

  // Requirement 1: Track visits to 504 (第一次進去504時，手電筒不要照出東西)
  const [timesEntered504, setTimesEntered504] = useState<number>(0);

  // Requirement 3: Scene-scoped wrong choice SAN penalty counter (max 2 deductions per scene visit)
  const [sceneWrongChoicePenaltyCount, setSceneWrongChoicePenaltyCount] = useState<number>(0);

  useEffect(() => {
    setVisitedLocations(prev => prev.includes(currentLocId) ? prev : [...prev, currentLocId]);
    // Reset scene penalty count when switching locations / scenes
    setSceneWrongChoicePenaltyCount(0);
    if (currentLocId === 'loc_504_interior') {
      setTimesEntered504(prev => prev + 1);
    }
  }, [currentLocId]);
  
  // Track inspected hotspots
  const [inspectedHotspots, setInspectedHotspots] = useState<string[]>([]);
  
  // Active selected hotspot for modal/drawer inspection
  const [activeHotspot, setActiveHotspot] = useState<HotspotItem | null>(null);
  
  // Active action feedback text
  const [actionFeedback, setActionFeedback] = useState<{
    text: string;
    type: 'normal' | 'san' | 'item' | 'rule';
  } | null>(null);

  // Leave building confirmation modal state (Only allowed when on 1F)
  const [showLeaveBuildingModal, setShowLeaveBuildingModal] = useState<boolean>(false);

  // Movement selection modal state (Elevator panel vs U-shaped Stairwell)
  const [activeTransitMode, setActiveTransitMode] = useState<'elevator' | 'stairs' | null>(null);
  const [transitAnimationText, setTransitAnimationText] = useState<string | null>(null);

  // Active Minigames
  const [activeMinigame, setActiveMinigame] = useState<'letter_puzzle' | 'cctv_deduction' | 'chase' | 'boss' | null>(null);

  // Group 1 & Group 2 Orthodox Deduction states
  const [showStaircaseMeasureModal, setShowStaircaseMeasureModal] = useState<boolean>(false);
  const [activeEpiphanyQTEId, setActiveEpiphanyQTEId] = useState<string | null>(null);
  const [solvedEpiphanyQTEIds, setSolvedEpiphanyQTEIds] = useState<string[]>([]);

  // First 4F Encounter Story Trigger (leaving 504)
  const [hasExperiencedFirst4F, setHasExperiencedFirst4F] = useState<boolean>(() => {
    return obtainedRules.includes('rule_guard') || obtainedRules.includes('rule_cleaner');
  });
  const [showFirst4FModal, setShowFirst4FModal] = useState<boolean>(false);
  const [first4FAftermathData, setFirst4FAftermathData] = useState<AnomalyAftermathData | null>(null);

  // Second 4F Encounter Story Trigger (after exploring 2F & 3F with cleaner rule)
  const [hasExperiencedSecond4F, setHasExperiencedSecond4F] = useState<boolean>(() => {
    return (
      obtainedRules.includes('rule_cctv') ||
      obtainedRules.includes('rule_handwritten') ||
      inventory.includes('guard_keycard') ||
      inventory.includes('building_blueprints')
    );
  });
  const [showSecond4FModal, setShowSecond4FModal] = useState<boolean>(false);
  const [hasUnlocked504, setHasUnlocked504] = useState<boolean>(() => {
    return obtainedRules.includes('rule_resident') || obtainedRules.includes('rule_handwritten');
  });

  // Week 1 502 Wall Rescue Extension States
  const [hasUnlocked502, setHasUnlocked502] = useState<boolean>(false);
  const [hasEncountered5FNeighborComplaint, setHasEncountered5FNeighborComplaint] = useState<boolean>(false);
  const [hasInspected504Trash, setHasInspected504Trash] = useState<boolean>(false);
  const [hasTakenElevatorTo1FAfter504, setHasTakenElevatorTo1FAfter504] = useState<boolean>(false);
  const [wallRescueStep, setWallRescueStep] = useState<1 | 2 | 3>(1);
  const [isZhangHaoRescueModalOpen, setIsZhangHaoRescueModalOpen] = useState<boolean>(false);

  // Safe Area SAN recovery rate limiting (moves required to reset)
  const [usedSafeActions, setUsedSafeActions] = useState<Record<string, boolean>>({});
  const [, setMovesSinceLastSafeRest] = useState<number>(0);

  // Mobile navigation tab switcher (Scene vs Transit vs Sensory)
  const [mobileTab, setMobileTab] = useState<'scene' | 'transit' | 'sensory'>('scene');

  // Tactical Flashlight & Hidden Traces mechanism (Classic Horror Trope)
  const [isFlashlightOn, setIsFlashlightOn] = useState<boolean>(false);
  const [discoveredHiddenTraces, setDiscoveredHiddenTraces] = useState<string[]>([]);
  const [activeHiddenTraceFeedback, setActiveHiddenTraceFeedback] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);

  // Hidden clues in dark corners revealed exclusively by tactical flashlight
  const LOCATION_HIDDEN_TRACES: Record<string, { id: string; name: string; traceSnippet: string; detail: string; }> = {
    loc_1f_lobby: {
      id: 'trace_1f_board',
      name: '大廳燈火通明（無暗角痕跡）',
      traceSnippet: '大廳頂部筒燈明亮，光線充足。',
      detail: '一樓大廳燈光明亮通透，手電筒的光束在日光燈照射下幾乎沒有額外效果，周遭並無特殊的暗角刻痕。'
    },
    loc_1f_security: {
      id: 'trace_1f_cctv_base',
      name: '監視器主機底座標籤',
      traceSnippet: '強光穿透主控台底部陰影，照亮設備標籤。',
      detail: '強光照射主控台後方，發現手寫標籤：「第四頻道訊號線路異常，需重置系統後方可恢復。」'
    },
    loc_2f_corridor: {
      id: 'trace_2f_cart_scratch',
      name: '清潔推車夾層刮痕',
      traceSnippet: '推車鐵皮背面照出防禦性刮擦痕跡。',
      detail: '推車側方夾層的鐵撬上有密集的反覆撞擊痕跡，手柄處刻著模糊的字樣：「1998 工地用」。'
    },
    loc_3f_corridor: {
      id: 'trace_3f_pipe_chalk',
      name: '管線檢修鐵門下緣粉筆標記',
      traceSnippet: '地面門縫透出白色箭頭反光。',
      detail: '手電筒光束照進鐵門下方的陰暗縫隙，地面留有用白色粉筆畫出的逃生方向箭頭與求救驚嘆號！'
    },
    loc_504_interior: {
      id: 'trace_504_wallpaper_hole',
      name: '臥室衣櫃後方門牌釘孔',
      traceSnippet: '泛黃壁紙翹起處照出金屬螺絲孔洞。',
      detail: '撥開衣櫃後方微翹的泛黃壁紙，赫然發現四個對稱的生鏽螺絲釘孔，間距大小似乎曾懸掛過其他金屬門牌！'
    },
    loc_4f_hidden: {
      id: 'trace_4f_ink_tendrils',
      name: '水泥縫隙蔓延的墨跡神經絡',
      traceSnippet: '手電筒照出極其密集的打字機文字蔓延。',
      detail: '在光束聚焦下，牆面水泥縫中的深黑墨跡並非污漬，而是以極小字體不斷重複書寫的「404一直都在……快逃」。'
    }
  };

  // Stairwell corner floor state: 1F (1F->2F), 2F (2F->3F), 3F (3F->5F)
  const [stairCornerFloor, setStairCornerFloor] = useState<'1F' | '2F' | '3F'>('1F');
  const [hasDiscoveredStepHeightDiscrepancy, setHasDiscoveredStepHeightDiscrepancy] = useState<boolean>(false);

  // UX Priority 1: Track executed action IDs to display complete state for hotspots
  const [executedActionIds, setExecutedActionIds] = useState<string[]>([]);

  // UX Priority 3: Transit Panel Collapsible State for widescreen breathing room
  const [isTransitCollapsed, setIsTransitCollapsed] = useState<boolean>(false);

  // Active immersive ambient observation
  const [activeObservation, setActiveObservation] = useState<{
    snippet: AmbientObservationSnippet;
    sanTier: 'high' | 'mid' | 'low';
    sanLabel: string;
  } | null>(null);

  // Active Transient Building Anomaly Phenomenon (燈光閃爍、奇怪低語等移動微型異象)
  const [transitAnomalyAlert, setTransitAnomalyAlert] = useState<{
    type: 'flicker' | 'whisper' | 'footsteps' | 'cold_draft' | 'typewriter' | 'shadow';
    title: string;
    description: string;
    sanLoss: number;
    quote?: string;
  } | null>(null);
  const [isFlickeringEffect, setIsFlickeringEffect] = useState<boolean>(false);

  // Active Rare Ambient Visual Anomaly Effect (走廊血紅燈光、遠處敲門聲等罕見短暫視覺異象)
  const [activeRareVisualEffect, setActiveRareVisualEffect] = useState<RareSensoryAnomaly | null>(null);

  // Active Random Urban Legend Anomaly Event (怪談異常隨機事件)
  const [activeAnomalyEvent, setActiveAnomalyEvent] = useState<AnomalyEvent | null>(null);
  const [movesSinceLastAnomaly, setMovesSinceLastAnomaly] = useState<number>(0);

  // Active Guard Patrol QTE Event (走廊白衣警衛突發巡邏點名潛行 QTE)
  const [showGuardPatrolQTE, setShowGuardPatrolQTE] = useState<boolean>(false);
  const [movesSinceLastGuardPatrol, setMovesSinceLastGuardPatrol] = useState<number>(0);

  const currentLocation = BUILDING_LOCATIONS[currentLocId] || BUILDING_LOCATIONS.loc_1f_lobby;
  const traitData = INVESTIGATOR_TRAITS[trait] || INVESTIGATOR_TRAITS.rationalist;

  // Handle trigger of ambient environment observation affected by SAN
  const handleObserveEnvironment = () => {
    const result = getAmbientObservation(currentLocId, currentLocation.name, san);
    sound.playObserveEnvironment(san);
    setActiveObservation(result);
    setActiveHotspot(null);
    setActiveHiddenTraceFeedback(null);
    setMobileTab('sensory');

    onAddJournalEntry({
      category: 'action',
      title: `環境感官觀察：【${currentLocation.name}】(${result.sanLabel})`,
      content: `【${result.snippet.title}】${result.snippet.description}`,
      location: currentLocation.name
    });
  };

  // Handle flashlight trace inspection in right inspection drawer
  const handleInspectFlashlightTrace = () => {
    // Requirement 1: 第一次進去504時，手電筒不要照出東西
    if (currentLocId === 'loc_504_interior' && timesEntered504 <= 1) {
      sound.playFlashlightToggle(true);
      setActionFeedback({
        text: '【手電筒初次勘查】：你將強光聚光光束掃過 504 號房的衣櫃、床底與四面牆角，光束下只映照出尋常的生活家具與薄薄的落灰，並未照出任何隱蔽異常。',
        type: 'normal'
      });
      return;
    }

    const trace = LOCATION_HIDDEN_TRACES[currentLocId];
    if (!trace) return;
    sound.playObserveEnvironment(san);
    if (!discoveredHiddenTraces.includes(trace.id)) {
      setDiscoveredHiddenTraces(prev => [...prev, trace.id]);
      onModifySan(2);
      onAddJournalEntry({
        category: 'action',
        title: `手電筒勘查發現：【${trace.name}】`,
        content: trace.detail,
        location: currentLocation.name,
        sanDelta: 2
      });
    }
    setActiveHiddenTraceFeedback({
      id: trace.id,
      title: trace.name,
      description: trace.detail
    });
    setActiveHotspot(null);
    setActiveObservation(null);
    setMobileTab('sensory');
  };

  // Inform parent of current location name
  useEffect(() => {
    if (onLocationChange && currentLocation) {
      onLocationChange(`安祥路88號 • ${currentLocation.name}`);
    }
  }, [currentLocId, currentLocation, onLocationChange]);

  // 開啟手電筒狀態下移動至下一個場景/調查地點時自動關閉手電筒
  useEffect(() => {
    if (isFlashlightOn) {
      setIsFlashlightOn(false);
    }
  }, [currentLocId]);

  // Synchronize dynamic heartbeat when SAN changes (auto-triggers when SAN < 40)
  useEffect(() => {
    sound.updateHeartbeat(san);
  }, [san]);

  // 4F Anomaly Sound: Deafening typewriter flurry when entering 4F modals
  useEffect(() => {
    if (showFirst4FModal) {
      sound.playDeafeningTypewriterFlurry(3.2);
    }
  }, [showFirst4FModal]);

  useEffect(() => {
    if (showSecond4FModal) {
      sound.playDeafeningTypewriterFlurry(3.6);
    }
  }, [showSecond4FModal]);

  // Key item/rule milestones
  const hasKey504 = inventory.includes('key_504');
  const hasResidentRule = obtainedRules.includes('rule_resident');
  const hasGuardRule = obtainedRules.includes('rule_guard');
  const hasBlueprints = inventory.includes('building_blueprints');
  const hasGuardKeycard = inventory.includes('guard_keycard');
  const hasCctvRule = obtainedRules.includes('rule_cctv');
  const hasHandwrittenRule = obtainedRules.includes('rule_handwritten');
  const hasLetter = inventory.includes('shredded_letter');
  const hasRecorder = inventory.includes('tape_recorder');
  const hasOldCaseFile = inventory.includes('old_case_file');
  const hasCleanerRule = obtainedRules.includes('rule_cleaner');
  const hasElevatorManual = inventory.includes('elevator_service_manual');
  const hasFakeRule = obtainedRules.includes('rule_fake_evacuation');
  const hasCameraFilm = inventory.includes('old_camera_film');

  // Check whether 504 room investigation is complete (resident rule and shredded letter found/assembled)
  const is504InvestigationComplete = !completedWeek1
    ? (hasResidentRule && (hasInspected504Trash || inspectedHotspots.includes('hotspot_shredded_letter_trash')))
    : (hasResidentRule && (hasLetter || hasHandwrittenRule));

  // Week 1: After completing 504 investigation and taking elevator to 1F lobby,
  // the 5F neighbor complaint modal will trigger when player either:
  // 1) randomly investigates any 1F object/hotspot, OR
  // 2) chooses to leave the building.
  const isAwaiting1FInvestigationForMice = Boolean(
    !completedWeek1 &&
    is504InvestigationComplete &&
    hasTakenElevatorTo1FAfter504 &&
    !hasEncountered5FNeighborComplaint &&
    !hasUnlocked502
  );

  // Guard presence in guard room: Guard is on duty at 1F window until player explores 2F/3F, gets cleaner rule, and experiences 2nd 4F anomaly
  const isGuardInSecurityRoom = !hasExperiencedSecond4F && !isCctvRebooted;

  // Can 4F be voluntarily accessed?
  // Only late-game when blueprints & CCTV reboot have pierced through the cognitive distortion
  const is4FLateGameUnlocked = Boolean(hasBlueprints && isCctvRebooted);
  const is4FUnlocked = is4FLateGameUnlocked;

  // Dynamic hotspots resolution for various rooms based on state & repeatable dialogues
  const activeHotspots = useMemo(() => {
    if (currentLocId === 'loc_1f_lobby') {
      const lobbyHotspots = currentLocation.hotspots.map(h => {
        if (h.id === 'hotspot_guard_window') {
          if (!isGuardInSecurityRoom) {
            return {
              ...h,
              name: '值班警衛窗口（空無一人）',
              shortDesc: '警衛室窗口空蕩蕩的，檯燈亮著，警衛王大偉已不知去向。',
              inspectText: '警衛室木門微敞，桌上散落著王大偉的值班簿與個人隨身物品。窗口處露出平常被他壓在肘下的手寫備忘便箋。',
              actions: [
                ...(!hasGuardKeycard ? [
                  {
                    id: 'pick_guard_keycard_window',
                    label: '拾取值班台檯面遺落的【中控室備用門禁感應磁扣】',
                    resultText: '★ 獲得物證【中控室備用門禁感應磁扣】！警衛離崗巡邏時匆忙遺留在值班台的一枚黑色圓形感應磁扣，表面沾有油污，背面刻著緊急管理代碼。可用於感應解鎖警衛室磁控公文密封夾與大樓門禁！',
                    soundEffect: 'paper' as const,
                    sanDelta: 1,
                    obtainItemId: 'guard_keycard'
                  }
                ] : [
                  {
                    id: 'pick_guard_keycard_window_done',
                    label: '【中控室備用門禁感應磁扣】已收納於檔案袋',
                    resultText: '值班台上的備用磁扣已被你收納於物證檔案袋中。背面刻著的代碼隨時可用於感應解鎖磁控公文夾。',
                    soundEffect: 'paper' as const
                  }
                ]),
                {
                  id: 'guard_window_read_memo',
                  label: '翻閱窗口日誌夾層下的【王大偉的巡邏私密便箋】',
                  resultText: '【發現四樓線索】：你在王大偉值班日誌夾層下翻出他手寫的私密便箋：「……第四頻道的紅衣不是幻覺……四樓的打字機聲每晚都在通風管裡響……如果我也不見了，千萬別按電梯空白鍵，走樓梯時數清楚階梯數……」證實警衛早已察覺四樓異象！',
                  soundEffect: 'paper' as const,
                  sanDelta: 2
                },
                {
                  id: 'guard_room_sneak_in',
                  label: '趁警衛不在，推開虛掩的木門潛入【警衛安控室】',
                  resultText: '你輕輕推開警衛室的木門，閃身進入了一樓警衛安控室……',
                  soundEffect: 'switch' as const
                }
              ]
            };
          } else {
            // Guard is on duty at window
            return {
              ...h,
              actions: h.actions.map(act => {
                // If player has already unlocked and entered 504, update the inquiries
                if (act.id === 'guard_ask_building' && (hasUnlocked504 || hasResidentRule)) {
                  return {
                    ...act,
                    id: 'guard_ask_building_doubt',
                    label: '向警衛質疑：「你說住戶單純，但504房內生活痕跡與失聯情況完全對不上……」',
                    resultText: '警衛王大偉眼神微沉，放慢了翻閱日誌的動作：「先生，我再說一次，這棟樓的住戶關係向來非常單純，大家按部就班生活。至於504……那間屋子既然已經退租，裡面留下什麼東西都不奇怪。有些事情不需要追究得太深，管好自己分內的事才是最安全的。」（警衛生硬的掩飾與平靜語氣形成強烈反差，透出一股違和感）',
                    soundEffect: 'paper' as const
                  };
                }
                // If player already obtained key 504 and hasn't experienced anomaly yet
                if (act.id === 'guard_ask_case' && hasKey504) {
                  return {
                    ...act,
                    id: 'guard_ask_case_repeat',
                    label: hasUnlocked504 
                      ? '向警衛詢問504房內遺留物品與前房客交接紀錄' 
                      : '向警衛確認504號房使用與歸還注意事項',
                    resultText: hasUnlocked504
                      ? '警衛王大偉頭也不抬，淡淡地說：「交接清冊上什麼都沒有，前房客退租後就沒再來過。您如果在房裡看到什麼紙屑或舊文件，直接當作垃圾就行，不用大驚小怪。」'
                      : '警衛王大偉抬起頭提醒你：「先生，504號房的鑰匙剛才已經借給您了。請搭乘右側客用電梯直達五樓，別在走廊大聲喧嘩打擾其他住戶。鑰匙用完記得拿回值班台還我喔。」',
                    soundEffect: 'paper' as const,
                    obtainItemId: undefined
                  };
                }
                if (act.id === 'guard_confront_rules' && hasGuardRule) {
                  return {
                    ...act,
                    label: '【警衛工作規則】已收錄（向警衛確認職責）',
                    resultText: '警衛王大偉眼神警惕：「規則我已經給您看過了。我身為值班主任，必須堅守在一樓值班台，不可擅離職守。您如果對樓層有疑問，安全梯門禁已經解除，請您自行上二樓詢問清潔員李阿姨或到三樓檢修通道查看，請勿在一樓妨礙我值班。」',
                    soundEffect: 'paper' as const,
                    obtainRuleId: undefined
                  };
                }
                return act;
              })
            };
          }
        }

        if (h.id === 'hotspot_bulletin_board' && !isGuardInSecurityRoom) {
          return {
            ...h,
            actions: [
              ...h.actions,
              {
                id: 'bulletin_search_4f_doc',
                label: '趁警衛不在，掀開公告欄軟木背板角落的舊剪報',
                resultText: '【發現四樓歷史線索】：趁著警衛不在，你掀開被「例行消毒公告」覆蓋的軟木底層，露出一張泛黃的《2002年安祥路大樓違建四樓勒令停工通告》剪報！通告白紙黑字寫著：「四樓中央密閉機房涉及違章加蓋，通風管道貫穿全樓……」證實四樓的實體存在！',
                soundEffect: 'paper' as const,
                sanDelta: 2
              }
            ]
          };
        }

        if (h.id === 'hotspot_mailboxes' && !isGuardInSecurityRoom) {
          return {
            ...h,
            actions: [
              ...h.actions,
              {
                id: 'mailboxes_search_404_slot',
                label: '細查信箱牆下方被深色矽利康封死的暗格',
                resultText: '【發現四樓線索】：在305與501信箱之間的踢腳板位置，有一處被矽利康粗糙填平的狹窄投信孔。用指甲扣開表面塗層，底下隱約露出早已褪色的銅質金屬刻字「404」！證明這棟大樓曾有過404號信箱，只是後來被人刻意抹平。',
                soundEffect: 'paper' as const
              }
            ]
          };
        }

        return h;
      });

      if (is504InvestigationComplete && !hasUnlocked502 && !completedWeek1 && hasEncountered5FNeighborComplaint) {
        lobbyHotspots.push({
          id: 'hotspot_5f_neighbor_complaint',
          name: '五樓住戶與警衛王大偉 (正在激烈投訴牆壁老鼠怪聲)',
          iconName: 'Volume2',
          category: 'dialogue' as const,
          shortDesc: '五樓住戶正神情焦躁激憤地向警衛王大偉激烈投訴隔壁牆壁的抓撓怪聲。',
          inspectText: '五樓住戶情緒激動，用力拍著值班台：「王主任！我們五樓隔壁牆壁裡這幾天一直發出西西酥酥、悉悉窸窸的怪聲，整晚響個不停，像大老鼠狂刨牆，吵得整層樓都神經衰弱！到底有沒有叫除鼠公司來除害？！」',
          actions: [
            {
              id: 'act_talk_neighbor_wall_noise',
              label: '【上前詢問】：「這聲音絕非老鼠！請警衛開啟原本鎖定的502號房一起上去查看！」',
              resultText: '【上前詢問】：你敏銳指出人在極度脫水受困牆內抓撓石膏板時正是這種聲音！警衛王大偉大驚失色，立刻取出備用大師鑰匙，與你一同前往五樓開啟原本鎖定的 502 號房！',
              soundEffect: 'knock' as const
            }
          ]
        });
      }

      return lobbyHotspots;
    }

    if (currentLocId === 'loc_5f_corridor') {
      return currentLocation.hotspots.map(h => {
        if (h.id === 'hotspot_door_502' && hasUnlocked502) {
          return {
            ...h,
            name: '502 號房門 (已由警衛解鎖)',
            iconName: 'DoorOpen',
            category: 'clue' as const,
            shortDesc: '原本鎖定的 502 號房，門鎖已被警衛用總鑰匙轉開。',
            inspectText: '房門虛掩，門縫內正隱隱飄散出微塵與陣陣微弱急促的「西西酥酥」指甲抓撓聲……',
            actions: [
              {
                id: 'act_enter_502_unlocked',
                label: '【推門進入 502 號房】搜查相鄰牆壁的西西酥酥怪聲源頭',
                resultText: '你推開原本鎖定的 502 號房門，邁入幽暗室內！',
                soundEffect: 'knock' as const
              }
            ]
          };
        }
        return h;
      });
    }

    if (currentLocId === 'loc_1f_security') {
      return currentLocation.hotspots.map(h => {
        if (h.id === 'hotspot_guard_desk_drawer') {
          return {
            ...h,
            actions: h.actions.map(act => {
              if (act.id === 'drawer_search_blueprints' && hasBlueprints) {
                return {
                  ...act,
                  label: '【違章加蓋圖紙與歷史產權封存卷宗】已收納於檔案袋',
                  resultText: '你翻閱已收納的違建加蓋圖紙。1998年施工紀錄與2002年遭稽查停工之歷史白紙黑字，證實四樓物理空間客觀存在。',
                  obtainItemId: undefined
                };
              }
              if (act.id === 'drawer_search_keycard' && hasGuardKeycard) {
                return {
                  ...act,
                  label: '【中控室備用門禁感應磁扣】已收納於檔案袋',
                  resultText: '中控室感應磁扣已收納於隨身物證袋中，隨時可用於感應解鎖磁控公文夾與大樓門禁。',
                  obtainItemId: undefined
                };
              }
              if (act.id === 'drawer_search_cctv_manual' && hasCctvRule) {
                return {
                  ...act,
                  label: '【監視系統操作指引】已歸檔於規則手冊',
                  resultText: '手冊中已完整記錄第1條至第4條操作指引，尤其是第四頻道的處置程序。',
                  obtainRuleId: undefined
                };
              }
              return act;
            })
          };
        }
        if (h.id === 'hotspot_security_corner_rule') {
          return {
            ...h,
            actions: h.actions.map(act => {
              if (act.id === 'inspect_security_vent_traces') {
                return {
                  ...act,
                  resultText: '散熱孔周圍沉積著薄薄的粉塵與被刮擦的痕跡。鐵網縫隙內空無一物，隱約可見通往後方安全梯管道井的通風管道。紙張似乎早已被某人取走或轉移至更深處的樓梯間死角。'
                };
              }
              return act;
            })
          };
        }
        return h;
      });
    }

    if (currentLocId === 'loc_2f_corridor') {
      return currentLocation.hotspots.map(h => {
        if (h.id === 'hotspot_cleaner_cart') {
          return {
            ...h,
            actions: h.actions.map(act => {
              if (act.id === 'cleaner_talk_rules' && hasCleanerRule) {
                return {
                  ...act,
                  label: '【清潔人員工作規則】已收錄（向李阿姨問候）',
                  resultText: '李阿姨壓低嗓音：「先生，規則都給您看過了，沒事可千萬別在各樓層走廊逗留太晚，趕緊辦完事早點回去休息吧。」',
                  obtainRuleId: undefined
                };
              }
              return act;
            })
          };
        }
        return h;
      });
    }

    if (currentLocId === 'loc_elevator') {
      return currentLocation.hotspots.map(h => {
        if (h.id === 'hotspot_elevator_maintenance_box' && hasElevatorManual) {
          return {
            ...h,
            actions: h.actions.map(act => {
              if (act.id === 'pick_elevator_manual') {
                return {
                  ...act,
                  label: '【電梯緊急保修操作日誌】已收納於檔案袋',
                  resultText: '電梯控制板檢修手記已收錄，詳細記錄著硬體跳線故意跳過4樓的改裝紀錄。',
                  obtainItemId: undefined
                };
              }
              return act;
            })
          };
        }
        return h;
      });
    }

    if (currentLocId === 'loc_3f_corridor') {
      return currentLocation.hotspots.map(h => {
        if (h.id === 'hotspot_3f_pipe_door') {
          return {
            ...h,
            actions: [
              ...h.actions,
              ...(!hasExperiencedSecond4F && hasCleanerRule ? [
                {
                  id: 'trigger_second_4f',
                  label: '【空間異變】結合二樓清潔規則與三樓物理證據，試圖返回梯廳……',
                  resultText: '你轉身邁向梯廳，整層走廊的日光燈突然狂閃暴滅！空間劇烈震顫撕裂，猩紅的4F走廊再次在你眼前展開！',
                  soundEffect: 'glitch' as const,
                  sanDelta: -10
                }
              ] : [])
            ]
          };
        }
        return h;
      });
    }

    if (currentLocId === 'loc_stairwell') {
      if (stairCornerFloor === '1F') {
        return STAIR_CORNER_HOTSPOTS_1F;
      }
      if (stairCornerFloor === '2F') {
        return STAIR_CORNER_HOTSPOTS_2F;
      }

      // 3F -> 5F Corner Hotspots (with handwritten rule logic)
      return currentLocation.hotspots.map(h => {
        if (h.id === 'hotspot_stair_4f_corner') {
          if (hasHandwrittenRule) {
            return {
              ...h,
              actions: [
                {
                  id: 'pick_stair_handwritten_rule_done',
                  label: '【手寫的規則】已收錄於偵探手冊',
                  resultText: '已收納前人血淚寫下的7條真相規則，字裡行間充滿對404規則同化的警示。',
                  soundEffect: 'paper' as const
                }
              ]
            };
          }

          // 核心順序判定：必須先完成一樓警衛室監視系統重置與第四頻道解鎖，掌握逃脫者動線
          const hasDiscoveredEscapeTrail = hasCctvRule && isCctvRebooted;

          if (!hasDiscoveredEscapeTrail) {
            return {
              ...h,
              actions: [
                {
                  id: 'stair_corner_trail_missing',
                  label: '勘驗陰暗轉角平台與踢腳板暗角',
                  resultText: '轉角死角一片昏暗，堆積著厚重的水泥灰塵與陳年磚石碎屑。在尚未於警衛安控室監視畫面掌握前人逃生動線之前，盲目翻找無法察覺暗縫深處的秘密。',
                  soundEffect: 'knock' as const
                }
              ]
            };
          }

          // 已掌握逃生動線，但若未開啟手電筒：
          // 嚴格落實要求：不在此處直接提供一鍵開啟按鈕，需玩家從左側工具列主動開啟；未開啟則無法推進拾取
          if (!isFlashlightOn) {
            return {
              ...h,
              actions: [
                {
                  id: 'stair_corner_search_dark',
                  label: '在黑暗中摸索轉角磚石暗縫（光線不足無法辨識）',
                  resultText: '順著警衛安控室地面延伸的泥水鞋印，逃脫者奔入了這處三樓與四樓之間的折返死角！但折返平台完全背光，深處一片濃稠黑暗。肉眼與走廊餘光無法看清磚縫深處，請先在左側隨身工具欄開啟強光手電筒照明！',
                  soundEffect: 'knock' as const
                }
              ]
            };
          }

          // 已開啟手電筒且已掌握動線：
          return {
            ...h,
            actions: [
              {
                id: 'pick_stair_handwritten_rule',
                label: '借著手電筒光束搜查磚石暗縫，拾取【手寫的規則】',
                resultText: '★ 獲得真相規約【手寫的規則】！在手電筒強光映照下，你在樓梯暗縫深處發現了一張用血與油墨寫滿字跡的泛黃紙條。上面字跡顫抖急促，字字泣血，記錄著對抗404規則同化的真正活命法則！',
                sanDelta: 3,
                soundEffect: 'paper' as const,
                obtainRuleId: 'rule_handwritten'
              }
            ]
          };
        }
        return h;
      });
    }

    if (currentLocId === 'loc_504_interior') {
      return currentLocation.hotspots.map(h => {
        if (h.id === 'hotspot_living_rules') {
          return {
            ...h,
            name: completedWeek1 ? '504 客廳茶几上的【住戶規則】' : '504 客廳茶几上的【泛黃紙條】',
            iconName: 'FileText',
            category: 'rule' as const,
            shortDesc: completedWeek1
              ? '茶几正中央端正擺放著一份大樓管委會的白色規約，旁邊放著馬克杯與煙灰缸。'
              : '茶几正中央擺放著一張對折的泛黃紙條，旁邊放著馬克杯與煙灰缸。',
            inspectText: completedWeek1
              ? '紙張邊角平整，蓋著鮮紅的「安祥大樓管理委員會」公章。這是一份大樓管委會對所有住戶公開發放的正式生活規則，非任何私人筆記或空想。'
              : '紙張邊角泛黃微皺，上面條列著幾項手寫的生活注意事項。',
            actions: [
              {
                id: 'rules_read_obtain',
                label: hasResidentRule
                  ? (completedWeek1 ? '再次翻閱茶几上的【住戶規則】確認條文細節' : '再次翻閱茶几上的【泛黃紙條】')
                  : (completedWeek1 ? '翻閱並收錄【住戶規則】至手冊' : '翻閱茶几上的【泛黃紙條】'),
                resultText: hasResidentRule
                  ? (completedWeek1
                      ? '你再次翻閱這份對全體住戶公開的《住戶規則》，條文清晰寫著：「本大樓共四層樓，編號1至5樓，沒有4樓。若身處4樓，請利用電梯回到1樓。警衛制服為白衣黑褲，若遇到非白衣黑褲之警衛請勿理會。」'
                      : '你再次翻閱這張泛黃的紙條，上面寫著幾條古怪的生活叮嚀：「本大樓共四層樓，編號1至5樓，沒有4樓。若身處4樓，請利用電梯回到1樓。警衛制服為白衣黑褲，若遇到非白衣黑褲之警衛請勿理會。」')
                  : (completedWeek1
                      ? '★ 獲得【住戶規則（504號房取得）】！這是一份大樓管委會對所有住戶公開發放的正式規則。條文清晰載明：「本大樓共四層樓，編號1至5樓，沒有4樓。若身處4樓，請利用電梯回到1樓。警衛制服為白衣黑褲，若遇到非白衣黑褲之警衛請勿理會。」'
                      : '★ 獲得【泛黃的紙條（504號房取得）】！紙條上寫著幾條古怪的生活叮嚀：「本大樓共四層樓，編號1至5樓，沒有4樓。若身處4樓，請利用電梯回到1樓。警衛制服為白衣黑褲，若遇到非白衣黑褲之警衛請勿理會。」'),
                soundEffect: 'paper' as const,
                sanDelta: !hasResidentRule ? 2 : undefined,
                obtainRuleId: !hasResidentRule ? 'rule_resident' : undefined
              },
              {
                id: 'coffee_inspect',
                label: '檢查茶几上的咖啡杯與煙灰缸',
                resultText: '馬克杯裡的黑咖啡早已乾涸結塊，杯底凝固著暗褐色的硬斑；煙灰缸裡的菸蒂早已熄滅冷透，菸灰乾白沉積。依據殘漬乾涸硬化與室溫揮發程度推算，張浩離開這間房間大約是四至五天前，與委託人陳先生報案的失蹤時間序完全吻合！',
                soundEffect: 'paper' as const
              }
            ] as HotspotAction[]
          };
        }
        if (h.id === 'hotspot_shredded_letter_trash') {
          if (!completedWeek1) {
            return {
              ...h,
              shortDesc: '黑色塑料垃圾桶深處，堆著揉爛並剪碎的雜亂紙屑。',
              inspectText: '黑色垃圾桶裡塞滿了被揉皺又用剪刀剪碎的宣傳單與稿紙。你戴上手套仔細檢查，發現大多是廣告傳單、房產推銷單與室內裝修草稿的邊角料。經過細緻鑑識，你判定這些碎紙並無實質案件關聯與拼湊價值。當務之急是勘查室內其他角落。',
              actions: [
                {
                  id: 'trash_inspect_meaningless',
                  label: '【翻查垃圾桶紙屑】研判是否有可疑訊息',
                  resultText: '你戴上手套仔細撥開紙團翻看。紙屑上全是被劃掉的塗鴉、油漆型號與尋常建材報價單，並無異常求救訊息。你判定這些碎紙純屬尋常裝修廢稿，毫無實質調查價值，無需浪費時間拼湊。當務之急是勘查室內其他重要角落。',
                  soundEffect: 'paper' as const,
                  sanDelta: 1
                }
              ]
            };
          } else if (hasLetter) {
            return {
              ...h,
              inspectText: '所有碎紙片已被你在桌上完整拼合還原為一封關鍵信件。',
              actions: [
                {
                  id: 'puzzle_review',
                  label: '檢視已拼合還原的【張浩手寫信】',
                  resultText: '桌上整齊擺放著拼合完成的信件，上面是張浩顫抖的筆跡：「……四樓根本沒有被拆除，而是被隱藏了！404號房就在那裡……」',
                  soundEffect: 'paper' as const
                }
              ]
            };
          } else {
            return {
              ...h,
              shortDesc: '黑色塑料垃圾桶深處，堆著被刻意剪碎的信封與手寫信紙。',
              inspectText: '在經歷過輪迴後，你敏銳察覺這些碎紙片絕非普通廢稿！邊緣被利刃整齊剪開，殘留的鋼筆墨跡隱約浮現出「404」與「不要相信」的字樣……這封被蓄意撕毀的信件，正是打破輪迴的核心關鍵！',
              actions: [
                {
                  id: 'puzzle_start',
                  label: '收集紙片並在桌面上【拼湊信件】',
                  resultText: '你將所有碎紙片攤在桌上，展開關鍵信件拼圖……',
                  soundEffect: 'paper' as const,
                  triggerMinigame: 'letter_puzzle' as const
                }
              ]
            };
          }
        }
        if (h.id === 'hotspot_504_bookshelf' && completedWeek1) {
          return {
            ...h,
            shortDesc: '已被推開的實木大書櫃，後方暗室空洞幽暗，殘留著微弱的油墨與血痕。',
            inspectText: '實木大書櫃在上禮拜已被移開。如今暗室內空空如也，張浩早已被送往療養院。然而暗室深處的水泥牆面上，竟浮現出斑駁的暗紅字痕與打字機敲擊痕跡：「別相信剛印出來的指引……大樓在看著你……」',
            actions: [
              {
                id: 'bookshelf_week2_inspect',
                label: '勘驗暗室牆上的猩紅字痕（確認怪異源頭）',
                resultText: '你借著光線凝視暗室深處。牆上的字痕與論壇上的怪談規則完全吻合——上禮拜的救出只是這棟大樓編織的表層假象，真正的失蹤者與三十年冤案，全被摺疊囚禁在四樓 404 號房！',
                soundEffect: 'knock' as const,
                sanDelta: 2
              }
            ]
          };
        }
        return h;
      });
    }

    if (currentLocId === 'loc_4f_hidden') {
      return currentLocation.hotspots.map(h => {
        if (h.id === 'hotspot_tape_recorder' && hasRecorder) {
          return {
            ...h,
            actions: h.actions.map(act => {
              if (act.id === 'pick_ordinary_pen') {
                return {
                  ...act,
                  label: '【看似普通的原子筆 / 張浩錄音筆】已收納於檔案袋',
                  resultText: '金屬原子筆已收納於物證袋中，旋開筆身可撥動開關收聽張浩留下的最後口述錄音。',
                  obtainItemId: undefined
                };
              }
              return act;
            })
          };
        }
        if (h.id === 'hotspot_fake_rule_poster') {
          return {
            ...h,
            actions: h.actions.map(act => {
              if (act.id === 'tear_fake_rule' || act.id === 'tear_fake_rule_blocked') {
                if (hasFakeRule) {
                  return {
                    ...act,
                    label: '【大樓緊急避難指引（偽造）】已收錄於手冊',
                    resultText: '此指引已被你識破為404怪異的同化誘捕陷阱，已於手冊標註為【偽造規則】。',
                    obtainRuleId: undefined
                  };
                }
                if (!hasCctvRule) {
                  return {
                    ...act,
                    label: '【直覺警告】：尚未掌握監視系統與紅色制服真相，不可輕信官方偽裝！',
                    resultText: '立在四樓梯口的避難告示牌紙質潔白端正，蓋著鮮紅的管委會印章，語氣無比安詳溫和。但在尚未詳閱《監視系統操作指引》並了解第四頻道與紅色制服真相前，你無法看穿其誘捕本質，貿然撕下恐引發認知污染反撲！',
                    obtainRuleId: undefined,
                    sanDelta: -2,
                    soundEffect: 'glitch' as const
                  };
                }
                return {
                  ...act,
                  label: '對照【住戶守則】與【監視系統操作指引】識破陷阱，安全撕下【大樓緊急避難指引】',
                  resultText: '★ 獲得規約【大樓緊急避難指引】！你對照《住戶守則》第3條（警衛制服為白衣黑褲、非白衣者予以忽略）與《監視系統操作指引》（404門牌出現在不同位置為正常現象），識破告示牌聲稱『專案人員穿紅衣、前往404避難』實為怪異的同化誘捕陷阱！你冷靜地將這張偽裝得極其乾淨溫和的官方告示牌撕下收存，成功免疫了誘捕認知反噬，揭穿了怪異偽裝誘捕的手段，獲得關鍵真相物證規約。',
                  sanDelta: 3,
                  obtainRuleId: 'rule_fake_evacuation'
                };
              }
              return act;
            })
          };
        }
        if (h.id === 'hotspot_4f_fire_hydrant' && hasCameraFilm) {
          return {
            ...h,
            actions: h.actions.map(act => {
              if (act.id === 'pick_old_camera_film') {
                return {
                  ...act,
                  label: '【未沖洗的柯達黑白底片筒】已收納於檔案袋',
                  resultText: '1998年違建現場底片筒已收存於物證袋中，可在檔案袋中以強光照射透視底片顯影。',
                  obtainItemId: undefined
                };
              }
              return act;
            })
          };
        }
        return h;
      });
    }

    if (currentLocId === 'loc_502_interior') {
      const rescueHint = trait ? TRAIT_RESCUE_HINTS[trait] : null;

      if (wallRescueStep === 1) {
        return currentLocation.hotspots
          .filter(h => h.id === 'hotspot_502_wall_fissure')
          .map(h => ({
            ...h,
            name: rescueHint 
              ? `502 隔間牆壁與壁紙縫隙・${rescueHint.badge}`
              : '502 隔間牆壁與壁紙縫隙 (西西酥酥怪聲源頭)',
            actions: (isFlashlightOn ? [
              {
                id: 'act_observe_wall_fissure',
                label: rescueHint 
                  ? `【手電筒照射觀察裂痕】${rescueHint.badge}`
                  : '【手電筒照射觀察裂痕】以強光手電筒貼近裂隙詳查',
                resultText: `【發現牆壁裂痕與急促微弱喘息】：你打開強光手電筒近距離照射，壁紙下方赫然有一道深長裂痕！裂縫深處除了「西西酥酥」宛如老鼠抓撓的聲音外，更傳來了斷斷續續、極其虛弱的人類抽吸喘息聲！這絕對不是老鼠，裡面有人！\n\n${rescueHint ? rescueHint.step1WallHint : ''}`,
                soundEffect: 'knock' as const,
                sanDelta: 2
              }
            ] : [
              {
                id: 'act_observe_wall_fissure_dark',
                label: '【直接觀察牆壁裂痕】貼近壁紙裂縫摸索（未開手電筒）',
                resultText: '【光線昏暗・無法看清】：隔間牆裂縫深處光線不足、漆黑一片，僅能隱約聽見微弱怪聲，但肉眼完全看不清內部深處的狀況。必須開啟隨身強光手電筒照射才能看清暗處並推進下一步調查！',
                soundEffect: 'paper' as const
              }
            ]) as HotspotAction[]
          }));
      } else if (wallRescueStep === 2) {
        return currentLocation.hotspots
          .filter(h => h.id === 'hotspot_502_crack_explore')
          .map(h => ({
            ...h,
            name: rescueHint 
              ? `牆壁裂痕內部探照・${rescueHint.badge}`
              : '牆壁裂痕內部 (往內探索視線死角)',
            actions: (isFlashlightOn ? [
              {
                id: 'act_explore_inside_crack',
                label: rescueHint 
                  ? `【用手電筒探照夾層】${rescueHint.badge}`
                  : '【用手電筒向裂隙深處探照】光束照射內部中空夾層',
                resultText: `【往內探索赫然發現有人！】：手電筒光束穿透狹窄的石膏裂縫，照亮了牆壁內部的漆黑夾層——光束下赫然映出一雙滿是血絲、因恐懼與絕望而淌著眼淚的人類眼睛！以及一張極度乾癟蒼白的青年臉孔！受困者正用已磨爛滲血的十指，微弱地抓撓著石膏板內壁求救（西西酥酥的聲音正是由此而來）！那人正是失蹤多日的【張浩】！\n\n${rescueHint ? rescueHint.step2CrackHint : ''}`,
                soundEffect: 'tension' as const,
                sanDelta: 5
              }
            ] : [
              {
                id: 'act_explore_inside_crack_dark',
                label: '【直接向裂痕內部探索】貼近裂隙向內窺探（未開手電筒）',
                resultText: '【視線死角漆黑一片】：中空暗縫深處伸手不見五指，陰影籠罩了一切，肉眼什麼也看不清。必須開啟隨身強光手電筒向內部深處探照，才能看清死角狀況並推進下一步調查！',
                soundEffect: 'paper' as const
              }
            ]) as HotspotAction[]
          }));
      } else {
        return currentLocation.hotspots
          .filter(h => h.id === 'hotspot_502_break_wall_rescue')
          .map(h => ({
            ...h,
            name: rescueHint 
              ? `石膏隔板與破牆救援行動・${rescueHint.badge}`
              : '石膏隔板與破牆救援行動 (實施緊急破拆)',
            actions: [
              {
                id: 'act_break_wall_save_zhanghao',
                label: rescueHint 
                  ? `【${rescueHint.badge.replace(/[【】]/g, '')}・打破牆壁救出張浩】` 
                  : '【打破牆壁救出張浩】全力砸開石膏隔牆，實施緊急救援！',
                resultText: `【破牆救出張浩・第1輪正式結束】：你掄起消防斧，對準裂痕與石膏隔板狠狠砸下！「砰！轟隆！」石膏板轟然崩塌破開！塵土飛揚中，你伸手探入夾層，將虛弱無比、嚴重脫水的張浩拉了出來！\n\n${rescueHint ? rescueHint.actionCompletionText + '\n\n' : ''}張浩倒在你的懷裡，嘴唇乾裂，血肉模糊的雙手顫抖著，微弱呢喃：「救……救出來了……」你迅速撥打 119 與 110，救護車警笛長鳴而至將張浩送醫搶救！安祥路88號失蹤案成功破案！`,
                soundEffect: 'knock' as const,
                triggerEnding: 'ending0' as const
              }
            ] as HotspotAction[]
          }));
      }
    }

    return currentLocation.hotspots;
  }, [
    currentLocId,
    currentLocation,
    trait,
    isGuardInSecurityRoom,
    hasKey504,
    hasResidentRule,
    hasLetter,
    hasBlueprints,
    hasGuardKeycard,
    hasCctvRule,
    hasHandwrittenRule,
    hasCleanerRule,
    hasElevatorManual,
    hasRecorder,
    hasFakeRule,
    hasCameraFilm,
    is504InvestigationComplete,
    hasUnlocked502,
    hasEncountered5FNeighborComplaint,
    wallRescueStep,
    completedWeek1,
    isFlashlightOn
  ]);

  // Synchronized active hotspot derived from activeHotspots to ensure dynamic state updates (such as flashlight toggle)
  const currentActiveHotspot = useMemo(() => {
    if (!activeHotspot) return null;
    const found = activeHotspots.find(h => h.id === activeHotspot.id);
    return found || activeHotspot;
  }, [activeHotspot, activeHotspots]);

  // Check if a hotspot (investigation point) requires a flashlight to discover clues/traces
  const checkHotspotNeedsFlashlight = useCallback((hotspot: HotspotItem | null) => {
    if (!hotspot) return false;

    // Explicit known investigation points that require a flashlight
    const FLASHLIGHT_HOTSPOT_IDS = [
      'hotspot_stair_4f_corner',
      'hotspot_502_wall_fissure',
      'hotspot_502_crack_explore',
      'hotspot_wall_scratch',
      'hotspot_wall_crevice_inner'
    ];
    if (FLASHLIGHT_HOTSPOT_IDS.includes(hotspot.id)) {
      return true;
    }

    const textToSearch = [
      hotspot.id,
      hotspot.name,
      hotspot.shortDesc || '',
      hotspot.inspectText,
      ...hotspot.actions.map(a => `${a.id} ${a.label} ${a.resultText}`)
    ].join(' ');

    const triggerKeywords = [
      '手電筒',
      '戰術手電筒',
      '強光',
      '漆黑',
      '黑暗',
      '暗角',
      '暗縫',
      '死角',
      '夾縫',
      '踢腳板',
      '光線不足',
      '陰暗死角'
    ];

    return triggerKeywords.some(kw => textToSearch.includes(kw));
  }, []);

  // Check if player is currently on the 1st Floor
  const isOnFirstFloor = currentLocation.floor === '1F' || currentLocId === 'loc_1f_lobby' || currentLocId === 'loc_1f_security';

  // Sound play helper based on action
  const playActionSound = (effect?: string) => {
    switch (effect) {
      case 'water':
        sound.playWaterDrop();
        break;
      case 'switch':
        sound.playSwitch();
        break;
      case 'knock':
        sound.playKnock();
        break;
      case 'paper':
        sound.playPaper();
        break;
      case 'glitch':
        sound.playGlitch();
        break;
      case 'phone':
        sound.playPhoneTone();
        break;
      case 'chime':
        sound.playElevatorChime();
        break;
      case 'cctv':
        sound.playCctvBeep();
        break;
      case 'tension':
        sound.playTensionSting();
        break;
      default:
        sound.playClick();
        break;
    }
  };

  // Helper to check anomaly block states for Elevator and Stairs
  const getTransitBlockStatus = (mode: 'elevator' | 'stairs', targetId: string) => {
    let isBlocked = false;
    let blockReason = '';

    // Requirement 1: Before talking to guard (!hasKey504), all transits from 1F are blocked
    if (!hasKey504) {
      isBlocked = true;
      blockReason = '【警衛阻攔】：值班台警衛王大偉正注視著你，訪客請先在警衛窗口登記並說明來意，不可擅自搭乘電梯或走樓梯。';
      return { isBlocked, blockReason };
    }

    // Requirement 2: After getting 504 key (hasKey504), but BEFORE getting Guard Rules (!hasGuardRule):
    // 1. Stairs are completely locked (forced to take elevator).
    // 2. Elevator is locked for 2F and 3F (forced to go to 5F or back to 1F).
    if (!hasGuardRule) {
      if (mode === 'stairs') {
        isBlocked = true;
        blockReason = '【夜間門禁管制】：安全梯防火重門已啟動夜間電子磁扣管制。警衛王大偉交代：「504號房在五樓，請直接搭乘右側客用電梯直達五樓。」';
        return { isBlocked, blockReason };
      }
      if (mode === 'elevator') {
        if (targetId === 'loc_2f_corridor' || targetId === 'loc_3f_corridor') {
          isBlocked = true;
          blockReason = '【警衛指示】：請先搭乘電梯直達五樓 504 號房進行勘查，其餘樓層按鈕暫未開放。';
          return { isBlocked, blockReason };
        }
      }
    }

    // Check guard in security room
    if (targetId === 'loc_1f_security' && isGuardInSecurityRoom) {
      isBlocked = true;
      blockReason = '【警衛值勤中：警衛正坐在值班台內，非工作人員無法進入警衛室，請先向警衛借鑰匙上樓調查】';
    } else if (targetId === 'loc_4f_hidden' && !is4FLateGameUnlocked) {
      if (mode === 'elevator') {
        isBlocked = true;
        blockReason = '【電梯無此按鈕：大樓電梯按鈕僅有1、2、3、5，四樓位置為封死金屬片，無法主動前往】';
      } else {
        isBlocked = true;
        blockReason = '【樓梯無四樓入口：大樓U字形兩段式樓梯從3樓往上走會直接進入5樓，中間並無四樓開口】';
      }
    } else if (mode === 'elevator') {
      // Scenario 1: Low SAN glitch (Requirement 4: 保留避難生路供玩家移動，避免雙向死鎖)
      if (san < 25 && currentLocId !== 'loc_1f_lobby') {
        if (targetId !== 'loc_1f_lobby') {
          isBlocked = true;
          blockReason = '【怪異干擾：理智過低導致空間認知受阻，多數按鈕失靈；唯有一樓避難生路按鈕尚能運作】';
        }
      }
      // Scenario 2: 4F locked room without deep handwritten rule
      else if (targetId === 'loc_4f_hidden' && is4FLateGameUnlocked && !hasHandwrittenRule && san < 40) {
        isBlocked = true;
        blockReason = '【怪異干擾：電梯停在四樓時門縫中傳出打字機狂亂敲擊聲，警報蜂鳴】';
      }
    }

    return { isBlocked, blockReason };
  };

  // Floor Destinations for Elevator / Stairs
  const getTransitDestinations = (mode: 'elevator' | 'stairs') => {
    if (mode === 'elevator') {
      return [
        { id: 'loc_1f_lobby', floor: '1F', name: '一樓大廳交誼廳' },
        { id: 'loc_2f_corridor', floor: '2F', name: '二樓走廊' },
        { id: 'loc_3f_corridor', floor: '3F', name: '三樓走廊' },
        { 
          id: 'loc_4f_hidden', 
          floor: is4FLateGameUnlocked ? '4F' : '', 
          name: is4FLateGameUnlocked ? '四樓隱藏走廊【破除認知：強行手動輸入四樓座標】' : '【封死金屬片】(按鍵盤無此樓層按鈕)', 
          isSecret: true,
          isMetalPlate: !is4FLateGameUnlocked
        },
        { id: 'loc_5f_corridor', floor: '5F', name: '五樓走廊' },
      ];
    } else {
      return [
        { id: 'loc_1f_lobby', floor: '1F', name: '一樓大廳交誼廳' },
        { id: 'loc_2f_corridor', floor: '2F', name: '二樓走廊' },
        { id: 'loc_3f_corridor', floor: '3F', name: '三樓走廊' },
        ...(is4FLateGameUnlocked ? [
          { 
            id: 'loc_4f_hidden', 
            floor: '4F', 
            name: '四樓隱藏走廊【破除認知：強行翻越折返水泥磚牆】', 
            isSecret: true 
          }
        ] : [
          {
            id: 'loc_4f_hidden',
            floor: '—',
            name: '【結構直接跳過】(3F階梯直通5F轉角平台)',
            isSecret: true
          }
        ]),
        { id: 'loc_5f_corridor', floor: '5F', name: '五樓走廊' },
      ];
    }
  };

  const transitDestinations = getTransitDestinations(activeTransitMode || 'elevator');

  // Perform floor transition
  const handleTransitToFloor = (mode: 'elevator' | 'stairs', targetId: string) => {
    const targetLoc = BUILDING_LOCATIONS[targetId];
    if (!targetLoc) return;

    if (targetId === currentLocId) {
      setActiveTransitMode(null);
      return;
    }

    // Check guard blocking if trying to leave 1F without talking to guard
    if (!hasKey504 && (currentLocId === 'loc_1f_lobby' || isOnFirstFloor) && targetId !== 'loc_1f_lobby' && targetId !== 'loc_1f_security') {
      sound.playKnock();
      setActionFeedback({
        text: '【警衛阻攔】：值班台警衛王大偉叫住了你：「先生！訪客請先在值班窗口登記並說明來意，不可隨意擅闖大樓其他樓層！」請先至警衛窗口對話。',
        type: 'normal'
      });
      setActiveTransitMode(null);
      return;
    }

    // Check guard instructions: Before getting guard rules, stairs are locked and elevator only goes to 5F/1F
    if (!hasGuardRule) {
      if (mode === 'stairs') {
        sound.playKnock();
        setActionFeedback({
          text: '【安全梯夜間門禁鎖定】：安全梯防火重門正處於夜間電子防盜磁扣鎖閉狀態。警衛王大偉交代：「504號房在五樓，請直接搭乘右側客用電梯直達五樓，未持通行磁扣請勿強行推門。」請搭乘電梯前往五樓調查。',
          type: 'normal'
        });
        setActiveTransitMode(null);
        return;
      }
      if (mode === 'elevator' && (targetId === 'loc_2f_corridor' || targetId === 'loc_3f_corridor')) {
        sound.playKnock();
        setActionFeedback({
          text: '【警衛指示】：請先搭乘電梯直達五樓 504 號房進行勘查，其餘樓層按鈕暫未開放。',
          type: 'normal'
        });
        setActiveTransitMode(null);
        return;
      }
    }

    // In Week 1: leaving 504 requires taking the elevator back to 1F lobby
    if (!completedWeek1 && is504InvestigationComplete && !hasTakenElevatorTo1FAfter504) {
      if (mode === 'stairs' && targetId === 'loc_1f_lobby') {
        sound.playKnock();
        setActionFeedback({
          text: '【現場直覺・搭乘常規電梯】：搜查完 504 號房後，樓梯間堆滿了裝修廢棄的水泥袋與管線，昏暗難行。為了盡快回一樓向警衛查證住戶狀況，走廊中央的客用電梯是最直捷的下樓路徑。',
          type: 'normal'
        });
        setActiveTransitMode(null);
        return;
      }
      if (mode === 'elevator' && targetId === 'loc_1f_lobby') {
        setHasTakenElevatorTo1FAfter504(true);
      }
    }

    // Check First 4F Experience when leaving 504 (Round 2: Week 2 only)
    if (completedWeek1 && currentLocId === 'loc_504_interior' && !hasExperiencedFirst4F) {
      sound.playTensionSting();
      setActiveTransitMode(null);
      setShowFirst4FModal(true);
      return;
    }

    // Check Second 4F Experience: After exploring 2F & 3F with cleaner rule, returning down triggers 2nd 4F distortion
    const hasExplored2FAnd3F = Boolean(
      hasCleanerRule &&
      (visitedLocations.includes('loc_3f_corridor') || currentLocId === 'loc_3f_corridor')
    );

    if (
      !hasExperiencedSecond4F &&
      hasExplored2FAnd3F &&
      (currentLocId === 'loc_3f_corridor' || (currentLocId === 'loc_2f_corridor' && visitedLocations.includes('loc_3f_corridor'))) &&
      targetId !== currentLocId &&
      (targetId === 'loc_1f_lobby' || targetId === 'loc_elevator' || targetId === 'loc_stairwell')
    ) {
      sound.playTensionSting();
      sound.playGlitch();
      setActiveTransitMode(null);
      onModifySan(-10);
      setShowSecond4FModal(true);
      return;
    }

    // Check Security Room lock when guard is present
    if (targetId === 'loc_1f_security' && isGuardInSecurityRoom) {
      sound.playKnock();
      setActionFeedback({
        text: '【無法進入警衛室】：警衛王大偉正坐在警衛室值班台內，神色嚴肅地看著你：「先生，警衛室是安控重地，非工作人員請勿隨意進入！」請先遵守規約上樓調查，或向警衛出示線索對質。',
        type: 'normal'
      });
      setActiveTransitMode(null);
      return;
    }

    // Check 4F lock
    if (targetId === 'loc_4f_hidden' && !is4FLateGameUnlocked) {
      sound.playGlitch();
      setActionFeedback({
        text: mode === 'elevator' 
          ? '電梯按鍵盤根本沒有4樓按鈕（該位置為封死金屬片）！除特定劇情異變外，玩家無法主動搭乘電梯進入4樓。'
          : '大樓樓梯為U字形折返設計，從3樓往上爬會直接抵達5樓平台！中間並無四樓開口。',
        type: 'normal'
      });
      setActiveTransitMode(null);
      return;
    }

    // Animation transition
    if (mode === 'elevator') {
      sound.playElevatorChime();
      setTransitAnimationText(`搭乘老舊客用電梯……金屬滑輪低鳴，指示燈切換至 ${targetLoc.floor}。`);
      onAddJournalEntry({
        category: 'action',
        title: `搭乘公共電梯前往 ${targetLoc.floor}`,
        content: `進入客用電梯，按下 ${targetLoc.floor} 按鈕。金屬門閉合，電梯伴隨輕微震顫抵達 ${targetLoc.name}。`,
        location: `${currentLocation.floor} → ${targetLoc.floor}`
      });
    } else {
      sound.playKnock();
      setTransitAnimationText(`行走於水泥U字形兩段式折返階梯……腳步迴音在平台間迴盪，抵達 ${targetLoc.floor}。`);
      onAddJournalEntry({
        category: 'action',
        title: `行走U字形樓梯前往 ${targetLoc.floor}`,
        content: `推開沉重的防火門，沿著兩段式水泥階梯步行上下，途經折返平台抵達 ${targetLoc.name}。`,
        location: `${currentLocation.floor} → ${targetLoc.floor}`
      });
    }

    const transitDelay = 900;

    setTimeout(() => {
      setTransitAnimationText(null);
      setActiveTransitMode(null);
      setCurrentLocId(targetId);
      setActiveHotspot(null);
      setActionFeedback(null);
      setActiveObservation(null);
      // Reset safe actions cooldown after moving between locations
      setMovesSinceLastSafeRest(prev => {
        const next = prev + 1;
        if (next >= 2) {
          setUsedSafeActions({});
          return 0;
        }
        return next;
      });

      // Decrement recovery window after transit if active
      if (onDecrementRecoveryWindow) {
        onDecrementRecoveryWindow();
      }

      // Check Guard Patrol QTE trigger in 2F, 3F, 4F, 5F corridors (after obtaining Guard Rule)
      const isCorridorTarget = ['loc_2f_corridor', 'loc_3f_corridor', 'loc_4f_hidden', 'loc_5f_corridor'].includes(targetId);
      const isGuardPatrolEligible = completedWeek1 && hasGuardRule && hasExperiencedFirst4F && isCorridorTarget && movesSinceLastGuardPatrol >= 3;

      if (isGuardPatrolEligible && Math.random() < 0.35) {
        setMovesSinceLastGuardPatrol(0);
        setTimeout(() => {
          setShowGuardPatrolQTE(true);
        }, 400);
        return;
      } else {
        setMovesSinceLastGuardPatrol(prev => prev + 1);
      }

      // Random Building Anomaly Phenomenon on Floor Movement (大樓異常現象：燈光閃爍、奇怪低語、未知腳步等)
      // 僅在玩家於二周目怪異模式（completedWeek1 為真）且四樓怪異覺醒後，大樓異常才會開始顯現
      const isNonOfficeTarget = targetId !== 'loc_detective_office' && targetId !== 'loc_404_interior';
      if (completedWeek1 && isNonOfficeTarget && hasExperiencedFirst4F) {
        const sanRatio = Math.max(0, Math.min(1, san / 100)); // 1.0 (SAN 100) -> 0.0 (SAN 0)

        // 1. Rare Sensory Visual & Auditory Anomaly Events (極低機率罕見大樓視覺異象庫：血紅走廊、異常敲門聲等)
        // Base probability is calibrated to 15%, increasing up to 32% at critical SAN
        const rareChance = 0.15 + (1 - sanRatio) * 0.17;
        if (Math.random() < rareChance) {
          const rareEvent = RARE_SENSORY_ANOMALIES[Math.floor(Math.random() * RARE_SENSORY_ANOMALIES.length)];
          setActiveRareVisualEffect(rareEvent);

          // Audio triggers
          if (rareEvent.type === 'blood_red_corridor') {
            sound.playBloodPulse();
            sound.playGlitch();
          } else if (rareEvent.type === 'ominous_distant_knocking') {
            sound.playHeavyOminousKnock();
            sound.playTensionSting();
          } else if (rareEvent.type === 'wall_bleeding_text') {
            sound.playTypewriter();
            sound.playGlitch();
          } else if (rareEvent.type === 'temporal_rewind_stutter') {
            sound.playClockRewind();
            sound.playTensionSting();
          } else if (rareEvent.type === 'faceless_shadow_gaze') {
            sound.playWaterDrop();
            sound.playTensionSting();
            sound.playGlitch();
          }

          // Apply mental impact with safe floor (random ambient phenomena will not drop SAN below 5)
          const safeRareSanLoss = Math.min(rareEvent.sanLoss, Math.max(0, san - 5));
          if (safeRareSanLoss > 0) {
            onModifySan(-safeRareSanLoss);
          }

          onAddJournalEntry({
            category: 'system',
            title: `【罕見大樓異象】：${rareEvent.title}`,
            content: `${rareEvent.description} 「${rareEvent.quote}」 精神受到強烈震撼，心理承受力受到侵蝕衝擊。`,
            location: `${currentLocation.name} → ${targetLoc.name}`,
            sanDelta: -safeRareSanLoss
          });

          setTimeout(() => {
            setActiveRareVisualEffect(prev => (prev?.id === rareEvent.id ? null : prev));
          }, rareEvent.duration);
        }

        // 2. Micro Ambient Transit Anomalies (常規微型異象：耳畔低語、陰風、排風管打字等)
        // High SAN (100) => 22% chance; Low SAN (30) => 62% chance; Critical SAN (10) => 76% chance
        const anomalyChance = 0.22 + (1 - sanRatio) * 0.60;

        if (Math.random() < anomalyChance) {
          const transitAnomalies: Array<{
            type: 'flicker' | 'whisper' | 'footsteps' | 'cold_draft' | 'typewriter' | 'shadow';
            title: string;
            description: string;
            sanLoss: number;
            quote?: string;
            soundType: 'glitch' | 'tension' | 'switch' | 'paper' | 'knock';
          }> = [
            {
              type: 'flicker',
              title: '梯廳筒燈劇烈閃爍與電流蜂鳴',
              description: `剛踏出${mode === 'elevator' ? '電梯車廂' : '樓梯轉角'}，走廊頂部的老舊日光燈管突然發出刺耳的「滋滋」電流噪聲，視野瞬間陷入幾度明滅交錯的幽暗。`,
              sanLoss: san < 40 ? 3 : 2,
              quote: '……它在燈光的陰影盲區裡注視著你……',
              soundType: 'glitch'
            },
            {
              type: 'whisper',
              title: '耳畔掠過濕冷粘稠的模糊低語',
              description: '空氣中突然傳來若有似無的氣音，像是有人貼在你的耳廓旁極快地重複念誦著違禁字句，但猛然回頭身後卻空無一人。',
              sanLoss: san < 30 ? 4 : 2,
              quote: '「……不要相信第……條……快回頭……」',
              soundType: 'tension'
            },
            {
              type: 'footsteps',
              title: '折返平台深處傳來沉重皮鞋回音',
              description: `${mode === 'stairs' ? '樓梯間水泥牆' : '走廊遠處水磨石地面'}傳來規律而拖沓的皮鞋腳步聲，與你的移動節奏形成可怕的重疊。`,
              sanLoss: san < 40 ? 3 : 2,
              quote: '噠……噠……噠……步伐停在距你三米外的轉角處。',
              soundType: 'knock'
            },
            {
              type: 'cold_draft',
              title: '牆縫噴湧出帶著陳舊油墨味的刺骨陰風',
              description: '門縫與水泥踢腳板之間突然竄出一股令人戰慄的冰冷氣流，伴隨著強烈刺鼻的舊打字機色帶與甲醛氣味。',
              sanLoss: 2,
              quote: '整座大樓的混凝土結構彷彿在深沉地喘息……',
              soundType: 'tension'
            },
            {
              type: 'typewriter',
              title: '天花板通風管道傳來瘋狂打字機敲擊聲',
              description: '頭頂生鏽的金屬排風百葉窗深處，傳來極為急促的鋼字鍵敲打與色帶回捲金屬鈴聲，隨即戛然而止。',
              sanLoss: san < 50 ? 3 : 2,
              quote: '叮！——一條不可名狀的規則正在水泥內部被即時銘刻。',
              soundType: 'paper'
            },
            {
              type: 'shadow',
              title: '眼角餘光瞥見紅色衣角掠過門縫',
              description: '在轉入走廊的剎那，視線邊緣分明有一抹鮮紅色的衣襬迅速縮入半掩的房門陰影之中。',
              sanLoss: san < 30 ? 4 : 3,
              quote: '「大樓內絕無身著紅色制服之工作人員……」',
              soundType: 'glitch'
            }
          ];

          const selected = transitAnomalies[Math.floor(Math.random() * transitAnomalies.length)];

          // Trigger sound and visual effects
          if (selected.type === 'typewriter') {
            sound.playDeafeningTypewriterFlurry(1.8);
          } else if (selected.soundType === 'glitch') sound.playGlitch();
          else if (selected.soundType === 'tension') sound.playTensionSting();
          else if (selected.soundType === 'knock') sound.playKnock();
          else if (selected.soundType === 'paper') sound.playPaper();
          else sound.playSwitch();

          if (selected.type === 'flicker' || selected.type === 'shadow') {
            setIsFlickeringEffect(true);
            setTimeout(() => setIsFlickeringEffect(false), 900);
          }

          // Apply mental impact via onModifySan with safe floor (random ambient transit will not drop SAN below 5)
          const safeTransitSanLoss = Math.min(selected.sanLoss, Math.max(0, san - 5));
          if (safeTransitSanLoss > 0) {
            onModifySan(-safeTransitSanLoss);
          }

          // Set active transient alert banner
          setTransitAnomalyAlert({
            type: selected.type,
            title: selected.title,
            description: selected.description,
            sanLoss: safeTransitSanLoss,
            quote: selected.quote
          });

          // Record in detective journal
          onAddJournalEntry({
            category: 'system',
            title: `【大樓異常現象】：${selected.title}`,
            content: `${selected.description}${selected.quote ? ` 「${selected.quote}」` : ''} 精神受到侵蝕，心理防線受到衝擊。`,
            location: `${currentLocation.name} → ${targetLoc.name}`,
            sanDelta: -safeTransitSanLoss
          });

          // Auto clear alert banner after 5.5 seconds (or user dismisses)
          setTimeout(() => {
            setTransitAnomalyAlert(prev => prev && prev.title === selected.title ? null : prev);
          }, 5500);
        }
      }

      // Anomaly Check: Chance to trigger random urban legend anomaly upon arriving at destination
      // Suppressed during recoveryWindow after successfully neutralizing a Tier 2/3 high-risk anomaly
      if (recoveryWindow > 0) {
        setMovesSinceLastAnomaly(prev => prev + 1);
      } else if (obtainedRules.length >= 2 && hasExperiencedFirst4F && targetId !== 'loc_detective_office' && targetId !== 'loc_404_interior' && !targetLoc.isSafeZone) {
        // Cooldown: Guarantee at least 2 peaceful transitions after an anomaly before another random trigger
        const isOffCooldown = movesSinceLastAnomaly >= 2;
        // Probability scales with rules collected and significantly increases as SAN decreases
        const sanRatio = Math.max(0, Math.min(1, san / 100)); // 1.0 (SAN 100) -> 0.0 (SAN 0)
        const baseChance = 0.25;
        const ruleBonus = Math.min(0.08, (obtainedRules.length - 2) * 0.02);
        const sanBonus = (1 - sanRatio) * 0.25; // +0% at 100 SAN, up to +25% at 0 SAN
        const triggerChance = baseChance + ruleBonus + sanBonus;
        const forcedTrigger = movesSinceLastAnomaly >= 5; // Safety net: guarantee trigger if 5 peaceful moves

        if (isOffCooldown && (forcedTrigger || Math.random() < triggerChance)) {
          const anomaly = getRandomAnomalyEvent(
            obtainedRules.length,
            mode === 'elevator' ? 'elevator' : mode === 'stairs' ? 'stairs' : 'corridor',
            String(targetLoc.floor)
          );
          if (anomaly) {
            setMovesSinceLastAnomaly(0);
            setTimeout(() => {
              setActiveAnomalyEvent(anomaly);
            }, 350);
          } else {
            setMovesSinceLastAnomaly(prev => prev + 1);
          }
        } else {
          setMovesSinceLastAnomaly(prev => prev + 1);
        }
      }
    }, transitDelay);
  };

  // Open hotspot inspection
  const handleInspectHotspot = (hotspot: HotspotItem) => {
    sound.playClick();
    setActiveHotspot(hotspot);
    setActionFeedback(null);
    setMobileTab('sensory');

    if (!inspectedHotspots.includes(hotspot.id)) {
      setInspectedHotspots(prev => [...prev, hotspot.id]);
    }

    // Week 1 after 504: investigating any 1F object triggers the 1F neighbor complaint QTE
    if (isOnFirstFloor && isAwaiting1FInvestigationForMice) {
      setTimeout(() => {
        sound.playTensionSting();
        setActiveEpiphanyQTEId('mouse_scratch_wall_complaint');
        setHasEncountered5FNeighborComplaint(true);
      }, 700);
    }
  };

  // Execute hotspot action
  const handleExecuteAction = (action: HotspotAction) => {
    playActionSound(action.soundEffect);

    // UX Priority 1: Mark this action as executed
    setExecutedActionIds(prev => (prev.includes(action.id) ? prev : [...prev, action.id]));

    // Return key 504 removes key from inventory
    if (action.id === 'guard_return_key_and_inquire') {
      onRemoveItem?.('key_504');
    }

    // Special: Trigger leave building flow if action is leaving
    if (action.triggerEnding === 'ending1') {
      if (isAwaiting1FInvestigationForMice) {
        sound.playTensionSting();
        setActiveEpiphanyQTEId('mouse_scratch_wall_complaint');
        setHasEncountered5FNeighborComplaint(true);
        setActionFeedback({
          text: '【大廳突發騷動】：你正準備推門走出大樓離開，身後值班台前突然傳來五樓住戶情緒激動的拍桌聲與激烈爭吵……！',
          type: 'normal'
        });
        return;
      }
      setShowLeaveBuildingModal(true);
      return;
    }

    // Week 1 after 504: executing any action on 1F triggers the 1F neighbor complaint QTE
    if (isOnFirstFloor && isAwaiting1FInvestigationForMice) {
      setTimeout(() => {
        sound.playTensionSting();
        setActiveEpiphanyQTEId('mouse_scratch_wall_complaint');
        setHasEncountered5FNeighborComplaint(true);
      }, 500);
    }

    // Week 1: 502 Wall Rescue step progression (sequential execution, one option at a time)
    if (action.id === 'act_observe_wall_fissure' || action.id === 'act_observe_wall_fissure_dark') {
      if (!isFlashlightOn) {
        sound.playPaper();
        setActionFeedback({
          text: '【光線昏暗・無法看清】：隔間牆裂縫深處光線不足、漆黑一片，僅能隱約聽見微弱怪聲，但肉眼完全看不清內部深處的狀況。必須開啟「隨身強光手電筒」照射才能看清暗處並推進下一步調查！',
          type: 'normal'
        });
        return;
      }
      // 單一連續救援場景中保持手電筒常開，不自動關閉
      setWallRescueStep(2);
      const nextHotspot = BUILDING_LOCATIONS['loc_502_interior']?.hotspots.find(h => h.id === 'hotspot_502_crack_explore');
      if (nextHotspot) {
        setActiveHotspot(nextHotspot);
      }
      setIsZhangHaoRescueModalOpen(true);
    }
    if (action.id === 'act_explore_inside_crack' || action.id === 'act_explore_inside_crack_dark') {
      if (!isFlashlightOn) {
        sound.playPaper();
        setActionFeedback({
          text: '【視線死角漆黑一片】：中空暗縫深處伸手不見五指，陰影籠罩了一切，肉眼什麼也看不清。必須開啟「隨身強光手電筒」向內部深處探照，才能看清死角狀況並推進下一步調查！',
          type: 'normal'
        });
        return;
      }
      // 單一連續救援場景中保持手電筒常開，不自動關閉
      setWallRescueStep(3);
      const nextHotspot = BUILDING_LOCATIONS['loc_502_interior']?.hotspots.find(h => h.id === 'hotspot_502_break_wall_rescue');
      if (nextHotspot) {
        setActiveHotspot(nextHotspot);
      }
      setIsZhangHaoRescueModalOpen(true);
    }
    if (action.id === 'act_break_wall_save_zhanghao') {
      setIsZhangHaoRescueModalOpen(true);
      return;
    }

    let sanDeltaValue = 0;
    // Apply SAN modification with Trait Multiplier & Safe Area Cooldown Check
    if (action.sanDelta && typeof action.sanDelta === 'number') {
      if (action.sanDelta > 0) {
        if (usedSafeActions[action.id]) {
          setActionFeedback({
            text: '【暫時無需重複休整】：你剛才已經在此調適過狀態了，短時間內重複休整無法進一步平復精神。請先前往其他區域推進調查後再來。',
            type: 'normal'
          });
          return;
        }
        setUsedSafeActions(prev => ({ ...prev, [action.id]: true }));
      }

      sanDeltaValue = action.sanDelta;
      if (sanDeltaValue < 0) {
        // Requirement 3: 當玩家連點錯誤選項時，至多只會扣除兩次，之後除非離開該場景重新返回，否則不會再扣。
        if (sceneWrongChoicePenaltyCount >= 2) {
          sanDeltaValue = 0;
          setActionFeedback({
            text: '【精神防禦保護】：在同一場景承受心智衝擊已達上限，神經暫時鈍化以維持意志，離開該場景重新返回前不再受到衝擊。',
            type: 'normal'
          });
        } else {
          setSceneWrongChoicePenaltyCount(prev => prev + 1);
          const multiplier = traitData.sanGlitchMultiplier ?? 1;
          sanDeltaValue = Math.round(sanDeltaValue * multiplier);
          if (sanDeltaValue === 0 && action.sanDelta < 0) {
            sanDeltaValue = -1;
          }
          onModifySan(sanDeltaValue);
        }
      } else if (sanDeltaValue > 0) {
        onModifySan(sanDeltaValue);
      }
    }

    // Apply item obtain
    if (action.obtainItemId) {
      sound.playSFX('inspect_success');
      onObtainItem(action.obtainItemId);
      const item = INVENTORY_ITEMS[action.obtainItemId];
      onAddJournalEntry({
        category: 'system',
        title: `取得關鍵物證：【${item?.name || action.obtainItemId}】`,
        content: `在「${activeHotspot?.name}」搜查過程中，尋獲關鍵物件【${item?.name}】並收納入物證檔案袋。`,
        location: currentLocation.name,
        sanDelta: sanDeltaValue !== 0 ? sanDeltaValue : undefined
      });
    }

    // Apply rule obtain
    if (action.obtainRuleId) {
      if (!action.obtainItemId) {
        sound.playSFX('inspect_success');
      }
      onObtainRule(action.obtainRuleId);
      const rule = RULES_DATA[action.obtainRuleId];
      onAddJournalEntry({
        category: 'system',
        title: !completedWeek1 ? '拾獲現場證物：【泛黃的紙條】' : `獲取大樓規則：【${rule?.title || action.obtainRuleId}】`,
        content: !completedWeek1
          ? `在「${activeHotspot?.name}」拾獲了一張泛黃紙條。上面手寫條列著幾項看似尋常的居住注意事項。`
          : `在「${activeHotspot?.name}」查閱並歸檔了【${rule?.title}】。規則中的條款似乎暗藏玄機。`,
        location: currentLocation.name,
        sanDelta: sanDeltaValue !== 0 ? sanDeltaValue : undefined
      });
    }

    // If dialogue or action, log to journal
    if (activeHotspot?.category === 'dialogue') {
      onAddJournalEntry({
        category: 'dialogue',
        title: `交談紀錄：${activeHotspot.name} - ${action.label}`,
        content: `${action.resultText}`,
        location: currentLocation.name,
        sanDelta: sanDeltaValue !== 0 ? sanDeltaValue : undefined
      });
    } else {
      onAddJournalEntry({
        category: 'action',
        title: `調查行動：${activeHotspot?.name} - ${action.label}`,
        content: `${action.resultText}`,
        location: currentLocation.name,
        sanDelta: sanDeltaValue !== 0 ? sanDeltaValue : undefined
      });
    }

    // Direct Ending Trigger
    if (action.triggerEnding) {
      onTriggerEnding(action.triggerEnding as EndingId);
      return;
    }

    // Special 504 trash inspection in Week 1
    if (action.id === 'trash_inspect_meaningless') {
      setHasInspected504Trash(true);
      onAddJournalEntry({
        category: 'action',
        title: '翻查 504 垃圾桶紙屑',
        content: '翻查垃圾桶內的碎紙與雜物，仔細搜查判定全為尋常裝修報價單與廣告雜稿，無實質案件關聯與拼湊價值。',
        location: '五樓 504 號房',
        sanDelta: 1
      });
    }

    // Special stair step height unprompted deeper investigation -> Open Interactive Measure Minigame
    if (action.id === 'action_measure_step_height') {
      setShowStaircaseMeasureModal(true);
      return;
    }

    // Group 2 Epiphany Deduction QTE Trigger 1: Elevator travel time
    if (action.id === 'action_inspect_elevator' && !solvedEpiphanyQTEIds.includes('elevator_travel_time')) {
      setActiveEpiphanyQTEId('elevator_travel_time');
    }

    // Group 2 Epiphany Deduction QTE Trigger 2: 504 Desk Brass box lockpick
    if (action.id === 'desk_read_notes' && !solvedEpiphanyQTEIds.includes('brass_box_lockpick')) {
      setActiveEpiphanyQTEId('brass_box_lockpick');
    }

    // Group 2 Epiphany Deduction QTE Trigger 3: Power box utility meter loop
    if ((action.id === 'power_pull_switch' || action.id === 'check_power_meter_loop') && !solvedEpiphanyQTEIds.includes('utility_meter_deduction')) {
      setActiveEpiphanyQTEId('utility_meter_deduction');
    }

    // Group 2 Epiphany Deduction QTE Trigger 4: PLC board bypass diagram
    if (action.id === 'pick_elevator_manual' && !solvedEpiphanyQTEIds.includes('plc_bypass_deduction')) {
      setActiveEpiphanyQTEId('plc_bypass_deduction');
    }

    if (action.id === 'action_inspect_1f_paper') {
      onAddJournalEntry({
        category: 'action',
        title: '一至二樓轉角便籤：步頻與體感異常',
        content: '轉角踢腳板夾縫中撿到住戶便籤，記錄著「三樓往上階梯踩踏體感特別快碰到底」的疑惑。',
        location: '安全梯 • 一樓至二樓轉角'
      });
    }

    if (action.id === 'action_inspect_2f_scraper') {
      onAddJournalEntry({
        category: 'action',
        title: '二至三樓轉角五金刮刀：綠色油漆碎屑',
        content: '踢腳板旁發現一把磨損的五金刮刀，刃口沾著微量綠色乳膠漆屑，有人曾刮除過大樓某處牆面的綠漆。',
        location: '安全梯 • 二樓至三樓轉角'
      });
    }

    // Special enter 504 action
    if (action.id === 'act_enter_504_room' || action.id === 'enter_504') {
      sound.playSwitch();
      setHasUnlocked504(true);
      setCurrentLocId('loc_504_interior');
      setActiveHotspot(null);
      setActiveObservation(null);
      setActionFeedback({
        text: '【進入 504 號房】：你插進鑰匙轉開門鎖，推門走進了 504 號房。室內飄散著淡淡的茉莉芳香劑氣味，似乎仍有人生活於此。',
        type: 'normal'
      });
      return;
    }

    // Week 1: Neighbor complaint dialogue action -> triggers the mouse complaint QTE (Orthodox deduction)
    if (action.id === 'act_talk_neighbor_wall_noise') {
      sound.playTensionSting();
      setActiveEpiphanyQTEId('mouse_scratch_wall_complaint');
      setActiveHotspot(null);
      setActiveObservation(null);
      return;
    }

    // Special enter 502 action
    if (action.id === 'act_enter_502_unlocked' || action.id === 'act_enter_502') {
      sound.playSwitch();
      setCurrentLocId('loc_502_interior');
      setActiveHotspot(null);
      setActiveObservation(null);
      setActionFeedback({
        text: '【進入 502 號房】：你推開原本上鎖的 502 號房門，邁入幽暗室內。靠近504的隔間牆壁不斷傳出微弱而令人心驚的西西酥酥抓撓聲。',
        type: 'normal'
      });
      return;
    }

    // Special exit 502 action
    if (action.id === 'act_exit_502') {
      sound.playClick();
      setCurrentLocId('loc_5f_corridor');
      setActiveHotspot(null);
      setActiveObservation(null);
      setActionFeedback({
        text: '【走出 502 號房】：你回到五樓長廊。隔壁 502 號房門已被解鎖虛掩。',
        type: 'normal'
      });
      return;
    }

    // Special sneak in action
    if (action.id === 'guard_room_sneak_in') {
      setCurrentLocId('loc_1f_security');
      setActiveHotspot(null);
      return;
    }

    // Special exit 504 action
    if (action.id === 'act_exit_504') {
      const hasFound504Rules = obtainedRules.includes('rule_resident');
      const hasAssembled504Letter = inventory.includes('shredded_letter') || obtainedRules.includes('rule_handwritten');
      const is504InvestigationComplete = !completedWeek1
        ? (hasFound504Rules && (hasInspected504Trash || inspectedHotspots.includes('hotspot_shredded_letter_trash')))
        : (hasFound504Rules && hasAssembled504Letter);

      setActiveHotspot(null);

      // If investigation in 504 is not fully complete, player can still leave normally
      if (!is504InvestigationComplete) {
        sound.playClick();
        setCurrentLocId('loc_5f_corridor');
        setActiveObservation(null);
        setActionFeedback({
          text: !completedWeek1
            ? '【走出 504 號房】：你隨手帶上房門返回五樓長廊。屋內似乎還有尚未查明的線索（例如茶几上的泛黃紙條或水電收據），可隨時再次推門進入搜查。'
            : '【走出 504 號房】：你隨手帶上房門返回五樓長廊。屋內似乎還有尚未查明的線索（例如茶几上的《住戶規則》或水電收據），可隨時再次推門進入搜查。',
          type: 'normal'
        });
        return;
      }

      if (!completedWeek1) {
        sound.playClick();
        setCurrentLocId('loc_1f_lobby');
        setActiveObservation(null);
        setActionFeedback({
          text: '【搜查完畢，返回一樓大廳】：你在504號房搜查完畢，室內並未發現張浩身影。你搭乘電梯返回一樓大廳，準備向警衛詢問是否有其他住戶目擊或線索……',
          type: 'normal'
        });
        return;
      } else {
        sound.playClick();
        setCurrentLocId('loc_5f_corridor');
        setActiveObservation(null);
        setActionFeedback({
          text: '【走出 504 號房】：你轉動門把推門而出，回到五樓長廊。',
          type: 'normal'
        });
        return;
      }
    }

    // Special flashlight toggle in stairwell
    if (action.id === 'stair_turn_on_flashlight') {
      setIsFlashlightOn(true);
      sound.playSwitch();
    }

    // Special trigger second 4F action from 3F
    if (action.id === 'trigger_second_4f') {
      sound.playGlitch();
      sound.playTensionSting();
      onModifySan(-10);
      setShowSecond4FModal(true);
      return;
    }

    // Minigame triggers
    if (action.triggerMinigame) {
      setActiveMinigame(action.triggerMinigame);
      return;
    }

    // Set feedback text
    let feedbackText = action.resultText;
    if (trait === 'intuitive') {
      if (action.sanDelta && action.sanDelta < 0) {
        feedbackText += '\n\n【第六感心理震顫】：身為「直覺派偵探」，你的神經感官對超常怪異極度敏感，受到更強烈的心理衝擊與心悸波動。';
      } else if (action.obtainItemId || action.obtainRuleId) {
        feedbackText += '\n\n【第六感洞察驗證】：直覺的靈光一閃得到了印證！你敏銳地鎖定了破局關鍵線索，成功將其收納歸檔。';
      }
    }

    setActionFeedback({
      text: feedbackText,
      type: action.sanDelta ? 'san' : action.obtainItemId ? 'item' : action.obtainRuleId ? 'rule' : 'normal'
    });
  };

  // UX Priority 1: Hotspot three-state inspection helper (未探索、調查中、已徹底搜查)
  const getHotspotStatus = (hotspot: HotspotItem): 'unvisited' | 'in_progress' | 'completed' => {
    const isVisited = inspectedHotspots.includes(hotspot.id);
    if (!isVisited) return 'unvisited';

    const availableActions = hotspot.actions.filter(act => {
      if (act.requiresRule && !obtainedRules.includes(act.requiresRule)) return false;
      if (act.requiresItem && !inventory.includes(act.requiresItem)) return false;
      if (act.customCheck === 'initial_only' && hasExperiencedFirst4F) return false;
      if (act.customCheck === 'post_anomaly' && !hasExperiencedFirst4F) return false;
      return true;
    });

    if (availableActions.length === 0) return 'completed';

    const executedCount = availableActions.filter(act => executedActionIds.includes(act.id)).length;
    if (executedCount >= availableActions.length && availableActions.length > 0) {
      return 'completed';
    }
    return 'in_progress';
  };

  // UX Priority 2: Extract key forensic deduction numbers and evidence chips
  const extractForensicClues = (text: string) => {
    let leadTitle: string | null = null;
    const titleMatch = text.match(/【(.*?)】[：:]/);
    if (titleMatch) {
      leadTitle = titleMatch[1];
    }

    const chips: { type: 'physical' | 'evidence' | 'audio' | 'clue'; label: string; text: string }[] = [];

    // Step Count & Step Height physical anomalies
    if (text.includes('24') || text.includes('24階') || text.includes('24個水泥階梯')) {
      chips.push({
        type: 'physical',
        label: '異常階數',
        text: '24階水泥梯（標準層僅15階）'
      });
    }
    if (text.includes('14～15') || text.includes('14~15') || text.includes('15公分') || text.includes('18公分') || text.includes('高度落差') || text.includes('階高')) {
      chips.push({
        type: 'physical',
        label: '階高落差',
        text: '每階矮縮至14~15cm（標準為18cm）'
      });
    }
    if (text.includes('360公分') || text.includes('夾層') || text.includes('加蓋')) {
      chips.push({
        type: 'physical',
        label: '隱蔽夾層',
        text: '垂直層高360cm（暗藏被抹除的夾層）'
      });
    }
    if (text.includes('第四頻道') || text.includes('第4頻道')) {
      chips.push({
        type: 'evidence',
        label: '監視器物證',
        text: '第4頻道顯示幽閉走廊即時監控畫面'
      });
    }
    if (text.includes('五金刮刀') || text.includes('綠漆') || text.includes('乳膠漆')) {
      chips.push({
        type: 'evidence',
        label: '塗改痕跡',
        text: '刮刀殘存綠色乳膠漆屑（塗改證據）'
      });
    }
    if (text.includes('泥水鞋印') || text.includes('鞋印動線')) {
      chips.push({
        type: 'evidence',
        label: '動線吻合',
        text: '泥水鞋印自梯間延伸至值班安控室'
      });
    }
    if (text.includes('體感特別快碰到底') || text.includes('步頻')) {
      chips.push({
        type: 'clue',
        label: '住戶證詞',
        text: '三樓往上階梯踩踏體感落差，步頻受騙'
      });
    }
    if (text.includes('打字機') || text.includes('擊鍵') || text.includes('機械敲擊')) {
      chips.push({
        type: 'audio',
        label: '機械擊鍵',
        text: '門後傳出持續高頻率機械打字機擊字聲'
      });
    }
    if (text.includes('管理員總鑰匙') || text.includes('備用總鑰匙')) {
      chips.push({
        type: 'clue',
        label: '關鍵道具',
        text: '大樓管理員專用備用總鑰匙'
      });
    }
    if (text.includes('李阿姨') || text.includes('紙團碎片')) {
      chips.push({
        type: 'clue',
        label: '警戒證詞',
        text: '拼湊出李阿姨親筆警戒紙條'
      });
    }

    return { leadTitle, chips };
  };

  // Helper for dynamic icon rendering
  const renderIcon = (name: string, className: string = "w-5 h-5") => {
    switch (name) {
      case 'Shield': return <Shield className={className} />;
      case 'Mail': return <Mail className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Coffee': return <Coffee className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'Tv': return <Tv className={className} />;
      case 'Folder': return <Folder className={className} />;
      case 'Book': return <Book className={className} />;
      case 'Phone': return <Phone className={className} />;
      case 'User': return <User className={className} />;
      case 'ShoppingBag': return <ShoppingBag className={className} />;
      case 'Trash2': return <Trash2 className={className} />;
      case 'DoorClosed': return <DoorClosed className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Maximize2': return <Maximize2 className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'Sliders': return <Sliders className={className} />;
      case 'FileQuestion': return <FileQuestion className={className} />;
      case 'Footprints': return <Footprints className={className} />;
      case 'Refrigerator': return <Refrigerator className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'SunMedium': return <SunMedium className={className} />;
      case 'Bookmark': return <Bookmark className={className} />;
      case 'Radio': return <Radio className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Hash': return <Hash className={className} />;
      case 'Wind': return <Wind className={className} />;
      case 'Volume2': return <Volume2 className={className} />;
      case 'DoorOpen': return <DoorOpen className={className} />;
      case 'Mic': return <Mic className={className} />;
      case 'FileWarning': return <FileWarning className={className} />;
      case 'Droplets': return <Droplets className={className} />;
      default: return <Search className={className} />;
    }
  };

  // Helper for current detective objective guide
  const getCurrentObjective = (): { phase: string; target: string; hint: string } => {
    // Week 1 / First Round (ED0 Route)
    if (!completedWeek1) {
      if (!hasKey504) {
        return {
          phase: '第一階段：取得權限',
          target: '向一樓警衛室王大偉借取 504 號房鑰匙',
          hint: '前往一樓大廳警衛窗口進行交涉'
        };
      }
      if (!is504InvestigationComplete) {
        return {
          phase: '第二階段：搜查現場',
          target: '搭乘電梯前往五樓 504 號房深入勘驗',
          hint: '搭乘電梯前往五樓 504 號房'
        };
      }
      if (!hasEncountered5FNeighborComplaint) {
        return {
          phase: '第三階段：向警衛查證',
          target: '返回一樓大廳向警衛詢問住戶目擊情況',
          hint: '搭乘電梯返回一樓大廳'
        };
      }
      if (!hasUnlocked502) {
        return {
          phase: '第四階段：搜查 5F 投訴',
          target: '向一樓警衛王大偉詢問五樓住戶抗議與怪聲',
          hint: '與警衛交涉要求開鎖搜查'
        };
      }
      return {
        phase: '破案救援：搜查 502 號房',
        target: '前往五樓 502 號房調查隔間牆抓撓怪聲並救出張浩',
        hint: '進入 502 號房勘查牆壁裂痕並實施救援'
      };
    }

    // Subsequent rounds (Week 2+ / Deep Investigation)
    if (!hasKey504) {
      return {
        phase: '第一階段：取得權限',
        target: '向一樓警衛室王大偉借取 504 號房鑰匙與工作規則',
        hint: '前往一樓大廳警衛窗口進行交涉'
      };
    }
    if (!hasResidentRule || !inventory.includes('shredded_letter')) {
      return {
        phase: '第二階段：搜查現場',
        target: '前往五樓 504 號房，調查茶几《住戶規則》與拼湊求救碎信',
        hint: '搭乘電梯或走樓梯至五樓 504 號房深入勘驗'
      };
    }
    if (!hasCleanerRule) {
      return {
        phase: '第三階段：尋訪清潔工',
        target: '前往二樓走廊調查清潔推車與尋找李阿姨獲取《清潔人員規則》',
        hint: '利用二樓走廊調查清潔推車與住戶鐵門'
      };
    }
    if (!isCctvRebooted || !obtainedRules.includes('rule_cctv')) {
      return {
        phase: '第四階段：監控安控系統',
        target: '深入警衛室調查監視主機中控台並排除訊號異常',
        hint: '警衛離崗後進入警衛室調查監視主機中控台'
      };
    }
    if (!obtainedRules.includes('rule_handwritten')) {
      return {
        phase: '第五階段：盲區暗角勘查',
        target: '利用隨身強光手電筒仔細搜查樓梯間折返處暗角縫隙',
        hint: '前往樓梯間打開手電筒探照隱蔽縫隙'
      };
    }
    if (!obtainedRules.includes('rule_fake_evacuation')) {
      return {
        phase: '第六階段：防護指引比對',
        target: '前往未開放區域前，比對指引搜查異常告示',
        hint: '依據監視指引前往未開放區域謹慎搜查'
      };
    }
    return {
      phase: '最終階段：核心深淵直面',
      target: '突破空間禁錮，直面大樓怪談的核心真相並救出張浩',
      hint: '深入隱蔽空間展開最後的認知對決'
    };
  };

  // Badge styles by category
  const getCategoryBadge = (category: string) => {
    if (isRetro) {
      switch (category) {
        case 'rule':
          return <span className="text-xs px-1.5 py-0.5 border border-[#4a723e] bg-[#eaf4e7] text-[#284420] font-bold">{completedWeek1 ? '[規則文件]' : '[現場文件]'}</span>;
        case 'clue':
          return <span className="text-xs px-1.5 py-0.5 border border-[#2b5490] bg-[#ebf2fc] text-[#1a3964] font-bold">[物證調查]</span>;
        case 'dialogue':
          return <span className="text-xs px-1.5 py-0.5 border border-[#6b357d] bg-[#f7ebfc] text-[#4d1f5c] font-bold">[人物對話]</span>;
        case 'device':
          return <span className="text-xs px-1.5 py-0.5 border border-[#2e6d5e] bg-[#e7f7f3] text-[#1b4a3e] font-bold">[設施控制]</span>;
        default:
          return <span className="text-xs px-1.5 py-0.5 border border-[#7d6044] bg-[#f5efe9] text-[#4a3420] font-bold">[環境調查]</span>;
      }
    }
    switch (category) {
      case 'rule':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/60 text-amber-300 font-serif">{completedWeek1 ? '規則文件' : '現場文件'}</span>;
      case 'clue':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-600/60 text-cyan-300 font-serif">物證調查</span>;
      case 'dialogue':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 border border-purple-600/60 text-purple-300 font-serif">人物對話</span>;
      case 'device':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-mono">設施控制</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-400 font-serif">環境調查</span>;
    }
  };

  return (
    <div className="w-full h-full max-w-[1600px] mx-auto flex flex-col min-h-0 space-y-1.5 select-none overflow-hidden">
      {/* Top Detective Clue Milestone & Action HUD - Ultra Compact Single Bar */}
      <div className={`px-3 py-1.5 shrink-0 flex flex-wrap items-center justify-between gap-2 ${
        isRetro
          ? 'bg-[#ffffff] border border-[#a8c2a1] text-[#222222] font-serif shadow-2xs'
          : 'bg-neutral-900/95 border border-neutral-800 rounded-xl shadow-xl'
      }`}>
        {/* Left: Location & Floor badge */}
        <div className="flex items-center gap-2">
          <div className={`p-1 ${isRetro ? 'bg-[#ebf4e8] border border-[#7ba86f] text-[#284420]' : 'rounded-md bg-amber-950/80 border border-amber-600/70 text-amber-400'}`}>
            <Search className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs sm:text-sm font-bold font-serif ${isRetro ? 'text-[#1a3964]' : 'text-neutral-100'}`}>
                【{currentLocation.floor}】{currentLocation.name}
              </span>
              <span className={`text-xs px-1.5 py-0.2 font-sans ${isRetro ? 'bg-[#f0f6ee] border border-[#a8c2a1] text-[#335528]' : 'rounded bg-neutral-950 border border-neutral-800 text-neutral-400'}`}>
                可調查點: {activeHotspots.length}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Milestone Badges & Objective Guide */}
        {isRetro ? (
          <div className="hidden md:flex items-center gap-2 text-xs sm:text-[13px] font-serif text-[#444444]">
            <span className="text-[#2e6d24] font-bold">[現場調查進行中]</span>
            <span className="text-[#cccccc]">|</span>
            <span>
              {!completedWeek1 
                ? '請逐一搜查物證，尋找失蹤者張浩的生活跡證' 
                : '請逐一搜查物證，留意大樓規則中隱藏的異動現象'}
            </span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-[11px] font-serif">
            {(() => {
              const currentObj = getCurrentObjective();
              return (
                <div className="px-2.5 py-1 flex items-center gap-1.5 max-w-md truncate rounded-lg bg-amber-950/40 border border-amber-600/70 text-amber-200 shadow-sm">
                  <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin-slow" />
                  <span className="font-mono text-[10px] text-amber-400/90 font-bold shrink-0">{currentObj.phase}:</span>
                  <span className="truncate text-neutral-200 font-medium">{currentObj.target}</span>
                </div>
              );
            })()}

            <div className="flex items-center gap-1">
              <div className={`px-2 py-0.5 border flex items-center gap-1 ${
                hasKey504 
                  ? 'rounded bg-amber-950/40 border-amber-500/60 text-amber-200'
                  : 'rounded bg-neutral-950/60 border-neutral-800 text-neutral-500'
              }`}>
                <Key className="w-3 h-3 shrink-0" />
                <span className="truncate">504鑰匙 {hasKey504 ? '✓' : '...'}</span>
              </div>
              {completedWeek1 && (
                <>
                  <div className={`px-2 py-0.5 border flex items-center gap-1 ${
                    hasResidentRule 
                      ? 'rounded bg-amber-950/40 border-amber-500/60 text-amber-200'
                      : 'rounded bg-neutral-950/60 border-neutral-800 text-neutral-500'
                  }`}>
                    <FileText className="w-3 h-3 shrink-0" />
                    <span className="truncate">住戶規則 {hasResidentRule ? '✓' : '...'}</span>
                  </div>
                  <div className={`px-2 py-0.5 border flex items-center gap-1 ${
                    isCctvRebooted 
                      ? 'rounded bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                      : 'rounded bg-neutral-950/60 border-neutral-800 text-neutral-500'
                  }`}>
                    <Tv className="w-3 h-3 shrink-0" />
                    <span className="truncate">監視重啟 {isCctvRebooted ? '✓' : '...'}</span>
                  </div>
                  {is4FUnlocked && (
                    <div className="px-2 py-0.5 border flex items-center gap-1 animate-pulse rounded bg-purple-950/40 border-purple-500/60 text-purple-200">
                      <DoorOpen className="w-3 h-3 shrink-0" />
                      <span className="truncate">空間禁錮 已破除</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Right: Top Action Toolbar (Observe, Flashlight) */}
        <div className="flex items-center gap-1.5">
          {/* Observe Environment Button */}
          <button
            onClick={handleObserveEnvironment}
            title="凝神感知環境，察知現場氛圍異動"
            className={`px-3 py-1 text-xs sm:text-[13px] font-serif font-bold transition-all flex items-center gap-1.5 group cursor-pointer ${
              isRetro
                ? 'retro-web-btn text-[#1a3964] hover:text-[#b83828]'
                : 'rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/80 text-amber-200 shadow-sm'
            }`}
          >
            <Eye className={`w-3.5 h-3.5 ${isRetro ? 'text-[#2b5490]' : 'text-amber-400 group-hover:scale-110 transition-transform'}`} />
            <span>{isRetro ? '[凝神感知]' : '凝神感知'}</span>
          </button>

          {/* Tactical Flashlight Button */}
          <button
            onClick={() => {
              if (!activeObservation) {
                handleObserveEnvironment();
                setIsFlashlightOn(true);
                sound.playFlashlightToggle(true);
                setMobileTab('sensory');
                setActionFeedback({
                  text: '★ 已啟動現場感知，並於右側鑑識面板開啟強光手電筒探照操作。',
                  type: 'normal'
                });
              } else {
                const nextState = !isFlashlightOn;
                setIsFlashlightOn(nextState);
                sound.playFlashlightToggle(nextState);
                setMobileTab('sensory');
              }
            }}
            title="開關強光手電筒探照暗角（於右側感知面板操作）"
            className={`px-3 py-1 border text-xs sm:text-[13px] font-serif font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
              isRetro
                ? isFlashlightOn
                  ? 'retro-web-btn-accent font-bold'
                  : 'retro-web-btn text-[#444444]'
                : isFlashlightOn
                  ? 'rounded-lg bg-amber-400 text-neutral-950 border-amber-300 shadow-md shadow-amber-400/20'
                  : 'rounded-lg bg-neutral-950 hover:bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-amber-300'
            }`}
          >
            <Flashlight className={`w-3.5 h-3.5 ${isFlashlightOn ? (isRetro ? 'text-[#ffffff]' : 'text-neutral-950') : (isRetro ? 'text-[#e06c10]' : 'text-neutral-400')}`} />
            <span className="hidden sm:inline">{isRetro ? (isFlashlightOn ? '[手電筒: 開]' : '[手電筒: 關]') : (isFlashlightOn ? '手電筒: 開' : '手電筒: 關')}</span>
          </button>
        </div>
      </div>

      {/* Mobile-Only Tab Switcher (< lg screens) */}
      <div className="lg:hidden flex items-center bg-neutral-900/95 border border-neutral-800 rounded-xl p-1 shrink-0 gap-1.5 text-xs font-serif shadow-md">
        {/* Tab 1: 移動 (Corresponding to Column 1 Left: Elevator / Stairs / Transit) */}
        <button
          onClick={() => {
            sound.playClick();
            setMobileTab('transit');
          }}
          className={`flex-1 min-h-[44px] py-2 px-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs font-medium ${
            mobileTab === 'transit'
              ? 'bg-amber-950/90 border border-amber-500/80 text-amber-200 font-bold shadow'
              : 'text-neutral-400 hover:text-neutral-200 bg-neutral-950/60'
          }`}
        >
          <ArrowUpDown className="w-4 h-4 text-amber-400" />
          <span>🚪 移動</span>
        </button>

        {/* Tab 2: 劇情主線 (Corresponding to Column 2 Center: Scene / Investigation) */}
        <button
          onClick={() => {
            sound.playClick();
            setMobileTab('scene');
          }}
          className={`flex-1 min-h-[44px] py-2 px-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs font-medium ${
            mobileTab === 'scene'
              ? 'bg-amber-950/90 border border-amber-500/80 text-amber-200 font-bold shadow'
              : 'text-neutral-400 hover:text-neutral-200 bg-neutral-950/60'
          }`}
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>📜 劇情主線</span>
        </button>

        {/* Tab 3: 鑑識對照 (Corresponding to Column 3 Right: Forensics / Observation) */}
        <button
          onClick={() => {
            sound.playClick();
            setMobileTab('sensory');
          }}
          className={`flex-1 min-h-[44px] py-2 px-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs font-medium relative ${
            mobileTab === 'sensory'
              ? 'bg-amber-950/90 border border-amber-500/80 text-amber-200 font-bold shadow'
              : 'text-neutral-400 hover:text-neutral-200 bg-neutral-950/60'
          }`}
        >
          <Search className="w-4 h-4 text-amber-300" />
          <span>🔍 鑑識對照</span>
          {activeHotspot && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse absolute top-1.5 right-1.5 border border-black" />
          )}
        </button>
      </div>

      {/* Main Exploration Grid - 3-Column Widescreen Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
        {/* Column 1 (Left): Elevator, Stairs, and 1F Return Office */}
        <div className={`${isTransitCollapsed ? 'lg:col-span-1' : 'lg:col-span-3'} h-full overflow-y-auto space-y-2 pr-1 custom-scrollbar ${
          mobileTab !== 'transit' ? 'hidden lg:block' : 'block'
        }`}>
          {isTransitCollapsed ? (
            <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl p-2 shadow-xl flex flex-col items-center gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsTransitCollapsed(false);
                }}
                title="展開樓層與動線面板"
                className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-700 hover:border-amber-500 text-amber-400 hover:scale-105 transition-all flex items-center justify-center cursor-pointer shadow"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>

              <div className="w-full h-px bg-neutral-800" />

              <div className="text-center">
                <div className="text-[9px] font-mono text-neutral-500 font-bold">樓層</div>
                <div className="text-xs font-mono font-bold text-amber-300 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600/50 mt-0.5">
                  {currentLocation.floor}
                </div>
              </div>

              <div className="w-full h-px bg-neutral-800" />

              {/* Quick Elevator Icon */}
              <button
                onClick={() => {
                  if (!hasKey504) {
                    sound.playKnock();
                    setActionFeedback({
                      text: '【警衛阻攔】：值班警衛王大偉叫住了你：「先生！請先在值班台登記說明來意！」請先至警衛窗口對話。',
                      type: 'normal'
                    });
                    return;
                  }
                  sound.playKnock();
                  setActiveTransitMode('elevator');
                }}
                title="搭乘大樓客用電梯"
                className="p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 text-amber-300 transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>

              {/* Quick Stairs Icon */}
              <button
                onClick={() => {
                  if (!hasKey504) {
                    sound.playKnock();
                    setActionFeedback({
                      text: '【警衛阻攔】：值班警衛王大偉叫住了你：「先生！安全梯防火門有門禁管制，請先在值班台登記說明來意！」請先至警衛窗口對話。',
                      type: 'normal'
                    });
                    return;
                  }
                  if (!hasGuardRule) {
                    sound.playKnock();
                    setActionFeedback({
                      text: '【安全梯夜間門禁鎖定】：安全梯防火鐵門已上電子磁扣防盜鎖。警衛交代請搭乘電梯直達五樓。',
                      type: 'normal'
                    });
                    return;
                  }
                  sound.playKnock();
                  setActiveTransitMode('stairs');
                }}
                title="行走U字形安全梯"
                className="p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500 text-cyan-300 transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4" />
              </button>

              {/* Quick Office button if on 1F */}
              {isOnFirstFloor && onRestInOffice && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onRestInOffice();
                  }}
                  title="走出大門返回事務所"
                  className="p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500 text-amber-400 transition-colors cursor-pointer"
                >
                  <Building className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className={`p-3.5 md:p-4 space-y-3 ${
              isRetro 
                ? 'bg-[#ffffff] border border-[#a8c2a1] text-[#222222] rounded-none shadow-xs' 
                : 'bg-neutral-900/90 border border-neutral-800 rounded-xl shadow-xl'
            }`}>
            {/* If inside 502 Room: ONLY show "Leave 502 Room" button */}
            {currentLocId === 'loc_502_interior' ? (
              <div className="space-y-3">
                <div className={`border-b pb-2 ${isRetro ? 'border-[#a8c2a1]' : 'border-neutral-800'}`}>
                  <div className={`text-[11px] font-mono uppercase tracking-wider ${isRetro ? 'text-[#1f4717] font-bold' : 'text-amber-500'}`}>
                    房間內部動線
                  </div>
                  <p className={`text-[11px] font-serif mt-0.5 ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>
                    目前身處 502 號房室內，隔間牆正傳出抓撓聲
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentLocId('loc_5f_corridor');
                    setActiveHotspot(null);
                    setActiveObservation(null);
                    setActionFeedback({
                      text: '【走出 502 號房】：你隨手虛掩房門回到五樓長廊。',
                      type: 'normal'
                    });
                  }}
                  className={`w-full p-3.5 sm:p-4 text-left transition-all flex items-center justify-between shadow-xs group cursor-pointer ${
                    isRetro
                      ? 'bg-[#ffffff] hover:bg-[#f2f7f0] border border-[#a8c2a1] text-[#1a3964] rounded-none'
                      : 'rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/80 hover:border-amber-400 text-amber-200 shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${
                      isRetro
                        ? 'bg-[#ebf4e8] border border-[#7ba86f] text-[#284420] rounded-none'
                        : 'rounded-lg bg-amber-900/80 border border-amber-500 text-amber-300'
                    }`}>
                      <DoorOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`font-bold text-xs sm:text-sm font-serif ${isRetro ? 'text-[#1a3964]' : 'text-neutral-100 group-hover:text-amber-300'}`}>
                        【離開 502 號房，返回走廊】
                      </div>
                      <div className={`text-[10px] sm:text-[11px] font-serif ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>
                        轉開門把走出，返回五樓長廊
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-amber-400'}`} />
                </button>
              </div>
            ) : currentLocId === 'loc_504_interior' ? (
              <div className="space-y-3">
                <div className={`border-b pb-2 ${isRetro ? 'border-[#a8c2a1]' : 'border-neutral-800'}`}>
                  <div className={`text-[11px] font-mono uppercase tracking-wider ${isRetro ? 'text-[#1f4717] font-bold' : 'text-amber-500'}`}>
                    房間內部動線
                  </div>
                  <p className={`text-[11px] font-serif mt-0.5 ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>
                    目前身處 504 號房室內，可推門離開
                  </p>
                </div>

                <button
                  onClick={() => {
                    const hasFound504Rules = obtainedRules.includes('rule_resident');
                    const hasAssembled504Letter = inventory.includes('shredded_letter') || obtainedRules.includes('rule_handwritten');
                    const is504InvestigationComplete = !completedWeek1
                      ? (hasFound504Rules && (hasInspected504Trash || inspectedHotspots.includes('hotspot_shredded_letter_trash')))
                      : (hasFound504Rules && hasAssembled504Letter);

                    setActiveHotspot(null);

                    // If investigation in 504 is not fully complete, player can still leave normally without triggering next phase
                    if (!is504InvestigationComplete) {
                      sound.playClick();
                      setCurrentLocId('loc_5f_corridor');
                      setActiveObservation(null);
                      setActionFeedback({
                        text: completedWeek1
                          ? '【走出 504 號房】：你隨手帶上房門返回五樓長廊。屋內似乎還有尚未查明的線索（例如茶几上的《住戶規則》或水電收據），可隨時再次推門進入搜查。'
                          : '【走出 504 號房】：你隨手帶上房門返回五樓長廊。屋內似乎還有尚未查明的線索（例如茶几上的泛黃紙條或生活痕跡），可隨時再次推門進入搜查。',
                        type: 'normal'
                      });
                      return;
                    }

                    // Week 1: 504 complete -> return to 5F corridor, must take elevator to 1F lobby
                    if (!completedWeek1) {
                      sound.playClick();
                      setCurrentLocId('loc_5f_corridor');
                      setActiveObservation(null);
                      setActionFeedback({
                        text: '【搜查完畢・走出 504 號房】：你在504號房搜查完畢，室內並未發現張浩身影。你推門走出房間回到五樓長廊。請搭乘走廊客用電梯返回一樓大廳進一步調查。',
                        type: 'normal'
                      });
                      return;
                    }

                    // Week 2: Leaving 504 triggers the original 4F anomaly
                    if (completedWeek1 && !hasExperiencedFirst4F) {
                      sound.playTensionSting();
                      setShowFirst4FModal(true);
                      return;
                    }

                    // Regular exit: Return to 5F corridor
                    sound.playClick();
                    setCurrentLocId('loc_5f_corridor');
                    setActiveObservation(null);
                  }}
                  className={`w-full p-3.5 sm:p-4 text-left transition-all flex items-center justify-between shadow-xs group cursor-pointer ${
                    isRetro
                      ? 'bg-[#ffffff] hover:bg-[#f2f7f0] border border-[#a8c2a1] text-[#1a3964] rounded-none'
                      : 'rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/80 hover:border-amber-400 text-amber-200 shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${
                      isRetro
                        ? 'bg-[#ebf4e8] border border-[#7ba86f] text-[#284420] rounded-none'
                        : 'rounded-lg bg-amber-900/80 border border-amber-500 text-amber-300'
                    }`}>
                      <DoorOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`font-bold text-xs sm:text-sm font-serif ${isRetro ? 'text-[#1a3964]' : 'text-neutral-100 group-hover:text-amber-300'}`}>
                        {!completedWeek1 && is504InvestigationComplete ? '【搜查完畢・走出 504 返回五樓長廊】' : '【離開 504 號房，進入走廊】'}
                      </div>
                      <div className={`text-[10px] sm:text-[11px] font-serif ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>
                        {!completedWeek1 && is504InvestigationComplete ? '504搜查完畢，推門回到走廊搭電梯下樓' : '轉開門把推門走出，返回五樓長廊'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-amber-400'}`} />
                </button>
              </div>
            ) : (
              <>
                <div className={`border-b pb-2 flex items-center justify-between ${isRetro ? 'border-[#a8c2a1]' : 'border-neutral-800'}`}>
                  <div>
                    <div className={`text-[11px] font-mono uppercase tracking-wider ${isRetro ? 'text-[#1f4717] font-bold' : 'text-amber-500'}`}>
                      通道與跨樓層移動
                    </div>
                    <p className={`text-[11px] font-serif mt-0.5 ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>
                      大樓內僅能透過電梯或U字形樓梯移動至其他樓層
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsTransitCollapsed(true);
                    }}
                    title="收合動線面板，讓現場搜查視野最大化"
                    className={`hidden lg:flex items-center gap-1 px-2 py-1 text-[10px] font-serif transition-colors cursor-pointer ${
                      isRetro
                        ? 'bg-[#ffffff] hover:bg-[#f2f7f0] border border-[#a8c2a1] text-[#556652] hover:text-[#1f4717] rounded-none'
                        : 'rounded-md bg-neutral-950 border border-neutral-800 hover:border-amber-600/80 text-neutral-400 hover:text-amber-300'
                    }`}
                  >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                    <span>收合</span>
                  </button>
                </div>

                {/* 502 Unlocked Direct Entrance on 5F */}
                {currentLocation.floor === '5F' && hasUnlocked502 && currentLocId !== 'loc_502_interior' && (
                  <div className={`p-3 space-y-2 shadow-sm ${
                    isRetro
                      ? 'bg-[#f7faf5] border border-[#a8c2a1] rounded-none text-[#333333]'
                      : 'rounded-xl bg-amber-950/40 border border-amber-500/80 shadow-lg'
                  }`}>
                    <div className={`flex items-center gap-2 text-xs font-bold font-serif ${isRetro ? 'text-[#1a3964]' : 'text-amber-300'}`}>
                      <DoorOpen className={`w-4 h-4 shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-amber-400'}`} />
                      <span>502 號房門（警衛已用總鑰匙開啟）</span>
                    </div>
                    <p className={`text-[10px] font-serif leading-relaxed ${isRetro ? 'text-[#556652]' : 'text-neutral-300'}`}>
                      室內隔間牆持續傳來指甲抓撓的西西酥酥怪聲，隨時可推門進入。
                    </p>
                    <button
                      onClick={() => {
                        sound.playSwitch();
                        setCurrentLocId('loc_502_interior');
                        setActiveHotspot(null);
                        setActiveObservation(null);
                      }}
                      className={`w-full py-2 px-3 font-bold font-serif text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                        isRetro
                          ? 'bg-[#3e6634] hover:bg-[#33552a] text-[#ffffff] border border-[#2d4d25] rounded-none'
                          : 'rounded-lg bg-amber-600 hover:bg-amber-500 text-neutral-950'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>【進入 502 號房室內勘查】</span>
                    </button>
                  </div>
                )}

                {/* Option 1: Elevator Button & Investigation */}
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      if (hasUnlocked502) {
                        sound.playKnock();
                        setActionFeedback({
                          text: '【救人要緊！】：隔壁502號房內持續傳出微弱的指甲抓撓聲，受困者情況危急，請先進入502號房展開緊急救援！',
                          type: 'normal'
                        });
                        return;
                      }
                      if (!hasKey504) {
                        sound.playKnock();
                        setActionFeedback({
                          text: '【警衛阻攔】：值班台警衛王大偉叫住了你：「先生！訪客請先在值班窗口登記說明來意，請勿擅自使用電梯或前往其他樓層！」請先至警衛窗口對話。',
                          type: 'normal'
                        });
                        return;
                      }
                      sound.playElevatorChime();
                      setActiveTransitMode('elevator');
                    }}
                    className={`w-full p-3 border text-left transition-all group space-y-1 shadow-xs ${
                      isRetro
                        ? hasUnlocked502
                          ? 'bg-[#fff5f5] border-[#d68b8b] text-[#9c2e2e] rounded-none cursor-pointer'
                          : !hasKey504
                            ? 'bg-[#f4f7f2] border-[#c5d8c1] text-[#778877] rounded-none cursor-not-allowed'
                            : 'bg-[#ffffff] hover:bg-[#f2f7f0] border-[#a8c2a1] text-[#1a3964] rounded-none cursor-pointer'
                        : hasUnlocked502
                          ? 'rounded-xl bg-red-950/60 border-red-800 text-red-300 shadow-md'
                          : !hasKey504
                            ? 'rounded-xl bg-neutral-950/70 border-neutral-800/90 text-neutral-400 hover:border-amber-900/60 shadow-md'
                            : 'rounded-xl bg-neutral-950 hover:bg-neutral-800/90 border-neutral-700 hover:border-amber-500 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 border ${
                          isRetro
                            ? hasUnlocked502
                              ? 'bg-[#fdf2f2] border-[#d68b8b] text-[#9c2e2e] rounded-none'
                              : !hasKey504
                                ? 'bg-[#e8ece6] border-[#c5d8c1] text-[#889988] rounded-none'
                                : 'bg-[#ebf4e8] border-[#7ba86f] text-[#284420] rounded-none'
                            : hasUnlocked502
                              ? 'rounded-lg bg-red-900/70 border-red-700 text-red-200'
                              : !hasKey504
                                ? 'rounded-lg bg-neutral-900 border-neutral-800 text-neutral-500'
                                : 'rounded-lg bg-amber-950/80 border-amber-600/70 text-amber-300'
                        }`}>
                          <Sliders className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <div className={`font-bold text-xs sm:text-sm font-serif ${
                              isRetro 
                                ? hasUnlocked502
                                  ? 'text-[#9c2e2e]'
                                  : !hasKey504 ? 'text-[#778877]' : 'text-[#1a3964]' 
                                : hasUnlocked502
                                  ? 'text-red-300'
                                  : 'text-neutral-100 group-hover:text-amber-300'
                            }`}>
                              【搭乘公共電梯】
                            </div>
                            {hasUnlocked502 ? (
                              <span className={`text-[9px] px-1.5 py-0.2 font-sans ${
                                isRetro
                                  ? 'bg-[#fdf2f2] text-[#9c2e2e] border border-[#d68b8b] rounded-none font-bold'
                                  : 'rounded bg-red-950/90 text-red-200 border border-red-700 font-bold'
                              }`}>
                                暫停使用・救人要緊
                              </span>
                            ) : !hasKey504 ? (
                              <span className={`text-[9px] px-1.5 py-0.2 font-sans ${
                                isRetro
                                  ? 'bg-[#fdf2f2] text-[#9c2e2e] border border-[#d68b8b] rounded-none'
                                  : 'rounded bg-red-950/80 text-red-300 border border-red-800/60'
                              }`}>
                                需先洽警衛
                              </span>
                            ) : !hasGuardRule ? (
                              <span className={`text-[9px] px-1.5 py-0.2 font-sans ${
                                isRetro
                                  ? 'bg-[#eef5ec] text-[#1f4717] border border-[#83ab79] rounded-none'
                                  : 'rounded bg-amber-950/80 text-amber-300 border border-amber-800/60'
                              }`}>
                                直達五樓
                              </span>
                            ) : null}
                          </div>
                          <div className={`text-[10px] font-serif ${
                            hasUnlocked502 
                              ? isRetro ? 'text-[#9c2e2e] font-bold' : 'text-red-400 font-bold'
                              : isRetro ? 'text-[#556652]' : 'text-neutral-400'
                          }`}>
                            {hasUnlocked502
                              ? '隔壁傳來瀕死抓撓異響，救人要緊！'
                              : !hasKey504
                                ? '訪客管制中，請先前往警衛窗口登記'
                                : !hasGuardRule
                                  ? '警衛指示：搭乘電梯直達五樓 504 號房'
                                  : '開啟電梯外呼面板，選擇目的地樓層'}
                          </div>
                        </div>
                      </div>
                      {hasUnlocked502 ? (
                        <Lock className={`w-4 h-4 shrink-0 ${isRetro ? 'text-[#9c2e2e]' : 'text-red-400'}`} />
                      ) : !hasKey504 ? (
                        <Lock className={`w-4 h-4 shrink-0 ${isRetro ? 'text-[#889988]' : 'text-neutral-500'}`} />
                      ) : (
                        <ChevronRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-neutral-500 group-hover:text-amber-400'}`} />
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (hasUnlocked502) {
                        sound.playKnock();
                        setActionFeedback({
                          text: '【救人要緊！】：隔壁502號房內持續傳出微弱的指甲抓撓聲，受困者情況危急，請先進入502號房展開緊急救援！',
                          type: 'normal'
                        });
                        return;
                      }
                      if (!hasKey504) {
                        sound.playKnock();
                        setActionFeedback({
                          text: '【警衛阻攔】：值班台警衛王大偉叫住了你：「先生！訪客請先在值班窗口登記說明來意，請勿隨意在電梯車廂閒晃！」請先至警衛窗口對話。',
                          type: 'normal'
                        });
                        return;
                      }
                      if (!hasGuardRule) {
                        sound.playKnock();
                        setActionFeedback({
                          text: '【暫不勘查電梯】：先確認504號房吧。',
                          type: 'normal'
                        });
                        return;
                      }
                      sound.playClick();
                      setCurrentLocId('loc_elevator');
                      setActiveHotspot(null);
                      setActiveObservation(null);
                    }}
                    className={`w-full py-1.5 px-3 border text-left transition-all flex items-center justify-between text-[11px] font-serif ${
                      isRetro
                        ? 'bg-[#ffffff] hover:bg-[#f2f7f0] border-[#a8c2a1] text-[#1a3964] rounded-none'
                        : !hasKey504 || !hasGuardRule
                          ? 'rounded-lg bg-neutral-950/40 border-neutral-800/70 text-neutral-500 hover:border-neutral-700'
                          : 'rounded-lg bg-neutral-950/80 hover:bg-amber-950/40 border-neutral-800 hover:border-amber-700/60 text-amber-300/90'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Search className={`w-3.5 h-3.5 ${isRetro ? 'text-[#2e6d24]' : 'text-amber-400'}`} />
                      現場勘查【電梯內部車廂】
                    </span>
                    {!hasKey504 ? (
                      <Lock className={`w-3.5 h-3.5 ${isRetro ? 'text-[#889988]' : 'text-neutral-600'}`} />
                    ) : !hasGuardRule ? (
                      <span className={`flex items-center gap-1 text-[10px] font-sans ${isRetro ? 'text-[#556652]' : 'text-amber-400/90'}`}>
                        先確認504號房吧
                        <Lock className={`w-3.5 h-3.5 ${isRetro ? 'text-[#556652]' : 'text-amber-500/80'}`} />
                      </span>
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 ${isRetro ? 'text-[#2e6d24]' : 'text-neutral-500'}`} />
                    )}
                  </button>
                </div>

                {/* Option 2: U-shaped Stairs Button & Investigation */}
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      if (hasUnlocked502) {
                        sound.playKnock();
                        setActionFeedback({
                          text: '【救人要緊！】：隔壁502號房內持續傳出微弱的指甲抓撓聲，受困者情況危急，請先進入502號房展開緊急救援！',
                          type: 'normal'
                        });
                        return;
                      }
                      if (!hasKey504) {
                        sound.playKnock();
                        setActionFeedback({
                          text: '【警衛阻攔】：值班警衛王大偉叫住了你：「先生！安全梯防火門有門禁管制，請先在值班台登記說明來意！」請先至警衛窗口對話。',
                          type: 'normal'
                        });
                        return;
                      }
                      if (!hasGuardRule) {
                        sound.playKnock();
                        setActionFeedback({
                          text: '【安全梯夜間門禁鎖定】：安全梯防火鐵門已上電子磁扣防盜鎖。警衛王大偉交代：「504號房在五樓，請直接搭乘右側客用電梯直達五樓，未持通行磁扣請勿強行推門。」請搭乘電梯前往五樓調查。',
                          type: 'normal'
                        });
                        return;
                      }
                      sound.playKnock();
                      setActiveTransitMode('stairs');
                    }}
                    className={`w-full p-3 border text-left transition-all group space-y-1 shadow-xs ${
                      isRetro
                        ? !hasKey504 || !hasGuardRule
                          ? 'bg-[#f4f7f2] border-[#c5d8c1] text-[#778877] rounded-none cursor-not-allowed'
                          : 'bg-[#ffffff] hover:bg-[#f2f7f0] border-[#a8c2a1] text-[#1a3964] rounded-none cursor-pointer'
                        : !hasKey504 || !hasGuardRule
                          ? 'rounded-xl bg-neutral-950/70 border-neutral-800/90 text-neutral-400 hover:border-cyan-900/60 shadow-md'
                          : 'rounded-xl bg-neutral-950 hover:bg-neutral-800/90 border-neutral-700 hover:border-cyan-500 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 border ${
                          isRetro
                            ? !hasKey504 || !hasGuardRule
                              ? 'bg-[#e8ece6] border-[#c5d8c1] text-[#889988] rounded-none'
                              : 'bg-[#ebf4e8] border-[#7ba86f] text-[#284420] rounded-none'
                            : !hasKey504 || !hasGuardRule
                              ? 'rounded-lg bg-neutral-900 border-neutral-800 text-neutral-500'
                              : 'rounded-lg bg-cyan-950/80 border-cyan-600/70 text-cyan-300'
                        }`}>
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <div className={`font-bold text-xs sm:text-sm font-serif ${
                              isRetro
                                ? !hasKey504 || !hasGuardRule ? 'text-[#778877]' : 'text-[#1a3964]'
                                : 'text-neutral-100 group-hover:text-cyan-300'
                            }`}>
                              【行走U字形樓梯】
                            </div>
                            {!hasKey504 ? (
                              <span className={`text-[9px] px-1.5 py-0.2 font-sans ${
                                isRetro
                                  ? 'bg-[#fdf2f2] text-[#9c2e2e] border border-[#d68b8b] rounded-none'
                                  : 'rounded bg-red-950/80 text-red-300 border border-red-800/60'
                              }`}>
                                門禁管制
                              </span>
                            ) : !hasGuardRule ? (
                              <span className={`text-[9px] px-1.5 py-0.2 font-sans ${
                                isRetro
                                  ? 'bg-[#fdf2f2] text-[#9c2e2e] border border-[#d68b8b] rounded-none'
                                  : 'rounded bg-amber-950/80 text-amber-300 border border-amber-800/60'
                              }`}>
                                門禁鎖定
                              </span>
                            ) : null}
                          </div>
                          <div className={`text-[10px] font-serif ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>
                            {!hasKey504
                              ? '防火門管制中，請先洽詢一樓警衛'
                              : !hasGuardRule
                                ? '警衛指示：安全梯夜間門禁管制，請搭電梯直達五樓'
                                : '推開防火門，沿著兩段式水泥階梯步行'}
                          </div>
                        </div>
                      </div>
                      {!hasKey504 || !hasGuardRule ? (
                        <Lock className={`w-4 h-4 shrink-0 ${isRetro ? 'text-[#889988]' : 'text-neutral-500'}`} />
                      ) : (
                        <ChevronRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-neutral-500 group-hover:text-cyan-400'}`} />
                      )}
                    </div>
                  </button>

                  {/* Option 2: Stair Corner Investigation - Only available on 1F, 2F, 3F, stairwell; OMITTED on 5F */}
                  {currentLocation.floor !== '5F' && currentLocId !== 'loc_5f_corridor' && currentLocId !== 'loc_504_interior' && (
                    <button
                      onClick={() => {
                        if (!hasKey504) {
                          sound.playKnock();
                          setActionFeedback({
                            text: '【警衛阻攔】：安全梯防火門有門禁感應鎖，值班警衛王大偉正注視著你，請先至警衛窗口對話登記。',
                            type: 'normal'
                          });
                          return;
                        }
                        if (!hasGuardRule) {
                          sound.playKnock();
                          setActionFeedback({
                            text: '【暫不開放樓梯】：警衛王大偉囑咐：「樓梯間正在進行消防與防護檢修，請先搭乘電梯直達五樓 504 號房調查。」',
                            type: 'normal'
                          });
                          return;
                        }
                        sound.playClick();
                        if (currentLocId === 'loc_1f_lobby' || currentLocId === 'loc_1f_security' || currentLocation.floor === '1F') {
                          setStairCornerFloor('1F');
                        } else if (currentLocation.floor === '2F') {
                          setStairCornerFloor('2F');
                        } else if (currentLocation.floor === '3F') {
                          setStairCornerFloor('3F');
                        }
                        setCurrentLocId('loc_stairwell');
                        setActiveHotspot(null);
                        setActiveObservation(null);
                      }}
                      className={`w-full py-1.5 px-3 border text-left transition-all flex items-center justify-between text-[11px] font-serif ${
                        isRetro
                          ? 'bg-[#ffffff] hover:bg-[#f2f7f0] border-[#a8c2a1] text-[#1a3964] rounded-none'
                          : !hasKey504 || !hasGuardRule
                            ? 'rounded-lg bg-neutral-950/40 border-neutral-800/70 text-neutral-500 hover:border-neutral-700'
                            : 'rounded-lg bg-neutral-950/80 hover:bg-cyan-950/40 border-neutral-800 hover:border-cyan-700/60 text-cyan-300/90'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Search className={`w-3.5 h-3.5 shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-cyan-400'}`} />
                        <span>
                          {currentLocId === 'loc_stairwell'
                            ? `正在勘查【${stairCornerFloor === '1F' ? '一至二樓' : stairCornerFloor === '2F' ? '二至三樓' : '三至五樓'}樓梯轉角】`
                            : currentLocation.floor === '1F' || currentLocId === 'loc_1f_lobby' || currentLocId === 'loc_1f_security'
                              ? '現場勘查【一樓至二樓樓梯轉角】'
                              : currentLocation.floor === '2F'
                                ? '現場勘查【二樓至三樓樓梯轉角】'
                                : '現場勘查【三樓至五樓樓梯轉角】'}
                        </span>
                      </span>
                      {!hasKey504 || !hasGuardRule ? (
                        <Lock className={`w-3.5 h-3.5 ${isRetro ? 'text-[#889988]' : 'text-neutral-600'}`} />
                      ) : (
                        <ChevronRight className={`w-3.5 h-3.5 ${isRetro ? 'text-[#2e6d24]' : 'text-neutral-500'}`} />
                      )}
                    </button>
                  )}
                </div>

                {/* Same floor quick toggle if in 1F (between Lobby & Security Office) */}
                {isOnFirstFloor && (
                  <div className={`pt-2 border-t space-y-1.5 ${isRetro ? 'border-[#c8d8c3]' : 'border-neutral-800/80'}`}>
                    <div className={`text-[10px] font-mono ${isRetro ? 'text-[#556652]' : 'text-neutral-500'}`}>一樓公設內部移動：</div>
                    {currentLocId === 'loc_1f_lobby' ? (
                      <button
                        onClick={() => {
                          if (isGuardInSecurityRoom) {
                            sound.playKnock();
                            setActionFeedback({
                              text: '【無法進入警衛室】：警衛王大偉正坐在警衛室值班台內，神色嚴肅地看著你：「先生，警衛室是安控重地，非工作人員請勿隨意進入！」請先向警衛借取504鑰匙上樓調查。',
                              type: 'normal'
                            });
                          } else {
                            sound.playClick();
                            setCurrentLocId('loc_1f_security');
                            setActiveHotspot(null);
                            setActiveObservation(null);
                          }
                        }}
                        className={`w-full p-2.5 border text-xs font-serif flex items-center justify-between transition-colors ${
                          isRetro
                            ? 'bg-[#ffffff] hover:bg-[#f2f7f0] border-[#a8c2a1] text-[#1a3964] rounded-none'
                            : isGuardInSecurityRoom
                              ? 'rounded-lg bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:border-amber-800/60'
                              : 'rounded-lg bg-neutral-950 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>進入【一樓警衛安控室】</span>
                          {isGuardInSecurityRoom && (
                            <span className={`text-[9px] px-1.5 py-0.5 font-sans ${
                              isRetro
                                ? 'bg-[#fdf2f2] text-[#9c2e2e] border border-[#d68b8b] rounded-none'
                                : 'rounded bg-amber-950/70 text-amber-300 border border-amber-800/60'
                            }`}>
                              警衛值勤中
                            </span>
                          )}
                        </div>
                        {isGuardInSecurityRoom ? (
                          <Lock className={`w-3.5 h-3.5 shrink-0 ${isRetro ? 'text-[#889988]' : 'text-amber-500'}`} />
                        ) : (
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-neutral-500'}`} />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          sound.playClick();
                          setCurrentLocId('loc_1f_lobby');
                          setActiveHotspot(null);
                          setActiveObservation(null);
                        }}
                        className={`w-full p-2.5 border text-xs font-serif flex items-center justify-between transition-colors ${
                          isRetro
                            ? 'bg-[#ffffff] hover:bg-[#f2f7f0] border-[#a8c2a1] text-[#1a3964] rounded-none'
                            : 'rounded-lg bg-neutral-950 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <span>走出至【一樓大廳與門廳】</span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-neutral-500'}`} />
                      </button>
                    )}
                  </div>
                )}

                {/* Same floor quick toggle if in 5F Corridor (Entering 504 Room) */}
                {currentLocId === 'loc_5f_corridor' && (
                  <div className={`pt-2 border-t space-y-1.5 ${isRetro ? 'border-[#c8d8c3]' : 'border-neutral-800/80'}`}>
                    <div className={`text-[10px] font-mono ${isRetro ? 'text-[#556652]' : 'text-neutral-500'}`}>五樓內部動線：</div>
                    <button
                      onClick={() => {
                        sound.playSwitch();
                        setCurrentLocId('loc_504_interior');
                        setActiveHotspot(null);
                        setActiveObservation(null);
                        setActionFeedback({
                          text: '【進入 504 號房】：你插進鑰匙轉開門鎖，推門走進了 504 號房。室內飄散著淡淡的茉莉芳香劑氣味。',
                          type: 'normal'
                        });
                      }}
                      className={`w-full p-2.5 border text-xs font-serif flex items-center justify-between transition-all ${
                        isRetro
                          ? 'bg-[#ffffff] hover:bg-[#f2f7f0] border-[#a8c2a1] text-[#1a3964] rounded-none shadow-xs'
                          : 'rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-700/80 hover:border-amber-500 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <DoorOpen className={`w-4 h-4 shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-amber-400'}`} />
                        <span>用鑰匙解鎖進入【504 號房】</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-amber-400'}`} />
                    </button>
                  </div>
                )}

                {/* Leave Building / Return to Office: ONLY AVAILABLE ON 1F (Requirement 4) */}
                {isOnFirstFloor ? (
                  <div className={`pt-2 border-t ${isRetro ? 'border-[#c8d8c3]' : 'border-neutral-800'}`}>
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (isAwaiting1FInvestigationForMice) {
                          sound.playTensionSting();
                          setActiveEpiphanyQTEId('mouse_scratch_wall_complaint');
                          setHasEncountered5FNeighborComplaint(true);
                          setActionFeedback({
                            text: '【大廳突發騷動】：你正準備推門走出大樓離開，身後值班台前突然傳來五樓住戶情緒激動的拍桌聲與激烈爭吵……！',
                            type: 'normal'
                          });
                          return;
                        }
                        setShowLeaveBuildingModal(true);
                      }}
                      className={`w-full p-2.5 border text-left flex items-center justify-between text-xs font-serif transition-all shadow-xs cursor-pointer ${
                        isRetro
                          ? 'bg-[#ffffff] hover:bg-[#f2f7f0] border-[#a8c2a1] text-[#1a3964] rounded-none'
                          : 'rounded-xl bg-neutral-950 hover:bg-neutral-900 border-neutral-800 hover:border-amber-600/80 text-neutral-300 hover:text-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className={`w-3.5 h-3.5 ${isRetro ? 'text-[#2e6d24]' : 'text-amber-500'}`} />
                        <div>
                          <div className={`font-bold ${isRetro ? 'text-[#1a3964]' : 'text-neutral-200'}`}>走出正門離開大樓</div>
                          <div className={`text-[10px] ${isRetro ? 'text-[#556652]' : 'text-neutral-500'}`}>返回私家偵探事務所休整心神</div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isRetro ? 'text-[#2e6d24]' : 'text-neutral-500'}`} />
                    </button>
                  </div>
                ) : (
                  <div className={`p-2 text-[10px] font-serif text-center leading-relaxed ${
                    isRetro
                      ? 'bg-[#f7faf5] border border-[#c8d8c3] text-[#556652] rounded-none'
                      : 'rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-neutral-500'
                  }`}>
                    目前身在 {currentLocation.floor}，需經由電梯或梯間返回 <b className={isRetro ? 'text-[#1f4717]' : 'text-neutral-400'}>1樓</b> 方能離開大樓。
                  </div>
                )}
              </>
            )}
          </div>
          )}
        </div>

        {/* Column 2 (Middle): Current Location Scene & Free Exploration Hotspots */}
        <div className={`${isTransitCollapsed ? 'lg:col-span-7 xl:col-span-7' : 'lg:col-span-6 xl:col-span-6'} h-full min-h-0 overflow-y-auto space-y-2 pr-1 custom-scrollbar ${
          mobileTab !== 'scene' ? 'hidden lg:block' : 'block'
        }`}>
          {/* Location Scene Card */}
          <div className={`p-3 md:p-3.5 space-y-2.5 ${
            isRetro
              ? 'bg-[#ffffff] border border-[#a8c2a1] text-[#333333] rounded-none shadow-xs'
              : 'bg-neutral-900/90 border border-neutral-800 rounded-xl shadow-xl'
          }`}>
            {/* Location Header */}
            <div className={`pb-2 flex items-center justify-between gap-2 ${
              isRetro 
                ? 'border-b border-[#a8c2a1] bg-[#eef5ec] -mx-3 md:-mx-3.5 -mt-3 md:-mt-3.5 p-2.5' 
                : 'border-b border-neutral-800'
            }`}>
              <div>
                <div className={`flex items-center gap-1.5 text-[11px] font-mono mb-0.5 ${
                  isRetro ? 'text-[#1f4717] font-bold' : 'text-amber-500'
                }`}>
                  <MapPin className="w-3 h-3" />
                  <span>
                    {currentLocId === 'loc_stairwell'
                      ? `${stairCornerFloor === '1F' ? '1F-2F 梯間轉角' : stairCornerFloor === '2F' ? '2F-3F 梯間轉角' : '3F-5F 梯間轉角'} 現場搜查`
                      : `${currentLocation.floor} 現場搜查`}
                  </span>
                </div>
                <h3 className={`text-sm sm:text-base font-bold font-serif ${
                  isRetro ? 'text-[#1a3964]' : 'text-neutral-100'
                }`}>
                  {currentLocId === 'loc_stairwell'
                    ? stairCornerFloor === '1F'
                      ? '大樓U字形樓梯間【一樓至二樓折返轉角】'
                      : stairCornerFloor === '2F'
                        ? '大樓U字形樓梯間【二樓至三樓折返轉角】'
                        : '大樓U字形樓梯間【三樓至五樓折返轉角】'
                    : currentLocation.name}
                </h3>
              </div>

              <span className={`text-[10px] px-2 py-0.5 font-mono ${
                isRetro
                  ? 'bg-[#ffffff] border border-[#a8c2a1] text-[#1f4717] rounded-none'
                  : 'rounded bg-neutral-950 border border-neutral-800 text-neutral-400'
              }`}>
                物件: {activeHotspots.length}
              </span>
            </div>

            {/* Stairwell Vertical Cross-Section & Corner Floor Switcher */}
            {currentLocId === 'loc_stairwell' && (
              <div className={`p-3 space-y-2.5 shadow-xs ${
                isRetro
                  ? 'bg-[#f7faf5] border border-[#a8c2a1] rounded-none text-[#333333]'
                  : 'rounded-xl bg-neutral-950/90 border border-neutral-800 shadow-xl'
              }`}>
                {/* Header with Exit Door */}
                <div className={`flex flex-wrap items-center justify-between gap-2 pb-2 border-b ${
                  isRetro ? 'border-[#c8d8c3]' : 'border-neutral-800/80'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <Layers className={`w-3.5 h-3.5 ${isRetro ? 'text-[#1f4717]' : 'text-cyan-400'}`} />
                    <span className={`text-xs font-bold font-serif ${isRetro ? 'text-[#1a3964]' : 'text-cyan-200'}`}>大樓安全梯垂直空間幾何斷面</span>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (stairCornerFloor === '1F') setCurrentLocId('loc_1f_lobby');
                      else if (stairCornerFloor === '2F') setCurrentLocId('loc_2f_corridor');
                      else setCurrentLocId('loc_3f_corridor');
                      setActiveHotspot(null);
                      setActiveObservation(null);
                    }}
                    className={`px-2.5 py-1 text-[10px] font-serif flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                      isRetro
                        ? 'bg-[#ffffff] hover:bg-[#eef5ec] border border-[#a8c2a1] text-[#1a3964] rounded-none'
                        : 'rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-neutral-300 hover:text-neutral-100 shadow-sm'
                    }`}
                  >
                    <DoorOpen className={`w-3.5 h-3.5 ${isRetro ? 'text-[#2e6d24]' : 'text-amber-400'}`} />
                    <span>推開防火門返回【{stairCornerFloor === '1F' ? '一樓大廳' : stairCornerFloor === '2F' ? '二樓走廊' : '三樓走廊'}】</span>
                  </button>
                </div>

                {/* Vertical Architectural Elevation Schematic Nodes */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 text-[11px] font-mono">
                  {/* Top Level 5F */}
                  <div className={`p-2 text-center flex flex-col justify-center ${
                    isRetro
                      ? 'bg-[#ffffff] border border-[#a8c2a1] rounded-none'
                      : 'rounded-lg bg-black/60 border border-neutral-800'
                  }`}>
                    <div className={`text-[10px] font-bold ${isRetro ? 'text-[#556652]' : 'text-neutral-500'}`}>頂層</div>
                    <div className={`text-xs font-bold ${isRetro ? 'text-[#1a3964]' : 'text-amber-400'}`}>5F 長廊</div>
                    <div className={`text-[9px] ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>504 / 502號房</div>
                  </div>

                  {/* Node 3F-5F (Corner 3) */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setStairCornerFloor('3F');
                      setActiveHotspot(null);
                      setActiveObservation(null);
                    }}
                    className={`p-2 border text-left transition-all cursor-pointer relative ${
                      stairCornerFloor === '3F'
                        ? isRetro
                          ? 'bg-[#eef5ec] border-[#2e6d24] text-[#1f4717] rounded-none ring-1 ring-[#2e6d24]/50'
                          : 'rounded-lg bg-cyan-950/90 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/50 shadow-md'
                        : isRetro
                          ? 'bg-[#ffffff] border-[#c8d8c3] hover:border-[#a8c2a1] text-[#333333] rounded-none'
                          : 'rounded-lg bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">3F ↗ 5F 折返梯</span>
                      {hasDiscoveredStepHeightDiscrepancy ? (
                        <span className={`text-[9px] px-1 py-0.2 font-bold animate-pulse ${
                          isRetro
                            ? 'bg-[#fdf2f2] border border-[#d68b8b] text-[#9c2e2e] rounded-none'
                            : 'rounded bg-rose-950 border border-rose-600 text-rose-300'
                        }`}>
                          ⚠️ 24階!
                        </span>
                      ) : (
                        <span className={`text-[9px] ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>24階</span>
                      )}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>
                      {hasDiscoveredStepHeightDiscrepancy ? '階高15cm • 總高360cm' : '水泥梯（丈量異常）'}
                    </div>
                  </button>

                  {/* Node 2F-3F (Corner 2) */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setStairCornerFloor('2F');
                      setActiveHotspot(null);
                      setActiveObservation(null);
                    }}
                    className={`p-2 border text-left transition-all cursor-pointer relative ${
                      stairCornerFloor === '2F'
                        ? isRetro
                          ? 'bg-[#eef5ec] border-[#2e6d24] text-[#1f4717] rounded-none ring-1 ring-[#2e6d24]/50'
                          : 'rounded-lg bg-cyan-950/90 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/50 shadow-md'
                        : isRetro
                          ? 'bg-[#ffffff] border-[#c8d8c3] hover:border-[#a8c2a1] text-[#333333] rounded-none'
                          : 'rounded-lg bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">2F ↗ 3F 折返梯</span>
                      <span className={`text-[9px] font-bold ${isRetro ? 'text-[#2e6d24]' : 'text-emerald-400'}`}>15階</span>
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>
                      標準階高18cm • 總高270cm
                    </div>
                  </button>

                  {/* Node 1F-2F (Corner 1) */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setStairCornerFloor('1F');
                      setActiveHotspot(null);
                      setActiveObservation(null);
                    }}
                    className={`p-2 border text-left transition-all cursor-pointer relative ${
                      stairCornerFloor === '1F'
                        ? isRetro
                          ? 'bg-[#eef5ec] border-[#2e6d24] text-[#1f4717] rounded-none ring-1 ring-[#2e6d24]/50'
                          : 'rounded-lg bg-cyan-950/90 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/50 shadow-md'
                        : isRetro
                          ? 'bg-[#ffffff] border-[#c8d8c3] hover:border-[#a8c2a1] text-[#333333] rounded-none'
                          : 'rounded-lg bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">1F ↗ 2F 折返梯</span>
                      <span className={`text-[9px] font-bold ${isRetro ? 'text-[#2e6d24]' : 'text-emerald-400'}`}>15階</span>
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>
                      標準階高18cm • 總高270cm
                    </div>
                  </button>
                </div>

                {/* Discovery Banner for Solved Spatial Paradox */}
                {hasDiscoveredStepHeightDiscrepancy && (
                  <div className={`p-2 text-[11px] font-serif flex items-center gap-2 ${
                    isRetro
                      ? 'bg-[#eef5ec] border border-[#83ab79] text-[#1f4717] rounded-none'
                      : 'rounded-lg bg-amber-950/40 border border-amber-500/70 text-amber-200'
                  }`}>
                    <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-amber-400'}`} />
                    <span>
                      <b>建築幾何詭計已解構</b>：1F-3F每階18cm（總高270cm），3F-5F每階僅15cm卻有24階（總高360cm）！證實三樓上方存在加蓋壓縮夾層（消失的四樓）！
                    </span>
                  </div>
                )}

                {/* Spatial Deduction Staircase Measure Minigame Launch Button */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowStaircaseMeasureModal(true);
                    }}
                    className={`w-full py-2 px-3 font-bold text-xs font-serif shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isRetro
                        ? 'bg-[#3e6634] hover:bg-[#33552a] text-[#ffffff] border border-[#2d4d25] rounded-none'
                        : 'rounded-lg bg-gradient-to-r from-amber-700/90 to-amber-600/90 hover:from-amber-600 hover:to-amber-500 border border-amber-500/80 text-white shadow-md'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isRetro ? 'text-[#fae0a5]' : 'text-amber-300'}`} />
                    <span>【空間幾何丈量】：展開安全梯 24 階折返丈量台 ➔</span>
                  </button>
                </div>
              </div>
            )}

            {/* Ambient Narrative Introduction (整合至上方區塊) */}
            <div className={`p-2.5 ${
              isRetro 
                ? 'bg-[#f7faf5] border border-[#c8d8c3] rounded-none' 
                : 'rounded-xl bg-black/40 border border-neutral-800/80'
            }`}>
              <p className={`text-xs sm:text-sm font-serif leading-relaxed ${isRetro ? 'text-[#333333]' : 'text-neutral-300'}`}>
                <SanityGlitchText
                  text={
                    currentLocId === 'loc_stairwell'
                      ? stairCornerFloor === '1F'
                        ? '從一樓大廳推開厚重的防火門，映入眼簾的是通往二樓的兩段式水泥階梯（標準15階）。每爬半層便是一處寬闊的轉角平台。冷風沿著防滑金屬邊緣吹過，水泥扶手冰冷潮濕。'
                        : stairCornerFloor === '2F'
                          ? '站在二樓至三樓的梯段轉角（標準15階），能聞到走廊飄來的刺鼻消毒水與地板蠟氣味。頭頂日光燈管偶爾嗡嗡作響，兩段水泥折返梯在昏暗光線中延伸。'
                          : '走上三樓往上的折返梯段（整整24階），空氣驟然變得乾燥灼熱。理應是通往四樓的階梯，牆上的標示卻直接跳到了五樓。每爬幾步，耳邊就彷彿能聽見打字機瘋狂敲擊的機械回音。'
                      : currentLocId === 'loc_504_interior'
                        ? (!completedWeek1
                            ? '推開504號房門，屋內飄著一股淡淡的積塵與乾燥茉莉芳香劑氣味。客廳茶几端正擺放著一張對折的泛黃紙條，旁邊杯中的咖啡早已乾涸結斑；書桌上擺著未闔上的記事簿。'
                            : currentLocation.ambientDescription)
                        : currentLocation.ambientDescription
                  }
                  san={san}
                />
              </p>
            </div>

            {/* 現場調查區域 */}
            <div className={`space-y-2 pt-1 border-t ${isRetro ? 'border-[#a8c2a1]' : 'border-neutral-800/60'}`}>
              {/* Safe Zone Resting & Consumable Recovery Panel */}
              {currentLocation.isSafeZone && (
                <div className={`p-3 border space-y-2 mb-2 ${
                  isRetro 
                    ? 'bg-[#eef8ed] border-[#7ca078] text-[#1c4718]'
                    : 'bg-emerald-950/60 border-emerald-600/70 text-emerald-200 rounded-xl'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-xs sm:text-sm">
                        【安全區 • 心智休整點】
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 bg-[#d8edd4] text-[#1c4718] border border-[#7ca078] font-mono font-bold">
                      SAFE HAVEN
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    此處相對安全，怪異暫無法侵擾。可坐下安心翻閱案卷或使用隨身物資回復精神。
                  </p>

                  {/* Consumable Items Quick-Use Buttons */}
                  {inventory.some(id => INVENTORY_ITEMS[id]?.isConsumable) && (
                    <div className="pt-1.5 border-t border-[#c0d8bd]/70 space-y-1.5">
                      <div className="text-[10px] font-bold font-mono opacity-80 uppercase tracking-wider">
                        隨身可食用/使用回復物資：
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {inventory
                          .filter(id => INVENTORY_ITEMS[id]?.isConsumable)
                          .map(id => {
                            const item = INVENTORY_ITEMS[id];
                            return (
                              <button
                                key={id}
                                onClick={() => onConsumeItem?.(id)}
                                className="p-2 bg-white hover:bg-[#e4ede2] border border-[#7ca078] text-left flex items-center justify-between group cursor-pointer shadow-2xs transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Sparkles className="w-3.5 h-3.5 text-[#2b5828] shrink-0" />
                                  <span className="text-xs font-bold text-[#1c4718] truncate">
                                    {completedWeek1 
                                      ? `使用【${item.name}】` 
                                      : `食用【${item.name}】`}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#2b5828] font-bold font-mono shrink-0 ml-1.5">
                                  {completedWeek1 
                                    ? (item.recoveryGrade === 'significant' ? '+25 SAN' : item.recoveryGrade === 'moderate' ? '+15 SAN' : '+10 SAN')
                                    : '休整'}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pb-0.5">
                <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider font-mono ${isRetro ? 'text-[#1f4717] font-bold' : 'text-amber-400/90'}`}>
                  <Search className={`w-3.5 h-3.5 ${isRetro ? 'text-[#1f4717]' : 'text-amber-400'}`} />
                  <span>{isRetro ? '現場調查物件目錄' : '現場調查物件與線索探查'}</span>
                </div>
                <span className={`text-[10px] font-serif ${isRetro ? 'text-[#556652]' : 'text-neutral-500'}`}>
                  {isRetro ? '[現場鑑識]' : '勘查與檢驗'}
                </span>
              </div>

              {/* 現場觀察取得線索之調查方式：凝神感知環境 */}
              {currentLocId === 'loc_502_interior' && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950 via-[#26150a] to-amber-950 border-2 border-amber-500/80 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>【502室現場・緊急營救行動】</span>
                    </div>
                    <span className="text-[10px] font-mono bg-amber-900/60 text-amber-200 border border-amber-600/60 px-2 py-0.5 rounded">
                      階段 {wallRescueStep}/3
                    </span>
                  </div>
                  <p className="text-xs font-serif text-amber-100/90 leading-relaxed">
                    隔間牆深處傳來極其急促的微弱抓撓與喘息聲！開啟全螢幕破案勘查台，集中專注力進行聽音辨位、強光探照與物理破拆！
                  </p>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsZhangHaoRescueModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 text-neutral-950 font-bold font-serif text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
                  >
                    <Hammer className="w-4 h-4 text-neutral-950 animate-bounce" />
                    <span>【展開全螢幕救人勘查台】實施緊急搜救 ➔</span>
                  </button>
                </div>
              )}

              <button
                onClick={handleObserveEnvironment}
                className={`w-full p-2.5 text-left transition-all flex items-center justify-between group shadow-xs cursor-pointer ${
                  isRetro
                    ? 'bg-[#ffffff] hover:bg-[#f2f7f0] border border-[#a8c2a1] rounded-none text-[#1a3964]'
                    : 'rounded-xl border border-amber-800/60 bg-gradient-to-r from-neutral-950 via-amber-950/20 to-neutral-950 hover:border-amber-500/80 hover:bg-amber-950/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 ${
                    isRetro 
                      ? 'bg-[#ebf4e8] border border-[#7ba86f] text-[#284420] rounded-none' 
                      : 'rounded-lg bg-amber-900/40 border border-amber-600/50 text-amber-400 group-hover:scale-105 transition-transform'
                  }`}>
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs font-serif ${isRetro ? 'text-[#1a3964]' : 'text-amber-200 group-hover:text-amber-100'}`}>
                        【現場感知】凝神察覺環境氣氛異動
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 font-serif ${
                        isRetro 
                          ? 'bg-[#eef5ec] border border-[#83ab79] text-[#1f4717] rounded-none' 
                          : 'rounded bg-amber-950/80 border border-amber-600/60 text-amber-300'
                      }`}>
                        精神專注
                      </span>
                    </div>
                    <p className={`text-[10px] font-serif mt-0.5 ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>
                      調動視、聽、嗅等感官察知現場異常氣息，記錄線索並檢驗偵探直覺
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-amber-500/80'}`} />
              </button>

              {/* UX Priority 1: Investigation Progress Meter */}
              <div className={`flex items-center justify-between text-[11px] font-serif px-2.5 py-1.5 ${
                isRetro
                  ? 'bg-[#f7faf5] border border-[#c8d8c3] rounded-none text-[#556652]'
                  : 'bg-neutral-950/80 rounded-xl border border-neutral-800 text-neutral-400'
              }`}>
                <span className={`font-mono text-[10px] ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>現場勘查進度：</span>
                <div className="flex items-center gap-2">
                  <div className={`w-20 sm:w-24 h-1.5 overflow-hidden ${
                    isRetro
                      ? 'bg-[#e8f0e5] border border-[#a8c2a1] rounded-none'
                      : 'bg-neutral-800 rounded-full border border-neutral-700'
                  }`}>
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isRetro ? 'bg-[#2e6d24]' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                      }`}
                      style={{ 
                        width: `${activeHotspots.length > 0 ? (activeHotspots.filter(h => getHotspotStatus(h) === 'completed').length / activeHotspots.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className={`font-mono font-bold text-[10px] ${isRetro ? 'text-[#1f4717]' : 'text-amber-300'}`}>
                    {activeHotspots.filter(h => getHotspotStatus(h) === 'completed').length} / {activeHotspots.length} 已徹查
                  </span>
                </div>
              </div>

              {/* Regular Hotspots List */}
              <div className="space-y-1.5 pt-1">
                {activeHotspots.map((hotspot) => {
                  const status = getHotspotStatus(hotspot);
                  const isSelected = (currentActiveHotspot?.id || activeHotspot?.id) === hotspot.id;

                  return (
                    <button
                      key={hotspot.id}
                      onClick={() => handleInspectHotspot(hotspot)}
                      className={`w-full p-2.5 border text-left transition-all flex items-start gap-2.5 group cursor-pointer ${
                        isRetro
                          ? isSelected
                            ? 'bg-[#e8f2e4] border-2 border-[#3e6334] text-[#284420] rounded-none shadow-sm'
                            : status === 'completed'
                              ? 'bg-[#f7f9f6] border-[#c8d8c3] text-[#777777] rounded-none opacity-85 hover:opacity-100'
                              : 'bg-[#ffffff] hover:bg-[#f0f6ee] border-[#a8c2a1] text-[#222222] rounded-none shadow-2xs'
                          : isSelected
                            ? 'rounded-xl bg-amber-950/70 border-amber-500 text-amber-100 ring-1 ring-amber-500/60 shadow-lg'
                            : status === 'completed'
                              ? 'rounded-xl bg-neutral-950/40 border-neutral-800/60 opacity-85 hover:opacity-100 hover:border-emerald-600/60 text-neutral-400 hover:text-neutral-200'
                              : status === 'in_progress'
                                ? 'rounded-xl bg-neutral-900/90 border-neutral-700/80 hover:border-sky-500/70 text-neutral-200 shadow-sm'
                                : 'rounded-xl bg-neutral-900/95 border-amber-500/30 hover:border-amber-400 text-neutral-100 shadow-sm ring-1 ring-amber-500/10'
                      }`}
                    >
                      <div className={`p-1.5 shrink-0 ${
                        isRetro
                          ? isSelected
                            ? 'bg-[#ffffff] text-[#284420] border border-[#3e6334] rounded-none'
                            : status === 'completed'
                              ? 'bg-[#f0f0f0] text-[#888888] border border-[#cccccc] rounded-none'
                              : 'bg-[#eaf4e7] text-[#284420] border border-[#a8c2a1] rounded-none'
                          : isSelected 
                            ? 'rounded-lg bg-amber-900/60 text-amber-300' 
                            : status === 'completed'
                              ? 'rounded-lg bg-emerald-950/30 text-emerald-400/90 border border-emerald-900/40'
                              : status === 'in_progress'
                                ? 'rounded-lg bg-sky-950/40 text-sky-300 border border-sky-900/40'
                                : 'rounded-lg bg-amber-950/40 text-amber-300 border border-amber-700/40'
                      }`}>
                        {renderIcon(hotspot.iconName, "w-4 h-4")}
                      </div>

                      <div className="overflow-hidden flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-bold text-xs sm:text-[13px] truncate font-serif ${
                            isRetro
                              ? status === 'completed' && !isSelected ? 'text-[#888888] line-through' : 'text-[#1a3964]'
                              : status === 'completed' && !isSelected ? 'text-neutral-300 line-through decoration-neutral-500/50' : 'text-neutral-100'
                          }`}>
                            {hotspot.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {status === 'completed' ? (
                              <span className={`text-xs px-1.5 py-0.2 font-sans flex items-center gap-0.5 ${
                                isRetro
                                  ? 'bg-[#eef5ec] border border-[#8eb584] text-[#2e6d24] rounded-none'
                                  : 'rounded bg-emerald-950/80 border border-emerald-600/70 text-emerald-300'
                              }`}>
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>已勘查完畢</span>
                              </span>
                            ) : status === 'in_progress' ? (
                              <span className={`text-xs px-1.5 py-0.2 font-sans flex items-center gap-0.5 ${
                                isRetro
                                  ? 'bg-[#edf3fc] border border-[#8bb2e8] text-[#1f4a7d] rounded-none'
                                  : 'rounded bg-sky-950/80 border border-sky-600/60 text-sky-300'
                              }`}>
                                <Search className="w-2.5 h-2.5 text-sky-600" />
                                <span>搜查中</span>
                              </span>
                            ) : (
                              <span className={`text-xs px-1.5 py-0.2 font-sans flex items-center gap-0.5 ${
                                isRetro
                                  ? 'bg-[#fff4e8] border border-[#f0b57a] text-[#b85b14] rounded-none'
                                  : 'rounded bg-amber-950/90 border border-amber-500/60 text-amber-300'
                              }`}>
                                <Sparkles className="w-2.5 h-2.5 text-amber-600 animate-pulse" />
                                <span>待搜查</span>
                              </span>
                            )}
                            {getCategoryBadge(hotspot.category)}
                          </div>
                        </div>

                        <p className={`text-xs mt-0.5 font-serif ${
                          isRetro
                            ? status === 'completed' ? 'text-[#888888]' : 'text-[#555555]'
                            : status === 'completed' ? 'text-neutral-500' : 'text-neutral-400'
                        }`}>
                          {hotspot.shortDesc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3 (Right): Hotspot Detailed Forensic Inspection Drawer / Actions */}
        <div className={`${isTransitCollapsed ? 'lg:col-span-4 xl:col-span-4' : 'lg:col-span-3 xl:col-span-3'} h-full min-h-0 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar ${
          mobileTab === 'transit' ? 'hidden lg:block' : mobileTab === 'scene' ? 'hidden lg:block' : 'block'
        }`}>
          <AnimatePresence mode="wait">
            {currentActiveHotspot ? (
              <motion.div
                key={currentActiveHotspot.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`${
                  isRetro
                    ? 'bg-[#ffffff] border-2 border-[#3e6334] rounded-none p-3.5 md:p-4 shadow-sm space-y-3 shrink-0 text-[#222222]'
                    : 'bg-neutral-950 border-2 border-amber-600/50 rounded-xl p-3.5 md:p-4 shadow-2xl space-y-3 shrink-0'
                }`}
              >
                <div className={`flex items-center justify-between border-b pb-2 ${isRetro ? 'border-[#c8d8c3]' : 'border-neutral-800'}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 shrink-0 ${
                      isRetro
                        ? 'bg-[#ebf4e8] border border-[#7ba86f] text-[#284420] rounded-none'
                        : 'rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-300'
                    }`}>
                      {renderIcon(currentActiveHotspot.iconName, "w-4 h-4")}
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs sm:text-sm font-bold font-serif truncate ${isRetro ? 'text-[#1a3964]' : 'text-neutral-100'}`}>
                        {currentActiveHotspot.name}
                      </h4>
                      <div className={`text-xs font-serif truncate ${isRetro ? 'text-[#666666]' : 'text-neutral-400'}`}>
                        {currentActiveHotspot.shortDesc}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveHotspot(null);
                      setMobileTab('scene');
                    }}
                    className={`text-xs px-2.5 py-1 flex items-center gap-1 shrink-0 ml-2 transition-all cursor-pointer ${
                      isRetro
                        ? 'retro-web-btn text-[#444444]'
                        : 'rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-neutral-300 hover:text-neutral-100 shadow-sm'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>關閉鑑識</span>
                  </button>
                </div>

                {/* Inspect Narrative Text */}
                <div className={`p-2.5 rounded-none text-xs sm:text-[13px] font-serif leading-relaxed space-y-1.5 ${
                  isRetro
                    ? 'bg-[#f7f9f6] border border-[#c8d8c3] text-[#222222]'
                    : 'bg-black/60 border border-neutral-800 text-neutral-200'
                }`}>
                  <div className={`border-b pb-1 ${isRetro ? 'border-[#d8e5d3]' : 'border-neutral-800/80'}`}>
                    <span className={`text-xs font-mono font-bold ${isRetro ? 'text-[#2e6d24]' : 'text-neutral-400'}`}>【現場勘查紀實】</span>
                  </div>
                  <div>
                    <SanityGlitchText text={currentActiveHotspot.inspectText} san={san} />
                  </div>
                </div>

                {/* Trait-specific Rescue Guidance for 502 Wall Rescue */}
                {currentLocId === 'loc_502_interior' && trait && TRAIT_RESCUE_HINTS[trait] && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-gradient-to-r from-amber-950/70 via-neutral-900/90 to-amber-950/70 border border-amber-500/70 shadow-lg shadow-amber-950/30 text-xs space-y-2 ring-1 ring-amber-500/40"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-amber-800/40 pb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300 font-mono text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>{TRAIT_RESCUE_HINTS[trait].badge}</span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-700/50">
                        {wallRescueStep === 1 ? '救援步驟 1/3：壁面辨識' : wallRescueStep === 2 ? '救援步驟 2/3：夾層探照' : '救援步驟 3/3：實施破拆'}
                      </span>
                    </div>

                    <div className="text-amber-100 font-serif text-[11.5px] leading-relaxed">
                      {wallRescueStep === 1 && TRAIT_RESCUE_HINTS[trait].step1WallHint}
                      {wallRescueStep === 2 && TRAIT_RESCUE_HINTS[trait].step2CrackHint}
                      {wallRescueStep >= 3 && TRAIT_RESCUE_HINTS[trait].step3BreakHint}
                    </div>

                    <div className="text-[10.5px] text-amber-300/80 font-mono italic pt-1 border-t border-amber-800/30 flex items-center gap-1">
                      <span>💡 破局策略：</span>
                      <span>{TRAIT_RESCUE_HINTS[trait].rescueStrategyHint}</span>
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setIsZhangHaoRescueModalOpen(true);
                      }}
                      className="w-full mt-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold font-serif text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      <Hammer className="w-3.5 h-3.5" />
                      <span>切換至全螢幕大彈窗破案搜救 ➔</span>
                    </button>
                  </motion.div>
                )}

                {/* Sixth Sense Premonition for Intuitive Trait or General Detective Intuition */}
                {(() => {
                  const sixthSense = getSixthSensePremonition(currentActiveHotspot, trait, completedWeek1);
                  if (sixthSense) {
                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-2.5 rounded-xl border text-xs font-serif flex items-start gap-2 shadow-md ${
                          sixthSense.type === 'danger'
                            ? 'bg-rose-950/60 border-rose-600/80 text-rose-200 ring-1 ring-rose-500/50'
                            : 'bg-amber-950/60 border-amber-500/80 text-amber-100 ring-1 ring-amber-500/50'
                        }`}
                      >
                        <Zap className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${sixthSense.type === 'danger' ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold font-mono text-[11px]">
                            {sixthSense.type === 'danger' ? '⚡ 【直覺派・第六感警兆】' : '✨ 【直覺派・第六感共鳴】'}
                          </div>
                          <p className="leading-relaxed text-[11px]">{sixthSense.text}</p>
                        </div>
                      </motion.div>
                    );
                  }

                  const intuition = getDetectiveIntuition(
                    `${currentActiveHotspot.name} ${currentActiveHotspot.inspectText}`,
                    obtainedRules,
                    inventory,
                    completedWeek1
                  );
                  if (!intuition) return null;
                  return (
                    <div className={`p-2 rounded-lg border text-xs font-serif flex items-center gap-2 ${
                      intuition.type === 'contradiction'
                        ? 'bg-rose-950/40 border-rose-800/70 text-rose-300'
                        : 'bg-amber-950/40 border-amber-800/70 text-amber-300'
                    }`}>
                      <Brain className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium italic text-[11px]">【直覺聯想】：{intuition.text}</span>
                    </div>
                  );
                })()}

                {/* Hotspot Flashlight Option (若該調查點需要手電筒才能找到線索，顯示手電筒選項) */}
                {checkHotspotNeedsFlashlight(currentActiveHotspot) && (
                  <div className={`p-3 rounded-xl border transition-all space-y-2 ${
                    isFlashlightOn
                      ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-950/40'
                      : 'bg-neutral-900/90 border-dashed border-amber-600/70 hover:border-amber-400'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1.5 rounded-lg border ${
                          isFlashlightOn
                            ? 'bg-amber-400 text-neutral-950 border-amber-300 animate-pulse'
                            : 'bg-neutral-950 text-amber-400 border-amber-800/70'
                        }`}>
                          <Flashlight className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold font-serif text-neutral-100 flex items-center gap-1.5">
                            <span>隨身強光手電筒</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                              isFlashlightOn
                                ? 'bg-amber-950 border-amber-500 text-amber-300'
                                : 'bg-neutral-950 border-neutral-700 text-neutral-400'
                            }`}>
                              {isFlashlightOn ? '🔦 照明探照中' : '此處需手電筒尋找線索'}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 font-serif mt-0.5 leading-tight">
                            {isFlashlightOn
                              ? '光束已驅散死角陰影，暗處細節與關鍵線索已完全照亮顯現。'
                              : '當前調查點深處光線昏暗，需開啟隨身強光手電筒以照出被陰影遮蔽的線索。'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const next = !isFlashlightOn;
                          setIsFlashlightOn(next);
                          sound.playFlashlightToggle(next);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow ${
                          isFlashlightOn
                            ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600'
                            : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border border-amber-400 animate-pulse shadow-amber-950/60'
                        }`}
                      >
                        <Flashlight className={`w-3.5 h-3.5 ${isFlashlightOn ? 'text-neutral-300' : 'text-neutral-950'}`} />
                        <span>{isFlashlightOn ? '關閉手電筒' : '開啟手電筒'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-1.5">
                  <div className={`text-[10px] font-semibold uppercase tracking-wider font-mono ${
                    isRetro ? 'text-[#1f4717] font-bold' : 'text-neutral-400'
                  }`}>
                    你打算……
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {(() => {
                      const availableActions = currentActiveHotspot.actions.filter(act => {
                        if (act.requiresRule && !obtainedRules.includes(act.requiresRule)) {
                          return false;
                        }
                        if (act.requiresItem && !inventory.includes(act.requiresItem)) {
                          return false;
                        }
                        if (act.customCheck === 'initial_only' && hasExperiencedFirst4F) {
                          return false;
                        }
                        if (act.customCheck === 'post_anomaly' && !hasExperiencedFirst4F) {
                          return false;
                        }
                        return true;
                      });

                      if (availableActions.length === 0) {
                        return (
                          <div className={`p-2.5 text-xs font-serif text-center ${
                            isRetro
                              ? 'bg-[#f7faf5] border border-[#c8d8c3] text-[#556652] rounded-none'
                              : 'rounded-xl bg-neutral-950/60 border border-neutral-800 text-neutral-400'
                          }`}>
                            暫無可執行的調查動作（需在現場搜集更多線索或規約）
                          </div>
                        );
                      }

                      return availableActions.map((act) => {
                        const isRisky = typeof act.sanDelta === 'number' && act.sanDelta < 0;
                        const isExecuted = executedActionIds.includes(act.id);
                        return (
                          <button
                            key={act.id}
                            onClick={() => handleExecuteAction(act)}
                            className={`w-full p-2.5 border transition-all flex items-center justify-between group text-xs font-serif cursor-pointer shadow-xs ${
                              isRetro
                                ? isExecuted
                                  ? 'bg-[#f7f9f6] border-[#c8d8c3] text-[#777777] rounded-none'
                                  : isRisky
                                    ? 'bg-[#fff9f9] hover:bg-[#ffeded] border-[#d68b8b] text-[#9c2e2e] rounded-none'
                                    : 'bg-[#ffffff] hover:bg-[#f2f7f0] border-[#a8c2a1] text-[#1a3964] rounded-none'
                                : isExecuted
                                  ? 'rounded-xl bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:border-neutral-600'
                                  : isRisky 
                                    ? 'rounded-xl bg-neutral-900 hover:bg-neutral-800 border-neutral-700/90 hover:border-red-500/70' 
                                    : 'rounded-xl bg-neutral-900 hover:bg-neutral-800 border-neutral-700 hover:border-amber-500/80'
                            }`}
                          >
                            <div className="space-y-0.5 pr-2 text-left min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`font-bold truncate ${
                                  isRetro
                                    ? isExecuted ? 'text-[#777777]' : 'text-[#1a3964]'
                                    : isExecuted ? 'text-neutral-300' : 'text-neutral-100 group-hover:text-amber-300'
                                }`}>
                                  {act.label}
                                </span>
                                {isExecuted && (
                                  <span className={`text-[9px] px-1.5 py-0.2 font-mono flex items-center gap-0.5 ${
                                    isRetro
                                      ? 'bg-[#eef5ec] border border-[#8eb584] text-[#2e6d24] rounded-none'
                                      : 'rounded bg-emerald-950/80 border border-emerald-700/70 text-emerald-300'
                                  }`}>
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span>已執行</span>
                                  </span>
                                )}
                              </div>
                              {isRisky && (
                                <div className={`text-[10px] font-serif flex items-center gap-1 ${
                                  isRetro ? 'text-[#9c2e2e]' : 'text-amber-400/90'
                                }`}>
                                  <AlertTriangle className={`w-2.5 h-2.5 shrink-0 ${isRetro ? 'text-[#9c2e2e]' : 'text-amber-500'}`} />
                                  <span>感應到危險氣息，可能造成精神壓力</span>
                                </div>
                              )}
                            </div>
                            <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0 ml-1.5 ${
                              isRetro ? 'text-[#2e6d24]' : 'text-neutral-500 group-hover:text-amber-400'
                            }`} />
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Action Result Feedback with Forensic Clue Highlights */}
                {actionFeedback && (() => {
                  const { leadTitle, chips } = extractForensicClues(actionFeedback.text);

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 text-xs font-serif leading-relaxed space-y-2 ${
                        isRetro
                          ? 'bg-[#f7faf5] border border-[#a8c2a1] rounded-none text-[#333333] shadow-xs'
                          : 'rounded-xl bg-amber-950/40 border border-amber-500/70 text-amber-100 shadow-xl'
                      }`}
                    >
                      {/* Feedback Lead Header */}
                      <div className={`flex items-center justify-between border-b pb-1.5 ${
                        isRetro ? 'border-[#c8d8c3]' : 'border-amber-800/60'
                      }`}>
                        <div className={`font-bold font-mono text-[11px] flex items-center gap-1 ${
                          isRetro ? 'text-[#1f4717]' : 'text-amber-400'
                        }`}>
                          <Search className={`w-3.5 h-3.5 ${isRetro ? 'text-[#1f4717]' : 'text-amber-400'}`} />
                          <span>【調查結果】{leadTitle ? `・${leadTitle}` : ''}</span>
                        </div>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 ${
                          isRetro
                            ? 'bg-[#ffffff] border border-[#a8c2a1] text-[#1f4717] rounded-none'
                            : 'rounded bg-amber-900/60 text-amber-300 border border-amber-600/50'
                        }`}>
                          物證歸檔
                        </span>
                      </div>

                      {/* Main Narrative Text */}
                      <div className={`whitespace-pre-line leading-relaxed ${
                        isRetro ? 'text-[#333333]' : 'text-neutral-200'
                      }`}>
                        {actionFeedback.text}
                      </div>

                      {/* UX Priority 2: Key Clue Highlighting & Forensic Chips */}
                      {chips.length > 0 && (
                        <div className={`pt-2 border-t space-y-1.5 ${
                          isRetro ? 'border-[#c8d8c3]' : 'border-amber-800/50'
                        }`}>
                          <div className={`text-[10px] font-mono font-bold flex items-center gap-1 uppercase tracking-wider ${
                            isRetro ? 'text-[#1f4717]' : 'text-amber-300'
                          }`}>
                            <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isRetro ? 'text-[#1f4717]' : 'text-amber-400'}`} />
                            <span>客觀物理破綻與核心線索摘錄：</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {chips.map((chip, idx) => (
                              <div
                                key={idx}
                                className={`px-2 py-1 border text-[11px] font-serif shadow-xs flex items-center gap-1.5 ${
                                  isRetro
                                    ? 'bg-[#ffffff] border-[#a8c2a1] text-[#1a3964] rounded-none'
                                    : chip.type === 'physical'
                                      ? 'rounded-md bg-rose-950/70 border-rose-600/80 text-rose-200 ring-1 ring-rose-500/40'
                                      : chip.type === 'evidence'
                                        ? 'rounded-md bg-amber-950/70 border-amber-500/80 text-amber-200'
                                        : chip.type === 'audio'
                                          ? 'rounded-md bg-purple-950/70 border-purple-600/80 text-purple-200'
                                          : 'rounded-md bg-cyan-950/70 border-cyan-600/80 text-cyan-200'
                                }`}
                              >
                                <span className={`font-bold font-mono text-[9px] px-1 py-0.2 ${
                                  isRetro ? 'bg-[#eef5ec] text-[#1f4717] rounded-none' : 'rounded bg-black/50'
                                }`}>
                                  {chip.label}
                                </span>
                                <span className="font-medium">{chip.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Flashlight Action if Darkness / Light required */}
                      {!isFlashlightOn && (actionFeedback.text.includes('手電筒') || actionFeedback.text.includes('黑暗') || actionFeedback.text.includes('漆黑') || actionFeedback.text.includes('暗縫') || actionFeedback.text.includes('光源')) && (
                        <div className={`pt-1.5 border-t ${isRetro ? 'border-[#c8d8c3]' : 'border-amber-800/40'}`}>
                          <button
                            onClick={() => {
                              setIsFlashlightOn(true);
                              sound.playFlashlightToggle(true);
                            }}
                            className={`w-full py-1.5 px-2.5 font-bold font-serif text-xs flex items-center justify-center gap-1.5 transition-all animate-pulse cursor-pointer shadow-xs ${
                              isRetro
                                ? 'bg-[#3e6634] hover:bg-[#33552a] text-[#ffffff] border border-[#2d4d25] rounded-none'
                                : 'rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow'
                            }`}
                          >
                            <Flashlight className="w-3.5 h-3.5" />
                            <span>🔦 立即開啟隨身強光手電筒照亮死角</span>
                          </button>
                        </div>
                      )}

                      {/* Subtle Intuition Hint on Action Feedback */}
                      {(() => {
                        const feedbackIntuition = getDetectiveIntuition(
                          actionFeedback.text,
                          obtainedRules,
                          inventory,
                          completedWeek1
                        );
                        if (!feedbackIntuition) return null;
                        return (
                          <div className={`mt-1.5 p-1.5 border text-[11px] font-serif flex items-center gap-1.5 ${
                            isRetro
                              ? 'bg-[#ffffff] border-[#c8d8c3] text-[#1f4717] rounded-none'
                              : feedbackIntuition.type === 'contradiction'
                                ? 'rounded-lg bg-rose-950/50 border-rose-700 text-rose-300'
                                : 'rounded-lg bg-amber-950/50 border-amber-700 text-amber-300'
                          }`}>
                            <Brain className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-medium italic">【直覺聯想】：{feedbackIntuition.text}</span>
                          </div>
                        );
                      })()}
                    </motion.div>
                  );
                })()}
              </motion.div>
            ) : activeObservation ? (
              <motion.div
                key="active_sensory_observation"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`border p-3.5 md:p-4 space-y-3 shrink-0 ${
                  isRetro
                    ? 'bg-[#ffffff] border-[#a8c2a1] rounded-none text-[#333333] shadow-xs'
                    : activeObservation.sanTier === 'low'
                      ? 'border-2 rounded-xl bg-neutral-950 border-rose-600/80 text-rose-100 ring-1 ring-rose-600/30 shadow-2xl'
                      : activeObservation.sanTier === 'mid'
                        ? 'border-2 rounded-xl bg-neutral-950 border-amber-600/80 text-amber-100 shadow-2xl'
                        : 'border-2 rounded-xl bg-neutral-950 border-cyan-700/80 text-cyan-50 shadow-2xl'
                }`}
              >
                {/* Header */}
                <div className={`flex items-center justify-between border-b pb-2 ${
                  isRetro ? 'border-[#c8d8c3]' : 'border-neutral-800'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 border shrink-0 ${
                      isRetro
                        ? 'bg-[#eef5ec] border-[#83ab79] text-[#1f4717] rounded-none'
                        : activeObservation.sanTier === 'low'
                          ? 'rounded-lg bg-rose-950 border-rose-700 text-rose-400'
                          : activeObservation.sanTier === 'mid'
                            ? 'rounded-lg bg-amber-950 border-amber-700 text-amber-400'
                            : 'rounded-lg bg-cyan-950 border-cyan-700 text-cyan-300'
                    }`}>
                      {activeObservation.snippet.sensory === 'sound' ? (
                        <Volume2 className="w-4 h-4" />
                      ) : activeObservation.snippet.sensory === 'smell' ? (
                        <Wind className="w-4 h-4" />
                      ) : activeObservation.snippet.sensory === 'sight' ? (
                        <Eye className="w-4 h-4" />
                      ) : activeObservation.snippet.sensory === 'touch' ? (
                        <Sparkles className="w-4 h-4" />
                      ) : (
                        <Radio className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 border ${
                          isRetro
                            ? 'bg-[#ffffff] border-[#c8d8c3] text-[#1f4717] rounded-none'
                            : 'rounded bg-neutral-900 border-neutral-700/60 text-amber-400'
                        }`}>
                          {activeObservation.sanLabel}
                        </span>
                        <span className={`text-[9px] font-serif ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>
                          現場感知洞察
                        </span>
                      </div>
                      <h4 className={`text-xs sm:text-sm font-bold font-serif truncate ${
                        isRetro ? 'text-[#1a3964]' : 'text-neutral-100'
                      }`}>
                        【{activeObservation.snippet.title}】
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={handleObserveEnvironment}
                      className={`text-[10px] px-2 py-1 flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                        isRetro
                          ? 'bg-[#ffffff] hover:bg-[#eef5ec] border border-[#a8c2a1] text-[#1a3964] rounded-none'
                          : 'rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-neutral-100 shadow-sm'
                      }`}
                      title="重新感知周遭環境"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>重感</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveObservation(null);
                        setMobileTab('scene');
                      }}
                      className={`text-[11px] px-2 py-1 flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                        isRetro
                          ? 'retro-web-btn text-[#444444]'
                          : 'rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-neutral-300 hover:text-neutral-100 shadow-sm'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>關閉</span>
                    </button>
                  </div>
                </div>

                {/* Inspect Narrative Text */}
                <div className={`p-2.5 text-xs font-serif leading-relaxed space-y-1.5 ${
                  isRetro
                    ? 'bg-[#f7faf5] border border-[#c8d8c3] rounded-none text-[#333333]'
                    : 'bg-black/60 border border-neutral-800 rounded-xl text-neutral-200'
                }`}>
                  <div className={`border-b pb-1 flex items-center justify-between text-[10px] font-mono ${
                    isRetro ? 'border-[#d8e5d3] text-[#556652]' : 'border-neutral-800/80 text-neutral-400'
                  }`}>
                    <span>感官洞悉紀實：</span>
                    <span className={isRetro ? 'text-[#1f4717] font-bold' : 'text-amber-400'}>{currentLocation.name}</span>
                  </div>
                  <div>
                    <SanityGlitchText text={activeObservation.snippet.description} san={san} />
                  </div>
                </div>

                {/* Right-Side Flashlight Operation Section (現場感知後，於右側操作手電筒探照) */}
                <div className={`p-3 space-y-2.5 shadow-xs border ${
                  isRetro
                    ? 'bg-[#f7faf5] border-[#c8d8c3] rounded-none'
                    : 'border-neutral-800 bg-black/50 rounded-xl'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-1.5 ${
                    isRetro ? 'border-[#c8d8c3]' : 'border-neutral-800/80'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 border ${
                        isRetro
                          ? isFlashlightOn ? 'bg-[#2e6d24] text-[#ffffff] border-[#2e6d24]' : 'bg-[#eef5ec] text-[#2e6d24] border-[#a8c2a1]'
                          : isFlashlightOn ? 'rounded bg-amber-400 text-neutral-950 animate-pulse' : 'rounded bg-neutral-800 text-neutral-400'
                      }`}>
                        <Flashlight className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs font-serif font-bold ${
                        isRetro ? 'text-[#1f4717]' : 'text-amber-200'
                      }`}>
                        隨身強光手電筒 • 暗角探照操作
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 border ${
                      isRetro
                        ? 'bg-[#ffffff] border-[#c8d8c3] text-[#556652] rounded-none'
                        : 'rounded bg-neutral-900 border-neutral-700 text-neutral-300'
                    }`}>
                      {isFlashlightOn ? '光束開啟中' : '光束已關閉'}
                    </span>
                  </div>

                  {/* Operation Control Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const next = !isFlashlightOn;
                        setIsFlashlightOn(next);
                        sound.playFlashlightToggle(next);
                      }}
                      className={`flex-1 py-2 px-3 text-xs font-serif font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                        isRetro
                          ? isFlashlightOn
                            ? 'bg-[#3e6634] text-[#ffffff] border border-[#2d4d25] rounded-none'
                            : 'bg-[#ffffff] hover:bg-[#eef5ec] text-[#1f4717] border border-[#a8c2a1] rounded-none'
                          : isFlashlightOn
                            ? 'rounded-lg bg-amber-400 text-neutral-950 border border-amber-300 hover:bg-amber-300 shadow-amber-400/20'
                            : 'rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-200 border border-amber-600/70 hover:border-amber-500'
                      }`}
                    >
                      <Flashlight className={`w-3.5 h-3.5 ${
                        isRetro
                          ? isFlashlightOn ? 'text-[#ffffff]' : 'text-[#2e6d24]'
                          : isFlashlightOn ? 'text-neutral-950' : 'text-amber-400'
                      }`} />
                      <span>{isFlashlightOn ? '關閉強光手電筒' : '🔦 開啟隨身強光手電筒探照'}</span>
                    </button>
                  </div>

                  {/* Illumination Feedback based on Flashlight State */}
                  {isFlashlightOn ? (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      {currentLocId === 'loc_504_interior' && timesEntered504 <= 1 ? (
                        <div className={`p-2.5 text-xs font-serif space-y-1 ${
                          isRetro
                            ? 'bg-[#ffffff] border border-[#c8d8c3] rounded-none text-[#556652]'
                            : 'rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300'
                        }`}>
                          <div className={`flex items-center gap-1.5 font-bold text-[11px] ${
                            isRetro ? 'text-[#1f4717]' : 'text-amber-300'
                          }`}>
                            <Flashlight className="w-3 h-3 animate-pulse" />
                            <span>【504 號房初次照明檢驗】</span>
                          </div>
                          <p className={`text-[11px] leading-relaxed ${isRetro ? 'text-[#666666]' : 'text-neutral-400'}`}>
                            強光光束掃過 504 號房的衣櫃、床底與四面牆角，光線下只照見尋常家具與一層薄灰，未照出任何隱蔽異常或刻痕。
                          </p>
                        </div>
                      ) : LOCATION_HIDDEN_TRACES[currentLocId] ? (
                        <div className={`p-2.5 border space-y-2 text-xs font-serif ${
                          isRetro
                            ? 'bg-[#ffffff] border-[#a8c2a1] rounded-none shadow-xs'
                            : 'rounded-lg bg-amber-950/40 border-amber-500/70'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-bold flex items-center gap-1.5 text-[11px] ${
                              isRetro ? 'text-[#1a3964]' : 'text-amber-300'
                            }`}>
                              <Search className="w-3.5 h-3.5 text-[#2e6d24]" />
                              <span>【暗角探查發現】{LOCATION_HIDDEN_TRACES[currentLocId].name}</span>
                            </span>
                            {discoveredHiddenTraces.includes(LOCATION_HIDDEN_TRACES[currentLocId].id) ? (
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 border flex items-center gap-0.5 ${
                                isRetro
                                  ? 'bg-[#eef5ec] border-[#8eb584] text-[#2e6d24] rounded-none'
                                  : 'rounded bg-emerald-950 border-emerald-700/60 text-emerald-400'
                              }`}>
                                <CheckCircle2 className="w-2.5 h-2.5" /> 已記錄
                              </span>
                            ) : (
                              <span className={`text-[9px] font-mono animate-pulse px-1.5 py-0.2 border ${
                                isRetro
                                  ? 'bg-[#fff4e8] border-[#f0b57a] text-[#b85b14] rounded-none'
                                  : 'rounded bg-amber-950 border-amber-600 text-amber-400'
                              }`}>
                                新痕跡！
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] leading-relaxed ${
                            isRetro ? 'text-[#333333]' : 'text-neutral-200'
                          }`}>
                            {LOCATION_HIDDEN_TRACES[currentLocId].traceSnippet}
                          </p>
                          <button
                            onClick={handleInspectFlashlightTrace}
                            className={`w-full py-1.5 px-3 font-bold text-xs font-serif flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                              isRetro
                                ? 'bg-[#3e6634] hover:bg-[#33552a] text-[#ffffff] border border-[#2d4d25] rounded-none'
                                : 'rounded-lg bg-amber-600 hover:bg-amber-500 text-neutral-950 shadow'
                            }`}
                          >
                            <Search className="w-3 h-3" />
                            <span>深入勘驗暗角細節並登錄物證</span>
                          </button>
                        </div>
                      ) : (
                        <div className={`p-2 border text-[11px] font-serif flex items-center gap-2 ${
                          isRetro
                            ? 'bg-[#ffffff] border-[#c8d8c3] text-[#556652] rounded-none'
                            : 'rounded-lg bg-neutral-950/60 border-neutral-800 text-neutral-400'
                        }`}>
                          <Flashlight className={`w-3.5 h-3.5 shrink-0 ${isRetro ? 'text-[#2e6d24]' : 'text-amber-400/80'}`} />
                          <span>強光光束照射四周死角與天花板縫隙，現場無額外的隱蔽暗記。</span>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className={`p-2 border text-[11px] font-serif flex items-center justify-between ${
                      isRetro
                        ? 'bg-[#ffffff] border-[#c8d8c3] text-[#556652] rounded-none'
                        : 'rounded-lg bg-neutral-950/60 border border-dashed border-neutral-800 text-neutral-400'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <Eye className={`w-3.5 h-3.5 ${isRetro ? 'text-[#2e6d24]' : 'text-amber-400/70'}`} />
                        <span>死角微光閃爍，可開啟強光手電筒探測。</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Detective Intuition Check on Observation */}
                {(() => {
                  const intuition = getDetectiveIntuition(
                    `${activeObservation.snippet.title} ${activeObservation.snippet.description}`,
                    obtainedRules,
                    inventory,
                    completedWeek1
                  );
                  if (!intuition) return null;
                  return (
                    <div className={`p-2.5 border text-xs font-serif flex items-start gap-2 shadow-xs ${
                      isRetro
                        ? 'bg-[#ffffff] border-[#c8d8c3] text-[#1f4717] rounded-none'
                        : intuition.type === 'contradiction'
                          ? 'rounded-xl bg-rose-950/40 border-rose-800/70 text-rose-300'
                          : 'rounded-xl bg-amber-950/40 border-amber-800/70 text-amber-300'
                    }`}>
                      <Brain className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-[11px] font-mono">
                          {intuition.type === 'contradiction' ? '⚠️ 【偵探直覺・矛盾指引】' : '💡 【偵探直覺・規約聯想】'}
                        </div>
                        <p className="leading-relaxed text-[11px] italic">{intuition.text}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Status Indicator */}
                <div className={`p-2 border text-[11px] font-serif flex items-center justify-between ${
                  isRetro
                    ? 'bg-[#f7faf5] border-[#c8d8c3] text-[#556652] rounded-none'
                    : 'rounded-lg bg-neutral-900/70 border-neutral-800 text-neutral-400'
                }`}>
                  <span>偵探感知狀態：{san >= 70 ? '意識清醒敏銳' : san >= 40 ? '精神受到壓抑' : '意識瀕臨混亂'}</span>
                  <span className={`font-mono font-bold ${isRetro ? 'text-[#1f4717]' : 'text-amber-400'}`}>
                    {san >= 70 ? '理智穩定' : san >= 40 ? '意志緊繃' : '瀕臨極限'}
                  </span>
                </div>
              </motion.div>
            ) : activeHiddenTraceFeedback ? (
              <motion.div
                key="active_hidden_trace"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`p-3.5 md:p-4 space-y-3 shrink-0 ${
                  isRetro
                    ? 'bg-[#ffffff] border border-[#a8c2a1] rounded-none text-[#333333] shadow-xs'
                    : 'bg-neutral-950 border-2 border-amber-500/80 rounded-xl shadow-2xl'
                }`}
              >
                {/* Header */}
                <div className={`flex items-center justify-between border-b pb-2 ${
                  isRetro ? 'border-[#c8d8c3]' : 'border-neutral-800'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 border shrink-0 ${
                      isRetro
                        ? 'bg-[#eef5ec] border-[#83ab79] text-[#1f4717] rounded-none'
                        : 'rounded-lg bg-amber-950 border border-amber-500 text-amber-400 animate-pulse'
                    }`}>
                      <Flashlight className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 border ${
                          isRetro
                            ? 'bg-[#ffffff] border-[#c8d8c3] text-[#1f4717] rounded-none'
                            : 'rounded bg-amber-950/80 border-amber-600/60 text-amber-400'
                        }`}>
                          手電筒強光勘查
                        </span>
                        <span className={`text-[9px] font-serif flex items-center gap-0.5 ${
                          isRetro ? 'text-[#2e6d24]' : 'text-emerald-400'
                        }`}>
                          <CheckCircle2 className="w-2.5 h-2.5" /> 已納入檔案
                        </span>
                      </div>
                      <h4 className={`text-xs sm:text-sm font-bold font-serif truncate ${
                        isRetro ? 'text-[#1a3964]' : 'text-neutral-100'
                      }`}>
                        【{activeHiddenTraceFeedback.title}】
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveHiddenTraceFeedback(null);
                      setMobileTab('scene');
                    }}
                    className={`text-[11px] px-2.5 py-1 flex items-center gap-1 shrink-0 ml-2 shadow-xs transition-all cursor-pointer ${
                      isRetro
                        ? 'retro-web-btn text-[#444444]'
                        : 'rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-neutral-300 hover:text-neutral-100 shadow-sm'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>關閉鑑識</span>
                  </button>
                </div>

                {/* Visual Flashlight Spotlight Peep-Hole Simulation */}
                <div className="relative h-44 rounded-xl bg-[#080605] border-2 border-[#422915] overflow-hidden flex items-center justify-center p-3 select-none shadow-inner">
                  {/* Surrounding Pitch Darkness Vignette */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.95)_75%)] z-10 pointer-events-none" />

                  {/* Concentrated Spotlight Beam */}
                  <div className="absolute w-56 h-56 rounded-full bg-amber-200/20 blur-xl pointer-events-none animate-pulse" />

                  {/* Visual Physical Evidence Feature In-situ */}
                  <div className="relative z-0 text-center space-y-2 max-w-sm p-3 bg-[#1c1209]/80 rounded-lg border border-amber-600/50 backdrop-blur-xs">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                      <Flashlight className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                      <span>【強光聚焦透視】：{activeHiddenTraceFeedback.title}</span>
                    </div>

                    {/* Physical Trace Graphics Representation */}
                    <div className="p-2 bg-black/70 rounded border border-amber-800/60 text-left font-serif text-[11px] text-amber-100/90 leading-relaxed">
                      {activeHiddenTraceFeedback.id === 'trace_504_wallpaper_hole' ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-amber-400/80 border-b border-amber-900 pb-0.5">
                            <span>WALLPAPER SEAM // 壁紙縫隙底層</span>
                            <span className="text-red-400 font-bold">4處生鏽釘孔</span>
                          </div>
                          <p>
                            光束穿透微翹的發黃壁紙底層：四個對稱分布的鏽蝕金屬膨脹螺絲孔在光柱下清晰畢現，孔距精準吻合 1998 年四樓走廊的規格門牌！
                          </p>
                        </div>
                      ) : activeHiddenTraceFeedback.id === 'trace_4f_ink_tendrils' ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-red-400/80 border-b border-red-950 pb-0.5">
                            <span>CONCRETE CRACK // 水泥夾層裂隙</span>
                            <span className="text-red-300 font-bold">打字機微雕墨痕</span>
                          </div>
                          <p>
                            手電筒光斑聚焦在牆面深處：縫隙內不是自然污漬，而是微縮密集的打字機排印文字，如神經絡般深植於鋼筋水泥之中。
                          </p>
                        </div>
                      ) : (
                        <p>{activeHiddenTraceFeedback.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inspect Narrative Text */}
                <div className={`p-2.5 text-xs font-serif leading-relaxed space-y-1.5 ${
                  isRetro
                    ? 'bg-[#f7faf5] border border-[#c8d8c3] rounded-none text-[#333333]'
                    : 'bg-black/60 border border-neutral-800 rounded-xl text-neutral-200'
                }`}>
                  <div className={`border-b pb-1 flex items-center justify-between text-[10px] font-mono ${
                    isRetro ? 'border-[#d8e5d3] text-[#556652]' : 'border-neutral-800/80 text-neutral-400'
                  }`}>
                    <span>暗角隱蔽痕跡鑑識：</span>
                    <span className={isRetro ? 'text-[#1f4717] font-bold' : 'text-amber-400'}>{currentLocation.name}</span>
                  </div>
                  <div>
                    <SanityGlitchText text={activeHiddenTraceFeedback.description} san={san} />
                  </div>
                </div>

                {/* Action Feedback Box */}
                <div className={`p-2.5 border text-xs font-serif leading-relaxed space-y-1 ${
                  isRetro
                    ? 'bg-[#f7faf5] border-[#c8d8c3] text-[#556652] rounded-none'
                    : 'rounded-xl bg-amber-950/20 border-amber-800/60 text-amber-200'
                }`}>
                  <div className={`font-bold font-mono text-[10px] ${isRetro ? 'text-[#1f4717]' : 'text-amber-400'}`}>
                    【物證檔案登錄】：
                  </div>
                  <p className={`text-[11px] ${isRetro ? 'text-[#333333]' : 'text-neutral-300'}`}>
                    此暗角痕跡已記錄於刑偵調查筆記本，強光照射排除了陰影干擾，精神稍獲平復。
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className={`h-full min-h-[260px] flex flex-col items-center justify-center p-6 border text-center space-y-3 ${
                isRetro
                  ? 'bg-[#ffffff] border-[#a8c2a1] rounded-none shadow-xs'
                  : 'rounded-xl bg-neutral-900/60 border-dashed border-neutral-800'
              }`}>
                <div className={`p-3 border ${
                  isRetro
                    ? 'bg-[#eef5ec] border-[#a8c2a1] text-[#1f4717] rounded-none'
                    : 'rounded-2xl bg-neutral-950 border-neutral-800 text-neutral-500'
                }`}>
                  <Search className={`w-6 h-6 ${isRetro ? 'text-[#1f4717]' : 'text-amber-500/60'}`} />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className={`text-sm font-bold font-serif ${isRetro ? 'text-[#1a3964]' : 'text-neutral-200'}`}>
                    現場物件鑑識桌
                  </h4>
                  <p className={`text-xs font-serif leading-relaxed ${isRetro ? 'text-[#556652]' : 'text-neutral-400'}`}>
                    在現場搜查中點選物件、觸發【現場感知】或使用【手電筒暗角探查】，結果皆會即時呈現於此進行深入檢視與物證研判。
                  </p>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setMobileTab('scene');
                  }}
                  className={`lg:hidden px-3.5 py-1.5 border text-xs font-serif font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                    isRetro
                      ? 'bg-[#3e6634] hover:bg-[#33552a] text-[#ffffff] border-[#2d4d25] rounded-none'
                      : 'rounded-lg bg-amber-950/80 hover:bg-amber-900 border-amber-600 text-amber-200 shadow-md'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>前往選擇現場搜查物件 ({activeHotspots.length})</span>
                </button>
                <div className={`text-[11px] font-mono px-3 py-1.5 border ${
                  isRetro
                    ? 'bg-[#f7faf5] border-[#c8d8c3] text-[#556652] rounded-none'
                    : 'rounded-lg bg-black/40 border-neutral-800/80 text-neutral-500'
                }`}>
                  頂部工具列：凝神感知 • 手電筒
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Screen Glitch / Light Flickering Overlay when Anomaly triggers */}
      <AnimatePresence>
        {isFlickeringEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0.2, 0.95, 0.1, 0.7, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1] }}
            className="fixed inset-0 z-40 pointer-events-none bg-black mix-blend-multiply flex items-center justify-center transition-opacity duration-300"
            style={{ opacity: reduceEffects ? 0.3 : 1 }}
          >
            <div className="absolute inset-0 bg-red-950/20 mix-blend-color-dodge" />
            <div className="text-red-500/40 font-mono text-sm tracking-widest animate-pulse uppercase">
              // WARNING: AMBIENT COGNITIVE VOLTAGE DISTORTION //
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rare Sensory Visual & Auditory Anomaly Overlays (血紅走廊、異常敲門聲、牆面血字、時空停滯、無臉倒影) */}
      <AnimatePresence>
        {activeRareVisualEffect && (
          <motion.div
            key={activeRareVisualEffect.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden transition-opacity duration-300"
            style={{ opacity: reduceEffects ? 0.3 : 1 }}
          >
            {/* 1. Blood-Red Corridor Lighting Effect (走廊燈光瞬間轉為血紅色) */}
            {activeRareVisualEffect.type === 'blood_red_corridor' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.95, 0.75, 1, 0.85, 0.95, 0] }}
                transition={{ duration: 2.4, times: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1] }}
                className="absolute inset-0 bg-red-950/85 mix-blend-color-burn flex flex-col items-center justify-center p-6"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-900/60 to-red-950 opacity-90" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_15%,_rgba(185,28,28,0.85)_100%)] animate-pulse" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] opacity-75" />

                <motion.div 
                  initial={{ scale: 0.9, y: 10 }}
                  animate={{ scale: [0.95, 1.05, 1], y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10 text-center space-y-3 max-w-lg"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/90 border border-red-500/80 text-red-100 font-mono text-xs uppercase tracking-widest animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                    <Zap className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                    <span>// CRITICAL ILLUMINATION MUTATION: BLOOD-RED //</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-serif text-red-100 tracking-wider drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                    走廊燈光瞬間轉為刺目血紅
                  </h2>
                  <p className="text-sm font-serif text-red-200/95 leading-relaxed italic bg-black/75 p-3.5 rounded-xl border border-red-800/80 shadow-2xl">
                    {activeRareVisualEffect.quote}
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* 2. Ominous Distant Knocking Sequence & Camera Shake (遠處傳來異常敲門聲) */}
            {activeRareVisualEffect.type === 'ominous_distant_knocking' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 1, 0.85, 1, 0.9, 0],
                  x: [0, -5, 5, -4, 4, -2, 0],
                  y: [0, 3, -4, 3, -3, 1, 0]
                }}
                transition={{ duration: 2.7, times: [0, 0.12, 0.35, 0.6, 0.85, 1] }}
                className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 backdrop-blur-[1px]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(220,38,38,0.3)_0%,_transparent_70%)]" />
                
                {/* Ghostly Pulsing Door Silhouette */}
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ 
                    scale: [0.85, 1.08, 0.98, 1.05, 1],
                    opacity: [0, 0.9, 0.6, 0.95, 0]
                  }}
                  transition={{ duration: 2.7 }}
                  className="w-44 h-72 rounded-t-2xl border-4 border-red-700/80 bg-neutral-950/85 shadow-[0_0_60px_rgba(220,38,38,0.7)] relative flex flex-col items-center justify-center mb-4 overflow-hidden"
                >
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-red-500 bg-red-950 animate-ping" />
                  <div className="text-center font-mono text-xs text-red-500/90 tracking-widest font-bold">
                    ROOM 404
                    <div className="text-[10px] text-red-300 mt-1">DO NOT OPEN</div>
                  </div>
                  {/* Knock sound wave ripple */}
                  <div className="absolute inset-0 border-2 border-red-500/40 rounded-t-2xl animate-ping" />
                </motion.div>

                <div className="relative z-10 text-center space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/95 border border-red-800 text-red-300 font-mono text-xs tracking-wider shadow-lg">
                    <DoorClosed className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    <span>【異常重度敲擊回音】</span>
                  </div>
                  <h3 className="text-xl font-bold font-serif text-neutral-100 tracking-wider">
                    遠處傳來異常急促的敲門聲
                  </h3>
                  <p className="text-xs font-serif text-red-300/90 italic bg-neutral-950/90 px-4 py-2 rounded-lg border border-red-900/60 shadow-xl">
                    {activeRareVisualEffect.quote}
                  </p>
                </div>
              </motion.div>
            )}

            {/* 3. Inverted Bleeding Matrix Text (牆面浮現狂亂血字與禁忌規則) */}
            {activeRareVisualEffect.type === 'wall_bleeding_text' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.95, 0.5, 0.95, 0] }}
                transition={{ duration: 2.3 }}
                className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-6"
              >
                <div className="absolute inset-0 opacity-40 mix-blend-screen overflow-hidden font-mono text-xs text-red-500/80 leading-tight select-none pointer-events-none p-4 flex flex-wrap gap-4">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} className="animate-pulse" style={{ animationDelay: `${(i % 6) * 0.12}s` }}>
                      404_NOT_FOUND // 絕無四樓 // 不要回應低語 // 遵守巡邏點名規則 //
                    </div>
                  ))}
                </div>

                <div className="relative z-10 text-center space-y-3 max-w-lg bg-neutral-950/95 p-6 rounded-2xl border-2 border-red-700/80 shadow-[0_0_45px_rgba(185,28,28,0.6)]">
                  <div className="text-xs font-mono text-red-400 uppercase tracking-widest flex items-center justify-center gap-2">
                    <FileWarning className="w-4 h-4 text-red-500 animate-spin" />
                    <span>// COGNITIVE TEXT INFILTRATION //</span>
                  </div>
                  <h3 className="text-xl font-bold font-serif text-neutral-100">
                    水泥牆縫滲出狂亂血字與禁忌條文
                  </h3>
                  <p className="text-xs font-serif text-red-300 italic border-l-2 border-red-600 pl-3 text-left">
                    {activeRareVisualEffect.description}
                  </p>
                </div>
              </motion.div>
            )}

            {/* 4. Temporal Stutter & Clock Rewind VHS Noise (走廊時空停滯與秒針逆轉) */}
            {activeRareVisualEffect.type === 'temporal_rewind_stutter' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.95, 0.7, 0.95, 0] }}
                transition={{ duration: 2.2 }}
                className="absolute inset-0 bg-neutral-950/90 filter grayscale contrast-150 flex flex-col items-center justify-center p-6"
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.8)_50%,rgba(0,0,0,0.8))] bg-[length:100%_4px] pointer-events-none opacity-80" />
                <motion.div
                  animate={{ rotate: [0, -720] }}
                  transition={{ duration: 2.2, ease: "linear" }}
                  className="w-32 h-32 rounded-full border-4 border-neutral-300 flex items-center justify-center relative mb-4 shadow-[0_0_35px_rgba(255,255,255,0.4)]"
                >
                  <Clock className="w-16 h-16 text-neutral-200" />
                  <div className="absolute top-2 text-[10px] font-mono text-neutral-400">REWIND</div>
                </motion.div>

                <div className="relative z-10 text-center space-y-2 max-w-md bg-black/95 p-4 rounded-xl border border-neutral-600 shadow-2xl">
                  <div className="text-xs font-mono text-neutral-300 uppercase tracking-widest">
                    [ TEMPORAL DISTORTION DETECTED ]
                  </div>
                  <h3 className="text-lg font-bold font-serif text-white">
                    梯廳掛鐘指針瘋狂逆轉與時空停滯
                  </h3>
                  <p className="text-xs font-serif text-neutral-300 italic">
                    {activeRareVisualEffect.quote}
                  </p>
                </div>
              </motion.div>
            )}

            {/* 5. Faceless Silhouette Reflection in Puddle (轉角水窪無臉倒影) */}
            {activeRareVisualEffect.type === 'faceless_shadow_gaze' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.92, 0.65, 0.95, 0] }}
                transition={{ duration: 2.4 }}
                className="absolute inset-0 bg-neutral-950/85 flex flex-col items-center justify-center p-6 backdrop-blur-[2px]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(30,58,138,0.5)_0%,_transparent_70%)]" />
                
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: [0.9, 1.06, 1], opacity: [0, 0.9, 0] }}
                  transition={{ duration: 2.4 }}
                  className="w-40 h-40 rounded-full border-2 border-cyan-800/60 bg-neutral-900/90 shadow-[0_0_45px_rgba(6,182,212,0.35)] flex flex-col items-center justify-center mb-4 relative overflow-hidden"
                >
                  <div className="w-16 h-20 bg-neutral-200/90 rounded-full shadow-inner relative flex items-center justify-center">
                    <div className="text-[9px] font-mono text-neutral-500">NO FACE</div>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 mt-2 font-bold">REFLECTION</div>
                </motion.div>

                <div className="relative z-10 text-center space-y-2 max-w-md bg-neutral-950/95 p-4 rounded-xl border border-cyan-900/80 shadow-2xl">
                  <div className="text-xs font-mono text-cyan-400 tracking-wider">
                    【水窪異常倒影凝視】
                  </div>
                  <h3 className="text-lg font-bold font-serif text-neutral-100">
                    轉角水窪倒映出無臉白衣輪廓
                  </h3>
                  <p className="text-xs font-serif text-neutral-300 italic">
                    {activeRareVisualEffect.quote}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transient Building Anomaly Phenomenon Alert Toast / Floating Banner */}
      <AnimatePresence>
        {transitAnomalyAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-28 sm:top-32 left-1/2 -translate-x-1/2 z-[70] w-full max-w-xl px-4 pointer-events-auto"
          >
            <div className="p-4 rounded-2xl bg-neutral-950/95 border-2 border-red-800/80 shadow-2xl backdrop-blur-md text-neutral-200 relative overflow-hidden space-y-2">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>【大樓移動突發異象】• 心理壓力衝擊</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-700/80 text-red-300 font-serif text-[11px]">
                    心神受擾
                  </span>
                  <button
                    onClick={() => setTransitAnomalyAlert(null)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 text-xs"
                    title="關閉提示"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold font-serif text-neutral-100 flex items-center gap-1.5">
                  <span className="text-rose-400">❖</span> {transitAnomalyAlert.title}
                </h4>
                <p className="text-xs text-neutral-300 font-serif leading-relaxed mt-1">
                  {transitAnomalyAlert.description}
                </p>
                {transitAnomalyAlert.quote && (
                  <p className="text-[11px] text-red-400/90 italic font-serif mt-1 pl-2 border-l-2 border-red-600">
                    {transitAnomalyAlert.quote}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transit Floor Selection Modal (Triggered by Elevator or U-Stairs button) */}
      <AnimatePresence>
        {activeTransitMode && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 font-sans select-none">
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 5 }}
              className="retro-forum-modal-window max-w-xl w-full shadow-xl overflow-hidden text-[#333333]"
            >
              {/* Header */}
              <div className="retro-forum-window-header shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeTransitMode === 'elevator' ? <Sliders className="w-4 h-4 text-[#ffffff]" /> : <Layers className="w-4 h-4 text-[#ffffff]" />}
                  <span className="font-bold text-xs sm:text-sm tracking-wide">
                    {activeTransitMode === 'elevator' ? '【公共客用電梯】— 選擇移動目標樓層' : '【U字形兩段式水泥樓梯】— 選擇移動目標樓層'}
                  </span>
                </div>

                <button
                  onClick={() => setActiveTransitMode(null)}
                  className="retro-forum-close-btn flex items-center justify-center cursor-pointer"
                  title="關閉"
                >
                  <X className="w-3 h-3 text-[#333333]" />
                </button>
              </div>

              <div className="p-5 bg-[#f7faf5] space-y-4">
                {transitAnimationText ? (
                  <div className="py-8 text-center space-y-4 bg-[#ffffff] border border-[#a8c2a1] rounded-xs shadow-2xs">
                    <div className="w-10 h-10 rounded-full border-3 border-[#a8c2a1] border-t-[#2e6d24] animate-spin mx-auto" />
                    <p className="text-xs sm:text-sm font-bold text-[#1f4717] max-w-sm mx-auto leading-relaxed animate-pulse">
                      {transitAnimationText}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-[#556652]">
                      {activeTransitMode === 'elevator'
                        ? '老舊金屬車廂，燈光發綠。你打算前往……'
                        : '水泥砌成的雙跑折返式樓梯，兩側是泛黃扶手。你打算前往……'}
                    </p>

                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                      {transitDestinations.map((dest) => {
                        const isCurrent = dest.id === currentLocId;
                        const { isBlocked, blockReason } = getTransitBlockStatus(activeTransitMode, dest.id);
                        const isEmergencyEscape = san < 25 && !isBlocked && !isCurrent;
                        const isMetalPlate = Boolean((dest as any).isMetalPlate || (activeTransitMode === 'elevator' && dest.id === 'loc_4f_hidden' && !is4FLateGameUnlocked));

                        return (
                          <button
                            key={dest.id}
                            disabled={isCurrent || isBlocked}
                            onClick={() => handleTransitToFloor(activeTransitMode, dest.id)}
                            className={`w-full p-3 rounded-xs border text-left transition-all flex items-center justify-between shadow-2xs ${
                              isCurrent
                                ? 'bg-[#f0f4ee] border-[#c5d8c1] text-[#889988] cursor-default'
                                : isMetalPlate
                                  ? 'bg-[#f4f5f6] border-[#cbd2d8] text-[#55606a] cursor-not-allowed'
                                  : isBlocked
                                    ? 'bg-[#fdf2f2] border-[#e2b1b1] text-[#9c5555] cursor-not-allowed'
                                    : isEmergencyEscape
                                      ? 'bg-[#eef8ed] hover:bg-[#e4f4e2] border-[#4b9140] text-[#1f4717] cursor-pointer'
                                      : 'bg-[#ffffff] hover:bg-[#f2f7f0] border-[#a8c2a1] text-[#333333] cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              {isMetalPlate ? (
                                <div
                                  className="w-8 h-8 rounded-xs relative shrink-0 border border-[#3b4349] bg-gradient-to-br from-[#9aa3ab] via-[#6f7882] to-[#4b545d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),inset_0_-1px_1.5px_rgba(0,0,0,0.65),0_1px_2px_rgba(0,0,0,0.2)] flex flex-col justify-between p-1 select-none"
                                  title="封死金屬盲板（無按鈕）"
                                >
                                  {/* Top Screws */}
                                  <div className="flex justify-between w-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#2a3036] border-[0.5px] border-[#8e98a3] shadow-inner flex items-center justify-center">
                                      <div className="w-1 h-[0.5px] bg-[#616a73]" />
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#2a3036] border-[0.5px] border-[#8e98a3] shadow-inner flex items-center justify-center">
                                      <div className="w-1 h-[0.5px] bg-[#616a73]" />
                                    </div>
                                  </div>
                                  {/* Center Subtle Metal Seam / Blanking Line */}
                                  <div className="w-4 h-[1px] bg-[#3a4147] mx-auto opacity-70 shadow-[0_0.5px_0_rgba(255,255,255,0.25)]" />
                                  {/* Bottom Screws */}
                                  <div className="flex justify-between w-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#2a3036] border-[0.5px] border-[#8e98a3] shadow-inner flex items-center justify-center">
                                      <div className="w-1 h-[0.5px] bg-[#616a73]" />
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#2a3036] border-[0.5px] border-[#8e98a3] shadow-inner flex items-center justify-center">
                                      <div className="w-1 h-[0.5px] bg-[#616a73]" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className={`w-8 h-8 rounded-xs flex items-center justify-center font-mono text-xs font-bold shrink-0 border ${
                                  isCurrent 
                                    ? 'bg-[#e8ece6] text-[#889988] border-[#c5d8c1]' 
                                    : isBlocked 
                                      ? 'bg-[#f7d7d7] text-[#9c2e2e] border-[#e2b1b1]' 
                                      : isEmergencyEscape
                                        ? 'bg-[#eef8ed] text-[#1f4717] border-[#4b9140] animate-pulse'
                                        : 'bg-[#e8f0e5] text-[#1f4717] border-[#a8c2a1]'
                                }`}>
                                  {dest.floor}
                                </div>
                              )}

                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold text-xs md:text-sm ${isMetalPlate ? 'text-[#38434f]' : 'text-[#1a3964]'}`}>
                                    {dest.name} {isCurrent && '(目前位置)'}
                                  </span>
                                  {isEmergencyEscape && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-[#eef8ed] border border-[#4b9140] text-[#1f4717] font-bold shrink-0">
                                      緊急生路
                                    </span>
                                  )}
                                </div>
                                {isBlocked && (
                                  <div className={`text-[11px] truncate font-sans ${isMetalPlate ? 'text-[#697682]' : 'text-[#b8502a]'}`}>
                                    {blockReason}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0 ml-2">
                              {isMetalPlate ? (
                                <Lock className="w-4 h-4 text-[#75808b]" />
                              ) : isBlocked ? (
                                <Lock className="w-4 h-4 text-[#b8502a]" />
                              ) : isCurrent ? (
                                <span className="text-[10px] font-mono text-[#889988]">當前</span>
                              ) : isEmergencyEscape ? (
                                <ChevronRight className="w-4 h-4 text-[#1f4717] animate-pulse" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-[#556652]" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setActiveTransitMode(null)}
                      className="w-full py-2 rounded-xs bg-[#ffffff] hover:bg-[#f4f8f2] border border-[#a8c2a1] text-[#333333] text-xs font-bold transition-all shadow-2xs text-center cursor-pointer mt-2"
                    >
                      留在目前位置（關閉）
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* First 4F Experience Modal (Triggered on leaving 504) */}
      <AnimatePresence>
        {showFirst4FModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            {/* Forced low-SAN distortion & chromatic aberration effect overlays */}
            <div className="absolute inset-0 pointer-events-none bg-red-950/20 mix-blend-color-dodge animate-pulse z-0" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-red-950/30 to-black z-0" />
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,0,0,0.5)_51%)] bg-[length:100%_4px] z-0" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border-2 border-red-700 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 text-neutral-200 relative overflow-hidden z-10"
            >
              {/* Pulsing scarlet background flare */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 animate-pulse" />
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-900/30 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start gap-4 border-b border-neutral-800 pb-4">
                <div className="p-3 rounded-xl bg-red-950/90 border border-red-600 text-red-400 shrink-0 shadow-lg shadow-red-950/50 animate-pulse">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-mono text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    COGNITIVE DISTORTION // 空間認知異變
                  </div>
                  <h3 className="text-xl font-bold font-serif text-neutral-100 mt-1">
                    走出 504 號房……墜入未知的「四樓」！
                  </h3>
                  <p className="text-xs text-neutral-400 font-serif mt-0.5">
                    安祥路88號 • 隱藏的第四層走廊
                  </p>
                </div>
              </div>

              {/* Story Narrative Text */}
              <div className="space-y-3 text-neutral-300 font-serif text-sm leading-relaxed bg-neutral-950/70 p-5 rounded-xl border border-neutral-800">
                <p>
                  你轉動門把走出 504 號房回到走廊。然而當你抬頭看向走廊牆面的樓層標牌時，心跳猛然漏了一拍——原本該是綠色標牌的位置，赫然變成了鮮血般刺目的<span className="text-red-400 font-bold">『4F』</span>！
                </p>
                <p>
                  走廊兩側的房門標牌不知何時變成了 401 至 405 號，走廊盡頭 <span className="text-amber-400 font-bold">404 號房</span> 的門縫正瘋狂噴湧出寫滿字句的紙條，伴隨著震耳欲聾的打字機敲擊聲！這棟樓竟真的存在著第四層！
                </p>
                <p className="text-rose-300 border-l-2 border-rose-600 pl-3 py-0.5">
                  此時，走廊深處幽幽走來一名身穿<span className="font-bold text-red-400">【紅色外套與黑長褲】</span>的男子，嘴角咧著僵硬的假笑，聲音空洞發木：<br />
                  <span className="italic">「電梯故障了正在檢修，先生若要下樓，請走旁邊的樓梯吧……」</span>
                </p>

                {/* Sound effect synchronization banner */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-950/60 border border-red-800/80 mt-2">
                  <div className="flex items-center gap-2 text-xs font-serif text-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>【異象音效同步】：走廊盡頭 404 門縫深處正傳來瘋狂轟鳴的打字機聲</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playDeafeningTypewriterFlurry(2.8);
                    }}
                    className="px-2.5 py-1 bg-red-900/80 hover:bg-red-800 border border-red-500 text-red-100 rounded text-xs font-serif flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    重播打字機狂響
                  </button>
                </div>
              </div>

              {/* Action Choices */}
              <div className="space-y-3 pt-2">
                {/* Choice 1: Take Elevator */}
                <div className="text-xs font-semibold text-neutral-400 font-serif pb-1">
                  面對突如其來的紅衣男子與眼前異象，你打算……
                </div>
                <button
                  onClick={() => {
                    setShowFirst4FModal(false);
                    setHasExperiencedFirst4F(true);
                    setCurrentLocId('loc_1f_lobby');
                    sound.playElevatorChime();
                    onModifySan(1);
                    onAddJournalEntry({
                      category: 'action',
                      title: '【首次感知四樓＆驚險逃生】',
                      content: '走出504號房時竟然被拉入不存在的四樓空間，並遭遇了穿紅衣的男子！我迅速衝進電梯逃回一樓大廳。這棟大樓確實隱瞞著四樓的存在！',
                      location: '四樓異常走廊 → 一樓大廳交誼廳',
                      sanDelta: 1
                    });
                    setFirst4FAftermathData({
                      title: '【重大里程碑異象結算】：隱藏的四樓長廊',
                      anomalyName: '踏入不存在的第四層 ── 避險逃生',
                      threatLevel: '【極度危險・空間維度認知異變】',
                      eventRecap: '從504號房走出後，空間發生了驚悚的維度摺疊，原本不存在的四樓走廊與404號房噴湧著字條展現在眼前，並遭遇了身穿紅衣的偽裝男子試圖引導你走入樓梯間。',
                      playerDecision: '保持高度冷靜與警惕，無視紅衣男子的搭話，迅速衝入客用電梯按下一樓關閉鋼門。',
                      decisionOutcome: '你嚴格踐行了「不理會異常紅衣制服」與「利用電梯迅速脫離」的原則。電梯門在男子伸手前重重關閉，將你安全護送回一樓大廳交誼廳。',
                      psychologicalImpact: '心神稍微平復',
                      isSuccess: true,
                      environmentalStatus: '客用電梯平穩降回一樓大廳。走廊標牌重新恢復為綠色，但剛才親歷的四樓景象已徹底證實了安祥路88號大樓存在被抹除的隱藏空間！',
                      ruleCitation: '《住戶規則》第3條明確指出警衛為白衣黑褲；《手寫規則》警告「假裝不知道你知道，若遇異常盡快乘電梯脫離」。'
                    });
                  }}
                  className="w-full p-4 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-700 hover:border-amber-500/80 text-left transition-all group space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-100 group-hover:text-amber-300 font-serif flex items-center gap-2">
                      <DoorClosed className="w-4 h-4 text-neutral-400 group-hover:text-amber-400" />
                      轉身衝向走廊旁的客用電梯，按下「1」樓按鈕
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-transform" />
                  </div>
                  <p className="text-xs text-neutral-400 font-serif pl-6">
                    不理會對方的搭話，迅速撲進電梯，按下「1」樓按鈕並緊閉金屬車門。
                  </p>
                </button>

                {/* Choice 2: Follow Red Coat to Stairs */}
                <button
                  onClick={() => {
                    setShowFirst4FModal(false);
                    setHasExperiencedFirst4F(true);
                    setCurrentLocId('loc_1f_lobby');
                    sound.playGlitch();
                    onModifySan(-10);
                    onAddJournalEntry({
                      category: 'action',
                      title: '【違規探尋＆遭遇怪異追逐】',
                      content: '聽從紅衣男子的指引走向樓梯間，剛踏入轉角便遭到了怪異的瘋狂撲擊！驚險摔回一樓大廳交誼廳，精神受到劇烈衝擊。',
                      location: '四樓異常走廊 → 一樓大廳交誼廳',
                      sanDelta: -10
                    });
                    setFirst4FAftermathData({
                      title: '【重大里程碑異象結算】：隱藏的四樓長廊',
                      anomalyName: '踏入不存在的第四層 ── 違規遇襲',
                      threatLevel: '【極度危險・空間維度認知異變】',
                      eventRecap: '從504號房走出後踏入不存在的四樓，紅衣男子以電梯故障為由引誘你走向陰暗的樓梯間。',
                      playerDecision: '聽從紅衣男子的指引走向水泥安全梯，試圖步行下樓。',
                      decisionOutcome: '剛踏入樓梯間轉角，男子的臉部突然化為無數瘋狂撕扯的打字機紙條！身後響起令人膽寒的追逐聲，你在極度恐慌中連滾帶爬摔回了一樓大廳交誼廳！',
                      psychologicalImpact: '精神受到衝擊',
                      isSuccess: false,
                      environmentalStatus: '你驚魂未定地摔在一樓大廳地板上，身後的樓梯間鐵門重重甩上，暫時隔絕了怪異的追擊。',
                      ruleCitation: '嚴重違規：聽信了身著紅色外套者的言論並踏入未經檢驗的封閉樓梯間。'
                    });
                  }}
                  className="w-full p-4 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-700 hover:border-amber-500/80 text-left transition-all group space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-100 group-hover:text-amber-300 font-serif flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-neutral-400 group-hover:text-amber-400" />
                      聽從男子指引，轉身走向旁邊的樓梯間下樓
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-transform" />
                  </div>
                  <p className="text-xs text-neutral-400 font-serif pl-6">
                    走向旁邊的水泥防火安全梯，沿著折返式階梯步行下樓。
                  </p>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Second 4F Story Trigger Modal (After 2F & 3F with cleaner rule) */}
      <AnimatePresence>
        {showSecond4FModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="absolute inset-0 pointer-events-none bg-red-950/30 mix-blend-color-dodge animate-pulse z-0" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-red-950/40 to-black z-0" />
            <div className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,0,0,0.6)_51%)] bg-[length:100%_4px] z-0" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border-2 border-red-600 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 text-neutral-200 relative overflow-hidden z-10"
            >
              {/* Pulsing scarlet background flare */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 animate-pulse" />
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-900/40 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start gap-4 border-b border-neutral-800 pb-4">
                <div className="p-3 rounded-xl bg-red-950/90 border border-red-500 text-red-400 shrink-0 shadow-lg shadow-red-950/50 animate-pulse">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-mono text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    COGNITIVE DISTORTION II // 第二度墜入不存在的第四層（空間摺疊加劇）
                  </div>
                  <h3 className="text-xl font-bold font-serif text-neutral-100 mt-1">
                    三樓梯廳燈光暴滅……維度再次撕裂，墜入猩紅四樓！
                  </h3>
                  <p className="text-xs text-neutral-400 font-serif mt-0.5">
                    安祥路88號 • 隱藏的第四層走廊（清潔規則與三樓配電箱矛盾引發空間坍縮）
                  </p>
                </div>
              </div>

              {/* Story Narrative Text */}
              <div className="space-y-3 text-neutral-300 font-serif text-sm leading-relaxed bg-neutral-950/70 p-5 rounded-xl border border-neutral-800">
                <p>
                  當你勘驗完二樓李阿姨的《清潔人員工作規則》（明確記載包含四樓在內共五層）、三樓被粗暴撬改塗寫的304門牌、以及標示著『3F/4F 共用照明』的總配電箱後，大樓的物理構造與《住戶規則》產生了無法化解的衝突。
                </p>
                <p>
                  你正要邁入梯廳返回一樓，整層走廊的日光燈突然以驚悚的高頻率連續瘋狂爆閃！天花板深處傳來如巨型金屬機關咬合的刺耳巨響，四周的牆壁彷彿活物般滲出暗紅色的油墨與水漬。
                </p>
                <p>
                  當你踉蹌著扶住牆壁抬頭時，眼前的綠色樓層標牌在一陣電火花中劇烈抽搐，赫然再次變成了滴著鮮血般的<span className="text-red-400 font-bold">【4F】</span>！走廊盡頭 404 號房的大門瘋狂震顫，震耳欲聾的打字機聲如狂風暴雨般轟鳴，無數張鮮紅色的規則紙條如同暴雪般從門縫噴湧而出！
                </p>
                <p className="text-rose-300 border-l-2 border-rose-600 pl-3 py-0.5">
                  走廊兩端死角，一名面部模糊無五官的白衣巡邏身影與那名穿著紅衣的詭異男子，正同時從兩側死角步步逼近……！
                </p>

                {/* Sound effect synchronization banner */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-950/60 border border-red-800/80 mt-2">
                  <div className="flex items-center gap-2 text-xs font-serif text-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>【異象音效同步】：404 房門瘋狂震顫，震耳欲聾的打字機聲與暴雪紙條噴湧</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playDeafeningTypewriterFlurry(3.2);
                    }}
                    className="px-2.5 py-1 bg-red-900/80 hover:bg-red-800 border border-red-500 text-red-100 rounded text-xs font-serif flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    重播打字機狂響
                  </button>
                </div>
              </div>

              {/* Action Choices */}
              <div className="space-y-3 pt-2">
                {/* Choice 1: Escape through fire stairwell */}
                <div className="text-xs font-semibold text-neutral-400 font-serif pb-1">
                  面對兩側逼近的虛影與空間震顫，你打算……
                </div>
                <button
                  onClick={() => {
                    setShowSecond4FModal(false);
                    setHasExperiencedSecond4F(true);
                    setCurrentLocId('loc_1f_lobby');
                    sound.playElevatorChime();
                    onModifySan(2);
                    onAddJournalEntry({
                      category: 'action',
                      title: '【二次墜入四樓＆警衛離奇失蹤】',
                      content: '在二樓與三樓收集完矛盾線索後，走廊再度被拖入四樓異度空間！在紅白雙影逼近下驚險逃回一樓。然而回到大廳交誼廳時，值班台空蕩蕩的，警衛王大偉竟然已經離奇消失，值班簿隨風翻動……！',
                      location: '四樓異常走廊 → 一樓大廳交誼廳',
                      sanDelta: 2
                    });
                    setFirst4FAftermathData({
                      title: '【重大里程碑異象結算】：二度撕裂的四樓長廊',
                      anomalyName: '證實大樓謊言 ── 避險脫身與警衛失蹤',
                      threatLevel: '【極度危險・空間結構連鎖崩解】',
                      eventRecap: '在二樓李阿姨的清潔規則與三樓塗改門牌、共用配電箱的雙重證據下，大樓物理結構崩解，再度將你拖入四樓走廊！走廊兩側同時出現白衣虛影與紅衣男子。',
                      playerDecision: '保持高度冷靜與警惕，無視兩側逼近的虛影，立刻撞開安全梯防火門，一口氣狂奔衝下一樓大廳。',
                      decisionOutcome: '你成功脫離了四樓空間。然而當你跌撞著衝回一樓大廳時，赫然發現警衛王大偉已不在值班台上，警衛室門禁無人看管！',
                      psychologicalImpact: '心神稍微平復，但警衛的消失帶來更深的危機感',
                      isSuccess: true,
                      environmentalStatus: '一樓大廳寒氣逼人，警衛室檯燈亮著，桌上遺落著備用門禁磁扣，木門虛掩。現在正是潛入調查中控主機的唯一契機！',
                      ruleCitation: '《清潔人員工作規則》證實大樓包含四樓共五層；《警衛工作規則》要求警衛不得擅離職守，但王大偉此刻已神秘失蹤。'
                    });
                  }}
                  className="w-full p-4 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-700 hover:border-amber-500/80 text-left transition-all group space-y-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-100 group-hover:text-amber-300 font-serif flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-neutral-400 group-hover:text-amber-400" />
                      咬緊牙關屏住呼吸，無視兩側逼近的身影，撞開安全梯防火門狂奔下樓！
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-transform" />
                  </div>
                  <p className="text-xs text-neutral-400 font-serif pl-6">
                    頂著走廊兩側壓迫而來的陰森氣息，用肩膀撞開沉重的安全梯防火門直奔一樓。
                  </p>
                </button>

                {/* Choice 2: Recklessly charge at 404 door */}
                <button
                  onClick={() => {
                    setShowSecond4FModal(false);
                    setHasExperiencedSecond4F(true);
                    setCurrentLocId('loc_1f_lobby');
                    sound.playGlitch();
                    onModifySan(-12);
                    onAddJournalEntry({
                      category: 'action',
                      title: '【莽撞觸碰404＆精神重創跌落】',
                      content: '在混亂中試圖推開404房門，門縫噴湧出的狂暴字條如利刃般割傷手臂，大腦瞬間被狂暴的機械噪聲填滿！無形巨力將我狠狠掀翻，一路跌滾摔回一樓大廳，精神受到重創！',
                      location: '四樓異常走廊 → 一樓大廳交誼廳',
                      sanDelta: -12
                    });
                    setFirst4FAftermathData({
                      title: '【重大里程碑異象結算】：二度撕裂的四樓長廊',
                      anomalyName: '莽撞衝撞 404 核心 ── 遭遇精神反噬',
                      threatLevel: '【極度危險・空間結構連鎖崩解】',
                      eventRecap: '在二度墜入四樓時，面對兩側逼近的虛影，你試圖直接強行推開404號房門。',
                      playerDecision: '在未獲取完整解讀規約與反向物證前，盲目衝向404房門。',
                      decisionOutcome: '打字機如機關槍般的巨響直貫腦髓，漫天血紅字條爆裂飛散！你被空間斥力重重震飛，連滾帶爬滾回一樓大廳地板上，渾身劇痛！',
                      psychologicalImpact: '精神受到劇烈創傷',
                      isSuccess: false,
                      environmentalStatus: '你痛苦地喘息著趴在一樓大廳。值班台上的警衛王大偉不知何時已經失蹤，只留下一盞孤燈與虛掩的警衛室木門。',
                      ruleCitation: '嚴重警告：在未掌握違章圖紙與破解第四頻道前，接觸404將招致致命認知反噬。'
                    });
                  }}
                  className="w-full p-4 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-700 hover:border-amber-500/80 text-left transition-all group space-y-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-100 group-hover:text-amber-300 font-serif flex items-center gap-2">
                      <DoorClosed className="w-4 h-4 text-neutral-400 group-hover:text-amber-400" />
                      慌亂中撲向 404 房門試圖推門一窺究竟
                    </span>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-transform" />
                  </div>
                  <p className="text-xs text-neutral-400 font-serif pl-6">
                    無視噴湧而出的血紅字條與機械噪聲，試圖用雙手強行推開404號房厚重的木門。
                  </p>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4F Anomaly Post-Event Recap Modal */}
      <AnomalyAftermathModal
        isOpen={Boolean(first4FAftermathData)}
        data={first4FAftermathData}
        unlockedEndings={unlockedEndings}
        onClose={() => {
          setFirst4FAftermathData(null);
          setCurrentLocId('loc_1f_lobby');
        }}
      />



      {/* Leave Building Confirmation Modal (Only from 1F) */}
      <AnimatePresence>
        {showLeaveBuildingModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 font-sans select-none">
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 5 }}
              className="retro-forum-modal-window max-w-lg w-full shadow-xl overflow-hidden text-[#333333]"
            >
              {/* Header */}
              <div className="retro-forum-window-header shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-[#ffffff]" />
                  <span className="font-bold text-xs sm:text-sm tracking-wide">
                    【大樓正門處置】— 離開安祥路88號大樓？
                  </span>
                </div>

                <button
                  onClick={() => setShowLeaveBuildingModal(false)}
                  className="retro-forum-close-btn flex items-center justify-center cursor-pointer"
                  title="關閉"
                >
                  <X className="w-3 h-3 text-[#333333]" />
                </button>
              </div>

              <div className="p-5 bg-[#f7faf5] space-y-4">
                <p className="text-xs text-[#556652]">
                  站在一樓大廳正門口，你打算……
                </p>

                <div className="space-y-3">
                  {/* Option 1: Rest in Office (Advance date, Diminishing SAN) */}
                  <button
                    onClick={() => {
                      setShowLeaveBuildingModal(false);
                      onRestInOffice();
                    }}
                    className="w-full p-3.5 rounded-xs bg-[#ffffff] hover:bg-[#f4f8f2] border border-[#a8c2a1] text-left transition-all group space-y-1 shadow-2xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-[#1a3964] group-hover:text-[#2e6d24] flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-[#2e6d24]" />
                        返回事務所休息（沉澱心神，推進調查日期）
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#556652] group-hover:text-[#2e6d24] transition-transform" />
                    </div>
                    <p className="text-xs text-[#556652] pl-6 leading-relaxed">
                      暫時離開現場回到辦公室沙發小憩。日期將前進一天，但隨著案件拖延與怪談侵蝕，休息所能恢復的心理狀態將越來越少，甚至可能引發惡夢倒扣。
                    </p>
                  </button>

                  {/* Option 2: Abandon Case */}
                  <button
                    onClick={() => {
                      setShowLeaveBuildingModal(false);
                      onTriggerEnding('ending1');
                    }}
                    className="w-full p-3.5 rounded-xs bg-[#ffffff] hover:bg-[#fdf2f2] border border-[#e2b1b1] text-left transition-all group space-y-1 shadow-2xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-[#b8502a] group-hover:text-[#9c2e2e] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#b8502a]" />
                        徹底放棄委託，離開安祥路
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#b8502a] transition-transform" />
                    </div>
                    <p className="text-xs text-[#775555] pl-6 leading-relaxed">
                      將這起荒謬而凶險的怪談拋諸腦後，銷毀委託紀錄，不再踏入大樓半步。
                    </p>
                  </button>

                  {/* Option 3: Stay & Continue Exploration */}
                  <button
                    onClick={() => setShowLeaveBuildingModal(false)}
                    className="w-full py-2 rounded-xs bg-[#ffffff] hover:bg-[#f4f8f2] border border-[#a8c2a1] text-[#333333] text-xs font-bold transition-all shadow-2xs text-center cursor-pointer"
                  >
                    留在現場繼續調查
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Minigame Modal Overlays */}
      <React.Suspense fallback={null}>
      {activeMinigame === 'letter_puzzle' && (
        <LetterPuzzle
          onComplete={() => {
            setActiveMinigame(null);
            onObtainItem('shredded_letter');
            onModifySan(3); // Reward +3 SAN on solving puzzle
            onAddJournalEntry({
              category: 'action',
              title: '成功拼合【碎紙信件】',
              content: '將碎紙片逐一拼接完整，還原了張浩生前留下的關鍵求救信！信中提到「四樓一直都在，假裝不知道你已經知道……」。心神受到真相鼓舞，心態稍獲平復。',
              location: '五樓 504 號房',
              sanDelta: 3
            });
            setActionFeedback({
              text: '【碎紙信件已完整還原】：寄件人與收件地址皆為「404號房」！信中寫道：「規則是……不要相信他們給你的大樓設計圖。能搬家最好，若不能的話萬事小心，假裝不知道你已經知道……」',
              type: 'rule'
            });
            // Immediately switch active hotspot state so it displays the assembled letter review without closing/re-opening
            setActiveHotspot({
              id: 'hotspot_shredded_letter_trash',
              name: '504 臥室垃圾桶內的碎紙片',
              iconName: 'FileQuestion',
              category: 'clue',
              shortDesc: '黑色塑料垃圾桶裡，堆著被剪刀剪碎的信封與信紙。',
              inspectText: '所有碎紙片已被你在桌上完整拼合還原為一封關鍵信件。',
              actions: [
                {
                  id: 'puzzle_review',
                  label: '檢視已拼合還原的【張浩手寫信】',
                  resultText: '桌上整齊擺放著拼合完成的信件，上面是張浩顫抖的筆跡：「……四樓根本沒有被拆除，而是被隱藏了！404號房就在那裡……」',
                  soundEffect: 'paper' as const
                }
              ]
            });
          }}
          onClose={() => setActiveMinigame(null)}
        />
      )}

      {activeMinigame === 'cctv_deduction' && (
        <DeductionMatrix
          onSuccess={() => {
            setActiveMinigame(null);
            onSetCctvRebooted();
            onAddJournalEntry({
              category: 'action',
              title: '破解【監視器推理矩陣】並重啟安控主機',
              content: '透過監視錄影時間戳與多視角交叉比對，識破了四樓遮蔽的物理真相，成功重啟中控系統！四樓隱藏走廊的空間認知遮蔽已完全解除！',
              location: '一樓警衛安控室',
              sanDelta: 3
            });
          }}
          onFailSanPenalty={(pen) => {
            if (sceneWrongChoicePenaltyCount >= 2) {
              setActionFeedback({
                text: '【精神防禦保護】：在同一場景承受心智衝擊已達上限，離開該場景重新返回前不再受到衝擊。',
                type: 'normal'
              });
              return;
            }
            setSceneWrongChoicePenaltyCount(prev => prev + 1);
            onModifySan(-pen);
            onAddJournalEntry({
              category: 'system',
              title: '監視器矩陣推理失誤',
              content: `監視螢幕中爆發劇烈雪花噪點，怪異精神干擾造成劇烈心理衝擊。`,
              location: '一樓警衛安控室',
              sanDelta: -pen
            });
          }}
          onSanReward={(reward) => {
            onModifySan(reward);
          }}
          onClose={() => setActiveMinigame(null)}
        />
      )}

      {activeMinigame === 'chase' && (
        <ChaseSequence
          san={san}
          onSuccess={() => {
            setActiveMinigame(null);
            setCurrentLocId('loc_1f_lobby');
            onAddJournalEntry({
              category: 'action',
              title: '成功逃離怪異追逐',
              content: '在狂亂的樓梯與走廊間果斷抉擇，成功甩開了紅衣人影的追殺，逃回一樓大廳。',
              location: '樓梯間 → 1F 大廳'
            });
          }}
          onFail={() => {
            setActiveMinigame(null);
            if (san <= 25) {
              // Critical Low SAN -> Fatal Caught! Trigger ending4 breakdown
              onModifySan(-san);
              sound.playGlitch();
              onTriggerEnding('ending4');
              return;
            }
            setCurrentLocId('loc_1f_lobby');
            const safePen = Math.min(15, Math.max(0, san - 5));
            if (safePen > 0) {
              onModifySan(-safePen);
            }
            sound.playKnock();
            setActionFeedback({
              text: '【驚險脫困】：你在追逐戰中被怪異逼入死角，但憑藉最後求生本能撞開一樓安全門滾回大廳！驚魂未定。',
              type: 'normal'
            });
            onAddJournalEntry({
              category: 'action',
              title: '【追逐戰驚險脫身】',
              content: '在狂暴的迴廊追逐中險象環生，雖然被怪異逼至死角，但在千鈞一髮之際撞開了一樓防火門狼狽逃回大廳，成功擺脫直接追擊！',
              location: '樓梯間 → 1F 大廳',
              sanDelta: -safePen
            });
          }}
        />
      )}

      {activeMinigame === 'boss' && (
        <BossDeconstruction
          san={san}
          playerName={playerName}
          trait={trait}
          hasKeyLetter={hasLetter}
          hasBlueprints={hasBlueprints}
          hasHandwrittenRule={hasHandwrittenRule}
          hasOldCaseFile={hasOldCaseFile}
          inventory={inventory}
          onFinishBattle={(endingId) => {
            setActiveMinigame(null);
            onTriggerEnding(endingId);
          }}
        />
      )}

      {/* Guard Patrol Corridor QTE Modal (白衣警衛突發巡邏潛行迴避) */}
      {showGuardPatrolQTE && (
        <GuardPatrolQTE
          floor={String(currentLocation.floor)}
          san={san}
          obtainedRules={obtainedRules}
          onSuccess={(recoveredSan) => {
            setShowGuardPatrolQTE(false);
            onModifySan(recoveredSan);
            onAddJournalEntry({
              category: 'action',
              title: `【成功避開走廊警衛巡邏】`,
              content: `在「${currentLocation.name}」走廊遭遇白衣警衛突發點名巡視。依據《住戶規則》冷靜屏息並低頭避開直視，警衛確認無異狀後翻閱日誌離去。`,
              location: currentLocation.name,
              sanDelta: recoveredSan
            });
          }}
          onFailure={(penaltySan, reason) => {
            setShowGuardPatrolQTE(false);
            let effectivePen = penaltySan;
            if (sceneWrongChoicePenaltyCount >= 2) {
              effectivePen = 0;
              setActionFeedback({
                text: '【精神防禦保護】：在同一場景承受心智衝擊已達上限，離開該場景重新返回前不再受到衝擊。',
                type: 'normal'
              });
            } else {
              setSceneWrongChoicePenaltyCount(prev => prev + 1);
              // Random patrol penalty will not reduce SAN below 5 directly
              const safePen = Math.min(penaltySan, Math.max(0, san - 5));
              effectivePen = safePen;
              if (safePen > 0) {
                onModifySan(-safePen);
              }
            }
            onAddJournalEntry({
              category: 'system',
              title: `【警衛巡邏暴露・受到驚駭】`,
              content: `${reason}，白衣警衛發出尖銳空洞的詰問，大腦受到強烈認知衝擊。`,
              location: currentLocation.name,
              sanDelta: -effectivePen
            });
          }}
          onClose={() => setShowGuardPatrolQTE(false)}
        />
      )}

      {/* Urban Legend Random Anomaly Event Modal (怪談異常限時抉擇) */}
      {activeAnomalyEvent && (
        <AnomalyEventModal
          event={activeAnomalyEvent}
          obtainedRules={obtainedRules}
          inventory={inventory}
          isFlashlightOn={isFlashlightOn}
          san={san}
          unlockedEndings={unlockedEndings}
          onModifySan={(delta) => {
            if (delta < 0) {
              // Safety Floor: Random anomaly events cannot reduce SAN below 5
              const safeDelta = -Math.min(Math.abs(delta), Math.max(0, san - 5));
              if (safeDelta !== 0) {
                onModifySan(safeDelta);
              }
            } else {
              onModifySan(delta);
            }
          }}
          onAddJournalEntry={onAddJournalEntry}
          onSuccessfulDisposal={onSuccessfulDisposal}
          onComplete={() => setActiveAnomalyEvent(null)}
        />
      )}

      {/* Group 1 Orthodox Deduction: Staircase Measure Minigame Modal */}
      <StaircaseMeasureMinigameModal
        isOpen={showStaircaseMeasureModal}
        hasDiscoveredStepHeightDiscrepancy={hasDiscoveredStepHeightDiscrepancy}
        onDeductionComplete={() => {
          setShowStaircaseMeasureModal(false);
          setHasDiscoveredStepHeightDiscrepancy(true);
          onModifySan(5);
          onAddJournalEntry({
            category: 'action',
            title: '空間丈量論證：24階與高度落差物理破綻',
            content: '親手使用鋼捲尺精確丈量證實：1F-3F標準階高18cm，3F-5F每階僅15cm卻有24階（總高360cm）！建商在3樓與5樓之間加蓋了壓縮夾層（消失的四樓）！',
            location: '大樓安全梯 • 三樓至五樓折返梯',
            highlightBadge: '空間真相'
          });
          setActionFeedback({
            text: '【空間幾何丈量完成】：經精確幾何換算，證實三樓上方存在加蓋壓縮夾層！以冷靜客觀的物理尺度驅散了空間迷霧。',
            type: 'normal'
          });
        }}
        onClose={() => setShowStaircaseMeasureModal(false)}
      />

      {/* Group 2 Epiphany QTE Modal (10s Contradiction Flash) */}
      {activeEpiphanyQTEId && EPIPHANY_QTE_CONFIGS[activeEpiphanyQTEId] && (
        <EpiphanyQTEModal
          isOpen={true}
          config={EPIPHANY_QTE_CONFIGS[activeEpiphanyQTEId]}
          trait={trait}
          onSuccess={(qteId) => {
            setSolvedEpiphanyQTEIds(prev => [...prev, qteId]);
            setActiveEpiphanyQTEId(null);
            // 選擇正確回復少許SAN（不呈現具體數值）
            onModifySan(5);

            if (qteId === 'elevator_travel_time') {
              onAddJournalEntry({
                category: 'action',
                title: '邏輯推理突破：電梯爬升秒數倍增',
                content: '秒錶客觀測量證實：3F至5F的爬升耗時整整是常規層高(1F-2F)的兩倍！三樓與五樓之間絕對存在著第四層樓實體空間！',
                location: '客用電梯內部車廂',
                highlightBadge: '靈光突破'
              });
              setActionFeedback({
                text: '【靈光一閃・突破】：電梯爬升秒數整整多出一倍！以客觀物理破除空間幻象，思緒頓時澄澈明朗。',
                type: 'normal'
              });
            } else if (qteId === 'brass_box_lockpick') {
              onAddJournalEntry({
                category: 'action',
                title: '邏輯推理突破：黃銅暗格副齒開鎖',
                content: '洞察老舊鑰匙柄端的鋸齒，成功挑開暗格雙舌鎖，取出關鍵租約存根！',
                location: '五樓 504 號房',
                highlightBadge: '靈光突破'
              });
              setActionFeedback({
                text: '【靈光一閃・突破】：看穿鑰匙柄端特製副齒的作用，暗格卡榫清脆彈開！',
                type: 'normal'
              });
            } else if (qteId === 'utility_meter_deduction') {
              onAddJournalEntry({
                category: 'action',
                title: '邏輯推理突破：幽靈回路電表真相',
                content: '存根與總配電箱電表編號相符，「404」分表度數按月遞增，實體電力線路從未中斷！',
                location: '大樓配電箱 / 504號房',
                highlightBadge: '靈光突破'
              });
              setActionFeedback({
                text: '【靈光一閃・突破】：水電存根與404配電回路完全吻合！恐懼煙消雲散。',
                type: 'normal'
              });
            } else if (qteId === 'plc_bypass_deduction') {
              onAddJournalEntry({
                category: 'action',
                title: '邏輯推理突破：電梯PLC改裝真相',
                content: 'PLC主機板被刻意跳線短接，電梯不是撞鬼，而是人為改裝程式強制不停靠！',
                location: '電梯檢修控制盒',
                highlightBadge: '靈光突破'
              });
              setActionFeedback({
                text: '【靈光一閃・突破】：看穿PLC主機板跳線的物理改裝，徹底瓦解對幽靈電梯的迷信恐懼！',
                type: 'normal'
              });
            } else if (qteId === 'mouse_scratch_wall_complaint') {
              sound.playTensionSting();
              sound.playKeyUnlock();
              setHasEncountered5FNeighborComplaint(true);
              setHasUnlocked502(true);
              setCurrentLocId('loc_502_interior');
              setIsZhangHaoRescueModalOpen(true);
              onAddJournalEntry({
                category: 'action',
                title: '邏輯推理突破：牆內非鼠，乃是人命求生！',
                content: '一樓大廳住戶投訴牆壁老鼠抓撓怪聲。偵探以客觀邏輯勘破：502斷糧數月，老鼠絕不可能在密閉石膏夾層持續發出規律抓撓聲——那是受困者指甲刮牆的求生信號！警衛王大偉大為震動，火速掏出總鑰匙開啟原本鎖閉的502號房！',
                location: '一樓大廳 → 五樓 502 號房',
                highlightBadge: '核心突破'
              });
              setActionFeedback({
                text: '【靈光一閃・直抵真相】：你當場指出那是人類極度脫水受困牆內時，用手指抓撓石膏板求救的聲音！警衛王大偉被你的專業分析震懾，立刻掏出502大師總鑰匙，與你一同搭電梯衝上五樓破門！',
                type: 'normal'
              });
            }
          }}
          onProceedAnyway={(qteId) => {
            setActiveEpiphanyQTEId(null);
            if (qteId === 'mouse_scratch_wall_complaint') {
              sound.playTensionSting();
              sound.playKeyUnlock();
              setHasEncountered5FNeighborComplaint(true);
              setHasUnlocked502(true);
              setCurrentLocId('loc_502_interior');
              setIsZhangHaoRescueModalOpen(true);
              onAddJournalEntry({
                category: 'action',
                title: '【介入五樓住戶投訴，警衛開啟502號房】',
                content: '一樓大廳五樓住戶投訴隔壁牆壁傳出怪聲。雖然先前思緒短暫混亂，但你猛然意識到這絕對不是老鼠——那是人類在石膏夾壁內的最後求生呼救！警衛王大偉立刻掏出總鑰匙開啟原本鎖定的502號房一同前往搜救！',
                location: '一樓大廳 → 五樓 502 號房'
              });
              setActionFeedback({
                text: '【這絕對不是老鼠！】：你猛然回過神來打斷爭吵：「這絕非老鼠！那是指甲抓撓石膏板的瀕死求救，裡面有人！」警衛王大偉急忙從抽屜翻出502總鑰匙，與你一同搭電梯衝上五樓推開房門！',
                type: 'normal'
              });
            }
          }}
          onFailure={(qteId) => {
            if (qteId === 'mouse_scratch_wall_complaint') {
              // For mouse complaint, the modal shows the "這絕對不是老鼠" notice with onProceedAnyway button,
              // so player can click it and proceed. If dismissed:
              setActionFeedback({
                text: '【答案揭曉・非老鼠】：已勘破牆內抓撓的物理真相，那是受困者指甲刮牆求生！準備採取營救。',
                type: 'normal'
              });
              return;
            }
            setActiveEpiphanyQTEId(null);
            // 答錯直接顯示答案，無負面影響、不扣理智
            setActionFeedback({
              text: '【真相明晰】：透過現場客觀物理條件查明了正解，思路豁然開朗。',
              type: 'normal'
            });
          }}
          onClose={() => setActiveEpiphanyQTEId(null)}
        />
      )}

      {/* Week 1 Climax: Dedicated Full-Page Zhang Hao Rescue Modal */}
      <ZhangHaoRescueModal
        isOpen={isZhangHaoRescueModalOpen}
        trait={trait}
        initialStep={wallRescueStep}
        isFlashlightOn={isFlashlightOn}
        onToggleFlashlight={() => {
          const next = !isFlashlightOn;
          setIsFlashlightOn(next);
          sound.playFlashlightToggle(next);
        }}
        onCompleteRescue={(endingId) => {
          setIsZhangHaoRescueModalOpen(false);
          onTriggerEnding(endingId);
        }}
        onClose={() => setIsZhangHaoRescueModalOpen(false)}
      />
      </React.Suspense>
    </div>
  );
};
