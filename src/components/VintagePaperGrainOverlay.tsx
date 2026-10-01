import React from 'react';

export type VisualAtmosphereMode = 'classic' | 'newspaper' | 'crt' | 'clean';

interface VintagePaperGrainOverlayProps {
  mode?: VisualAtmosphereMode;
  reducedEffects?: boolean;
}

/**
 * 1990s Detective Dossier Vintage Paper, Newsprint & CRT Overlay
 * Renders authentic newspaper halftone dots, paper noise, fold creases,
 * CRT scanlines, phosphor RGB aperture, scanbeam sweep, and darkroom vignette.
 * Completely pointer-events-none and hardware accelerated.
 */
export const VintagePaperGrainOverlay: React.FC<VintagePaperGrainOverlayProps> = ({
  mode = 'classic',
  reducedEffects = false
}) => {
  if (mode === 'clean') {
    return (
      <div 
        className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none transition-opacity duration-300"
        style={{ opacity: reducedEffects ? 0.3 : 1 }}
        aria-hidden="true"
      >
        {/* Subtle minimal vignette */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 75%, rgba(14, 9, 5, 0.4) 100%)'
          }}
        />
      </div>
    );
  }

  const showNewspaper = mode === 'classic' || mode === 'newspaper';
  const showCrt = mode === 'classic' || mode === 'crt';

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none transition-opacity duration-300"
      style={{ opacity: reducedEffects ? 0.3 : 1 }}
      aria-hidden="true"
    >
      {/* 1. Procedural Film & Newsprint Grain Layer */}
      <div 
        className={`absolute inset-0 mix-blend-overlay ${
          mode === 'newspaper' ? 'opacity-[0.09]' : 'opacity-[0.06]'
        }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '160px 160px'
        }}
      />

      {/* 2. Newspaper Offset Halftone Dot Matrix Texture */}
      {showNewspaper && (
        <div 
          className={`absolute inset-0 pointer-events-none ${
            mode === 'newspaper' ? 'opacity-[0.06]' : 'opacity-[0.035]'
          } mix-blend-color-burn newspaper-halftone`}
        />
      )}

      {/* 3. Aged Paper Fibers & Micro Grunge Texture */}
      <div 
        className="absolute inset-0 opacity-[0.045] mix-blend-color-burn"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 35%, rgba(120, 80, 40, 0.45) 0%, transparent 40%),
                            radial-gradient(circle at 80% 70%, rgba(90, 60, 30, 0.5) 0%, transparent 50%),
                            radial-gradient(circle at 50% 90%, rgba(140, 90, 50, 0.35) 0%, transparent 45%)`,
          backgroundSize: '100% 100%'
        }}
      />

      {/* 4. Newspaper Fold Creases (Horizontal & Vertical Press Folds) */}
      {showNewspaper && (
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay">
          {/* Horizontal center newspaper fold */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-200 to-transparent -translate-y-1/2" />
          <div className="absolute top-[calc(50%+1px)] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-black to-transparent" />
          
          {/* Vertical newspaper column fold markers */}
          <div className="absolute top-0 bottom-0 left-1/4 w-[1px] bg-gradient-to-b from-transparent via-amber-300/40 to-transparent" />
          <div className="absolute top-0 bottom-0 right-1/4 w-[1px] bg-gradient-to-b from-transparent via-amber-300/40 to-transparent" />
        </div>
      )}

      {/* 5. CRT Phosphor Scanlines & Subpixel RGB Grille */}
      {showCrt && (
        <div 
          className={`absolute inset-0 pointer-events-none ${
            mode === 'crt' ? 'opacity-90' : 'opacity-65'
          }`}
          style={{
            backgroundImage: `
              linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.28) 50%),
              linear-gradient(90deg, rgba(255, 0, 0, 0.035), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.035))
            `,
            backgroundSize: '100% 3px, 6px 100%'
          }}
        />
      )}

      {/* 6. CRT Cathode Ray Scanbeam Sweep (Subtle moving horizontal beam) */}
      {showCrt && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="w-full h-24 bg-gradient-to-b from-transparent via-amber-400/10 to-transparent animate-scanbeam" />
        </div>
      )}

      {/* 7. CRT Curved Monitor Vignette & Aged Darkroom Edge Browning */}
      <div 
        className={`absolute inset-0 ${
          mode === 'crt' ? 'opacity-85' : 'opacity-60'
        }`}
        style={{
          background: showCrt
            ? 'radial-gradient(ellipse at center, transparent 55%, rgba(18, 12, 6, 0.45) 80%, rgba(10, 6, 3, 0.88) 100%)'
            : 'radial-gradient(ellipse at center, transparent 65%, rgba(20, 13, 7, 0.35) 85%, rgba(14, 9, 5, 0.7) 100%)'
        }}
      />
    </div>
  );
};

