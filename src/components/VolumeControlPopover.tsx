import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  Music,
  CloudRain,
  Sparkles,
  Sliders,
  X,
  RotateCcw
} from 'lucide-react';
import { sound } from '../services/soundEngine';

interface VolumeControlPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  ambientEnabled: boolean;
  onToggleSound: () => void;
  onToggleAmbient: () => void;
}

export const VolumeControlPopover: React.FC<VolumeControlPopoverProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  ambientEnabled,
  onToggleSound,
  onToggleAmbient
}) => {
  const [masterVol, setMasterVol] = useState<number>(() => Math.round(sound.getMasterVolume() * 100));
  const [sfxVol, setSfxVol] = useState<number>(() => Math.round(sound.getSfxVolume() * 100));
  const [bgmVol, setBgmVol] = useState<number>(() => Math.round(sound.getBgmVolume() * 100));
  const [rainVol, setRainVol] = useState<number>(() => Math.round(sound.getRainVolume() * 100));

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMasterChange = (val: number) => {
    setMasterVol(val);
    sound.setMasterVolume(val / 100);
  };

  const handleSfxChange = (val: number) => {
    setSfxVol(val);
    sound.setSfxVolume(val / 100);
  };

  const handleBgmChange = (val: number) => {
    setBgmVol(val);
    sound.setBgmVolume(val / 100);
  };

  const handleRainChange = (val: number) => {
    setRainVol(val);
    sound.setRainVolume(val / 100);
  };

  const handleResetDefaults = () => {
    sound.playClick();
    handleMasterChange(50);
    handleSfxChange(50);
    handleBgmChange(40);
    handleRainChange(40);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, y: -6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.96 }}
        transition={{ duration: 0.12 }}
        className="absolute right-0 top-11 z-50 w-72 retro-forum-modal-window shadow-2xl overflow-hidden select-none font-sans text-[#1a2e18]"
      >
        {/* Retro Header */}
        <div className="retro-forum-modal-header flex items-center justify-between px-3 py-1.5 border-b border-[#1c3819]">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#a3e635]" />
            <span className="font-bold text-xs tracking-wide text-white">
              音訊控制台 (Audio Mixer)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] font-mono font-bold text-[#fef08a] hover:text-white px-1 py-0.2 bg-[#1a3818] border border-[#a3e635]/60 hover:bg-[#2b5828] cursor-pointer"
          >
            [X]
          </button>
        </div>

        <div className="p-3 bg-[#f4f8f3] space-y-3">
          {/* Master Volume */}
          <div className="p-2 bg-white border border-[#9ab897] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#1c381a] flex items-center gap-1.5 font-bold">
                <Volume2 className="w-3.5 h-3.5 text-[#2b5828]" />
                <span>主音量 (Master)</span>
              </span>
              <span className="font-mono text-[11px] text-[#2b5828] font-bold bg-[#e8f2e6] px-1.5 py-0.2 border border-[#adc7ab]">
                {masterVol}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={masterVol}
              onChange={(e) => handleMasterChange(Number(e.target.value))}
              className="w-full accent-[#2b5828] h-1.5 bg-[#d2e2d0] rounded cursor-pointer"
            />
          </div>

          {/* Sound Effects (SFX) Volume */}
          <div className="p-2 bg-white border border-[#9ab897] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#2c402b] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#856117]" />
                <span className="font-medium">音效 (打字/指針/紙張)</span>
              </span>
              <span className="font-mono text-[11px] text-[#856117] font-bold bg-[#fdf8e2] px-1.5 py-0.2 border border-[#d9c575]">
                {sfxVol}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVol}
              onChange={(e) => handleSfxChange(Number(e.target.value))}
              className="w-full accent-[#856117] h-1.5 bg-[#d2e2d0] rounded cursor-pointer"
            />
          </div>

          {/* BGM Volume & Toggle */}
          <div className="p-2 bg-white border border-[#9ab897] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleSound();
                }}
                className={`flex items-center gap-1 px-1.5 py-0.5 border text-[10px] font-bold transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-[#e2f0e0] border-[#558451] text-[#1c4718]'
                    : 'bg-[#eeeeee] border-[#b0b0b0] text-[#777777]'
                }`}
              >
                <Music className="w-3 h-3" />
                <span>{soundEnabled ? 'BGM 氛圍音樂：ON' : 'BGM 氛圍音樂：MUTE'}</span>
              </button>
              <span className="font-mono text-[11px] text-[#1c4718] font-bold">
                {soundEnabled ? `${bgmVol}%` : 'OFF'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              disabled={!soundEnabled}
              value={bgmVol}
              onChange={(e) => handleBgmChange(Number(e.target.value))}
              className={`w-full accent-[#2b5828] h-1.5 bg-[#d2e2d0] rounded ${
                soundEnabled ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Thunderstorm Rain Ambience & Toggle */}
          <div className="p-2 bg-white border border-[#9ab897] space-y-1">
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleAmbient();
                }}
                className={`flex items-center gap-1 px-1.5 py-0.5 border text-[10px] font-bold transition-all cursor-pointer ${
                  ambientEnabled
                    ? 'bg-[#dff0f7] border-[#438aa8] text-[#115570]'
                    : 'bg-[#eeeeee] border-[#b0b0b0] text-[#777777]'
                }`}
              >
                <CloudRain className="w-3 h-3" />
                <span>{ambientEnabled ? '窗外暴雨音：ON' : '窗外暴雨音：OFF'}</span>
              </button>
              <span className="font-mono text-[11px] text-[#115570] font-bold">
                {ambientEnabled ? `${rainVol}%` : 'OFF'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              disabled={!ambientEnabled}
              value={rainVol}
              onChange={(e) => handleRainChange(Number(e.target.value))}
              className={`w-full accent-[#115570] h-1.5 bg-[#d2e2d0] rounded ${
                ambientEnabled ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Footer info & Reset */}
          <div className="pt-2 border-t border-[#adc7ab] flex items-center justify-between text-[10px] text-[#4a6b47] font-mono">
            <span>快捷鍵 [M] 靜音</span>
            <button
              onClick={handleResetDefaults}
              className="retro-web-btn px-2 py-0.5 text-[10px] flex items-center gap-1 font-bold"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>重設預設值</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
