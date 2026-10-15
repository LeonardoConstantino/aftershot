import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Smartphone } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { haptics } from '../utils/haptics';
import { GameSettings } from '../types/game';

interface PauseModalProps {
  settings: GameSettings;
  onResume: () => void;
  onRestart: () => void;
  onExitMenu: () => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  settings,
  onResume,
  onRestart,
  onExitMenu,
  onToggleSound,
  onToggleHaptics,
}) => {
  const handleAction = (callback: () => void) => {
    soundEngine.playButton();
    haptics.trigger('tap');
    callback();
  };

  return (
    <div className="absolute inset-0 z-30 bg-[#F3EBDD]/80 backdrop-blur-xs flex items-center justify-center p-6 select-none animate-fadeIn">
      <div className="w-full max-w-xs bg-white/95 border border-[#222321]/15 rounded-2xl p-6 shadow-xl flex flex-col gap-4 text-center">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-[#222321]">
            Jogo Pausado
          </h2>
          <p className="text-xs text-[#222321]/60 font-body mt-0.5">
            O campo aguarda o seu retorno
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {/* Continuar - Primary CTA */}
          <button
            onClick={() => handleAction(onResume)}
            className="w-full h-12 bg-[#222321] text-[#F3EBDD] font-display text-sm font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>CONTINUAR</span>
          </button>

          {/* Recomeçar */}
          <button
            onClick={() => handleAction(onRestart)}
            className="w-full h-11 bg-white border border-[#222321]/15 text-[#222321] font-display text-xs font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RECOMEÇAR PARTIDA</span>
          </button>

          {/* Sair para o menu */}
          <button
            onClick={() => handleAction(onExitMenu)}
            className="w-full h-11 bg-white border border-[#222321]/15 text-[#222321] font-display text-xs font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>MENU PRINCIPAL</span>
          </button>
        </div>

        {/* Quick Toggles: Audio & Haptics */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-[#222321]/10">
          <button
            onClick={() => handleAction(onToggleSound)}
            className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              settings.soundEnabled
                ? 'bg-[#222321]/10 text-[#222321]'
                : 'bg-transparent text-[#222321]/40'
            }`}
            aria-label="Alternar som"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[11px] font-mono">{settings.soundEnabled ? 'Som Ligado' : 'Mudo'}</span>
          </button>

          <button
            onClick={() => handleAction(onToggleHaptics)}
            className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              settings.hapticsEnabled
                ? 'bg-[#222321]/10 text-[#222321]'
                : 'bg-transparent text-[#222321]/40'
            }`}
            aria-label="Alternar vibração"
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-[11px] font-mono">{settings.hapticsEnabled ? 'Vibração' : 'Sem Vibração'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
