import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  X,
  FileText,
  Stamp,
  RotateCcw,
  ArrowRight,
  Eye,
  CheckCircle2,
  Fingerprint,
  ZoomIn,
  Image as ImageIcon,
  BookOpen
} from 'lucide-react';
import { sound } from '../services/soundEngine';
import handwrittenRulesImg from '../assets/images/handwritten_rules_paper_1788704097666.jpg';

export interface VintageEnvelopeData {
  id: string;
  title: string;
  sender?: string;
  recipient?: string;
  postmarkDate?: string;
  postmarkLocation?: string;
  envelopeType?: 'airmail' | 'manila' | 'confidential' | 'police';
  sealType?: 'wax_red' | 'wax_gold' | 'string_tie' | 'tape';
  classificationBadge?: string;
  deliveryNote?: string;
  letterContent: {
    header?: string;
    subHeader?: string;
    lines: string[];
    marginNote?: string;
    postscript?: string;
    footer?: string;
    hasFutureWatermark?: boolean;
    polaroidUrl?: string;
    polaroidCaption?: string;
    specialWarning?: string;
    documentImageUrl?: string;
    documentImageAlt?: string;
    isHandwrittenNote?: boolean;
  };
  actionButtonText?: string;
  onActionClick?: () => void;
  secondaryActionText?: string;
  onSecondaryActionClick?: () => void;
}

interface VintageEnvelopeModalProps {
  envelope: VintageEnvelopeData;
  onClose: () => void;
  onFinishedOpening?: () => void;
}

type EnvelopePhase = 'sealed' | 'unsealing' | 'extracting' | 'unfolded';

export const VintageEnvelopeModal: React.FC<VintageEnvelopeModalProps> = ({
  envelope,
  onClose,
  onFinishedOpening
}) => {
  const [phase, setPhase] = useState<EnvelopePhase>('sealed');
  const [isFlapOpen, setIsFlapOpen] = useState(false);
  const [letterRevealed, setLetterRevealed] = useState(false);
  const [viewMode, setViewMode] = useState<'photo' | 'transcript'>('photo');
  const [isImageZoomed, setIsImageZoomed] = useState<boolean>(false);

  // Determine if this envelope has a real handwritten document image
  const resolvedDocumentImage = envelope.letterContent.documentImageUrl || 
    (envelope.id === 'rule_handwritten' ? handwrittenRulesImg : undefined);
  const isHandwrittenRule = envelope.id === 'rule_handwritten' || Boolean(envelope.letterContent.isHandwrittenNote);

  // Play initial paper rustle when envelope appears
  useEffect(() => {
    sound.playPaper();
  }, []);

  const handleStartUnseal = () => {
    if (phase !== 'sealed') return;
    
    // Step 1: Break seal and flip flap open
    sound.playPaper();
    setPhase('unsealing');
    setIsFlapOpen(true);

    // Step 2: Letter slides up out of envelope pocket
    setTimeout(() => {
      sound.playPaper();
      setPhase('extracting');
    }, 600);

    // Step 3: Letter expands and unfolds into full reading view
    setTimeout(() => {
      sound.playResolutionChord();
      setPhase('unfolded');
      setLetterRevealed(true);
      onFinishedOpening?.();
    }, 1300);
  };

  const handleFastSkip = () => {
    sound.playPaper();
    setIsFlapOpen(true);
    setPhase('unfolded');
    setLetterRevealed(true);
    onFinishedOpening?.();
  };

  const handleReFold = () => {
    sound.playPaper();
    setPhase('sealed');
    setIsFlapOpen(false);
    setLetterRevealed(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-1.5 sm:p-3 md:p-6 select-none overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="relative w-full max-w-4xl min-h-0 max-h-[96dvh] flex flex-col items-center justify-center p-1 sm:p-3 md:p-4 my-auto"
      >
        {/* Top Control Bar */}
        <div className="w-full max-w-2xl flex items-center justify-between pb-3 text-xs text-[#a88f72] font-typewriter z-20">
          <div className="flex items-center gap-2">
            <span className="stamp-confidential text-[10px]">
              {envelope.classificationBadge || 'PHYSICAL CLUE // 1998 ARCHIVE'}
            </span>
            <span className="text-[#8c745a]">•</span>
            <span className="text-[#d4a359]">{envelope.title}</span>
          </div>

          <div className="flex items-center gap-3">
            {phase === 'sealed' && (
              <button
                onClick={handleFastSkip}
                className="text-[11px] text-[#9c846a] hover:text-[#fae0a5] underline underline-offset-4 transition-colors"
              >
                直接展開內容 ⏩
              </button>
            )}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-[#2b1b11] hover:bg-[#3d2919] text-[#9c846a] hover:text-[#f5ebd7] border border-[#4d321d] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="關閉"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Stage: Envelope vs Unfolded Letter */}
        <div className="w-full flex items-center justify-center relative min-h-[480px]">
          <AnimatePresence mode="wait">
            {phase !== 'unfolded' ? (
              /* ================= 1. THE VINTAGE ENVELOPE (SEALED / OPENING) ================= */
              <motion.div
                key="envelope-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-xl flex flex-col items-center"
              >
                {/* 3D Envelope Container */}
                <div 
                  onClick={phase === 'sealed' ? handleStartUnseal : undefined}
                  className={`relative w-full aspect-[16/10] max-w-[500px] rounded-lg shadow-2xl transition-all duration-300 ${
                    phase === 'sealed' ? 'cursor-pointer hover:scale-[1.02] group' : ''
                  }`}
                  style={{
                    backgroundColor: '#2b1b10',
                    backgroundImage: `
                      radial-gradient(circle at 10% 20%, rgba(90, 60, 30, 0.4) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(50, 30, 15, 0.6) 0%, transparent 40%),
                      linear-gradient(135deg, #3d2716 0%, #28180e 50%, #1c1109 100%)
                    `,
                    border: '2px solid #5a3c22',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  {/* Airmail Border (Diagonal Red & Deep Blue Stripes) */}
                  <div 
                    className="absolute inset-2 pointer-events-none rounded border border-[#6b4728]/40 overflow-hidden opacity-60"
                    style={{
                      backgroundImage: `repeating-linear-gradient(135deg, #9e3232 0, #9e3232 10px, transparent 10px, transparent 18px, #324c7e 18px, #324c7e 28px, transparent 28px, transparent 36px)`,
                      backgroundSize: '100% 4px',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'top, bottom',
                    }}
                  />

                  {/* Envelope Body Graphics: Fold lines & seams */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Bottom triangular seam */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 border-t border-[#4a2e18]/80 bg-gradient-to-t from-[#1b1008]/40 to-transparent" />
                    {/* Left & Right diagonal seam shadows */}
                    <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-[#170e07]/50 to-transparent" />
                    <div className="absolute top-0 bottom-0 right-0 w-1/3 bg-gradient-to-l from-[#170e07]/50 to-transparent" />
                  </div>

                  {/* Postage Stamp on Top Right */}
                  <div className="absolute top-5 right-5 w-16 h-20 bg-[#f0e6d2] border-2 border-dashed border-[#8c745a] p-1.5 shadow-md rotate-2 flex flex-col justify-between items-center text-[#2b1b11] select-none">
                    <div className="w-full flex justify-between text-[8px] font-mono font-bold">
                      <span>POST</span>
                      <span>1998</span>
                    </div>
                    <Fingerprint className="w-7 h-7 text-[#735d49] opacity-80" />
                    <div className="text-[7px] font-typewriter font-bold tracking-tighter text-center">
                      404 SPECIAL
                    </div>
                    {/* Circular Postmark Cancellation Ink Stamp */}
                    <div className="absolute -top-2 -left-4 w-14 h-14 rounded-full border-2 border-[#8c2a2a]/80 text-[#8c2a2a] text-[8px] font-mono flex flex-col items-center justify-center opacity-85 rotate-[-15deg] pointer-events-none">
                      <span>{envelope.postmarkLocation || 'CITY POST'}</span>
                      <span className="font-bold text-[7px]">{envelope.postmarkDate || '98.11.04'}</span>
                      <div className="w-8 h-[1px] bg-[#8c2a2a]/80 my-0.5" />
                      <span className="text-[6px]">POSTED</span>
                    </div>
                  </div>

                  {/* Envelope Address & Information */}
                  <div className="absolute top-8 left-8 right-24 bottom-6 flex flex-col justify-between pointer-events-none">
                    {/* Sender field (Top left) */}
                    <div className="text-[11px] font-typewriter text-[#a88f72] leading-tight space-y-0.5">
                      <div className="text-[9px] text-[#735d49] font-mono uppercase tracking-wider">
                        SENDER / 寄件人：
                      </div>
                      <div className="font-bold text-[#e5dac6]">
                        {envelope.sender || '安祥路88號 404室 (張浩 留)'}
                      </div>
                      <div className="text-[10px] text-[#8c745a]">
                        TEL: (02) 2381-4040
                      </div>
                    </div>

                    {/* Recipient field (Center) */}
                    <div className="my-auto pl-6 border-l-2 border-[#8c6743]/50 space-y-1">
                      <div className="text-[9px] text-[#8c6743] font-mono uppercase tracking-wider">
                        DELIVER TO / 收件人：
                      </div>
                      <div className="text-base sm:text-lg font-bold font-serif text-[#f5ebd7] tracking-wider">
                        {envelope.recipient || '調查員 鈞啟 (URGENT)'}
                      </div>
                      <div className="text-xs text-[#a88f72] font-typewriter">
                        {envelope.deliveryNote || '【密】限時雙掛號'}
                      </div>
                    </div>

                    {/* Confidential Classification Stamp */}
                    <div className="flex items-center justify-between">
                      <span className="stamp-classified text-[10px]">
                        CONFIDENTIAL // CLASSIFIED
                      </span>
                      <span className="text-[9px] font-typewriter text-[#735d49]">
                        REF: #TR-98404-E
                      </span>
                    </div>
                  </div>

                  {/* Interactive Wax Seal / Flap Pivot */}
                  <div className="absolute top-0 left-0 right-0 h-28 flex items-start justify-center overflow-visible">
                    {/* Top Triangle Flap */}
                    <motion.div
                      initial={false}
                      animate={{
                        rotateX: isFlapOpen ? -180 : 0,
                        transformOrigin: 'top center',
                      }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="w-full h-full relative"
                    >
                      {/* Flap SVG Shape */}
                      <svg 
                        viewBox="0 0 500 140" 
                        className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]"
                        preserveAspectRatio="none"
                      >
                        <polygon 
                          points="0,0 500,0 250,135" 
                          fill="#362214" 
                          stroke="#5a3c22" 
                          strokeWidth="2"
                        />
                        <polygon 
                          points="10,2 490,2 250,130" 
                          fill="#2b1b10" 
                          opacity="0.9"
                        />
                      </svg>

                      {/* Wax Seal at the Flap Tip */}
                      {!isFlapOpen && (
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-[#9e2a2b] via-[#7d1d1e] to-[#470f10] border-2 border-[#b84243] shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center text-[#ffccd5] group-hover:scale-110 transition-transform">
                          <div className="w-10 h-10 rounded-full border border-[#b84243]/70 flex items-center justify-center font-serif font-black text-xs tracking-tighter text-center leading-none text-[#ffdfe3]">
                            404<br/><span className="text-[7px] font-mono">SEAL</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Peeking Letter Sheet inside during unsealing phase */}
                  <AnimatePresence>
                    {phase === 'extracting' && (
                      <motion.div
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: -70, opacity: 1 }}
                        exit={{ y: -120, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute left-6 right-6 top-4 h-32 bg-[#f4ecd9] border border-[#a89074] rounded shadow-lg p-3 text-[#2b1b10] font-typewriter text-xs pointer-events-none"
                      >
                        <div className="w-full h-1 bg-[#8c2a2a]/60 mb-2" />
                        <div className="w-3/4 h-2 bg-[#d4c5ab] mb-1.5" />
                        <div className="w-5/6 h-2 bg-[#d4c5ab] mb-1.5" />
                        <div className="w-2/3 h-2 bg-[#d4c5ab]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Prompt Button below Envelope */}
                {phase === 'sealed' && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleStartUnseal}
                    className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#b07d3b] via-[#d4a359] to-[#b07d3b] text-[#1a120b] font-serif font-bold text-sm shadow-xl flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all group"
                  >
                    <Mail className="w-4 h-4 text-[#1a120b] group-hover:rotate-12 transition-transform" />
                    <span>拆啟信封・檢驗物證</span>
                    <ArrowRight className="w-4 h-4 text-[#1a120b] group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                )}

                {phase === 'unsealing' && (
                  <div className="mt-6 text-xs text-[#d4a359] font-typewriter flex items-center gap-2 animate-pulse">
                    <span>正在拆開封蠟與信封折頁……</span>
                  </div>
                )}

                {phase === 'extracting' && (
                  <div className="mt-6 text-xs text-[#fae0a5] font-typewriter flex items-center gap-2 animate-bounce">
                    <span>抽出信紙展開中……</span>
                  </div>
                )}
              </motion.div>
            ) : (
              /* ================= 2. THE UNFOLDED RETRO PARCHMENT LETTER ================= */
              <motion.div
                key="letter-view"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-2xl bg-[#f7efe1] text-[#24170d] rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 relative border-2 border-[#b89f7d] select-text overflow-hidden my-auto max-h-[86dvh] flex flex-col"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 15% 20%, rgba(180, 140, 90, 0.15) 0%, transparent 40%),
                    radial-gradient(circle at 85% 80%, rgba(140, 100, 60, 0.2) 0%, transparent 50%),
                    linear-gradient(180deg, #fbf7ee 0%, #f4e9d5 100%)
                  `,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 40px rgba(160, 120, 70, 0.2)'
                }}
              >
                {/* Vintage Paper Creases Effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Horizontal tri-fold crease shadows */}
                  <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a89074]/40 to-transparent" />
                  <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a89074]/40 to-transparent" />
                  {/* Vertical fold line */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-[#a89074]/30 to-transparent" />
                </div>

                {/* Future / Anomaly Watermark Overlay (if applicable) */}
                {envelope.letterContent.hasFutureWatermark && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 rotate-[-25deg] select-none">
                    <div className="text-center font-typewriter font-black text-5xl tracking-widest text-[#7a2222] border-8 border-dashed border-[#7a2222] p-6 rounded-2xl">
                      FUTURE ANOMALY<br/>
                      <span className="text-2xl">1999.02.14 POSTMARK</span>
                    </div>
                  </div>
                )}

                {/* Letter Header Section */}
                <div className="border-b-2 border-[#8c7156]/40 pb-3 sm:pb-4 mb-3 sm:mb-4 flex items-start justify-between gap-4 shrink-0">
                  <div>
                    <div className="text-[10px] font-typewriter text-[#78614c] uppercase tracking-wider">
                      CASE EVIDENCE // DISPATCH FILE #404
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold font-serif text-[#1e130a] tracking-wide mt-0.5">
                      {envelope.letterContent.header || envelope.title}
                    </h3>
                    {envelope.letterContent.subHeader && (
                      <p className="text-[11px] sm:text-xs text-[#6e533c] font-typewriter mt-0.5">
                        {envelope.letterContent.subHeader}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="stamp-verified text-[10px]">
                      AUTHENTIC
                    </span>
                    <div className="text-[10px] font-typewriter text-[#6e533c] mt-1">
                      {envelope.postmarkDate || '1998年11月04日'}
                    </div>
                  </div>
                </div>

                {/* Scrollable Letter Content Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-1 space-y-3">

                {/* View Mode Toggle if Document Image is Available */}
                {resolvedDocumentImage && (
                  <div className="mb-4 flex items-center justify-between bg-[#dfd0b6] p-1.5 rounded-lg border border-[#a89074]">
                    <div className="text-[11px] font-serif text-[#5c432d] font-bold flex items-center gap-1.5 pl-2">
                      <FileText className="w-3.5 h-3.5 text-[#8c5222]" />
                      檢視形式切換：
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setViewMode('photo');
                        }}
                        className={`px-3 py-1 rounded text-xs font-serif transition-all flex items-center gap-1.5 ${
                          viewMode === 'photo'
                            ? 'bg-[#3d2716] text-[#fae0a5] shadow-sm font-bold'
                            : 'bg-transparent text-[#6e533c] hover:text-[#2b1b11] hover:bg-[#cfbe9e]'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>手寫原件影像</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setViewMode('transcript');
                        }}
                        className={`px-3 py-1 rounded text-xs font-serif transition-all flex items-center gap-1.5 ${
                          viewMode === 'transcript'
                            ? 'bg-[#3d2716] text-[#fae0a5] shadow-sm font-bold'
                            : 'bg-transparent text-[#6e533c] hover:text-[#2b1b11] hover:bg-[#cfbe9e]'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>轉譯條文對照</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Photo View Mode for Authentic Handwritten Note */}
                {resolvedDocumentImage && viewMode === 'photo' ? (
                  <div className="my-4 space-y-3">
                    <div 
                      onClick={() => {
                        sound.playPaper();
                        setIsImageZoomed(true);
                      }}
                      className="relative group rounded-xl overflow-hidden border-2 border-[#8c7156] shadow-xl bg-[#24170e] cursor-pointer hover:border-amber-600 transition-all"
                    >
                      <img
                        src={resolvedDocumentImage}
                        alt="手寫的規則原件"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto max-h-[460px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.015]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#fae0a5] font-serif pointer-events-none">
                        <span className="bg-black/70 px-2.5 py-1 rounded backdrop-blur-sm border border-amber-500/40 font-mono text-[11px] flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          前人遺留真實手寫紙條（血跡、油墨與急促字跡）
                        </span>
                        <span className="bg-amber-950/90 text-amber-200 px-2.5 py-1 rounded backdrop-blur-sm border border-amber-600 flex items-center gap-1 shadow group-hover:bg-amber-800">
                          <ZoomIn className="w-3.5 h-3.5" />
                          全螢幕放大
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#e8dac1] border border-[#a89074] rounded-lg text-xs font-serif text-[#3d2716] leading-relaxed flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#8c2222]">【物證鑑定說明】：</span>
                        此便箋由前任受害者在極度慌亂中用藍黑原子筆與紅筆手寫於筆記紙撕頁上。字跡顫抖，包含對404規則同化的關鍵破除密碼。
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setViewMode('transcript');
                        }}
                        className="shrink-0 text-xs font-serif text-amber-900 hover:text-amber-950 font-bold underline pl-3"
                      >
                        閱讀文字逐條轉譯 →
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Letter Body Lines (Typewritten or Realistic Handwritten Formatting) */}
                    <div className="space-y-3 my-4 text-xs md:text-sm text-[#2b1b11] font-typewriter leading-relaxed">
                      {envelope.letterContent.lines.map((line, idx) => {
                        // Custom interactive styling for handwritten rule lines
                        if (isHandwrittenRule && line.includes('管理員不知道')) {
                          return (
                            <div key={idx} className="font-serif leading-relaxed text-[#1a130d] pl-1 bg-[#ede0c8]/40 p-2 rounded-lg border border-[#cbb396]/60 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap text-sm md:text-base">
                                <span className="font-bold text-[#3d2716]">2. 管理員</span>
                                {/* Realistic ballpoint pen scratch-out visual element */}
                                <span className="relative inline-flex items-center justify-center px-2 py-0.5 group cursor-help select-none">
                                  {/* The underlying character "不" in faint red pencil */}
                                  <span className="font-bold text-[#8c2222] opacity-80 text-base md:text-lg">不</span>
                                  {/* Realistic multi-stroke ballpoint pen scratch scratch SVG layer */}
                                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-90 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" viewBox="0 0 40 24" preserveAspectRatio="none">
                                    {/* Multiple aggressive scribble strokes in black ballpoint ink */}
                                    <path d="M 2 12 Q 10 4, 38 10" stroke="#110d0a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                    <path d="M 4 8 Q 20 16, 36 12" stroke="#1c1611" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                                    <path d="M 6 15 Q 18 6, 34 16" stroke="#0a0806" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                                    <path d="M 3 10 C 15 18, 25 3, 37 13" stroke="#241a12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                                    <path d="M 5 14 Q 22 11, 35 7" stroke="#140f0c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                                  </svg>
                                </span>
                                <span className="font-bold text-[#3d2716]">知道</span>
                              </div>
                              {/* Visual Physical Feature Annotation Badge */}
                              <div className="flex items-center gap-1.5 text-[11px] font-sans text-[#7d5329] bg-[#e2d0b6]/80 px-2 py-1 rounded border border-[#caa57c]/60">
                                <span className="font-bold text-[#8c2222] shrink-0">物證特徵：</span>
                                <span>「不」字有被黑色原子筆反覆塗抹刮蹭的重度墨漬，但在強光下仍可清晰透視出底層紅字「不」。</span>
                              </div>
                            </div>
                          );
                        }
                        if (isHandwrittenRule && line.includes('清潔員不知道它的存在')) {
                          return (
                            <div key={idx} className="font-serif leading-relaxed text-[#1a130d] pl-1 bg-[#ede0c8]/40 p-2 rounded-lg border border-[#cbb396]/60 space-y-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap text-sm md:text-base">
                                <span className="font-bold text-[#3d2716]">3. 清潔員不知道</span>
                                <span className="relative inline-block font-bold text-[#8c2222] bg-[#f7eedf] px-2 py-0.5 rounded border border-[#d4a882] shadow-xs rotate-[-1deg] font-serif">
                                  它的存在
                                  {/* Rushed hurried underline */}
                                  <svg className="absolute -bottom-1 left-0 w-full h-2 pointer-events-none" viewBox="0 0 60 8" preserveAspectRatio="none">
                                    <path d="M 1 4 Q 30 1, 58 5" stroke="#8c2222" strokeWidth="2" fill="none" strokeLinecap="round" />
                                  </svg>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] font-sans text-[#7d5329] bg-[#e2d0b6]/80 px-2 py-1 rounded border border-[#caa57c]/60">
                                <span className="font-bold text-[#8c2222] shrink-0">物證特徵：</span>
                                <span>「它的存在」筆跡與墨水明顯急促粗糙，墨水顏色較深，推測為受害者在逃跑途中緊急補寫補漏。</span>
                              </div>
                            </div>
                          );
                        }
                        if (isHandwrittenRule && (line.includes('規則是要管理') || line.includes('假裝不知道你知道'))) {
                          return (
                            <p key={idx} className="font-serif font-bold text-[#7a2222] bg-[#ede0c8]/60 p-1.5 rounded border-l-3 border-[#8c2222] pl-2.5">
                              {line}
                            </p>
                          );
                        }
                        return (
                          <p key={idx} className={line.startsWith('【') || line.startsWith('★') ? 'font-bold text-[#7a2626]' : ''}>
                            {line}
                          </p>
                        );
                      })}
                    </div>

                    {/* Margin Handwritten Notes (if any) */}
                    {envelope.letterContent.marginNote && (
                      <div className="my-4 p-3 rounded bg-[#ede0c8] border border-[#a89074] text-xs font-serif italic text-[#8c2222] relative rotate-[-0.5deg]">
                        <span className="font-bold font-typewriter uppercase text-[10px] block text-[#6e2222] not-italic mb-0.5">
                          ✎ 邊緣紅色筆跡加註：
                        </span>
                        {envelope.letterContent.marginNote}
                      </div>
                    )}
                  </>
                )}

                {/* Special Polaroid Attachment (if any) */}
                {envelope.letterContent.polaroidCaption && (
                  <div className="my-4 p-3 bg-[#ffffff] border border-[#d4c5ab] shadow-md rounded flex items-center gap-3 text-xs text-[#2b1b11]">
                    <div className="w-12 h-14 bg-[#2b1e15] border border-[#8c745a] flex items-center justify-center text-[#d4a359] shrink-0 font-mono text-[9px] text-center p-1">
                      [1998 POLAROID]
                    </div>
                    <div className="font-serif">
                      <span className="font-bold text-[#8c2a2a]">【夾附拍立得照片】：</span>
                      {envelope.letterContent.polaroidCaption}
                    </div>
                  </div>
                )}

                {/* Postscript or Footer */}
                {envelope.letterContent.postscript && (
                  <div className="text-xs text-[#523d2b] font-serif border-t border-[#8c7156]/30 pt-3 mt-4">
                    {envelope.letterContent.postscript}
                  </div>
                )}

                {envelope.letterContent.footer && (
                  <div className="text-right text-xs font-serif font-bold text-[#3d2716] mt-4">
                    {envelope.letterContent.footer}
                  </div>
                )}

                </div>

                {/* Letter Action Buttons */}
                <div className="mt-4 pt-3 sm:mt-6 sm:pt-4 border-t-2 border-[#8c7156]/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <button
                    onClick={handleReFold}
                    className="px-3 py-1.5 rounded bg-[#e8dac1] hover:bg-[#ded0b6] text-[#3d2716] font-typewriter text-xs flex items-center gap-1.5 transition-colors border border-[#a89074]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重新折回信封</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {envelope.secondaryActionText && envelope.onSecondaryActionClick && (
                      <button
                        onClick={() => {
                          envelope.onSecondaryActionClick?.();
                          onClose();
                        }}
                        className="px-4 py-2 rounded bg-[#3d2716] hover:bg-[#4d321d] text-[#fae0a5] font-serif font-bold text-xs shadow transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{envelope.secondaryActionText}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        envelope.onActionClick?.();
                        sound.playPaper();
                        onClose();
                      }}
                      className="px-5 py-2 rounded bg-gradient-to-r from-[#9e3232] to-[#7d1d1e] hover:brightness-110 text-[#ffffff] font-serif font-bold text-xs md:text-sm shadow-md transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{envelope.actionButtonText || '收納至隨身物證檔案袋'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Full-screen High-Resolution Lightbox for Handwritten Document Image */}
      <AnimatePresence>
        {isImageZoomed && resolvedDocumentImage && (
          <div 
            onClick={() => setIsImageZoomed(false)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsImageZoomed(false);
                }}
                className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[90vh] overflow-auto rounded-2xl border-2 border-amber-600/80 shadow-2xl bg-neutral-950 p-2 relative"
            >
              <img
                src={resolvedDocumentImage}
                alt="手寫的規則高解析原件"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
              />
              <div className="p-3 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between text-xs font-serif text-neutral-300">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Stamp className="w-4 h-4 text-amber-500" />
                  前人血淚手寫筆記原件（筆記紙撕頁 • 油墨塗改 • 紅筆眉批）
                </span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  ARCHIVE // HANDWRITTEN RULE SPECIMEN
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
