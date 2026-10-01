import { EndingId } from '../types';

export interface PeerReviewData {
  reviewer: string;
  summaryTag: string;
  comment: string;
}

export interface EndingEpilogueData {
  endingId: EndingId;
  endingTitle: string;
  endingType: 'true' | 'normal' | 'bad';
  sealText: string; // 統一為「檔案封存」
  peerReview: PeerReviewData; // 同業評價（中立客觀，無直接字母等級）
  epilogueTitle: string;
  epilogueSubtitle: string;
  summary: string;
  characterFates: {
    name: string;
    role: string;
    fate: string;
  }[];
  newspaperHeadline: string;
  newspaperSnippet: string;
  detectiveReflection: string;
  archiveSealCode: string;
  commemorativeItem: {
    name: string;
    icon: string;
    description: string;
  };
}

export const ENDING_EPILOGUES: Record<EndingId, EndingEpilogueData> = {
  ending1: {
    endingId: 'ending1',
    endingTitle: '普通結局一：《規則的影子》',
    endingType: 'normal',
    sealText: '檔案封存',
    peerReview: {
      reviewer: '私家偵探公會・調查紀律審核小組',
      summaryTag: '案件實質未結・風險列管',
      comment: '調查員在接辦委託後，於尚未取得實質事證前即選擇中止調查並撤出目標建築。此舉雖出於對不可抗環境風險之規避考量，惟委託人後續自行涉險失聯，且失蹤目標張浩仍未尋獲。全案調查鏈已告中斷，依程序予以列管封存。'
    },
    epilogueTitle: '窗簾後的倒影與第505號訪客名冊',
    epilogueSubtitle: '在選擇放棄的那一刻，怪異已在心靈深處悄悄生根。',
    summary: '你離開了大樓，試圖將這場噩夢拋在腦後。然而幾個月後，電視新聞上大樓五樓窗邊的身影逐漸清晰——那正是你自己。在不自覺間，你已成為大樓虛擬生態的一部分。',
    characterFates: [
      {
        name: '委託人（陳先生）',
        role: '委託人',
        fate: '在等待調查結果數月未果後，私自前往安祥路88號尋找張浩，從此失去聯絡；管委會名冊悄悄多出了他的名字。'
      },
      {
        name: '失蹤者（張浩）',
        role: '被困友人',
        fate: '永久迷失於四樓打字機的無盡迴圈中，持續敲擊著泛黃的紙張。'
      },
      {
        name: '承辦調查員（玩家）',
        role: '私家偵探',
        fate: '搬離了事務所，但每逢雨夜總會聽見打字機聲；鏡中偶爾會閃過穿著紅色制服的自己，深受重度幻聽與神經衰弱折磨。'
      }
    ],
    newspaperHeadline: '《都會奇譚》安祥路88號大樓怪事頻傳，多名夜訪探險者下落不明',
    newspaperSnippet: '據附近鄰里表示，該大樓五樓長期無人居住，但深夜常有詭異白色光影與打字機敲擊聲。警方多次上門稽查皆未發現異狀，管委會則嚴正否認有任何異常事件……',
    detectiveReflection: '「我們以為轉身就能逃離深淵，卻不知在凝視深淵的那一瞬間，深淵已在我們的靈魂拓印下了編號。」',
    archiveSealCode: 'AX88-ARCHIVE-ABANDONED-01',
    commemorativeItem: {
      name: '褪色的退件委託書',
      icon: 'FileX',
      description: '寫有「因案情不明終止調查」的委託書存根，邊緣已被冷汗浸濕發黃。'
    }
  },
  ending2: {
    endingId: 'ending2',
    endingTitle: '普通結局二：《明哲保身》',
    endingType: 'normal',
    sealText: '檔案封存',
    peerReview: {
      reviewer: '私家偵探公會・調查紀律審核小組',
      summaryTag: '防護程序合規・案情未明',
      comment: '調查員在現場高度依循既定安保規則行動，成功確保自身生命安全並依約退回委託，展現良好的防禦性調查紀律。然而因未能進一步釐清四樓深層核心矛盾，關鍵異常源頭仍未探明，未能滿足委託人核心訴求。'
    },
    epilogueTitle: '撕毀的調查手冊與客廳四周的符咒',
    epilogueSubtitle: '嚴格遵守所有表面規約保全了性命，卻也永遠失去了探求真相的勇氣。',
    summary: '你退回了委託訂金，對大樓內發生的事情守口如瓶。你完好無損地回歸了日常生活，但對「規則」與「電梯」產生了終生難以克服的強迫症恐懼。',
    characterFates: [
      {
        name: '委託人（陳先生）',
        role: '委託人',
        fate: '收到退回的訂金與一封語焉不詳的道歉信，對私家偵探徹底絕望，在網路論壇上留下了一篇未完結的求助長文後搬離本市。'
      },
      {
        name: '失蹤者（張浩）',
        role: '被困友人',
        fate: '在四樓的虛無中徹底失去自我意識，成為大樓規則的養分。'
      },
      {
        name: '承辦調查員（玩家）',
        role: '私家偵探',
        fate: '關閉了私家偵探事務所，轉行從事普通文職；家中門窗貼滿了避邪符咒，出入任何公共電梯時必定反覆確認樓層按鈕至少五遍。'
      }
    ],
    newspaperHeadline: '《社會焦點》安祥路租屋糾紛暫歇，管委會加裝多組新型監視器',
    newspaperSnippet: '安祥路88號管委會今日發表聲明，呼籲外界切勿輕信網路謠言。為確保住戶安寧，大樓已全數更新安控系統與門禁設備，嚴禁外來訪客逗留……',
    detectiveReflection: '「世界上有很多未知，不知道確實比較輕鬆。但我偶爾會在半夜驚醒，問自己如果當時再往前走一步，張浩是不是就能看見明天的太陽？」',
    archiveSealCode: 'AX88-ARCHIVE-WITHDRAW-02',
    commemorativeItem: {
      name: '蓋滿避邪印章的平安符',
      icon: 'ShieldAlert',
      description: '從行天宮求得的護身平安符，背面用原子筆密密麻麻抄滿了住戶規則。'
    }
  },
  ending3: {
    endingId: 'ending3',
    endingTitle: '普通結局三：《倉皇撤退》',
    endingType: 'normal',
    sealText: '檔案封存',
    peerReview: {
      reviewer: '私家偵探公會・調查紀律審核小組',
      summaryTag: '救援目標達成・環境風險殘留',
      comment: '調查員在極端緊迫與威脅環境下，果斷採取行動成功將受困委託目標帶離現場，展現了卓越的現場應變與人身救援能力。惟撤離過程倉促，未及解構異象成因與違法結構，受害者精神後遺症仍須持續醫療追蹤。'
    },
    epilogueTitle: '台大醫院精神科病歷與殘缺的記憶',
    epilogueSubtitle: '以無比的勇氣強行救出友人，但未能解明怪異本質，陰影如影隨形。',
    summary: '你成功拉著張浩衝出了安祥路88號大樓。張浩保住了性命，但記憶出現了大片不可逆的空白。委託人如約支付了尾款，但這起案件成了你心中永遠無法合上的沉重檔案。',
    characterFates: [
      {
        name: '失蹤者（張浩）',
        role: '獲救友人',
        fate: '在醫院治療三週後出院，生理機能恢復良好，但完全遺忘了在大樓受困的所有經歷，僅在熟睡時會偶爾驚呼「不要按空白按鈕」。'
      },
      {
        name: '委託人（陳先生）',
        role: '委託人',
        fate: '親自到事務所送上紅包與感謝信，帶著康復中的張浩返回南部老家休養，過上平靜的生活。'
      },
      {
        name: '承辦調查員（玩家）',
        role: '私家偵探',
        fate: '事務所聲譽提升，但立下鐵律：從此拒接任何與「大樓、梯間、失蹤」相關的神秘委託；保險箱深處鎖著當天從四樓帶出的破碎紙條。'
      }
    ],
    newspaperHeadline: '《突發新聞》安祥路88號大樓非法加蓋疑雲，警方接獲報案展開勘驗',
    newspaperSnippet: '昨夜安祥路大樓傳出騷動，一名男子在友人陪同下緊急送醫。警方隨後前往大樓四樓搜查，發現通往四樓的鐵門遭重重鏈條上鎖，正進一步調查該處是否存在非法拘禁情事……',
    detectiveReflection: '「我們帶回了他的肉體，但我不知道我們是否把他完整的靈魂留在了那間打字機房裡。有些門，或許真的不該再去開第二次。」',
    archiveSealCode: 'AX88-ARCHIVE-RESCUED-03',
    commemorativeItem: {
      name: '沾有水泥灰的手電筒',
      icon: 'Flashlight',
      description: '在四樓突圍逃跑時摔裂鏡片的手電筒，開關處依然殘留著當天的冷汗。'
    }
  },
  ending4: {
    endingId: 'ending4',
    endingTitle: '壞結局一：《成為新規則》',
    endingType: 'bad',
    sealText: '檔案封存',
    peerReview: {
      reviewer: '私家偵探公會・調查紀律審核小組',
      summaryTag: '重大調查事故・調查員失聯除名',
      comment: '調查員在搜查過程中承受過量之認知衝擊與精神負荷，失去客觀自持之調查立場，最終於現場失聯。公會已啟動失蹤人員通報程序，並將該調查員暫列除名名單，相關檔案依特別事故條例予以封存。'
    },
    epilogueTitle: '四樓走廊的紅色背影與【調查員規則】',
    epilogueSubtitle: '在無窮無盡的認知壓迫下理智歸零，你穿上了紅色制服，成為大樓全新的怪異守護者。',
    summary: '四樓的打字機聲徹底奪走了你的神智。你坐上了中央那張轉椅，敲下了屬於你的新規則。安祥路88號大樓多了一位手持放大鏡與手電筒的「紅衣調查員」。',
    characterFates: [
      {
        name: '調查員（玩家）',
        role: '化身怪異',
        fate: '自私家偵探公會除名，成為安祥路88號四樓的永久管理員化身；於午夜向誤入的訪客發放泛黃的白紙。'
      },
      {
        name: '失蹤者（張浩）',
        role: '被困友人',
        fate: '與失聯的調查員一同成為四樓打字機房間的常駐住戶，日復一日編纂無窮無盡的大樓規則。'
      },
      {
        name: '警衛李伯',
        role: '一樓警衛',
        fate: '在值班日誌上記下全新一筆備註：「四樓走廊出現穿著紅衣的調查員，若遇見請務必保持安靜並退出電梯。」'
      }
    ],
    newspaperHeadline: '《失蹤協尋》承辦私家偵探深入安祥路大樓後失聯，警方全面搜索無獲',
    newspaperSnippet: '私家偵探於三日前接辦案件前往安祥路大樓後失去音訊。警方調閱監視器發現偵探於晚間進入大樓後便未曾步出大門，其事務所辦公室內物品完好，案情撲朔迷離……',
    detectiveReflection: '「【調查員規則第1條】：本大樓沒有4樓。如果你看到我坐在這裡打字，請不要呼喚我的名字……因為我已經是這棟大樓的一部分了。」',
    archiveSealCode: 'AX88-ARCHIVE-ASSIMILATED-04',
    commemorativeItem: {
      name: '打出第一行字的新白紙',
      icon: 'FileText',
      description: '油墨未乾的白紙，標題赫然印著【第十一條・調查員專用規則】。'
    }
  },
  ending5: {
    endingId: 'ending5',
    endingTitle: '真結局一：《真相大白》',
    endingType: 'true',
    sealText: '檔案封存',
    peerReview: {
      reviewer: '私家偵探公會・調查紀律審核小組',
      summaryTag: '邏輯推演嚴謹・真相全面昭雪',
      comment: '調查員靈活運用建築結構藍圖、財務水電憑證與客觀證物，嚴密剖析集體認知偏差之生成機制，以無可辯駁的理性邏輯瓦解非自然心理制約。受害者全員平安獲救，並促使主管機關拆除重大違建，足供同業作為標準調查指引。'
    },
    epilogueTitle: '晨曦中的咖啡香與工務局違建拆除令',
    epilogueSubtitle: '以無可動搖的理性思維揭穿三十年的認知謊言，四樓重歸平靜，友人平安獲救。',
    summary: '你以違建藍圖、水電帳冊與信件為武器，直指404怪異的本質——這一切不過是三十年來恐懼與謊言的集體造物。話音落下，打字機化為塵埃，四樓重歸真實。工務局依法拆除了危險違建。',
    characterFates: [
      {
        name: '失蹤者（張浩）',
        role: '平安獲救',
        fate: '在事務所休整兩天後徹底康復，將自己的親身經歷撰寫為《認知心理學與集體恐懼實錄》，出版後引發學術界廣泛討論。'
      },
      {
        name: '委託人（陳先生）',
        role: '委託人',
        fate: '與張浩相擁而泣，親自送上刻有「明察秋毫」的純銅紀念牌匾，並在偵探公會大力推薦主辦調查員事務所。'
      },
      {
        name: '承辦調查員（玩家）',
        role: '傳奇偵探',
        fate: '名聲大噪，被譽為「破除都市傳說的理性之刃」；事務所業務蒸蒸日上，成為專門破解懸案的傳奇機構。'
      }
    ],
    newspaperHeadline: '《重大揭露》安祥路88號大樓陳年違建弊案曝光，工務局下令強制拆除',
    newspaperSnippet: '在知名私家偵探的協助調查下，工務局查獲安祥路88號大樓三十年前非法加蓋四樓並私改水電電路的重大弊案。拆除工程隊已於今日進駐，長達數十年的都市怪談就此劃下句點……',
    detectiveReflection: '「怪異與恐懼就像黑暗中的影子，只要我們點亮理性的燈火，看清它的構造與本質，它便連一粒微塵都不如。」',
    archiveSealCode: 'AX88-ARCHIVE-SOLVED-05',
    commemorativeItem: {
      name: '工務局違章拆除證明副本',
      icon: 'Award',
      description: '蓋有市政府工務局大紅官印的公文，正式宣告4樓違建合法拆除完畢。'
    }
  },
  ending6: {
    endingId: 'ending6',
    endingTitle: '壞結局二：《無邪之惡》',
    endingType: 'bad',
    sealText: '檔案封存・高度戒備',
    peerReview: {
      reviewer: '私家偵探公會・調查倫理與精神鑑定審核小組',
      summaryTag: '心因性認知錯亂・善念扭曲為惡',
      comment: '承辦調查員在精神受創狀態下產生了極其罕見的「救世主妄想型認知歪曲」。其行為動機純屬出於極端的保護欲與偵探職業責任感，但因現實理性崩潰，竟將非法禁錮與剝奪受害者自由視為「最完美的庇護」。此案例為公會史上最令人痛心之非典型精神崩潰悲劇。'
    },
    epilogueTitle: '無邪的微笑與永恆的「安全牢籠」',
    epilogueSubtitle: '以保護之名將友人與後續訪客永遠囚禁，認定自己是在拯救一切的大樓引路人。',
    summary: '你的理智徹底瓦解，但你的內心比任何人都單純。你深信自己是這座殘酷城市裡唯一的守護者。你溫柔地為張浩送上三餐，將他鎖在暗無天日的房間；你在大樓門口親切地引導每一個前來的迷茫者走向四樓深處，堅信這是在拯救他們的靈魂。',
    characterFates: [
      {
        name: '失蹤者（張浩）',
        role: '被「保護」的囚徒',
        fate: '被反鎖在404最深處的隔間中，雖然未受物理傷害，但精神已在「摯友溫柔而瘋狂的囚禁」下陷入呆滯與絕望。'
      },
      {
        name: '後續訪客與探險者',
        role: '被引渡的羊群',
        fate: '被熱心專業的「林偵探」親切接待，在毫無防備下被一步步誘導入四樓深處，成為大樓永遠的「被庇護住客」。'
      },
      {
        name: '承辦調查員（玩家）',
        role: '無邪的守護魔',
        fate: '依然佩戴著偵探徽章，整潔地穿著風衣在大樓中巡視。他始終堅信自己完成了最偉大的委託——讓所有人免於世間的苦難，嘴角掛著天真無邪的孩童微笑。'
      }
    ],
    newspaperHeadline: '《悚慄懸案》名偵探離奇失常！將失聯友人與數名住客反鎖封閉老宅，落網前堅稱「外面世界太危險」',
    newspaperSnippet: '警政署近日破獲安祥路88號重大非法禁錮公案。涉案之私家偵探在精神重度錯亂狀態下，將多名被害人幽禁於頂樓隔間。令人不寒而慄的是，該偵探落網時神情自若甚至面露慈祥笑容，反覆向警方表示自己「只是在保護他們不受外界傷害」……',
    detectiveReflection: '「世人總是不懂我的苦心。外面有車禍、有失業、有疾病、有背叛……但只要待在我身後的大樓裡，大家就能永遠在一起。我真是個稱職的大偵探啊。」',
    archiveSealCode: 'AX88-ARCHIVE-INNOCENT-MALICE-06',
    commemorativeItem: {
      name: '帶有鏽痕的【偵探執業徽章】',
      icon: 'ShieldAlert',
      description: '擦拭得一塵不染的銀色徽章，背面刻著「拯救弱者」，正面卻沾染著在鎖死鐵門時留下的斑駁鐵鏽痕跡。'
    }
  },
  ending7: {
    endingId: 'ending7',
    endingTitle: '普通結局四：《執念的輪迴》',
    endingType: 'normal',
    sealText: '檔案封存',
    peerReview: {
      reviewer: '私家偵探公會・調查紀律審核小組',
      summaryTag: '處置手段激進・因果回溯重啟',
      comment: '調查員在情勢不明情況下採取物理破壞手段，引發不可控之時空因果震盪。所幸調查員保有前次調查核心記憶，建議後續重啟調查時務必克制物理干預衝動，著重於邏輯推演與證據鏈建立。'
    },
    epilogueTitle: '雨夜的循環悖論與手腕上的烙印',
    epilogueSubtitle: '在概念未明時以純暴力砸毀設備引發時空坍塌，回溯至接案的第一天。',
    summary: '打字機被物理砸碎的一刻，空間劇烈撕裂。你猛然在事務所辦公桌前醒來，窗外依然下著傾盆大雨。手機響起委託訊息，手腕上留下了「404」烙痕——這是命運給予的第二次機會！',
    characterFates: [
      {
        name: '承辦調查員（玩家）',
        role: '時空輪迴者',
        fate: '保留了上一次調查的所有記憶與教訓；看著手腕上的紅色404烙印，眼神無比堅毅，決心用真正的智慧打破循環。'
      },
      {
        name: '委託人（陳先生）',
        role: '即將來訪',
        fate: '再次按響了事務所的門鈴，帶來了那份熟悉的委託書與老舊相片。'
      },
      {
        name: '失蹤者（張浩）',
        role: '受困中',
        fate: '正處於受困初期的第四天，等待著知曉一切真相的調查員前來拯救。'
      }
    ],
    newspaperHeadline: '《氣象特報》北部地區受滯留鋒面影響，連日豪雨恐將持續數週',
    newspaperSnippet: '氣象局提醒市民，近期降雨機率偏高，夜間行車及外出請特別注意安全。安祥路一帶因排水工程施工，部分路段夜間視線不佳……',
    detectiveReflection: '「暴力無法抹除概念，憤怒只會讓我們重蹈覆轍。但命運給了我第二次握緊放大鏡的機會，這一次，我絕不會再讓任何人迷失。」',
    archiveSealCode: 'AX88-ARCHIVE-LOOP-07',
    commemorativeItem: {
      name: '發燙的404金屬錶扣',
      icon: 'Clock',
      description: '錶盤指針永遠停留在出發當天雨夜八點零四分的紀念手錶。'
    }
  },
  ending8: {
    endingId: 'ending8',
    endingTitle: '真結局二：《破曉》',
    endingType: 'true',
    sealText: '檔案封存',
    peerReview: {
      reviewer: '私家偵探公會・調查紀律審核小組',
      summaryTag: '全證據鏈完備・歷史公案全破',
      comment: '調查員完整搜集並串聯本案全部六大核心物證，推論嚴密無懈可擊。不僅徹底瓦解長達三十年的認知怪異牢籠，更使歷年失聯住戶奇蹟生還全員尋獲，為司法機關重啟起訴建商弊案奠定關鍵基礎。本案評議為公會創立以來最具歷史突破性之調查範例。'
    },
    epilogueTitle: '三十年後的全員重聚與破曉天光',
    epilogueSubtitle: '集齊全部六件核心物證，形成無懈可擊的真實證據鏈，迎來破曉，所有失蹤住戶全員平安歸來！',
    summary: '六件關鍵物證拼湊出了三十年歷史的全部脈絡。隨著你朗聲宣告謊言的終結，破曉的溫暖金光籠罩了整棟大樓。不僅是張浩，連同歷年來被困在四樓的六位舊住客全數甦醒並走出鐵門！大樓的詛咒徹底灰飛煙滅。',
    characterFates: [
      {
        name: '全員失蹤住戶（共6人）',
        role: '奇蹟生還者',
        fate: '在陽光中與家人相擁而泣，經台大醫療團隊檢查全員身體健康無虞；三十年的失蹤公案一次全數偵破！'
      },
      {
        name: '失蹤者（張浩）與委託人',
        role: '幸福新人',
        fate: '經歷這場生死考驗後感情更加堅定，半年後舉辦了盛大婚禮，並邀請主辦調查員擔任榮譽主婚人。'
      },
      {
        name: '警衛李伯與清潔員李阿姨',
        role: '大樓員工',
        fate: '卸下了沈重的怪異防備，大樓恢復正常管理；李伯笑著說這是他三十年來睡得最安穩的一個早晨。'
      },
      {
        name: '承辦調查員（玩家）',
        role: '榮譽大偵探',
        fate: '榮獲警政署與私家偵探公會頒發最高榮譽「破案英雄金質勳章」；安祥路88號大樓案被列為偵探學院經典教科書案例。'
      }
    ],
    newspaperHeadline: '《世紀奇蹟》安祥路大樓三十年失蹤公案全數偵破！六名失蹤者全員生還',
    newspaperSnippet: '警政署今日召開聯合記者會，宣布安祥路88號大樓懸案在承辦私家偵探的卓越推演與完整證物搜集下宣告全面破案。涉案建商當年非法加蓋與侵吞款項之陳年弊案亦被重啟起訴，正義終得伸張……',
    detectiveReflection: '「當所有散落的碎片重新拼湊，謊言將無所遁形。我們不僅找回了迷失的朋友，更替這座城市找回了被遺忘三十年的良知與真相。破曉已至，黑夜不再。」',
    archiveSealCode: 'AX88-ARCHIVE-GRAND-PERFECT-08',
    commemorativeItem: {
      name: '警政署破案英雄金質勳章',
      icon: 'Sparkles',
      description: '純金打造的榮譽勳章，背面刻著「以理性之光穿透迷霧，致全體調查員」。'
    }
  },

  ending0: {
    endingId: 'ending0',
    endingTitle: '假想閉案結局：《第404號證物》',
    endingType: 'normal',
    sealText: '檔案封存',
    peerReview: {
      reviewer: '私家偵探公會・調查紀律審核小組',
      summaryTag: '社會派常規破案・閉案歸檔',
      comment: '調查員依循嚴謹的現場調查邏輯，成功於504號房暗室尋獲目標張浩，化解債務失蹤疑雲。然而數日後之病房追蹤顯露怪異侵蝕跡象，本案背後潛藏更深層之認知異變。'
    },
    epilogueTitle: '閉案報告書與療養院的打字機聲',
    epilogueSubtitle: '在表面結案的偽裝之下，深層的規則怪談正在悄然滋生。',
    summary: '你完成了A4結案報告書並收取了委託費。但三天後探訪松德療養院時，張浩的病房裡不斷傳來機械鍵盤的敲擊聲……你意識到案件並未真正結束，安祥路88號的真正規則怪談即將拉開序幕！',
    characterFates: [
      {
        name: '失蹤者（張浩）',
        role: '精神重創獲救者',
        fate: '身體雖無大礙，但精神受怪異嚴重污染，在病房中不斷重複「本大樓沒有四樓」。'
      },
      {
        name: '委託人（陳先生）',
        role: '委託結案人',
        fate: '支付全額調查報酬並表達感謝，隨後前往療養院照料張浩。'
      },
      {
        name: '承辦調查員（玩家）',
        role: '即將覺醒之偵探',
        fate: '在論壇看到病患求救貼文與怪異文字亂碼，決定深入規則怪談展開真正對抗。'
      }
    ],
    newspaperHeadline: '《民事失蹤案破案》欠債男子躲藏租屋處暗室三日 警方與私家偵探即時尋獲送醫',
    newspaperSnippet: '安祥路88號大樓日前通報之失蹤案件於今日宣告結案。失蹤男子因龐大債務壓力躲入五樓隔間空腔夾壁，私家偵探勘破指甲抓撓求生信號後由警衛開鎖破拆夾壁成功尋獲當事人……',
    detectiveReflection: '「表面上一切合情合理，但我知道，真正的怪異才剛要浮出水面。」',
    archiveSealCode: 'AX88-ARCHIVE-STAGE-1-WEEK1-00',
    commemorativeItem: {
      name: '蓋有合格章的A4結案報告書',
      icon: 'FileText',
      description: '上禮拜現場調查的結案證明，背面隱隱滲出機械打字機的墨水痕跡。'
    }
  }
};

/**
 * Week 1 Anti-Spoiler Epilogues
 * For players failing in Week 1 (abandoning case or panic collapse),
 * provide grounded medical & detective guild closure without spoiling the 404 supernatural rules.
 */
export const WEEK1_ENDING_EPILOGUES: Partial<Record<EndingId, EndingEpilogueData>> = {
  ending1: {
    endingId: 'ending1',
    endingTitle: '案件中止：《合約撤銷與心理創傷》',
    endingType: 'normal',
    sealText: '案件中止',
    peerReview: {
      reviewer: '私家偵探公會・調查紀律審核小組',
      summaryTag: '合約合規撤銷・未完結案件封存',
      comment: '調查員於接案後判定現場環境阻力異常、存在難以預料之安全威脅，依委託合約第七條主動終止委託並退還全額訂金。經審核程序符合避險指引准予備查；惟因未能尋獲失蹤者張浩，委託方深感失望，全案調查中斷並列管存查。'
    },
    epilogueTitle: '退還的委託訂金與無人接聽的答錄機',
    epilogueSubtitle: '在選擇明哲保身的那一刻，未竟的真相成了心靈深處揮之不去的遺憾。',
    summary: '你退回了委託訂金，試圖將安祥路88號的陰鬱壓迫感拋在腦後。然而幾週後，委託人陳先生因不甘心而嘗試自行前往大樓尋人，隨後在老洋樓附近失去聯繫。你保全了自身安全，但深夜的暴雨總讓你懷疑，自己是否在某個關鍵時刻轉身退縮了。',
    characterFates: [
      {
        name: '委託人（陳先生）',
        role: '委託人',
        fate: '因私家偵探終止調查，心急如焚下自行前往安祥路88號尋找張浩，隨後失聯，家屬已向警局報案失蹤。'
      },
      {
        name: '失蹤者（張浩）',
        role: '被困作家',
        fate: '仍列於市警局重大失蹤人口名冊，隨身證件與筆電遺留於現場，下落石沉大海。'
      },
      {
        name: '承辦調查員（玩家）',
        role: '私家偵探',
        fate: '雖安全撤離大樓，但每逢雨夜總會想起大樓穿堂風與緊閉的窗簾，在心中留下未解心結與職業創傷。'
      }
    ],
    newspaperHeadline: '《都會快訊》安祥路88號老宅又添失蹤疑雲，民間尋人受阻引發熱議',
    newspaperSnippet: '據警方透露，日前曾有私家偵探前往該處調查失蹤作家案，隨後因故終止調查。失蹤者友人日前亦傳出失聯消息，管委會則重申大樓出入單純，呼籲外界切勿做過度揣測……',
    detectiveReflection: '「當直覺拉響警報時，轉身退步或許是唯一的保命法則。只是……張浩到底去了哪裡？那棟老樓的陰霾，我真的徹底擺脫了嗎？」',
    archiveSealCode: 'AX88-WEEK1-ABANDONED-01',
    commemorativeItem: {
      name: '被退回的委託解約書',
      icon: 'FileX',
      description: '加蓋私家偵探公會印戳的終止委託合約，背面有委託人簽署時留下的斑駁淚痕。'
    }
  },
  ending2: {
    endingId: 'ending2',
    endingTitle: '搜查中斷：《急性休克與精神重壓》',
    endingType: 'normal',
    sealText: '醫療休治',
    peerReview: {
      reviewer: '私家偵探公會・調查員執業安全委員會',
      summaryTag: '執勤突發急症・暫停執業審查',
      comment: '調查員於安祥路88號現場搜查期間，因極端心理壓力引發重度過度換氣綜合症與心因性休克昏迷，經大樓保全通報119緊急送醫。委員會認定調查員目前身心狀態暫不適宜執行高壓外勤工作，裁定暫時扣押執照三個月，並強制進行心理復健。'
    },
    epilogueTitle: '市立醫院急診診斷書與暫扣的偵探執照',
    epilogueSubtitle: '過度的精神緊繃與幽閉恐慌擊垮了神經防線，搜查在救護車的警笛聲中戛然而止。',
    summary: '你在大樓長廊失去意識倒地，幸得巡邏人員及時發現並送醫急救。清醒後，你躺在市立醫院的白色病床上，天花板日光燈冷酷地照著你。醫生診斷為重度急性壓力反應，公會亦要求你暫停所有調查業務。安祥路88號的委託被迫全面中斷。',
    characterFates: [
      {
        name: '委託人（陳先生）',
        role: '委託人',
        fate: '接獲公會通知調查員因急症送醫，委託被迫中止。陳先生前往醫院探視並收回剩餘資料，眼神中滿是絕望。'
      },
      {
        name: '失蹤者（張浩）',
        role: '被困作家',
        fate: '搜查中斷，案件再度陷入死胡同，警方以「無新事證」暫緩主動搜查。'
      },
      {
        name: '承辦調查員（玩家）',
        role: '私家偵探',
        fate: '在醫院接受心理治療與鎮靜劑注射，每當閉上雙眼，仍會感到大樓長廊牆壁朝自己擠壓的窒息幻覺。'
      }
    ],
    newspaperHeadline: '《民生要聞》老舊公寓公共安全堪憂，私人調查員搜查中突發昏厥送醫',
    newspaperSnippet: '昨夜安祥路88號公寓傳出一名男子於梯間昏厥，警消獲報後迅速將其送醫搶救，經診斷無生命危險。據悉該男子為執業調查員，現場並無打鬥痕跡，疑因通風不良與過勞引發休克……',
    detectiveReflection: '「醫生說那只是壓力過大的神經衰弱與換氣過度。可是……在昏迷前的那一刻，我聽見的真的只是自己的心跳聲嗎？這棟樓裡，一定有某種我們尚未察覺的深層結構在作祟。」',
    archiveSealCode: 'AX88-WEEK1-MEDICAL-02',
    commemorativeItem: {
      name: '市立醫院急診腕帶與抗焦慮藥',
      icon: 'Activity',
      description: '印有急診病患編號的塑料手環，以及一整排尚未吃完的鹽酸普萘洛爾抗焦慮藥錠。'
    }
  },
  ending4: {
    endingId: 'ending4',
    endingTitle: '搜查中斷：《急性休克與精神重壓》',
    endingType: 'normal',
    sealText: '醫療休治',
    peerReview: {
      reviewer: '私家偵探公會・調查員執業安全委員會',
      summaryTag: '執勤突發急症・暫停執業審查',
      comment: '調查員於安祥路88號現場搜查期間，因極端心理壓力引發重度過度換氣綜合症與心因性休克昏迷，經大樓保全通報119緊急送醫。委員會認定調查員目前身心狀態暫不適宜執行高壓外勤工作，裁定暫時扣押執照三個月，並強制進行心理復健。'
    },
    epilogueTitle: '市立醫院急診診斷書與暫扣的偵探執照',
    epilogueSubtitle: '過度的精神緊繃與幽閉恐慌擊垮了神經防線，搜查在救護車的警笛聲中戛然而止。',
    summary: '你在大樓長廊失去意識倒地，幸得巡邏人員及時發現並送醫急救。清醒後，你躺在市立醫院的白色病床上，天花板日光燈冷酷地照著你。醫生診斷為重度急性壓力反應，公會亦要求你暫停所有調查業務。安祥路88號的委託被迫全面中斷。',
    characterFates: [
      {
        name: '委託人（陳先生）',
        role: '委託人',
        fate: '接獲公會通知調查員因急症送醫，委託被迫中止。陳先生前往醫院探視並收回剩餘資料，眼神中滿是絕望。'
      },
      {
        name: '失蹤者（張浩）',
        role: '被困作家',
        fate: '搜查中斷，案件再度陷入死胡同，警方以「無新事證」暫緩主動搜查。'
      },
      {
        name: '承辦調查員（玩家）',
        role: '私家偵探',
        fate: '在醫院接受心理治療與鎮靜劑注射，每當閉上雙眼，仍會感到大樓長廊牆壁朝自己擠壓的窒息幻覺。'
      }
    ],
    newspaperHeadline: '《民生要聞》老舊公寓公共安全堪憂，私人調查員搜查中突發昏厥送醫',
    newspaperSnippet: '昨夜安祥路88號公寓傳出一名男子於梯間昏厥，警消獲報後迅速將其送醫搶救，經診斷無生命危險。據悉該男子為執業調查員，現場並無打鬥痕跡，疑因通風不良與過勞引發休克……',
    detectiveReflection: '「醫生說那只是壓力過大的神經衰弱與換氣過度。可是……在昏迷前的那一刻，我聽見的真的只是自己的心跳聲嗎？這棟樓裡，一定有某種我們尚未察覺的深層結構在作祟。」',
    archiveSealCode: 'AX88-WEEK1-MEDICAL-02',
    commemorativeItem: {
      name: '市立醫院急診腕帶與抗焦慮藥',
      icon: 'Activity',
      description: '印有急診病患編號的塑料手環，以及一整排尚未吃完的鹽酸普萘洛爾抗焦慮藥錠。'
    }
  }
};
