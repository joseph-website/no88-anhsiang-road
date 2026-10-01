import React from 'react';
import { TraitId } from '../../types';
import { SIX_ATTRIBUTES } from '../../data/traitsData';

interface TraitRadarProps {
  scores: Record<TraitId, number>;
  maxScore?: number;
  size?: number;
  highlightTraitId?: TraitId;
  showLabels?: boolean;
}

export const TraitRadar: React.FC<TraitRadarProps> = ({
  scores,
  maxScore = 30, // 3 selections * 10 max = 30
  size = 280,
  highlightTraitId,
  showLabels = true
}) => {
  const center = size / 2;
  const radius = (size / 2) * 0.65; // Leave room for labels
  const totalAxes = SIX_ATTRIBUTES.length; // 6

  // Angles: Start at top (0 radians is right, so -pi/2 is top)
  const angleStep = (2 * Math.PI) / totalAxes;

  // Grid levels (e.g., 25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Helper to compute (x, y) for an index and normalized value (0 to 1)
  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * Math.min(Math.max(valueRatio, 0.08), 1); // minimum floor for visual appeal
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Label coordinates (placed slightly further out)
  const getLabelCoordinates = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * 1.32;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points for the current scores
  const scorePolygonPoints = SIX_ATTRIBUTES.map((attr, i) => {
    const score = scores[attr.id] || 0;
    const ratio = score / maxScore;
    const { x, y } = getCoordinates(i, ratio);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#d97706" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.0" />
          </radialGradient>
          <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* Ambient background glow */}
        <circle cx={center} cy={center} r={radius * 1.1} fill="url(#radarGlow)" />

        {/* Concentric Hexagons */}
        {levels.map((lvl, lvlIdx) => {
          const hexPoints = SIX_ATTRIBUTES.map((_, i) => {
            const { x, y } = getCoordinates(i, lvl);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(' ');

          return (
            <polygon
              key={`grid-${lvlIdx}`}
              points={hexPoints}
              fill={lvlIdx === levels.length - 1 ? 'rgba(0, 0, 0, 0.5)' : 'none'}
              stroke={lvlIdx === levels.length - 1 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.08)'}
              strokeWidth={lvlIdx === levels.length - 1 ? 1.5 : 1}
              strokeDasharray={lvlIdx < levels.length - 1 ? '3 3' : 'none'}
            />
          );
        })}

        {/* Radial Axis Lines */}
        {SIX_ATTRIBUTES.map((_, i) => {
          const { x, y } = getCoordinates(i, 1);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={1}
            />
          );
        })}

        {/* Score Area Polygon */}
        <polygon
          points={scorePolygonPoints}
          fill="url(#polyGrad)"
          stroke="#fbbf24"
          strokeWidth={2.5}
          className="transition-all duration-700 ease-out"
          style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))' }}
        />

        {/* Score Vertex Dots */}
        {SIX_ATTRIBUTES.map((attr, i) => {
          const score = scores[attr.id] || 0;
          const ratio = score / maxScore;
          const { x, y } = getCoordinates(i, ratio);
          const isTop = highlightTraitId === attr.id;

          return (
            <g key={`dot-${attr.id}`}>
              {/* In-place enlarged halo ring for highlighted trait */}
              {isTop && (
                <circle
                  cx={x}
                  cy={y}
                  r={11}
                  fill="none"
                  stroke={attr.color}
                  strokeWidth={2}
                  strokeOpacity={0.7}
                />
              )}
              {/* Core dot - enlarged in place when highlighted */}
              <circle
                cx={x}
                cy={y}
                r={isTop ? 7 : 4}
                fill={attr.color}
                stroke="#ffffff"
                strokeWidth={isTop ? 2 : 1.5}
              />
            </g>
          );
        })}

        {/* Labels around the perimeter */}
        {showLabels &&
          SIX_ATTRIBUTES.map((attr, i) => {
            const { x, y } = getLabelCoordinates(i);
            const score = scores[attr.id] || 0;
            const isTop = highlightTraitId === attr.id;

            return (
              <g key={`label-${attr.id}`} transform={`translate(${x}, ${y})`}>
                <text
                  x={0}
                  y={-7}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`font-serif transition-all duration-300 ${
                    isTop 
                      ? 'fill-amber-300 font-bold text-sm' 
                      : 'fill-neutral-300 font-medium text-xs'
                  }`}
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
                >
                  {attr.name}
                </text>
                <text
                  x={0}
                  y={8}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`font-mono transition-colors duration-300 ${
                    isTop 
                      ? 'fill-amber-400 font-bold text-xs' 
                      : 'fill-neutral-400 font-normal text-[10px]'
                  }`}
                >
                  {score} pt
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
};
