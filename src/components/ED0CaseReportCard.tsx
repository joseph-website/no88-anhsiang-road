import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Download,
  ArrowRight
} from 'lucide-react';
import { sound } from '../services/soundEngine';

interface ED0CaseReportCardProps {
  playerName: string;
  investigationDay: number;
  investigationDateText: string;
  onProceedToTransition: () => void;
}

export const ED0CaseReportCard: React.FC<ED0CaseReportCardProps> = ({
  playerName,
  investigationDay,
  investigationDateText,
  onProceedToTransition
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPNG = async () => {
    if (!reportRef.current) return;
    try {
      setIsExporting(true);
      sound.playClick();
      const html2canvasModule: any = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f5efe0',
        logging: false
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `ED0_結案報告_第404號證物_${playerName || '林偵探'}.png`;
      link.click();
      
      setExportSuccess(true);
      sound.playResolutionChord();
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to export ED0 report:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-serif">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="max-w-2xl w-full flex flex-col items-center space-y-4 my-auto"
      >
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between text-neutral-300 text-xs px-2">
          <div className="flex items-center gap-2 text-emerald-400 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-bold tracking-wider">OFFICIAL CASE CLOSURE // WEEK 1 COMPLETED</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-neutral-200 flex items-center gap-1 text-xs cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? '匯出中...' : '匯出結案報告'}</span>
            </button>
          </div>
        </div>

        {/* A4 Report Sheet Container (A4 Ratio: 1:1.414) */}
        <div
          ref={reportRef}
          className="w-full bg-[#fbf7ee] text-[#1c1815] p-6 sm:p-10 rounded-xl shadow-2xl border-2 border-[#d5c7b0] relative select-text"
          style={{ minHeight: '620px' }}
        >
          {/* Subtle Paper Texture Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#dcd1be_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none rounded-xl" />

          {/* Official Seal / Stamp */}
          <div className="absolute top-6 right-6 sm:top-10 sm:right-10 border-4 border-emerald-800/80 text-emerald-900 px-3 py-1.5 rounded-lg font-mono font-black text-xs sm:text-sm tracking-widest uppercase rotate-[-6deg] pointer-events-none select-none shadow-sm">
            ✓ 偵結銷案・正式閉案
          </div>

          {/* Report Header */}
          <div className="border-b-2 border-[#1c1815] pb-4 mb-5 text-center relative">
            <div className="text-[10px] font-mono tracking-widest text-[#7a6f62] uppercase mb-1">
              CITY PRIVATE INVESTIGATION DIVISION // OFFICIAL CASE REPORT
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-[#1c1815]">
              【ED0 結案報告：第404號證物】
            </h1>
            <div className="text-xs sm:text-sm font-bold text-[#5c4a35] mt-1">
              失蹤人口尋獲・精神官能症救護・案件全權終結
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#ede4d1]/80 border border-[#d6c7af] p-3 rounded-lg text-xs font-mono mb-5">
            <div>
              <span className="text-[#877867] block text-[10px]">案件編號：</span>
              <span className="font-bold text-[#1c1815]">AN-98404-FIN</span>
            </div>
            <div>
              <span className="text-[#877867] block text-[10px]">承辦偵探：</span>
              <span className="font-bold text-[#1c1815]">{playerName || '林偵探'}</span>
            </div>
            <div>
              <span className="text-[#877867] block text-[10px]">現勘地點：</span>
              <span className="font-bold text-[#1c1815]">安祥路88號504室</span>
            </div>
            <div>
              <span className="text-[#877867] block text-[10px]">辦案耗時：</span>
              <span className="font-bold text-emerald-800">1 天</span>
            </div>
          </div>

          {/* Detective Scientific Deductions */}
          <div className="space-y-4 text-xs sm:text-sm font-serif leading-relaxed text-[#2d2722]">
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-[#1c1815] border-b border-[#d8cbbb] pb-1 flex items-center gap-1.5">
                <span>一、 案件調查始末與科學推論：</span>
              </h3>
              <p className="indent-6 text-justify">
                本事務所接受委託人委請，前往安祥路 88 號調查失聯之室內設計師好友<b>「張浩」</b>。經現場查證與勘驗，大樓警衛之閃爍其詞純屬老舊公寓管理常見之怠惰與懼怕糾紛；電梯無 4 樓按鍵為台灣民間傳統避諱習俗與建商施工疏漏；走廊聽聞之打字聲，實為張浩在房內焦慮使用電腦之環境音。
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-[#1c1815] border-b border-[#d8cbbb] pb-1 flex items-center gap-1.5">
                <span>二、 人員尋獲與救助結果：</span>
              </h3>
              <p className="indent-6 text-justify">
                偵探勘驗完 504 號房返回一樓大廳時，敏銳捕捉到五樓住戶向值班警衛抱怨「隔壁牆壁有老鼠發出西西酥酥抓撓怪聲」之異狀，當即警覺受困人員呼救徵兆，要求警衛開啟原本上鎖之 502 號房。經開鎖入內仔細勘驗，於相鄰隔間牆上發現異常細長裂痕，往內探索赫然照射到受困夾層之張浩。偵探果斷破拆石膏隔牆，順利救出嚴重脫水、十指抓撓滲血之張浩。經通報 119 與 110 警消救護送醫，張浩已脫離生理危險。
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-[#1c1815] border-b border-[#d8cbbb] pb-1 flex items-center gap-1.5">
                <span>三、 結案結論與同業評定：</span>
              </h3>
              <p className="indent-6 text-justify">
                本案因察覺住戶抱怨背後的異常而順利尋回失蹤者，並已與地方分局完成檔案交接工作。本次的「失蹤案件」正式結案。
              </p>
            </div>
          </div>

          {/* Bottom Signatures & Seal */}
          <div className="mt-8 pt-4 border-t-2 border-[#1c1815] flex items-end justify-between text-xs font-mono">
            <div className="space-y-1">
              <div className="text-[10px] text-[#7a6f62]">承辦偵探署名：</div>
              <div className="font-bold text-sm font-serif text-[#1c1815] tracking-widest underline decoration-wavy decoration-[#a88f72]">
                {playerName || '林偵探'}
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-[10px] text-[#7a6f62]">結案日期：</div>
              <div className="font-bold text-[#1c1815]">{investigationDateText || '2012/11/04'}</div>
            </div>
          </div>
        </div>

        {/* Action Button to trigger Meta Transition */}
        <div className="w-full flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onProceedToTransition();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-neutral-950 font-bold text-xs sm:text-sm font-serif tracking-wider shadow-xl shadow-amber-950/60 border border-amber-400 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>確認結案報告・檢視後續追蹤</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
