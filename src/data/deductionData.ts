/**
 * Deduction Analysis Data
 * Detective case synthesis, rule contradiction matrix, and evidence linkages
 */

export interface CaseHypothesis {
  id: string;
  title: string;
  category: 'space' | 'guard' | 'entity' | 'victim';
  summary: string;
  fullAnalysis: string;
  requiredRuleIds: string[];
  requiredItemIds: string[];
  unlockHint: string;
  keyDeduction: string;
}

export interface RuleContradictionPair {
  id: string;
  ruleAId: string;
  ruleBId: string;
  title: string;
  clashSummary: string;
  pointOfContradiction: string;
  detectiveInsight: string;
  truthRevealed: string;
  fragmentId?: string;
  sanReward?: number;
}

export interface TruthFragment {
  id: string;
  contradictionId: string;
  title: string;
  sourceRules: [string, string];
  sourceRuleNames: [string, string];
  coreParadox: string;
  truthRevelation: string;
  detectiveQuote: string;
  sanReward: number;
}

export interface EvidenceLink {
  itemId: string;
  relevanceTo404: string;
  keyInsight: string;
  revealedParadox: string;
}

export const TRUTH_FRAGMENTS: Record<string, TruthFragment> = {
  frag_4f_physical: {
    id: 'frag_4f_physical',
    contradictionId: 'contra_resident_vs_cleaner',
    title: '真相碎片 #01：四樓的客觀物理存在與動線抹除',
    sourceRules: ['rule_resident', 'rule_cleaner'],
    sourceRuleNames: ['住戶規則', '清潔人員工作規則'],
    coreParadox: '住戶規則聲稱「大樓共四層樓沒有4樓」，而清潔規則直言「包含四樓共五層樓、404號房直接略過」。',
    truthRevelation: '大樓在物理上實實在在擁有五個樓層。管理委員會發布的住戶手冊旨在對常住居民施加認知催眠，而外包清潔公司未經徹底同化，其工作手冊忠實保留了客觀物理結構。',
    detectiveQuote: '「管委會不是在管理大樓，而是在管理『住戶看見什麼』。」',
    sanReward: 4
  },
  frag_cctv_truth: {
    id: 'frag_cctv_truth',
    contradictionId: 'contra_guard_vs_cctv',
    title: '真相碎片 #02：安控主機的客觀紀錄與鴕鳥條款',
    sourceRules: ['rule_guard', 'rule_cctv'],
    sourceRuleNames: ['警衛工作規則', '監視系統操作指引'],
    coreParadox: '警衛規則第10條要求「請忽略監視系統操作手冊」，但監視指引第1條強調「所有樓層皆應顯示，本系統不會出錯」。',
    truthRevelation: '保全公司的規則是受到某種外部壓力制定的「自我蒙蔽協議」，禁止警衛接觸主機；而監視主機作為客觀電器，其第4頻道忠實記錄了404空間與異常通道。',
    detectiveQuote: '「當一條規則要求你『不要去看儀器』時，儀器上記錄的必定就是致命的真相。」',
    sanReward: 4
  },
  frag_red_predator: {
    id: 'frag_red_predator',
    contradictionId: 'contra_fake_vs_handwritten',
    title: '真相碎片 #03：紅色制服的同化誘餌與求生真理',
    sourceRules: ['rule_fake_evacuation', 'rule_handwritten'],
    sourceRuleNames: ['大樓緊急避難指引', '手寫的規則'],
    coreParadox: '偽造指引宣稱「專案人員穿紅衣，有需求可前往404專案室」，而手寫便條警告「規則是要管理它不是你，假裝不知道你知道，快逃」。',
    truthRevelation: '所謂「專案辦公室」與「紅衣專案人員」是404怪異實體化後的捕食陷阱；手寫便條的前任受害者用血淚揭示了規則的寄生本質——規則越被信任，怪異力量越龐大。',
    detectiveQuote: '「怪物學會了印製公文，用『安全』的口號將羔羊誘入屠宰場。」',
    sanReward: 5
  },
  frag_staff_compromise: {
    id: 'frag_staff_compromise',
    contradictionId: 'contra_cleaner_vs_guard',
    title: '真相碎片 #04：基層人員的默契與盲從協議',
    sourceRules: ['rule_cleaner', 'rule_guard'],
    sourceRuleNames: ['清潔人員工作規則', '警衛工作規則'],
    coreParadox: '清潔規則明記「若警衛堅持四樓不存在，請不要與他爭辯」，而警衛規則嚴厲要求「大樓共四層樓沒有4樓」。',
    truthRevelation: '大樓內部各單位早就知曉彼此說辭自相矛盾，但為了維護脆弱的表面穩定，各方在規約中簽訂了「互不揭穿」的盲從協議。集體沉默最終孕育了怪異實體。',
    detectiveQuote: '「最可怕的不是鬼魂，而是所有活人都默契地假裝看不見房間裡的大象。」',
    sanReward: 4
  },
  frag_resident_trap: {
    id: 'frag_resident_trap',
    contradictionId: 'contra_resident_vs_fake',
    title: '真相碎片 #05：偽造避難公約的全面認知反轉',
    sourceRules: ['rule_resident', 'rule_fake_evacuation'],
    sourceRuleNames: ['住戶規則', '大樓緊急避難指引'],
    coreParadox: '住戶規則警告「警衛制服為白衣黑褲，穿其他顏色請忽略」，偽造指引卻宣稱「專案人員穿紅衣，主動尋求其協助」。',
    truthRevelation: '404怪異正企圖以「大樓管理處改制更新」為名，將舊有規則中所有的安全戒律完全反轉，誘導殘存住戶與調查員主動投降。',
    detectiveQuote: '「它開始改寫既有規則，將原本的危險標記篡改為安全指南。」',
    sanReward: 4
  },
  frag_entity_parasitism: {
    id: 'frag_entity_parasitism',
    contradictionId: 'contra_cctv_vs_handwritten',
    title: '真相碎片 #06：規則自我繁殖與認知逆向反噬',
    sourceRules: ['rule_cctv', 'rule_handwritten'],
    sourceRuleNames: ['監視系統操作指引', '手寫的規則'],
    coreParadox: '監視指引第6、7條「若在畫面中看到自己，立即重啟系統」，手寫便條「規則是要管理它，不是你；假裝不知道你知道」。',
    truthRevelation: '怪異透過「強迫受害者確認自我」來施加認知錨定。只要利用主機重啟進行邏輯重置，並在心理上拒絕承認其規則權威，就能瓦解怪異的支配領域。',
    detectiveQuote: '「只要我們拒絕成為它的讀者，這場荒誕的怪談便無法繼續書寫。」',
    sanReward: 5
  }
};

export const DELIRIUM_WHISPERS: string[] = [
  '「這兩份規則根本沒有衝突……你只是在自己發瘋的大腦裡胡亂拼湊……」',
  '「規則是絕對且完美的……有問題的只有你那正在崩潰的理智……」',
  '「眼前的黑字開始在紙面蠕動……它們不是文字，是排隊鑽進你眼球的幼蟲……」',
  '「大樓深處傳來陣陣打字機的嘲弄聲……你正在失去分辨因果邏輯的能力……」',
  '「別再強行解構了……承認吧，你已經是404的一部分了……」',
  '「你把毫無關聯的文字劃上紅線……空氣中彌漫著神經燒焦的刺鼻臭味……」'
];

export const WEEK1_CASE_HYPOTHESES: CaseHypothesis[] = [
  {
    id: 'hypo_w1_zhanghao',
    title: '失蹤者張浩的生活跡證與最後通訊',
    category: 'victim',
    summary: '張浩於數日前突然失聯，委託人最後收到的通訊指向安祥路88號大樓。現場504號房遺留未喝完的咖啡與乾涸斑跡。',
    fullAnalysis: '經由委託人陳先生說明與504號房現場初步搜查，張浩並非正常退租搬離。桌上的咖啡杯底仍留有乾涸硬斑，床鋪凌亂，種種跡象顯示他離開時極為匆忙，甚至是在極度倉皇的狀態下失蹤。必須仔細搜查房間各個角落，尋找他留下的求救或受困痕跡。',
    requiredRuleIds: ['rule_resident'],
    requiredItemIds: ['key_504'],
    unlockHint: '需向值班警衛借取504號房鑰匙並進入搜查',
    keyDeduction: '張浩必定還在樓內或留有關鍵線索！房間各角落皆為搜查重點。'
  },
  {
    id: 'hypo_w1_room504',
    title: '504號房現場搜查目標',
    category: 'space',
    summary: '已自警衛室借得504號房鑰匙，需前往五樓深入房內，勘查失蹤者張浩的生活痕跡與隨身物品。',
    fullAnalysis: '取得504號房鑰匙後，當前最核心的任務是進入張浩的承租居所。需仔細檢視茶几、書桌與房間各處角落，確認張浩是否真的如警衛所言已搬離，亦或房內留有緊急求救的蛛絲馬跡。',
    requiredRuleIds: [],
    requiredItemIds: ['key_504'],
    unlockHint: '向一樓值班警衛借得504號房鑰匙後開啟目標',
    keyDeduction: '前往五樓504號房開門搜查，確認房內是否有生還者或關鍵生活跡證。'
  },
  {
    id: 'hypo_w1_guard',
    title: '一樓值班台警衛王大偉的說辭矛盾',
    category: 'guard',
    summary: '警衛王大偉聲稱張浩早已退租離開，但其值班台窗口卻仍妥善保管著504號房鑰匙。',
    fullAnalysis: '值班警衛聲稱張浩已經搬走，但大樓訪客登記簿與房間鑰匙的保管狀態卻自相矛盾。若租客早已退租，房間理應交還房東或清空，然而504號房鑰匙仍留在警衛手邊，且房內所有生活用品均未帶走。警衛態度迴避但並未完全封鎖，向其借得鑰匙即可進入504號房開展搜查。',
    requiredRuleIds: [],
    requiredItemIds: ['key_504'],
    unlockHint: '向警衛對話並索取504號房鑰匙',
    keyDeduction: '警衛的說辭存有疑點，但當務之急是先進入504號房確認失蹤者安危。'
  }
];

export const CASE_HYPOTHESES: CaseHypothesis[] = [
  {
    id: 'hypo_4f_space',
    title: '四樓空間的物理存在與集體認知遮蔽',
    category: 'space',
    summary: '四樓並非不存在，而是建商在1998～2002年間違建加蓋被稽查後，以物理遮蔽與心理暗示強行抹除，並在2002～2012十年間形成歷史空白。',
    fullAnalysis: '根據1998～2002年違建施工公文與原始建築藍圖，建商當年私自加蓋4樓。2002年因產權糾紛與違建停工後，大樓陷入長達十年的產權空白期（2002～2012）。為了規避工務局拆除並私下轉租，管理方在電梯加裝無字遮片、將樓梯轉角油漆塗改成5F，並散播「沒有四樓」的強烈暗示。在長年集體妥協與未知的空白歷史侵蝕下，謊言最終凝結成了具備侵蝕力的規則怪異。',
    requiredRuleIds: ['rule_resident', 'rule_guard', 'rule_cleaner'],
    requiredItemIds: ['building_blueprints'],
    unlockHint: '需搜集大樓公設規約與1998～2002原始建築圖紙',
    keyDeduction: '四樓是真實存在的物理空間！只要以客觀藍圖與監視中控打破心理暗示，認知遮蔽便會瓦解。'
  },
  {
    id: 'hypo_guard_identity',
    title: '警衛雙重身份與紅色巡邏實體之謎',
    category: 'guard',
    summary: '白衣警衛代表順從體制，便服為日常真相，而走廊中的紅衣人影是怪異的同化使者。',
    fullAnalysis: '值班警衛王大偉自稱身穿「白衣黑褲」，並要求住戶無視其他制服；然而二樓清潔員李阿姨卻證實「大樓警衛平時都穿自己便服」。在走廊與電梯中不時閃現的「紅色制服巡邏者」，以及偽造避難指引中聲稱的「專案人員穿紅衣」，實際上是404怪異實體化後派出的同化誘捕者，專門誘騙落單者踏入404號房成為打字機的養分。',
    requiredRuleIds: ['rule_guard', 'rule_fake_evacuation', 'rule_cleaner'],
    requiredItemIds: [],
    unlockHint: '需比對多份大樓人員規約與安全指引',
    keyDeduction: '紅色制服是極度危險的怪異偽裝！絕不可聽從紅衣實體的任何指引或靠近404專案辦公室。'
  },
  {
    id: 'hypo_typewriter_entity',
    title: '深夜打字機與「規則自我繁殖」生態',
    category: 'entity',
    summary: '404號房以「規則與服從」為食糧；人們越盲從規則，怪異力量越龐大。',
    fullAnalysis: '失蹤者張浩在錄音筆中留下了最關鍵的真相：「那些打字機停不下來……只要大家相信規則，404就會一直吃人！」404號房並非單純的凶宅，而是一個以「規則邏輯」為骨架的認知寄生體。它透過不斷吐出相互矛盾的紙條，迫使受害者在焦慮與恐懼中遵守規定，進而將受害者的意識同化為房間中央的打字機操作員。',
    requiredRuleIds: ['rule_handwritten', 'rule_cctv'],
    requiredItemIds: ['tape_recorder', 'shredded_letter'],
    unlockHint: '需搜集失蹤者遺留紀錄與深層怪異規約',
    keyDeduction: '規則不是為保護人類而生，而是怪異捕食的工具。唯有從概念層面解構規則，才能徹底消滅404！'
  },
  {
    id: 'hypo_victim_zhanghao',
    title: '失蹤者張浩的生存狀態與救援契機',
    category: 'victim',
    summary: '張浩並未死亡，而是被困在404號房核心，正用殘存理智抵抗同化。',
    fullAnalysis: '在504號房中發現了杯底乾涸數日的咖啡硬斑、有效日期為四天前的凝固鮮奶以及沾著工地紅磚泥的皮鞋，證實張浩在大約四、五天前仍有行動能力；門口垃圾桶中被剪碎的「寄給404號房的信」則表明他曾試圖與怪異溝通或求救。目前張浩被困在404號房的打字機陣列中，若能在他理智崩潰前以真相喚醒他，便能將他活著帶出大樓！',
    requiredRuleIds: ['rule_resident'],
    requiredItemIds: ['key_504', 'shredded_letter', 'tape_recorder'],
    unlockHint: '需實地勘查失蹤者居住處並搜集其貼身物品',
    keyDeduction: '張浩尚有一線生機！必須在理智徹底潰散前查明404本質並切斷怪異對其思維的侵蝕。'
  }
];

export const RULE_CONTRADICTIONS: RuleContradictionPair[] = [
  {
    id: 'contra_resident_vs_cleaner',
    ruleAId: 'rule_resident',
    ruleBId: 'rule_cleaner',
    title: '【住戶守則】 vs 【清潔人員工作守則】',
    clashSummary: '樓層數量、404號房存在性與移動動線之全面矛盾',
    pointOfContradiction: '1. 住戶守則宣稱「大樓共四層樓，沒有4樓」；清潔員守則卻明文「包含四樓在內共五層樓，404號房直接略過」。\n2. 住戶守則要求「如遇異常請搭電梯移動」；清潔員守則卻指示「非必要請優先使用樓梯移動」。',
    detectiveInsight: '清潔員為外包外來人員，其守則保留了真實的大樓樓層結構；而住戶守則是由管委會發布，旨在對常住居民施加認知遮蔽。兩者在動線上的相反建議，暗示電梯在異常時容易受到404空間的重度干擾。',
    truthRevealed: '大樓確實為五層樓，四樓與404號房客觀存在。',
    fragmentId: 'frag_4f_physical',
    sanReward: 4
  },
  {
    id: 'contra_guard_vs_cctv',
    ruleAId: 'rule_guard',
    ruleBId: 'rule_cctv',
    title: '【警衛工作守則】 vs 【監視系統操作指引】',
    clashSummary: '中控監視畫面真實性與第10條「故意忽視」條款',
    pointOfContradiction: '1. 警衛守則第10條明確要求「請忽略監視系統操作手冊」；但監視系統操作指引第1條強調「所有樓層皆應顯示於監視器中，包含四樓，本系統不會出錯」。\n2. 警衛堅稱大樓無4樓，但監視主機第4頻道即為「404走廊」。',
    detectiveInsight: '保全公司的守則是受到管理處施壓後制定的鴕鳥條款，刻意禁止警衛查看監視器手冊；而監視系統作為客觀的電子儀器，忠實記錄了4樓空間的存在與能量波動。',
    truthRevealed: '警衛室控制台的【深度推理】是重置監視器、解除4樓遮蔽的關鍵中樞！',
    fragmentId: 'frag_cctv_truth',
    sanReward: 4
  },
  {
    id: 'contra_fake_vs_handwritten',
    ruleAId: 'rule_fake_evacuation',
    ruleBId: 'rule_handwritten',
    title: '【大樓緊急避難指引】 vs 【手寫的規則】',
    clashSummary: '紅衣專案人員之真偽與404誘捕陷阱',
    pointOfContradiction: '1. 偽造指引宣稱「404號房為專案辦公室，專案人員穿紅衣，電梯優先停靠4樓」；\n2. 手寫便條警告「4樓與404一直都在……規則是要管理『它』不是你……假裝不知道你知道，快逃」。',
    detectiveInsight: '偽造指引是怪異為了引誘倖存者自投羅網所編寫的誘餌；手寫便條則是前任受害者在清醒時留下的真實求生指引，揭露了規則並非保護機制，而是怪異同化人類的協議。',
    truthRevealed: '絕不可相信穿紅色制服的專案人員，也不可盲從偽造避難指引！',
    fragmentId: 'frag_red_predator',
    sanReward: 5
  },
  {
    id: 'contra_cleaner_vs_guard',
    ruleAId: 'rule_cleaner',
    ruleBId: 'rule_guard',
    title: '【清潔人員工作守則】 vs 【警衛工作守則】',
    clashSummary: '基層默契與「互不爭辯」的盲從協議',
    pointOfContradiction: '1. 清潔守則第1條「本大樓包含四樓共五層樓，若警衛堅持四樓不存在，請不要與他爭辯」；\n2. 警衛守則第1條「本大樓共四層樓，沒有4樓」。',
    detectiveInsight: '兩家外包保全與清潔公司的規約直接產生了「自我指涉的衝突」，清潔手冊甚至預設了警衛會說謊，印證了大樓管理階層早已知曉謊言存在，並以規約形式維護集體盲從。',
    truthRevealed: '大樓所有工作人員均被迫遵守相互矛盾的言論禁令以維持脆弱的表面秩序。',
    fragmentId: 'frag_staff_compromise',
    sanReward: 4
  },
  {
    id: 'contra_resident_vs_fake',
    ruleAId: 'rule_resident',
    ruleBId: 'rule_fake_evacuation',
    title: '【住戶守則】 vs 【大樓緊急避難指引】',
    clashSummary: '管委會原版防線與偽造避難指引的逆向奪權',
    pointOfContradiction: '1. 住戶守則警告「警衛制服為白衣黑褲，若穿其他顏色自稱警衛請忽略他」；\n2. 偽造避難指引卻聲稱「專案人員將穿著紅色制服，可主動向其尋求協助，遇到宣稱危險者為非法抗議民眾」。',
    detectiveInsight: '怪異企圖以官方管理處的姿態頒布新規定，刻意將原本的「警戒對象（紅衣）」洗白為「求助對象」，並將清醒的示警者抹黑為「非法抗議者」。',
    truthRevealed: '404怪異具備高超的認知偽裝與公文造假能力，專門獵殺順從官方權威的受害者。',
    fragmentId: 'frag_resident_trap',
    sanReward: 4
  },
  {
    id: 'contra_cctv_vs_handwritten',
    ruleAId: 'rule_cctv',
    ruleBId: 'rule_handwritten',
    title: '【監視系統操作指引】 vs 【手寫的規則】',
    clashSummary: '自我鏡像同化與「假裝不知道」的反同化生存法則',
    pointOfContradiction: '1. 監視指引第6、7條「若在畫面中看到自己且無法確認在警衛室，立即重啟系統」；\n2. 手寫便條「規則是要管理『它』，不是你；假裝不知道你知道」。',
    detectiveInsight: '監視器看到「另一個自己」是怪異正在進行意識替換的同化進程；手寫便條點明怪異依賴受害者的認知與服從來壯大，重啟中控系統能切斷這種精神錨定。',
    truthRevealed: '保持理性批判、拒絕將自我投射入規則之中，是破除404怪異的核心法門。',
    fragmentId: 'frag_entity_parasitism',
    sanReward: 5
  }
];

export const EVIDENCE_NETWORK: Record<string, EvidenceLink> = {
  building_blueprints: {
    itemId: 'building_blueprints',
    relevanceTo404: '證明4樓為1998～2002年非法加蓋違建，並記錄了2002～2012長達十年的產權空白歷史。',
    keyInsight: '物理層面的違建掩飾 ➔ 產生集體妥協與空白 ➔ 具現化為規則怪談。',
    revealedParadox: '打破「404是不可觸及的純虛構空間」的迷思，證實其起源為建商隱匿違建與群體盲從暗示。'
  },
  tape_recorder: {
    itemId: 'tape_recorder',
    relevanceTo404: '錄下了失蹤者張浩在404門口的最後清醒發言。',
    keyInsight: '「只要大家相信規則，404就會一直吃人！」',
    revealedParadox: '揭開規則的寄生性——規則是怪異的食物，越遵守越深陷其中。'
  },
  shredded_letter: {
    itemId: 'shredded_letter',
    relevanceTo404: '在504號房垃圾桶中被剪碎的信件，拼合後寄件人與收件地址皆為「404號房」。',
    keyInsight: '404號房在空間自閉合狀態下，不斷向外發出求救與警告。',
    revealedParadox: '504號房並非空屋，失蹤者在進入404前曾反覆掙扎與自我預警。'
  },
  key_504: {
    itemId: 'key_504',
    relevanceTo404: '警衛借出的銅製鑰匙，可開啟五樓504號房。',
    keyInsight: '警衛聲稱504為「搬空一年」的空屋，但開門後屋內卻有四、五天前未收拾的生活痕跡與咖啡漬。',
    revealedParadox: '直接戳破警衛「搬空一年」的說詞，證實大樓人員在刻意隱瞞近期住戶活動。'
  },
  old_case_file: {
    itemId: 'old_case_file',
    relevanceTo404: '事務所發財樹暗格取出的半年前舊案卷宗。',
    keyInsight: '半年前曾有前任房客在搬入404後離奇失蹤，案情模式完全一致。',
    revealedParadox: '證實404號房是長期循環的失蹤陷阱，非單一偶發事件。'
  }
};
