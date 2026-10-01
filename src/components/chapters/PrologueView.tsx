import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Monitor, Smartphone, Flower2, Archive, 
  ArrowRight, Sparkles, MessageSquare, Coffee, Eye, 
  Compass, Brain, 
  CheckCircle2, Unlock, 
  HelpCircle, Key, Check, AlertTriangle,
  Fingerprint, X, ArrowLeft, FolderCheck, Lightbulb
} from 'lucide-react';
import { sound } from '../../services/soundEngine';
import { EndingId, TraitId } from '../../types';
import { INVESTIGATOR_TRAITS, InvestigatorTrait, SIX_ATTRIBUTES } from '../../data/traitsData';
import { TraitRadar } from '../common/TraitRadar';
import { 
  TRAIT_CLIENT_INQUIRY_NOTES 
} from '../../data/traitMonologues';
import { 
  OFFICE_MANDATORY_HOTSPOTS, 
  OFFICE_SECRET_HOTSPOT,
  OfficeHotspotQuiz,
  OfficeQuizOption,
  OfficeClueFragment
} from '../../data/officeQuizData';
import { SafeDialMinigameModal } from '../minigames/SafeDialMinigameModal';

interface PrologueViewProps {
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  boardName?: string;
  onUpdateBoardName?: (name: string) => void;
  articleTitle?: string;
  onUpdateArticleTitle?: (title: string) => void;
  selectedTrait: TraitId;
  onSelectTrait: (trait: TraitId) => void;
  onTraitRevealed?: () => void;
  onProceedToApartment: () => void;
  onObtainItem: (itemId: string) => void;
  investigationDateText: string;
  gameDate?: { year: number; month: number; day: number };
  onAddJournalEntry?: (entry: { category: 'dialogue' | 'action' | 'system'; title: string; content: string; location?: string }) => void;
  unlockedEndings?: EndingId[];
  completedWeek1?: boolean;
}

interface ClientInquiryTopic {
  id: string;
  question: string;
  clientResponse: string;
}

export const PrologueView: React.FC<PrologueViewProps> = ({
  playerName,
  onUpdatePlayerName,
  boardName = '怪談',
  onUpdateBoardName,
  articleTitle = '那棟大樓',
  onUpdateArticleTitle,
  selectedTrait,
  onSelectTrait,
  onTraitRevealed,
  onProceedToApartment,
  onObtainItem,
  investigationDateText,
  gameDate,
  onAddJournalEntry,
  unlockedEndings = [],
  completedWeek1 = false
}) => {
  // Step: 'intro_narrative' -> 'office' -> 'client' -> 'building_arrival'
  const [step, setStep] = useState<'intro_narrative' | 'office' | 'client' | 'building_arrival'>('intro_narrative');
  const [nameError, setNameError] = useState<string | null>(null);

  // Dynamically calculate post archive date to be 6 months before the investigation date
  const postArchiveDateText = useMemo(() => {
    if (gameDate) {
      let year = gameDate.year;
      let month = gameDate.month;
      const day = gameDate.day;
      if (month > 6) {
        month -= 6;
      } else {
        year -= 1;
        month += 6;
      }
      return `${year}年${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日`;
    }
    const match = investigationDateText?.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (match) {
      let year = parseInt(match[1], 10);
      let month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);
      if (month > 6) {
        month -= 6;
      } else {
        year -= 1;
        month += 6;
      }
      return `${year}年${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日`;
    }
    return '2011年07月07日';
  }, [gameDate, investigationDateText]);

  // Office Investigation & Psychological Test State
  // Modal 1: Active investigating hotspot (for un-answered spots)
  const [activeInvestigatingHotspot, setActiveInvestigatingHotspot] = useState<OfficeHotspotQuiz | null>(null);
  const [activeQuestionStep, setActiveQuestionStep] = useState<number>(0);
  const [sessionSelectedOptions, setSessionSelectedOptions] = useState<OfficeQuizOption[]>([]);
  
  // Modal 2: Archived note & clue modal (shown immediately after choosing, or when clicking already answered spots)
  const [archivedHotspotModal, setArchivedHotspotModal] = useState<OfficeHotspotQuiz | null>(null);

  // Store chosen option objects per hotspot (array of answers for chained questions)
  const [quizSelections, setQuizSelections] = useState<Record<string, OfficeQuizOption[]>>({});
  const [obtainedClues, setObtainedClues] = useState<OfficeClueFragment[]>([]);
  
  // Deduction Safe Puzzle State
  const [inputCipher, setInputCipher] = useState<string>('');
  const [isCipherSolved, setIsCipherSolved] = useState<boolean>(false);
  const [cipherError, setCipherError] = useState<string | null>(null);
  
  // 7th Hotspot (Flowerpot Safe) State
  const [isSecretSafeOpened, setIsSecretSafeOpened] = useState<boolean>(false);
  const [hasTakenOldCaseFile, setHasTakenOldCaseFile] = useState<boolean>(false);
  const [showSecretSafeModal, setShowSecretSafeModal] = useState<boolean>(false);
  const [showSafeDialModal, setShowSafeDialModal] = useState<boolean>(false);

  // Psychological Archetype Reveal Modal State
  const [showArchetypeReveal, setShowArchetypeReveal] = useState<boolean>(false);
  const [revealedTrait, setRevealedTrait] = useState<InvestigatorTrait | null>(null);

  // Client Interactive Inquiry State
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [askedTopicIds, setAskedTopicIds] = useState<string[]>([]);

  // Calculate composite scores for each trait from the 3 core mandatory investigations
  const traitScores = useMemo<Record<TraitId, number>>(() => {
    const scores: Record<TraitId, number> = {
      deconstructor: 0, // 細心
      empath: 0,        // 敏銳
      pragmatist: 0,    // 勇敢
      cautious: 0,      // 慎重
      rationalist: 0,   // 理性
      intuitive: 0      // 直覺
    };

    Object.values(quizSelections).forEach((optionsArray: OfficeQuizOption[]) => {
      if (Array.isArray(optionsArray)) {
        optionsArray.forEach((option) => {
          if (option && option.scores) {
            (Object.keys(scores) as TraitId[]).forEach((tId) => {
              scores[tId] += option.scores[tId] || 0;
            });
          }
        });
      }
    });

    return scores;
  }, [quizSelections]);

  // Determine top dominant trait based on composite score sum
  const topTraitId = useMemo<TraitId>(() => {
    const traitOrder: TraitId[] = ['rationalist', 'intuitive', 'deconstructor', 'empath', 'pragmatist', 'cautious'];
    let maxScore = -1;
    let bestTrait: TraitId = 'rationalist';
    
    traitOrder.forEach((tId) => {
      if (traitScores[tId] > maxScore) {
        maxScore = traitScores[tId];
        bestTrait = tId;
      }
    });
    return bestTrait;
  }, [traitScores]);

  // Mandatory 3 completed check
  const mandatoryCompletedCount = Object.keys(quizSelections).length;
  const isMandatory3Completed = mandatoryCompletedCount === OFFICE_MANDATORY_HOTSPOTS.length;

  // All completed check (including safe opened and file taken)
  const isAllOfficeExplored = isMandatory3Completed && isCipherSolved && hasTakenOldCaseFile;

  // Interactive topics for questioning the client
  const clientTopics: ClientInquiryTopic[] = [
    {
      id: 'topic_moving',
      question: '詢問好友搬家當天的細節：「你當天陪張浩搬家時，大樓電梯與走廊有何異常？」',
      clientResponse: '陳先生敲了敲太陽穴，面露痛苦與茫然：「那天的記憶……說來非常邪門，就像隔著一層厚厚的毛玻璃。我明明開車載他去，幫他把三個大箱子搬上五樓 504 號房。但我現在怎麼努力回想，都記不起走廊具體長什麼樣子……我只記得電梯按鈕好像有數字，又好像全是生鏽的空白鐵片。而且，我甚至想不起自己最後是怎麼走出那棟大樓的……」'
    },
    {
      id: 'topic_calls',
      question: '詢問張浩搬入後的日常與通話：「他搬進去後，平時跟你提過大樓管理或生活狀況嗎？」',
      clientResponse: '陳先生回憶道：「他搬進去第二天曾打給我，隨口笑說這棟老樓管委會很古怪，入住時在客廳茶几留了張泛黃的『住戶生活備忘須知』，上面列了幾條囉唆的物業叮嚀。張浩當時只當成老舊大樓的管理怪僻，把紙條隨手扔在客廳茶几……但最後一通電話是在深夜兩點，他聲音抖得厲害，說隔壁傳來瘋狂的敲擊聲與腳步聲，還恐懼地說好像有人在門外反覆轉動門把、甚至看到奇怪的人影在走廊徘徊……接著電話就傳來一陣刺耳雜音，徹底斷線了。」'
    },
    {
      id: 'topic_address',
      question: '詢問租約登記與現場查訪經歷：「你確定他承租的地址是安祥路88號504號房？你有去現場找過他嗎？」',
      clientResponse: '陳先生激動地說：「我百分之百確定合約寫的是安祥路88號504號房！但他失蹤三天後我跑去現場，一樓值班的老警衛說張浩根本沒住那裡，還說504早就是退租的空屋。連房仲都推託說那棟大樓產權複雜、四樓長年封閉。我感覺整棟樓的人都在隱瞞什麼！」'
    },
    {
      id: 'topic_clues',
      question: '追問遺物與最後通聯細節：「你剛提到他最後慌張的狀態？他還交代過其他具體線索嗎？」',
      clientResponse: `陳先生急忙從口袋掏出一張揉皺的便條紙：「他最後在電話裡非常恐懼，說門縫常被塞一些寫滿怪異禁忌的匿名恐嚇字條，還說看到有人穿著奇怪制服在走廊遊蕩……我當時以為是他被惡質討債公司騷擾，沒想到他真的失聯了……${playerName ? `${playerName}，` : ''}我現在腦袋真的很亂，求你一定要把他平安帶回來！」`
    }
  ];

  // Hotspot Click Handling
  const handleOpenHotspot = (hotspot: OfficeHotspotQuiz) => {
    sound.playPaper();
    setCipherError(null);

    // If already answered, directly open the archived view (prevents changing options)
    if (quizSelections[hotspot.id]) {
      setArchivedHotspotModal(hotspot);
    } else {
      // If not yet answered, reset steps and open the selection modal
      setActiveQuestionStep(0);
      setSessionSelectedOptions([]);
      setActiveInvestigatingHotspot(hotspot);
    }
  };

  // Exit without answering: treats as completely unviewed
  const handleExitInvestigationWithoutAnswering = () => {
    sound.playClick();
    setActiveInvestigatingHotspot(null);
    setActiveQuestionStep(0);
    setSessionSelectedOptions([]);
  };

  // Answer Quiz Option for the active step
  const handleSelectQuizOption = (hotspot: OfficeHotspotQuiz, option: OfficeQuizOption) => {
    const updatedSessionOptions = [...sessionSelectedOptions, option];

    // Check if there are further questions in this hotspot
    if (activeQuestionStep < hotspot.questions.length - 1) {
      sound.playPaper();
      setSessionSelectedOptions(updatedSessionOptions);
      setActiveQuestionStep(prev => prev + 1);
      return;
    }

    // Final question answered: complete this hotspot investigation
    sound.playElevatorChime();
    
    // 1. Lock answers for this hotspot
    setQuizSelections(prev => ({
      ...prev,
      [hotspot.id]: updatedSessionOptions
    }));

    // 2. Add clue fragment if not already collected
    if (!obtainedClues.some(c => c.id === hotspot.clueFragment.id)) {
      setObtainedClues(prev => [...prev, hotspot.clueFragment]);
    }

    // 3. Add Journal Entry compiling all chosen thoughts
    if (onAddJournalEntry) {
      const compiledThoughts = updatedSessionOptions
        .map((opt, idx) => `【階段 ${idx + 1} 思維】：${opt.label}\n${opt.thought}`)
        .join('\n\n');

      onAddJournalEntry({
        category: 'action',
        title: `事務所勘查筆記：${hotspot.title}`,
        content: `【區域觀察】：${hotspot.sceneDescription}\n\n${compiledThoughts}\n\n【獲得謎題線索】：${hotspot.clueFragment.title}\n${hotspot.clueFragment.riddleText}`,
        location: '私家偵探事務所'
      });
    }

    // 4. Close selection modal and open archived modal
    setActiveInvestigatingHotspot(null);
    setActiveQuestionStep(0);
    setSessionSelectedOptions([]);
    setArchivedHotspotModal(hotspot);
  };

  // Safe Deduction & Cipher Verification
  const handleVerifyCipher = (codeToVerify?: string) => {
    const code = (codeToVerify ?? inputCipher).trim();
    if (code === OFFICE_SECRET_HOTSPOT.targetPassword) {
      sound.playElevatorChime();
      setIsCipherSolved(true);
      setCipherError(null);
      
      if (onAddJournalEntry) {
        onAddJournalEntry({
          category: 'system',
          title: '深度推理成功：破解發財樹暗格暗號',
          content: '透過比對地籍建案代碼(88)、舊案封存代碼(04)與地圖坐標組合(8804)，成功推導出暗格密碼【8804】！發財樹下方的機械密碼鎖已解除鎖定。',
          location: '私家偵探事務所'
        });
      }
    } else {
      sound.playGlitch();
      setCipherError('暗號驗證失敗。請仔細比對 3 個區域搜集到的謎題提示。');
    }
  };

  // Open 7th Secret Safe Hotspot (or open dial minigame if not yet unlocked)
  const handleOpenSecretSafe = () => {
    if (!isCipherSolved) {
      if (isMandatory3Completed) {
        sound.playClick();
        setShowSafeDialModal(true);
      } else {
        sound.playGlitch();
      }
      return;
    }
    sound.playSwitch();
    setIsSecretSafeOpened(true);
    setShowSecretSafeModal(true);
  };

  // Take Old Case File Item
  const handleTakeOldCaseFile = () => {
    sound.playPaper();
    setHasTakenOldCaseFile(true);
    onObtainItem(OFFICE_SECRET_HOTSPOT.rewardItem.id);
    if (onAddJournalEntry) {
      onAddJournalEntry({
        category: 'action',
        title: '取得關鍵物證：安祥路88號半年前舊案卷宗',
        content: '從發財樹暗格保險箱中取出了封存的半年前舊案卷宗。記錄顯示半年前曾有前任房客在安祥路88號大樓離奇失聯，案情模式如出一轍。',
        location: '私家偵探事務所'
      });
    }
  };

  // Trigger Archetype Reveal before Client Meeting
  const handleStartClientMeeting = () => {
    sound.playElevatorChime();
    const finalTrait = INVESTIGATOR_TRAITS[topTraitId];
    onSelectTrait(topTraitId);
    if (onTraitRevealed) {
      onTraitRevealed();
    }
    setRevealedTrait(finalTrait);
    setShowArchetypeReveal(true);
  };

  // Confirm Archetype and proceed into Client Room
  const handleConfirmArchetypeAndEnterClient = () => {
    sound.playClick();
    if (onTraitRevealed) {
      onTraitRevealed();
    }
    setShowArchetypeReveal(false);
    setStep('client');
    setActiveTopicId(null);
  };

  // Question Client Topic
  const handleSelectTopic = (topicId: string) => {
    sound.playPaper();
    setActiveTopicId(topicId);
    const topic = clientTopics.find(t => t.id === topicId);

    if (!askedTopicIds.includes(topicId)) {
      setAskedTopicIds(prev => [...prev, topicId]);
      const note = TRAIT_CLIENT_INQUIRY_NOTES[topicId]?.[selectedTrait] || '';
      if (topic && onAddJournalEntry) {
        onAddJournalEntry({
          category: 'dialogue',
          title: `詢問委託人陳先生：${topic.question.substring(0, 20)}...`,
          content: `${topic.clientResponse}\n\n${note}`,
          location: '私家偵探事務所'
        });
      }
    }
  };

  const activeTraitData = INVESTIGATOR_TRAITS[selectedTrait];

  return (
    <div className="w-full h-full max-w-5xl mx-auto py-2 px-2 sm:px-4 min-h-0 overflow-y-auto custom-scrollbar space-y-4">
      {/* ========================================================================= */}
      {/* WEEK 2 DEDICATED OFFICE: ONLY "前往安祥路88號" BUTTON                      */}
      {/* ========================================================================= */}
      {completedWeek1 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/95 border border-red-900/70 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-red-950/40 space-y-6 relative overflow-hidden"
        >
          {/* Ambient red vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/25 via-transparent to-black/70 pointer-events-none" />

          {/* Header Bar */}
          <div className="border-b border-neutral-800 pb-3 flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 animate-pulse text-amber-500" />
                <span>LOCATION // 私家偵探事務所 • 第八日白晝</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-100 mt-1 flex items-center gap-2">
                <span>私家偵探事務所 • 認知對抗啟程</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-red-300">
                  二周目 • 規則怪談對抗
                </span>
              </h2>
            </div>
            <div className="text-xs font-mono bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-400">
              時間：<span className="text-amber-400 font-bold">上午 09:30（第八日）</span>
            </div>
          </div>

          {/* Atmosphere Narrative */}
          <div className="bg-black/60 border border-neutral-800 rounded-xl p-5 sm:p-6 space-y-4 font-serif text-sm sm:text-base leading-relaxed text-neutral-200 relative z-10">
            <p className="first-letter:text-3xl first-letter:font-bold first-letter:text-amber-500 first-letter:float-left first-letter:mr-2">
              張浩在市立療養院整整休養觀察了七天。清晨的日光穿透百葉窗斜灑在辦公桌上，但光線卻絲毫驅不散心頭揮之不去的陰霾。
            </p>
            <p>
              上禮拜的記憶歷歷在目——你在 502 號房破開空心牆壁救出張浩，本以為這是一場因財務焦慮引發的失蹤悲劇。然而，張浩被抬上救護車時瘋狂指著天空呢喃的「404」、那張被血字浸透的拼合信件，以及大樓深處那種令人背脊發涼的異樣秩序，都在無聲地嘲弄著世俗的理性。
            </p>
            <p>
              這座大樓被某種能「扭曲現實、制定認知規則」的怪異實體所吞噬。常規的調查手續與線索梳理已經毫無意義，唯一的出路，就是趁著白晝再次踏入安祥路88號大樓，直面那被空間摺疊吞噬的三十年禁忌深淵。
            </p>
          </div>

          {/* Single Action Area: ONLY "前往安祥路88號" */}
          <div className="pt-2 flex flex-col items-center justify-center gap-3 relative z-10">
            <button
              onClick={() => {
                sound.playDoor();
                onProceedToApartment();
              }}
              className="w-full max-w-md py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-800 via-rose-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 border-2 border-amber-500/80 hover:border-amber-400 text-white font-serif font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-2xl shadow-amber-950/80 cursor-pointer active:scale-98 transition-all group"
            >
              <span>前往安祥路88號（第八日白晝）</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </button>
            <p className="text-xs font-serif text-neutral-400">
              白晝的調查時光不容耽擱，整理裝備後立刻出發。
            </p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* STEP 1: PURE TEXT INTRO NARRATIVE (NO MANUAL TRAIT SELECTION)            */}
          {/* ========================================================================= */}
          {step === 'intro_narrative' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="retro-forum-modal-window rounded-none p-4 sm:p-6 shadow-md space-y-4 relative text-[#222222] font-sans"
        >
          {/* Forum/Portal Masthead & Thread Title */}
          <div className="retro-forum-modal-header px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#2e4d26]">
            <div className="flex items-center gap-2 text-[#ffffff] text-xs sm:text-sm font-bold">
              <Sparkles className="w-4 h-4 text-[#e0f2dc]" />
              <span className="tracking-wide">【置頂】[連載] 那棟大樓</span>
            </div>
            <div className="text-xs text-[#d8ecd2] font-mono flex items-center gap-2">
              <span>發文者：mawei</span>
              <span>•</span>
              <span>發帖存檔：{postArchiveDateText}</span>
            </div>
          </div>

          {/* Forum Headline Banner */}
          <div className="text-center py-2.5 px-3 bg-[#eef5eb] border border-[#b2cca9]">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#1c3a14] tracking-wide">
              【怪談】《那棟大樓》
            </h1>
          </div>

          {/* Narrative Text Paragraphs (Forum Thread Body) */}
          <div className="bg-[#ffffff] border border-[#a8c2a1] p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm leading-relaxed text-[#222222] shadow-2xs">
            <p className="first-letter:text-2xl first-letter:font-bold first-letter:text-[#2b5420] first-letter:float-left first-letter:mr-2">
              這座城市在雨夜裡總是顯得過分安靜。街角的霓虹燈在潮濕的柏油路上倒映出斑駁的暗光，天花板上的老舊吊扇發出低沉而規律的旋轉聲。
            </p>
            <p>
              近年來，市區數棟老舊住商大樓接連傳出離奇的人員失聯事件。警方的調查多以意外或自行離家草草結案，但失蹤者家屬私下透露，那些大樓內部似乎存在著難以言說的隱情與反常秩序。作為一名長年經手懸案與失蹤調查的私家偵探，你深知：<b className="text-[#1c3a14]">每一件看似荒謬的失聯背後，都藏著被刻意掩蓋的深層真相。</b>
            </p>
            <p className="text-[#3c5037] border-l-2 border-[#537e47] pl-3 py-0.5 bg-[#f4f7f2]">
              窗外暴雨未歇，一位神色慌張的委託人即將叩門。在開門接案之前，先在辦公室整理好思緒與必備工具。
            </p>
          </div>

          {/* Investigator Name Registration Form Box */}
          <div className="bg-[#f7faf5] border border-[#a8c2a1] p-3.5 sm:p-5 rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1a3964] block uppercase tracking-wide">
                註冊帳號
              </label>
              {nameError && (
                <span className="text-xs text-red-600 flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {nameError}
                </span>
              )}
            </div>
            <div>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  onUpdatePlayerName(e.target.value);
                  if (nameError && e.target.value.trim().length > 0) {
                    setNameError(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (!playerName || playerName.trim().length === 0) {
                      sound.playGlitch();
                      setNameError('請先輸入註冊帳號！');
                    } else {
                      sound.playClick();
                      setStep('office');
                    }
                  }
                }}
                maxLength={16}
                placeholder="請輸入註冊帳號"
                className={`bg-[#ffffff] border ${nameError ? 'border-red-600 ring-1 ring-red-500' : 'border-[#779471] focus:border-[#3e6634]'} rounded-xs px-3 py-1.5 text-xs sm:text-sm text-[#111111] font-sans w-full max-w-sm focus:outline-none shadow-2xs transition-all`}
              />
            </div>
          </div>

          {/* Proceed Button (Classic 2000s Web Action Button) */}
          <div className="pt-2 flex justify-end border-t border-[#c5d8c1]">
            <button
              onClick={() => {
                if (!playerName || playerName.trim().length === 0) {
                  sound.playGlitch();
                  setNameError('請先輸入註冊帳號！');
                  return;
                }
                sound.playClick();
                setNameError(null);
                setStep('office');
              }}
              className="retro-web-btn px-5 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 text-[#1a3964] cursor-pointer hover:text-[#b30000]"
            >
              <span>[ 進入事務所開始勘查準備 &gt;&gt; ]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: OFFICE 3 CORE INVESTIGATIONS + DEDUCTION PUZZLE + SAFE           */}
      {/* ========================================================================= */}
      {step === 'office' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="retro-forum-modal-window rounded-none p-3.5 sm:p-5 shadow-md space-y-4 text-[#222222] font-sans"
        >
          {/* Header Bar */}
          <div className="retro-forum-modal-header px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-[#2e4d26]">
            <div>
              <div className="flex items-center gap-2 text-[#d8ecd2] text-xs font-mono">
                <Coffee className="w-4 h-4 text-[#f0f9ee]" />
                <span>【辦公室內部勘查】私家偵探事務所 • 檔案盤點與特質測寫</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#ffffff] mt-0.5 flex items-center gap-2">
                <span>辦公室勘查與線索解析</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-xs bg-[#24421f] border border-[#7ba770] text-[#d8ecd2]">
                  3處核心線索
                </span>
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-xs font-mono bg-[#ffffff] px-2.5 py-1 rounded-xs border border-[#7ba770] text-[#1c3a14] font-bold">
                核心勘查：<b className={isMandatory3Completed ? "text-[#1c3a14]" : "text-[#b30000]"}>{mandatoryCompletedCount}</b> / 3
              </div>
              <div className="text-xs font-mono bg-[#ffffff] px-2.5 py-1 rounded-xs border border-[#7ba770] text-[#1c3a14]">
                暗格狀態：{isCipherSolved ? <span className="text-[#1c3a14] font-bold">已解鎖</span> : <span className="text-[#b30000] font-bold">未破解</span>}
              </div>
            </div>
          </div>

          {/* Investigation Guidance */}
          <div className="bg-[#f7faf5] border border-[#a8c2a1] p-3 text-xs text-[#222222] leading-relaxed flex items-start gap-2.5 shadow-2xs">
            <Lightbulb className="w-4 h-4 text-[#3e6634] shrink-0 mt-0.5" />
            <div>
              委託人陳先生即將抵達。需先逐一勘查事務所內的 <b>3 個核心區域</b>，釐清手頭掌握的歷史檔案與資訊，並搜集解開<b>發財樹暗格保險櫃</b>所需的暗號線索。
            </div>
          </div>

          {/* 3 Mandatory Hotspots Grid */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#1a3964] flex items-center justify-between">
              <span>【事務所核心勘查處】：</span>
              <span className="text-[11px] text-[#3e6634]">已搜集線索碎片：{obtainedClues.length} / 3</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {OFFICE_MANDATORY_HOTSPOTS.map((hotspot) => {
                const isAnswered = quizSelections[hotspot.id] !== undefined;

                return (
                  <button
                    key={hotspot.id}
                    onClick={() => handleOpenHotspot(hotspot)}
                    className={`p-3 rounded-xs border text-left transition-all flex flex-col justify-between group relative overflow-hidden cursor-pointer ${
                      isAnswered
                        ? 'bg-[#f0f8ed] border-[#7ba770] text-[#1c3a14] shadow-2xs'
                        : 'bg-[#ffffff] border-[#a8c2a1] hover:border-[#3e6634] hover:bg-[#fafcf9] text-[#222222] shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-xs ${
                            isAnswered ? 'bg-[#3e6634] text-white' : 'bg-[#eef5eb] text-[#2b5420] border border-[#b2cca9]'
                          }`}>
                            {hotspot.id === 'pc' && <Monitor className="w-4 h-4" />}
                            {hotspot.id === 'phone' && <Smartphone className="w-4 h-4" />}
                            {hotspot.id === 'corkboard' && <Eye className="w-4 h-4" />}
                          </div>
                          <span className="font-bold text-sm text-[#1a3964] group-hover:text-[#b30000]">
                            {hotspot.title}
                          </span>
                        </div>
                        {isAnswered ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#3e6634] text-white flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            已鎖定
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#eef5eb] text-[#3e6634] border border-[#b2cca9]">
                            未調查
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#556652] leading-relaxed line-clamp-2">
                        {hotspot.subtitle}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#d8ecd2] flex items-center justify-between text-xs">
                      <span className={isAnswered ? 'text-[#2b5420] font-bold flex items-center gap-1 text-[11px]' : 'text-[#1a3964] group-hover:underline text-[11px] font-bold'}>
                        {isAnswered ? '✓ 研判完畢・回顧思維' : '[ 勘查檢視 ➔ ]'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* POPUP MODAL 1: HOTSPOT INVESTIGATION & PSYCHOLOGICAL THINKING         */}
          {/* ===================================================================== */}
          <AnimatePresence>
            {activeInvestigatingHotspot && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  className="retro-forum-modal-window rounded-none max-w-2xl w-full shadow-2xl space-y-0 text-[#222222] max-h-[92vh] flex flex-col justify-between overflow-hidden"
                >
                  {/* Modal Header */}
                  <div className="retro-forum-modal-header px-3 sm:px-4 py-2 flex items-center justify-between border-b border-[#2e4d26] shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-xs bg-[#24421f] text-white">
                        {activeInvestigatingHotspot.id === 'pc' && <Monitor className="w-4 h-4" />}
                        {activeInvestigatingHotspot.id === 'phone' && <Smartphone className="w-4 h-4" />}
                        {activeInvestigatingHotspot.id === 'corkboard' && <Eye className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-[#d8ecd2] font-bold uppercase tracking-wider flex items-center gap-2">
                          <span>現場勘查與思維記錄</span>
                          <span className="text-[#a8c2a1]">•</span>
                          <span className="text-white">
                            階段 {activeQuestionStep + 1} / {activeInvestigatingHotspot.questions.length}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {activeInvestigatingHotspot.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={handleExitInvestigationWithoutAnswering}
                      className="p-1 text-[#d8ecd2] hover:text-white transition-colors cursor-pointer"
                      title="關閉視窗"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="bg-[#ffffff] p-4 sm:p-5 space-y-3.5 overflow-y-auto pr-2 text-[#222222]">
                    {/* Scene Description Box */}
                    <div className="bg-[#f7faf5] border border-[#a8c2a1] p-3 text-xs leading-relaxed text-[#222222] shadow-2xs">
                      {activeInvestigatingHotspot.sceneDescription}
                    </div>

                    {/* Step progress pills */}
                    <div className="flex items-center gap-1.5 px-0.5">
                      {activeInvestigatingHotspot.questions.map((q, idx) => {
                        const isCurrent = idx === activeQuestionStep;
                        const isPast = idx < activeQuestionStep;
                        return (
                          <div 
                            key={q.id}
                            className={`flex-1 h-1.5 transition-all duration-300 ${
                              isCurrent 
                                ? 'bg-[#3e6634]' 
                                : isPast 
                                  ? 'bg-[#7ba770]' 
                                  : 'bg-[#d8e4d4]'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Active Question Info */}
                    {(() => {
                      const currentQ = activeInvestigatingHotspot.questions[activeQuestionStep] || activeInvestigatingHotspot.questions[0];
                      return (
                        <div className="space-y-3">
                          <div className="bg-[#eef5eb] border border-[#b2cca9] p-3 space-y-1">
                            <div className="text-[10px] font-mono text-[#2b5420] font-bold uppercase flex items-center gap-1.5">
                              <Brain className="w-3 h-3" />
                              <span>{currentQ.questionTitle}</span>
                            </div>
                            <div className="text-xs text-[#222222] font-bold leading-relaxed">
                              {currentQ.prompt}
                            </div>
                          </div>

                          {/* 3-4 Crisp Quiz Options for this step */}
                          <div className="space-y-2">
                            {currentQ.options.map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => handleSelectQuizOption(activeInvestigatingHotspot, opt)}
                                className="w-full p-2.5 border text-left transition-all flex flex-col gap-1 bg-[#ffffff] border-[#a8c2a1] hover:border-[#3e6634] hover:bg-[#f7faf5] text-[#222222] group shadow-2xs cursor-pointer"
                              >
                                <div className="text-xs font-bold text-[#1a3964] group-hover:text-[#b30000] flex items-center justify-between">
                                  <span>{opt.label}</span>
                                  <span className="text-[10px] font-mono text-[#556652] group-hover:text-[#b30000] shrink-0 ml-2">
                                    {activeQuestionStep < activeInvestigatingHotspot.questions.length - 1 ? '下一步 ➔' : '確認思維並收納線索 ➔'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#444444] leading-relaxed pl-2 border-l-2 border-[#b2cca9] group-hover:border-[#3e6634]">
                                  {opt.thought}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Exit Without Answering Button */}
                  <div className="bg-[#eef5eb] px-4 py-2.5 border-t border-[#b2cca9] shrink-0 flex justify-end">
                    <button
                      onClick={handleExitInvestigationWithoutAnswering}
                      className="retro-web-btn px-4 py-1.5 text-xs text-[#1a3964] hover:text-[#b30000] flex items-center gap-1.5 cursor-pointer font-bold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>[ 先看看其他地方（暫存並退出） ]</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ===================================================================== */}
          {/* POPUP MODAL 2: CLUE & DEDUCTION ARCHIVED NOTIFICATION (LOCKED NOTE)   */}
          {/* ===================================================================== */}
          <AnimatePresence>
            {archivedHotspotModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  className="retro-forum-modal-window rounded-none max-w-xl w-full shadow-2xl space-y-0 text-[#222222] max-h-[90vh] overflow-hidden flex flex-col justify-between"
                >
                  {/* Header */}
                  <div className="retro-forum-modal-header px-3 sm:px-4 py-2 flex items-center justify-between border-b border-[#2e4d26] shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-xs bg-[#24421f] text-white">
                        <FolderCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-[#d8ecd2] font-bold uppercase tracking-wider">
                          勘查完成 • 思維與謎題線索已存檔
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {archivedHotspotModal.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => setArchivedHotspotModal(null)}
                      className="p-1 text-[#d8ecd2] hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="bg-[#ffffff] p-4 sm:p-5 space-y-3.5 overflow-y-auto text-[#222222]">
                    {/* Archived Detective Thoughts list */}
                    {(() => {
                      const chosenOptions = quizSelections[archivedHotspotModal.id];
                      if (!chosenOptions || !chosenOptions.length) return null;

                      return (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-[#1a3964]">
                            【記錄之連貫偵探思維要點】：
                          </div>
                          {chosenOptions.map((opt, optIdx) => (
                            <div key={opt.id || optIdx} className="bg-[#f7faf5] p-3 border border-[#a8c2a1] space-y-1 shadow-2xs">
                              <div className="text-[10px] font-mono text-[#2b5420] font-bold">
                                階段 {optIdx + 1} • {opt.label}
                              </div>
                              <div className="text-[11px] text-[#333333] pl-2.5 border-l-2 border-[#3e6634] leading-relaxed">
                                {opt.thought}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Discovered Clue Fragment / Riddle Banner */}
                    <div className="p-3 bg-[#eef5eb] border border-[#b2cca9] space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1c3a14]">
                          <Key className="w-4 h-4 text-[#2b5420]" />
                          <span>{archivedHotspotModal.clueFragment.title}</span>
                        </div>
                        <span className="font-mono text-[#1c3a14] font-bold text-[11px] bg-[#ffffff] px-2 py-0.5 border border-[#7ba770]">
                          {archivedHotspotModal.clueFragment.codeHint}
                        </span>
                      </div>
                      <p className="text-xs text-[#222222] leading-relaxed bg-[#ffffff] p-2.5 border border-[#a8c2a1]">
                        💡 <b>謎題指引</b>：{archivedHotspotModal.clueFragment.riddleText}
                      </p>
                    </div>
                  </div>

                  {/* Confirmation Button */}
                  <div className="bg-[#eef5eb] px-4 py-2.5 border-t border-[#b2cca9] shrink-0 flex justify-end">
                    <button
                      onClick={() => setArchivedHotspotModal(null)}
                      className="retro-web-btn px-4 py-1.5 text-xs text-[#1a3964] hover:text-[#b30000] font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>[ 確認收納線索並返回 ]</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ===================================================================== */}
          {/* DEEP DEDUCTION / PUZZLE SOLVING MODULE FOR SAFE                       */}
          {/* ===================================================================== */}
          <div className="bg-[#ffffff] border border-[#a8c2a1] p-3.5 sm:p-4 space-y-3 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d8ecd2] pb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#2b5420]" />
                <h3 className="font-bold text-sm text-[#1a3964]">
                  【深度推理】發財樹暗格密碼解析
                </h3>
              </div>
              <div className="text-xs font-mono">
                {isCipherSolved ? (
                  <span className="text-[#1c3a14] flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    暗號已破解：8804 (已解除機械鎖)
                  </span>
                ) : isMandatory3Completed ? (
                  <span className="text-[#b30000] font-bold">
                    ★ 3處謎題線索已搜齊，請比對線索推導密碼！
                  </span>
                ) : (
                  <span className="text-[#666666]">
                    需先勘查上方 3 處核心區域（進度：{mandatoryCompletedCount}/3）
                  </span>
                )}
              </div>
            </div>

            {/* Clues & Riddle Ribbon */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-[#556652] flex items-center justify-between">
                <span>目前掌握的謎題線索：</span>
                <span className="text-[#666666]">
                  {obtainedClues.length === 3 ? '全部 3 枚核心謎題已收納' : `已收納 ${obtainedClues.length} / 3`}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {obtainedClues.map((clue) => (
                  <div
                    key={clue.id}
                    className="p-2.5 bg-[#f7faf5] border border-[#a8c2a1] text-xs flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="text-[#1a3964] font-bold text-[11px] mb-1">
                        {clue.title}
                      </div>
                      <div className="text-[#333333] text-[11px] leading-relaxed">
                        {clue.riddleText}
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-[#1c3a14] font-bold border-t border-[#d8ecd2] pt-1">
                      {clue.codeHint}
                    </div>
                  </div>
                ))}
                {obtainedClues.length === 0 && (
                  <div className="col-span-full py-3 text-center text-xs text-[#777777]">
                    尚未搜集到線索碎片。請先勘查上方 3 個核心區域。
                  </div>
                )}
              </div>
            </div>

            {/* Deduction Interaction Box */}
            {!isCipherSolved ? (
              <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowSafeDialModal(true);
                  }}
                  disabled={!isMandatory3Completed}
                  className="w-full sm:w-auto retro-web-btn px-5 py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-[#1a3964] hover:text-[#b30000] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>[ 開啟保險箱機關：進入發財樹暗格密碼鎖介面 ➔ ]</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-[#f0f8ed] border border-[#7ba770] flex items-center justify-between text-xs text-[#1c3a14] font-bold">
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-[#2b5420]" />
                  <span>暗格密碼已破解！舊案卷宗已收納至隨身檔案袋中。</span>
                </div>
              </div>
            )}

            {cipherError && (
              <div className="text-xs text-red-600 flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{cipherError}</span>
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* 7TH SECRET HOTSPOT: FLOWERPOT SAFE                                    */}
          {/* ===================================================================== */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-[#1a3964]">
              【隱藏暗格保險櫃】：
            </div>

            <button
              onClick={handleOpenSecretSafe}
              disabled={!isCipherSolved && !isMandatory3Completed}
              className={`w-full p-3 border text-left transition-all flex flex-col md:flex-row md:items-center justify-between gap-2.5 ${
                !isCipherSolved
                  ? isMandatory3Completed
                    ? 'bg-[#ffffff] border-[#7ba770] hover:border-[#3e6634] text-[#1a3964] cursor-pointer shadow-2xs'
                    : 'bg-[#f7faf5] border-[#d0dcd0] opacity-60 cursor-not-allowed text-[#777777]'
                  : 'bg-[#f0f8ed] border-[#537e47] text-[#1c3a14] cursor-pointer shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`p-2 rounded-xs shrink-0 ${
                  !isCipherSolved 
                    ? isMandatory3Completed ? 'bg-[#3e6634] text-white' : 'bg-[#e5ede3] text-[#777777]' 
                    : 'bg-[#2b5420] text-white'
                }`}>
                  <Flower2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1a3964] flex items-center gap-2">
                    <span>{OFFICE_SECRET_HOTSPOT.title}</span>
                    {!isCipherSolved ? (
                      isMandatory3Completed ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#eef5eb] text-[#2b5420] border border-[#7ba770] font-bold">
                          ⚙ 可進行密碼解鎖
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#e5ede3] text-[#666666] border border-[#c5d8c1]">
                          🔒 線索未齊
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#3e6634] text-white font-bold">
                        🔓 機械鎖已解除 • 卷宗已收納
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#556652] mt-0.5 leading-relaxed">
                    {isCipherSolved ? '厚重櫃門已開啟，老所長封存之安祥路88號舊案卷宗已妥善收納。' : OFFICE_SECRET_HOTSPOT.sceneDescription}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {!isCipherSolved ? (
                  isMandatory3Completed && (
                    <span className="retro-web-btn px-3 py-1.5 text-xs text-[#1a3964] font-bold">
                      啟動密碼轉盤 ➔
                    </span>
                  )
                ) : (
                  <span className="text-xs text-[#1c3a14] font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ✓ 卷宗已收納
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Secret Safe Active Modal */}
          <AnimatePresence>
            {showSecretSafeModal && isCipherSolved && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  className="retro-forum-modal-window rounded-none max-w-xl w-full shadow-2xl space-y-0 text-[#222222] overflow-hidden"
                >
                  <div className="retro-forum-modal-header px-3 sm:px-4 py-2 flex items-center justify-between border-b border-[#2e4d26]">
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-[#f0f9ee]" />
                      <span className="font-bold text-sm sm:text-base text-white">
                        發財樹暗格保險箱內部（已開啟）
                      </span>
                    </div>
                    <button
                      onClick={() => setShowSecretSafeModal(false)}
                      className="text-xs text-[#d8ecd2] hover:text-white cursor-pointer"
                    >
                      ✕ 關閉
                    </button>
                  </div>

                  <div className="bg-[#ffffff] p-4 sm:p-5 space-y-3 text-[#222222]">
                    <p className="text-xs sm:text-sm text-[#333333] leading-relaxed">
                      保險箱厚重的精鋼櫃門敞開。最底層老所長封存的檔案袋封面上蓋著醒目的紅墨水印記：『安祥路88號 • 租客失聯舊案備案』。
                    </p>

                    <div className="bg-[#f7faf5] border border-[#a8c2a1] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <div className="text-xs font-bold text-[#1a3964]">
                          關鍵物證：【安祥路88號半年前舊案卷宗】
                        </div>
                        <div className="text-[11px] text-[#556652] mt-0.5">
                          半年前曾有前任房客在搬入該大樓後離奇失聯，案情模式完全一致。此卷宗已安全收納於隨身檔案袋中。
                        </div>
                      </div>

                      <span className="text-xs text-[#1c3a14] font-mono font-bold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        ✓ 已收納至檔案袋
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#eef5eb] px-4 py-2.5 border-t border-[#b2cca9] flex justify-end">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setShowSecretSafeModal(false);
                      }}
                      className="retro-web-btn px-4 py-1.5 text-xs text-[#1a3964] hover:text-[#b30000] font-bold cursor-pointer"
                    >
                      [ 關閉暗格檢視 ]
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Orthodox Safe Dial Minigame Modal */}
          <SafeDialMinigameModal
            isOpen={showSafeDialModal}
            clues={obtainedClues}
            onUnlockSuccess={() => {
              sound.playPaper();
              sound.playElevatorChime();
              setShowSafeDialModal(false);
              setInputCipher('8804');
              setIsCipherSolved(true);
              setIsSecretSafeOpened(true);
              setHasTakenOldCaseFile(true);
              onObtainItem(OFFICE_SECRET_HOTSPOT.rewardItem.id);
              if (onAddJournalEntry) {
                onAddJournalEntry({
                  category: 'action',
                  title: '取得關鍵物證：安祥路88號半年前舊案卷宗',
                  content: '透過解開密碼轉盤機關，從發財樹暗格保險箱中取出了封存的半年前舊案卷宗。記錄顯示半年前曾有前任房客在安祥路88號大樓離奇失聯，案情模式如出一轍。',
                  location: '私家偵探事務所'
                });
              }
            }}
            onClose={() => setShowSafeDialModal(false)}
          />

          {/* Action Bar to meet client */}
          <div className="pt-3 border-t border-[#b2cca9] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#556652]">
              {isAllOfficeExplored 
                ? '★ 事務所勘查已完成，舊案卷宗已入手！可接待委託人。' 
                : '尚待完成 3 處勘查並起出老所長暗格卷宗，方能接待委託人。'}
            </div>

            <button
              onClick={handleStartClientMeeting}
              disabled={!isAllOfficeExplored}
              className="retro-web-btn px-6 py-2 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-bold flex items-center gap-2 text-[#1a3964] hover:text-[#b30000] cursor-pointer"
            >
              <span>[ 接待委託人（陳先生） ➔ ]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* PSYCHOLOGICAL ARCHETYPE REVEAL MODAL (WITH HEXAGON RADAR CHART)          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showArchetypeReveal && revealedTrait && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="retro-forum-modal-window rounded-none max-w-2xl w-full shadow-2xl space-y-0 text-[#222222] my-auto overflow-hidden"
            >
              {/* Reveal Header */}
              <div className="retro-forum-modal-header px-4 py-2.5 flex items-center justify-between border-b border-[#2e4d26]">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-[#d8ecd2]" />
                  <span className="text-xs font-mono text-[#d8ecd2] font-bold uppercase tracking-wider">
                    INVESTIGATOR PROFILE // 六維思維特質分析結果
                  </span>
                </div>
              </div>

              <div className="bg-[#ffffff] p-5 sm:p-6 space-y-4 text-[#222222]">
                <div className="text-center space-y-1 border-b border-[#d8ecd2] pb-3">
                  <h2 className="text-lg sm:text-xl font-bold text-[#1a3964]">
                    你是以【{revealedTrait.name}】著名的偵探
                  </h2>
                  <div className="text-xs sm:text-sm font-mono text-[#2b5420] font-bold tracking-widest">
                    【{revealedTrait.title}】
                  </div>
                </div>

                {/* Tagline & Description */}
                <div className="space-y-2.5">
                  <blockquote className="p-3 bg-[#f7faf5] border-l-4 border-[#3e6634] text-[#1c3a14] text-xs sm:text-sm italic leading-relaxed">
                    {revealedTrait.tagline}
                  </blockquote>

                  <div className="p-3 bg-[#ffffff] border border-[#a8c2a1] space-y-1 shadow-2xs">
                    <div className="text-xs font-mono text-[#1a3964] font-bold uppercase">
                      偵探人格特質與辦案風格解析：
                    </div>
                    <p className="text-xs text-[#444444] leading-relaxed">
                      {revealedTrait.description}
                    </p>
                  </div>
                </div>

                {/* Six-Attribute Hexagon Radar Chart Visualization */}
                <div className="bg-[#f7faf5] p-3.5 border border-[#a8c2a1] space-y-2.5">
                  <div className="text-xs font-mono text-[#556652] flex items-center justify-between">
                    <span>偵探六大維度思維傾向雷達圖：</span>
                    <span className="text-[#1a3964] font-bold">細心 • 敏銳 • 勇敢 • 慎重 • 理性 • 直覺</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-1">
                    <TraitRadar 
                      scores={traitScores} 
                      maxScore={30}
                      size={220}
                      highlightTraitId={revealedTrait.id}
                    />

                    {/* Attribute Breakdown list */}
                    <div className="grid grid-cols-2 gap-2 w-full sm:w-56 text-xs font-mono">
                      {SIX_ATTRIBUTES.map((attr) => {
                        const score = traitScores[attr.id] || 0;
                        const isTop = attr.id === revealedTrait.id;

                        return (
                          <div
                            key={attr.id}
                            className={`p-2 border flex flex-col justify-between shadow-2xs ${
                              isTop
                                ? 'bg-[#eef5eb] border-[#3e6634] text-[#1c3a14] font-bold'
                                : 'bg-[#ffffff] border-[#d8ecd2] text-[#555555]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span 
                                  className="w-2 h-2 rounded-xs inline-block" 
                                  style={{ backgroundColor: attr.color }} 
                                />
                                <span>{attr.name}</span>
                              </span>
                              <span className="font-bold text-[#1a3964]">{score} pt</span>
                            </div>
                            <div className="text-[10px] text-[#777777] line-clamp-1 mt-0.5">
                              {attr.shortDesc}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm & Enter Client Meeting */}
              <div className="bg-[#eef5eb] px-4 py-3 border-t border-[#b2cca9] flex justify-end">
                <button
                  onClick={handleConfirmArchetypeAndEnterClient}
                  className="retro-web-btn px-6 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 text-[#1a3964] hover:text-[#b30000] cursor-pointer"
                >
                  <span>[ 以【{revealedTrait.name}】特質正式接見委託人 ➔ ]</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* STEP 3: INTERACTIVE DIALOGUE INQUIRY WITH THE CLIENT                      */}
      {/* ========================================================================= */}
      {step === 'client' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="retro-forum-modal-window rounded-none p-5 sm:p-7 shadow-2xl space-y-4"
        >
          <div className="border-b border-[#b2cca9] pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-[#2b5420] font-bold">
                DIALOGUE // 委託接洽與案情深詢 • 人格特質：【{activeTraitData.name}】
              </span>
              <h3 className="text-lg md:text-xl font-bold text-[#1a3964] mt-0.5">
                失蹤的好友與深陷迷霧的 504 號房
              </h3>
            </div>
            <div className="text-xs font-mono text-[#444444] bg-[#f7faf5] px-3 py-1 border border-[#a8c2a1]">
              已詢問線索：<b className="text-[#1a3964]">{askedTopicIds.length}</b> / {clientTopics.length}
            </div>
          </div>

          {/* Client Atmosphere Box */}
          <div className="bg-[#f7faf5] border border-[#a8c2a1] p-3.5 text-xs text-[#333333] leading-relaxed shadow-2xs">
            委託人陳先生滿頭大汗地坐在沙發對面，雙手緊緊攥著一杯溫水。他神情極度焦慮，眼神游移，顯然這幾天好友下落不明的折磨已讓他神經瀕臨極限。你可以向他詢問各項具體案情細節：
          </div>

          {/* Inquiry Topics List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-[#1a3964]">
                面對極度焦慮的陳先生，你打算……
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {clientTopics.map((topic) => {
                const isAsked = askedTopicIds.includes(topic.id);
                const isSelected = activeTopicId === topic.id;

                return (
                  <button
                    key={topic.id}
                    onClick={() => handleSelectTopic(topic.id)}
                    className={`p-3 border text-left transition-all flex items-start gap-2.5 shadow-2xs ${
                      isSelected
                        ? 'bg-[#eef5eb] border-[#2b5420] text-[#1c3a14] font-bold'
                        : isAsked
                          ? 'bg-[#f7faf5] border-[#d8ecd2] text-[#666666]'
                          : 'bg-[#ffffff] border-[#a8c2a1] hover:border-[#2b5420] text-[#1a3964]'
                    }`}
                  >
                    <div className={`p-1.5 shrink-0 mt-0.5 ${
                      isSelected 
                        ? 'bg-[#2b5420] text-white' 
                        : isAsked 
                          ? 'bg-[#e5ede3] text-[#777777]' 
                          : 'bg-[#1a3964] text-white'
                    }`}>
                      {isAsked ? <CheckCircle2 className="w-3.5 h-3.5 text-[#2b5420]" /> : <HelpCircle className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="text-xs font-bold leading-snug">
                        {topic.question}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        <span className={isAsked ? 'text-[#2b5420] font-bold' : 'text-[#666666]'}>
                          {isAsked ? '✓ 已獲取證言' : '向委託人訊問'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Response Panel */}
          <AnimatePresence>
            {activeTopicId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-[#ffffff] border border-[#a8c2a1] p-4 space-y-3 shadow-xs"
              >
                <div>
                  <div className="text-xs font-bold text-[#1a3964] font-mono mb-1.5 flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#2b5420]" />
                    <span>陳先生（委託人證言回覆）：</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#222222] leading-relaxed pl-3.5 border-l-2 border-[#2b5420]">
                    {clientTopics.find(t => t.id === activeTopicId)?.clientResponse}
                  </p>
                </div>

                <div className="bg-[#f7faf5] border border-[#b2cca9] p-3 text-xs text-[#2b5420] leading-relaxed shadow-2xs font-bold">
                  {TRAIT_CLIENT_INQUIRY_NOTES[activeTopicId]?.[selectedTrait] || '【偵探筆記】：紀錄委託人證言中關於大樓與失蹤事件之核心細節。'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Complete Meeting and Depart */}
          <div className="pt-3 border-t border-[#b2cca9] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#556652]">
              {askedTopicIds.length === 0 
                ? '建議向委託人至少詢問一項細節，以掌握大樓與失蹤者背景。' 
                : `已獲取 ${askedTopicIds.length} 條核心證言，隨身攜帶半年前舊案卷宗，隨時可出發。`}
            </div>

            <button
              onClick={() => {
                sound.playElevatorChime();
                setStep('building_arrival');
              }}
              className="retro-web-btn px-5 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 text-[#1a3964] hover:text-[#b30000] cursor-pointer"
            >
              <span>[ 正式接下委託：出發前往安祥路88號大樓 ➔ ]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: DEPARTURE ARRIVAL                                                 */}
      {/* ========================================================================= */}
      {step === 'building_arrival' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="retro-forum-modal-window rounded-none p-6 md:p-8 shadow-2xl space-y-4 text-center"
        >
          <div className="w-12 h-12 bg-[#24421f] mx-auto flex items-center justify-center text-white shadow-md">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-mono text-[#2b5420] font-bold uppercase tracking-widest">
              ARRIVED AT DESTINATION // 抵達現場 • 偵探特質：【{activeTraitData.name}】
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#1a3964]">
              {completedWeek1 ? '安祥路88號大樓 • 第八日白晝' : '安祥路88號大樓 • 抵達現場'}
            </h3>
            <p className="text-xs sm:text-sm text-[#444444] max-w-lg mx-auto leading-relaxed">
              {completedWeek1
                ? '計程車在老舊的住商混合大樓前停下。白晝的陽光灑在斑駁的水泥外牆上，老樓看似寧靜，暗流卻在隱秘湧動。你整理好公事包，於第八日白晝再次感應刷開大門踏入一樓大廳……'
                : '黃色計程車在老舊的住商混合大樓前停下。大樓外牆的水泥斑駁脫落，一樓大廳的昏黃日光燈不時閃爍。你收起雨傘，公事包中沉甸甸地裝著【半年前舊案卷宗】，跨過積水感應刷開了社區感應防盜鐵門……'
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                sound.playElevatorChime();
                if (!hasTakenOldCaseFile) {
                  onObtainItem('old_case_file');
                  setHasTakenOldCaseFile(true);
                }
                onProceedToApartment();
              }}
              className="retro-web-btn px-7 py-2.5 text-xs sm:text-sm font-bold inline-flex items-center gap-2 text-[#1a3964] hover:text-[#b30000] cursor-pointer"
            >
              <span>[ 踏入大樓一樓大廳 ➔ ]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
        </>
      )}
    </div>
  );
};
