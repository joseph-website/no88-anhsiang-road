import { EndingId } from '../types';

export interface EndingElectronicDossier {
  endingId: EndingId;
  caseFileCode: string;
  classification: 'PUBLIC' | 'RESTRICTED' | 'CLASSIFIED' | 'PARADOX';
  publicInvestigationSummary: string[];
  detectiveOfficialVerdict: string;
  classifiedAttachment?: {
    title: string;
    description: string;
    redactedContent: string[];
    unredactedContent: string[];
  };
  audioWaveformNote?: {
    label: string;
    sampleRateText: string;
    transcript: string;
  };
  electronicStamp: {
    statusText: string;
    color: 'emerald' | 'amber' | 'crimson' | 'purple' | 'cyan';
    signDate: string;
  };
}

export const ENDING_ELECTRONIC_DOSSIERS: Record<EndingId, EndingElectronicDossier> = {
  ending8: {
    endingId: 'ending8',
    caseFileCode: 'CASE-2012-AH88-TRUE-DAWN',
    classification: 'PUBLIC',
    publicInvestigationSummary: [
      '經本承辦人徹夜實地勘驗，安祥路88號所謂「404號失蹤空間」實為1998年建商非法加蓋且未登錄於工務局之密閉夾層。',
      '現場尋獲之六大核心實體物證（1998違建施工藍圖、504號房備份鑰匙、未寄出的住戶聯名陳情信、警衛室日誌卡、柯達黑白底片筒、失蹤者張浩之錄音筆），已完整串聯三十年產權糾紛與謠言散播鏈。',
      '在破除偽造規則與封閉環境誘發的群體性認知障礙後，失蹤受困之友人張浩及歷年受困者共計四名均已全員安全撤出並送醫觀察，生命體徵平穩。',
      '工務局建管處已於本日清晨 06:30 正式對頂樓非法違章建築張貼強制拆除公告。本案圓滿偵結。'
    ],
    detectiveOfficialVerdict: '「恐懼往往源於未知與盲從。當所有的物證被攤在陽光下，三十年的荒謬謊言便如泡影般消散。這世上沒有走不出的走廊，只有不敢回頭面對真相的人心。」',
    classifiedAttachment: {
      title: '附錄甲：404號房物理現象與心理解構私密鑑識報告',
      description: '【承辦人內部加密歸檔】關於四樓空間重疊與規則具現化的認知科學註記',
      redactedContent: [
        '現場打字機產生的低頻震動與██████具有高度同頻共振效應。',
        '經比對1998年合約與底片，確認該空間係因住戶集體深信「██████」而產生強烈心理暗示。',
        '當我們拿出完整實體證據時，集體信念系統瞬間瓦解，██████完全回歸物理常規。'
      ],
      unredactedContent: [
        '現場打字機產生的低頻震動與大樓通風管道空腔效應具有高度同頻共振效應。',
        '經比對1998年合約與底片，確認該空間係因住戶集體深信「違反規則即會被抹除」而產生強烈心理暗示。',
        '當我們拿出完整實體證據時，集體信念系統瞬間瓦解，所有扭曲感完全回歸物理常規。'
      ]
    },
    audioWaveformNote: {
      label: '附件音訊：張浩錄音筆還原音軌 (Track-04_Recovered.wav)',
      sampleRateText: '44.1 kHz / 16-bit PCM • 清晰度 99.4%',
      transcript: '「……陽光照進來了！偵探，我看見樓梯口的光了……那些紙條……真的只是普通的廢紙……我們做到了！」'
    },
    electronicStamp: {
      statusText: '全案偵結 • 全員生還歸檔',
      color: 'emerald',
      signDate: '2012.10.24'
    }
  },

  ending5: {
    endingId: 'ending5',
    caseFileCode: 'CASE-2012-AH88-TRUTH-DECONSTRUCT',
    classification: 'PUBLIC',
    publicInvestigationSummary: [
      '承辦人深入四樓違建空間，面對現場因通風不良與電磁異常引發之群體幻象，以嚴密邏輯逐一駁斥偽造之《大樓管理規約》。',
      '查證證實該違章隔間係人為恐懼暗示之產物，核心打字機設備因電路短路過熱損壞後，現場幻覺干擾隨即終止。',
      '失蹤友人張浩獲救，意識清楚，隨後由救護車接駁前往市立醫院休養。'
    ],
    detectiveOfficialVerdict: '「只要理性與勇氣尚存，再龐大的規則怪談也敵不過鐵一般的邏輯推論。恐懼只能支配願意相信它的人。」',
    classifiedAttachment: {
      title: '附錄甲：404房間邏輯悖論推演筆錄',
      description: '【承辦人內部加密手札】以理性反制認知干擾的思維模型',
      redactedContent: [
        '若規約第4條成立，則第7條必然自我矛盾；對方的認知邏輯存在██████。',
        '透過直接指出因果漏洞，對方的意識場出現██████，最終自體崩潰。'
      ],
      unredactedContent: [
        '若規約第4條成立，則第7條必然自我矛盾；對方的認知邏輯存在致命破綻。',
        '透過直接指出因果漏洞，對方的意識場出現連鎖崩解，最終自體崩潰。'
      ]
    },
    audioWaveformNote: {
      label: '現場錄音切片：404打字機停擺瞬間 (Rec_404_Shutdown.wav)',
      sampleRateText: '22.05 kHz / 16-bit Mono • 雜訊抑制過濾',
      transcript: '「……打字機的雜音停了。窗外的暴雨不知何時已經轉小……張浩，我們回去吧。」'
    },
    electronicStamp: {
      statusText: '案件偵結 • 真相明朗',
      color: 'emerald',
      signDate: '2012.10.24'
    }
  },

  ending6: {
    endingId: 'ending6',
    caseFileCode: 'CASE-2012-AH88-RECONCILE',
    classification: 'RESTRICTED',
    publicInvestigationSummary: [
      '針對安祥路88號歷史遺留問題，承辦人採取深度調解與傾聽程序，查明三十年來因違建拆遷所造成之多起家庭困境與心理創傷。',
      '現場透過書面記錄方式建立溝通管道，平息了長期積累的負面情緒共振。',
      '張浩已被安全護送至一樓大廳，身體狀況無大礙。承辦人受聘為該大樓後續產權清查與歷史檔案顧問。'
    ],
    detectiveOfficialVerdict: '「很多時候，人們需要的不是冰冷的手術刀去切除記憶，而是一份遲到了三十年的理解與傾聽。唯有直面傷痛，游蕩的執念才能找到安息之所。」',
    classifiedAttachment: {
      title: '附錄乙：安祥路88號舊租客回憶錄摘記',
      description: '【限制查閱】被歷史公文遺漏的真實住戶心聲',
      redactedContent: [
        '1998年冬天，那場拆遷糾紛讓五戶人家在暴雨中██████。',
        '他們留在牆上的不是詛咒，而是希望有人能記得「██████」。'
      ],
      unredactedContent: [
        '1998年冬天，那場拆遷糾紛讓五戶人家在暴雨中失去了最後的遮雨屋頂。',
        '他們留在牆上的不是詛咒，而是希望有人能記得「我們曾經在這裡生活過」。'
      ]
    },
    audioWaveformNote: {
      label: '走廊氛圍收音：晨光微曦的安祥長廊 (Corridor_Dawn_Chime.wav)',
      sampleRateText: '44.1 kHz / 24-bit Stereo • 溫和殘響',
      transcript: '「（遠處傳來清脆的風鈴聲與溫和的翻書聲）……謝謝你聽見了我們。」'
    },
    electronicStamp: {
      statusText: '專案調解 • 達成共生協議',
      color: 'cyan',
      signDate: '2012.10.24'
    }
  },

  ending7: {
    endingId: 'ending7',
    caseFileCode: 'CASE-2012-AH88-PARADOX-LOOP',
    classification: 'PARADOX',
    publicInvestigationSummary: [
      '【系統警告：偵測到因果時間戳矛盾】',
      '調查檔案記錄顯示該案件於 2012 年重啟，但內部日誌記錄之物理指針數值與 1998 年 10 月 24 日完全吻合。',
      '現場物理破壞行為導致因果邏輯鏈斷裂，事件處於未閉合的重複循環狀態。'
    ],
    detectiveOfficialVerdict: '「單純的憤怒與盲目暴力只會砸碎表象，卻抹不平深植於認知中的執念。如果找不到解開鎖鏈的鑰匙，我們注定會在同一個雨夜中無盡輪迴。」',
    classifiedAttachment: {
      title: '附錄丙：時間戳重置異常分析報告',
      description: '【最高機密・因果悖論警告】不可抹除的循環印記',
      redactedContent: [
        '硬碟寫入之時間戳在到達23:59後自動跳回██████。',
        '承辦人右手手腕浮現之紅痕與1998年案卷中記載的「██████」完全一致。'
      ],
      unredactedContent: [
        '硬碟寫入之時間戳在到達23:59後自動跳回1998/10/24 00:00。',
        '承辦人右手手腕浮現之紅痕與1998年案卷中記載的「404房印記」完全一致。'
      ]
    },
    audioWaveformNote: {
      label: '損毀磁帶重播：時鐘倒流倒數聲 (Clock_Rewind_Loop.wav)',
      sampleRateText: '11.025 kHz / 8-bit • 極高頻率失真',
      transcript: '「……滴答、滴答……林偵探，我已經到您事務所樓下了……」'
    },
    electronicStamp: {
      statusText: '因果重置 • 標記未決循環',
      color: 'purple',
      signDate: '1998.10.24 ↺'
    }
  },

  ending3: {
    endingId: 'ending3',
    caseFileCode: 'CASE-2012-AH88-PRAGMATIC-RESCUE',
    classification: 'RESTRICTED',
    publicInvestigationSummary: [
      '承辦人於大樓四樓尋獲精神極度衰弱之委託人友人張浩，並在第一時間施以緊急脫離處置。',
      '因現場環境安全風險劇增，承辦人未進一步對核心異常源進行採樣與溯源，優先保全涉案人員生命安全。',
      '張浩經送醫治療後無生命危險，但部分記憶受重大壓力創傷影響而呈現片段失憶。委託案依約結案。'
    ],
    detectiveOfficialVerdict: '「私家偵探的第一原則是活著帶人走出來。雖然心中的謎團可能永遠得不到解答，但在生死攸關的關頭，生命遠比真相更為沉重。」',
    classifiedAttachment: {
      title: '附錄丁：張浩出院後初期觀察手札',
      description: '【承辦人備忘】關於友人術後恢復與遺忘症狀的追蹤',
      redactedContent: [
        '張浩對四樓的打字機與規則完全失去了記憶，唯獨在聽到██████時會劇烈顫抖。',
        '我決定銷毀這份調查日誌的備份，有些秘密██████。'
      ],
      unredactedContent: [
        '張浩對四樓的打字機與規則完全失去了記憶，唯獨在聽到打字機敲擊聲時會劇烈顫抖。',
        '我決定銷毀這份調查日誌的備份，有些秘密就讓它永遠爛在肚子裡。'
      ]
    },
    audioWaveformNote: {
      label: '現場逃生收音：急促腳步與鐵門關閉聲 (Rapid_Footsteps_Exit.wav)',
      sampleRateText: '22.05 kHz / 16-bit Mono',
      transcript: '「快跑！別回頭看！門要關上了——！」'
    },
    electronicStamp: {
      statusText: '救援成功 • 終止調查結案',
      color: 'amber',
      signDate: '2012.10.24'
    }
  },

  ending4: {
    endingId: 'ending4',
    caseFileCode: 'CASE-2012-AH88-ASSIMILATION',
    classification: 'CLASSIFIED',
    publicInvestigationSummary: [
      '【內部緊急通報】：承辦調查員林偵探在執行安祥路88號勘驗任務期間失去通訊聯絡。',
      '警方後續搜查隊伍於大樓四樓走廊發現其遺留之隨身公事包與調查設備，唯無任何人員脫出跡象。',
      '現場打字機處新發現一份以標準公文格式打印之【新任調查員規則】，筆跡與承辦人吻合。該案件標記為特殊失蹤。'
    ],
    detectiveOfficialVerdict: '「歡迎來到404。請務必仔細閱讀每一條規矩……在這裡，服從規則是唯一的生存之道，也是唯一的歸宿。」',
    classifiedAttachment: {
      title: '附錄戊：現場打字機新列印之規約殘卷',
      description: '【極度危險・禁止直視】被同化之意識殘片',
      redactedContent: [
        '第1條：若你在走廊看見穿著紅色制服的自己，請██████。',
        '第2條：不要試圖尋找出口，因為██████。'
      ],
      unredactedContent: [
        '第1條：若你在走廊看見穿著紅色制服的自己，請向他微笑並接過名冊。',
        '第2條：不要試圖尋找出口，因為這棟大樓本身就是最溫暖的牢籠。'
      ]
    },
    audioWaveformNote: {
      label: '異常音訊殘留：規律機械敲擊聲 (Typewriter_Loop_Echo.wav)',
      sampleRateText: '44.1 kHz / 16-bit Mono • 頻譜異常畸變',
      transcript: '「（喀嗒、喀嗒、喀嗒……）規則第 1 條……請留在房間裡……」'
    },
    electronicStamp: {
      statusText: '調查員失聯 • 卷宗強制封存',
      color: 'crimson',
      signDate: '2012.10.24'
    }
  },

  ending2: {
    endingId: 'ending2',
    caseFileCode: 'CASE-2012-AH88-CAUTIOUS-WITHDRAW',
    classification: 'PUBLIC',
    publicInvestigationSummary: [
      '承辦人於現場安控中心勘驗期間，發現大樓監控系統與電路存在嚴重串音與接地不良引發之設備故障。',
      '基於現場多處安全隱患與委託合約之免責條款，承辦人依規約要求執行預防性撤退，未進一步涉入高風險區域。',
      '委託案終止，已退還全額委託費用，並向相關單位提報大樓公共安全疑慮。'
    ],
    detectiveOfficialVerdict: '「好奇心能殺死貓，也能殺死一個自以為是的偵探。承認自己的極限並及時抽身，有時候才是最明智的職業選擇。」',
    classifiedAttachment: {
      title: '附錄己：警衛室監控串線干擾分析',
      description: '【一般備忘】關於設備故障之物理記錄',
      redactedContent: [
        '監視器第四頻道出現的殘影疑似為██████。',
        '我決定不再深究，有些事情██████。'
      ],
      unredactedContent: [
        '監視器第四頻道出現的殘影疑似為早年錄影帶未消磁產生的重影。',
        '我決定不再深究，有些事情不知道反而能睡得安穩。'
      ]
    },
    audioWaveformNote: {
      label: '安控中心背景音：螢幕白雜訊干擾 (CRT_Static_Noise.wav)',
      sampleRateText: '22.05 kHz / 8-bit Mono',
      transcript: '「（沙沙沙……）監視器螢幕閃爍……電梯門開啟提示音響起……」'
    },
    electronicStamp: {
      statusText: '主動撤退 • 合約中止',
      color: 'amber',
      signDate: '2012.10.24'
    }
  },

  ending1: {
    endingId: 'ending1',
    caseFileCode: 'CASE-2012-AH88-ABANDONED',
    classification: 'RESTRICTED',
    publicInvestigationSummary: [
      '承辦人於大樓一樓大廳完成初步環境搜查後，評估該案件涉及複雜產權糾紛與嚴重治安死角，非一般民事委託調查所能涵蓋。',
      '依執業倫理與人身安全指引，承辦人於勘查初期即行終止委託合約並離場。',
      '後續相關都市傳說仍於地方社區流傳。'
    ],
    detectiveOfficialVerdict: '「這座大樓的陰影太深了。當你凝視深淵時，深淵早已為你準備好了房間號碼牌。」',
    classifiedAttachment: {
      title: '附錄庚：大廳規則抄件與後續觀察',
      description: '【承辦人隨筆】關於社區傳聞的碎片記錄',
      redactedContent: [
        '幾個月後在地方新聞上看見大樓504號房窗戶，似乎看見了██████。',
        '我想那大概只是我的██████吧。'
      ],
      unredactedContent: [
        '幾個月後在地方新聞上看見大樓504號房窗戶，似乎看見了我自己的身影。',
        '我想那大概只是我的錯覺吧……希望如此。'
      ]
    },
    audioWaveformNote: {
      label: '大門環境音：雨夜轉身離去的腳步聲 (Rain_Exit_Footsteps.wav)',
      sampleRateText: '22.05 kHz / 16-bit Mono',
      transcript: '「（大門推開的刺耳金屬聲……暴雨聲傾瀉而入……）」'
    },
    electronicStamp: {
      statusText: '終止委託 • 留存建檔',
      color: 'amber',
      signDate: '2012.10.24'
    }
  },

  ending0: {
    endingId: 'ending0',
    caseFileCode: 'CASE-2012-AH88-FALSE-CLOSE',
    classification: 'PUBLIC',
    publicInvestigationSummary: [
      '委託人陳先生之失蹤友人張浩，經偵探勘破五樓住戶指甲刮牆求生信號，由警衛開啟鎖閉之 502 號房破拆相鄰隔間輕鋼石膏夾壁後順利尋獲。',
      '經現場勘驗，當事人因近期投資失利與龐大債務壓力，精神極度衰弱焦慮，躲入暗室避不見面。現場散落抗焦慮藥物空瓶。',
      '承辦人即時給予心理安撫並通報 119 與委託人到場協助，當事人生命體徵平穩，已送往市立聯合醫院松德院區觀察。',
      '現場無任何怪異暴力跡象，社會派失蹤案件正式宣告閉案。'
    ],
    detectiveOfficialVerdict: '「一切看似回歸了理性的社會現實，真相在石膏夾壁被破拆開的瞬間塵埃落定……但這真的就是全部了嗎？」',
    classifiedAttachment: {
      title: '附錄零：市立療養院後續追蹤與不可言說之異狀',
      description: '【承辦人私人備忘】結案三日後的後續探訪筆記',
      redactedContent: [
        '張浩在病房中不斷用指甲在床單上刮寫著「██████」。',
        '他的喉嚨裡持續發出像機械打字機般的「██████」聲……'
      ],
      unredactedContent: [
        '張浩在病房中不斷用指甲在床單上刮寫著「本大樓沒有四樓」。',
        '他的喉嚨裡持續發出像機械打字機般的「咔噠、咔噠」聲……怪異已然侵蝕他的神經！'
      ]
    },
    audioWaveformNote: {
      label: '病房錄音：深夜探訪時的呼吸聲 (Hospital_Night_Whisper.wav)',
      sampleRateText: '44.1 kHz / 16-bit PCM',
      transcript: '「……不要相信閉案報告……404……它根本沒有放過我……」'
    },
    electronicStamp: {
      statusText: '表面閉案 • 認知異變伏筆',
      color: 'emerald',
      signDate: '2012.10.24'
    }
  }
};
