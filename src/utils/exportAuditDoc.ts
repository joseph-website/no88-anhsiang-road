/**
 * Export Case Audit & Design Specification Markdown Document
 */

export const AUDIT_SPEC_MARKDOWN = `# 《安祥路88號》案件全案卷稽核與系統設計規範手冊
**No. 88 An Hsiang Road - Complete Case Audit, Rules Matrix & System Specification**

> 文件版本：v2.4.0 (含雙輪迴架構、矛盾衝突矩陣、全結局達成指南與系統檢查碼)  
> 適用對象：案件審查員、玩家解謎覆核、程式與系統邏輯稽核

---

## 目錄
1. 專案概述與雙週目輪迴架構
2. 調查員人格特質清冊 (Traits)
3. 樓層空間與調查熱點總表 (Locations & Hotspots)
4. 全守則文件條文清冊 (Rules Documentation Registry)
5. 規則衝突與矛盾審視矩陣 (Rule Contradiction Matrix)
6. 案情假說推演系統 (Hypothesis Deduction Matrix)
7. 全物證與關鍵道具清單 (Inventory & Evidence Registry)
8. 全結局達成條件與分支路徑 (Endings & Branching Paths)
9. 四大核心子系統架構說明 (Core Subsystems)
10. 系統異常修復與安全性覆核記錄 (Audit & Fix Log)

---

## 1. 專案概述與雙週目輪迴架構
- 委託目標：私家偵探受委託調查小說家「張浩」在安祥路88號公寓大樓離奇失蹤案。
- 雙輪迴設計：
  * 第一輪 (Week 1)：救援探索線，聚焦 504 號房搜救，防劇透保護。
  * 第二輪 (Week 2)：深層真理線，解鎖 404 隱藏空間、監視器第4頻道、條文矛盾破綻審視器與 ED3~ED6 真結局。

---

## 2. 調查員人格特質清冊
- 理性主義者 (rationalist)：物理邏輯與數據紀錄，條文矛盾審視精神損耗減半。
- 超自然學者 (occultist)：民俗怪談、空間寄生，提前感知 404 空間扭曲與暗角痕跡。
- 懷疑論警探 (skeptic_cop)：擅長審問查核，識破王大偉警衛避重就輕口供。
- 心理剖繪師 (profiler)：精神恐懼剖繪，心智危機臨界時可自我剖繪冷靜自救。
- 直覺通靈者 (medium)：徘徊意念與打字機幻音高敏度，解鎖額外靈感。
- 狂熱調查員 (zealot)：不惜代價追查終極真相，破解真相碎片獲得雙倍心智回饋。

---

## 3. 樓層空間與調查熱點總表
- 1F 大廳 (loc_1f_lobby)：住戶守則、大門信箱、帶血撕裂信件。
- 1F 警衛室 (loc_1f_security)：王大偉值班台、9螢幕監視器、鑰匙箱、警衛日誌。
- 2F 長廊 (loc_2f_corridor)：滅火器箱、水錶箱、舊電路管線圖（五層樓物理配電）。
- 3F 長廊 (loc_3f_corridor)：封閉303號房、天花板檢修孔、指針逆轉掛鐘。
- 4F 隱藏夾層與 404 房 (loc_4f_hidden)：生鏽鐵門、打字機桌、柯達底片筒、錄音筆。
- 5F 長廊與 504 房 (loc_5f_corridor, loc_504_interior)：失蹤第一現場、手寫便箋、退租存根破綻。
- 502 房 (loc_502_interior)：神經質老鄰居訪談、密閉隔音窗。
- 電梯 (loc_elevator) 與 安全逃生梯 (loc_stairwell)。

---

## 4. 全守則文件條文清冊
1. 《住戶守則》(rule_resident)：聲稱大樓四層無四樓、嚴禁夜行、無紅衣服務員。
2. 《警衛守則》(rule_guard)：忽視監視手冊、嚴禁切換第四分切畫面。
3. 《電梯規約》(rule_elevator)：僅 1, 2, 3, 5 鍵、嚴禁按空白鍵、停電閉眼默念姓名。
4. 《監視指引》(rule_cctv)：五路實體線路、REBOOT-04 還原真實影像。
5. 《清潔手則》(rule_cleaner)：包含四樓共五層樓、404號房直接略過勿碰紅水。
6. 《手寫便箋》(rule_404)：規則是怪物的獵食邊界，不要遵守第三條。
7. 《避難指引》(rule_fake_evacuation)：偽造條文，引誘前往404尋求紅衣人避難。

---

## 5. 規則衝突與矛盾審視矩陣
- contra_resident_vs_cleaner：四樓客觀存在 vs 認知催眠抹除 -> 解鎖【真相碎片 #01】(穩固理智)
- contra_guard_vs_cctv：鴕鳥條款 vs 客觀電器紀錄 -> 解鎖【真相碎片 #02】(穩固理智)
- contra_fake_vs_handwritten：紅衣引導員陷阱 vs 前人血淚求生提示 -> 解鎖【真相碎片 #03】(穩固理智)
- contra_elevator_vs_blueprints：電梯無字鍵 vs 人為斷電短路簧片 -> 解鎖【真相碎片 #04】(穩固理智)
- contra_resident_vs_landlord：管委會夜行禁令 vs 深夜強行點交 -> 解鎖【真相碎片 #05】(穩固理智)

---

## 6. 全結局達成條件（含 Week 1 寫實防劇透包裝）
- Week 1 ED0 假想結案・第404號證物：勘破五樓夾壁求生信號，開啟502號房破拆隔間輕鋼石膏夾壁救出張浩，表面破案閉案，引導解鎖 Week 2 認知重構。
- Week 1 ED1 案件中止・合約撤銷（規則的影子）：面對高壓阻力選擇明哲保身，退出調查退款，呈現寫實懸案心結，遮蔽超自然同化。
- Week 1 ED2 搜查中斷・急性休克（明哲保身）：精神重壓引發急性過度換氣送醫，公會暫扣執照休養，完全隱藏404超自然怪異。
- Week 2 ED3 倉皇撤退：在404房未完成概念解構，強行拽起友人狂奔突圍，留下終生心理陰影。
- Week 2 ED4 成為新規則：理智值耗盡歸零或在對峙中屈服於認知支配，穿上紅色制服在打字機前敲出《調查員守則》。
- Week 2 ED5 真相大白：保持充足理智、出示核心物證並在404號房完成邏輯解構，怪異崩解，迎來真實破局。
- Week 2 ED6 無邪之惡：因心智防線潰竭陷入認知狂亂，堅信自己是在拯救一切的善良偵探，以保護之名行最殘酷的囚禁與罪惡。
- Week 2 ED7 執念的輪迴：在404以物理暴力手段砸毀設備引發因果悖論坍塌，回溯至事務所雨夜原點，手留404印記。
- Week 2 ED8 破曉：集齊全部6件核心物證並在404核心完成全維度邏輯解構，徹底瓦解恐懼，歷年受困者全員奇蹟生還，大樓詛咒永遠終結。

---

## 7. 系統異常修復記錄
- 修復 App.tsx currentLocId 未宣告導致之 ErrorBoundary 崩潰。
- 補齊 DetectiveNotesModal 的 inventory、obtainedRules、completedWeek1 參數。
- 實裝第一輪 (Week 1) 與第二輪 (Week 2) 軟木塞圖譜動態安全過濾。

---
*專案建置狀態：TypeScript Zero Errors / Vite Build Green*
`;

export function downloadAuditSpecMarkdown(): void {
  try {
    const blob = new Blob([AUDIT_SPEC_MARKDOWN], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CASE_AUDIT_AND_DESIGN_SPEC.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to trigger markdown download:', err);
  }
}
