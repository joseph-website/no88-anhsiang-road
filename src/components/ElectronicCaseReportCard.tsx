import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Lock,
  Volume2,
  VolumeX,
  Shield,
  Eye,
  EyeOff,
  Terminal
} from 'lucide-react';
import { EndingId } from '../types';
import { ENDING_ELECTRONIC_DOSSIERS } from '../data/endingDossiersData';
import { sound } from '../services/soundEngine';

interface ElectronicCaseReportCardProps {
  endingId: EndingId;
  playerName: string;
  san: number;
  investigationDay: number;
  investigationDateText: string;
  inventoryCount: number;
  totalInventoryCount?: number;
}

export const ElectronicCaseReportCard: React.FC<ElectronicCaseReportCardProps> = ({
  endingId,
  playerName,
  san,
  investigationDay,
  investigationDateText,
  inventoryCount,
  totalInventoryCount = 6
}) => {
  const dossier = ENDING_ELECTRONIC_DOSSIERS[endingId] || ENDING_ELECTRONIC_DOSSIERS.ending8;
  const [isDecrypted, setIsDecrypted] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<'official' | 'classified'>('official');

  const handleToggleDecrypt = () => {
    if (!isDecrypted) {
      sound.playInspectSuccess();
      setIsDecrypted(true);
    } else {
      sound.playClick();
      setIsDecrypted(false);
    }
  };

  const handlePlayWaveform = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      if (endingId === 'ending8' || endingId === 'ending5') {
        sound.playResolutionChord();
      } else if (endingId === 'ending4' || endingId === 'ending7') {
        sound.playGlitch();
      } else {
        sound.playPaper();
      }
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 4500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-neutral-400">卷宗模式：</span>
          <div className="inline-flex rounded-lg p-0.5 bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => {
                sound.playClick();
                setActiveLayer('official');
              }}
              className={`px-3 py-1 rounded-md text-xs transition-all ${
                activeLayer === 'official'
                  ? 'bg-neutral-800 text-amber-200 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              📄 公開結案通報
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveLayer('classified');
              }}
              className={`px-3 py-1 rounded-md text-xs transition-all flex items-center gap-1.5 ${
                activeLayer === 'classified'
                  ? 'bg-amber-950/80 border border-amber-500/60 text-amber-300 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>🔐 私密附錄檔案</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500 flex items-center gap-2">
          <span>檔案代號：<b className="text-neutral-300">{dossier.caseFileCode}</b></span>
        </div>
      </div>

      {/* Main Electronic Paper Window (2000s / 2012 System Style) */}
      <div className="bg-[#121110] border-2 border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden font-serif relative">
        {/* Top OS Window Header Bar */}
        <div className="bg-neutral-900 border-b border-neutral-700 px-4 py-2.5 flex items-center justify-between text-xs font-mono select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-bold text-neutral-300 truncate">
              [電子卷宗] {dossier.caseFileCode}.doc - 私家偵探公會官方系統
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 hidden sm:block">
            唯讀模式 (Read-Only) • 數位加密封存
          </div>
        </div>

        {/* Paper Body */}
        <div className="p-6 md:p-8 space-y-6 text-neutral-200 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:20px_20px]">
          {/* Header Metadata Title */}
          <div className="border-b-2 border-neutral-700/80 pb-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900 border border-neutral-700 text-amber-300">
                CASE REPORT // 2012 REVISION
              </span>
              <span className="text-xs font-mono text-neutral-400">
                結案日期：{investigationDateText} (歷時 {investigationDay} 天)
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-bold font-serif text-neutral-100 tracking-wide pt-1">
              安祥路88號大樓事件・官方調查結案全貌報告書
            </h3>

            {/* Officer Identification Bar (NO Trait name, NO S/A grades, Pure Detective Role & Personal Verdict) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-mono bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
              <div>
                <span className="text-neutral-500">主辦承辦人：</span>
                <span className="text-sm font-bold text-amber-200 font-serif ml-1">
                  {playerName || '調查員'}
                </span>
              </div>

              <div>
                <span className="text-neutral-500">現場物證鏈：</span>
                <span className="text-emerald-400 font-bold ml-1">
                  {inventoryCount} / {totalInventoryCount} 件完備
                </span>
              </div>

              <div>
                <span className="text-neutral-500">結案心理狀態：</span>
                <span className="text-neutral-300 font-bold ml-1">
                  {san >= 70 ? '理智尚存' : san >= 40 ? '精神緊繃' : '瀕臨極限'}
                </span>
              </div>
            </div>
          </div>

          {/* LAYER 1: Official Public Investigation Summary */}
          {activeLayer === 'official' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Investigation Summary Section */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>【調查摘要與現場實證結論】</span>
                </h4>
                <div className="space-y-2 bg-neutral-950/80 p-4 rounded-xl border border-neutral-800/80 text-sm leading-relaxed text-neutral-200 font-serif shadow-inner">
                  {dossier.publicInvestigationSummary.map((para, i) => (
                    <p key={i} className="pl-3 border-l-2 border-amber-600/60 py-0.5">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Detective Personal Official Verdict (承辦人對案件之親筆總評) */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>【承辦人親筆結案評語】</span>
                </h4>
                <div className="bg-gradient-to-r from-neutral-950 via-indigo-950/20 to-neutral-950 p-4 rounded-xl border border-indigo-900/60 text-sm italic font-serif leading-relaxed text-indigo-200/95 shadow-md">
                  {dossier.detectiveOfficialVerdict}
                  <div className="mt-2 text-right text-xs font-mono not-italic text-neutral-400">
                    —— 承辦私家偵探：{playerName || '調查員'} 簽署
                  </div>
                </div>
              </div>

              {/* Interactive Audio Waveform Attachment */}
              {dossier.audioWaveformNote && (
                <div className="bg-neutral-950/90 border border-neutral-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                    <span className="text-neutral-300 font-bold flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>{dossier.audioWaveformNote.label}</span>
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {dossier.audioWaveformNote.sampleRateText}
                    </span>
                  </div>

                  {/* Simulated Waveform Visualization */}
                  <div className="bg-black/80 rounded-lg p-3 border border-neutral-800 flex items-center gap-3">
                    <button
                      onClick={handlePlayWaveform}
                      className="p-2.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/70 text-emerald-300 transition-all shadow cursor-pointer shrink-0"
                      title="播放音訊還原"
                    >
                      {isPlayingAudio ? (
                        <VolumeX className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1.5 overflow-hidden">
                      <div className="flex items-end gap-1 h-6 w-full px-1">
                        {[40, 65, 30, 85, 95, 45, 60, 30, 75, 90, 50, 70, 35, 60, 80, 45, 90, 65, 35, 80, 50, 30, 70, 95, 40].map((h, idx) => (
                          <span
                            key={idx}
                            style={{ height: isPlayingAudio ? `${Math.min(100, h + (Math.random() * 20 - 10))}%` : `${h * 0.4}%` }}
                            className={`flex-1 rounded-sm transition-all duration-150 ${
                              isPlayingAudio ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs font-serif text-neutral-300 truncate">
                        語音文字還原：{dossier.audioWaveformNote.transcript}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* LAYER 2: Classified Attachment (Redacted Text Scratch / Decrypt Feature) */}
          {activeLayer === 'classified' && dossier.classifiedAttachment && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-neutral-950 p-4 rounded-xl border border-amber-900/60 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-sm font-bold font-serif text-amber-200 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>{dossier.classifiedAttachment.title}</span>
                    </h4>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      {dossier.classifiedAttachment.description}
                    </p>
                  </div>

                  <button
                    onClick={handleToggleDecrypt}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                      isDecrypted
                        ? 'bg-neutral-800 text-neutral-300 border border-neutral-600 hover:bg-neutral-700'
                        : 'bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-500'
                    }`}
                  >
                    {isDecrypted ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                        <span>重新遮蔽塗黑字元</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>刮開塗黑 / 立即解密內容</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Redacted vs Unredacted Content Lines */}
                <div className="space-y-2.5 pt-2 text-sm leading-relaxed font-serif bg-black/60 p-4 rounded-lg border border-neutral-800/80">
                  {(isDecrypted ? dossier.classifiedAttachment.unredactedContent : dossier.classifiedAttachment.redactedContent).map((line, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-xs font-mono text-neutral-500 mt-1">[{idx + 1}]</span>
                      <p className={isDecrypted ? 'text-amber-100 font-medium' : 'text-neutral-400'}>
                        {line}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Bottom Official Electronic Stamp & Seal */}
          <div className="pt-4 border-t-2 border-neutral-700/80 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5 text-[11px] font-mono text-neutral-500">
              <div>發行機構：私家偵探商業同業公會 • 電子鑑識審查處</div>
              <div>存檔標記：VERIFIED-ARG-2012-ELECTRONIC-ARCHIVE</div>
            </div>

            {/* Red Retro Digital Stamp */}
            <div className={`border-2 rounded-xl px-4 py-1.5 text-center rotate-[-3deg] shadow-lg font-mono ${
              dossier.electronicStamp.color === 'emerald'
                ? 'border-emerald-600 bg-emerald-950/60 text-emerald-300'
                : dossier.electronicStamp.color === 'crimson'
                  ? 'border-red-600 bg-red-950/60 text-red-300'
                  : dossier.electronicStamp.color === 'purple'
                    ? 'border-purple-600 bg-purple-950/60 text-purple-300'
                    : 'border-amber-600 bg-amber-950/60 text-amber-300'
            }`}>
              <div className="text-xs font-bold tracking-widest uppercase">
                ★ {dossier.electronicStamp.statusText} ★
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                SIGNED: {dossier.electronicStamp.signDate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
