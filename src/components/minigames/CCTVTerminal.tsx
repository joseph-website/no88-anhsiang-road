import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Tv,
  RotateCw,
  Play,
  Pause,
  CheckCircle,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { sound } from '../../services/soundEngine';

interface CCTVTerminalProps {
  onStartDeduction: () => void;
  isRebooted: boolean;
  playerName: string;
}

interface CamChannel {
  id: number;
  label: string;
  location: string;
  status: string;
  description: string;
  isAnomaly?: boolean;
}

export const CCTVTerminal: React.FC<CCTVTerminalProps> = ({ 
  onStartDeduction, 
  isRebooted,
  playerName
}) => {
  const [activeCam, setActiveCam] = useState<number>(4);
  const [isPlayingArchive, setIsPlayingArchive] = useState<boolean>(false);
  const [timestamp, setTimestamp] = useState<string>('02:44:19');
  const [showSelfAnomalyNotice, setShowSelfAnomalyNotice] = useState<boolean>(false);

  const channels: CamChannel[] = [
    { 
      id: 1, 
      label: 'CAM 01', 
      location: '1F 大樓大廳與警衛室外廊', 
      status: 'SIGNAL STABLE',
      description: '大廳空無一人。自動玻璃門外是一片漆黑的濃霧。'
    },
    { 
      id: 2, 
      label: 'CAM 02', 
      location: '2F 走廊與公共衛浴', 
      status: 'SIGNAL STABLE',
      description: '走廊兩側房門緊閉，清潔員的推車停在角落，水桶裡泛著詭異的微光。'
    },
    { 
      id: 3, 
      label: 'CAM 03', 
      location: '3F 梯間與安全門', 
      status: 'LOW FREQ NOISE',
      description: '綠色安全逃生指示牌閃爍不定，牆上的樓層字樣在「3」與「4」之間微幅抖動。'
    },
    { 
      id: 4, 
      label: 'CAM 04', 
      location: isRebooted ? '4F 廢棄違建走廊（真實認知）' : '4F 走廊與404號房門', 
      status: isRebooted ? 'TRUE FREQ (UNLOCKED)' : 'COGNITIVE ANOMALY',
      description: isRebooted 
        ? '原本光鮮的大理石走廊變成了斑駁剝落的灰泥牆，管線裸露，404房門滿是封條與鐵鍊。'
        : `【異常發現】畫面中赫然站著身穿大衣的「${playerName}」！正呆立在404門前，但你明明坐在警衛室裡……！`,
      isAnomaly: true
    },
    { 
      id: 5, 
      label: 'CAM 05', 
      location: '5F 走廊與504號房', 
      status: 'SIGNAL STABLE',
      description: '504號房的房門虛掩著，門把上殘留著濕漉漉的水痕。'
    },
    { 
      id: 6, 
      label: 'CAM 06', 
      location: '客用電梯內部車廂', 
      status: 'SIGNAL DISTORTION',
      description: '電梯控制面板上，在「3」與「5」之間，赫然有一個未標示數字的發光空白按鈕。'
    }
  ];

  // Dynamic time clock
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const sec = String(d.getSeconds()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      setTimestamp(`02:${min}:${sec}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChannelSwitch = (id: number) => {
    sound.playCctvBeep();
    setActiveCam(id);
    if (id === 4 && !isRebooted) {
      setShowSelfAnomalyNotice(true);
    }
  };

  const handleToggleArchive = () => {
    sound.playCctvBeep();
    setIsPlayingArchive(!isPlayingArchive);
  };

  const currentChannel = channels.find(c => c.id === activeCam) || channels[0];

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 md:p-6 text-neutral-200 shadow-2xl">
      {/* CCTV Top Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3 mb-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold text-neutral-300">SECURITY CCTV MONITOR SYSTEM v4.04</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
            LIVE MONITORING
          </span>
        </div>
        <div className="flex items-center gap-4 text-neutral-400">
          <span>REC ●</span>
          <span>{timestamp}</span>
          <span className="text-amber-400">AUTH: GUARD_CONSOLE</span>
        </div>
      </div>

      {/* Main CCTV Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Channel Selector Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            監視頻道列表 (CHANNELS)
          </div>
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => handleChannelSwitch(channel.id)}
              className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all flex items-center justify-between ${
                activeCam === channel.id
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500/50'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
              }`}
            >
              <div>
                <div className="font-bold">{channel.label}</div>
                <div className="text-[10px] text-neutral-500 truncate max-w-[140px]">
                  {channel.location}
                </div>
              </div>
              {channel.isAnomaly && !isRebooted && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
          ))}

          {/* CCTV Mode Controls */}
          <div className="mt-4 pt-3 border-t border-neutral-800 space-y-2">
            <button
              onClick={handleToggleArchive}
              className={`w-full py-2 px-3 rounded text-xs font-mono flex items-center justify-center gap-2 border transition-all ${
                isPlayingArchive
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {isPlayingArchive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlayingArchive ? '切回即時畫面 (LIVE)' : '調閱歷史錄影 (ARCHIVE)'}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onStartDeduction();
              }}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all shadow-lg ${
                isRebooted
                  ? 'bg-emerald-900/40 border border-emerald-600 text-emerald-300'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40 animate-pulse'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              {isRebooted ? '認知已校準・複查邏輯' : '展開矛盾推理 / 校準系統'}
            </button>
          </div>
        </div>

        {/* Main CCTV CRT Screen */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="relative aspect-video bg-black rounded-lg border-2 border-neutral-700 overflow-hidden shadow-inner flex flex-col justify-between p-4">
            {/* CRT Screen Scanlines & Glitch */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-40 z-10" />
            <div className="pointer-events-none absolute inset-0 bg-radial-vignette opacity-70 z-10" />

            {/* Screen Header Overlay */}
            <div className="relative z-20 flex items-center justify-between text-xs font-mono text-emerald-400 bg-black/60 px-3 py-1.5 rounded backdrop-blur-sm border border-emerald-900/50">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold">{currentChannel.label}: {currentChannel.location}</span>
              </div>
              <div>{isPlayingArchive ? '▶ ARCHIVE PLAYBACK: 00:15:32' : `FEED: ${currentChannel.status}`}</div>
            </div>

            {/* Channel Content Visualizer */}
            <div className="relative z-20 my-auto text-center p-4">
              {activeCam === 4 ? (
                isRebooted ? (
                  /* Rebooted True Vision 4F */
                  <div className="space-y-3">
                    <div className="text-emerald-400 font-mono text-xs tracking-wider">
                      [真實空間映射 // COGNITIVE DECOUPLING COMPLETE]
                    </div>
                    <div className="p-4 bg-neutral-900/80 border border-emerald-500/50 rounded-lg text-left max-w-lg mx-auto backdrop-blur-md">
                      <div className="text-sm font-bold text-neutral-100 mb-1 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        認知干擾已破除：四樓廢棄違建空間
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed font-serif">
                        監視器畫面中的假象瓦解了。原本光鮮明亮的走廊露出破損的水泥柱與生鏽水管。404號房門被大量打字機色帶與鐵絲纏繞，房門微啟，裡面傳出陣陣瘋狂的敲擊鍵盤聲。
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Anomaly Feed (Seeing Yourself) */
                  <div className="space-y-3">
                    <div className="text-red-500 font-mono text-xs tracking-wider animate-pulse flex items-center justify-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      [警告：監視器第6條規則觸發 // 觀測到自身存在於404號房門口]
                    </div>
                    <div className="p-4 bg-red-950/60 border border-red-600/60 rounded-lg text-left max-w-lg mx-auto backdrop-blur-md">
                      <div className="text-sm font-bold text-red-200 mb-1">
                        監視畫面中的你……正轉身看著鏡頭。
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        畫面上的人影身形、穿著大衣的輪廓與你一模一樣。但你此刻明明坐在警衛室裡操作鍵盤！
                        <br />
                        <span className="text-red-400 font-mono">
                          指引第7條：「若無法確認畫面中的自己所在空間是否為警衛室，請立即重啟監視系統並再次確認。」
                        </span>
                      </p>
                    </div>
                  </div>
                )
              ) : (
                /* Other Cam visual descriptions */
                <div className="p-4 bg-neutral-900/70 border border-neutral-700 rounded-lg text-left max-w-lg mx-auto backdrop-blur-md">
                  <div className="text-xs text-neutral-400 font-mono mb-1">
                    CAMERA FEED DESCRIPTION
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed">
                    {currentChannel.description}
                  </p>
                  {isPlayingArchive && (
                    <p className="text-xs text-amber-400 mt-2 font-mono border-t border-neutral-800 pt-2">
                      【錄影紀錄】：{playerName} 於 00:15 進入504號房，但調閱後續所有錄影，均無「離開504」或「走下一樓」的畫面……！
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Screen Bottom Overlay */}
            <div className="relative z-20 flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-black/60 px-3 py-1 rounded backdrop-blur-sm">
              <span>FOV: 92° // FPS: 24.0</span>
              <span className="text-neutral-500">SYSTEM STABLE // NO BYPASS ALLOWED</span>
            </div>
          </div>

          {/* Description & Investigation Notes below Screen */}
          <div className="mt-3 bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-300 flex items-start gap-3">
            <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-100">偵探筆記與監視手冊指引：</span>
              <p className="text-neutral-400 mt-0.5">
                警衛守則要求忽略監視器，但監視器操作指引明確寫著「本系統不會出錯」。透過畫面比對，四樓確實存在，某種力量在扭曲空間與身分認知，需梳理規約矛盾以校準認知。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
