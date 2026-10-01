import { TraitId } from '../types';

export type TraitScoreMap = Record<TraitId, number>;

export interface OfficeQuizOption {
  id: string;
  label: string;
  thought: string;
  scores: TraitScoreMap; // Composite score mapping
}

export interface OfficeQuizQuestion {
  id: string;
  stepNumber: number;
  questionTitle: string;
  prompt: string;
  options: OfficeQuizOption[]; // 3-4 crisp options per question
}

export interface OfficeClueFragment {
  id: string;
  hotspotId: string;
  title: string;
  sourceArea: string;
  fragmentSummary: string;
  codeHint: string;
  riddleText: string;
}

export interface OfficeHotspotQuiz {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  sceneDescription: string;
  clueFragment: OfficeClueFragment;
  questions: OfficeQuizQuestion[];
}

export const OFFICE_MANDATORY_HOTSPOTS: OfficeHotspotQuiz[] = [
  {
    id: 'pc',
    title: '辦公室電腦',
    subtitle: '失蹤人口協尋資料庫與歷史查詢日誌',
    iconName: 'Monitor',
    sceneDescription: '螢幕顯示著民間偵探聯防資料庫。光標閃爍在安祥路一帶的案件目錄上，歷史查詢日誌顯示多起失聯通報呈現異常聚集，且前任偵探留下的檔案索引標籤格外醒目。',
    clueFragment: {
      id: 'clue_pc',
      hotspotId: 'pc',
      title: '【資料庫紀錄】安祥路建案地籍號',
      sourceArea: '辦公室電腦',
      fragmentSummary: '工務局登記底冊顯示：該大樓之地籍登記建案編號，前綴直接沿用了大樓門牌號碼。',
      codeHint: '一號鎖：大樓建案地籍代碼（即門牌編號）',
      riddleText: '地籍檔案索引：該大樓正式建檔登記時，依規以其座落之門牌號碼作為地籍前綴編碼。'
    },
    questions: [
      {
        id: 'pc_q1',
        stepNumber: 1,
        questionTitle: '第一階段：初探龐雜資料庫之切入思維',
        prompt: '面對螢幕上密集排列的失蹤通報與歷史日誌，你打算……',
        options: [
          {
            id: 'pc_q1_opt_1',
            label: '統計失蹤通報的時間序列與數據分佈，篩選關鍵人為矛盾點',
            thought: '「多起失聯集中於同一個街區，這絕非巧合。必須以時間軸與數據為基底，抽絲剝繭找出人為隱瞞的漏洞。」',
            scores: { rationalist: 8, deconstructor: 5, cautious: 2, empath: 0, pragmatist: 0, intuitive: 0 }
          },
          {
            id: 'pc_q1_opt_2',
            label: '細讀求助留言字句，深刻體會受害者家屬的孤立與無助',
            thought: '「螢幕另一端每行顫抖的文字都是一個破碎的家庭。唯有深刻理解他們的無助，才能體會失蹤者身處的險境。」',
            scores: { empath: 8, intuitive: 5, cautious: 2, rationalist: 0, deconstructor: 0, pragmatist: 0 }
          },
          {
            id: 'pc_q1_opt_3',
            label: '迅速整理失蹤者張浩的通聯時間與關鍵背景，便於稍後當面核實',
            thought: '「光在螢幕前看名單不夠具體。把通聯時間與關鍵事實記在筆記本上，待會當面逐條向陳先生核對清楚。」',
            scores: { pragmatist: 8, cautious: 2, rationalist: 2, deconstructor: 1, empath: 1, intuitive: 1 }
          },
          {
            id: 'pc_q1_opt_4',
            label: '凝視閃爍的光標，憑藉多年辦案直覺察覺失聯背後不尋常的隱情',
            thought: '「看著失蹤名單，直覺隱隱感到不對勁……這些人失聯前的生活軌跡過於突兀，案情絕非單純的離家出走。」',
            scores: { intuitive: 8, empath: 4, cautious: 2, deconstructor: 1, rationalist: 0, pragmatist: 0 }
          }
        ]
      },
      {
        id: 'pc_q2',
        stepNumber: 2,
        questionTitle: '第二階段：深挖通訊封包與例外錯誤代碼',
        prompt: '檢索日誌時，發現查詢「安祥路88號」會觸發中斷例外，你打算……',
        options: [
          {
            id: 'pc_q2_opt_1',
            label: '解析封包通訊例外代碼，尋找人為構建的系統遮蔽規則與後門',
            thought: '「資料庫在檢索該地址時存在固定位元的阻斷回傳，這背後顯然存在著某種人為構建的特定遮蔽協議。」',
            scores: { deconstructor: 8, rationalist: 5, cautious: 2, intuitive: 0, pragmatist: 0, empath: 0 }
          },
          {
            id: 'pc_q2_opt_2',
            label: '比對安祥路周遭的治安紀錄與報案死角，釐清過去警務通報紀錄',
            thought: '「連老所長當年在案卷上都留下過謹慎字樣……在接待委託人前，先把該區的治安背景摸個透徹，才能做出客觀評估。」',
            scores: { cautious: 8, rationalist: 3, deconstructor: 3, pragmatist: 1, empath: 0, intuitive: 0 }
          },
          {
            id: 'pc_q2_opt_3',
            label: '調閱工務局官方地籍建案底冊，鎖定大樓最初核准的地籍登記編號',
            thought: '「不論官方或民間資料如何混亂，建築登記的原始地籍前綴就是最堅固的客觀事實錨點。」',
            scores: { rationalist: 6, deconstructor: 5, pragmatist: 4, cautious: 0, empath: 0, intuitive: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'phone',
    title: '傳統掀蓋行動電話與通訊手冊',
    subtitle: '答錄機語音留言與老所長手寫存檔條例',
    iconName: 'Phone',
    sceneDescription: '傳統按鍵掀蓋行動電話的綠色單色螢幕亮起，伴隨著辦公桌答錄機紅燈閃爍。除了陳先生的求助通話與留言外，電話機旁夾著一本老所長親筆寫下的「事務所檔案室管理條例」手寫通訊冊，記錄著當年事務所成立時設定的暗格保險編碼規則。',
    clueFragment: {
      id: 'clue_phone',
      hotspotId: 'phone',
      title: '【通訊備忘】舊卷宗封存編號',
      sourceArea: '掀蓋行動電話與通訊手冊',
      fragmentSummary: '手寫通訊手冊內頁寫著老所長的叮嚀：「街區懸案檔案編目，一律以該處舊案封存之年份末兩位建檔。」',
      codeHint: '二號鎖：該街區懸案舊卷宗之封存年份末兩位',
      riddleText: '存檔條例：通訊冊首頁備忘提及，八年前（2004年）老所長正式將該大樓連環舊案以此封存年份代碼【04】作結歸檔。'
    },
    questions: [
      {
        id: 'phone_q1',
        stepNumber: 1,
        questionTitle: '第一階段：解讀語音留言與通訊環境',
        prompt: '聆聽答錄機裡陳先生焦急的求助錄音，你打算……',
        options: [
          {
            id: 'phone_q1_opt_1',
            label: '辨析背景的高頻電流雜音與底噪，推斷通話地點鄰近特定電氣機房',
            thought: '「電話背景音的電流脈衝具有固定週期，這代表通話地點附近存在高壓配電機房或特殊大型變壓設備。」',
            scores: { rationalist: 8, deconstructor: 5, cautious: 2, pragmatist: 0, intuitive: 0, empath: 0 }
          },
          {
            id: 'phone_q1_opt_2',
            label: '體會陳先生急促喘息中的自責與恐慌，準備給予他專業的情緒支撐',
            thought: '「那種親眼目睹常理崩塌的絕望感做不了假……陳先生正處於崩潰邊緣，需要給予他專業的心理支撐。」',
            scores: { empath: 8, intuitive: 4, cautious: 2, rationalist: 1, deconstructor: 0, pragmatist: 0 }
          },
          {
            id: 'phone_q1_opt_3',
            label: '理清桌面諮詢紀錄表，準備好錄音筆，等待引導陳先生入座詳談',
            thought: '「與其反覆臆測錄音片段，不如把接待桌整理好，等陳先生敲門進來後，當面逐一釐清失蹤當天的所有時間線。」',
            scores: { pragmatist: 8, cautious: 3, rationalist: 2, empath: 2, deconstructor: 0, intuitive: 0 }
          },
          {
            id: 'phone_q1_opt_4',
            label: '憑藉直覺捕捉錄音中陳先生欲言又止的停頓，判斷他有話未說盡',
            thought: '「陳先生在電話裡的停頓很不自然……直覺告訴我，他可能因為極度恐慌而漏講了某段重要的前因後果。」',
            scores: { intuitive: 8, empath: 4, cautious: 3, pragmatist: 0, deconstructor: 0, rationalist: 0 }
          }
        ]
      },
      {
        id: 'phone_q2',
        stepNumber: 2,
        questionTitle: '第二階段：查閱老所長加密備忘手冊',
        prompt: '翻閱通訊冊內老所長留下的加密備忘，你打算……',
        options: [
          {
            id: 'phone_q2_opt_1',
            label: '拆解備忘錄中的編碼規範，確認舊案封存年份為首起事件年份',
            thought: '「老所長在筆記中明確規範：凡涉及該大樓失聯疑雲之舊案，檔案鎖以通報年份末兩位鎖定。」',
            scores: { deconstructor: 8, rationalist: 5, cautious: 2, intuitive: 0, pragmatist: 0, empath: 0 }
          },
          {
            id: 'phone_q2_opt_2',
            label: '重溫老所長在管理條例中強調的保密規約，確保委託人隱私與檔案安全',
            thought: '「老所長在條例中反覆強調委託檔案的保密與客觀查證。在正式接待委託人前，必須遵循規章保持專業客觀。」',
            scores: { cautious: 8, deconstructor: 3, rationalist: 3, intuitive: 1, pragmatist: 0, empath: 0 }
          },
          {
            id: 'phone_q2_opt_3',
            label: '從心理學角度分析求助信中的強烈焦慮用詞，評估委託人當前的精神壓力狀態',
            thought: '「分析錄音中的高頻恐慌字眼，可以判斷陳先生此時承受著極大的心理重壓，稍後交談時需要採取適當的引導策略。」',
            scores: { rationalist: 6, deconstructor: 5, intuitive: 4, empath: 0, cautious: 0, pragmatist: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'corkboard',
    title: '牆面軟木線索板',
    subtitle: '城市重大懸案剪報與地圖圖釘坐標',
    iconName: 'Eye',
    sceneDescription: '軟木板上釘滿了市區三年來的剪報。紅線交錯的中心點被一顆紅色圖釘深深刺入，坐標網格交會處赫然標記著『安祥路 88 號 • 空間異常軸線』。',
    clueFragment: {
      id: 'clue_corkboard',
      hotspotId: 'corkboard',
      title: '【便籤筆記】暗格雙鎖連動規則',
      sourceArea: '軟木線索板',
      fragmentSummary: '便籤記載：「暗格連動雙鎖。一號鎖對齊地籍代碼，二號鎖對齊舊案年份。每具鎖內圈為首位，外圈為次位。」',
      codeHint: '雙鎖對應：一號鎖（地籍門牌）與二號鎖（舊案年份）',
      riddleText: '保險栓備忘：暗格由兩具雙環密碼鎖並列鎖定。左側一號鎖對準大樓地籍代碼，右側二號鎖對準首案封存年份。每組轉盤以內圈為首位數字、外圈為次位數字。'
    },
    questions: [
      {
        id: 'corkboard_q1',
        stepNumber: 1,
        questionTitle: '第一階段：審視地圖網格與空間坐標',
        prompt: '站在密密麻麻的紅線剪報與地圖前，你打算……',
        options: [
          {
            id: 'corkboard_q1_opt_1',
            label: '以安祥路88號為坐標原點，比對該建築周遭街道格局與產權沿革',
            thought: '「將剪報中的目擊地點與地籍圖重疊，這棟大樓在產權與空間格局變更上有著諸多疑點，值得深入深究。」',
            scores: { rationalist: 8, deconstructor: 5, cautious: 2, pragmatist: 0, intuitive: 0, empath: 0 }
          },
          {
            id: 'corkboard_q1_opt_2',
            label: '細看張浩的生平剪影與生活紀錄，體會青年獨在異鄉失聯前的無助',
            thought: '「看著失蹤青年留在便條上的字跡……一位初入社會的青年在陌生環境中突然失聯，家屬該有多麼焦急。」',
            scores: { empath: 8, intuitive: 4, cautious: 2, rationalist: 1, deconstructor: 0, pragmatist: 0 }
          },
          {
            id: 'corkboard_q1_opt_3',
            label: '梳理大樓歷年報案與改建紀錄，建立清晰的事件發生時間軸',
            thought: '「把這棟大樓歷年來的改建與零星報案紀錄標註在地圖旁，這樣待會陳先生說明時便能迅速對照。」',
            scores: { cautious: 8, pragmatist: 4, rationalist: 3, deconstructor: 0, empath: 0, intuitive: 0 }
          },
          {
            id: 'corkboard_q1_opt_4',
            label: '凝視交錯紅線的中心坐標，直覺感應這起失蹤案背後牽扯長期隱情',
            thought: '「凝視著地圖上的紅線交會點，直覺告訴我，這棟大樓內部很可能存在著不為人知的歷史隱情。」',
            scores: { intuitive: 8, empath: 4, deconstructor: 3, rationalist: 0, cautious: 0, pragmatist: 0 }
          }
        ]
      },
      {
        id: 'corkboard_q2',
        stepNumber: 2,
        questionTitle: '第二階段：推導右下角暗號公式便條',
        prompt: '查看軟木板右下角泛黃便條上的密碼提示，你打算……',
        options: [
          {
            id: 'corkboard_q2_opt_1',
            label: '嚴謹比對電腦地籍前綴【88】與通訊冊封存尾數【04】，推導出4位數密碼【8804】',
            thought: '「前綴88代表大樓地籍編號，後綴04代表舊案封存年份。兩者結合便是暗格的機械解鎖密碼【8804】！」',
            scores: { deconstructor: 8, rationalist: 5, pragmatist: 2, cautious: 0, empath: 0, intuitive: 0 }
          },
          {
            id: 'corkboard_q2_opt_2',
            label: '審視老所長在便條旁留下的備註說明，小心翼翼依照程序開啟老舊保險櫃',
            thought: '「老所長在密碼旁標註了慎重處理。這份封存半年的檔案相當珍貴，必須小心取出品讀以免損毀紙質。」',
            scores: { cautious: 8, deconstructor: 4, rationalist: 3, intuitive: 0, pragmatist: 0, empath: 0 }
          },
          {
            id: 'corkboard_q2_opt_3',
            label: '迅速推導出密碼並取出封存卷宗，準備以最充足的案情準備迎接委託人敲門',
            thought: '「密碼已然明瞭，先把老所長留下的舊卷宗調閱出來。握有充分背景資訊，才能在會面中掌握主導權。」',
            scores: { pragmatist: 8, rationalist: 3, empath: 3, cautious: 1, deconstructor: 0, intuitive: 0 }
          }
        ]
      }
    ]
  }
];

export const OFFICE_SECRET_HOTSPOT = {
  id: 'safe',
  title: '發財樹盆栽暗格保險櫃',
  sceneDescription: '辦公室角落的大型發財樹盆栽底部，隱藏著一個精鋼打造的刻度轉盤機械密碼保險箱。老所長當年封存的安祥路88號舊卷宗就鎖在其中。',
  unlockedDescription: '保險箱厚重的精鋼櫃門敞開，內部放著一份半年前泛黃的舊案卷宗，封面上蓋著『安祥路88號 • 租客失聯舊案備案』。',
  targetPassword: '8804',
  rewardItem: {
    id: 'old_case_file',
    name: '安祥路88號半年前舊案卷宗',
    description: '半年前曾有前任房客在安祥路88號大樓租屋後離奇失聯，老所長封存的調查筆記詳細記錄了該大樓存在隱藏空間的疑點。'
  }
};
