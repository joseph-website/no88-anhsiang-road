import { TraitId } from '../types';

export interface InvestigatorTrait {
  id: TraitId;
  name: string;             // 細心, 敏銳, 勇敢, 慎重, 理性, 直覺
  title: string;
  tagline: string;
  description: string;
  sanGlitchMultiplier: number;     // Multiplier for supernatural/glitch damage
  sanLogicBonus: number;           // Bonus recovery for solving puzzles/analyzing clues
  safeZoneRecovery: number;        // Recovery in safe areas (like guard room or water)
  flavorQuote: string;
  attributeColor: string;          // Hex / Tailwind color for Hexagon radar
}

export const SIX_ATTRIBUTES: { id: TraitId; name: string; shortDesc: string; color: string }[] = [
  { id: 'deconstructor', name: '細心', shortDesc: '明察秋毫，抽絲剝繭發現微小破綻與系統盲點', color: '#06b6d4' }, // Cyan
  { id: 'empath', name: '敏銳', shortDesc: '洞察動機，捕捉人事物微弱異樣與心態變化', color: '#ec4899' },        // Pink/Rose
  { id: 'pragmatist', name: '勇敢', shortDesc: '行事果決，在危局中敢於破局與直面未知', color: '#f97316' },     // Orange
  { id: 'cautious', name: '慎重', shortDesc: '未雨綢繆，防範未知風險並備妥周全退路', color: '#10b981' },       // Emerald
  { id: 'rationalist', name: '理性', shortDesc: '恪守邏輯，以客觀因果與實質鐵證推演真相', color: '#3b82f6' },   // Blue
  { id: 'intuitive', name: '直覺', shortDesc: '靈感直覺，第六感預警危險與破案關鍵契機', color: '#a855f7' }     // Purple
];

export const UNKNOWN_TRAIT_PLACEHOLDER: InvestigatorTrait = {
  id: 'rationalist',
  name: '？？？',
  title: '未知思維傾向',
  tagline: '「在正式受理委託並完成思維整理前，你的調查性格特質尚未定型。」',
  description: '你的思維模式與辦案習慣仍在整合中。完成事務所的勘查準備後，將依據你的直覺與決策推導出核心特質。',
  sanGlitchMultiplier: 1.0,
  sanLogicBonus: 5,
  safeZoneRecovery: 3,
  flavorQuote: '在踏入迷局之前，沒有人能真正看清自己的底牌。',
  attributeColor: '#737373'
};

export const INVESTIGATOR_TRAITS: Record<TraitId, InvestigatorTrait> = {
  deconstructor: {
    id: 'deconstructor',
    name: '細心',
    title: '細微洞察者',
    tagline: '「最不起眼的文字遺漏與時間矛盾，往往就是通往真相的破局點。」',
    description: '具備極為專注的觀察力與系統分析思維，擅長於雜亂的檔案與規約中抽絲剝繭，找出人為構建的漏洞。面對心理威嚇時極為冷靜。',
    sanGlitchMultiplier: 0.75,
    sanLogicBonus: 10,
    safeZoneRecovery: 4,
    flavorQuote: '魔鬼藏在細節裡；只要記錄存在，就必有破綻可尋。',
    attributeColor: '#06b6d4'
  },
  empath: {
    id: 'empath',
    name: '敏銳',
    title: '洞察側寫師',
    tagline: '「我能察覺到那些遺留在環境裡的隱蔽情緒與微弱異樣。」',
    description: '對周遭環境與人心變化擁有超群的感知力，能迅速洞察他人的真實心境與動機，在面對心理壓迫時具備極高的調適彈性。',
    sanGlitchMultiplier: 0.65,
    sanLogicBonus: 4,
    safeZoneRecovery: 3,
    flavorQuote: '現場的每一處細節，都在無聲訴說著當事人當時的掙扎。',
    attributeColor: '#ec4899'
  },
  pragmatist: {
    id: 'pragmatist',
    name: '勇敢',
    title: '現場實踐派',
    tagline: '「與其坐在椅子上猜測，不如直接推開那扇門。」',
    description: '膽識過人，雷厲風行。在危急時刻與突發對抗中擁有極高的心理韌性，每次主動探索新區域均能激發昂揚鬥志。',
    sanGlitchMultiplier: 0.85,
    sanLogicBonus: 5,
    safeZoneRecovery: 2,
    flavorQuote: '沒有什麼謎題是一把撬棍或一次果斷的實地勘查解決不了的。',
    attributeColor: '#f97316'
  },
  cautious: {
    id: 'cautious',
    name: '慎重',
    title: '生還防禦者',
    tagline: '「活著結案的偵探，才是好偵探。」',
    description: '隨時保持最高戒備，嚴格審查周遭環境。在安全區域（如警衛室、明亮處）時能顯著平復心律恢復精神，善於規避致命風險。',
    sanGlitchMultiplier: 1.1,
    sanLogicBonus: 3,
    safeZoneRecovery: 6,
    flavorQuote: '永遠給自己留好退路，不要輕信任何未經確認的指引。',
    attributeColor: '#10b981'
  },
  rationalist: {
    id: 'rationalist',
    name: '理性',
    title: '邏輯懷疑論者',
    tagline: '「任何看似離奇的表象，背後都有其物理規律與心理動機。」',
    description: '擅長以冷靜客觀的邏輯剖析矛盾。破解謎題與整理關鍵線索時能迅速平復心神，堅定不移地追尋因果關係。',
    sanGlitchMultiplier: 1.2,
    sanLogicBonus: 8,
    safeZoneRecovery: 2,
    flavorQuote: '只要找出背後的物理依據與利益動機，所謂的流言便不攻自破。',
    attributeColor: '#3b82f6'
  },
  intuitive: {
    id: 'intuitive',
    name: '直覺',
    title: '直覺靈感派',
    tagline: '「有時候，皮膚泛起的雞皮疙瘩與第六感，比任何肉眼所見更早預告真相與危險。」',
    description: '具備極為敏銳的「第六感」天賦。在探索大樓時，面對異常壓迫或即將發現關鍵線索前，能提前感應並獲得直覺預警。',
    sanGlitchMultiplier: 1.3,
    sanLogicBonus: 6,
    safeZoneRecovery: 3,
    flavorQuote: '空氣中的溫度忽然降了下來……這扇門後面藏著某種呼喚著我的秘密。',
    attributeColor: '#a855f7'
  }
};
