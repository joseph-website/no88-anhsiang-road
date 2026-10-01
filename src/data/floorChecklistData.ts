import { TraitId } from '../types';

export interface FloorChecklistItem {
  id: string;
  title: string;
  category: 'rule' | 'clue' | 'action' | 'hidden';
  unlockedTitle?: string;
  lockedTitle?: string;
  categoryName: string;
  ambientClue: string;
  completedSummary: string;
  isCompleted: (context: FloorChecklistContext) => boolean;
  week1Only?: boolean;
  week2Only?: boolean;
}

export interface FloorInvestigationStatus {
  floorId: string;
  floorName: string;
  floorCode: string;
  description: string;
  ambientTone: string;
  checklist: FloorChecklistItem[];
  isWeek2Only?: boolean;
}

export interface FloorChecklistContext {
  inventory: string[];
  obtainedRules: string[];
  isCctvRebooted: boolean;
  discoveredHiddenTraces: string[];
  inspectedHotspots: string[];
  foundContradictions: string[];
  investigationDay: number;
  trait: TraitId;
  san: number;
  completedWeek1?: boolean;
  hasEncountered5FNeighborComplaint?: boolean;
  hasUnlocked502?: boolean;
}

export const FLOOR_CHECKLIST_DATA: FloorInvestigationStatus[] = [
  {
    floorId: 'floor_1f',
    floorName: '一樓大廳與警衛中控室',
    floorCode: '1F',
    description: '大樓出入口與安控中樞。老舊的大理石地板反射著微弱燈光，警衛室的監視螢幕不斷閃爍。',
    ambientTone: '暫時的物理安全庇護所，但中控系統與文件藏有重大疑點。',
    checklist: [
      {
        id: 'chk_1f_key504',
        title: '504 號房鑰匙',
        category: 'clue',
        categoryName: '重要鑰匙',
        lockedTitle: '【未取得鑰匙】一串通往目標樓層的關鍵鑰匙',
        unlockedTitle: '【已取得】504 號房舊銅製鑰匙',
        ambientClue: '大廳管理窗口似乎掌管著各戶鑰匙的收發紀錄。',
        completedSummary: '已從警衛王大偉處取得 504 號房銅製鑰匙。',
        isCompleted: (ctx) => ctx.inventory.includes('key_504') || ctx.obtainedRules.includes('rule_resident')
      },
      {
        id: 'chk_1f_guard_inquiry',
        title: '警衛王大偉口供訪談',
        category: 'action',
        categoryName: '現場訪談',
        lockedTitle: '【未核對作息】向值班警衛查證張浩的生活痕跡與退租說法',
        unlockedTitle: '【已訪談】警衛王大偉的口供與異常避重就輕',
        ambientClue: '值班台的警衛王大偉掌管全棟出入，但他對張浩的說詞疑點重重。',
        completedSummary: '已向王大偉核對張浩的出入狀況，發現其退租說法與現場痕跡不符。',
        isCompleted: (ctx) => ctx.inventory.includes('key_504') || ctx.obtainedRules.includes('rule_resident'),
        week1Only: true
      },
      {
        id: 'chk_1f_guard_rule',
        title: '【警衛工作規則】',
        category: 'rule',
        categoryName: '規約文件',
        lockedTitle: '【未收錄規約】一份規範保全行為的正式手冊',
        unlockedTitle: '【已收錄】保全官方《警衛工作規則》',
        ambientClue: '大樓安控人員隨身或抽屜中應備有值班管理規定。',
        completedSummary: '已收錄警衛工作規則，掌握白衣警衛的查更與點名規範。',
        isCompleted: (ctx) => ctx.obtainedRules.includes('rule_guard'),
        week2Only: true
      },
      {
        id: 'chk_1f_cctv_guide',
        title: '【監視系統操作指引】',
        category: 'rule',
        categoryName: '規約文件',
        lockedTitle: '【未收錄規約】中控主機內部的監視器操作指引',
        unlockedTitle: '【已收錄】中控室《監視系統操作指引》',
        ambientClue: '警衛室內部的監控設備旁散落著操作規章。',
        completedSummary: '已調閱監視指引，掌握頻道切換與畫面異狀處置方式。',
        isCompleted: (ctx) => ctx.obtainedRules.includes('rule_cctv'),
        week2Only: true
      },
      {
        id: 'chk_1f_reboot_cctv',
        title: '監視系統主機重開機校準',
        category: 'action',
        categoryName: '機關破解',
        lockedTitle: '【未解明線路】警衛室監視螢幕存在干擾雜訊',
        unlockedTitle: '【已排除】監視主機冷卻與除錯重置完成',
        ambientClue: '中控螢幕閃爍不定，線路顯然遭到刻意切換或干擾。',
        completedSummary: '成功完成主機重開機校準，使受干擾的真實監控訊號重見天日。',
        isCompleted: (ctx) => ctx.isCctvRebooted,
        week2Only: true
      },
      {
        id: 'chk_1f_handwritten',
        title: '角落【手寫的規則】筆記',
        category: 'rule',
        categoryName: '民間筆記',
        lockedTitle: '【未尋獲筆記】前任受害者在暗處留下的字跡',
        unlockedTitle: '【已尋獲】殘缺手寫筆記《手寫的規則》',
        ambientClue: '通往樓梯的陰暗死角中，似乎有人遺留過求生訊息。',
        completedSummary: '已找到前人留下的染血筆記，獲知「規則是要管理它」的關鍵提示。',
        isCompleted: (ctx) => ctx.obtainedRules.includes('rule_handwritten'),
        week2Only: true
      },
      {
        id: 'chk_1f_blueprints',
        title: '歷史密封卷宗【違章加蓋圖紙】',
        category: 'clue',
        categoryName: '歷史物證',
        lockedTitle: '【未查驗卷宗】一份被鎖定封存的建築公文',
        unlockedTitle: '【已破解】1998年違章圖紙與產權封存卷宗',
        ambientClue: '警衛室深處存放著早年封存的物業與工程機密檔案。',
        completedSummary: '已查驗違章圖紙，物理上鐵證四樓的實體結構與被遮蔽歷史。',
        isCompleted: (ctx) => ctx.inventory.includes('building_blueprints'),
        week2Only: true
      },
      {
        id: 'chk_1f_hidden_trace',
        title: '主控台底座暗角痕跡',
        category: 'hidden',
        categoryName: '隱蔽痕跡',
        lockedTitle: '【未辨識暗痕】大廳某處暗角隱藏的光學痕跡',
        unlockedTitle: '【已鑑識】主控台線路標籤暗痕',
        ambientClue: '若在特定死角開啟強光手電筒聚光照射，或能發現隱藏的標記。',
        completedSummary: '強光鑑識出主控台底座線路手寫痕跡。',
        isCompleted: (ctx) => ctx.discoveredHiddenTraces.includes('trace_1f_cctv_base'),
        week2Only: true
      }
    ]
  },
  {
    floorId: 'floor_2f',
    floorName: '二樓住宅走廊與清潔工作站',
    floorCode: '2F',
    description: '空氣中瀰漫著濃烈的漂白水與松香水氣味，清潔推車靜置在走廊一隅。',
    ambientTone: '基層清潔工的工作現場，藏有官方不願承認的樓層真相。',
    isWeek2Only: true,
    checklist: [
      {
        id: 'chk_2f_cleaner_rule',
        title: '【清潔人員工作規則】',
        category: 'rule',
        categoryName: '規約文件',
        lockedTitle: '【未收錄規約】清潔人員攜帶的工作規範紙本',
        unlockedTitle: '【已收錄】清潔公司《清潔人員工作規則》',
        ambientClue: '在二樓走廊打掃的資深清潔員手中有著獨立的作業規約。',
        completedSummary: '已獲得清潔規則，條文明確記載大樓包含四樓共五層。',
        isCompleted: (ctx) => ctx.obtainedRules.includes('rule_cleaner'),
        week2Only: true
      },
      {
        id: 'chk_2f_cart_search',
        title: '清潔推車物資與暗格',
        category: 'clue',
        categoryName: '調查物證',
        lockedTitle: '【未搜查物資】走廊推車工具箱中的可用物品',
        unlockedTitle: '【已搜查】清潔推車防身物資與工具',
        ambientClue: '走廊推車下層工具箱中似乎放有實用的物資。',
        completedSummary: '搜得實用工具與酒精物資，可用於後續防身與物證清理。',
        isCompleted: (ctx) => ctx.inspectedHotspots.includes('hotspot_2f_cleaner_cart'),
        week2Only: true
      },
      {
        id: 'chk_2f_hidden_trace',
        title: '清潔推車鐵皮刮痕',
        category: 'hidden',
        categoryName: '隱蔽痕跡',
        lockedTitle: '【未辨識暗痕】金屬推車背面的隱蔽刻痕',
        unlockedTitle: '【已鑑識】推車背面 1998 工地防禦刮痕',
        ambientClue: '金屬工具表面隱約有不自然的物理刮擦線條。',
        completedSummary: '鑑識出鐵皮背面遺留的舊年代工地刻痕。',
        isCompleted: (ctx) => ctx.discoveredHiddenTraces.includes('trace_2f_cart_scratch'),
        week2Only: true
      }
    ]
  },
  {
    floorId: 'floor_3f',
    floorName: '三樓住宅區與管線檢修通道',
    floorCode: '3F',
    description: '壁紙大面積受潮發黑剝落，走廊轉角處隱藏著通往大樓核心管線的檢修鐵門。',
    ambientTone: '管線敲擊聲與水流聲交雜，空間結構在此處產生了微妙的延伸。',
    isWeek2Only: true,
    checklist: [
      {
        id: 'chk_3f_inspect_corridor',
        title: '走廊住戶分佈勘驗',
        category: 'action',
        categoryName: '現場勘驗',
        lockedTitle: '【未勘驗走廊】三樓住宅門牌分佈與環境',
        unlockedTitle: '【已勘驗】三樓住戶門牌排列與空間結構',
        ambientClue: '走廊兩側的住戶門牌與結構值得細心對照。',
        completedSummary: '勘驗確認三樓為 301~305 常態門牌，中央暗藏檢修幹道。',
        isCompleted: (ctx) => ctx.inspectedHotspots.includes('hotspot_3f_corridor'),
        week2Only: true
      },
      {
        id: 'chk_3f_inspect_pipe_door',
        title: '中央管線檢修通道鐵門',
        category: 'clue',
        categoryName: '現場勘驗',
        lockedTitle: '【未調查通道】傳出機械異音的重型鐵門',
        unlockedTitle: '【已調查】中央管線檢修鐵門與內部共振',
        ambientClue: '走廊盡頭有扇看似封閉但持續傳來震動的鐵門。',
        completedSummary: '確認檢修鐵門內部連通大樓核心垂直管線，傳來微弱打字聲。',
        isCompleted: (ctx) => ctx.inspectedHotspots.includes('hotspot_3f_pipe_door'),
        week2Only: true
      },
      {
        id: 'chk_3f_hidden_trace',
        title: '鐵門下緣白色粉筆箭頭',
        category: 'hidden',
        categoryName: '隱蔽痕跡',
        lockedTitle: '【未辨識暗痕】檢修門縫暗處的粉筆逃生方向',
        unlockedTitle: '【已鑑識】門下隱蔽逃生箭頭與警示標記',
        ambientClue: '門檻陰暗角落若有強光照射，可能映出粉筆字樣。',
        completedSummary: '強光照出前人留下的白色粉筆逃生箭頭。',
        isCompleted: (ctx) => ctx.discoveredHiddenTraces.includes('trace_3f_pipe_chalk'),
        week2Only: true
      }
    ]
  },
  {
    floorId: 'floor_5f',
    floorName: '五樓住宅區與 504 號房（失蹤現場）',
    floorCode: '5F',
    description: '失蹤者張浩失蹤前最後居住的頂層公寓。室內保留著數天前的生活痕跡，隔間牆深處隱約傳來異常動靜。',
    ambientTone: '第一輪常態探案核心目標現場，失蹤者張浩的受困線索聚集於此。',
    checklist: [
      {
        id: 'chk_5f_resident_rule',
        title: '茶几上的【泛黃紙條】',
        category: 'rule',
        categoryName: '現場文件',
        lockedTitle: '【未尋獲證物】客廳茶几上的散落紙條',
        unlockedTitle: '【已收錄】客廳茶几上的泛黃紙條',
        ambientClue: '進入 504 號房後，客廳顯眼處放有一張泛黃紙條。',
        completedSummary: '已收錄茶几上的泛黃紙條，記錄著幾條看似古怪的居住叮嚀。',
        isCompleted: (ctx) => ctx.obtainedRules.includes('rule_resident')
      },
      {
        id: 'chk_5f_shredded_letter',
        title: '垃圾桶中被撕碎的信件碎片',
        category: 'clue',
        categoryName: '現場物證',
        lockedTitle: '【未尋獲物證】垃圾桶中散落的紙張碎片',
        unlockedTitle: '【已拼合】拼湊完整的急迫信件',
        ambientClue: '房間垃圾桶中似乎丟棄了被刻意撕毀的信件。',
        completedSummary: '已完成信紙拼圖，信件記錄了張浩失蹤前極度焦慮的心境。',
        isCompleted: (ctx) => ctx.inventory.includes('shredded_letter')
      },
      {
        id: 'chk_5f_wall_noise',
        title: '五樓隔間牆壁異音搜查',
        category: 'action',
        categoryName: '搜救線索',
        lockedTitle: '【未搜查異音】留意周遭牆壁與隔間的異常動靜',
        unlockedTitle: '【已確認】隔間牆暗夾層內傳出微弱的求救抓撓聲',
        ambientClue: '五樓走廊與房間深處似乎隱約傳來微弱動靜，需進一步搜查。',
        completedSummary: '經實地勘驗，確認隔間牆夾層內傳來微弱的指甲抓撓與敲打聲，有人受困！',
        isCompleted: (ctx) => (
          ctx.inspectedHotspots.includes('hotspot_502_scratch_wall') ||
          ctx.inspectedHotspots.includes('hotspot_504_scratch_wall') ||
          Boolean(ctx.hasUnlocked502) ||
          Boolean(ctx.completedWeek1)
        ),
        week1Only: true
      },
      {
        id: 'chk_5f_rescue_zhanghao',
        title: '查明失蹤者張浩的確切下落',
        category: 'clue',
        categoryName: '破案結案',
        lockedTitle: '【未查明】追查失蹤者張浩的最後行蹤',
        unlockedTitle: '【常態破案】成功破除夾層救出張浩！',
        ambientClue: '深入調查五樓房間與周邊環境，確認失蹤者是否仍留在大樓內部。',
        completedSummary: '成功推開暗室隔板救出虛弱受困的張浩，圓滿達成委託破案！',
        isCompleted: (ctx) => Boolean(ctx.completedWeek1),
        week1Only: true
      },
      {
        id: 'chk_5f_hidden_trace',
        title: '衣櫃後方門牌釘孔痕跡',
        category: 'hidden',
        categoryName: '隱蔽痕跡',
        lockedTitle: '【未辨識暗痕】房間牆壁壁紙底下的物理結構',
        unlockedTitle: '【已鑑識】被遮蓋的舊門牌生鏽螺絲孔',
        ambientClue: '房間內的壁紙接縫處隱藏著不自然的凹凸釘痕。',
        completedSummary: '鑑識出衣櫃後方曾遭拆換門牌的對稱螺絲孔痕跡。',
        isCompleted: (ctx) => ctx.discoveredHiddenTraces.includes('trace_504_wallpaper_hole'),
        week2Only: true
      }
    ]
  },
  {
    floorId: 'floor_4f',
    floorName: '四樓隱蔽違建層與 404 號房核心機房',
    floorCode: '4F',
    description: '大樓官方紀錄中不存在的黑洞層。牆壁由墨跡與文字神經絡蔓延構成，中央座落著打字機巨型機房。',
    ambientTone: '規則滋生與同化的源頭，真相與認知深淵所在。',
    isWeek2Only: true,
    checklist: [
      {
        id: 'chk_4f_fake_rule',
        title: '梯口【大樓緊急避難指引】',
        category: 'rule',
        categoryName: '規約文件',
        lockedTitle: '【未識破規約】梯口看似正式但暗藏陷阱的白色指引',
        unlockedTitle: '【已識破】偽造陷阱《大樓緊急避難指引》',
        ambientClue: '四樓梯口張貼著一張看似全新潔白的官方公告。',
        completedSummary: '成功識破並撕下誘騙調查員的偽造避難規則。',
        isCompleted: (ctx) => ctx.obtainedRules.includes('rule_fake_evacuation'),
        week2Only: true
      },
      {
        id: 'chk_4f_tape_recorder',
        title: '張浩遺留的【原子筆/微型錄音筆】',
        category: 'clue',
        categoryName: '核心物證',
        lockedTitle: '【未尋獲物證】門外雜物堆中的隨身器物',
        unlockedTitle: '【已破解】張浩的微型隨身錄音筆',
        ambientClue: '404 門前的廢棄雜物堆中遺落了可疑的私人物品。',
        completedSummary: '已取得微型錄音筆，記錄了張浩失蹤前的最後語音口供。',
        isCompleted: (ctx) => ctx.inventory.includes('tape_recorder'),
        week2Only: true
      },
      {
        id: 'chk_4f_hidden_trace',
        title: '水泥縫隙墨跡文字神經絡',
        category: 'hidden',
        categoryName: '隱蔽痕跡',
        lockedTitle: '【未辨識暗痕】走廊水泥裂縫深處的文字脈絡',
        unlockedTitle: '【已鑑識】牆體蔓延的微型墨跡神經絡',
        ambientClue: '走廊暗角水泥裂縫中隱藏著規則具象化的痕跡。',
        completedSummary: '鑑識出水泥牆體上密密麻麻的墨跡微型文字。',
        isCompleted: (ctx) => ctx.discoveredHiddenTraces.includes('trace_4f_ink_tendrils'),
        week2Only: true
      },
      {
        id: 'chk_4f_door_survey',
        title: '404 號房大門與打字機核心',
        category: 'action',
        categoryName: '終局現場',
        lockedTitle: '【未勘驗大門】半掩的厚重鐵門與狂暴噴湧的字條',
        unlockedTitle: '【已勘驗】404號房核心現場與被困失蹤者',
        ambientClue: '走廊盡頭半掩的鐵門內傳來打字機狂亂轟鳴，失蹤者張浩受困於此。',
        completedSummary: '成功抵達 404 號房門口，勘驗打字機源頭與狂湧字卷，掌握進入終局對決契機。',
        isCompleted: (ctx) => (
          ctx.inspectedHotspots.includes('hotspot_404_door') ||
          ctx.inspectedHotspots.includes('enter_404_boss') ||
          Boolean(ctx.completedWeek1)
        ),
        week2Only: true
      }
    ]
  }
];

export function getVisibleFloors(context: FloorChecklistContext): FloorInvestigationStatus[] {
  const isWeek1 = !context.completedWeek1;

  if (isWeek1) {
    // Week 1: strictly show 1F and 5F, hiding 2F, 3F, and 4F (which are part of Week 2's deep mystery)
    return FLOOR_CHECKLIST_DATA
      .filter(f => f.floorId === 'floor_1f' || f.floorId === 'floor_5f')
      .map(floor => ({
        ...floor,
        checklist: floor.checklist.filter(item => !item.week2Only)
      }));
  }

  // Week 2: all floors are accessible, filtering out week 1 only tutorial/intro items
  return FLOOR_CHECKLIST_DATA.map(floor => ({
    ...floor,
    checklist: floor.checklist.filter(item => !item.week1Only)
  }));
}

export function calculateFloorInvestigationProgress(
  floor: FloorInvestigationStatus,
  context: FloorChecklistContext
): { completed: number; total: number; percentage: number; isAllCompleted: boolean } {
  const isWeek1 = !context.completedWeek1;
  const filteredChecklist = floor.checklist.filter(item => {
    if (isWeek1) return !item.week2Only;
    return !item.week1Only;
  });

  const total = filteredChecklist.length;
  if (total === 0) return { completed: 0, total: 0, percentage: 100, isAllCompleted: true };

  const completed = filteredChecklist.filter(item => item.isCompleted(context)).length;
  const percentage = Math.round((completed / total) * 100);
  const isAllCompleted = completed === total;

  return { completed, total, percentage, isAllCompleted };
}

export function calculateOverallBuildingProgress(
  context: FloorChecklistContext
): { completed: number; total: number; percentage: number } {
  const visibleFloors = getVisibleFloors(context);
  let total = 0;
  let completed = 0;

  for (const floor of visibleFloors) {
    total += floor.checklist.length;
    completed += floor.checklist.filter(item => item.isCompleted(context)).length;
  }

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}

