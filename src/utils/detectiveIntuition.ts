/**
 * Detective Intuition Clues Engine
 * 提供隱晦的偵探直覺線索與矛盾提示（僅限重大線索與核心矛盾，避免資訊過載）
 */

export interface IntuitionHint {
  type: 'contradiction' | 'correlation' | 'memory';
  text: string;
}

/**
 * 根據對話/調查文字與玩家當前持有的守則、證物，僅在重要節點產生隱晦的直覺聯想
 */
export function getDetectiveIntuition(
  text: string,
  obtainedRules: string[] = [],
  inventory: string[] = [],
  completedWeek1: boolean = false
): IntuitionHint | null {
  if (!text) return null;
  const content = text.toLowerCase();

  // 1. 核心守則矛盾提示 (High Importance Contradictions) - 僅在二周目大樓怪異規則覺醒後啟用，一周目常規探案不聯想規則
  if (completedWeek1) {
    // 紅衣人影與守則衝突
    if (
      (content.includes('紅衣') || content.includes('紅色外套') || content.includes('紅外套') || content.includes('非白衣')) &&
      (obtainedRules.includes('rule_resident') || obtainedRules.includes('rule_guard') || obtainedRules.includes('rule_cleaner'))
    ) {
      return {
        type: 'contradiction',
        text: '對方的裝束似乎與手頭上的某份管理守則存在嚴重衝突……'
      };
    }

    // 走樓梯/電梯動線誘餌衝突
    if (
      (content.includes('走樓梯') || content.includes('電梯故障') || content.includes('電梯檢修') || content.includes('空白按鈕')) &&
      obtainedRules.includes('rule_resident')
    ) {
      return {
        type: 'contradiction',
        text: '對方的引導似乎抵觸了某份管理守則的明確規範……'
      };
    }

    // 四樓不存在 vs 圖紙/監視器/便條
    if (
      (content.includes('沒有四樓') || content.includes('只有四層') || content.includes('只有4層') || content.includes('水泥板封住')) &&
      (obtainedRules.includes('rule_cctv') || obtainedRules.includes('rule_handwritten') || inventory.includes('building_blueprints'))
    ) {
      return {
        type: 'contradiction',
        text: '眼前所見與手邊獲得的某份客觀資料存在根本性的分歧……'
      };
    }
  }

  // 2. 關鍵物證與深層怪異關聯 (Key Evidence Correlations)
  // 信件與張浩求救
  if (
    (content.includes('碎紙') || content.includes('剪碎') || content.includes('信封') || content.includes('求救信')) &&
    inventory.includes('shredded_letter')
  ) {
    return {
      type: 'correlation',
      text: '這處痕跡好像跟隨身攜帶的某件信件證物有所關聯……'
    };
  }

  // 建築格局與違建公文
  if (
    (content.includes('隔間') || content.includes('梁柱') || content.includes('違建') || content.includes('原始設計') || content.includes('遮蔽')) &&
    inventory.includes('building_blueprints')
  ) {
    return {
      type: 'correlation',
      text: '現場的空間格局似乎能與手邊的某份圖紙資料互相印證……'
    };
  }

  // 錄音筆與打字機低語
  if (
    (content.includes('打字機') || content.includes('規則吃人') || content.includes('同化') || content.includes('紙條淹沒')) &&
    inventory.includes('tape_recorder')
  ) {
    return {
      type: 'memory',
      text: '耳邊隱約聯想到某段錄音裝置中截獲的詭異音訊……'
    };
  }

  return null;
}

export interface SixthSenseHint {
  type: 'danger' | 'clue';
  text: string;
}

/**
 * 直覺派偵探（intuitive）專屬第六感預警與洞察
 */
export function getSixthSensePremonition(
  hotspot: { name: string; inspectText: string; actions?: Array<{ sanDelta?: number; obtainItemId?: string; obtainRuleId?: string; isHazardous?: boolean }> },
  playerTrait: string,
  completedWeek1: boolean = false
): SixthSenseHint | null {
  if (playerTrait !== 'intuitive') return null;

  const actions = hotspot.actions || [];
  const hasSanHazard = actions.some(a => typeof a.sanDelta === 'number' && a.sanDelta < 0) || 
    hotspot.inspectText.includes('精神') || 
    hotspot.inspectText.includes('紅色') || 
    hotspot.inspectText.includes('同化');

  if (hasSanHazard) {
    return {
      type: 'danger',
      text: '【第六感預警・精神污染】：後頸泛起一陣刺骨的寒意，心跳如擂鼓般驟緊。直覺在強烈示警：此處潛藏著深層的精神污染與認知干擾，你的心理狀態將面臨劇烈波動！'
    };
  }

  const hasKeyClue = actions.some(a => a.obtainItemId || a.obtainRuleId) || 
    hotspot.inspectText.includes('暗格') || 
    hotspot.inspectText.includes('公文') || 
    hotspot.inspectText.includes('藍圖') || 
    hotspot.inspectText.includes('鑰匙');

  if (hasKeyClue) {
    return {
      type: 'clue',
      text: completedWeek1
        ? '【第六感洞察・關鍵線索】：靈感如電流般劃過腦海，視線被強烈牽引——直覺預示著此處正沉睡著揭開大樓真相、顛覆偽造守則的關鍵線索物證！'
        : '【第六感洞察・關鍵線索】：靈感如電流般劃過腦海，視線被強烈牽引——直覺預示著此處正沉睡著揭開失蹤案真相的關鍵線索物證！'
    };
  }

  return null;
}

