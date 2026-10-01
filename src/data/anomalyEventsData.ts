/**
 * Random Urban Legend Anomaly Events Data (怪談異常隨機事件庫)
 * Escalates dynamically based on the number of rules held by the player.
 * Only triggers after obtaining the 2nd rule (Guard Rule).
 */

export interface AnomalyChoice {
  id: string;
  label: string;
  subLabel?: string;
  requiredRuleId?: string;
  requiredItemId?: string;
  requiredFlashlight?: boolean;
  isCorrect: boolean;
  sanDelta: number;
  resultTitle: string;
  resultText: string;
  journalNote?: string;
}

export interface AnomalyEvent {
  id: string;
  tier: 1 | 2 | 3;
  name: string;
  threatLevel: string;
  triggerType: 'elevator' | 'stairs' | 'corridor' | 'any';
  applicableFloors?: string[];
  visualEffect: 'red_flash' | 'vignette' | 'screen_glitch' | 'scanline' | 'darkness';
  soundEffect: 'glitch' | 'tension' | 'whisper' | 'heartbeat' | 'violin';
  flavorText: string;
  sceneDescription: string;
  loreOrigin: string;
  timeLimit: number; // in seconds
  timeoutResult: {
    sanDelta: number;
    title: string;
    description: string;
  };
  choices: AnomalyChoice[];
}

export const ANOMALY_EVENTS: AnomalyEvent[] = [
  // ================= TIER 1: 輕度認知擾動 =================
  {
    id: 'anomaly_t1_elevator_blank_button',
    tier: 1,
    name: '電梯空白按鈕的血色微光',
    threatLevel: '【輕度異常・認知試探】',
    triggerType: 'elevator',
    visualEffect: 'red_flash',
    soundEffect: 'glitch',
    timeLimit: 11,
    flavorText: '電梯上升途中齒輪突然卡頓，樓層控制面板傳來刺耳的微弱電流滋滋聲……',
    sceneDescription: '在標示 1、2、3、5 的金屬按鍵下方，那個光滑無字的「空白按鈕」突然泛起刺眼的腥紅色微光，伴隨著沉重的齒輪震動聲，彷彿在誘惑著你伸手按下它。',
    loreOrigin: '《住戶規則》第5條與《警衛工作規則》第7條均有提及「空白/未標示按鈕」之禁忌。',
    timeoutResult: {
      sanDelta: -7,
      title: '【思緒遲滯・精神受灼】',
      description: '你在恐懼猶豫中盯著血色按鈕過久，紅光在瞳孔深處灼燒出殘影，心跳劇烈加速，強烈的壓迫感侵襲心神。電梯最終劇烈顛簸了一下恢復正常。'
    },
    choices: [
      {
        id: 't1_btn_ignore_rule',
        label: '【依據《住戶規則》第5條】視若無睹，堅決不碰空白按鈕，直視前方按下一樓關門鍵',
        subLabel: '需要：已持有《住戶規則》或《警衛工作規則》',
        requiredRuleId: 'rule_resident',
        isCorrect: true,
        sanDelta: 3,
        resultTitle: '【規則克制・心神平穩】',
        resultText: '你嚴格恪守規則指引，移開視線並緊按關門鈕。數秒後，血色紅光發出一聲不甘的電流嘶鳴後熄滅，電梯平穩抵達，緊繃的神經稍稍放鬆。',
        journalNote: '在電梯中遭遇空白按鈕血光異象，依據規則堅定無視，成功平復認知衝擊。'
      },
      {
        id: 't1_btn_press_curiosity',
        label: '好奇伸手按下去，看看這顆按鈕到底通往哪裡',
        isCorrect: false,
        sanDelta: -11,
        resultTitle: '【嚴重違規・空間劇烈震盪】',
        resultText: '按鈕觸感如同一塊冰冷的死人皮肉！電梯燈光瞬間全滅，失重感排山倒海而來，耳邊響起尖銳的笑聲，隨後電梯猛地卡在鋼纜上，劇烈的心悸讓人近乎窒息！',
        journalNote: '違規按下了電梯空白按鈕，遭到恐怖的失重與幻聽反噬。'
      },
      {
        id: 't1_btn_close_eyes',
        label: '緊閉雙眼退到電梯角落，背靠鋼板默數十秒',
        isCorrect: false,
        sanDelta: -5,
        resultTitle: '【被動避險・心悸未平】',
        resultText: '你閉上眼睛不敢直視，黑暗中感覺有無數雙眼睛在頸後凝視。雖然撐過了異象，但恐懼依然在心頭盤旋，久久揮之不去。'
      }
    ]
  },
  {
    id: 'anomaly_t1_corridor_mirror_shadow',
    tier: 1,
    name: '走廊滅火箱玻璃的錯位白影',
    threatLevel: '【輕度異常・鏡像侵蝕】',
    triggerType: 'corridor',
    applicableFloors: ['2F', '3F', '5F'],
    visualEffect: 'scanline',
    soundEffect: 'whisper',
    timeLimit: 11,
    flavorText: '走廊頂燈劇烈閃爍，兩側滅火箱的鏡面玻璃上映出奇怪的倒影……',
    sceneDescription: '當你走過走廊中央的消防玻璃時，眼角餘光赫然瞥見鏡中倒影——走廊裡的燈光在鏡中竟然是全黑的，且鏡中的你身後半公尺處，正懸空站著一個看不清面孔的白色模糊虛影！',
    loreOrigin: '大樓走廊長年存在的殘留意識，會利用反光玻璃試探調查者的心理防線。',
    timeoutResult: {
      sanDelta: -7,
      title: '【背脊發涼・幻影糾纏】',
      description: '你愣在原地，鏡中的白影緩緩伸出枯槁的手搭上你的肩膀……你猛地回頭卻空無一物，冷汗浸透後背，心頭湧起刺骨寒意。'
    },
    choices: [
      {
        id: 't1_mirror_flashlight',
        label: '【開啟戰術探照手電筒】強光聚焦直射消防箱鏡面與身後死角',
        subLabel: '需要：配備戰術探照手電筒',
        requiredFlashlight: true,
        isCorrect: true,
        sanDelta: 3,
        resultTitle: '【強光破妄・驅散殘影】',
        resultText: '手電筒的高流明強光瞬間穿透鏡面折射，白影如同被灼燒的霧氣般發出細碎哀鳴後潰散，周圍空氣溫度恢復正常，呼吸逐漸平緩。',
        journalNote: '利用戰術手電筒強光破除了走廊消防箱鏡面的錯位白影。'
      },
      {
        id: 't1_mirror_turn_and_stare',
        label: '猛然轉身大聲呵斥，試圖抓住身後的白影',
        isCorrect: false,
        sanDelta: -9,
        resultTitle: '【撲空失衡・陰寒入體】',
        resultText: '身後空無一物，但你感覺到一陣刺骨的陰風穿透了胸膛，彷彿有什麼陰冷的東西穿透了你的身體，帶來一陣劇烈的神經痙攣！'
      },
      {
        id: 't1_mirror_keep_walking',
        label: '目不斜視，保持均勻腳步快步前進不看任何反光面',
        isCorrect: true,
        sanDelta: 1,
        resultTitle: '【冷靜自持・安然通過】',
        resultText: '你深吸一口氣，將視線鎖定在前方門把上，不理會鏡中的幻影，維持冷靜順利走過這段長廊。'
      }
    ]
  },

  // ================= TIER 2: 中度異常侵蝕 =================
  {
    id: 'anomaly_t2_red_inquire_at_landing',
    tier: 2,
    name: '電梯夾層的紅衣問路者',
    threatLevel: '【中度異常・實體化偽裝】',
    triggerType: 'elevator',
    visualEffect: 'screen_glitch',
    soundEffect: 'violin',
    timeLimit: 9,
    flavorText: '電梯突然在一處未標示的夾層震動停下，門無聲地滑開了一條縫隙……',
    sceneDescription: '門外是一條被暗紅壁紙包覆的死寂走廊。一個身穿亮紅色風衣、面部五官彷彿被鉛筆塗抹模糊的男子站在門口，用乾澀無起伏的聲音問：「請問……四樓專案辦公室是往這裡走嗎？能幫我按一下電梯嗎？」',
    loreOrigin: '《住戶規則》第3條明確指示「警衛為白衣黑褲，穿其他顏色制服自稱警衛者請忽略」；《手寫規則》警告「假裝不知道你知道」。',
    timeoutResult: {
      sanDelta: -11,
      title: '【言辭動搖・精神同化】',
      description: '你遲疑的目光被男子捕捉，他的脖子突然以詭異角度扭轉，手指猛地扒住電梯門縫，駭人的景象直擊眼簾！'
    },
    choices: [
      {
        id: 't2_red_cold_ignore',
        label: '【遵循《住戶規則》第3條】完全無視他的發言與眼神，面無表情迅速連按【關門】',
        subLabel: '需要：熟知《住戶規則》或《警衛工作規則》',
        requiredRuleId: 'rule_guard',
        isCorrect: true,
        sanDelta: 4,
        resultTitle: '【看破偽裝・斷然拒止】',
        resultText: '你眼神毫無波瀾，將他視為空氣並狂按關門鈕。紅衣男子的手指在觸碰到門框前被鋼門重重夾退，電梯強行拉升脫離異常夾層，讓人如釋重負。',
        journalNote: '在電梯異常停靠夾層時，依據規則果斷無視紅衣男子，成功規避了同化陷阱。'
      },
      {
        id: 't2_red_answer_friendly',
        label: '開口回答：「這裡沒有四樓，你找錯地方了。」',
        isCorrect: false,
        sanDelta: -13,
        resultTitle: '【違反規則・建立因果連結】',
        resultText: '男子咧開了嘴角：「原來你也知道沒有四樓……那就跟我一起來吧！」無數打字機紙條從他袖口噴出，如觸手般抽打在電梯內，思緒陷入前所未有的混亂！',
        journalNote: '不慎與紅衣男子對話交談，違反了「假裝不知道你知道」與「無視偽裝者」之原則。'
      },
      {
        id: 't2_red_push_out',
        label: '試圖伸手將他推開並奪路逃出電梯',
        isCorrect: false,
        sanDelta: -15,
        resultTitle: '【肉體接觸・精神劇烈受創】',
        resultText: '你的手穿過了他的紅色衣服，觸感就像插進了一桶冰冷的腐水！整條手臂劇痛麻木，刺骨的陰冷瞬間撕扯著神經！'
      }
    ]
  },
  {
    id: 'anomaly_t2_cleaner_bucket_blood_ink',
    tier: 2,
    name: '安全梯轉角的暗紅墨水桶與鐵撬敲擊',
    threatLevel: '【中度異常・規約衝突具象】',
    triggerType: 'stairs',
    visualEffect: 'vignette',
    soundEffect: 'tension',
    timeLimit: 10,
    flavorText: '走在水泥樓梯間時，上方樓梯平台突然傳來金屬鐵撬敲擊水泥地的清脆聲響……',
    sceneDescription: '轉角的水泥地上翻倒著一隻生鏽的水桶，裡面流出的不是清水，而是黏稠刺鼻、散發著鐵鏽味的深紅墨汁，順著台階如活物般向你的鞋尖蔓延！上方平台傳來李阿姨那神經質的碎碎念：「不要爭辯……四樓共五層……不要去404……」',
    loreOrigin: '《清潔人員工作規則》第1條與第4條指出的矛盾與現場危險。',
    timeoutResult: {
      sanDelta: -10,
      title: '【墨痕纏足・理智受損】',
      description: '紅墨水蔓延浸透了你的鞋底，沉重的拖曳感讓你幾乎無法邁步，沉重的拖曳感讓你幾乎無法邁步，濃重的壓迫感令人窒息。'
    },
    choices: [
      {
        id: 't2_bucket_cleaner_rule',
        label: '【踐行《清潔規則》第4條】高聲朗誦規則優先保命條款，繞開墨漬貼著外牆扶手疾步通過',
        subLabel: '需要：持有《清潔人員工作規則》',
        requiredRuleId: 'rule_cleaner',
        isCorrect: true,
        sanDelta: 4,
        resultTitle: '【規約共鳴・墨痕退避】',
        resultText: '你嚴格遵守清潔規則的避險規範，地面的暗紅墨汁彷彿受到規約制約，主動向兩側退開，敲擊聲隨之消散，緊繃的思緒重獲片刻平靜。',
        journalNote: '運用清潔人員規則的自保條款，化解了樓梯間暗紅墨汁蔓延的實體威脅。'
      },
      {
        id: 't2_bucket_inspect_bucket',
        label: '走上前去伸手扶起水桶，想看清楚水桶裡裝的是什麼',
        isCorrect: false,
        sanDelta: -12,
        resultTitle: '【直視污穢・劇烈作嘔】',
        resultText: '水桶底部赫然漂浮著半截刻有「404」的木製殘片，一股屍臭般的墨味直衝腦門，令你劇烈眩暈作嘔，視野幾乎泛黑！'
      },
      {
        id: 't2_bucket_jump_over',
        label: '縱身大步躍過紅墨水潭，不作任何停留',
        isCorrect: true,
        sanDelta: 1,
        resultTitle: '【身手敏捷・有驚無險】',
        resultText: '你猛力一躍跳過墨跡，雖然靴邊沾了少許飛沫，但憑藉過人定力成功衝過了危險轉角。'
      }
    ]
  },

  // ================= TIER 3: 重度現實扭曲 =================
  {
    id: 'anomaly_t3_cctv_red_eye_surveillance',
    tier: 3,
    name: '監視器紅眼實體化與投影審判',
    threatLevel: '【極度危險・全知視線鎖定】',
    triggerType: 'corridor',
    visualEffect: 'screen_glitch',
    soundEffect: 'heartbeat',
    timeLimit: 8,
    flavorText: '天花板的監視器鏡頭發出刺耳的旋轉齒輪聲，突然垂直轉向你！',
    sceneDescription: '走廊兩側牆面突然浮現無數閃爍的黑白監視畫面，每一面螢幕都在重播你此時此刻的站立姿態！鏡頭紅燈化為一顆巨大的猩紅眼球，機械廣播在腦海中轟鳴：「工作人員確認中……畫面顯示您身處404號房空間……本系統不會出錯……」',
    loreOrigin: '《監視系統操作指引》第6、7條：「若在畫面中看到自己，請確認所在空間是否是警衛室，否則請立即重啟系統」。',
    timeoutResult: {
      sanDelta: -15,
      title: '【被系統標定・存在認知模糊】',
      description: '猩紅眼球將光束烙印在你的胸膛上，你感覺自己的身體正在像監視器畫面一樣像素化分解，恐慌如潮水般淹沒意識！'
    },
    choices: [
      {
        id: 't3_cctv_guide_counter',
        label: '【引用《監視指引》第7條＆出示圖紙】大聲駁斥「本機空間非警衛室，依據第7條立即執行認知否定！」',
        subLabel: '需要：持有《監視系統操作指引》與《加蓋圖紙卷宗》',
        requiredRuleId: 'rule_cctv',
        requiredItemId: 'building_blueprints',
        isCorrect: true,
        sanDelta: 6,
        resultTitle: '【邏輯反制・系統過載崩潰】',
        resultText: '你高舉物理圖紙並引導指引中的悖論邏輯，牆面上的投影畫面瞬間冒出劇烈火花與雜訊，猩紅眼球鏡頭承受不住邏輯衝突應聲爆裂，空氣中的狂暴雜訊隨之平息。',
        journalNote: '成功利用監視系統指引第7條的重啟邏輯與實體圖紙，擊潰了全知監視眼球的認知審判。'
      },
      {
        id: 't3_cctv_smash_camera',
        label: '撿起滅火器用力砸向天花板的監視鏡頭',
        isCorrect: false,
        sanDelta: -16,
        resultTitle: '【物理攻擊無效・遭到系統反噬】',
        resultText: '滅火器穿過了虛幻的鏡頭砸在天花板上，高壓電流順著牆壁猛烈擊中你的神經，劇痛令你跪倒在地，意識差點渙散！'
      },
      {
        id: 't3_cctv_cower_dodge',
        label: '抱頭縮在牆角視線死角處，大口深呼吸抵抗精神撕裂',
        isCorrect: false,
        sanDelta: -9,
        resultTitle: '【苦苦支撐・神經衰弱】',
        resultText: '你躲在死角抵抗著精神審判，直到鏡頭因搜尋不到正面而緩緩轉開，全身肌肉依然止不住地顫抖。'
      }
    ]
  },
  {
    id: 'anomaly_t3_fake_evacuation_broadcast',
    tier: 3,
    name: '偽造的【全體住戶緊急避難廣播】',
    threatLevel: '【極度危險・偽造規則致命誘捕】',
    triggerType: 'any',
    visualEffect: 'red_flash',
    soundEffect: 'violin',
    timeLimit: 8,
    flavorText: '大樓所有消防廣播喇叭突然同時炸響，刺耳的防空警報劃破死寂！',
    sceneDescription: '喇叭傳出甜美而失真的廣播女聲：「各位住戶請注意，本大樓已啟動404專案應變機制。請所有人員立即攜帶貴重物品，循紅色逃生箭頭前往四樓404號辦公室報到，穿紅色制服的專案人員將引導您平安撤離……重複，請相信紅色制服……」',
    loreOrigin: '《大樓緊急避難指引（偽造）》與《手寫的規則》：「規則是要管理它，不是你。如果看到規則，快逃」。',
    timeoutResult: {
      sanDelta: -14,
      title: '【警報貫耳・神經錯亂】',
      description: '高分貝的偽造廣播不斷摧毀你的判斷力，高分貝的偽造廣播不斷摧毀你的判斷力，耳膜滲出鮮血，神經如同被無數鋼針穿刺。'
    },
    choices: [
      {
        id: 't3_broadcast_handwritten_truth',
        label: '【出示《手寫規則》與《張浩信件》】大聲默唸「規則是要管理它，不是我！假裝不知道我知道！」',
        subLabel: '需要：持有《手寫的規則》或《張浩信件》',
        requiredRuleId: 'rule_handwritten',
        isCorrect: true,
        sanDelta: 5,
        resultTitle: '【識破偽裝・真理護身】',
        resultText: '你緊握手寫便條紙，真理字跡在掌心發燙。廣播中的女聲突然發出扭曲的尖叫，喇叭在劈啪火花中被短路切斷，安寧重回四周，狂亂的心跳逐漸穩定。',
        journalNote: '識破了偽造的大樓緊急避難廣播，以手寫便條紙的真相破解了致命誘捕。'
      },
      {
        id: 't3_broadcast_obey_instructions',
        label: '聽從廣播指令，準備跟隨紅色箭頭前往 404 專案室',
        isCorrect: false,
        sanDelta: -19,
        resultTitle: '【踏入死地・遭受怪異同化】',
        resultText: '你剛邁出一步，走廊兩側的牆壁瞬間化為無數張開的血盆大口，紅色箭頭如鎖鏈般纏繞住你的腳踝，令人戰慄的窒息感瞬間籠罩全身！',
        journalNote: '致命失誤：盲從了偽造避難廣播，險些在 404 門口被完全同化。'
      },
      {
        id: 't3_broadcast_cover_ears',
        label: '戴上耳塞或用雙手死死摀住耳朵，原地蹲下絕不移動',
        isCorrect: true,
        sanDelta: 2,
        resultTitle: '【堅守陣腳・抵擋蠱惑】',
        resultText: '你死死閉眼堵住耳朵，任憑廣播如何嘶吼也不為所動。兩分鐘後，警報聲終於耗盡能量衰竭消失，心跳重歸常態。'
      }
    ]
  }
];

/**
 * Helper to determine which anomaly event to trigger based on player's held rules
 * (Only triggers when player holds at least 2 rules: e.g. Resident + Guard rules)
 */
export function getRandomAnomalyEvent(
  obtainedRulesCount: number,
  triggerType: 'elevator' | 'stairs' | 'corridor' | 'any',
  currentFloor?: string
): AnomalyEvent | null {
  if (obtainedRulesCount < 2) {
    return null; // No random anomalies before securing the 2nd rule
  }

  // Determine danger tier according to progression
  let targetTier: 1 | 2 | 3 = 1;
  if (obtainedRulesCount >= 4) {
    // 60% chance for Tier 3, 30% Tier 2, 10% Tier 1
    const r = Math.random();
    targetTier = r < 0.6 ? 3 : r < 0.9 ? 2 : 1;
  } else if (obtainedRulesCount >= 3) {
    // 65% Tier 2, 35% Tier 1
    targetTier = Math.random() < 0.65 ? 2 : 1;
  } else {
    // 2 rules (Resident + Guard): 80% Tier 1, 20% Tier 2
    targetTier = Math.random() < 0.8 ? 1 : 2;
  }

  // Filter applicable events
  const candidates = ANOMALY_EVENTS.filter(event => {
    if (event.tier !== targetTier) return false;
    if (event.triggerType !== 'any' && triggerType !== 'any' && event.triggerType !== triggerType) {
      return false;
    }
    if (event.applicableFloors && currentFloor && !event.applicableFloors.includes(currentFloor)) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) {
    // Fallback to any tier event matching trigger
    const fallback = ANOMALY_EVENTS.filter(e => e.triggerType === triggerType || e.triggerType === 'any');
    if (fallback.length === 0) return null;
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}
