import React, { useEffect, useState } from 'react';
import { sound } from '../services/soundEngine';

interface GlitchOverlayProps {
  san: number;
  reducedEffects?: boolean;
  completedWeek1?: boolean;
}

export const GlitchOverlay: React.FC<GlitchOverlayProps> = ({ 
  san, 
  reducedEffects = false,
  completedWeek1 = false
}) => {
  const [flicker, setFlicker] = useState(false);
  const [flickerIntensity, setFlickerIntensity] = useState(0.2);
  const [whisper, setWhisper] = useState<string | null>(null);
  const [whisperPos, setWhisperPos] = useState({ top: 50, left: 50, rot: 0 });
  const [hallucinationSilhouette, setHallucinationSilhouette] = useState(false);
  const [noiseShift, setNoiseShift] = useState({ x: 0, y: 0 });

  // In Round 1 (completedWeek1 is false), completely disable glitch, hallucinatory whispers, and heartbeats
  const isEnabled = completedWeek1;

  // Noise shimmer effect that updates position dynamically based on SAN
  useEffect(() => {
    if (!isEnabled || san >= 90) return;
    const noiseSpeed = Math.max(80, san * 3);
    const noiseTimer = setInterval(() => {
      setNoiseShift({
        x: (Math.random() - 0.5) * (10 + (100 - san) * 0.15),
        y: (Math.random() - 0.5) * (10 + (100 - san) * 0.15)
      });
    }, noiseSpeed);

    return () => clearInterval(noiseTimer);
  }, [san, isEnabled]);

  // Synchronize continuous SAN heartbeat tension
  useEffect(() => {
    if (!isEnabled) {
      sound.updateSanHeartbeat(100);
      return;
    }
    sound.updateSanHeartbeat(san);
    return () => {
      sound.updateSanHeartbeat(100);
    };
  }, [san, isEnabled]);

  const whispers = [
    '它在看你……',
    '不要相信紅色制服',
    '404一直都在，它從未搬走',
    '規則是要管理它，不是保護你',
    '為什麼電梯按鈕沒有停？',
    '假裝你什麼都不知道……',
    '你也是404號房的房客嗎？',
    '回頭看看警衛室的椅子……',
    '不要讀最後一條規則！',
    '牆壁後面有指甲抓撓的聲音',
    '天花板的通風口在滴水……',
    '張浩真的存在過嗎？還是你捏造的他？',
    '你的手背上正在滲出暗紅色的字跡……',
    '你確定你現在醒著嗎？',
    '呼吸……心跳……不要回頭……',
    '門縫外有一雙穿著紅色雨鞋的腳正停著……',
    '你已經忘記自己最初為什麼走進這棟大樓了。'
  ];

  // Random flicker, audio whispers, tinnitus, and visual hallucinations dynamically scaled with SAN
  useEffect(() => {
    if (!isEnabled || san >= 80) return;

    // Dynamic interval: 100 SAN = no effect, 75 SAN = 1800ms, 50 SAN = 1000ms, 25 SAN = 450ms, 10 SAN = 250ms
    const intervalTime = Math.max(250, san * 22);

    const timer = setInterval(() => {
      // 1. Dynamic Screen Glitch Jitter & Opacity
      const glitchChance = Math.min(0.92, (100 - san) / 60);
      if (Math.random() < glitchChance) {
        // Higher intensity / opacity as SAN drops
        const calculatedIntensity = Math.min(0.75, 0.15 + (100 - san) * 0.006);
        setFlickerIntensity(calculatedIntensity);
        setFlicker(true);

        const flickerDuration = Math.min(220, 50 + (100 - san) * 1.5);
        setTimeout(() => setFlicker(false), flickerDuration);
      }

      // 2. Audio & Visual Whispers (Scales from SAN < 60)
      if (san < 60 && Math.random() < (0.2 + (60 - san) * 0.008)) {
        const randomMsg = whispers[Math.floor(Math.random() * whispers.length)];
        setWhisper(randomMsg);
        setWhisperPos({
          top: 15 + Math.random() * 65,
          left: 10 + Math.random() * 65,
          rot: (Math.random() - 0.5) * 16
        });

        // Trigger audio hallucination whisper sound
        sound.playHallucinationWhisper();

        setTimeout(() => setWhisper(null), 1600 + Math.random() * 1200);
      }

      // 3. Tinnitus / Ear Ringing or Deep Sub-bass dread when SAN is critically low (< 35)
      if (san < 35 && Math.random() < (0.2 + (35 - san) * 0.015)) {
        if (Math.random() < 0.5) {
          sound.playTinnitus();
        } else {
          sound.playDeepDreadPulse();
        }
      }

      // 4. Ghost Silhouette / Room 404 Mirage (< 25 SAN)
      if (san < 25 && Math.random() < 0.25) {
        setHallucinationSilhouette(true);
        setTimeout(() => setHallucinationSilhouette(false), 450);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [san, isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none transition-opacity duration-300"
      style={{ opacity: reducedEffects ? 0.3 : 1 }}
    >
      {/* CRT Scanline Effect */}
      <div 
        className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px]"
      />

      {/* Dynamic Red Ambient Light Bleed (紅光滲透) - Continuous scaling with SAN reduction */}
      {san < 85 && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000 mix-blend-screen animate-pulse"
          style={{
            background: `radial-gradient(ellipse at center, rgba(180, 20, 20, ${Math.min(0.35, (85 - san) * 0.0042)}) 0%, rgba(120, 0, 0, ${Math.min(0.65, (85 - san) * 0.0075)}) 70%, rgba(70, 0, 0, ${Math.min(0.85, (85 - san) * 0.01)}) 100%)`,
            animationDuration: `${Math.max(1.2, 0.8 + san * 0.04)}s`
          }}
        />
      )}

      {/* Dynamic Noise Grain Shimmer (噪點閃爍增加) - Intensifies as SAN drops */}
      {san < 80 && (
        <div 
          className="absolute inset-[-20px] pointer-events-none opacity-80 mix-blend-overlay transition-opacity duration-300"
          style={{
            opacity: Math.min(0.45, 0.04 + (80 - san) * 0.005),
            transform: `translate(${noiseShift.x}px, ${noiseShift.y}px)`,
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 0), radial-gradient(rgba(220, 40, 40, 0.3) 1px, transparent 0)`,
            backgroundSize: '4px 4px, 6px 6px',
            backgroundPosition: '0 0, 2px 2px'
          }}
        />
      )}

      {/* Dynamic Vignette & Blood-shot/Darkening edges based on SAN */}
      <div 
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{
          boxShadow: san < 30 
            ? `inset 0 0 ${160 - san * 2.5}px rgba(180, 10, 10, ${0.5 + (30 - san) * 0.016})`
            : san < 60 
              ? `inset 0 0 ${100 - san}px rgba(80, 0, 0, ${0.3 + (60 - san) * 0.005})`
              : 'inset 0 0 35px rgba(0, 0, 0, 0.3)'
        }}
      />

      {/* Screen Edge Blood Splatter & Grime Stains when SAN < 30 */}
      {san < 30 && (
        <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-85 transition-opacity duration-500">
          {/* Top-Left Blood/Grime Corner */}
          <div 
            className="absolute top-0 left-0 w-64 h-64 bg-radial from-red-950/70 via-red-900/40 to-transparent blur-md transform -translate-x-12 -translate-y-12 animate-pulse" 
            style={{ animationDuration: `${Math.max(1.2, san * 0.08)}s` }}
          />
          {/* Top-Right Blood/Grime Corner */}
          <div 
            className="absolute top-0 right-0 w-72 h-72 bg-radial from-rose-950/80 via-red-950/40 to-transparent blur-md transform translate-x-16 -translate-y-16 animate-pulse" 
            style={{ animationDuration: `${Math.max(1.4, san * 0.09)}s` }}
          />
          {/* Bottom-Left Blood Splatter / Veins Stains */}
          <div 
            className="absolute bottom-0 left-0 w-80 h-80 bg-radial from-red-950/90 via-neutral-950/60 to-transparent blur-lg transform -translate-x-16 translate-y-16 animate-pulse" 
            style={{ animationDuration: `${Math.max(1.1, san * 0.07)}s` }}
          />
          {/* Bottom-Right Grime Stain */}
          <div 
            className="absolute bottom-0 right-0 w-80 h-80 bg-radial from-red-900/80 via-black/50 to-transparent blur-md transform translate-x-14 translate-y-14 animate-pulse" 
            style={{ animationDuration: `${Math.max(1.3, san * 0.08)}s` }}
          />

          {/* Organic Pulsating Blood Vein Border */}
          <div 
            className="absolute inset-0 border-8 border-red-900/40 rounded-none mix-blend-color-burn filter blur-sm animate-pulse"
            style={{ 
              opacity: (30 - san) / 30,
              animationDuration: `${Math.max(0.9, san * 0.06)}s`
            }}
          />
        </div>
      )}

      {/* Screen Chromatic Aberration & Twitch Flicker */}
      {flicker && (
        <div 
          className="absolute inset-0 bg-red-950 mix-blend-color-dodge transition-all duration-75"
          style={{
            opacity: flickerIntensity,
            transform: `translate(${(Math.random() - 0.5) * (12 + (100 - san) * 0.1)}px, ${(Math.random() - 0.5) * (8 + (100 - san) * 0.08)}px)`
          }}
        />
      )}

      {/* Red Ghostly Silhouette Flash on extreme low SAN */}
      {hallucinationSilhouette && (
        <div className="absolute inset-0 bg-red-950/50 flex items-center justify-center animate-pulse">
          <div className="text-red-600/40 text-9xl font-mono font-black tracking-widest blur-sm transform scale-125 select-none">
            404
          </div>
        </div>
      )}

      {/* Subconscious Whispers (Hallucinations on low SAN) */}
      {whisper && (
        <div 
          className="absolute text-red-400/95 font-serif tracking-widest text-sm md:text-lg animate-pulse drop-shadow-[0_0_14px_rgba(255,0,0,0.95)] transition-all duration-300 pointer-events-none"
          style={{
            top: `${whisperPos.top}%`,
            left: `${whisperPos.left}%`,
            transform: `rotate(${whisperPos.rot}deg)`
          }}
        >
          <span className="bg-black/85 px-3 py-1.5 rounded-lg border border-red-800/80 backdrop-blur-md shadow-2xl">
            {whisper}
          </span>
        </div>
      )}

      {/* Bottom Cognitive Status Warning Line for low SAN */}
      {san <= 35 && (
        <div className="absolute bottom-2 left-4 text-xs font-mono text-red-400 tracking-widest animate-pulse flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded-md border border-red-900/80 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>[⚠ 認知受損 // 心理狀態瀕臨極限 // 幻聽與視覺血痕蔓延]</span>
        </div>
      )}
    </div>
  );
};
