import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  BookOpen,
  Newspaper,
  UserCheck,
  Award,
  X,
  QrCode,
  Copy,
  CheckCircle2,
  Play,
  Heart,
  Stamp,
  ScrollText
} from 'lucide-react';
import QRCode from 'qrcode';
import { EndingId, SavedGameData } from '../types';
import { ENDINGS_DATA, WEEK1_ENDINGS_DATA } from '../data/rulesData';
import { ENDING_EPILOGUES, WEEK1_ENDING_EPILOGUES, EndingEpilogueData } from '../data/epiloguesData';
import { sound } from '../services/soundEngine';
import { exportSaveToKey, generateShareableURL } from '../services/saveSystem';

interface EndingEpilogueModalProps {
  endingId: EndingId;
  savedData?: SavedGameData | null;
  onClose: () => void;
  onLoadSave?: (savedData: SavedGameData) => void;
}

export const EndingEpilogueModal: React.FC<EndingEpilogueModalProps> = ({
  endingId,
  savedData,
  onClose,
  onLoadSave
}) => {
  const [activeTab, setActiveTab] = useState<'epilogue' | 'story' | 'stats' | 'export'>('epilogue');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isUrlCopied, setIsUrlCopied] = useState<boolean>(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const isWeek1 = savedData?.completedWeek1 === false;
  const ending = (isWeek1 && WEEK1_ENDINGS_DATA[endingId]) ? WEEK1_ENDINGS_DATA[endingId] : ENDINGS_DATA[endingId];
  const epilogue: EndingEpilogueData | undefined = (isWeek1 && WEEK1_ENDING_EPILOGUES[endingId])
    ? WEEK1_ENDING_EPILOGUES[endingId]
    : ENDING_EPILOGUES[endingId];

  // Prepare export key if savedData exists
  const exportKey = savedData ? exportSaveToKey(savedData) : '';

  useEffect(() => {
    if (activeTab === 'export' && qrCanvasRef.current && exportKey) {
      const shareUrl = generateShareableURL(exportKey);
      const payload = shareUrl.length <= 2000 ? shareUrl : exportKey;
      QRCode.toCanvas(qrCanvasRef.current, payload, {
        width: 220,
        margin: 2,
        color: {
          dark: '#1c130b',
          light: '#f5ecd7'
        }
      }, (err) => {
        if (err) console.error('QR generation error:', err);
      });
    }
  }, [activeTab, exportKey]);

  if (!ending || !epilogue) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-2.5 sm:p-4 md:p-6 select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 5 }}
        className="retro-forum-modal-window max-w-4xl w-full h-[90vh] max-h-[760px] flex flex-col shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="retro-forum-window-header shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#ffffff]" />
            <span className="font-bold text-xs sm:text-sm tracking-wide">
              【案件結案評議與後日談報告】— {epilogue.endingTitle}
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="retro-forum-close-btn flex items-center justify-center cursor-pointer"
            title="關閉視窗"
          >
            <X className="w-3 h-3 text-[#333333]" />
          </button>
        </div>

        {/* Sub-header info banner */}
        <div className="bg-[#f0f6ee] border-b border-[#a8c2a1] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs border font-bold bg-[#ffffff] border-[#83ab79] text-[#1f4717] shadow-2xs">
              同業評議：{epilogue.peerReview.summaryTag}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs border font-bold bg-[#ffffff] border-[#a8c2a1] text-[#333333]">
              印章：【{epilogue.sealText}】
            </span>
            <span className="text-xs text-[#556652] font-sans">
              審核單位：{epilogue.peerReview.reviewer}
            </span>
          </div>
          {savedData?.saveTimestamp && (
            <span className="text-xs text-[#556652] font-mono">
              通關存檔：{savedData.saveTimestamp}
            </span>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="p-2.5 px-4 border-b border-[#a8c2a1] bg-[#e8f0e5] flex items-center gap-2 overflow-x-auto shrink-0 touch-pan-x scrollbar-none">
          <button
            onClick={() => {
              sound.playPaper();
              setActiveTab('epilogue');
            }}
            className={`min-h-[32px] px-3.5 py-1 rounded-xs text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'epilogue'
                ? 'bg-[#3e6634] text-[#ffffff] border border-[#2d4d25] shadow-2xs'
                : 'bg-[#ffffff] text-[#445544] hover:bg-[#f4f8f2] border border-[#a8c2a1]'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>專屬後日談與人物命運</span>
          </button>

          <button
            onClick={() => {
              sound.playPaper();
              setActiveTab('story');
            }}
            className={`min-h-[32px] px-3.5 py-1 rounded-xs text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'story'
                ? 'bg-[#3e6634] text-[#ffffff] border border-[#2d4d25] shadow-2xs'
                : 'bg-[#ffffff] text-[#445544] hover:bg-[#f4f8f2] border border-[#a8c2a1]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>結局本篇故事復盤</span>
          </button>

          <button
            onClick={() => {
              sound.playPaper();
              setActiveTab('stats');
            }}
            className={`min-h-[32px] px-3.5 py-1 rounded-xs text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-[#3e6634] text-[#ffffff] border border-[#2d4d25] shadow-2xs'
                : 'bg-[#ffffff] text-[#445544] hover:bg-[#f4f8f2] border border-[#a8c2a1]'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>同業評價與結案數據</span>
          </button>

          {savedData && (
            <button
              onClick={() => {
                sound.playPaper();
                setActiveTab('export');
              }}
              className={`min-h-[32px] px-3.5 py-1 rounded-xs text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-[#3e6634] text-[#ffffff] border border-[#2d4d25] shadow-2xs'
                  : 'bg-[#ffffff] text-[#445544] hover:bg-[#f4f8f2] border border-[#a8c2a1]'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>通關憑證與跨裝置 QR 碼</span>
            </button>
          )}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f7faf5]">
          {/* TAB 1: EPILOGUE & CHARACTER FATES */}
          {activeTab === 'epilogue' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Epilogue Banner */}
              <div className="p-4 sm:p-5 rounded-xs bg-[#ffffff] border border-[#a8c2a1] relative overflow-hidden shadow-2xs">
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-[#eef5ec] text-[#1f4717] border border-[#83ab79] font-bold">
                      CASE EPILOGUE // 後日談追蹤
                    </span>
                    <span className="text-xs text-[#556652] font-mono">
                      檔案編號：{epilogue.archiveSealCode}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-[#1a3964]">
                    {epilogue.epilogueTitle}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#b8502a] italic leading-relaxed">
                    「{epilogue.epilogueSubtitle}」
                  </p>
                  <p className="text-xs sm:text-sm text-[#333333] leading-relaxed pt-1">
                    {epilogue.summary}
                  </p>
                </div>
              </div>

              {/* Character Fates Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1a3964]">
                  <UserCheck className="w-4 h-4 text-[#2e6d24]" />
                  <span>登場人物後續命運追蹤 (Character Fates)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {epilogue.characterFates.map((fate, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xs bg-[#ffffff] border border-[#a8c2a1] space-y-1.5 flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-xs sm:text-sm text-[#1a3964]">
                            {fate.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-[#f7faf5] text-[#556652] border border-[#c5d8c1]">
                            {fate.role}
                          </span>
                        </div>
                        <p className="text-xs text-[#444444] leading-relaxed">
                          {fate.fate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newspaper Clipping */}
              <div className="p-4 sm:p-5 rounded-xs bg-[#ffffff] border border-[#a8c2a1] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#c5d8c1] pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#b8502a]">
                    <Newspaper className="w-4 h-4 text-[#b8502a]" />
                    <span>案後媒體報導剪報</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#556652]">
                    2012年10月 地方要聞版
                  </span>
                </div>
                <h5 className="font-bold text-sm sm:text-base text-[#1a3964] pt-1">
                  {epilogue.newspaperHeadline}
                </h5>
                <p className="text-xs sm:text-sm text-[#444444] leading-relaxed font-sans">
                  {epilogue.newspaperSnippet}
                </p>
              </div>

              {/* Detective Reflection */}
              <div className="p-4 rounded-xs bg-[#f7faf5] border-l-4 border-[#2e6d24] border-y border-r border-[#a8c2a1] space-y-1 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-[#556652] tracking-wider block font-bold">
                  DETECTIVE'S FINAL MEMO // {savedData?.playerName ? `${savedData.playerName} 結案手記` : '承辦調查員結案手記'}
                </span>
                <p className="text-xs sm:text-sm text-[#1f4717] leading-relaxed font-medium">
                  {epilogue.detectiveReflection}
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ORIGINAL ENDING STORY */}
          {activeTab === 'story' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Header Title */}
              <div className="p-4 rounded-xs bg-[#ffffff] border border-[#a8c2a1] space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#eef5ec] text-[#1f4717] border border-[#83ab79] font-bold">
                  ORIGINAL CASE SUMMARY // 終局案件原文
                </span>
                <h4 className="text-lg font-bold text-[#1a3964]">
                  {ending.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                  {ending.description}
                </p>
              </div>

              {/* Full Story Paragraphs */}
              <div className="p-4 sm:p-5 rounded-xs bg-[#ffffff] border border-[#a8c2a1] space-y-3 shadow-2xs">
                <h5 className="text-xs font-bold text-[#556652] uppercase tracking-wider font-mono">
                  CASE LOG TRANSCRIPT // 終局案件實錄
                </h5>
                <div className="space-y-3">
                  {ending.story.map((para, pIdx) => (
                    <p key={pIdx} className="text-xs sm:text-sm text-[#222222] leading-relaxed indent-4">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Detective Comment */}
              <div className="p-4 rounded-xs bg-[#f7faf5] border border-[#a8c2a1] text-xs sm:text-sm text-[#1f4717] pl-3 border-l-4 border-[#2e6d24] shadow-2xs">
                {ending.detectiveComment}
              </div>
            </motion.div>
          )}

          {/* TAB 3: PEER EVALUATION & CLEARANCE STATS */}
          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* SECTION A: DETECTIVE GUILD PEER EVALUATION REPORT */}
              <div className="p-5 rounded-xs bg-[#ffffff] border border-[#a8c2a1] space-y-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c5d8c1] pb-3">
                  <div className="flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-[#2e6d24]" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1a3964]">
                        私家偵探公會・案件同行評議意見書
                      </h4>
                      <span className="text-[10px] text-[#556652]">
                        審查單位：{epilogue.peerReview.reviewer}
                      </span>
                    </div>
                  </div>

                  {/* Stamp */}
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-xs border-2 border-[#b8502a] bg-[#fdf2f2] text-[#b8502a] font-bold text-xs tracking-widest uppercase shadow-2xs rotate-[-2deg]">
                      【{epilogue.sealText}】
                    </div>
                  </div>
                </div>

                {/* Peer Review Content */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#556652]">評議結論：</span>
                    <span className="text-xs font-bold text-[#1f4717] px-2 py-0.5 rounded-xs bg-[#eef5ec] border border-[#83ab79]">
                      {epilogue.peerReview.summaryTag}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xs bg-[#f7faf5] border border-[#c5d8c1] text-xs sm:text-sm text-[#222222] leading-relaxed">
                    {epilogue.peerReview.comment}
                  </div>
                </div>
              </div>

              {/* Performance Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xs bg-[#ffffff] border border-[#a8c2a1] text-center space-y-1 shadow-2xs">
                  <span className="text-[11px] text-[#556652]">檔案狀態</span>
                  <div className="text-base font-bold text-[#1a3964] py-0.5">
                    {epilogue.sealText}
                  </div>
                  <span className="text-[10px] text-[#777777] truncate block">已歸檔列管</span>
                </div>

                <div className="p-3.5 rounded-xs bg-[#ffffff] border border-[#a8c2a1] text-center space-y-1 shadow-2xs">
                  <span className="text-[11px] text-[#556652]">調查耗時</span>
                  <div className="text-lg font-bold font-mono text-[#b8502a]">
                    第 {savedData?.investigationDay || 1} 天
                  </div>
                  <span className="text-[10px] text-[#777777]">{savedData ? `${savedData.gameDate?.year}年` : '2012年'}</span>
                </div>

                <div className="p-3.5 rounded-xs bg-[#ffffff] border border-[#a8c2a1] text-center space-y-1 shadow-2xs">
                  <span className="text-[11px] text-[#556652]">結案心智指針</span>
                  <div className={`text-base font-bold font-sans flex items-center justify-center gap-1.5 ${
                    (savedData?.san ?? 100) >= 70 ? 'text-[#2e6d24]' : (savedData?.san ?? 100) >= 40 ? 'text-[#856404]' : 'text-[#b21f2d]'
                  }`}>
                    <Heart className="w-4 h-4 text-[#c93b2b]" />
                    <span>{(savedData?.san ?? 100) >= 70 ? '意識清明' : (savedData?.san ?? 100) >= 40 ? '精神緊繃' : '瀕臨崩潰'}</span>
                  </div>
                  <span className="text-[10px] text-[#777777]">心智防線評估</span>
                </div>

                <div className="p-3.5 rounded-xs bg-[#ffffff] border border-[#a8c2a1] text-center space-y-1 shadow-2xs">
                  <span className="text-[11px] text-[#556652]">掌握物證與守則</span>
                  <div className="text-lg font-bold font-mono text-[#1a3964]">
                    {(savedData?.inventory?.length || 0) + (savedData?.obtainedRules?.length || 0)} 件
                  </div>
                  <span className="text-[10px] text-[#777777]">全案證據鏈數量</span>
                </div>
              </div>

              {/* Commemorative Item Showcase */}
              <div className="p-4 rounded-xs bg-[#ffffff] border border-[#83ab79] space-y-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#2e6d24]" />
                  <h4 className="text-sm sm:text-base font-bold text-[#1f4717]">
                    結局專屬紀念物證：【{epilogue.commemorativeItem.name}】
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                  {epilogue.commemorativeItem.description}
                </p>
              </div>

              {/* Saved Game Snapshot Details */}
              {savedData && (
                <div className="p-4 rounded-xs bg-[#ffffff] border border-[#a8c2a1] space-y-3 shadow-2xs">
                  <h5 className="text-xs font-bold text-[#556652] uppercase font-mono">
                    CLEARANCE SNAPSHOT DETAILS // 存檔快照紀錄
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#333333]">
                    <div>
                      <strong className="text-[#1a3964]">偵探特質：</strong>
                      <span>{savedData.selectedTrait === 'rationalist' ? '理智批判學派' : savedData.selectedTrait === 'intuitive' ? '敏銳直 Parses 直覺思維' : '靈感通靈體質'}</span>
                    </div>
                    <div>
                      <strong className="text-[#1a3964]">最後地點：</strong>
                      <span>{savedData.currentLocationName}</span>
                    </div>
                    <div>
                      <strong className="text-[#1a3964]">自由筆記條數：</strong>
                      <span>{savedData.freeNotes?.length || 0} 則</span>
                    </div>
                    <div>
                      <strong className="text-[#1a3964]">發現矛盾推理：</strong>
                      <span>{savedData.foundContradictions?.length || 0} 項</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: EXPORT & QR CODE */}
          {activeTab === 'export' && savedData && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="p-4 rounded-xs bg-[#ffffff] border border-[#a8c2a1] flex flex-col md:flex-row items-center gap-6 shadow-2xs">
                <div className="p-3 bg-[#ffffff] rounded-xs border border-[#a8c2a1] shadow-2xs shrink-0 flex items-center justify-center">
                  <canvas ref={qrCanvasRef} className="rounded-xs" />
                </div>

                <div className="space-y-3 w-full">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-[#eef5ec] text-[#1f4717] border border-[#83ab79] font-bold">
                      END-GAME CLEARANCE CERTIFICATE
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-[#1a3964]">
                      {epilogue.endingTitle} 通關密鑰憑證
                    </h4>
                    <p className="text-xs text-[#556652]">
                      使用手機相機掃描左側二維碼，即可直接在其他設備重溫此結局存檔與後日談！
                    </p>
                  </div>

                  {/* Password code box */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[#556652] font-mono font-bold">通關導出代碼：</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={exportKey}
                        className="w-full px-3 py-1.5 bg-[#f7faf5] border border-[#a8c2a1] rounded-xs text-xs font-mono text-[#1f4717] select-all font-bold"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(exportKey);
                          sound.playResolutionChord();
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2500);
                        }}
                        className="min-h-[34px] px-3.5 py-1 rounded-xs bg-[#3e6634] hover:bg-[#33552a] text-[#ffffff] font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer border border-[#2d4d25] shadow-2xs"
                      >
                        {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{isCopied ? '已複製' : '複製代碼'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:px-6 border-t border-[#a8c2a1] bg-[#e8f0e5] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#445544]">
            <Award className="w-4 h-4 text-[#2e6d24]" />
            <span className="font-mono text-[10px]">
              AX88 CLEARANCE DOSSIER // {epilogue.archiveSealCode} // 結案印章【{epilogue.sealText}】
            </span>
          </div>

          <div className="flex items-center gap-2">
            {savedData && onLoadSave && (
              <button
                onClick={() => {
                  sound.playResolutionChord();
                  onLoadSave(savedData);
                  onClose();
                }}
                className="min-h-[34px] px-4 py-1.5 rounded-xs bg-[#3e6634] hover:bg-[#33552a] text-[#ffffff] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-[#2d4d25] shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>載入此結局存檔重返調查</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="min-h-[34px] px-4 py-1.5 rounded-xs bg-[#ffffff] hover:bg-[#f4f8f2] border border-[#a8c2a1] text-[#333333] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              關閉後日談
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
