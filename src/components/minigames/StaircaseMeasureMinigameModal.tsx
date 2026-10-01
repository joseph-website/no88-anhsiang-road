import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ruler,
  CheckCircle2,
  X,
  Brain,
  Calculator
} from 'lucide-react';
import { sound } from '../../services/soundEngine';

interface StaircaseMeasureMinigameModalProps {
  isOpen: boolean;
  hasDiscoveredStepHeightDiscrepancy: boolean;
  onDeductionComplete: () => void;
  onClose: () => void;
}

export const StaircaseMeasureMinigameModal: React.FC<StaircaseMeasureMinigameModalProps> = ({
  isOpen,
  hasDiscoveredStepHeightDiscrepancy,
  onDeductionComplete,
  onClose
}) => {
  // Step 1: Measure Standard Stair (1F-2F)
  // Step 2: Measure Anomaly Stair (3F-5F)
  // Step 3: Orthodox Geometric Deduction Calculation
  const [activeTab, setActiveTab] = useState<'measure_standard' | 'measure_anomaly' | 'deduction'>('measure_standard');
  const [measuredStandard, setMeasuredStandard] = useState<boolean>(false);
  const [measuredAnomaly, setMeasuredAnomaly] = useState<boolean>(false);
  const [isDeductionSolved, setIsDeductionSolved] = useState<boolean>(hasDiscoveredStepHeightDiscrepancy);
  const [rulerAnimating, setRulerAnimating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleMeasureStandard = () => {
    sound.playClick();
    setRulerAnimating(true);
    setTimeout(() => {
      setRulerAnimating(false);
      setMeasuredStandard(true);
      sound.playInspectSuccess();
    }, 600);
  };

  const handleMeasureAnomaly = () => {
    sound.playClick();
    setRulerAnimating(true);
    setTimeout(() => {
      setRulerAnimating(false);
      setMeasuredAnomaly(true);
      sound.playTensionSting();
    }, 600);
  };

  const handleExecuteDeduction = () => {
    sound.playContradictionBreakthrough();
    setIsDeductionSolved(true);
    onDeductionComplete();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          className="w-full max-w-2xl retro-forum-modal-window shadow-2xl overflow-hidden flex flex-col font-sans text-[#1a2e18] relative"
        >
          {/* Retro Title Bar */}
          <div className="retro-forum-modal-header p-2.5 sm:p-3 flex items-center justify-between border-b-2 border-[#1c3819] select-none">
            <div className="flex items-center gap-2">
              <span className="text-[#a3e635] text-sm">📐</span>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  安全梯折返梯段與階高數學詭計解構 - [幾何丈量工作台]
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-[11px] font-mono font-bold text-[#fef08a] hover:text-white px-2 py-0.5 bg-[#1a3818] border border-[#a3e635]/60 hover:bg-[#2b5828] cursor-pointer"
            >
              [關閉 X]
            </button>
          </div>

          {/* Retro Tab Navigation */}
          <div className="flex border-b border-[#7ca078] bg-[#dbe8d8] text-xs font-mono p-1 gap-1">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('measure_standard');
              }}
              className={`flex-1 py-1.5 px-2 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                activeTab === 'measure_standard'
                  ? 'bg-white border-[#587854] text-[#1c3c1a] shadow-sm'
                  : 'bg-[#cfded0] border-transparent text-[#486345] hover:bg-[#e4eee3]'
              }`}
            >
              <span>1. 丈量標準樓層 (1F-3F)</span>
              {measuredStandard && <CheckCircle2 className="w-3.5 h-3.5 text-[#2b7524]" />}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('measure_anomaly');
              }}
              className={`flex-1 py-1.5 px-2 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                activeTab === 'measure_anomaly'
                  ? 'bg-white border-[#587854] text-[#1c3c1a] shadow-sm'
                  : 'bg-[#cfded0] border-transparent text-[#486345] hover:bg-[#e4eee3]'
              }`}
            >
              <span>2. 丈量異常梯段 (3F-5F)</span>
              {measuredAnomaly && <CheckCircle2 className="w-3.5 h-3.5 text-[#2b7524]" />}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('deduction');
              }}
              disabled={!measuredStandard || !measuredAnomaly}
              className={`flex-1 py-1.5 px-2 font-bold transition-all flex items-center justify-center gap-1.5 border ${
                !measuredStandard || !measuredAnomaly
                  ? 'opacity-40 cursor-not-allowed bg-[#cfded0] text-[#777]'
                  : activeTab === 'deduction'
                    ? 'bg-white border-[#587854] text-[#1c3c1a] shadow-sm cursor-pointer'
                    : 'bg-[#cfded0] border-transparent text-[#486345] hover:bg-[#e4eee3] cursor-pointer'
              }`}
            >
              <span>3. 建築幾何論證</span>
              {isDeductionSolved && <CheckCircle2 className="w-3.5 h-3.5 text-[#2b7524]" />}
            </button>
          </div>

          {/* Body Panels */}
          <div className="p-3 sm:p-4 space-y-3.5 max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#f4f8f3]">
            {/* Panel 1: Standard Measure */}
            {activeTab === 'measure_standard' && (
              <div className="space-y-3.5">
                <div className="p-2.5 bg-[#fffde6] border border-[#d4be59] text-xs text-[#5c4a16] leading-relaxed">
                  在進行幾何推理前，必須先建立大樓建築的<b>基準常態數據（Baseline）</b>。請利用隨身鋼捲尺，對一樓至二樓的標準折返樓梯進行抽樣丈量。
                </div>

                {/* Visual Ruler Stage in retro blueprint style */}
                <div className="p-4 sm:p-5 bg-white border border-[#7ca078] flex flex-col items-center justify-center relative overflow-hidden space-y-4">
                  {/* Stair Graphic Mockup */}
                  <div className="w-full max-w-md h-32 flex items-end justify-center gap-2 border-b-2 border-[#2b5329] pb-1 bg-[#eef5ee] pt-4 px-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div
                        key={s}
                        style={{ height: `${s * 20}px` }}
                        className="w-14 bg-[#d8e6d6] border border-[#4d7549] flex flex-col items-center justify-start text-[10px] font-mono text-[#244222] font-bold pt-1 shadow-sm"
                      >
                        第{s}階
                      </div>
                    ))}
                  </div>

                  {/* Measurement Action / Readout */}
                  {!measuredStandard ? (
                    <button
                      onClick={handleMeasureStandard}
                      disabled={rulerAnimating}
                      className="retro-web-btn px-5 py-2 text-xs font-bold flex items-center gap-2"
                    >
                      <Ruler className="w-4 h-4 text-[#2b5329]" />
                      <span>{rulerAnimating ? '刻度校準丈量中……' : '拉出鋼捲尺測量階高與踏步'}</span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full p-3 bg-[#e8f2e6] border-2 border-[#4d7549] space-y-2 text-xs"
                    >
                      <div className="font-mono font-bold text-[#1c4718] flex items-center justify-between">
                        <span>【基準數據丈量完畢】標準樓梯規格：</span>
                        <span className="text-[10px] px-2 py-0.5 bg-[#315e2e] text-white font-bold">基準常模</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 font-mono text-center">
                        <div className="p-2 bg-white border border-[#89ad85]">
                          <div className="text-[10px] text-[#557551]">總階數</div>
                          <div className="text-sm font-bold text-[#1a3818]">15 階</div>
                        </div>
                        <div className="p-2 bg-white border border-[#89ad85]">
                          <div className="text-[10px] text-[#557551]">單階垂直高度</div>
                          <div className="text-sm font-bold text-[#156e29]">18 公分</div>
                        </div>
                        <div className="p-2 bg-white border border-[#89ad85]">
                          <div className="text-[10px] text-[#557551]">單層總淨高</div>
                          <div className="text-sm font-bold text-[#915e00]">270 公分</div>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#244722] pt-1">
                        計算公式：<b>15 階 × 18 cm = 270 cm</b>（標準集合住宅單層層高）。
                      </div>
                    </motion.div>
                  )}
                </div>

                {measuredStandard && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('measure_anomaly');
                      }}
                      className="retro-web-btn px-4 py-1.5 text-xs font-bold"
                    >
                      <span>前往丈量 3F-5F 異常梯段 ➔</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Panel 2: Anomaly Measure */}
            {activeTab === 'measure_anomaly' && (
              <div className="space-y-3.5">
                <div className="p-2.5 bg-[#fffde6] border border-[#d4be59] text-xs text-[#5c4a16] leading-relaxed">
                  將鋼捲尺帶往三樓往五樓的折返梯段。這段樓梯在視覺上跳過了四樓，但步行的體感明顯更久……你打算仔細丈量其規格與階高。
                </div>

                {/* Visual Ruler Stage */}
                <div className="p-4 sm:p-5 bg-white border border-[#7ca078] flex flex-col items-center justify-center relative overflow-hidden space-y-4">
                  {/* Compressed Stair Graphic Mockup */}
                  <div className="w-full max-w-md h-32 flex items-end justify-center gap-1.5 border-b-2 border-[#804020] pb-1 bg-[#fbf3ec] pt-4 px-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                      <div
                        key={s}
                        style={{ height: `${s * 15}px` }}
                        className="w-10 bg-[#ebd6c8] border border-[#965532] flex flex-col items-center justify-start text-[9px] font-mono text-[#612c11] font-bold pt-1 shadow-sm"
                      >
                        {s}階
                      </div>
                    ))}
                    <div className="text-xs font-mono text-[#9c4115] font-bold self-center px-1">...共24階</div>
                  </div>

                  {/* Measurement Action / Readout */}
                  {!measuredAnomaly ? (
                    <button
                      onClick={handleMeasureAnomaly}
                      disabled={rulerAnimating}
                      className="retro-web-btn px-5 py-2 text-xs font-bold flex items-center gap-2"
                    >
                      <Ruler className="w-4 h-4 text-[#8a4214]" />
                      <span>{rulerAnimating ? '精確測量矮縮梯級中……' : '測量3F-5F折返梯之垂直規格'}</span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full p-3 bg-[#fdf2ec] border-2 border-[#b5552b] space-y-2 text-xs"
                    >
                      <div className="font-mono font-bold text-[#802a0a] flex items-center justify-between">
                        <span>【異常數據獲取】3F-5F 樓梯實測數據：</span>
                        <span className="text-[10px] px-2 py-0.5 bg-[#a32210] text-white font-bold animate-pulse">
                          物理矮縮！
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 font-mono text-center">
                        <div className="p-2 bg-white border border-[#d6a592]">
                          <div className="text-[10px] text-[#784f40]">總階數</div>
                          <div className="text-sm font-bold text-[#b82a18]">24 階（異樣）</div>
                        </div>
                        <div className="p-2 bg-white border border-[#d6a592]">
                          <div className="text-[10px] text-[#784f40]">單階垂直高度</div>
                          <div className="text-sm font-bold text-[#b82a18]">僅 15 公分！</div>
                        </div>
                        <div className="p-2 bg-white border border-[#d6a592]">
                          <div className="text-[10px] text-[#784f40]">梯段總垂直高度</div>
                          <div className="text-sm font-bold text-[#8a440c]">360 公分！</div>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#752e12] pt-1">
                        計算公式：<b>24 階 × 15 cm = 360 cm</b>！每一階被偷矮了 3 公分，但總高度卻比標準層高多出了 90 公分！
                      </div>
                    </motion.div>
                  )}
                </div>

                {measuredAnomaly && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('deduction');
                      }}
                      className="retro-web-btn px-4 py-1.5 text-xs font-bold"
                    >
                      <span>展開建築幾何矛盾論證 ➔</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Panel 3: Orthodox Geometric Deduction */}
            {activeTab === 'deduction' && (
              <div className="space-y-3.5">
                <div className="p-3 bg-white border border-[#7ca078] space-y-2">
                  <div className="text-xs font-bold text-[#1c4718] font-mono flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-[#2b5828]" />
                    <span>【建築物理算式交叉檢驗】：</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-[#eaf4e8] border border-[#8eb589]">
                      <div className="text-[11px] text-[#1c4718] font-bold">1F-3F 常規標準層</div>
                      <div className="text-[#20361e] mt-1">15 階 × 18 cm = <b>270 cm</b></div>
                      <div className="text-[10px] text-[#557551]">（正常一層樓垂直跨距）</div>
                    </div>
                    <div className="p-2.5 bg-[#fbede9] border border-[#d99889]">
                      <div className="text-[11px] text-[#a32210] font-bold">3F-5F 異常梯段</div>
                      <div className="text-[#421d15] mt-1">24 階 × 15 cm = <b>360 cm</b></div>
                      <div className="text-[10px] text-[#804639]">（整整多出 90 cm，非一層樓）</div>
                    </div>
                  </div>
                </div>

                {/* Deduction Breakthrough Button & Reveal */}
                {!isDeductionSolved ? (
                  <div className="pt-2 flex flex-col items-center space-y-2">
                    <button
                      onClick={handleExecuteDeduction}
                      className="retro-web-btn px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2"
                    >
                      <Brain className="w-4 h-4 text-[#854d0e]" />
                      <span>論證客觀物理破綻：解構「消失的四樓」！</span>
                    </button>
                    <div className="text-[11px] text-[#557551]">
                      比對現場丈量數據，你認為……
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 bg-white border-2 border-[#2b5828] space-y-2.5 shadow"
                  >
                    <div className="flex items-center gap-2 text-[#1c4718] font-bold text-xs sm:text-sm border-b border-[#adc7ab] pb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2b7524]" />
                      <span>【空間構造詭計完全破除】空間沒有蒸發，四樓是被硬生生壓縮夾藏！</span>
                    </div>

                    <div className="p-3 bg-[#f3f9f2] border border-[#a4c9a1] text-xs text-[#1e381b] leading-relaxed space-y-1.5">
                      <p>
                        <b>客觀真相解析：</b>
                        建商在建造這棟大樓時，為了規避容積法規並非法封存違章空間，故意將三樓往上的每級階梯高度從 18 公分壓低為 15 公分！
                      </p>
                      <p>
                        人體肌肉記憶適應了矮縮的階高，踩了 24 階（總高度 360cm）卻以為只是稍長的梯段。而 360 公分正好可以被改造成<b>兩層極限壓縮的夾層（每一層 180cm 淨高）</b>！
                      </p>
                      <div className="p-2 bg-[#fffde6] border border-[#d4be59] text-[11px] text-[#634e19] font-mono">
                        ★ 推理結論：四樓從未消失，它正是被夾在三樓天花板與五樓地板之間的「360cm 加蓋夾層機房」！
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={onClose}
                        className="retro-web-btn px-4 py-1.5 text-xs font-bold"
                      >
                        記錄客觀鐵證，返回現場 ➔
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
