import { EndingId, TraitId } from '../types';

/**
 * 關鍵點抉擇風格 (Approach Style)
 */
export type EndingApproachStyle = 
  | 'leave_1f' 
  | 'retreat' 
  | 'flee_with_target' 
  | 'succumb' 
  | 'violence' 
  | 'listen' 
  | 'innocent_malice'
  | 'deconstruct';

export type ShortEndingId = 'ED0' | 'ED1' | 'ED2' | 'ED3' | 'ED4' | 'ED5' | 'ED6' | 'ED7' | 'ED8';

export interface EndingCalculatorInputState {
  san: number;
  core_items_count: number;
  is_deconstructed: boolean;
  approach_style: EndingApproachStyle;
  trait: TraitId | string;
}

export interface EndingCalculationResult {
  id: ShortEndingId;
  endingId: EndingId;
  name: string;
  type: 'Bad Ending' | 'Normal Ending' | 'True Ending';
  rawType: 'bad' | 'normal' | 'true';
  desc: string;
}

export const SHORT_TO_CANONICAL_ENDING_ID: Record<ShortEndingId, EndingId> = {
  ED0: 'ending0',
  ED1: 'ending1',
  ED2: 'ending2',
  ED3: 'ending3',
  ED4: 'ending4',
  ED5: 'ending5',
  ED6: 'ending6',
  ED7: 'ending7',
  ED8: 'ending8',
};

export const CANONICAL_TO_SHORT_ENDING_ID: Record<EndingId, ShortEndingId> = {
  ending0: 'ED0',
  ending1: 'ED1',
  ending2: 'ED2',
  ending3: 'ED3',
  ending4: 'ED4',
  ending5: 'ED5',
  ending6: 'ED6',
  ending7: 'ED7',
  ending8: 'ED8',
};

/**
 * 《安祥路88號》 8 大結局判定計算器
 * @param {EndingCalculatorInputState} state 玩家當前的遊戲狀態
 * @param {number} state.san 理智值 (0 - 100)
 * @param {number} state.core_items_count 核心物證收集數量 (0 - 6)
 * @param {boolean} state.is_deconstructed 是否在 404 號房完成邏輯解構
 * @param {EndingApproachStyle} state.approach_style 關鍵點抉擇風格:
 *                 'leave_1f' | 'retreat' | 'flee_with_target' | 'succumb' | 'violence' | 'listen' | 'deconstruct'
 * @param {string} state.trait 偵探特質 ('rationalist' | 'intuitive' | 'observer' | 'empathetic' | 'empath' 等)
 * @returns {EndingCalculationResult} 結局 ID、名稱、類型與結局描述
 */
export function checkEndingConditions(state: EndingCalculatorInputState): EndingCalculationResult {
  const { san, core_items_count, is_deconstructed, approach_style, trait } = state;

  // 1. 理智值歸零 / 屈服判定 (Bad Ending 4)
  if (san <= 0 || approach_style === 'succumb') {
    return {
      id: 'ED4',
      endingId: 'ending4',
      name: '《成為新規則》',
      type: 'Bad Ending',
      rawType: 'bad',
      desc: '你的理性完全崩潰，認知被 404 集體意識同化，穿上紅色制服在打字機前打出《調查員守則》，成為大樓的新規則。'
    };
  }

  // 2. 一樓大廳主動放棄離開 (Normal Ending 1)
  if (approach_style === 'leave_1f') {
    return {
      id: 'ED1',
      endingId: 'ending1',
      name: '《規則的影子》',
      type: 'Normal Ending',
      rawType: 'normal',
      desc: '你選擇明哲保身轉身撤退。數月後在家中看新聞時，發現自己不知何時已成為大樓 504 號房的永久住戶。'
    };
  }

  // 3. 安控中心/直面怪異時順從規約逃離 (Normal Ending 2)
  if (approach_style === 'retreat') {
    return {
      id: 'ED2',
      endingId: 'ending2',
      name: '《明哲保身》',
      type: 'Normal Ending',
      rawType: 'normal',
      desc: '你嚴格遵守表面規約逃出大樓，退回委託費並砸了招牌，終生對電梯與這起失蹤案懷抱難以磨滅的陰影。'
    };
  }

  // 4. 404 房內選擇：物理暴力砸毀打字機 (Normal Ending 7)
  if (approach_style === 'violence') {
    return {
      id: 'ED7',
      endingId: 'ending7',
      name: '《執念的輪迴》',
      type: 'Normal Ending',
      rawType: 'normal',
      desc: '暴力無法消除概念。你砸碎打字機引發了空間坍塌與因果悖論，猛然驚醒在事務所辦公桌前，手腕上赫然浮現 404 烙印。'
    };
  }

  // 5. 404 房內選擇：硬拽張浩突圍 (Normal Ending 3)
  if (approach_style === 'flee_with_target') {
    return {
      id: 'ED3',
      endingId: 'ending3',
      name: '《倉皇撤退》',
      type: 'Normal Ending',
      rawType: 'normal',
      desc: '你拽著神智不清的張浩破門狂奔。雖然成功帶回張浩，但未解開 404 本質，張浩記憶大片空白，你也留下了心理陰影。'
    };
  }

  // 6. 404 房內選擇：善念扭曲與永恆庇護 (Bad Ending 6: 無邪之惡)
  if (approach_style === 'listen' || approach_style === 'innocent_malice' || (approach_style !== 'deconstruct' && (trait === 'intuitive' || trait === 'empathetic' || trait === 'empath') && san < 50)) {
    return {
      id: 'ED6',
      endingId: 'ending6',
      name: '《無邪之惡》',
      type: 'Bad Ending',
      rawType: 'bad',
      desc: '因理智潰竭陷入認知狂亂，堅信自己是拯救一切的善良偵探，以愛與保護之名行最殘酷的囚禁與罪惡。'
    };
  }

  // 7. 終極 True Ending：集齊全部 6 件核心物證 + 成功解構 (True Ending 8)
  if (core_items_count >= 6 && is_deconstructed && san > 0) {
    return {
      id: 'ED8',
      endingId: 'ending8',
      name: '《破曉》',
      type: 'True Ending',
      rawType: 'true',
      desc: '你集齊全部 6 件核心物證並完成全維度邏輯解構！徹底瓦解了集體恐懼，歷年受困的住客全數生還現身，迎來破曉，大樓詛咒永遠終結。'
    };
  }

  // 8. 標準 True Ending：完成邏輯解構，物證未滿 6 件 (True Ending 5)
  if (is_deconstructed && san > 0) {
    return {
      id: 'ED5',
      endingId: 'ending5',
      name: '《真相大白》',
      type: 'True Ending',
      rawType: 'true',
      desc: '你以無可動搖的理性駁斥並解構 404 概念，打字機轟然炸裂，空間恢復正常，成功解救張浩並迎來黎明。'
    };
  }

  // 預設結案回傳 (預設 ED2)
  return {
    id: 'ED2',
    endingId: 'ending2',
    name: '《明哲保身》',
    type: 'Normal Ending',
    rawType: 'normal',
    desc: '你在混亂與恐懼中離開了安祥路 88 號。'
  };
}

/**
 * 輔助函式：根據玩家當前持有物品列表與狀態直接推算結局
 */
export const CORE_EVIDENCE_ITEM_IDS = [
  'old_case_file',
  'key_504',
  'shredded_letter',
  'building_blueprints',
  'guard_keycard',
  'tape_recorder'
];

export function countCoreEvidenceItems(inventory: string[]): number {
  return CORE_EVIDENCE_ITEM_IDS.filter(id => inventory.includes(id)).length;
}

export function evaluateGameEnding(params: {
  san: number;
  inventory: string[];
  isDeconstructed: boolean;
  approachStyle: EndingApproachStyle;
  trait: TraitId | string;
}): EndingCalculationResult {
  const coreCount = countCoreEvidenceItems(params.inventory);
  return checkEndingConditions({
    san: params.san,
    core_items_count: coreCount,
    is_deconstructed: params.isDeconstructed,
    approach_style: params.approachStyle,
    trait: params.trait
  });
}
