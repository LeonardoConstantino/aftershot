import React from 'react';
import { Pause } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { haptics } from '../utils/haptics';

interface GameHUDProps {
  score: number;
  streak: number;
  misses: number;
  maxMisses: number;
  zenMode: boolean;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  streak,
  misses,
  maxMisses,
  zenMode,
  onPause,
}) => {
  const handlePause = () => {
    soundEngine.playButton();
    haptics.trigger('tap');
    onPause();
  };

  const remainingLives = Math.max(0, maxMisses - misses);

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pt-safe px-4 pb-2 flex items-center justify-between pointer-events-none">
      {/* Left: Score & Streak */}
      <div className="flex items-baseline gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono tracking-widest text-[#222321]/50 uppercase">
            Pontos
          </span>
          <span className="font-display text-3xl font-bold tracking-tight text-[#222321] tabular-nums leading-none">
            {score}
          </span>
        </div>

        {streak > 1 && (
          <div className="flex items-center gap-1 text-[#E9A23B] font-display font-semibold text-xs tracking-tight">
            <span>+{streak}</span>
            <span className="text-[10px] font-mono text-[#E9A23B]/80 uppercase">Seq</span>
          </div>
        )}
      </div>

      {/* Right: Lives indicator & Pause trigger */}
      <div className="flex items-center gap-3">
        {/* Strikes / Attempt dots */}
        {!zenMode && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/60 border border-[#222321]/10">
            {Array.from({ length: maxMisses }).map((_, i) => {
              const isAvailable = i < remainingLives;
              return (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isAvailable ? 'bg-[#D94336]' : 'bg-[#B7B2A8]/40'
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Pause Button (Ergonomic 44x44px touch hitbox) */}
        <button
          onClick={handlePause}
          className="pointer-events-auto min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white/80 hover:bg-white active:bg-white border border-[#222321]/12 flex items-center justify-center text-[#222321] active:scale-95 transition-all shadow-xs"
          aria-label="Pausar jogo"
        >
          <Pause className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
};
