import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Check, RotateCcw, AlertCircle, X, Mail, ArrowRight, Fingerprint, Sparkles } from 'lucide-react';
import { sound } from '../../services/soundEngine';

export interface LetterPiece {
  id: number;
  text: string;
  subtext?: string;
  order: number; // 0 to 5 (correct order)
}

export interface LetterPuzzleProps {
  onSolve?: () => void;
  onComplete?: () => void; // Backward compatibility for existing callers
  onClose?: () => void;
}

const PIECES: LetterPiece[] = [
  { id: 1, text: '【寄件人：404號房客】', subtext: '收件地址：404號房', order: 0 },
  { id: 2, text: '……規則是……', subtext: '不要相信他們給你的……', order: 1 },
  { id: 3, text: '大樓沒有四樓是……', subtext: '為了掩蓋……', order: 2 },
  { id: 4, text: '能搬家最好……', subtext: '若不能的話……', order: 3 },
  { id: 5, text: '萬事小心，假裝……', subtext: '不知道你已經知道……', order: 4 },
  { id: 6, text: '——404號房客 筆', subtext: '（郵戳蓋印於數月前）', order: 5 }
];

const INITIAL_TRAY: LetterPiece[] = [
  PIECES[2],
  PIECES[0],
  PIECES[4],
  PIECES[1],
  PIECES[5],
  PIECES[3]
];

export const LetterPuzzle: React.FC<LetterPuzzleProps> = ({ onSolve, onComplete, onClose }) => {
  // Envelope opening stage
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [isFlapOpen, setIsFlapOpen] = useState(false);

  // Slots on the desk: 6 positions (0 to 5)
  const [slots, setSlots] = useState<(LetterPiece | null)[]>([null, null, null, null, null, null]);
  // Tray of unplaced pieces
  const [tray, setTray] = useState<LetterPiece[]>(INITIAL_TRAY);

  // Verification and animation feedback states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleOpenEnvelope = () => {
    sound.playPaper();
    setIsFlapOpen(true);
    setTimeout(() => {
      sound.playResolutionChord();
      setIsEnvelopeOpened(true);
    }, 700);
  };

  const triggerSuccessCallback = () => {
    if (onSolve) {
      onSolve();
    } else if (onComplete) {
      onComplete();
    }
  };

  // 1. 下方碎片點擊：自動尋找並填入「下一個空白槽位」
  const handlePieceClick = (piece: LetterPiece) => {
    if (isVerifying || isSuccess) return;

    const firstEmptyIndex = slots.findIndex(s => s === null);
    if (firstEmptyIndex === -1) {
      // 槽位已全滿
      return;
    }

    sound.playPaper();

    setSlots(prev => {
      const next = [...prev];
      next[firstEmptyIndex] = piece;
      return next;
    });

    setTray(prev => prev.filter(p => p.id !== piece.id));
  };

  // 2. 上方槽位點擊：單純退出功能（退回下方待選區，釋出該位置）
  const handleSlotClick = (slotIndex: number) => {
    if (isVerifying || isSuccess) return;

    const pieceInSlot = slots[slotIndex];
    if (!pieceInSlot) return; // 點擊空槽位不作反應

    sound.playPaper();

    setSlots(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });

    setTray(prev => [...prev, pieceInSlot]);
  };

  // 3. 驗證與防錯機制：當所有槽位填滿時，自動發起答案驗證
  useEffect(() => {
    const isAllFilled = slots.every(s => s !== null);

    if (isAllFilled && !isVerifying && !isSuccess) {
      setIsVerifying(true);

      const isCorrect = slots.every((s, idx) => s && s.order === idx);

      if (isCorrect) {
        sound.playResolutionChord();
        setIsSuccess(true);
        const timer = setTimeout(() => {
          triggerSuccessCallback();
        }, 1200);
        resetTimerRef.current = timer;
      } else {
        sound.playGlitch();
        setIsShaking(true);

        // 驗證失敗：左右震顫動畫，1 秒後自動將所有碎片退回待選區供重試
        const timer = setTimeout(() => {
          setIsShaking(false);
          const allFilledPieces = slots.filter((s): s is LetterPiece => s !== null);
          setSlots([null, null, null, null, null, null]);
          setTray(prev => [...prev, ...allFilledPieces]);
          setIsVerifying(false);
        }, 1000);

        resetTimerRef.current = timer;
      }
    }
  }, [slots, isVerifying, isSuccess]);

  // 手動重置托盤
  const handleReset = () => {
    if (isVerifying || isSuccess) return;
    sound.playPaper();
    setSlots([null, null, null, null, null, null]);
    setTray(INITIAL_TRAY);
    setIsShaking(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#201710] border-2 border-[#5a402a] rounded-xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative text-[#e5dac6] font-serif"
      >
        {/* 頂部標題 */}
        <div className="flex items-center justify-between border-b border-[#3d2716] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase bg-[#3a2517] text-[#d4a359] border border-[#5a3a22] px-2 py-0.5 rounded">
              CRIME EVIDENCE // 1998
            </span>
            <h3 className="text-base md:text-lg font-bold text-[#f5ebd7] tracking-wide">
              線索還原：被撕碎的信件
            </h3>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-[#9c846a] hover:text-[#f5ebd7] transition-colors p-2 rounded hover:bg-[#2e1f13] min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              title="關閉"
              aria-label="關閉"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 拆信封前導階段 */}
        {!isEnvelopeOpened ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
            <p className="text-xs text-[#a88f72] font-mono max-w-md leading-relaxed">
              在 504 號房垃圾桶深處尋獲之泛黃信封，邊緣有裁剪撕裂的痕跡。請先拆開封套以傾倒出碎紙片。
            </p>

            {/* 信封卡片視覺 */}
            <div 
              onClick={handleOpenEnvelope}
              className="relative w-full max-w-sm aspect-[16/10] rounded-lg shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform bg-[#2b1b10] border-2 border-[#5a3c22] p-4 flex flex-col justify-between overflow-hidden group"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 10% 20%, rgba(90, 60, 30, 0.4) 0%, transparent 40%),
                  linear-gradient(135deg, #3d2716 0%, #28180e 100%)
                `
              }}
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-[#a88f72]">
                <span>寄件：404室 張浩</span>
                <span className="text-[#a33a3a] font-bold">1998.11.04 郵戳</span>
              </div>

              <div className="my-auto text-center space-y-1">
                <div className="text-xs font-serif font-bold text-[#f5ebd7]">
                  【404號房客 絕筆手書】
                </div>
                <div className="text-[10px] text-[#8c745a] font-mono">
                  寄給 404 號房住戶 鈞啟
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300">
                  TOP SECRET
                </span>
                <Fingerprint className="w-5 h-5 text-[#8c745a] opacity-70" />
              </div>

              {/* 上掀信封頂蓋動畫 */}
              <motion.div
                animate={{
                  rotateX: isFlapOpen ? -180 : 0,
                  transformOrigin: 'top center'
                }}
                transition={{ duration: 0.6 }}
                className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
              >
                <svg viewBox="0 0 380 80" className="w-full h-full" preserveAspectRatio="none">
                  <polygon points="0,0 380,0 190,75" fill="#362214" stroke="#5a3c22" strokeWidth="2" />
                </svg>
              </motion.div>
            </div>

            <button
              onClick={handleOpenEnvelope}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#b07d3b] via-[#d4a359] to-[#b07d3b] text-[#1a120b] font-serif font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all min-h-[44px] cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#1a120b]" />
              <span>拆啟信封・取出碎紙片</span>
              <ArrowRight className="w-4 h-4 text-[#1a120b]" />
            </button>
          </div>
        ) : (
          /* 核心拼圖互動階段 */
          <>
            <p className="text-xs text-[#a88f72] font-serif mb-3">
              依信件文意與脈絡，將殘缺字句拼合成篇：
            </p>

            {/* 上方：解密拼圖框（Assembly Area） */}
            <motion.div 
              animate={isShaking ? { x: [-10, 10, -10, 10, -5, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-[#18110a] border-2 rounded-lg p-3 sm:p-4 mb-4 min-h-[190px] flex flex-col justify-center shadow-inner transition-all duration-200 ${
                isShaking 
                  ? 'border-red-600 bg-red-950/20' 
                  : isSuccess
                  ? 'border-emerald-500 bg-emerald-950/20'
                  : 'border-dashed border-[#4a3422]'
              }`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {slots.map((slot, idx) => (
                  <button
                    key={`slot-${idx}`}
                    onClick={() => handleSlotClick(idx)}
                    disabled={isVerifying || isSuccess}
                    className={`min-h-[64px] sm:min-h-[70px] p-2.5 rounded border text-left flex flex-col justify-center min-w-[44px] cursor-pointer transition-all duration-200 active:scale-95 ${
                      slot 
                        ? 'bg-[#f4ecd9] text-[#24170d] border-[#a88f72] shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:border-amber-600' 
                        : 'bg-[#140e08] border-[#382618] text-[#735d49] border-dashed cursor-default'
                    }`}
                  >
                    {slot ? (
                      <>
                        <span className="font-serif font-bold text-xs leading-snug line-clamp-2 text-[#1c1109]">
                          {slot.text}
                        </span>
                        {slot.subtext && (
                          <span className="text-[10px] text-[#6e533c] font-mono mt-0.5 truncate">
                            {slot.subtext}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[11px] font-mono text-center text-[#6e553f]">
                        【槽位 {idx + 1}】待填入
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* 下方：碎片收集托盤（Pieces Tray） */}
            <div className="mb-4">
              <div className="text-[11px] font-mono text-[#a88f72] mb-1.5 flex items-center justify-between min-h-[20px]">
                <span>待選碎片托盤（剩餘 {tray.length} 片）：</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 min-h-[72px]">
                {tray.map(piece => (
                  <button
                    key={piece.id}
                    onClick={() => handlePieceClick(piece)}
                    disabled={isVerifying || isSuccess}
                    className="p-2.5 rounded border text-left transition-all duration-200 flex flex-col justify-center min-h-[44px] min-w-[44px] cursor-pointer bg-[#24180f] border-[#4a3422] text-[#cbb9a1] hover:bg-[#322115] hover:text-[#f5ebd7] hover:border-amber-400/80 hover:scale-105 active:scale-95 shadow-sm"
                  >
                    <span className="font-serif font-bold text-xs truncate">
                      {piece.text}
                    </span>
                    {piece.subtext && (
                      <span className="text-[10px] text-[#8c745a] font-mono truncate mt-0.5">
                        {piece.subtext}
                      </span>
                    )}
                  </button>
                ))}

                {tray.length === 0 && (
                  <div className="col-span-2 sm:col-span-3 text-center py-2.5 text-xs font-mono flex items-center justify-center gap-1.5">
                    {isSuccess ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-400" />
                        信件完整無誤！真相已完整拼合。
                      </span>
                    ) : isShaking ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        文意邏輯矛盾！正在退回碎片供重試……
                      </span>
                    ) : (
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                        正在檢驗文意邏輯鏈……
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 底部狀態操作列 */}
            <div className="flex items-center justify-between pt-3 border-t border-[#3d2716]">
              <button
                onClick={handleReset}
                disabled={isVerifying || isSuccess}
                className="px-3.5 py-2 rounded bg-[#24180f] hover:bg-[#332215] text-[#a88f72] hover:text-[#e5dac6] text-xs font-mono flex items-center gap-1.5 border border-[#4a3422] transition-colors min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>全部重置</span>
              </button>

              <div className="flex items-center gap-2">
                {isSuccess ? (
                  <div className="px-4 py-2 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-serif font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>拼合成功 (VERIFIED)</span>
                  </div>
                ) : (
                  <div className="text-[11px] font-mono text-[#8c745a]">
                    槽位填入進度：{slots.filter(Boolean).length} / 6
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
