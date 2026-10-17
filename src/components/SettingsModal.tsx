import React from 'react';
import { X, Volume2, Sparkles, Smartphone, EyeOff, Infinity as InfinityIcon } from 'lucide-react';
import { GameSettings } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { haptics } from '../utils/haptics';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleToggle = (key: keyof GameSettings, currentValue: boolean) => {
    soundEngine.playButton();
    haptics.trigger('tap');
    onUpdateSettings({ [key]: !currentValue });
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#F3EBDD]/95 backdrop-blur-sm flex flex-col justify-between px-4 sm:px-6 py-2.5 sm:py-4 select-none animate-fadeIn overflow-hidden">
      {/* Header */}
      <header className="pt-safe shrink-0 w-full flex items-center justify-between border-b border-[#222321]/10 pb-2.5">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#B7B2A8] uppercase">
            Preferências
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#222321]">
            Configurações
          </h2>
        </div>

        <button
          onClick={() => {
            soundEngine.playButton();
            haptics.trigger('tap');
            onClose();
          }}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white border border-[#222321]/15 flex items-center justify-center text-[#222321] active:scale-95 transition-all"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Settings list */}
      <div className="min-h-0 flex-1 overflow-y-auto py-2.5 flex flex-col gap-2.5">
        {/* Áudio SFX */}
        <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#222321]/5 flex items-center justify-center text-[#222321]">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-[#222321] block">
                Efeitos Sonoros
              </span>
              <span className="text-xs text-[#222321]/60 font-body">
                Disparos, impactos de madeira e colisões
              </span>
            </div>
          </div>

          <button
            onClick={() => handleToggle('soundEnabled', settings.soundEnabled)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              settings.soundEnabled ? 'bg-[#222321]' : 'bg-[#B7B2A8]/40'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Coro de Memória */}
        <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#222321]/5 flex items-center justify-center text-[#222321]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-[#222321] block">
                Coro de Memória
              </span>
              <span className="text-xs text-[#222321]/60 font-body">
                Textura harmônica que evolui com as flechas
              </span>
            </div>
          </div>

          <button
            onClick={() => handleToggle('chorusEnabled', settings.chorusEnabled)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              settings.chorusEnabled ? 'bg-[#222321]' : 'bg-[#B7B2A8]/40'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.chorusEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Vibração Tátil */}
        <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#222321]/5 flex items-center justify-center text-[#222321]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-[#222321] block">
                Resposta Tátil
              </span>
              <span className="text-xs text-[#222321]/60 font-body">
                Micropulsos táteis no disparo e impacto
              </span>
            </div>
          </div>

          <button
            onClick={() => handleToggle('hapticsEnabled', settings.hapticsEnabled)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              settings.hapticsEnabled ? 'bg-[#222321]' : 'bg-[#B7B2A8]/40'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Modo Zen */}
        <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#222321]/5 flex items-center justify-center text-[#222321]">
              <InfinityIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-[#222321] block">
                Modo Zen / Prática
              </span>
              <span className="text-xs text-[#222321]/60 font-body">
                Tentativas infinitas sem tela de fim de jogo
              </span>
            </div>
          </div>

          <button
            onClick={() => handleToggle('zenMode', settings.zenMode)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              settings.zenMode ? 'bg-[#D94336]' : 'bg-[#B7B2A8]/40'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.zenMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Redução de Movimento */}
        <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#222321]/5 flex items-center justify-center text-[#222321]">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-[#222321] block">
                Reduzir Movimento
              </span>
              <span className="text-xs text-[#222321]/60 font-body">
                Desativa tremor de tela e partículas intensas
              </span>
            </div>
          </div>

          <button
            onClick={() => handleToggle('reducedMotion', settings.reducedMotion)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              settings.reducedMotion ? 'bg-[#222321]' : 'bg-[#B7B2A8]/40'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-safe shrink-0 w-full pt-1">
        <button
          onClick={() => {
            soundEngine.playButton();
            haptics.trigger('tap');
            onClose();
          }}
          className="w-full h-11 sm:h-12 bg-[#222321] text-[#F3EBDD] font-display text-sm font-bold tracking-wide rounded-xl flex items-center justify-center active:scale-95 transition-all"
        >
          CONCLUÍDO
        </button>
      </footer>
    </div>
  );
};
