import React, { useState, useEffect } from 'react';

interface SanityGlitchTextProps {
  text: string;
  san: number;
  className?: string;
  glitchWords?: { target: string; corruptions: string[] }[];
}

const DEFAULT_CORRUPTIONS = [
  { target: '警衛', corruptions: ['紅衣傀儡', '守門怪異', '偽裝者', '它'] },
  { target: '大樓', corruptions: ['巢穴', '404深淵', '活體牢籠'] },
  { target: '守則', corruptions: ['誘捕謊言', '同化條款', '催眠咒文'] },
  { target: '張浩', corruptions: ['第四個受害者', '被吞噬的人', '代號404'] },
  { target: '正常', corruptions: ['異化', '扭曲', '非現實'] },
  { target: '四樓', corruptions: ['禁忌空間', '深淵核心', '404'] }
];

export const SanityGlitchText: React.FC<SanityGlitchTextProps> = ({
  text,
  san,
  className = '',
  glitchWords = DEFAULT_CORRUPTIONS
}) => {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    // If SAN is safe or user is hovering to stabilize mind, show true text
    if (san >= 55 || isHovered) {
      setDisplayText(text);
      setIsGlitching(false);
      return;
    }

    // Dynamic frequency based on SAN (critical at < 35 SAN)
    const intervalMs = Math.max(800, san * 35);
    const corruptionChance = Math.min(0.85, (55 - san) * 0.022);

    const timer = setInterval(() => {
      if (Math.random() < corruptionChance) {
        let corrupted = text;
        let didCorrupt = false;

        glitchWords.forEach(({ target, corruptions }) => {
          if (corrupted.includes(target) && Math.random() < 0.7) {
            const randomPick = corruptions[Math.floor(Math.random() * corruptions.length)];
            corrupted = corrupted.replace(new RegExp(target, 'g'), randomPick);
            didCorrupt = true;
          }
        });

        // If no target word matched, randomly inject text jitter
        if (!didCorrupt && san < 35 && Math.random() < 0.4) {
          const glitchChars = ['§', 'ø', '▓', '▒', '░', '?', '!', '4', '0', '4'];
          const charArr = corrupted.split('');
          const randIdx = Math.floor(Math.random() * charArr.length);
          if (charArr[randIdx] && charArr[randIdx].trim()) {
            charArr[randIdx] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            corrupted = charArr.join('');
            didCorrupt = true;
          }
        }

        if (didCorrupt) {
          setDisplayText(corrupted);
          setIsGlitching(true);
          // Restore back shortly after glitching
          setTimeout(() => {
            setDisplayText(text);
            setIsGlitching(false);
          }, Math.min(1200, 300 + (55 - san) * 15));
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [text, san, isHovered, glitchWords]);

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`transition-colors duration-200 ${className} ${
        isGlitching
          ? 'text-red-400 font-mono tracking-wider animate-pulse drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]'
          : ''
      }`}
      title={isGlitching ? '【心理認知受損】滑鼠懸停可強行平撫視神經' : undefined}
    >
      {displayText}
    </span>
  );
};
