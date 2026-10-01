/**
 * Immersive Ambient Observations Data
 * Dynamically generated environmental sensory descriptions based on current location and SAN level
 */

export interface AmbientObservationSnippet {
  id: string;
  sensory: 'sight' | 'sound' | 'smell' | 'touch' | 'atmosphere';
  title: string;
  description: string;
}

export interface LocationObservationData {
  highSan: AmbientObservationSnippet[];
  midSan: AmbientObservationSnippet[];
  lowSan: AmbientObservationSnippet[];
}

export const AMBIENT_OBSERVATIONS: Record<string, LocationObservationData> = {
  // 1F Lobby
  loc_1f_lobby: {
    highSan: [
      {
        id: 'lobby_h_1',
        sensory: 'sound',
        title: '大門玻璃穿堂風',
        description: '夜風從大門厚重的自動玻璃門縫隙灌入，發出宛如哨音般的低鳴；大理石地面冰冷而光滑，倒映著天花板日光燈管冷白的微光。'
      },
      {
        id: 'lobby_h_2',
        sensory: 'smell',
        title: '漂白水與舊報紙氣味',
        description: '門廳空氣中瀰漫著物業清潔時留下的微弱漂白水味，混合著一旁住戶信箱區堆積泛黃廣告傳單的陳舊紙漿油墨香。'
      },
      {
        id: 'lobby_h_3',
        sensory: 'sight',
        title: '信箱區的金屬反光',
        description: '整面排列整齊的鋁合金信箱泛著灰冷的光澤，投遞口多數被超市特價傳單塞得滿滿的，唯獨四樓編號的位置被整塊金屬封板牢牢焊死。'
      },
      {
        id: 'lobby_h_4',
        sensory: 'touch',
        title: '大門不銹鋼把手的冷冽',
        description: '手指碰觸到旋轉門把手，冰冷刺骨的金屬感自指尖傳來。大廳角落的立式除濕機正規律地發出低沉而穩定的運轉嗡鳴。'
      }
    ],
    midSan: [
      {
        id: 'lobby_m_1',
        sensory: 'sound',
        title: '燈管異樣的電流蜂鳴',
        description: '頭頂原本平靜的白熾燈管突然開始發出刺耳的高頻電流嘶嘶聲，大廳角落的陰影在光線微妙的明暗交替中似乎拉長了幾吋。'
      },
      {
        id: 'lobby_m_2',
        sensory: 'smell',
        title: '若有似無的發霉泥土味',
        description: '乾淨的消毒水味底下，突然翻湧出一股宛如剛下過暴雨、老舊地下室被泥水浸泡過般的土腥與霉爛氣息。'
      },
      {
        id: 'lobby_m_3',
        sensory: 'sight',
        title: '旋轉門玻璃上的重疊倒影',
        description: '望向大門玻璃窗時，窗戶上的反光除了自己的輪廓外，遠處走廊陰影中似乎多了一抹不易察覺的暗沉深紅，眨眼後卻又空無一物。'
      },
      {
        id: 'lobby_m_4',
        sensory: 'atmosphere',
        title: '突然沉重的空氣阻力',
        description: '穿過大廳時，周圍的空氣彷彿凝固成了黏稠的膠體，每走一步都能聽見鞋底踩在大理石上過分清晰的空洞迴響。'
      }
    ],
    lowSan: [
      {
        id: 'lobby_l_1',
        sensory: 'sight',
        title: '信箱投遞口流出的猩紅墨跡',
        description: '金屬信箱縫隙裡不再是白色紙張，而是不斷滲出濃稠、帶有鐵鏽腥味的暗紅液體，滴滴答答落在地上匯聚成一灘灘微晃的血泊。'
      },
      {
        id: 'lobby_l_2',
        sensory: 'sound',
        title: '牆壁夾層中指甲狂撓的聲音',
        description: '大理石磁磚背後的混凝土深處，傳來無數指甲瘋狂抓撓石壁的刺耳摩擦聲，伴隨著隱約斷斷續續的微弱乾咳與求救低語。'
      },
      {
        id: 'lobby_l_3',
        sensory: 'atmosphere',
        title: '天花板上倒懸注視的視線',
        description: '刺骨的陰冷從天靈蓋直灌而下，彷彿天花板燈飾的暗角處有無數雙泛著血絲的眼睛正一眨不眨地俯瞰著你的一舉一動。'
      }
    ]
  },

  // 1F Security Room
  loc_1f_security: {
    highSan: [
      {
        id: 'sec_h_1',
        sensory: 'sight',
        title: 'CRT螢幕的微弱綠光',
        description: '監視控制台的多分割螢幕將警衛室染上一層冷綠色調，螢幕邊緣閃爍著微小的時間戳數字，顯示出各樓層即時的冷清畫面。'
      },
      {
        id: 'sec_h_2',
        sensory: 'smell',
        title: '隔夜茶與老舊主機電路味',
        description: '辦公桌上的保溫杯散發著濃茶發酵的微澀氣息，旁邊老舊主機散熱孔正吐出帶著溫熱塑料與微量臭氧的乾燥空氣。'
      },
      {
        id: 'sec_h_3',
        sensory: 'sound',
        title: '風扇葉片規律的旋轉聲',
        description: '天花板上的四葉吊扇緩慢轉動，發出微弱而有節奏的「咯噠、咯噠」金屬磨損聲，安控室內顯得格外安靜。'
      }
    ],
    midSan: [
      {
        id: 'sec_m_1',
        sensory: 'sound',
        title: '對講機傳出無人回應的沙沙聲',
        description: '掛在牆上的黑色壁掛對講機忽然傳來刺耳的白噪音，沙沙聲深處隱約夾雜著極其微弱、彷彿在念誦數字的喉音。'
      },
      {
        id: 'sec_m_2',
        sensory: 'sight',
        title: '監視畫面中一閃而過的黑影',
        description: '第4號鏡頭的噪點條紋中，一抹紅色人影在鏡頭盲區一閃而過，但當你凝神細看時，螢幕上只剩下空無一人的走廊。'
      },
      {
        id: 'sec_m_3',
        sensory: 'touch',
        title: '值班椅背後莫名升起的寒意',
        description: '坐在皮質辦公椅上時，後頸處突然感到一陣極為冰涼的呼吸，彷彿有人正俯身站在你背後緊盯著監視器操作手冊。'
      }
    ],
    lowSan: [
      {
        id: 'sec_l_1',
        sensory: 'sight',
        title: '全部監視螢幕同時反轉',
        description: '所有的CRT螢幕畫面突然劇烈扭曲，畫面上所有走廊與梯廳全部被一張巨大而模糊的慘白面孔所填滿，眼眶位置全是黑色的噪點漩渦。'
      },
      {
        id: 'sec_l_2',
        sensory: 'sound',
        title: '主機蜂鳴器化作尖銳啼哭',
        description: '中控台警報器發出撕心裂肺的悲鳴，聲音不再像電子元件，而是一個成年男性在極度絕望下被封死在牆體裡的淒厲哀嚎。'
      },
      {
        id: 'sec_l_3',
        sensory: 'smell',
        title: '燃燒電線與腐肉焦糊味',
        description: '控制台內部冒出刺鼻的青煙，空氣中充斥著電線短路燃燒與有機物腐敗碳化後的惡臭，令人胃部一陣劇烈翻攪。'
      }
    ]
  },

  // 2F Corridor
  loc_2f_corridor: {
    highSan: [
      {
        id: '2f_h_1',
        sensory: 'smell',
        title: '走廊上濃郁的地毯清潔劑',
        description: '走廊兩側鋪著泛灰的短毛地毯，空氣中瀰漫著廉價松木清香劑與橡膠清潔手套的味道，清潔員的推車整齊停靠在轉角處。'
      },
      {
        id: '2f_h_2',
        sensory: 'sight',
        title: '斑駁泛黃的油漆牆面',
        description: '走廊兩側牆面刷著米黃色的乳膠漆，腰線處有些許被手推車刮蹭出的黑色擦痕，各戶門牌上的黃銅數字擦拭得相當明亮。'
      },
      {
        id: '2f_h_3',
        sensory: 'sound',
        title: '遠處窗外車流的微弱回音',
        description: '走廊盡頭的氣窗微開，遠方安祥路上偶爾駛過夜班公車的低沉引擎聲，透過玻璃振動傳進這寂靜的室內。'
      }
    ],
    midSan: [
      {
        id: '2f_m_1',
        sensory: 'sound',
        title: '空無一人的推車輪軸吱嘎聲',
        description: '走廊深處突然傳來橡膠輪子在潮濕地面上摩擦的吱嘎聲，但當你轉頭望去，清潔推車依然靜靜地停在原處，只有拖把在滴水。'
      },
      {
        id: '2f_m_2',
        sensory: 'smell',
        title: '水桶中散發出的腐敗腥氣',
        description: '清潔車上的鐵桶中裝著灰黑色的污水，表面漂浮著一層油膜，散發出一股宛如死魚與濕布悶在塑膠袋多日般的酸腐臭味。'
      },
      {
        id: '2f_m_3',
        sensory: 'sight',
        title: '門縫下若隱若現的陰影',
        description: '202號房門縫底下的光線中，有一對黑色的陰影緩緩移動，停在門內正對著門把手的位置，久久沒有離開。'
      }
    ],
    lowSan: [
      {
        id: '2f_l_1',
        sensory: 'sight',
        title: '走廊地毯滲出的黑色毛髮',
        description: '原本乾燥的地毯纖維裡，無數條濕漉漉的黑色長髮如水草般緩緩蠕動生長，纏繞上你的鞋底與腳踝。'
      },
      {
        id: '2f_l_2',
        sensory: 'sound',
        title: '拖把敲擊地面的節奏與心跳同步',
        description: '「啪嗒……啪嗒……」走廊上迴盪著濕布甩在牆面的巨響，每一次拍打都精準撞擊在你的胸腔心跳節奏上，呼吸愈發艱難。'
      },
      {
        id: '2f_l_3',
        sensory: 'touch',
        title: '牆壁表面傳來的心臟脈動',
        description: '無意間倚靠在牆面，指尖觸碰到的不是冰冷的水泥，而是一層溫熱、帶著微弱脈搏跳動的柔軟肉質組織。'
      }
    ]
  },

  // 3F Corridor
  loc_3f_corridor: {
    highSan: [
      {
        id: '3f_h_1',
        sensory: 'sound',
        title: '變電箱內的工頻震動',
        description: '機房鐵門後傳來50赫茲交流電變壓器穩定的低鳴，空氣中乾燥而帶著輕微靜電，地面上有些許維修遺留的水漬反光。'
      },
      {
        id: '3f_h_2',
        sensory: 'sight',
        title: '機房鐵門上的黃黑警示標籤',
        description: '「高壓危險・未經授權禁止進入」的壓克力警示牌邊緣已有些微脫膠，金屬門把手有些許生鏽磨損的痕跡。'
      },
      {
        id: '3f_h_3',
        sensory: 'touch',
        title: '牆角水漬散發的潮氣',
        description: '彎下腰能感受到地面積水處傳來的微涼濕氣，天花板上的冷氣排水銅管包覆著黑色保溫泡棉，偶爾滴下一顆水珠。'
      }
    ],
    midSan: [
      {
        id: '3f_m_1',
        sensory: 'sound',
        title: '滴水聲轉化為急促的摩斯密碼',
        description: '水珠滴落在積水窪中的「滴、答、滴、答」聲，節奏異常工整，聽上去極度像是電報機在反覆敲擊求救代碼。'
      },
      {
        id: '3f_m_2',
        sensory: 'sight',
        title: '配電機房門縫下的火花閃爍',
        description: '緊鎖的機房門底縫隙中，偶爾跳動著一兩道猩紅色的靜電火花，伴隨著電線在高溫下灼燒的滋滋爆裂聲。'
      },
      {
        id: '3f_m_3',
        sensory: 'smell',
        title: '濃重而刺鼻的臭氧與焦糊感',
        description: '走廊上的空氣突然變得極為稀薄而嗆鼻，高濃度的臭氧混合著生鏽鐵管的腐蝕氣息，吸入肺部時帶來隱隱的刺痛感。'
      }
    ],
    lowSan: [
      {
        id: '3f_l_1',
        sensory: 'sound',
        title: '變壓器狂亂的尖嘯與求救聲',
        description: '配電總箱內的低頻震動劇烈狂飆為刺耳的尖叫，彷彿有數十個人被活生生封印在電路板中，透過金屬箱體用頭骨撞擊鐵門。'
      },
      {
        id: '3f_l_2',
        sensory: 'sight',
        title: '水窪中倒映出沒有五官的臉孔',
        description: '低頭看向地面的水漬，倒影中的你沒有眼睛與嘴巴，取而代之的是一張貼滿了紅色規則紙條、不斷滲血的空白面皮。'
      },
      {
        id: '3f_l_3',
        sensory: 'atmosphere',
        title: '電流穿透脊髓的麻痺感',
        description: '無形的電壓在走廊空氣中劇烈激盪，全身毛孔炸裂，雙腿沉重如灌鉛，每吸一口氣都像是在吞嚥帶刺的鐵絲。'
      }
    ]
  },

  // 5F Corridor & 504 Room
  loc_504_interior: {
    highSan: [
      {
        id: '504_h_1',
        sensory: 'sight',
        title: '書桌上凝固的咖啡殘漬',
        description: '504房內陳設凌亂但真實，書桌上的馬克杯裡殘留著早已乾涸成黑褐色環狀的咖啡漬，窗簾隨夜風微微拂動。'
      },
      {
        id: '504_h_2',
        sensory: 'sound',
        title: '老式座鐘齒輪的咔噠聲',
        description: '床頭櫃上擺放的發條鬧鐘正一秒一秒地走動著，窗外安祥路的夜風吹過窗櫺，發出輕微而規律的木框震顫聲。'
      },
      {
        id: '504_h_3',
        sensory: 'smell',
        title: '久未通風的舊書與灰塵味',
        description: '房間內帶著典型的出租套房氣味：曬不到太陽的舊棉被、受潮的紙箱，以及散落筆記本所散發出的乾燥木漿味。'
      },
      {
        id: '504_h_4',
        sensory: 'touch',
        title: '門口皮鞋鞋底的紅磚泥',
        description: '玄關處擺放著一雙男士皮鞋，鞋跟處還沾著未完全乾透的潮濕紅磚泥，顯示鞋子的主人在失蹤不久前曾去過違章建築工地。'
      }
    ],
    midSan: [
      {
        id: '504_m_1',
        sensory: 'sound',
        title: '地板下傳來急促的鍵盤敲擊',
        description: '站在504號房地板上時，腳底下隔著樓板傳來極度密集、宛如數十台老舊打字機同時發狂敲擊金屬鍵盤的震動與聲響。'
      },
      {
        id: '504_m_2',
        sensory: 'sight',
        title: '鏡子中慢了半秒的動作',
        description: '洗手台鏡子中的倒影似乎存在極其微弱的時間延遲，當你轉過頭時，鏡中的眼睛依然直勾勾地停留在原處。'
      },
      {
        id: '504_m_3',
        sensory: 'smell',
        title: '空氣中若隱若現的微溫咖啡香',
        description: '明明杯中的咖啡早已冷透結塊，鼻腔裡卻突然嗅到了一股剛沖泡好的熱咖啡香氣，彷彿房客幾秒鐘前才剛從椅子上站起。'
      }
    ],
    lowSan: [
      {
        id: '504_l_1',
        sensory: 'sight',
        title: '牆壁壁紙底下瘋狂蠕動的文字',
        description: '房間牆上的米色壁紙開始像皮膚般起伏呼吸，紙張裂縫中不斷湧出密密麻麻由打字機打印出的紅色規約條款，吞噬著家具。'
      },
      {
        id: '504_l_2',
        sensory: 'sound',
        title: '衣櫃深處傳出的張浩求救聲',
        description: '緊閉的衣櫃門縫裡，傳來失蹤者張浩微弱而沙啞的啜泣：「救我……不要相信白衣服……404在逼我打字……！」'
      },
      {
        id: '504_l_3',
        sensory: 'touch',
        title: '空氣中黏稠如血的壓迫感',
        description: '房間重力似乎發生了傾斜，周圍的空氣重若千鈞，胸口彷彿被冰冷的水泥石板死死壓住，讓人幾乎窒息。'
      }
    ]
  },

  // 4F Hidden Space & 404 Room
  loc_4f_hidden: {
    highSan: [
      {
        id: '4f_h_1',
        sensory: 'sight',
        title: '違章加蓋的紅磚與裸露鋼筋',
        description: '這裡沒有裝潢天花板，水泥樑柱與紅磚牆面完全裸露在昏暗的緊急照明燈下，地面散落著2012年施工留下的乾涸水泥碎塊。'
      },
      {
        id: '4f_h_2',
        sensory: 'sound',
        title: '404號房內規律的色帶回帶聲',
        description: '門牌「404」的黑色鐵門後，傳來機械打字機色帶齒輪慢速迴轉的「咔、咔」金屬摩擦聲，伴隨著紙張被捲入滾筒的細微摩擦。'
      },
      {
        id: '4f_h_3',
        sensory: 'smell',
        title: '老舊油墨與受潮石灰的沉重氣息',
        description: '空氣中充滿了濃烈的打字機黑色油墨味，以及未經粉刷的潮濕生石灰粉塵，每一次呼吸都讓喉嚨感到乾燥微癢。'
      }
    ],
    midSan: [
      {
        id: '4f_m_1',
        sensory: 'sound',
        title: '走廊兩側重疊的規則朗讀聲',
        description: '走廊兩側看似實心的紅磚牆體深處，有無數個男男女女的聲音在以完全一致的平直語調反覆朗誦著「本大樓沒有四樓……」。'
      },
      {
        id: '4f_m_2',
        sensory: 'sight',
        title: '空間透視的扭曲與失焦',
        description: '向前望去，短短十公尺的走廊在視野中無限拉長延伸，兩側的房門似乎在隨著呼吸緩慢向前漂移，距離感徹底失準。'
      },
      {
        id: '4f_m_3',
        sensory: 'touch',
        title: '空氣中刺骨的金屬冷意',
        description: '周圍的氣溫陡降至冰點以下，呼出的氣息化作白霧，指節因寒冷而隱隱作痛，但皮膚上卻感覺到一股被視線灼燒般的刺痛。'
      }
    ],
    lowSan: [
      {
        id: '4f_l_1',
        sensory: 'sight',
        title: '打字機紙條瀑布覆蓋了整個走廊',
        description: '404號房門縫如大壩決堤般噴湧出無窮無盡的白色紙條，紙條上全是用鮮血印出的「遵守規則」，紙張如巨浪般將你的視野徹底淹沒！'
      },
      {
        id: '4f_l_2',
        sensory: 'sound',
        title: '萬台打字機齊鳴的毀滅性震音',
        description: '金屬撞針瘋狂撞擊紙張的轟鳴聲在顱骨內炸開，鼓膜劇烈震顫，彷彿整個世界的現實骨架都在規則邏輯的重壓下徹底崩解。'
      },
      {
        id: '4f_l_3',
        sensory: 'atmosphere',
        title: '概念層面的自我同化拉扯',
        description: '你感到自己的十指正在逐漸變得僵硬冰冷，關節化作金屬鍵盤，意識深處有一股不可抗拒的力量正命令你坐下、開始打字！'
      }
    ]
  }
};

/**
 * Helper to pick a random sensory observation snippet based on location and SAN
 */
export function getAmbientObservation(
  locId: string,
  locName: string,
  san: number
): { snippet: AmbientObservationSnippet; sanTier: 'high' | 'mid' | 'low'; sanLabel: string } {
  const locData = AMBIENT_OBSERVATIONS[locId] || AMBIENT_OBSERVATIONS.loc_1f_lobby;

  let pool: AmbientObservationSnippet[];
  let sanTier: 'high' | 'mid' | 'low';
  let sanLabel: string;

  if (san >= 70) {
    pool = locData.highSan;
    sanTier = 'high';
    sanLabel = '冷靜敏銳・客觀物理觀察';
  } else if (san >= 35) {
    pool = locData.midSan;
    sanTier = 'mid';
    sanLabel = '焦慮警覺・隱約異象感知';
  } else {
    pool = locData.lowSan;
    sanTier = 'low';
    sanLabel = '神智動搖・感官侵蝕幻相';
  }

  // Pick random snippet from pool
  const randomIndex = Math.floor(Math.random() * pool.length);
  const snippet = pool[randomIndex] || pool[0];

  return { snippet, sanTier, sanLabel };
}
