import React from 'react';
import { Play, Trophy, Sliders, HelpCircle } from 'lucide-react';
import { BestStats } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { haptics } from '../utils/haptics';

interface MenuViewProps {
  stats: BestStats;
  onPlay: () => void;
  onOpenRecords: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  stats,
  onPlay,
  onOpenRecords,
  onOpenSettings,
  onOpenHowToPlay,
}) => {
  const handleAction = (callback: () => void) => {
    soundEngine.unlock();
    soundEngine.playButton();
    haptics.trigger('tap');
    callback();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-4 sm:px-6 py-2.5 sm:py-4 paper-texture select-none overflow-hidden">
      {/* Top Header: Brand & High Score unboxed metadata */}
      <header className="pt-safe shrink-0 w-full flex items-center justify-between border-b border-[#222321]/10 pb-2.5">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#222321]">
            AFTERSHOT
          </h1>
          <p className="text-[11px] sm:text-xs text-[#222321]/60 font-body">
            Física de flechas persistentes
          </p>
        </div>

        {stats.highScore > 0 && (
          <div className="text-right">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#B7B2A8] block">
              Recorde
            </span>
            <span className="font-display text-lg sm:text-xl font-bold text-[#D94336] tabular-nums">
              {stats.highScore}
            </span>
          </div>
        )}
      </header>

      {/* Center Artwork: Minimalist Arrow Composition with fluid shrinking */}
      <div className="min-h-0 flex-1 shrink flex flex-col items-center justify-center my-auto py-2 overflow-hidden">
        <div className="relative w-36 h-36 xs:w-44 xs:h-44 sm:w-52 sm:h-52 max-h-[32vh] aspect-square flex items-center justify-center shrink">
          {/* Subtle concentric target rings */}
          <div className="absolute w-full h-full rounded-full border border-[#222321]/10 flex items-center justify-center">
            <div className="w-3/4 h-3/4 rounded-full border border-[#222321]/15 flex items-center justify-center">
              <div className="w-1/2 h-1/2 rounded-full bg-[#D94336]/10 border border-[#D94336] flex items-center justify-center">
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#D94336]" />
              </div>
            </div>
          </div>

          {/* Minimalist intersecting arrows in charcoal and memory gray */}
          <div className="absolute w-3/4 h-[2px] bg-[#B7B2A8] rotate-[-28deg] transform origin-center" />
          <div className="absolute w-4/5 h-[2px] bg-[#B7B2A8] rotate-[45deg] transform origin-center" />
          <div className="absolute w-5/6 h-[2.5px] bg-[#222321] rotate-[12deg] transform origin-center" />
        </div>

        <p className="text-[11px] sm:text-xs text-[#222321]/65 text-center max-w-xs mt-2.5 px-2 shrink-0 leading-snug">
          Cada flecha disparada altera permanentemente o espaço das próximas.
        </p>
      </div>

      {/* Bottom Area: Primary CTA & Thumb-Friendly Secondary Buttons */}
      <footer className="pb-safe shrink-0 w-full flex flex-col gap-2 sm:gap-2.5 pt-1">
        {/* Dominant Primary Play Button */}
        <button
          onClick={() => handleAction(onPlay)}
          className="w-full h-12 sm:h-14 bg-[#222321] hover:bg-[#343532] text-[#F3EBDD] font-display text-base sm:text-lg font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shrink-0"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
          <span>JOGAR</span>
        </button>

        {/* Secondary Clean Action Bar */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => handleAction(onOpenRecords)}
            className="h-10 sm:h-12 bg-white/70 hover:bg-white border border-[#222321]/12 rounded-xl flex flex-col items-center justify-center text-[#222321] active:scale-[0.97] transition-all"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 text-[#E9A23B]" />
            <span className="text-[10px] sm:text-[11px] font-display font-medium tracking-tight">Recordes</span>
          </button>

          <button
            onClick={() => handleAction(onOpenHowToPlay)}
            className="h-10 sm:h-12 bg-white/70 hover:bg-white border border-[#222321]/12 rounded-xl flex flex-col items-center justify-center text-[#222321] active:scale-[0.97] transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 text-[#222321]/80" />
            <span className="text-[10px] sm:text-[11px] font-display font-medium tracking-tight">Como Jogar</span>
          </button>

          <button
            onClick={() => handleAction(onOpenSettings)}
            className="h-10 sm:h-12 bg-white/70 hover:bg-white border border-[#222321]/12 rounded-xl flex flex-col items-center justify-center text-[#222321] active:scale-[0.97] transition-all"
          >
            <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 text-[#222321]/80" />
            <span className="text-[10px] sm:text-[11px] font-display font-medium tracking-tight">Ajustes</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
