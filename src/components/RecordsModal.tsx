import React from 'react';
import { X, Trophy, Target, Zap, RotateCcw } from 'lucide-react';
import { BestStats } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { haptics } from '../utils/haptics';

interface RecordsModalProps {
  stats: BestStats;
  onClose: () => void;
  onResetStats: () => void;
}

export const RecordsModal: React.FC<RecordsModalProps> = ({
  stats,
  onClose,
  onResetStats,
}) => {
  const handleAction = (callback: () => void) => {
    soundEngine.playButton();
    haptics.trigger('tap');
    callback();
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#F3EBDD]/95 backdrop-blur-sm flex flex-col justify-between p-6 select-none animate-fadeIn">
      {/* Header */}
      <header className="pt-safe w-full flex items-center justify-between border-b border-[#222321]/10 pb-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#B7B2A8] uppercase">
            Estatísticas
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#222321]">
            Histórico & Recordes
          </h2>
        </div>

        <button
          onClick={() => handleAction(onClose)}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white border border-[#222321]/15 flex items-center justify-center text-[#222321] active:scale-95 transition-all"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Grid of Key Record Metrics */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Recorde Máximo */}
          <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[#D94336]">
              <Trophy className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider">Recorde</span>
            </div>
            <div className="mt-3">
              <span className="font-display text-3xl font-bold text-[#222321] tabular-nums block">
                {stats.highScore}
              </span>
              <span className="text-[11px] text-[#222321]/60 font-body">pontos em uma partida</span>
            </div>
          </div>

          {/* Melhor Sequência */}
          <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[#E9A23B]">
              <Zap className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider">Sequência</span>
            </div>
            <div className="mt-3">
              <span className="font-display text-3xl font-bold text-[#222321] tabular-nums block">
                {stats.bestStreak}
              </span>
              <span className="text-[11px] text-[#222321]/60 font-body">acertos sem errar</span>
            </div>
          </div>

          {/* Acertos Precisos */}
          <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[#222321]/80">
              <Target className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider">Precisão</span>
            </div>
            <div className="mt-3">
              <span className="font-display text-3xl font-bold text-[#222321] tabular-nums block">
                {stats.totalPrecision}
              </span>
              <span className="text-[11px] text-[#222321]/60 font-body">acertos no centro</span>
            </div>
          </div>

          {/* Total de Flechas */}
          <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[#222321]/80">
              <RotateCcw className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider">Disparos</span>
            </div>
            <div className="mt-3">
              <span className="font-display text-3xl font-bold text-[#222321] tabular-nums block">
                {stats.totalArrowsShot}
              </span>
              <span className="text-[11px] text-[#222321]/60 font-body">flechas disparadas</span>
            </div>
          </div>
        </div>

        {/* Philosophy Note */}
        <div className="p-4 bg-white/70 border border-[#222321]/10 rounded-2xl">
          <p className="text-xs text-[#222321]/75 leading-relaxed font-body">
            “No Aftershot, cada erro permanece e conta uma história. A escultura final do campo é o reflexo da sua determinação.”
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-safe w-full flex flex-col gap-2">
        <button
          onClick={() => handleAction(onClose)}
          className="w-full h-12 bg-[#222321] text-[#F3EBDD] font-display text-sm font-bold tracking-wide rounded-xl flex items-center justify-center active:scale-95 transition-all"
        >
          VOLTAR
        </button>
      </footer>
    </div>
  );
};
