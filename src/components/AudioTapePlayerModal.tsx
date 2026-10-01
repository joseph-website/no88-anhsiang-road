import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Disc,
  Sparkles,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { sound } from '../services/soundEngine';
import { safeStorageGet, safeStorageSet } from '../services/storageHelper';

interface AudioTapePlayerModalProps {
  playerName?: string;
  onClose: () => void;
  onModifySan?: (delta: number) => void;
  onAddJournalEntry?: (entry: {
    category: 'system' | 'action' | 'dialogue';
    title: string;
    content: string;
    location?: string;
    sanDelta?: number;
    highlightBadge?: string;
  }) => void;
}

interface AudioLine {
  timeSec: number;
  speaker: string;
  roleType: 'system' | 'ambient' | 'zhang' | 'alert';
  text: string;
  subtext?: string;
}

const TAPE_AUDIO_LINES: AudioLine[] = [
  {
    timeSec: 0,
    speaker: '系統紀錄',
    roleType: 'system',
    text: '▶ [磁帶運轉中]……微型高敏麥克風啟動……捕捉到電台雜訊與微弱高頻電流聲……',
    subtext: 'REC_2012_FINAL_WARNING.WAV / 採樣率: 22.05kHz 單聲道'
  },
  {
    timeSec: 4,
    speaker: '環境雜音',
    roleType: 'ambient',
    text: '（聽筒中傳來粗重凌亂的喘息聲，金屬門把被瘋狂轉動與撞擊）……呼……呼……門打不開……！',
    subtext: '背景伴隨金屬鑰匙激烈晃動碰撞聲'
  },
  {
    timeSec: 9,
    speaker: '環境雜音',
    roleType: 'alert',
    text: '喀嗒！喀嗒喀嗒喀嗒！——（深處傳來數十台機械打字機近乎癲狂的密集敲擊回音，震耳欲聾）',
    subtext: '音頻分析：機械打字機敲擊頻率高達每分鐘 600 字，非人類手速所能達成'
  },
  {
    timeSec: 15,
    speaker: '張浩（失蹤好友）',
    roleType: 'zhang',
    text: '「它們在打字……那些打字機根本停不下來……這棟樓根本就沒有什麼404專案辦公室！」',
    subtext: '語氣極度恐慌、沙啞顫抖'
  },
  {
    timeSec: 22,
    speaker: '張浩（失蹤好友）',
    roleType: 'zhang',
    text: '「只要大家還在相信規則……只要住戶還在自發遵守那些狗屁規約，404就會一直吃人……！」',
    subtext: '揭露核心真相：恐懼與盲從才是怪異的生存養分'
  },
  {
    timeSec: 30,
    speaker: '張浩（失蹤好友）',
    roleType: 'zhang',
    text: '「規則不是為了保護我們！是為了把我們困在大樓裡、同化成維持它自我繁衍的養分……！」',
    subtext: '破除規則保護論'
  },
  {
    timeSec: 38,
    speaker: '張浩（失蹤好友）',
    roleType: 'zhang',
    text: '「如果你聽到了這段錄音……千萬不要相信穿紅衣服的！快去把——」',
    subtext: '通話即將中斷'
  },
  {
    timeSec: 44,
    speaker: '突發異象',
    roleType: 'alert',
    text: '【轟！！！一聲沉重的破門撞擊聲與尖叫聲，隨後化為劇烈的白噪音與金屬摩擦聲】',
    subtext: '錄音終端受到高能物理衝擊'
  },
  {
    timeSec: 49,
    speaker: '系統結語',
    roleType: 'system',
    text: '■ [錄音播放完畢，指示燈轉為長綠。確認錄音者為委託人尋找的失蹤好友——張浩！]',
    subtext: '語音日誌已完整解讀並收錄至偵探備忘手記'
  }
];

const TOTAL_DURATION_SEC = 52;
const STORAGE_TAPE_LISTENED_KEY = 'ROOM_404_TAPE_RECORDER_LISTENED_V1';

export const AudioTapePlayerModal: React.FC<AudioTapePlayerModalProps> = ({
  playerName = '',
  onClose,
  onModifySan,
  onAddJournalEntry
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasUnlockedJournal, setHasUnlockedJournal] = useState<boolean>(() => {
    return safeStorageGet(STORAGE_TAPE_LISTENED_KEY) === 'true';
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-trigger playback on initial modal mount
  useEffect(() => {
    handlePlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTimeSec(prev => {
          if (prev >= TOTAL_DURATION_SEC) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return TOTAL_DURATION_SEC;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Check completion to unlock journal & SAN
  useEffect(() => {
    if (currentTimeSec >= 45 && !hasUnlockedJournal) {
      setHasUnlockedJournal(true);
      safeStorageSet(STORAGE_TAPE_LISTENED_KEY, 'true');
      
      onModifySan?.(3);
      onAddJournalEntry?.({
        category: 'action',
        title: '【錄音解析】：張浩留下的最後語音日誌',
        content: '透過微型錄音筆播放張浩的最後留存錄音：「它們在打字……那些打字機停不下來！只要大家相信規則，404就會一直吃人……規則不是為了保護我們，是為了把我們困在大樓裡同化成維持它運作的養分……！」\n★ 關鍵解析：規則是怪異自我繁殖的工具，越遵守越深陷其中！（認知明晰，心神稍微平復）',
        location: '四樓404門外',
        sanDelta: 3,
        highlightBadge: '核心真相'
      });
      sound.playTension();
    }
  }, [currentTimeSec, hasUnlockedJournal, onModifySan, onAddJournalEntry]);

  const handlePlay = () => {
    if (currentTimeSec >= TOTAL_DURATION_SEC) {
      setCurrentTimeSec(0);
    }
    setIsPlaying(true);
    sound.playSwitch();
  };

  const handlePause = () => {
    setIsPlaying(false);
    sound.playClick();
  };

  const handleRewind = () => {
    setCurrentTimeSec(0);
    setIsPlaying(true);
    sound.playSwitch();
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find currently active lines up to current time
  const visibleLines = TAPE_AUDIO_LINES.filter(line => line.timeSec <= currentTimeSec);
  const currentActiveLine = visibleLines[visibleLines.length - 1] || TAPE_AUDIO_LINES[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-[#1a1410] border-2 border-[#5c3e23] rounded-xl max-w-3xl w-full h-[90vh] max-h-[760px] flex flex-col shadow-2xl overflow-hidden text-[#e8dac1]"
      >
        {/* Device Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3d2714] px-5 py-3.5 bg-[#26190f] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#140e08] border border-[#6b4728] text-[#d4a359]">
              <Disc className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm md:text-base font-bold text-[#f5ebd7] tracking-wider font-mono">
                  SANY-AUDIO VOX RECORDER // TR-98404
                </h3>
                <span className="text-[10px] px-2 py-0.2 rounded bg-[#382314] border border-[#664326] text-[#deb887] font-mono">
                  DECODING MODE
                </span>
              </div>
              <p className="text-[11px] text-[#9c846a] font-typewriter">
                失蹤者張浩遺留在404號房門前的微型錄音筆語音日誌
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-[#9c846a] hover:text-[#f5ebd7] transition-colors p-1.5 rounded-lg bg-[#1a120b] hover:bg-[#332012] border border-[#4d321d] min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="關閉播放器"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black custom-scrollbar">
          
          {/* Cassette Mechanical Deck Display */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl space-y-4">
            
            {/* Top Deck Info Bar */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-neutral-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-rose-500 animate-ping' : 'bg-neutral-600'}`} />
                <span className="text-neutral-300 font-bold">
                  {isPlaying ? '▶ PLAYING (4.75 cm/s)' : '❚❚ PAUSED'}
                </span>
              </div>

              <div className="text-cyan-400 font-mono text-sm tracking-widest bg-black px-2.5 py-0.5 rounded border border-cyan-900/60">
                {formatTime(currentTimeSec)} / {formatTime(TOTAL_DURATION_SEC)}
              </div>

              <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                <span>TAPE-A</span>
                <span className="text-emerald-400 font-bold">DOLBY NR-B</span>
              </div>
            </div>

            {/* Cassette Reels Window */}
            <div className="h-28 md:h-32 bg-black/80 rounded-xl border border-neutral-800 flex items-center justify-around px-6 relative overflow-hidden shadow-inner">
              
              {/* Left Reel */}
              <div className="flex flex-col items-center">
                <div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-neutral-700 bg-neutral-900 flex items-center justify-center relative shadow-md"
                  style={{
                    transform: isPlaying ? `rotate(${currentTimeSec * 50}deg)` : 'none',
                    transition: 'transform 0.1s linear'
                  }}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-neutral-600 bg-black flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-neutral-500" />
                  </div>
                  {/* Reel spokes */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-neutral-700" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rotate-90">
                    <div className="w-full h-0.5 bg-neutral-700" />
                  </div>
                </div>
                <span className="text-[9px] font-mono text-neutral-500 mt-1">SUPPLY</span>
              </div>

              {/* Center Tape Window & VU Meters */}
              <div className="flex flex-col items-center justify-center space-y-2 z-10">
                <div className="text-[10px] font-mono text-neutral-400 bg-neutral-900/80 px-3 py-1 rounded border border-neutral-700">
                  MAGNETIC TAPE // 2012-07-14
                </div>

                {/* Animated VU Spectrum Bars */}
                <div className="flex items-center gap-1 h-8 px-2 bg-black/90 rounded border border-neutral-800">
                  {Array.from({ length: 18 }).map((_, i) => {
                    const activeHeight = isPlaying 
                      ? Math.max(4, Math.sin(i * 0.9 + currentTimeSec * 4) * 16 + 14) 
                      : 3;
                    return (
                      <div 
                        key={i} 
                        className={`w-1 rounded-full transition-all duration-100 ${
                          i > 14 ? 'bg-rose-500' : i > 10 ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                        style={{ height: `${activeHeight}px` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Right Reel */}
              <div className="flex flex-col items-center">
                <div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-neutral-700 bg-neutral-900 flex items-center justify-center relative shadow-md"
                  style={{
                    transform: isPlaying ? `rotate(${currentTimeSec * 50}deg)` : 'none',
                    transition: 'transform 0.1s linear'
                  }}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-neutral-600 bg-black flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-neutral-500" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-neutral-700" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rotate-90">
                    <div className="w-full h-0.5 bg-neutral-700" />
                  </div>
                </div>
                <span className="text-[9px] font-mono text-neutral-500 mt-1">TAKE-UP</span>
              </div>
            </div>

            {/* Playback Progress Slider */}
            <div className="space-y-1">
              <input 
                type="range" 
                min={0} 
                max={TOTAL_DURATION_SEC} 
                value={currentTimeSec}
                onChange={(e) => setCurrentTimeSec(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Hardware Tactile Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRewind}
                  className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 transition-all hover:scale-105 active:scale-95 flex items-center gap-1 text-xs font-mono"
                  title="重頭播放"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">REWIND</span>
                </button>

                {isPlaying ? (
                  <button
                    onClick={handlePause}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-xs md:text-sm font-mono shadow-lg shadow-amber-950"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>PAUSE</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePlay}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-xs md:text-sm font-mono shadow-lg shadow-cyan-950"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>PLAY</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isMuted 
                      ? 'bg-rose-950/80 border-rose-600 text-rose-300' 
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                  }`}
                  title={isMuted ? '解除靜音' : '靜音'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {hasUnlockedJournal && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-serif">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>已收錄至手記</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Subtitles / Audio Transcript Box */}
          <div className="p-5 rounded-2xl bg-black/90 border border-neutral-800 space-y-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider">
                  實時語音逐字解碼紀錄 (TRANSCRIPTION DECODER)
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">
                {visibleLines.length} / {TAPE_AUDIO_LINES.length} 語音節點
              </span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
              {visibleLines.map((line, idx) => {
                const isCurrent = idx === visibleLines.length - 1;
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent 
                        ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30' 
                        : 'bg-neutral-900/40 border-neutral-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className={`font-bold ${
                        line.roleType === 'zhang' ? 'text-cyan-300' :
                        line.roleType === 'alert' ? 'text-rose-400' :
                        'text-neutral-400'
                      }`}>
                        {line.speaker}
                      </span>
                      <span className="text-neutral-500 text-[10px]">
                        +{line.timeSec}s
                      </span>
                    </div>

                    <p className={`text-xs md:text-sm font-serif leading-relaxed ${
                      line.roleType === 'zhang' ? 'text-cyan-100 font-bold' :
                      line.roleType === 'alert' ? 'text-rose-200 font-semibold' :
                      'text-neutral-300'
                    }`}>
                      {line.text}
                    </p>

                    {line.subtext && (
                      <p className="text-[10px] text-neutral-400 font-mono mt-1 border-t border-neutral-800/60 pt-1">
                        【音軌備註】：{line.subtext}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Key Truth Analysis Summary */}
          {hasUnlockedJournal && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-600/60 space-y-2 text-xs font-serif text-emerald-200"
            >
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>【解析關鍵推論】：規則不是防護罩，而是恐懼與盲從的陷阱</span>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                張浩在失蹤前的生死一刻，終於看穿了大樓怪異的真面目——404號房正是依靠住客對「不可違背之規則」的盲目服從，不斷強化自身的存在與同化力量。只要能以清晰的理性徹底解構這套規則，怪異就會瓦解！
              </p>
            </motion.div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="border-t border-neutral-800 px-6 py-3.5 bg-neutral-950/90 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-neutral-500 font-serif">
            錄音日誌隨時可在【隨身物證檔案袋】中重新調閱與聆聽
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-serif text-xs md:text-sm font-semibold transition-all"
          >
            關閉播放器
          </button>
        </div>
      </motion.div>
    </div>
  );
};
