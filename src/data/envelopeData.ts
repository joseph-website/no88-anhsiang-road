import { VintageEnvelopeData } from '../components/VintageEnvelopeModal';

export const VINTAGE_ENVELOPES: Record<string, VintageEnvelopeData> = {
  shredded_letter: {
    id: 'shredded_letter',
    title: '寄給404號房的信封與手寫信件',
    sender: '安祥路88號 404室 (張浩 留)',
    recipient: '404號房 住戶 鈞啟',
    postmarkDate: '1998年11月04日',
    postmarkLocation: 'CITY POST // 市郵局',
    envelopeType: 'airmail',
    classificationBadge: 'KEY EVIDENCE // 關鍵證物',
    letterContent: {
      header: '【致未來的自己 / 404號房客之手書信件】',
      subHeader: '從504號房垃圾桶深處尋獲之泛黃信封，紙質脆化但字跡仍可辨識',
      lines: [
        '【寄件人：404號房客（張浩）】',
        '「……如果你正在讀這封信，說明你也察覺到了不對勁。大樓裡所有的規則都是為了掩蓋同一個事實——',
        '4樓與404號房一直都存在，只是所有人的認知被某種超常力量徹底遮蔽了。',
        '不要相信他們發給你的任何規則。如果能搬家最好立即搬離；若暫時無法離開，請務必萬事小心。',
        '假裝你不知道你知道這一切。切勿在白衣警衛面前提及四樓，切勿在電梯裡尋找不存在的按鈕……」'
      ],
      marginNote: '信封邊緣用紫色墨水蓋有奇怪的水印與未來的郵戳日期。張浩似乎在四樓扭曲的時空中試圖向外界傳遞求救信號！',
      hasFutureWatermark: true,
      postscript: '——404號房客 筆（郵戳蓋印日期異常，邊緣有被撕碎後重新拼湊的摺痕）',
      footer: '安祥路88號・404室'
    },
    actionButtonText: '收納至隨身物證檔案袋'
  },

  old_case_file: {
    id: 'old_case_file',
    title: '1998年404號房失蹤懸案卷宗 (半年前調閱移交密封袋)',
    sender: '市政府警察局 安祥分局刑事科 / 檔案室',
    recipient: '私家偵探事務所 負責人 鈞啟',
    postmarkDate: '1998年05月19日',
    postmarkLocation: 'CITY POLICE DEPT',
    envelopeType: 'confidential',
    classificationBadge: 'POLICE ARCHIVE // 刑案卷宗',
    deliveryNote: '【密】限時雙掛號（半年前移交調閱）',
    letterContent: {
      header: '【案號：市警安刑字第9700519086號 函】',
      subHeader: '發黃公文夾，邊緣有紅色受潮印泥與金屬釘孔',
      lines: [
        '【主旨】：安祥路88號連環租客失蹤案初步查訪調查報告',
        '【附件】如主旨',
        '【紀錄概要】：接獲報案，該大樓自1998年落成以來，陸續有三名租客在搬入後無故失聯。',
        '管委會與值班警衛堅稱大樓跳過四樓編號（101~505），無404號房。',
        '然而現場勘查員於電梯井通風口測得微弱打字機機械運轉聲。失蹤者友人留下一張紙條：『四樓是存在的，但所有人都假裝看不見。』'
      ],
      marginNote: '卷宗封底夾層被膠水黏住，裡面藏有一張拍攝於1998年的四樓走廊拍立得照片！',
      polaroidCaption: '1998年第一任失蹤者背面血書：「第一任失蹤者留：不要看鏡子，不要回答電梯對講機，不要相信白衣警衛的點名。」',
      footer: '安祥分局刑事科・密封歸檔'
    },
    actionButtonText: '收納至隨身物證檔案袋'
  },

  building_blueprints: {
    id: 'building_blueprints',
    title: '1998～2002年大樓違章加蓋圖紙與歷史產權公文袋',
    sender: '工務局 建築管理處 / 違章建築查報隊',
    recipient: '宏泰營造工程股份有限公司 / 大樓管理委員會',
    postmarkDate: '1998年08月12日',
    postmarkLocation: 'BUREAU OF BUILDING',
    envelopeType: 'manila',
    classificationBadge: 'STRUCTURAL BLUEPRINT // 違建公文',
    letterContent: {
      header: '【工務局違章建築勒令停工處分公函】',
      subHeader: '大型牛皮紙工程檔案袋，內附手繪結構剖面藍圖與折頁暗圖',
      lines: [
        '【處分主旨】：安祥路88號大樓私自於3樓至5樓間違章夾層加蓋「四樓」工程，勒令即日起全面停工封存。',
        '【結構查驗分析】：',
        '1. 該違建樓層中央被打通為巨型密閉機房，設有密集機械通風管道。',
        '2. 通風管直接連通整棟大樓客用電梯井與各樓層配電箱。',
        '3. 現場稽查員回報：未通電狀態下，四樓管道內部持續傳來高分貝打字機敲擊音律……'
      ],
      marginNote: '藍圖折頁暗圖揭示：四樓的空間物理結構被夾在三樓天花板與五樓地板之間，通風管道正是怪異聲響與機油味蔓延全棟的通道！',
      footer: '工務局建築管理處 查報股'
    },
    actionButtonText: '收納至隨身物證檔案袋'
  },

  rule_resident: {
    id: 'rule_resident',
    title: '住戶規則 (504號房客廳茶几)',
    sender: '安祥大樓管理委員會',
    recipient: '全體住戶及來訪客人 閣下',
    postmarkDate: '1998年10月01日',
    postmarkLocation: 'PROPERTY NOTICE // 管委會核准公告',
    envelopeType: 'manila',
    classificationBadge: 'RESIDENT RULEBOOK // 住戶規約',
    letterContent: {
      header: '【住戶規則】',
      subHeader: '本大樓歡迎各位住戶邀請家人朋友來訪，但請住戶及來訪客人務必詳閱並遵守以下規則，以維持大樓安全。',
      lines: [
        '1. 本大樓共四層樓，編號為1樓至5樓，沒有4樓。',
        '2. 如果您發現身處4樓，請利用電梯回到1樓，再重新前往您要去的樓層。',
        '3. 大樓警衛制服為白衣黑褲，如果有穿著其他顏色制服的人自稱警衛，請忽略他。',
        '4. 如發生任何異常，請使用電梯移動。',
        '5. 電梯內出現空白按鈕時，電梯仍可以正常使用，但請勿按下空白按鈕。',
        '6. 從一樓前往各樓層皆可使用樓梯。',
        '7. 在一樓以外的樓層，若想使用樓梯移動，請務必確認標示樓層數。'
      ],
      marginNote: '條文第1條寫著「沒有4樓」，但第2條卻指示「若身處4樓請利用電梯回到1樓」——兩條條文之間存在著令人毛骨悚然的自相矛盾！',
      footer: '本規則經大樓管理委員會核准公告。'
    },
    actionButtonText: '收錄至規則手冊'
  },

  rule_cleaner: {
    id: 'rule_cleaner',
    title: '清潔人員工作規則 (二樓清潔推車)',
    sender: 'OOO清潔股份有限公司董事會',
    recipient: '派駐安祥大樓清潔人員 執照',
    postmarkDate: '2012年定期稽核',
    postmarkLocation: 'CLEANING SERVICE // 工作規程',
    envelopeType: 'manila',
    classificationBadge: 'CLEANING PROTOCOL // 工作規程',
    letterContent: {
      header: '【清潔人員工作規則】',
      subHeader: '向二樓清潔員李阿姨取得之工作規則單據，紙質略顯潮濕',
      lines: [
        '1. 本大樓包含四樓在內共五層樓，若警衛堅持四樓不存在，請不要與他爭辯。',
        '2. 404號房住戶表示無須打掃亦不接受任何形式打擾，作業時請直接略過該房間。',
        '3. 大樓設備老舊，電梯偶有異常狀況發生。若操作時出現未標示或無法辨識之按鈕，請停止使用電梯。',
        '4. 非必要情況下，請優先使用樓梯移動。',
        '5. 工作報告無須記錄404相關事項，以避免資料錯誤。'
      ],
      marginNote: '李阿姨備註：「第1條直接承認四樓存在！但第2條卻命令清潔員略過404……這間公司到底隱瞞了什麼？」',
      footer: '本規則經OOO清潔股份有限公司董事會核准公告。※ 若發現與規則不符之處，請以現場狀況為主，並優先保護自身安全。'
    },
    actionButtonText: '收錄至規則手冊'
  },

  rule_guard: {
    id: 'rule_guard',
    title: '警衛工作規則 (一樓警衛室值班台)',
    sender: 'XXX保全股份有限公司董事會',
    recipient: '安祥大樓值班警衛',
    postmarkDate: '保全派駐規約',
    postmarkLocation: 'SECURITY POST // 警衛規程',
    envelopeType: 'police',
    classificationBadge: 'SECURITY PROTOCOL // 警衛規章',
    letterContent: {
      header: '【警衛工作規則】',
      subHeader: '警衛於對話中出示之護貝規約手冊',
      lines: [
        '1. 本大樓共四層樓，編號為1樓至5樓，沒有4樓。',
        '2. 如果您發現身處4樓，請利用電梯回到1樓，再重新前往您要去的樓層。',
        '3. 警衛制服為白衣黑褲，上班期間請勿任意更衣。',
        '4. 若發現制服無法辨認顏色，請立即通知公司並打卡下班，公司會指派其他人代班。',
        '5. 同一時間只會有一位警衛值勤，若有其他人自稱警衛，請無視他並回到警衛室進行通報。',
        '6. 警衛室是安全的，可以在裡面休息。',
        '7. 電梯內出現未標示按鈕時仍可正常使用，但請勿按下該按鈕。',
        '8. 從一樓前往各樓層皆可使用樓梯。',
        '9. 在一樓以外的樓層，若想使用樓梯移動，請務必確認標示樓層數。',
        '10. 請忽略監視系統操作手冊。'
      ],
      marginNote: '第10條赫然寫著「請忽略監視系統操作手冊」！這代表警衛與監視器背後的運作系統處於對立與互相隱瞞的狀態！',
      footer: '本規則經XXX保全股份有限公司董事會核准公告。'
    },
    actionButtonText: '收錄至規則手冊'
  },

  rule_cctv: {
    id: 'rule_cctv',
    title: '監視系統操作指引 (警衛室主機抽屜)',
    sender: '大樓監視安控中心',
    recipient: '安控機房操作員',
    postmarkDate: '系統建置文件',
    postmarkLocation: 'CCTV CONTROL ROOM',
    envelopeType: 'confidential',
    classificationBadge: 'CCTV MANUAL // 監控指引',
    letterContent: {
      header: '【監視系統操作指引】',
      subHeader: '趁警衛不在時從監視主機抽屜尋獲之操作手冊',
      lines: [
        '1. 所有樓層皆應顯示於監視器畫面中，包含四樓。',
        '2. 若畫面中出現404號門牌，請不要記錄其出現位置。',
        '3. 404門牌出現在不同位置為正常現象，請勿調整系統。',
        '4. 若監視器畫面與實際情形有所出入，請以監視器畫面為準。',
        '5. 若畫面顯示有人進入404，除非他離開404或可以從其他監視畫面確認他的位置，否則請不要離開警衛室。',
        '6. 若您在畫面中看到自己，請確認畫面中的自己所在空間是否是警衛室。',
        '7. 若第6點無法確認，請立即重啟監視系統並再次確認。',
        '8. 本系統不會出錯。'
      ],
      marginNote: '「本系統不會出錯」——第1條明確要求包含四樓，第8條的絕對自信與第6條的詭異自我確認形成強烈的心理壓迫。',
      footer: '大樓監視安控中心'
    },
    actionButtonText: '收錄至規則手冊'
  },

  rule_handwritten: {
    id: 'rule_handwritten',
    title: '前任房客留下的便箋（手寫規則）',
    sender: '逃脫者的血淚筆記',
    recipient: '下一位走進這裡的人',
    postmarkDate: '逃生遺留',
    postmarkLocation: 'SECURITY POST // 警衛室暗角',
    envelopeType: 'confidential',
    classificationBadge: 'HANDWRITTEN NOTE // 絕筆便箋',
    letterContent: {
      header: '【手寫的規則】',
      subHeader: '字跡顫抖，部分字詞被黑色原子筆反覆塗改抹去',
      lines: [
        '1. 4樓與404一直都在',
        '2. 管理員不知道（「不」字有被塗改的痕跡，但並未完全掩蓋掉）',
        '3. 清潔員不知道它的存在（「它的存在」四個字的筆跡明顯不同）',
        '4. 住戶不知道',
        '5. 規則是要管理「它」，不是你',
        '6. 如果你看到這份規則，快逃',
        '7. 假裝不知道你知道'
      ],
      marginNote: '「假裝不知道你知道」——這是破解安祥路88號認知怪異的最核心思維防線！',
      footer: '祝你好運。'
    },
    actionButtonText: '收錄至規則手冊'
  },

  rule_fake_evacuation: {
    id: 'rule_fake_evacuation',
    title: '大樓緊急避難指引 (怪異偽造告示)',
    sender: '「大樓管理處」敬上',
    recipient: '全體大樓訪客與住戶',
    postmarkDate: '異常時空',
    postmarkLocation: '4F CORRIDOR // 認知陷阱',
    envelopeType: 'police',
    classificationBadge: 'FAKE RULE // 偽造規則',
    letterContent: {
      header: '【大樓緊急避難指引（偽造）】',
      subHeader: '近期因本大樓進行結構補強及產權重新登記，造成樓層標示與實際空間不符等，本大樓管理處特此聲明：',
      lines: [
        '1. 本大樓原先因民俗避諱跳過四樓編號，現為符合消防法規，已全面恢復「四樓」之標示與使用。請依照最新更換之樓層牌移動。',
        '2. 為協助住戶釐清大樓產權及租賃使用權，本管理處將404號房暫定為專案辦公室，並已有專案人員進駐辦公。若您有任何需求，可直接前往404號房登記，切勿聽信未經證實的民間傳言。',
        '3. 為區分警衛與專案人員，專案人員將穿著紅色制服。若在樓層間遇到該員，可主動向其尋求協助。',
        '4. 因應專案辦公室需求，電梯將優先停靠四樓。若於電梯看到未標示之按鈕，該按鈕即為尚未來得及印刷之四樓停靠按鈕。',
        '5. 如遇到宣稱大樓有危險之人，其為非法抗議之民眾，請通報專案人員協助驅趕。'
      ],
      specialWarning: '【警告】：此為認知污染產生的偽造規則，旨在誘騙調查員進入404成為怪異養分！',
      marginNote: '紅色墨水未乾，文字排列格式與正規公文不符，是典型的「假造誘餌」！',
      footer: '安全是我們唯一的承諾 —— 大樓管理處 敬上'
    },
    actionButtonText: '識破並收錄偽造規則'
  }
};
