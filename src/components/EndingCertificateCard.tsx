import React, { useRef, useState } from 'react';
import {
  Download,
  Shield,
  Award,
  Sparkles,
  Check,
  FileCheck,
  MapPin,
  Calendar,
  FileText,
  Fingerprint,
  UserCheck
} from 'lucide-react';
import { EndingId } from '../types';
import { ENDINGS_DATA, WEEK1_ENDINGS_DATA } from '../data/rulesData';
import { ENDING_ELECTRONIC_DOSSIERS } from '../data/endingDossiersData';
import { ENDING_EPILOGUES, WEEK1_ENDING_EPILOGUES } from '../data/epiloguesData';
import { sound } from '../services/soundEngine';

interface EndingCertificateCardProps {
  playerName: string;
  san: number;
  endingId: EndingId;
  investigationDay: number;
  investigationDateText: string;
  inventoryCount: number;
  totalInventoryCount?: number;
  obtainedRulesCount: number;
  journalLogsCount: number;
  completedWeek1?: boolean;
  onClose?: () => void;
}

export const EndingCertificateCard: React.FC<EndingCertificateCardProps> = ({
  playerName,
  san,
  endingId,
  investigationDay,
  investigationDateText,
  inventoryCount,
  totalInventoryCount = 6,
  obtainedRulesCount,
  journalLogsCount,
  completedWeek1 = false,
  onClose
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const ending = (!completedWeek1 && WEEK1_ENDINGS_DATA[endingId])
    ? WEEK1_ENDINGS_DATA[endingId]
    : (ENDINGS_DATA[endingId] || ENDINGS_DATA.ending1);
  const dossier = ENDING_ELECTRONIC_DOSSIERS[endingId] || ENDING_ELECTRONIC_DOSSIERS.ending8;
  const epilogue = (!completedWeek1 && WEEK1_ENDING_EPILOGUES[endingId])
    ? WEEK1_ENDING_EPILOGUES[endingId]
    : ENDING_EPILOGUES[endingId];

  // Non-spoiler teaser title & summary
  const getSpoilerFreeEndingTeaser = (id: EndingId) => {
    if (!completedWeek1) {
      if (id === 'ending1') {
        return {
          teaserTitle: '終局代號 I // 【合約撤銷】',
          badge: 'CASE SUSPENDED // 退出調查',
          badgeBg: 'bg-neutral-800 border-neutral-600 text-neutral-300',
          titleAward: '【謹慎撤案者】',
          teaserDesc: '審慎評估大樓現場高壓阻力後選擇終止委託並退款，保全自身安全，惟案情成未解懸案。',
          atmosphere: 'from-stone-900 via-neutral-900 to-neutral-950',
          accentColor: 'text-stone-300',
          sealColor: 'border-stone-600/90 bg-stone-900/80 text-stone-300'
        };
      }
      return {
        teaserTitle: '終局代號 II // 【急性休克】',
        badge: 'MEDICAL EVACUATION // 急性送醫',
        badgeBg: 'bg-slate-900 border-slate-600 text-slate-300',
        titleAward: '【遭遇重壓的調查員】',
        teaserDesc: '搜查途中因極度精神壓迫與換氣過度昏厥送醫，搜查受挫中止，執照暫扣審查。',
        atmosphere: 'from-slate-950/20 via-neutral-900 to-neutral-950',
        accentColor: 'text-slate-300',
        sealColor: 'border-slate-600/90 bg-slate-900/80 text-slate-300'
      };
    }
    switch (id) {
      case 'ending8':
        return {
          teaserTitle: '終局代號 VIII // 【破曉】',
          badge: '★ TRUE ENDING // 破曉',
          badgeBg: 'bg-emerald-950 border-emerald-500 text-emerald-300',
          titleAward: '【傳奇真理洞悉大師】',
          teaserDesc: '全物證鏈完整解構，以極致邏輯擊碎大樓認知遮蔽，全員奇蹟生還。',
          atmosphere: 'from-emerald-950/20 via-neutral-900 to-amber-950/20',
          accentColor: 'text-emerald-400',
          sealColor: 'border-emerald-600/90 bg-emerald-950/60 text-emerald-300'
        };
      case 'ending5':
        return {
          teaserTitle: '終局代號 V // 【真相大白】',
          badge: '★ TRUE ENDING // 真相大白',
          badgeBg: 'bg-emerald-950 border-emerald-500 text-emerald-300',
          titleAward: '【理性思維解構者】',
          teaserDesc: '洞悉404號房概念本質，瓦解恐懼支配領域，順利解救失蹤友人。',
          atmosphere: 'from-emerald-950/20 via-neutral-900 to-teal-950/20',
          accentColor: 'text-emerald-400',
          sealColor: 'border-emerald-600/90 bg-emerald-950/60 text-emerald-300'
        };
      case 'ending6':
        return {
          teaserTitle: '終局代號 VI // 【無邪之惡】',
          badge: 'SPECIAL ENDING // 無邪之惡',
          badgeBg: 'bg-rose-950 border-rose-600 text-rose-300',
          titleAward: '【善念扭曲之守護魔】',
          teaserDesc: '理智枯竭陷入狂亂，以純真無邪的助人初心，行最毛骨悚然的永恆禁錮。',
          atmosphere: 'from-rose-950/20 via-neutral-900 to-amber-950/20',
          accentColor: 'text-rose-400',
          sealColor: 'border-rose-600/90 bg-rose-950/60 text-rose-300'
        };
      case 'ending7':
        return {
          teaserTitle: '終局代號 VII // 【執念的輪迴】',
          badge: 'NORMAL ENDING // 因果終局',
          badgeBg: 'bg-purple-950 border-purple-500 text-purple-300',
          titleAward: '【因果循環記錄者】',
          teaserDesc: '因果重置坍塌，時空回溯至最初起點，手腕留下404印記，唯有記憶長存。',
          atmosphere: 'from-purple-950/20 via-neutral-900 to-neutral-950',
          accentColor: 'text-purple-400',
          sealColor: 'border-purple-600/90 bg-purple-950/60 text-purple-300'
        };
      case 'ending3':
        return {
          teaserTitle: '終局代號 III // 【倉皇撤退】',
          badge: 'NORMAL ENDING // 生還終局',
          badgeBg: 'bg-amber-950 border-amber-500 text-amber-300',
          titleAward: '【務實生存者】',
          teaserDesc: '在危急關頭果斷破門救出受困友人，成功保全員工與涉案人生命安全。',
          atmosphere: 'from-amber-950/20 via-neutral-900 to-neutral-950',
          accentColor: 'text-amber-400',
          sealColor: 'border-amber-600/90 bg-amber-950/60 text-amber-300'
        };
      case 'ending4':
        return {
          teaserTitle: '終局代號 IV // 【成為新規則】',
          badge: '⚠ BAD ENDING // 異常同化',
          badgeBg: 'bg-rose-950 border-rose-500 text-rose-300',
          titleAward: '【規約之影】',
          teaserDesc: '理性防線崩潰，意識融入大樓規則生態，穿上紅衣打出全新的守則。',
          atmosphere: 'from-rose-950/25 via-neutral-900 to-neutral-950',
          accentColor: 'text-rose-400',
          sealColor: 'border-rose-600/90 bg-rose-950/60 text-rose-300'
        };
      case 'ending2':
        return {
          teaserTitle: '終局代號 II // 【明哲保身】',
          badge: 'NORMAL ENDING // 順從撤退',
          badgeBg: 'bg-amber-950 border-amber-500 text-amber-300',
          titleAward: '【審慎倖存者】',
          teaserDesc: '直面安控異常時嚴格依循表面規約撤退，雖安然脫身，但真相永埋黑暗。',
          atmosphere: 'from-amber-950/20 via-neutral-900 to-neutral-950',
          accentColor: 'text-amber-400',
          sealColor: 'border-amber-600/90 bg-amber-950/60 text-amber-300'
        };
      case 'ending1':
      default:
        return {
          teaserTitle: '終局代號 I // 【規則的影子】',
          badge: 'NORMAL ENDING // 放棄調查',
          badgeBg: 'bg-neutral-800 border-neutral-600 text-neutral-300',
          titleAward: '【深淵凝視者】',
          teaserDesc: '於一樓大廳畏懼放棄委託離去，卻不知不覺已被大樓編入504號房住戶名冊。',
          atmosphere: 'from-neutral-900 via-neutral-900 to-neutral-950',
          accentColor: 'text-neutral-300',
          sealColor: 'border-neutral-600/90 bg-neutral-900/80 text-neutral-300'
        };
    }
  };

  const teaserInfo = getSpoilerFreeEndingTeaser(endingId);

  const handleDownloadImage = async () => {
    if (!cardRef.current || isExporting) return;
    try {
      setIsExporting(true);
      sound.playCamera();
      
      const html2canvasModule: any = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5, // Crisp high-DPI output for A4 printing/viewing
        useCORS: true,
        backgroundColor: '#0d0b08',
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeName = (playerName || 'Detective').replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_');
      link.download = `AX88_CaseReport_A4_${safeName}_${endingId}.png`;
      link.href = dataUrl;
      link.click();

      sound.playChime();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export case report image', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950/80 p-3.5 rounded-xl border border-amber-900/60">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-xs font-mono font-bold text-amber-200 block">
              【A4 官方案件結案報告書 / OFFICIAL CASE REPORT】
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              標準 1:√2 (A4) 比例・融合圖文記錄、同業評價與封存鋼印
            </span>
          </div>
        </div>

        <button
          onClick={handleDownloadImage}
          disabled={isExporting}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-bold font-serif text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-900/40 cursor-pointer disabled:opacity-60"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-neutral-950 stroke-[3]" />
              <span>報告書已成功下載 (PNG)！</span>
            </>
          ) : isExporting ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>正在渲染 A4 高解析報告...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>下載 A4 結案報告書 (PNG)</span>
            </>
          )}
        </button>
      </div>

      {/* Responsive Wrapper for A4 Display (1:1.414 ratio, 680px * 962px at base) */}
      <div className="w-full flex justify-center overflow-x-auto py-2 px-1">
        <div
          ref={cardRef}
          style={{ width: '680px', minHeight: '962px' }}
          className={`bg-gradient-to-b ${teaserInfo.atmosphere} border-2 border-[#5c3e23] rounded-xl p-8 text-neutral-200 shadow-2xl relative overflow-hidden font-serif select-none flex flex-col justify-between`}
        >
          {/* Subtle Vintage Texture & A4 Corner Crop Marks */}
          <div className="absolute inset-0 bg-[radial-gradient(#deb887_0.75px,transparent_0.75px)] [background-size:20px_20px] opacity-[0.07] pointer-events-none" />
          
          {/* Corner Precision Align Marks (公文裁切定位記號) */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-600/40 pointer-events-none" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-600/40 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-600/40 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-600/40 pointer-events-none" />

          {/* Watermark Emblem in Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-amber-500/5 flex items-center justify-center pointer-events-none">
            <Shield className="w-64 h-64 text-amber-500/[0.03]" />
          </div>

          {/* TOP SECTION: Official Header */}
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b-2 border-amber-600/50 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/70 text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[9px] font-mono tracking-widest text-amber-400/90 uppercase">
                    CITY PRIVATE INVESTIGATOR ALLIANCE • ANOMALY ARCHIVE
                  </div>
                  <div className="text-base font-bold font-serif text-amber-100 tracking-wide">
                    安祥路88號大樓怪異事件・官方案件結案報告
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-[10px] text-neutral-400">
                  檔案字號：<span className="text-amber-300 font-bold">CASE-2012-AH88-{endingId.toUpperCase()}</span>
                </div>
                <div className="text-[9px] text-neutral-500">
                  分類層級：OFFICIALLY ARCHIVED
                </div>
              </div>
            </div>

            {/* Sub-Header Dossier Tag */}
            <div className="flex items-center justify-between bg-black/40 border border-neutral-800/80 px-3 py-1.5 rounded-lg mb-4 text-[11px] font-mono">
              <div className="flex items-center gap-2 text-neutral-300">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>案件現場：安祥路88號大樓 (101~505 / 404空間)</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400/90">
                <Calendar className="w-3.5 h-3.5" />
                <span>結案日期：{investigationDateText}</span>
              </div>
            </div>

            {/* Investigator Credentials & Case Metrics Grid (雙欄圖文) */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono">
              {/* Left Box: Investigator Info */}
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-[#3d2714] space-y-2">
                <div className="text-[10px] text-neutral-400 border-b border-neutral-800 pb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    主辦調查員登錄資料
                  </span>
                  <span className="text-amber-400 font-bold">【執業中】</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">調查員姓名：</span>
                  <span className="text-sm font-bold text-neutral-100 font-serif">{playerName || '調查員'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">結案心理狀態：</span>
                  <span className="text-xs font-bold text-neutral-200 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${san >= 50 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {san >= 70 ? '理智尚存・冷靜' : san >= 40 ? '意志緊繃・疲憊' : '精神重創・動盪'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">歷時探查天數：</span>
                  <span className="text-xs font-bold text-amber-300 font-serif">第 {investigationDay} 天完成結案</span>
                </div>
              </div>

              {/* Right Box: Evidence Metrics */}
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-[#3d2714] space-y-2">
                <div className="text-[10px] text-neutral-400 border-b border-neutral-800 pb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                    現場鑑識與物證鏈
                  </span>
                  <span className="text-emerald-400 font-bold">{Math.round((inventoryCount / totalInventoryCount) * 100)}% 完備</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">關鍵物證持有：</span>
                  <span className="text-xs font-bold text-emerald-300">{inventoryCount} / {totalInventoryCount} 件</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">規約矛盾解析：</span>
                  <span className="text-xs font-bold text-amber-300">{obtainedRulesCount} 份公約對照</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 text-[11px]">現場行動軌跡：</span>
                  <span className="text-xs font-bold text-indigo-300">{journalLogsCount} 條日誌條目</span>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION: Case Outcome & Visual Clue Map (案件終局評定與圖文紀錄) */}
          <div className="relative z-10 space-y-3.5 my-1">
            {/* Ending Title Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/70 via-neutral-900/90 to-amber-950/70 border border-amber-500/70 relative">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${teaserInfo.badgeBg}`}>
                  {teaserInfo.badge}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {teaserInfo.teaserTitle}
                </span>
              </div>
              <div className="text-xs text-neutral-300 font-serif leading-relaxed pl-2.5 border-l-2 border-amber-500/60 mt-1">
                {teaserInfo.teaserDesc}
              </div>
            </div>

            {/* Peer Evaluation (私家偵探公會・調查紀律審核意見) */}
            {epilogue && (
              <div className="p-4 rounded-xl bg-neutral-900/95 border border-amber-500/60 relative shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold font-serif text-amber-200">
                      私家偵探同業公會・調查紀律審核意見 (PEER EVALUATION)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/90 border border-amber-700/80 text-amber-300 font-bold">
                    【{epilogue.peerReview.summaryTag}】
                  </span>
                </div>

                <div className="text-xs text-neutral-200 font-serif leading-relaxed pl-3 border-l-2 border-amber-500 bg-black/40 p-2.5 rounded-r-lg">
                  <span className="text-amber-400 font-bold block mb-0.5 text-[11px] font-mono">
                    ★ 同業評議核心結論：
                  </span>
                  「{epilogue.peerReview.comment}」
                </div>
              </div>
            )}

            {/* Investigator's Closing Verdict (承辦人結案親筆手記) */}
            <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
              <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-amber-300 font-bold">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>【承辦人結案備忘錄與心智反思】</span>
              </div>
              <p className="text-xs text-neutral-300 font-serif italic leading-relaxed pl-2.5 border-l-2 border-neutral-700">
                {dossier.detectiveOfficialVerdict}
              </p>
            </div>
          </div>

          {/* BOTTOM SECTION: Official Seals, Archive Stamp & Signatures */}
          <div className="relative z-10 pt-4 border-t-2 border-amber-600/40 flex items-end justify-between">
            <div className="space-y-1 text-[10px] font-mono text-neutral-400">
              <div>認證機構：私家偵探同業公會 • 異常事件調查檔案庫</div>
              <div>檔案編碼：ARCHIVE-ARG-2012 • {epilogue?.archiveSealCode || 'AX88-ARCHIVE'}</div>
              <div className="text-neutral-500 text-[9px]">
                ★ 本文件已完成法律鑑識與心理狀態存檔，符合調查倫理規約。
              </div>
            </div>

            {/* Red Retro Stamp Seal Mark */}
            <div className="flex items-center gap-3">
              <div className={`border-2 rounded-xl px-4 py-1.5 text-center rotate-[-3deg] shadow-lg ${teaserInfo.sealColor}`}>
                <div className="text-[11px] font-mono font-bold tracking-widest uppercase">
                  【{epilogue?.sealText || '檔案封存'}】
                </div>
                <div className="text-[8px] font-mono tracking-wider opacity-85">
                  OFFICIALLY ARCHIVED
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
