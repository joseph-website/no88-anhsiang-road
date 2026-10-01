/**
 * Exploration Data for Non-Linear Apartment Investigation
 * Rich interactive hotspots, flavor interactions, sensory feedback, and key clues
 */

export interface HotspotAction {
  id: string;
  label: string;
  resultText: string;
  soundEffect?: 'water' | 'switch' | 'knock' | 'paper' | 'glitch' | 'phone' | 'chime' | 'cctv' | 'tension';
  sanDelta?: number;
  obtainItemId?: string;
  obtainRuleId?: string;
  triggerMinigame?: 'letter_puzzle' | 'cctv_deduction' | 'chase' | 'boss';
  triggerEnding?: string;
  requiresItem?: string;
  requiresRule?: string;
  customCheck?: string;
}

export interface HotspotItem {
  id: string;
  name: string;
  iconName: string;
  category: 'rule' | 'clue' | 'flavor' | 'dialogue' | 'device';
  shortDesc: string;
  inspectText: string;
  actions: HotspotAction[];
}

export interface BuildingLocation {
  id: string;
  floor: number | string;
  name: string;
  subtitle: string;
  ambientDescription: string;
  imageTheme: 'lobby' | 'security' | 'corridor' | 'room504' | 'elevator' | 'stairs' | 'corridor4f';
  hotspots: HotspotItem[];
  isLocked?: boolean;
  lockReason?: string;
  isSafeZone?: boolean;
}

export const BUILDING_LOCATIONS: Record<string, BuildingLocation> = {
  loc_1f_lobby: {
    id: 'loc_1f_lobby',
    floor: '1F',
    name: '一樓大廳與住戶交誼廳',
    subtitle: '寬敞明亮的大理石大廳與住戶交誼區，設有沙發茶几、公共飲水機與物業公告欄',
    ambientDescription: '大廳明亮整潔，鋪設著光潔的大理石地磚。此處設有住戶交誼沙發、公共飲水機與社區物業公告欄，一樓沒有住戶居住，空間開闊安寧，沒有任何危險與異樣。',
    imageTheme: 'lobby',
    isSafeZone: true,
    hotspots: [
      {
        id: 'hotspot_lobby_overview',
        name: '調查一樓大廳環境',
        iconName: 'Search',
        category: 'flavor',
        shortDesc: '環顧明亮整潔的一樓大廳、信箱牆、警衛窗口與交誼沙發。',
        inspectText: '一樓大廳鋪設著光潔如鏡的大理石地磚，水銀吊燈散發著柔和明亮的光芒。正前方是值班警衛窗口，左側是一整面住戶信箱，右側則是住戶交誼沙發區與公告欄。整體環境井然有序，充滿現代社區的安寧感。',
        actions: [
          {
            id: 'act_explore_1f_overview',
            label: '仔細環顧大廳各項設施與動線',
            resultText: '你仔細觀察了一樓大廳的格局。明亮的照明與乾淨的空間讓心神安定，大廳各處的物件已可逐一進行深入搜查。',
            soundEffect: 'switch'
          }
        ]
      },
      {
        id: 'hotspot_guard_window',
        name: '值班警衛窗口（王大偉）',
        iconName: 'Shield',
        category: 'dialogue',
        shortDesc: '穿著白色短袖襯衫、黑長褲的值班警衛正在翻看日誌。',
        inspectText: '警衛名牌上寫著「值班主任：王大偉」。他的面容沉穩，但仔細端詳他的證件照，五官的邊緣似乎有一層極微弱的灰濛噪點。',
        actions: [
          // Phase 1: Initial basic dialogues (before 504 investigation & 4F anomaly)
          {
            id: 'guard_ask_case',
            label: '出示委託書，詢問失蹤者張浩與504號房',
            resultText: '警衛（面露不解）：「先生您好。找張浩？我對這個名字沒有印象。我們大樓一層有五戶，房號是101~505。504號房一年多前房客就搬走了，目前是空屋。既然您有委託書，這把『504號房鑰匙』借您上去看看吧。請直接搭乘右側客用電梯直達五樓。夜間時段安全梯防火門全面啟動電子門禁鎖閉管制，未持感應磁扣請勿強行推門，調查完記得下來還我。」',
            soundEffect: 'paper',
            obtainItemId: 'key_504',
            customCheck: 'initial_only'
          },
          {
            id: 'guard_ask_building',
            label: '詢問大樓日常作息與基本狀況',
            resultText: '警衛微笑回答：「我們這棟大樓住戶單純，平時大家各過各的，作息規律。只要遵照大樓常規生活，晚上沒事別在走廊閒晃，大家相安無事。」',
            soundEffect: 'paper',
            customCheck: 'initial_only'
          },

          // Phase 2: Post-504 & Post-Anomaly Inquiries
          {
            id: 'guard_confront_rules',
            label: '出示504房內發現的紙本規則，向警衛對質',
            resultText: '警衛看到你手中的紙條與規則，眼神微微一變，隨後從抽屜拿出一份紙本：「看來您已經看過那份東西了。那是管委會發給住戶的例行規則……我們保全公司也有自己的規定。這份【警衛工作規則】您拿去看看吧。但我身為夜間值班主任，必須堅守在一樓崗位上，按規章絕不能擅離職守，警衛室也暫不對外開放。您如果對大樓還有懷疑，安全梯的門禁我已由中控台解鎖，您可以去問問二樓正在打掃的李阿姨，或是到三樓管線檢修通道看看。但請記住規則上的條款，別多管閒事！」',
            soundEffect: 'paper',
            sanDelta: 2,
            obtainRuleId: 'rule_guard',
            customCheck: 'post_anomaly'
          },
          {
            id: 'guard_ask_next_steps',
            label: '向警衛詢問後續調查動向與二樓三樓狀況',
            resultText: '警衛王大偉嚴肅地指了指電梯與安全梯：「先生，我人在值班崗位上不能擅離職守，警衛室非工作人員不得進入。您如果真想查明真相，不妨上樓去問問 2 樓正在打掃的李阿姨，或是到三樓管線檢修通道勘查。大樓安全梯的電子磁扣我已經替您暫時遠端解鎖了。但請記住規則上的條款，別在走廊閒晃太久，查完早點離開。」',
            soundEffect: 'paper',
            customCheck: 'post_anomaly'
          },
          {
            id: 'guard_ask_red_guard',
            label: '質問剛才在樓上遇到的「紅色制服警衛」',
            resultText: '警衛王大偉神色如常，指了指自己的白色短袖襯衫：「先生您在開玩笑吧？安祥路大樓夜間只有我一個人值班，保全公司的制服從始至終都是白衣黑褲，哪來的紅衣警衛？我今晚一步也沒有離開過警衛室，您大概是太累看錯了。」',
            soundEffect: 'tension',
            customCheck: 'post_anomaly'
          },
          {
            id: 'guard_ask_missing_4f_letter',
            label: '詢問504拼出的碎紙信與大樓消失的「四樓」',
            resultText: '警衛王大偉語氣冷靜得近乎機械化：「先生，我再強調一次，這棟大樓是合法產權建築，編號從101跳過4字頭到505，絕無404號房。信件大概是前房客張浩的精神妄想或惡作劇吧。如果您對大樓系統還有疑問，警衛室的監視主機您不妨看看——不過工作規則第10條寫得很清楚，『請忽略監視系統操作手冊』，請勿自行胡亂操作。」',
            soundEffect: 'paper',
            requiresItem: 'shredded_letter',
            customCheck: 'post_anomaly'
          },
          {
            id: 'guard_return_key_and_inquire',
            label: '歸還504號房鑰匙並詢問張浩退租疑點',
            resultText: '警衛接過鑰匙收進抽屜，平靜地說：「退租手續在物業登記簿上記錄得清清楚楚。至於您在屋內看到的近期生活痕跡……也許是有閒雜人等偷溜進去借住吧。我們物業只對登記在案的合約負責。」',
            soundEffect: 'paper',
            requiresItem: 'key_504',
            customCheck: 'post_anomaly'
          }
        ]
      },
      {
        id: 'hotspot_mailboxes',
        name: '一樓住戶信箱牆 (101~505)',
        iconName: 'Mail',
        category: 'clue',
        shortDesc: '一整面乾淨明亮的不銹鋼住戶信箱格，整齊排列著各戶門牌。',
        inspectText: '信箱格編號依序為：101~105、201~205、301~305、501~505（全棟房號沒有4開頭的格子）。信箱表面乾淨如新，排列整齊，沒有任何異常之處。',
        actions: [
          {
            id: 'mail_inspect_general',
            label: '查看各戶信箱投信口',
            resultText: '裡面塞滿了尋常的披薩外送傳單、超市特價DM與水電催繳單，屬於普通住宅大樓的日常信件。',
            soundEffect: 'paper'
          },
          {
            id: 'mail_inspect_504',
            label: '打開 504 號信箱投信蓋檢查',
            resultText: '504號信箱底部空無一物，只有一層薄薄的乾淨灰塵，確認此戶長期無人領取信件。',
            soundEffect: 'paper'
          }
        ]
      },
      {
        id: 'hotspot_lounge_sofa',
        name: '住戶交誼沙發茶几區',
        iconName: 'Coffee',
        category: 'flavor',
        shortDesc: '寬大舒適的布面沙發與實木茶几，擺放著生活雜誌與管委會財務明細。',
        inspectText: '交誼區寬敞整潔，燈光柔和。茶几上擺著幾本過期的汽車雜誌與管委會收支公示表，洋溢著寧靜的社區生活氣息。',
        actions: [
          {
            id: 'lounge_sit_relax',
            label: '在交誼沙發上靜坐片刻',
            resultText: '坐在柔軟的沙發上閉目深呼吸，明亮的大廳燈光與安詳的氛圍讓你原本緊繃的神經得以放鬆。',
            soundEffect: 'chime',
            sanDelta: 2
          },
          {
            id: 'lounge_search_coffee',
            label: '查看沙發邊几置物籃與冷飲托盤',
            resultText: '★ 獲得物資【冷萃黑咖啡】！在邊几置物籃內尋獲一罐未開封的冰滴黑咖啡。罐身微涼，已收納入物證檔案袋。',
            soundEffect: 'paper',
            obtainItemId: 'canned_coffee'
          },
          {
            id: 'lounge_read_magazines',
            label: '翻閱茶几上的生活雜誌與物業報表',
            resultText: '雜誌多為室內設計與園藝專刊，物業報表記載著每月的電梯保養、水塔清洗與園藝修剪紀錄，一切帳目清楚合規。',
            soundEffect: 'paper'
          }
        ]
      },
      {
        id: 'hotspot_water_dispenser',
        name: '公共飲水機與茶水台',
        iconName: 'Droplets',
        category: 'flavor',
        shortDesc: '立式溫熱純淨飲水機，旁邊整齊擺放著紙杯與茶包。',
        inspectText: '飲水機的運轉燈顯示為綠色的「正常供水中」，濾心更換卡上記錄著上個月剛完成例行保養。',
        actions: [
          {
            id: 'drink_warm_water',
            label: '按取一杯溫開水飲用',
            resultText: '溫熱的純水溫暖了喉嚨與胃部，驅散了從外面暴雨中走進大樓時帶來的潮濕寒氣。',
            soundEffect: 'water',
            sanDelta: 1
          }
        ]
      },
      {
        id: 'hotspot_bulletin_board',
        name: '社區物業公告欄',
        iconName: 'FileText',
        category: 'clue',
        shortDesc: '大型軟木公告欄，張貼著大樓管理辦法與近期社區通知。',
        inspectText: '公告欄上張貼著「本月大樓全面消毒時間」、「垃圾分類清運注意事項」以及「消防安全設備檢驗合格證書」。',
        actions: [
          {
            id: 'bulletin_read_notices',
            label: '仔細閱讀社區物業公告內容',
            resultText: '公告內容十分詳盡正規，管委會蓋章完整，並無任何怪異言論，證實一樓大廳完全依循正常物業管理體系運作。',
            soundEffect: 'paper'
          }
        ]
      },
      {
        id: 'hotspot_courtyard_window',
        name: '採光中庭景觀落地窗',
        iconName: 'SunMedium',
        category: 'flavor',
        shortDesc: '通透的雙層隔音落地玻璃，能俯瞰社區採光中庭。',
        inspectText: '透過擦拭得一塵不染的玻璃窗，能看見中庭幾株修剪整齊的觀景灌木在夜雨中隨風輕擺，給人一種祥和安穩的踏實感。',
        actions: [
          {
            id: 'courtyard_look_outside',
            label: '站在窗前凝望夜雨中的中庭造景',
            resultText: '看著雨水在玻璃窗上劃出晶瑩的水痕，夜雨與庭園景致洗滌了焦慮的心情。',
            soundEffect: 'water',
            sanDelta: 1
          }
        ]
      },
      {
        id: 'hotspot_lobby_exit_door',
        name: '大樓正門玻璃自動門（通往外界）',
        iconName: 'DoorOpen',
        category: 'flavor',
        shortDesc: '通往外界街道的厚重大理石門廳自動門，外頭暴雨傾盆。',
        inspectText: '透過透明玻璃自動門，外頭是夜晚冰冷的暴雨與街道。雨水打在門廊石階上濺起陣陣水花，遠處市區的霓虹燈光在雨幕中顯得格外遙遠模糊。身為專業偵探，在查明真相前絕不輕言撤退。',
        actions: [
          {
            id: 'act_observe_outside_rain',
            label: '透過大門玻璃凝視門外夜雨街景',
            resultText: '夜幕下的安祥路被暴雨籠罩，外頭的車流偶爾呼嘯而過。你注視著玻璃上映出的自己，深呼吸平復心緒，下定決心務必將這棟大樓的秘密查個水落石出。',
            soundEffect: 'water',
            sanDelta: 1
          }
        ]
      }
    ]
  },

  loc_1f_security: {
    id: 'loc_1f_security',
    floor: '1F',
    name: '一樓警衛室內部（安控中樞）',
    subtitle: '警衛暫時離崗後的安控室，數台老舊CRT螢幕閃爍著綠光',
    ambientDescription: '警衛室內空間狹小，空氣中瀰漫著舊電器發熱的焦味與茶葉殘渣氣息。桌上擺著監視器主機，抽屜微開，牆角懸掛著大樓總鎖匙盒。',
    imageTheme: 'security',
    isSafeZone: true,
    hotspots: [
      {
        id: 'hotspot_cctv_console',
        name: '監視系統主控制台 (CCTV TERMINAL)',
        iconName: 'Tv',
        category: 'device',
        shortDesc: '四分割畫面的黑白CRT監視螢幕，正顯示著大樓各角落。',
        inspectText: '螢幕分成四格，分別顯示大廳、二樓走廊、三樓梯廳與五樓。但螢幕角落不斷跳出「CAM-04 (404 CORRIDOR) ERROR」的紅色閃爍警告！',
        actions: [
          {
            id: 'cctv_operate',
            label: '操作控制台並展開【深度推理】',
            resultText: '你坐上控制台椅，調出監視系統操作介面。只要比對各方規則矛盾並完成深度推理，就能重置監視系統，揭露被隱藏的404空間！',
            soundEffect: 'cctv',
            triggerMinigame: 'cctv_deduction'
          },
          {
            id: 'act_retreat_follow_rule',
            label: '【遵循規約撤退】無視怪異異象，依循規則乘電梯逃離大樓 (觸發 ED2)',
            resultText: '你嚴格遵守表面規約的警告：無視異常、不深入探究、迅速返回一樓逃離大樓……',
            soundEffect: 'tension',
            triggerEnding: 'ending2'
          }
        ]
      },
      {
        id: 'hotspot_guard_desk_drawer',
        name: '警衛辦公桌底層抽屜',
        iconName: 'Folder',
        category: 'clue',
        shortDesc: '上了小銅鎖的木製抽屜，鎖頭已經鬆脫。',
        inspectText: '拉開抽屜，裡面放著厚厚的一疊檔案夾，包含1998～2002年間工務局違建停工稽查公文、歷史產權封存卷宗與安控指引。桌角還散落著值班備用的感應磁扣。',
        actions: [
          {
            id: 'drawer_search_blueprints',
            label: '翻找並取出【1998～2002年大樓違章加蓋圖紙與歷史產權封存卷宗】',
            resultText: '★ 獲得【1998～2002年大樓違章加蓋圖紙與歷史產權封存卷宗】！公文記載：1998年建商私自夾層加蓋4樓，2002年遭工務局勒令停工拆除並封存產權。在2002至2012長達十年的空白期中，管理方在電梯與樓梯動線上將4樓遮蔽，並向住戶散佈「沒有四樓」的強烈暗示！',
            soundEffect: 'paper',
            sanDelta: 4,
            obtainItemId: 'building_blueprints'
          },
          {
            id: 'drawer_search_keycard',
            label: '搜尋辦公桌桌面與抽屜暗格拾取【中控室備用門禁感應磁扣】',
            resultText: '★ 獲得物證【中控室備用門禁感應磁扣】！在辦公桌桌面筆筒旁尋獲一枚黑色感應磁扣，表面沾有油污，背面刻著緊急門禁管理代碼。可用於刷開磁控公文密封夾與大樓門禁！',
            soundEffect: 'paper',
            sanDelta: 1,
            obtainItemId: 'guard_keycard'
          },
          {
            id: 'drawer_search_mint',
            label: '搜尋辦公桌抽屜角落與個人雜物盒',
            resultText: '★ 獲得物資【高能蘇打餅乾與零食點心】！在抽屜深處鐵盒內尋獲一整盒未拆封的蘇打餅乾與高能零食點心。可迅速補充熱量與體力，已收納入物證檔案袋。',
            soundEffect: 'paper',
            obtainItemId: 'mint_candy'
          },
          {
            id: 'drawer_search_cctv_manual',
            label: '翻出【監視系統操作指引】',
            resultText: '★ 獲得【監視系統操作指引】！第1條寫明：「所有樓層皆應顯示於監視器中，包含四樓。本系統不會出錯。」',
            soundEffect: 'paper',
            sanDelta: 2,
            obtainRuleId: 'rule_cctv'
          }
        ]
      },
      {
        id: 'hotspot_duty_logbook',
        name: '值班簽到簿與記事本',
        iconName: 'Book',
        category: 'clue',
        shortDesc: '翻開的值班日誌，最新的幾頁字跡異常狂亂。',
        inspectText: '前幾天的紀錄都很正常：「08:00 交班無異狀」。但從昨晚開始，簽名欄全被用紅筆反覆塗寫著密密麻麻的「404……404……它在打字……404」。',
        actions: [
          {
            id: 'logbook_flip_pages',
            label: '往前翻閱歷史交接紀錄',
            resultText: '泛黃的舊頁面上寫著：「2002年產權凍結封層……建商將四樓砌磚封堵……十年來對外宣稱無此樓層，但深夜偶爾仍能聽見打字機敲擊聲……」字跡散發著壓抑的不安。',
            soundEffect: 'paper',
            sanDelta: -2
          }
        ]
      },
      {
        id: 'hotspot_emergency_landline',
        name: '警衛室緊急座機電話',
        iconName: 'Phone',
        category: 'device',
        shortDesc: '黑色的旋轉撥號電話，聽筒正微微滑出座盤。',
        inspectText: '話筒表面冰冷。話機正中央貼著一張褪色的緊急聯絡電話表，但管委會電話號碼全部被用刀片挖空。',
        actions: [
          {
            id: 'landline_pickup',
            label: '拿起話筒湊近耳邊聆聽',
            resultText: '聽筒裡傳出急促的機械式忙音，隨後轉為一個冰冷的錄音廣播：「您撥的電話無法回應，請留在原地等候救援……」聲線平靜卻透著詭異的死寂。',
            soundEffect: 'phone',
            sanDelta: -6
          },
          {
            id: 'landline_dial_404',
            label: '嘗試撥打禁忌號碼「404」',
            resultText: '話機轉盤轉動發出喀噠喀噠聲。電話線突然爆出一陣電流雜音，耳邊掠過尖銳的耳鳴與尖嘯！',
            soundEffect: 'glitch',
            sanDelta: -10
          }
        ]
      },
      {
        id: 'hotspot_security_corner_rule',
        name: '警衛室角落（主機排風口散熱格柵）',
        iconName: 'Search',
        category: 'clue',
        shortDesc: '安控主機背後積著灰塵的角落，排風口散發著熱氣，地上有通往安全梯的急促鞋印。',
        inspectText: '安控主機持續發出低沉運轉聲。散熱排風口吹出灼熱的電子零件氣息。仔細端詳地面，灰塵上印著一行急促往安全梯方向延伸的泥水鞋印，似乎前人在此查閱後便倉促逃向了樓梯間。',
        actions: [
          {
            id: 'inspect_security_vent_traces',
            label: '勘驗地面泥水鞋印與安全梯動線',
            resultText: '泥水鞋印深陷在灰塵中，指向門外的安全梯通道。看來前人在此查閱主機後，便奔向了樓梯轉角死角。',
            soundEffect: 'paper',
            sanDelta: 1
          }
        ]
      }
    ]
  },

  loc_2f_corridor: {
    id: 'loc_2f_corridor',
    floor: '2F',
    name: '二樓走廊與住戶區',
    subtitle: '瀰漫著濃烈漂白水味的長廊，兩側整齊排列著201至205號房門',
    ambientDescription: '走廊兩側是201至205號房。走廊中央停著一輛清潔推車，清潔員李阿姨正低頭拖地，拖把在地上劃出一道道刺鼻的白沫。',
    imageTheme: 'corridor',
    hotspots: [
      {
        id: 'hotspot_cleaner_cart',
        name: '清潔推車與刺鼻消毒水（清潔員李阿姨）',
        iconName: 'Sparkles',
        category: 'dialogue',
        shortDesc: '裝滿清潔工具、抹布與漂白水桶的手推車。',
        inspectText: '李阿姨身穿泛黃圍裙，正用力刷洗地板。她身上的消毒水味幾乎要掩蓋某種腐朽的氣息。',
        actions: [
          {
            id: 'cleaner_talk_rules',
            label: '向李阿姨詢問大樓打掃與樓層規矩',
            resultText: '李阿姨壓低聲音：「這棟樓邪門得很！管委會發給住戶的規則口口聲聲說沒有四樓，但我們清潔公司的規則卻寫著包含四樓共五層！這份【清潔人員工作規則】借你看，我年紀大了只想混口飯吃，可別去四樓找麻煩……」',
            soundEffect: 'paper',
            sanDelta: 2,
            obtainRuleId: 'rule_cleaner'
          },
          {
            id: 'cleaner_ask_guard_uniform',
            label: '向李阿姨詢問警衛平日值班打扮與制服',
            resultText: '李阿姨壓低聲音輕哼了一聲：「樓下王大偉那些保全警衛？規則上說什麼白衣黑褲，實際上大樓省成本，他們平時值夜班根本都穿自己的便服私服！要是真看見什麼挺拔整齊得嚇人的白襯衫或大紅制服，那八成不是活人……」',
            soundEffect: 'paper'
          }
        ]
      },
      {
        id: 'hotspot_door_204',
        name: '204 號住戶大門（有住戶）',
        iconName: 'DoorClosed',
        category: 'dialogue',
        shortDesc: '普通的木質防盜門，門口擺著一雙整齊的男用拖鞋。',
        inspectText: '門牌「204」端正鋥亮。敲門後，門內傳來拖鞋走近的腳步聲。',
        actions: [
          {
            id: 'door_204_talk',
            label: '輕敲 204 號房門詢問住戶',
            resultText: '門開了一條縫，一位戴眼鏡的研究生抓了抓頭髮：「404？沒聽過啊。這棟樓的規矩確實怪裡怪氣的，什麼沒有四樓之類的……不過安祥路這邊房租只要周邊市價的一半，對我們這種窮學生來說太省了，奇怪規定不理它就好。」',
            soundEffect: 'knock'
          }
        ]
      },
      {
        id: 'hotspot_door_201',
        name: '201 號房門（上鎖）',
        iconName: 'Lock',
        category: 'flavor',
        shortDesc: '緊閉的深灰色鐵門。',
        inspectText: '門把手紋絲不動，門縫貼著郵局掛號催領單。',
        actions: [
          {
            id: 'door_201_knock',
            label: '轉動門把測試',
            resultText: '門鎖牢靠，屋內沒有半點動靜。',
            soundEffect: 'knock'
          }
        ]
      },
      {
        id: 'hotspot_door_202',
        name: '202 號房門（上鎖）',
        iconName: 'Lock',
        category: 'flavor',
        shortDesc: '木質大門，上面貼著福字春聯。',
        inspectText: '門縫無光線透出，敲門無任何回應。',
        actions: [
          {
            id: 'door_202_try',
            label: '輕扣房門',
            resultText: '屋內一片死寂，無人應門。',
            soundEffect: 'knock'
          }
        ]
      },
      {
        id: 'hotspot_door_203',
        name: '203 號住戶大門（有住戶）',
        iconName: 'DoorClosed',
        category: 'dialogue',
        shortDesc: '刷著紅漆的鐵門，門縫隱約透出電視聲。',
        inspectText: '門內電視正播著新聞，伴隨著細微的談話聲。',
        actions: [
          {
            id: 'door_203_talk',
            label: '叩門向住戶詢問',
            resultText: '門內傳來老人的抱怨聲：「大半夜敲什麼門！管委會那些規定奇奇怪怪的，不知道在搞什麼花樣。反正沒事少在大樓亂晃，大家各過各的，快走快走！」',
            soundEffect: 'knock'
          }
        ]
      },
      {
        id: 'hotspot_door_205',
        name: '205 號房門（上鎖）',
        iconName: 'Lock',
        category: 'flavor',
        shortDesc: '走廊底端的鐵門，門鎖生鏽。',
        inspectText: '門把上積著一層薄灰，似乎很久無人出入。',
        actions: [
          {
            id: 'door_205_test',
            label: '拉動把手',
            resultText: '房門緊鎖，紋絲不動。',
            soundEffect: 'knock'
          }
        ]
      }
    ]
  },

  loc_3f_corridor: {
    id: 'loc_3f_corridor',
    floor: '3F',
    name: '三樓走廊與機電區',
    subtitle: '燈光昏暗的長廊，兩側設有301至305號房門與樓層配電箱',
    ambientDescription: '三樓的空氣格外乾燥冰冷，天花板的一盞日光燈正以不規則的頻率忽明忽暗。走廊兩側整齊排列著301至305號房門，牆側嵌著總配電箱。',
    imageTheme: 'corridor',
    hotspots: [
      {
        id: 'hotspot_3f_overview',
        name: '調查三樓走廊環境',
        iconName: 'Search',
        category: 'flavor',
        shortDesc: '環顧三樓走廊照明、總配電箱、住戶大門與管線檢修區。',
        inspectText: '三樓為一般住戶日常居住空間，兩側整齊排列著乾淨正常的301至305號房門。走廊右側牆壁嵌著大樓總配電箱，轉角處設有通往中央管線的消防檢修鐵門。',
        actions: [
          {
            id: 'act_explore_3f_overview',
            label: '環視走廊各處設施與住戶動線',
            resultText: '你對三樓走廊環境完成初步勘查，已可對各住戶門扉、中央檢修鐵門與配電箱展開深入調查。',
            soundEffect: 'switch'
          }
        ]
      },
      {
        id: 'hotspot_door_304',
        name: '304 號木質住戶大門（正常上鎖）',
        iconName: 'DoorClosed',
        category: 'flavor',
        shortDesc: '乾淨端正的木質防盜門，門牌「304」字跡清晰如常。',
        inspectText: '門牌「304」擦拭得一塵不染，與其他住戶無異。門上掛著「請勿打擾」木牌，門鎖緊閉。貼耳細聽，屋內一片安靜，住戶外出中。',
        actions: [
          {
            id: 'door_304_knock',
            label: '輕扣 304 號木質住戶大門',
            resultText: '你輕敲房門，屋內無人應門。門牌金屬字樣「304」完好無損，與周遭住戶一樣維持著平凡的生活日常。',
            soundEffect: 'knock'
          }
        ]
      },
      {
        id: 'hotspot_door_301',
        name: '301 號住戶大門（有住戶）',
        iconName: 'DoorClosed',
        category: 'dialogue',
        shortDesc: '刷著深藍色油漆的鐵門，門邊掛著一個小風鈴。',
        inspectText: '敲門時風鈴發出微弱清脆的聲響，門內傳來拖鞋的窸窣走動聲。',
        actions: [
          {
            id: 'door_301_talk',
            label: '隔著門詢問住戶大樓規矩',
            resultText: '門內傳來中年婦女疑惑卻平和的嗓音：「大樓規範？剛搬來時確實滿頭霧水，什麼沒有四樓之類的……但住了幾年也習慣了，管委會怎麼寫就怎麼做，大家相安無事、平平安安過日子就好。」',
            soundEffect: 'knock'
          }
        ]
      },
      {
        id: 'hotspot_door_302',
        name: '302 號房門（上鎖）',
        iconName: 'Lock',
        category: 'flavor',
        shortDesc: '深色木門，門鎖上附帶電子指紋密碼鎖。',
        inspectText: '電子鎖面板處於熄滅待機狀態，門板緊閉，無人應答。',
        actions: [
          {
            id: 'door_302_try',
            label: '觸碰密碼面板',
            resultText: '面板短暫亮起藍光後發出「嗶嗶」拒絕聲，門鎖完好反鎖。',
            soundEffect: 'switch'
          }
        ]
      },
      {
        id: 'hotspot_door_303',
        name: '303 號房門（上鎖）',
        iconName: 'Lock',
        category: 'flavor',
        shortDesc: '厚實的棕色防火門，上方貼著防盜警報貼紙。',
        inspectText: '房門緊閉，門縫沒有一絲光線透出。',
        actions: [
          {
            id: 'door_303_test',
            label: '轉動門把測試',
            resultText: '門鎖卡緊，屋內死寂無聲。',
            soundEffect: 'knock'
          }
        ]
      },
      {
        id: 'hotspot_door_305',
        name: '305 號住戶大門（有住戶）',
        iconName: 'DoorClosed',
        category: 'dialogue',
        shortDesc: '門上貼著「招財進寶」紅紙的鐵製大門。',
        inspectText: '門口擺著幾盆茂盛的黃金葛，門內隱約有炒菜鍋鏟碰撞的聲音。',
        actions: [
          {
            id: 'door_305_talk',
            label: '叩門向住戶請教規則注意點',
            resultText: '門內一位年輕上班族開門看了一眼：「大樓規則？確實挺莫名其妙的。不過現在市區哪裡找得到一個月三千塊還包水電的套房？反正晚上不要去按電梯空白鍵、別多管閒事，便宜住著就挺好。」',
            soundEffect: 'knock'
          }
        ]
      },
      {
        id: 'hotspot_power_box',
        name: '樓層總配電箱',
        iconName: 'Zap',
        category: 'device',
        shortDesc: '灰色的金屬電箱，側邊有一把巨大的黑色總電閘手柄。',
        inspectText: '電箱表面傳來低沉的工頻嗡鳴與發熱感。標籤上寫著「3F/4F 照明回路共用」——但404不是不存在嗎？手把上隱隱傳來危險的刺痛感。',
        actions: [
          {
            id: 'power_pull_switch',
            label: '拉下配電箱總電閘',
            resultText: '啪！總閘拉下，整層走廊瞬間陷入死寂的漆黑！伴隨著滋滋電弧火花，黑暗中傳來一聲近在咫尺的吸氣聲……三秒後電閘自動跳回，燈光重新亮起！心臟劇烈搏動。',
            soundEffect: 'switch',
            sanDelta: -10
          }
        ]
      },
      {
        id: 'hotspot_3f_pipe_door',
        name: '中央管線與檢修通道鐵門',
        iconName: 'DoorClosed',
        category: 'clue',
        shortDesc: '重型厚實的消防檢修鐵門，下方隱約有管線震動聲。',
        inspectText: '三樓走廊盡頭的重型消防檢修鐵門。門縫傳來刺鼻機油味與規律金屬敲擊聲，通往四樓隱藏機房的核心管線由此經過。門下緣似乎有用白色粉筆標記的逃生箭頭。',
        actions: [
          {
            id: 'pipe_door_listen',
            label: '貼耳聆聽檢修鐵門後方的管線震鳴',
            resultText: '你將耳朵貼在冰冷的鐵門上。門後除了隆隆的水管水流聲，竟然還穿透出極其微弱但密集的機械打字機鍵盤聲！這證實了三樓頂部確實連通著某個巨大機械核心。',
            soundEffect: 'knock',
            sanDelta: 1
          }
        ]
      }
    ]
  },

  loc_5f_corridor: {
    id: 'loc_5f_corridor',
    floor: '5F',
    name: '五樓走廊',
    subtitle: '整潔明亮的五樓長廊，兩側排列著501至505號房門',
    ambientDescription: '走廊兩側整齊排列著501至505號房門。牆壁漆著乾淨的米白色油漆，日光燈柔和照亮地面。走廊中段就是掛著「504」門牌的深胡桃木大門。',
    imageTheme: 'corridor',
    hotspots: [
      {
        id: 'hotspot_door_504_inspect',
        name: '504 號房門牌與鎖孔 (現場外觀觀察)',
        iconName: 'DoorClosed',
        category: 'clue',
        shortDesc: '深胡桃木大門，門牌端正標註著「504」，門縫隱約飄出芳香劑氣息。',
        inspectText: '房門緊閉，門牌標註著504。門鎖插孔有近期頻繁使用的金屬磨痕，門縫飄散著淡淡的茉莉芳香劑。如欲進入搜查，可點擊左側面板的【用鑰匙解鎖進入 504 號房】。',
        actions: [
          {
            id: 'door_504_look_lock',
            label: '仔細檢查504號房門外觀與鎖孔狀態',
            resultText: '門鎖插孔光亮無鏽跡，門縫飄出室內乾燥空氣與芳香劑氣息，鐵證屋內近期絕對有人居住與使用！',
            soundEffect: 'paper',
            sanDelta: 1
          }
        ]
      },
      {
        id: 'hotspot_door_501',
        name: '501 號住戶大門（有住戶）',
        iconName: 'DoorClosed',
        category: 'dialogue',
        shortDesc: '掛著裝飾福牌的防盜門。',
        inspectText: '門牌整潔，門後隱約傳來收音機廣播聲。',
        actions: [
          {
            id: 'door_501_knock',
            label: '輕敲房門向老住戶請教管委會發放的「生活備忘條例」',
            resultText: '門內的收音機音量調小，傳來老住戶納悶的聲音：「條例？你說管委會發的那張生活注意事項啊？是寫得神神秘秘的，但平時只要老老實實搭電梯、別隨便動配電箱，根本沒啥大事。大家都當成老舊大樓的怪癖罷了。」',
            soundEffect: 'knock'
          }
        ]
      },
      {
        id: 'hotspot_door_502',
        name: '502 號房門（上鎖）',
        iconName: 'Lock',
        category: 'flavor',
        shortDesc: '厚實的白鐵門，門鎖上附著鏈條。',
        inspectText: '門把卡死，門縫貼著膠帶封死。敲門無任何回應。',
        actions: [
          {
            id: 'door_502_try',
            label: '轉動門把測試',
            resultText: '鎖扣牢固，屋內靜悄悄的，沒有任何聲響。',
            soundEffect: 'knock'
          }
        ]
      },
      {
        id: 'hotspot_door_503',
        name: '503 號住戶大門（有住戶）',
        iconName: 'DoorClosed',
        category: 'dialogue',
        shortDesc: '門前掛著一串風鈴的木質大門。',
        inspectText: '門縫隱約透出電視螢幕光暈與人聲。',
        actions: [
          {
            id: 'door_503_talk',
            label: '輕叩房門詢問鄰里情況與住戶生活公約',
            resultText: '門內傳來一個年輕男生的聲音：「隔壁504？之前好像退租了吧，具體我也不太清楚。大樓管委會的生活規定雖然有點古怪，不過平時大家作息都正常，沒什麼好擔心的。」',
            soundEffect: 'knock'
          }
        ]
      },
      {
        id: 'hotspot_door_505',
        name: '505 號房門（上鎖）',
        iconName: 'Lock',
        category: 'flavor',
        shortDesc: '五樓盡頭的鐵門，門鎖緊閉。',
        inspectText: '門牌微微褪色，門把手上積著薄薄一層灰塵。',
        actions: [
          {
            id: 'door_505_test',
            label: '拉動把手檢查',
            resultText: '把手紋絲不動，房門反鎖得嚴嚴實實。',
            soundEffect: 'knock'
          }
        ]
      }
    ]
  },

  loc_504_interior: {
    id: 'loc_504_interior',
    floor: '5F',
    name: '504 號房內部',
    subtitle: '被警衛宣稱為「搬空一年」的空屋，室內卻保留著數天前張浩的生活痕跡',
    ambientDescription: '推開504號房門，屋內飄著一股淡淡的積塵與乾燥茉莉芳香劑氣味。客廳茶几端正擺放著一份大樓的《住戶規則》，旁邊杯中的咖啡早已乾涸結斑；書桌上擺著未闔上的記事簿。',
    imageTheme: 'room504',
    isSafeZone: true,
    hotspots: [
      {
        id: 'hotspot_living_rules',
        name: '504 客廳茶几上的【住戶規則】',
        iconName: 'FileText',
        category: 'rule',
        shortDesc: '茶几正中央端正擺放著一份大樓管委會的白色規約，旁邊放著馬克杯與煙灰缸。',
        inspectText: '紙張邊角平整，蓋著鮮紅的「安祥大樓管理委員會」公章。這是一份大樓管委會對所有住戶公開發放的正式生活規約。',
        actions: [
          {
            id: 'rules_read_obtain',
            label: '翻閱並收錄【住戶規則】至手冊',
            resultText: '★ 獲得【住戶規則（504號房取得）】！這是一份大樓管委會對所有住戶公開發放的正式規約。條文清晰載明：「本大樓共四層樓，編號1至5樓，沒有4樓。若身處4樓，請利用電梯回到1樓。警衛制服為白衣黑褲，若遇到非白衣黑褲之警衛請勿理會。」',
            soundEffect: 'paper',
            sanDelta: 2,
            obtainRuleId: 'rule_resident'
          },
          {
            id: 'coffee_inspect',
            label: '檢查茶几上的咖啡杯與煙灰缸',
            resultText: '馬克杯裡的黑咖啡早已乾涸結塊，杯底凝固著暗褐色的硬斑；煙灰缸裡的菸蒂早已熄滅冷透，菸灰乾白沉積。依據殘漬乾涸硬化與室溫揮發程度推算，張浩離開這間房間大約是四至五天前，與委託人陳先生報案的失蹤時間序完全吻合！',
            soundEffect: 'paper'
          },
          {
            id: 'living_search_cigarettes',
            label: '翻找茶几底層雜誌架與收納抽屜',
            resultText: '★ 獲得物資【老牌濾嘴香菸】！在茶几底層雜誌收納架夾縫中找到了一包未拆封的經典軟包濾嘴香菸與紙火柴。已收納入物證檔案袋。',
            soundEffect: 'paper',
            obtainItemId: 'vintage_cigarettes'
          }
        ]
      },
      {
        id: 'hotspot_shredded_letter_trash',
        name: '504 臥室垃圾桶內的碎紙片',
        iconName: 'FileQuestion',
        category: 'clue',
        shortDesc: '黑色塑料垃圾桶裡，堆著被剪刀剪碎的信封與信紙。',
        inspectText: '碎紙片散落一地，隱約可看見鋼筆寫的字跡。拼湊它們或許能揭開寄信人與這棟大樓的秘密。',
        actions: [
          {
            id: 'puzzle_start',
            label: '收集紙片並在桌面上【拼湊信件】',
            resultText: '你將所有碎紙片攤在桌上，展開信件拼圖……',
            soundEffect: 'paper',
            triggerMinigame: 'letter_puzzle'
          }
        ]
      },
      {
        id: 'hotspot_504_bookshelf',
        name: '504 臥室實木大書櫃與建築圖紙',
        iconName: 'BookOpen',
        category: 'clue',
        shortDesc: '頂天立地的厚重實木大書櫃，擺滿了室內設計手稿與安祥路88號的草圖。',
        inspectText: '書櫃上整齊陳列著建築透視圖、結構力學手冊與草稿本。仔細翻閱，張浩在草圖上反覆用紅筆標記著大樓牆壁的厚度與隔音層，並寫著：「牆壁內部有異樣的空心結構……」然而書櫃與房間角落並無藏人跡象，張浩顯然不在這間屋子裡。',
        actions: [
          {
            id: 'bookshelf_search_sketches',
            label: '細查書櫃上的建築草圖與牆體筆記',
            resultText: '【發現關鍵紀錄】：張浩在手稿邊緣寫道：「504與隔壁502之間的隔間牆有空腔，深夜總能聽見細碎摩擦聲……」證實牆體結構異常，但張浩本人並未藏身於此，需前往其他處所尋找！',
            soundEffect: 'paper',
            sanDelta: 1
          }
        ]
      },
      {
        id: 'hotspot_504_desk',
        name: '504 臥室書桌與生活痕跡',
        iconName: 'BookOpen',
        category: 'clue',
        shortDesc: '書桌上整齊擺放著租賃合約收據與張浩的租屋筆記，暗格中藏有水電存根。',
        inspectText: '書桌抽屜微開，裡面放著房東簽收租金的收據，以及張浩手寫的房內備忘錄：「這間504房的格局與隔音很奇怪……有時半夜會聽見樓下傳來打字機聲音……」暗格夾層中還塞著泛黃的存根。',
        actions: [
          {
            id: 'desk_read_notes',
            label: '翻閱書桌暗格抽屜並拾取【泛黃的住戶水電租約存根】',
            resultText: '★ 獲得物證【泛黃的住戶水電租約存根】！在書桌暗格抽屜深處翻出一張泛黃的水電繳費存根與租約，上面蓋著物業公章，且電表編號直通大樓404專用配電箱。',
            soundEffect: 'paper',
            sanDelta: 2,
            obtainItemId: 'tenant_diary_fragment'
          }
        ]
      },
      {
        id: 'hotspot_shoe_rack',
        name: '504 玄關鞋櫃與泥腳印',
        iconName: 'Footprints',
        category: 'flavor',
        shortDesc: '門口的三層木鞋櫃，上面擺著幾雙男用皮鞋。',
        inspectText: '鞋櫃裡擺著三雙尺碼相同的男用皮鞋。每雙鞋底都沾滿了潮濕、帶著微腥鐵鏽味的紅色泥土。',
        actions: [
          {
            id: 'shoes_check_soil',
            label: '捻起鞋底的紅色泥土聞嗅',
            resultText: '泥土帶著濃烈的水泥粉塵與鐵鏽味，這絕不是室外花園的泥土，而是建築工地封牆用的紅磚泥！',
            soundEffect: 'paper',
            sanDelta: -2
          }
        ]
      },
      {
        id: 'hotspot_kitchen_fridge',
        name: '504 廚房流理台與冰箱',
        iconName: 'Refrigerator',
        category: 'flavor',
        shortDesc: '小廚房維持著運作，雙門冰箱正低低嗡鳴。',
        inspectText: '瓦斯爐邊放著煮水壺，壺內積著冷水與乾白水垢。冰箱外門貼著一張便條紙：「不要開門」。',
        actions: [
          {
            id: 'fridge_open_freezer',
            label: '拉開冰箱冷凍庫抽屜',
            resultText: '冷凍庫裡滿是厚厚的白霜，中央凍著一塊用保鮮膜緊緊包裹的暗紅色不明肉塊，底下壓著一張標籤：「404備用……」寒意直竄頭頂。',
            soundEffect: 'tension',
            sanDelta: -8
          },
          {
            id: 'fridge_open_cooler',
            label: '拉開冷藏室檢查',
            resultText: '冷藏室放著一盒未喝完的鮮奶，有效日期為四天前，奶水已呈酸敗凝固狀。這證實房間絕非警衛口中「搬空一年」的空屋，張浩在大約四、五天前仍在此生活，隨後便離奇斷絕了蹤影！',
            soundEffect: 'switch'
          }
        ]
      }
    ]
  },

  loc_502_interior: {
    id: 'loc_502_interior',
    floor: '5F',
    name: '502 號房內部 (原本鎖定的房間)',
    subtitle: '經警衛開鎖進入的套房，相鄰504的隔間牆正傳出異常的西西酥酥抓撓聲',
    ambientDescription: '這間原本鎖定的502號房內空氣冰冷窒悶，地板積著一層薄灰。房間靠近504號房的一側隔間牆壁上，壁紙有些微撕裂剝落，寂靜的室內正不斷傳出令人毛骨悚然的「西西酥酥……西西酥酥……」微弱指甲刮撓聲！',
    imageTheme: 'room504',
    hotspots: [
      {
        id: 'hotspot_502_wall_fissure',
        name: '502 隔間牆壁與壁紙縫隙 (西西酥酥怪聲源頭)',
        iconName: 'Search',
        category: 'clue',
        shortDesc: '靠近504方向的隔間牆壁，壁紙邊緣有微小撕裂，正不斷傳出抓撓怪聲。',
        inspectText: '貼近牆壁細聽，那陣「西西酥酥……西西酥酥……」的微弱聲音正是從這面隔間牆體內部傳出來的！仔細觀察剝落的壁紙邊緣，石膏板接縫處赫然有一道約數公厘寬的【細長裂痕】！',
        actions: [
          {
            id: 'act_observe_wall_fissure',
            label: '【仔細觀察牆壁裂痕】貼近壁紙裂縫並開強光手電筒詳查',
            resultText: '【發現牆壁裂痕與急促微弱喘息】：你打開強光手電筒近距離照射，壁紙下方赫然有一道深長裂痕！裂縫深處除了「西西酥酥」宛如老鼠抓撓的聲音外，更傳來了斷斷續續、極其虛弱的人類抽吸喘息聲！這絕對不是老鼠，裡面有人！',
            soundEffect: 'knock',
            sanDelta: 2
          }
        ]
      },
      {
        id: 'hotspot_502_crack_explore',
        name: '牆壁裂痕內部 (往內探索視線死角)',
        iconName: 'Eye',
        category: 'clue',
        shortDesc: '牆壁裂痕後方的中空暗縫，光線照射隱約可見內部的暗影。',
        inspectText: '將眼睛湊近裂痕，利用手電筒強光向牆壁內部中空夾層探索探照……',
        actions: [
          {
            id: 'act_explore_inside_crack',
            label: '【往裂痕內部探索】用強光手電筒向裂隙深處探照',
            resultText: '【往內探索赫然發現有人！】：手電筒光束穿透狹窄的石膏裂縫，照亮了牆壁內部的漆黑夾層——光束下赫然映出一雙滿是血絲、因恐懼與絕望而淌著眼淚的人類眼睛！以及一張極度乾癟蒼白的青年臉孔！受困者正用已磨爛滲血的十指，微弱地抓撓著石膏板內壁求救（西西酥酥的聲音正是由此而來）！那人正是失蹤多日的【張浩】！',
            soundEffect: 'tension',
            sanDelta: 5
          }
        ]
      },
      {
        id: 'hotspot_502_break_wall_rescue',
        name: '石膏隔板與破牆救援行動',
        iconName: 'Award',
        category: 'clue',
        shortDesc: '脆弱的中空石膏隔板，可用走廊破拆工具強行破開牆壁施救。',
        inspectText: '人命關天！張浩被封閉在中空牆壁內部，已經嚴重脫水瀕臨休克。旁邊有從走廊拿來的消防破拆斧與鐵撬，必須立刻砸破牆壁救人！',
        actions: [
          {
            id: 'act_break_wall_save_zhanghao',
            label: '【打破牆壁救出張浩】全力砸開石膏隔牆，實施緊急救援！',
            resultText: '【破牆救出張浩・第1輪正式結束】：你掄起消防斧，對準裂痕與石膏隔板狠狠砸下！「砰！轟隆！」石膏板轟然崩塌破開！塵土飛揚中，你伸手探入夾層，將虛弱無比、嚴重脫水的張浩拉了出來！張浩倒在你的懷裡，嘴唇乾裂，血肉模糊的雙手顫抖著，微弱呢喃：「救……救出來了……」你迅速撥打 119 與 110，救護車警笛長鳴而至將張浩送醫搶救！安祥路88號失蹤案成功破案！',
            soundEffect: 'knock',
            triggerEnding: 'ending0'
          }
        ]
      }
    ]
  },

  loc_elevator: {
    id: 'loc_elevator',
    floor: '車廂內',
    name: '客用電梯內部車廂',
    subtitle: '金屬不銹鋼四壁，燈光發綠，樓層按鍵在指尖下泛著微光',
    ambientDescription: '封閉的電梯廂內充斥著滑輪纜繩的摩擦低鳴。右側是垂直排列的樓層按鍵盤，地毯邊緣微微翹起，正對面是一整面不銹鋼鏡面壁。',
    imageTheme: 'elevator',
    hotspots: [
      {
        id: 'hotspot_elevator_inspect_box',
        name: '電梯結構與運行狀態',
        iconName: 'Search',
        category: 'clue',
        shortDesc: '仔細檢查電梯車廂四壁、頂部排風孔與樓層高度運行秒數。',
        inspectText: '金屬車廂內部緊湊，按鍵與指示燈運作正常。但仔細測量電梯在3樓與5樓之間的爬升秒數，所花費的時間整整是1樓到2樓的兩倍，證實中間必定夾著一層物理實體！',
        actions: [
          {
            id: 'action_inspect_elevator',
            label: '檢查電梯',
            resultText: '【檢查電梯】：你仔細檢查電梯車廂接縫、頂部檢修口與鋼纜運行震動。在3樓升往5樓的過程中，電梯車廂在經過中段時傳來輕微的金屬共振與樓層感應磁簧聲，且上升時間多出了整整一層樓的長度。這鐵證如山地證明：3樓與5樓之間絕對存在著第四層樓實體空間！',
            soundEffect: 'switch',
            sanDelta: 1
          }
        ]
      },
      {
        id: 'hotspot_elevator_keypad',
        name: '電梯樓層按鍵盤 (1, 2, 3, 5, 空白)',
        iconName: 'Keypad',
        category: 'device',
        shortDesc: '垂直排列的圓形按鈕：1、2、3、5，以及一顆微凸的無字空白鍵。',
        inspectText: '依照住戶規則：「電梯內出現空白按鈕時，電梯仍可正常使用，但請勿按下空白按鈕。」',
        actions: [
          {
            id: 'elevator_press_1',
            label: '按下【1】樓按鈕',
            resultText: '電梯發出清脆的提示音，平穩降至一樓大廳。',
            soundEffect: 'chime'
          },
          {
            id: 'elevator_press_2',
            label: '按下【2】樓按鈕',
            resultText: '電梯門緩緩開啟，外頭飄來濃烈的漂白水味，抵達二樓走廊。',
            soundEffect: 'chime'
          },
          {
            id: 'elevator_press_3',
            label: '按下【3】樓按鈕',
            resultText: '電梯抵達三樓，門外的日光燈正忽明忽暗地閃爍著。',
            soundEffect: 'chime'
          },
          {
            id: 'elevator_press_5',
            label: '按下【5】樓按鈕',
            resultText: '電梯直升五樓，門外就是通往 504 號房的走廊。',
            soundEffect: 'chime'
          },
          {
            id: 'elevator_press_blank',
            label: '按下微凸的【空白按鈕】（違規探尋）',
            resultText: '按下的瞬間，電梯發出刺耳的金屬摩擦尖叫！頂燈瞬間轉為猩紅，指示燈顯示【4F】！一隻身穿紅衣的怪異手臂猛然卡在門縫中！',
            soundEffect: 'glitch',
            sanDelta: -15,
            triggerMinigame: 'chase'
          }
        ]
      },
      {
        id: 'hotspot_elevator_carpet',
        name: '電梯地毯邊角夾層',
        iconName: 'Bookmark',
        category: 'rule',
        shortDesc: '鋪在電梯地板上的灰色地毯，左下角落有被掀開過的痕跡。',
        inspectText: '地毯角落露出了一張藍色塑膠防水紙，上面印著清潔公司的印章。',
        actions: [
          {
            id: 'carpet_pick_cleaner_rule',
            label: '翻開地毯拾取【清潔人員工作規則】',
            resultText: '★ 獲得【清潔人員工作規則】！規則寫明：「本大樓包含四樓在內共五層樓……404號房不接受任何形式打擾……非必要請優先使用樓梯移動。」這與住戶規則徹底衝突！',
            soundEffect: 'paper',
            obtainRuleId: 'rule_cleaner'
          }
        ]
      },
      {
        id: 'hotspot_elevator_intercom',
        name: '緊急呼叫對講機按鈕',
        iconName: 'Radio',
        category: 'device',
        shortDesc: '按鍵盤下方的黃色警鈴與通話孔。',
        inspectText: '通話孔內有一塊發霉的防塵海綿。上面寫著「直接通往警衛室中控」。',
        actions: [
          {
            id: 'intercom_call',
            label: '長按緊急呼叫通話鈕',
            resultText: '揚聲器傳出刺耳的沙沙電台雜音，雜音深處傳來一個空洞微弱的呢喃：「……不要相信白色的警衛……不要相信……」',
            soundEffect: 'phone',
            sanDelta: -2
          }
        ]
      },
      {
        id: 'hotspot_elevator_mirror_wall',
        name: '電梯內不銹鋼鏡面牆',
        iconName: 'Layers',
        category: 'flavor',
        shortDesc: '拋光的不銹鋼車廂背板，能照出乘客的倒影。',
        inspectText: '金屬倒影有些許變形。在昏暗的電梯綠光下，鏡面反射出你孤零零的身影。',
        actions: [
          {
            id: 'elevator_mirror_look',
            label: '仔細觀察倒影中的自己身後',
            resultText: '倒影中，你的左肩後方赫然多出了一道淡淡的紅色影子！但當你猛然回頭時，身後空無一物，只有冰冷的金屬面板。',
            soundEffect: 'tension',
            sanDelta: -3
          }
        ]
      },
      {
        id: 'hotspot_elevator_maintenance_box',
        name: '電梯控制面板下方檢修暗盒',
        iconName: 'Settings',
        category: 'clue',
        shortDesc: '電梯按鍵面板下方一處用螺絲固定但有些微撬開痕跡的金屬蓋板。',
        inspectText: '蓋板邊緣有些微撬動痕跡，隱約可見內部的PLC控制主機板與一本被塞在裡面的工程記錄冊。',
        actions: [
          {
            id: 'pick_elevator_manual',
            label: '撬開檢修蓋板取出【電梯緊急保修操作日誌】',
            resultText: '★ 獲得物證【電梯緊急保修操作日誌】！在暗板夾層中發現一本工程手記，記錄著電梯主機板被刻意跳線繞過4樓的改裝圖解。',
            soundEffect: 'switch',
            sanDelta: 3,
            obtainItemId: 'elevator_service_manual'
          }
        ]
      }
    ]
  },

  loc_stairwell: {
    id: 'loc_stairwell',
    floor: '樓梯間',
    name: '大樓U字形兩段式樓梯間',
    subtitle: '標準水泥雙跑折返式樓梯，每半層有一處緩衝轉角平台',
    ambientDescription: '大樓的樓梯為傳統水泥砌成的U字形兩段式結構，每爬半層便是一處寬闊的轉角平台。梯級邊緣嵌著微凸的防滑金屬條，兩側是冰冷泛黃的水泥扶手，每一步踩在階梯上都會引發長達數秒的空洞迴音。',
    imageTheme: 'stairs',
    hotspots: [
      {
        id: 'hotspot_stair_inspect_steps',
        name: 'U字形折返樓梯結構與階梯計數',
        iconName: 'Search',
        category: 'clue',
        shortDesc: '仔細勘查雙跑兩段式水泥階梯的級數與折返轉角高度。',
        inspectText: '標準樓層間距為15個水泥階梯與一處U字形折返平台。然而從3樓爬至標示為5樓的樓梯間，整整爬了24個階梯！',
        actions: [
          {
            id: 'action_inspect_stairs',
            label: '檢查樓梯與計數階數',
            resultText: '【檢查樓梯】：你用腳步逐級丈量階梯數。從1樓到2樓共15階，2樓到3樓共15階；然而從3樓往上走到標示為5樓的梯廳，整整經過了折返轉角與24個階梯！這數字既不是標準單層的15階，也不是兩層的30階，空間物理結構存在顯著異常！',
            soundEffect: 'knock',
            sanDelta: 1
          },
          {
            id: 'action_measure_step_height',
            label: '蹲下仔細勘驗每一級階梯的梯級高度與接縫',
            resultText: '★【重大物理發現・階梯落差的數學詭計】：\n你蹲在折返階梯上，用手指與目測精確比對每一級階梯的踏面與垂直高度。\n\n驚人的客觀事實浮出水面：\n• 下面樓層（1F至2F、2F至3F）的每一階高度是標準的 18公分（15階 × 18cm = 270公分，正好是一整層樓高）。\n• 然而這段通往五樓的 24個階梯，每一階的垂直高度竟然只有 14～15公分！踩起來微幅矮縮，若不刻意丈量，人體肌肉記憶只會誤以為這是一段稍長的普通梯段！\n\n【真相解析】：\n24階 × 15cm = 360公分！建商在三樓與五樓之間，硬生生透過「偷工壓縮梯級高度」與「加蓋夾層」的手法，將兩層樓擠壓在有限高度內！這裡物理上原本絕對存在著四樓，只是空間被強行折疊與壓縮，動線被刻意遮蔽讓人不知不覺忽略它！',
            soundEffect: 'knock',
            sanDelta: 3
          }
        ]
      },
      {
        id: 'hotspot_stair_4f_corner',
        name: '通往四樓折返轉角的陰暗死角',
        iconName: 'FileText',
        category: 'rule',
        shortDesc: '3樓往上階梯轉角平台背光盲區，水泥牆腳與踢腳板深陷在死寂的陰影中。',
        inspectText: '折返階梯的背光處一片漆黑，陰暗的踢腳板與水泥夾縫被厚重的陰影吞沒，肉眼完全無法看清裡面藏匿的物品。【需開啟戰術手電筒方能照射看清暗角】',
        actions: [
          {
            id: 'stair_corner_search_dark',
            label: '在黑暗中摸索樓梯暗角（光線不足無法辨識）',
            resultText: '踢腳板夾縫中滿是水泥碎屑與冰冷黏膩的灰塵。光線太過昏暗，肉眼無法看清深處。請開啟頂部工具列的【戰術手電筒】，以聚光光束照射暗角！',
            soundEffect: 'paper'
          }
        ]
      },
      {
        id: 'hotspot_stair_number_sign',
        name: 'U字形樓梯轉角平台牆面樓層數字',
        iconName: 'Hash',
        category: 'clue',
        shortDesc: '油漆刷在轉角水泥牆上的巨大數字標示。',
        inspectText: '從1樓往上走，轉角平台牆上依序是綠色的「1F」、「2F」、「3F」。但在3樓上方的下一個U字形折返轉角，綠色的「5F」底下竟然隱隱透出被覆蓋的鮮紅色「4F」！',
        actions: [
          {
            id: 'stair_scratch_paint',
            label: '用鑰匙刮開 5F 底下的油漆',
            resultText: '刮開綠色油漆，底下露出了用血紅色油漆寫著的粗大「4F」，並寫有一行小字：「它一直在這裡」。視野泛起一陣雪花。',
            soundEffect: 'knock',
            sanDelta: -6
          }
        ]
      },
      {
        id: 'hotspot_stair_window',
        name: '樓梯轉角通風小百葉窗',
        iconName: 'Wind',
        category: 'flavor',
        shortDesc: '鐵製的窄百葉窗，窗櫺卡著厚厚的陳年油垢。',
        inspectText: '透過百葉窗縫隙往外望，外面的世界彷彿被按下了靜音鍵，暴雨傾盆卻聽不見半點雨聲。',
        actions: [
          {
            id: 'stair_open_louver',
            label: '推開百葉窗通風',
            resultText: '推開窗戶，外面吹進來的不是雨水，而是一股帶著焚燒紙張與舊打字機色帶氣味的乾燥熱風。',
            soundEffect: 'tension',
            sanDelta: -2
          }
        ]
      },
      {
        id: 'hotspot_stair_echo',
        name: 'U字形梯段深處的異常迴音',
        iconName: 'Volume2',
        category: 'flavor',
        shortDesc: '往上與往下折返延伸的階梯深處。',
        inspectText: '雙跑兩段式樓梯的聲學結構異常，每當你在轉角平台停下腳步，身後總會慢半拍響起另一聲沉重的皮鞋腳步聲。',
        actions: [
          {
            id: 'stair_walk_up_down',
            label: '在兩段式梯階間連續上下走動測試',
            resultText: '腳步聲越來越近！你猛然抬頭，看見上方折返轉角平台站著一個身穿紅色外套的無臉人影正在俯視著你！你慌忙退回安全區域，胸膛劇烈起伏！',
            soundEffect: 'glitch',
            sanDelta: -12
          }
        ]
      }
    ]
  },

  loc_4f_hidden: {
    id: 'loc_4f_hidden',
    floor: '4F',
    name: '被抹去的隱藏走廊與 404 號房門口',
    subtitle: '被集體潛意識遮蔽三十年的真實空間，打字機的轟鳴震耳欲聾',
    ambientDescription: '走廊兩側是裸露的水泥牆，天花板不斷滴落冰冷的水滴。盡頭那扇掛著「404」金屬牌的厚重鐵門正半掩著，數十台打字機瘋狂敲擊的聲音穿透門縫！',
    imageTheme: 'corridor4f',
    hotspots: [
      {
        id: 'hotspot_404_door',
        name: '404 號房大門與門縫紙條',
        iconName: 'DoorOpen',
        category: 'clue',
        shortDesc: '半掩著的厚重鐵門，門縫中噴湧出無數寫滿規則的白色紙條。',
        inspectText: '門內的打字機聲如同心跳般轟鳴。門縫不斷吐出白色紙卷，而委託人的失蹤朋友張浩就被困在房間正中央的打字機陣列中！',
        actions: [
          {
            id: 'inspect_door_crack_paper',
            label: '細看門縫中不斷湧出的詭異紙條',
            resultText: '你蹲下身檢視從門縫湧出的白色紙卷。紙條上密密麻麻印著無數條文碎片與同化宣告，但油墨狂亂疊印、雜音蜂鳴，彷彿是怪異正在向整棟大樓強行灌輸的同化工作手冊，常人的神智根本無法直視這股扭曲的意志。真正的源頭正在門內的打字機中！',
            soundEffect: 'paper',
            sanDelta: -1
          },
          {
            id: 'enter_404_boss',
            label: '推開404號房大門，踏入被紙條淹沒的房間深處（進入終局對決）',
            resultText: '你握緊了搜集齊全的證據，深吸一口氣，猛力推開了 404 號房的大門！',
            soundEffect: 'tension',
            triggerMinigame: 'boss'
          }
        ]
      },
      {
        id: 'hotspot_tape_recorder',
        name: '門口舊報紙堆中的【看似普通的原子筆】',
        iconName: 'Mic',
        category: 'clue',
        shortDesc: '掉在門邊水窪旁的一支黑色金屬原子筆。',
        inspectText: '掉落在404門外的一支黑色按壓式原子筆。看似普通，但金屬配重異常沉重，筆夾處隱約有微型按鍵與指示燈接縫。可收納至檔案袋中進行【深入調查】。',
        actions: [
          {
            id: 'pick_ordinary_pen',
            label: '拾取【看似普通的原子筆】',
            resultText: '★ 獲得【看似普通的原子筆】！這支筆被遺落在404號房門前的報紙堆旁，手感異常沉重。請在隨身物證檔案袋中對其進行【深入調查】以揭開真相。',
            soundEffect: 'paper',
            sanDelta: 1,
            obtainItemId: 'tape_recorder'
          }
        ]
      },
      {
        id: 'hotspot_fake_rule_poster',
        name: '樓梯口立置的【大樓緊急避難指引】',
        iconName: 'FileWarning',
        category: 'rule',
        shortDesc: '紙質潔白乾淨、字體端正溫和、蓋有紅色管委會正式印戳的官方告示牌。',
        inspectText: '告示牌外觀異常整潔，以極具安撫感的語氣宣稱「大樓已全面恢復四樓、專案人員穿紅衣」。這份指引刻意偽裝成最正規官方的形式以誘捕訪客。在未研讀警衛室《監視系統操作指引》掌握第四頻道辨識標準前，盲目聽信恐招致嚴重認知污染。',
        actions: [
          {
            id: 'tear_fake_rule',
            label: '審視告示牌內容（需先取得並研讀警衛室《監視系統操作指引》）',
            resultText: '告示牌紙質潔白端正，蓋著鮮紅的管委會印章。然而在未研讀警衛室《監視系統操作指引》掌握第四頻道辨識標準前，你無法確定這份過於溫和的官方條文背後的誘餌陷阱。請先前往警衛室中控台獲取並研讀《監視系統操作指引》。',
            soundEffect: 'tension'
          }
        ]
      },
      {
        id: 'hotspot_corridor_puddle',
        name: '天花板滴落的暗紅水窪',
        iconName: 'Droplets',
        category: 'flavor',
        shortDesc: '走廊中央匯聚的一灘水漬，倒映著天花板搖晃的裸燈泡。',
        inspectText: '水滴以每秒兩滴的頻率敲打水面，發出空洞清脆的迴響。水窪邊緣漂浮著微小的白紙灰燼。',
        actions: [
          {
            id: 'puddle_touch',
            label: '蹲下檢查水窪中的灰燼（水滴回音震盪，隱約感到心悸）',
            resultText: '灰燼上殘留著未燒盡的打字機英文字母：「R-U-L-E-S……S-A-V-E……」。水滴落下的迴音在腦海震盪。',
            soundEffect: 'water',
            sanDelta: -1
          }
        ]
      },
      {
        id: 'hotspot_4f_fire_hydrant',
        name: '四樓生鏽的消防栓水帶箱夾層',
        iconName: 'Disc',
        category: 'clue',
        shortDesc: '嵌在水泥牆內的紅色鐵箱，水帶早已腐爛，夾層中塞著金屬物件。',
        inspectText: '消防水箱的玻璃早已破碎，水帶夾層深處塞著一個用防水油紙包裹的金屬圓筒。',
        actions: [
          {
            id: 'pick_old_camera_film',
            label: '伸手取出油紙包裹的【未沖洗的柯達黑白底片筒】',
            resultText: '★ 獲得物證【未沖洗的柯達黑白底片筒】！在消防箱夾層中發現一卷1998年的黑白底片，可在隨身物證檔案袋中以強光逆向透光檢驗。（獲得關鍵物證，理智更添底氣）',
            soundEffect: 'paper',
            sanDelta: 2,
            obtainItemId: 'old_camera_film'
          }
        ]
      }
    ]
  }
};

export const STAIR_CORNER_HOTSPOTS_1F: HotspotItem[] = [
  {
    id: 'hotspot_stair_steps_1f',
    name: '一樓至二樓水泥階梯（計數15階）',
    iconName: 'Search',
    category: 'clue',
    shortDesc: '丈量從一樓大廳通往二樓走廊的階梯級數。',
    inspectText: '從一樓大廳到半層折返平台共8階，再由轉角走至二樓走廊共7階，整段階梯共計 15階。每階高度標準規整。',
    actions: [
      {
        id: 'action_count_stairs_1f',
        label: '丈量階梯級數與規格',
        resultText: '【階梯丈量】：從一樓至二樓共整整 15個水泥階梯，中間設有一處折返平台。每一階垂直高度約18公分（15階 × 18cm = 270公分），踏面規整平滑，為標準集合住宅規格。',
        soundEffect: 'knock',
        sanDelta: 1
      }
    ]
  },
  {
    id: 'hotspot_stair_1f_corner_details',
    name: '轉角踢腳板金屬煙筒與散落便籤',
    iconName: 'FileText',
    category: 'clue',
    shortDesc: '鏽蝕的鐵製煙灰筒，牆腳夾縫落著一張泛黃便籤。',
    inspectText: '鐵製煙灰筒裡塞著幾根熄滅的白長壽菸蒂。踢腳板水泥夾縫中夾著一張踩皺的便籤紙。',
    actions: [
      {
        id: 'action_inspect_1f_paper',
        label: '撿起泛黃便籤閱讀',
        resultText: '【住戶手寫便籤】：紙條字跡潦草：「……自從四樓莫名封掉後，上下樓總覺得踩踏步頻怪怪的……尤其是走到三樓往上，階梯走起來不知為何腳步總感覺特別快碰到底，但明明爬得更喘……」看來早有老住戶對樓梯踩踏體感產生過疑惑！',
        soundEffect: 'paper',
        sanDelta: 1
      }
    ]
  },
  {
    id: 'hotspot_stair_1f_wall_sign',
    name: '轉角平台綠色「1F」標示',
    iconName: 'Hash',
    category: 'clue',
    shortDesc: '水泥轉角牆面上漆著的綠色「1F」與向上箭頭。',
    inspectText: '牆上的「1F」漆面略顯陳舊，但線條平滑均勻，未有重複粉刷塗改的跡象。',
    actions: [
      {
        id: 'action_inspect_1f_wall',
        label: '仔細檢查牆面油漆層',
        resultText: '【牆面檢查】：綠色「1F」與箭頭油漆為原裝噴漆，底層無任何重疊覆蓋痕跡，此處樓層標記與動線完全吻合。',
        soundEffect: 'knock'
      }
    ]
  },
  {
    id: 'hotspot_stair_1f_mud_trail',
    name: '踏面內側的急促泥水鞋印起點',
    iconName: 'Sparkles',
    category: 'clue',
    shortDesc: '階梯內緣灰塵中殘留的微弱泥水鞋印。',
    inspectText: '水泥踏面上殘留著一道很淺但步幅極大的泥水鞋印，正沿著安全梯一路往上衝！',
    actions: [
      {
        id: 'action_inspect_1f_mud',
        label: '比對鞋印軌跡與尺寸',
        resultText: '【比對鞋印動線】：泥水鞋印與警衛安控室監視主機地面的痕跡完全吻合！證實逃脫者在警衛室發生異變後，推開防火門沿著樓梯狂奔上樓！',
        soundEffect: 'paper',
        sanDelta: 1
      }
    ]
  }
];

export const STAIR_CORNER_HOTSPOTS_2F: HotspotItem[] = [
  {
    id: 'hotspot_stair_steps_2f',
    name: '二樓至三樓水泥階梯（計數15階）',
    iconName: 'Search',
    category: 'clue',
    shortDesc: '丈量從二樓走廊通往三樓走廊的階梯級數。',
    inspectText: '從二樓至折返平台8階，轉角至三樓7階，整段階梯同樣精確為 15階。',
    actions: [
      {
        id: 'action_count_stairs_2f',
        label: '丈量階梯級數與規格',
        resultText: '【階梯丈量】：二樓至三樓同樣是整整 15個水泥階梯。每級高度約18公分（15階 × 18cm = 270公分），規格與一樓至二樓完全相同，物理測量標準完全一致。',
        soundEffect: 'knock',
        sanDelta: 1
      }
    ]
  },
  {
    id: 'hotspot_stair_2f_scraper',
    name: '轉角踢腳板的漂白水痕與五金刮刀',
    iconName: 'FileText',
    category: 'clue',
    shortDesc: '踢腳板邊緣有漂白水刷洗痕跡，牆角遺留著一把生鏽的小刮刀。',
    inspectText: '水泥地面殘留著李阿姨推車上的消毒水氣味，牆腳放著一把沾著微量綠漆的鐵刮刀。',
    actions: [
      {
        id: 'action_inspect_2f_scraper',
        label: '撿起五金刮刀檢查',
        resultText: '【五金刮刀與油漆痕】：刮刀刃口鈍化，上面附著著極細的綠色乳膠漆屑。似乎有人曾帶著這把刮刀刮除過某處牆面上的油漆！',
        soundEffect: 'paper',
        sanDelta: 1
      }
    ]
  },
  {
    id: 'hotspot_stair_2f_pipe',
    name: '轉角水泥管壁內的金屬敲擊異音',
    iconName: 'Volume2',
    category: 'flavor',
    shortDesc: '穿透樓板的生鏽鑄鐵排水管。',
    inspectText: '側耳貼在水管旁，能隱隱聽見一陣陣輕微卻規律的「嗒……嗒……嗒嗒」機械撞擊聲，彷彿是打字機擊字槌穿透樓層的震動。',
    actions: [
      {
        id: 'action_listen_pipe',
        label: '側耳緊貼管壁傾聽',
        resultText: '機械敲擊聲從三樓上方隱隱傳來，聲音雖然微弱，卻精準得像是一台不知疲倦的打字機正在不斷打印字句。',
        soundEffect: 'tension',
        sanDelta: -1
      }
    ]
  },
  {
    id: 'hotspot_stair_2f_wall_sign',
    name: '轉角平台綠色「2F」標示',
    iconName: 'Hash',
    category: 'clue',
    shortDesc: '端正的綠色油漆標記。',
    inspectText: '牆面漆著綠色的「2F」，指向三樓。字跡工整，表面平整無瑕。',
    actions: [
      {
        id: 'action_inspect_2f_wall',
        label: '檢查樓層標記',
        resultText: '二樓轉角的「2F」標示正常無異，無覆蓋塗改。',
        soundEffect: 'knock'
      }
    ]
  }
];
