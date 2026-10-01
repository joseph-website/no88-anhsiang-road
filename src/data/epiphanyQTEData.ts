export interface EpiphanyOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface EpiphanyQTEConfig {
  id: string;
  title: string;
  subtitle: string;
  scenarioDesc: string;
  clueHint: string;
  options: EpiphanyOption[];
  correctDeductionThought: string;
  recoveryNote: string;
  successButtonText?: string;
  failureNoticeText?: string;
  failureButtonText?: string;
  timeLimit?: number;
}

export const EPIPHANY_QTE_CONFIGS: Record<string, EpiphanyQTEConfig> = {
  // 1. 客用電梯爬升秒數測量
  elevator_travel_time: {
    id: 'elevator_travel_time',
    title: '靈光一閃：這段爬升秒數有些蹊蹺！',
    subtitle: '電梯垂直位移與時間等速物理破綻',
    scenarioDesc: '電梯從 1 樓升至 2 樓耗時約 6 秒，運行平穩；然而按下 5 樓按鍵後，電梯以完全相同的平穩電機轉速持續爬升，碼表指針卻整整跳了 12 秒才抵達 5 樓！',
    clueHint: '思考重點：在升降速度恆定的情況下，位移距離與運行時間成正比。',
    options: [
      {
        id: 'opt_1',
        text: '電梯在經過四樓時可能因感應到靈異磁場而自動減速了',
        isCorrect: false,
        explanation: '看起來像是靈異減速，但實際上電機運轉聲與加速度儀均顯示等速上升，並不存在減速狀況。'
      },
      {
        id: 'opt_2',
        text: '在等速垂直運動下，雙倍時間意味著位移整整為兩倍——3F與5F之間物理上必然隔著一層樓高！',
        isCorrect: true,
        explanation: '客觀物理不會說謊！雙倍秒數鐵證 3F 與 5F 之間存在著完整的第四層物理實體，空間並未蒸發！'
      },
      {
        id: 'opt_3',
        text: '因為頂樓的鋼纜重量減輕，導致馬達運轉效率自然下降',
        isCorrect: false,
        explanation: '看起來似乎符合力學想像，但實際上現代曳引電梯均設有配重平衡塊，高低樓層運行時間公差極小，不可能產生兩倍差距。'
      },
      {
        id: 'opt_4',
        text: '只是電梯樓層顯示面板被更換過，其實每一層樓高都不一樣',
        isCorrect: false,
        explanation: '看起來像是面板改動，但實際上大樓一樓至三樓層高完全一致，唯獨三至五樓間的時間翻倍。'
      }
    ],
    correctDeductionThought: '時間不會騙人。等速爬升耗時 12 秒，正好是常規一層樓的兩倍。四樓沒有消失，它就在三樓頂上！',
    recoveryNote: '以客觀物理破除空間幻象，思緒頓時澄澈明朗，內心的疑懼煙消雲散。'
  },

  // 2. 504 號房書桌暗格黃銅鐵盒挑鎖
  brass_box_lockpick: {
    id: 'brass_box_lockpick',
    title: '靈光一閃：這個暗格銅鎖的鎖孔構造……',
    subtitle: '雙珠結構鎖具與副齒工具的機械公差',
    scenarioDesc: '書桌暗格夾層內取出的黃銅文件鐵盒，鎖孔為極罕見的倒十字雙珠鎖芯。一般的單勾挑鎖工具無法同時撥開兩側簧珠，但眼前這把【504號房鑰匙】的銅柄末端似乎別有玄機……',
    clueHint: '思考重點：觀察鑰匙握柄底部的機械凹槽與微型副齒。',
    options: [
      {
        id: 'opt_1',
        text: '嘗試用打火機長時間高溫烘烤銅盒，使鎖舌金屬熱脹冷縮脫開',
        isCorrect: false,
        explanation: '看起來似乎能利用熱脹冷縮，但實際上高溫會直接損壞銅盒內的紙質存根，不可行。'
      },
      {
        id: 'opt_2',
        text: '504號房鑰匙柄端刻有一道隱密的十字副齒，齒寬與深度與盒蓋鎖芯完全吻合！',
        isCorrect: true,
        explanation: '屋主刻意將暗格開鎖工具一體化藏於房門鑰匙柄上，只需逆時針轉動副齒即可挑開雙珠！'
      },
      {
        id: 'opt_3',
        text: '用力將銅盒朝水泥地面摔擲，依靠震動震開卡榫',
        isCorrect: false,
        explanation: '看起來想賭一把機械震脫，但實際上銅盒外殼厚實且設有防震緩衝，暴力破壞只會卡死內部鎖簧。'
      },
      {
        id: 'opt_4',
        text: '這是一只偽裝成鎖孔的指紋辨識器，需要輸入密碼',
        isCorrect: false,
        explanation: '看起來頗具神祕感，但實際上這是純機械結構的老件，內部完全沒有任何電子接線。'
      }
    ],
    correctDeductionThought: '這把老鑰匙的柄端並非單純防滑紋路，而是專門用來開啟暗格的特製副齒！',
    recoveryNote: '理清了機關暗鎖的物理結構，指尖順暢轉動，心緒感到無比從容踏實。'
  },

  // 3. 水電租約存根與 404 電表回路對照
  utility_meter_deduction: {
    id: 'utility_meter_deduction',
    title: '靈光一閃：存根上的瓦時電表編號與度數！',
    subtitle: '水電回路共用與替身租約的契約詭計',
    scenarioDesc: '張浩留下的 504 號房水電繳費單上，登記的瓦時電表編號赫然寫著「MTR-0404-X」，且每月度數竟然高達 3,800 度，是隔壁 502 號房常規用電量的十倍以上！',
    clueHint: '思考重點：單人套房如何消耗工業級動力電？電表編號直接對應了哪間房？',
    options: [
      {
        id: 'opt_1',
        text: '張浩在套房內私自擺放了十幾台虛擬貨幣礦機日夜運轉',
        isCorrect: false,
        explanation: '看起來像是不法用電常態，但實際上現場套房內極為整潔，並無巨型伺服器或相應的散熱排氣設施。'
      },
      {
        id: 'opt_2',
        text: '供電局的抄表人員三十年來一直將小數點看錯位置',
        isCorrect: false,
        explanation: '看起來像行政疏失，但實際上每期帳單均有物業主任手寫簽核，絕非單純手民之誤。'
      },
      {
        id: 'opt_3',
        text: '504號房的線路直接與404配電箱共用回路，整棟樓在物理與帳務上都在讓504為404機房分攤龐大動力電！',
        isCorrect: true,
        explanation: '鐵證如山！504 號房三十年來一直是大樓掩蓋 404 存在的「替身受體」，替身負擔了機房持續運行的代價！'
      },
      {
        id: 'opt_4',
        text: '這是老舊大樓正常的夏季線路漏電耗損，純屬自然現象',
        isCorrect: false,
        explanation: '看起來像是老舊線路問題，但實際上如此龐大的漏電量早就引發總開關跳脫甚至火災。'
      }
    ],
    correctDeductionThought: '電表號碼 MTR-0404-X……三十年來，大樓一直透過 504 的戶頭在向 404 機房供電！',
    recoveryNote: '揭開了深埋三十年的契約偽裝，真相脈絡愈發清晰，精神為之一振。'
  },

  // 4. 電梯維修箱 PLC 主機板跳線檢驗
  plc_bypass_deduction: {
    id: 'plc_bypass_deduction',
    title: '靈光一閃：電梯控制箱主機板上的跳線痕跡！',
    subtitle: '人為物理旁路（Bypass）與虛假故障解構',
    scenarioDesc: '工程手記中附有一張 PLC 主機板電路圖。在樓層控制總成上，編號「FL-04」的繼電器端子被一根粗黑銅線直接短接至「FL-05」，焊點旁還注記著「旁路略過」。',
    clueHint: '思考重點：電梯不停靠四樓，究竟是靈異阻礙，還是人工實體線路操控？',
    options: [
      {
        id: 'opt_1',
        text: '這是大樓管理員為了封印四樓怨靈而請法師畫上的絕緣法咒',
        isCorrect: false,
        explanation: '看起來像是民俗傳聞，但實際上這只是一根極其普通的工程用銅跳線，屬於標準電工人為改裝。'
      },
      {
        id: 'opt_2',
        text: '這純粹是人工刻意安裝的物理旁路（Bypass），藉由短路信號強行跳過 4 樓，並非超自然空間蒸發！',
        isCorrect: true,
        explanation: '大樓電梯不能去四樓，純粹是人為改造的機械欺瞞！只要拔掉跳線，電梯就能正常停靠四樓！'
      },
      {
        id: 'opt_3',
        text: '控制箱內部電線遭到老鼠啃咬，純屬自然短路',
        isCorrect: false,
        explanation: '看起來像是意外咬損，但實際上焊點極為規整且塗有絕緣防潮膠，分明出自專業技師手筆。'
      },
      {
        id: 'opt_4',
        text: '4樓的按鈕燈泡燒壞了，所以電梯感應不到按壓信號',
        isCorrect: false,
        explanation: '看起來像是設備損壞，但實際上主機板上的邏輯回路被刻意阻斷，與車廂按鍵燈泡毫無關聯。'
      }
    ],
    correctDeductionThought: '所謂的神祕失控，不過是一根幾塊錢的人工短接銅線。一切恐懼都來自於對物理真相的無知！',
    recoveryNote: '勘破了機械迷障背後的人為動機，理性思維重掌主導，心境如釋重負。'
  },

  // 5. 第一輪一樓大廳突發事件：住戶投訴隔壁牆壁老鼠怪聲
  mouse_scratch_wall_complaint: {
    id: 'mouse_scratch_wall_complaint',
    title: '靈光一閃：牆壁裡那陣西西酥酥的抓撓聲！',
    subtitle: '隔間牆物理中空與人體求救信號洞察',
    scenarioDesc: '你剛在 504 號房搜查完畢回到一樓大廳，五樓住戶正神情暴躁地向警衛王大偉拍桌抗議：「王主任！我們五樓隔壁 502 那面牆壁，這兩天一直發出西西酥酥、窸窸窣窣的怪聲，像大老鼠在發瘋抓牆！吵得大家整晚睡不著！你們到底有沒有叫除鼠公司？！」而警衛王大偉一臉無奈表示：「先生，502 是長期鎖閉的空屋，連食物都沒有，怎麼可能養那麼大隻的老鼠……」',
    clueHint: '思考重點：失蹤的張浩、長期鎖閉的 502 空屋、隔間牆內規律微弱的抓撓摩擦聲……',
    options: [
      {
        id: 'opt_mouse',
        text: '這肯定是水管夾層滋生的大型褐鼠，在水泥縫隙中啃咬磨牙造成的自然噪音',
        isCorrect: false,
        explanation: '看起來像一般鼠患，但實際上 502 空置斷糧數月，老鼠不可能長期滯留於密閉隔間石膏板內發出持續規律的指甲摩擦聲。'
      },
      {
        id: 'opt_human',
        text: '這絕不是老鼠！是人類極度脫水受困於石膏夾層中，用手指抓撓牆壁發出的求救信號——失蹤的張浩就在裡面！',
        isCorrect: true,
        explanation: '那種微弱卻極度規律、帶有節奏間歇的抓撓聲，正是指甲劃刮石膏板的求生本能！失蹤三天的張浩極可能就在相鄰夾層深處！'
      },
      {
        id: 'opt_ghost',
        text: '這是大樓四樓亡靈在牆壁裡作祟敲牆，應該立刻請道士開壇作法超渡',
        isCorrect: false,
        explanation: '看起來撲朔迷離，但實際上專業偵探不依賴鬼神超自然之說，一切聲音皆源於客觀物理震動與真實存在。'
      },
      {
        id: 'opt_wind',
        text: '只是五樓通風管道排風扇軸承老化，在強風吹拂下產生的機械共振',
        isCorrect: false,
        explanation: '看起來像風噪共振，但實際上聲音位置明確集中於相鄰 502 的室內輕隔間牆，並非外牆風管排風扇。'
      }
    ],
    correctDeductionThought: '這絕對不是老鼠！那種指甲劃過石膏板的沉悶磨擦，是人在極度脫水窒息時最後的求生呼救！張浩就在 502 相隔的夾壁裡！',
    recoveryNote: '捕捉到千鈞一髮的求生信號！心緒高度凝聚，立刻展開救援！',
    successButtonText: '【上前介入】：「這絕非老鼠！請警衛開啟502號房！」',
    failureNoticeText: '【這絕對不是老鼠！】：雖然剛才腦中閃過別的念頭，但你身為偵探的直覺猛然炸響——那聲音微弱卻帶著節奏間歇，分明是指甲刮擦石膏板的瀕死求救！這絕對不是老鼠，裡面有人！',
    failureButtonText: '【恍然大悟・立即行動】：「這絕非老鼠！警衛快開502門救人！」',
    timeLimit: 15
  }
};
