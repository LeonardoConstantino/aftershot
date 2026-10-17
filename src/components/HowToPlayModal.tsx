import React from 'react';
import { X, ArrowUpRight, ShieldAlert, Sparkles } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { haptics } from '../utils/haptics';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const handleClose = () => {
    soundEngine.playButton();
    haptics.trigger('tap');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#F3EBDD]/95 backdrop-blur-sm flex flex-col justify-between px-4 sm:px-6 py-2.5 sm:py-4 select-none animate-fadeIn overflow-hidden">
      {/* Header */}
      <header className="pt-safe shrink-0 w-full flex items-center justify-between border-b border-[#222321]/10 pb-2.5">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#B7B2A8] uppercase">
            Instruções
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#222321]">
            Como Jogar
          </h2>
        </div>

        <button
          onClick={handleClose}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white border border-[#222321]/15 flex items-center justify-center text-[#222321] active:scale-95 transition-all"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* 4 Step Cards */}
      <div className="min-h-0 flex-1 overflow-y-auto py-2.5 flex flex-col gap-2.5">
        {/* Passo 1 */}
        <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E9A23B]/15 text-[#E9A23B] flex items-center justify-center font-display font-bold text-xs">
              01
            </div>
            <h3 className="font-display text-sm font-bold text-[#222321]">
              Arraste e Solte para Mirar
            </h3>
          </div>
          <p className="text-xs text-[#222321]/75 leading-relaxed font-body">
            Toque na tela e puxe para trás para tensionar a corda do arco. A linha tracejada âmbar indica a rota balística. Conforme acumula flechas na partida, a linha se torna sutilmente translúcida — desafiando sua mira aguçada e instinto. Solte para disparar.
          </p>
        </div>

        {/* Passo 2 */}
        <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#D94336]/15 text-[#D94336] flex items-center justify-center font-display font-bold text-xs">
              02
            </div>
            <h3 className="font-display text-sm font-bold text-[#222321]">
              O Passado é Persistente
            </h3>
          </div>
          <p className="text-xs text-[#222321]/75 leading-relaxed font-body">
            Cada flecha que erra o alvo ou atinge as bordas se finca solidamente no campo. Se uma nova flecha colidir com uma flecha antiga, ela rebate e para no local.
          </p>
        </div>

        {/* Passo 3 */}
        <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#222321]/10 text-[#222321] flex items-center justify-center font-display font-bold text-xs">
              03
            </div>
            <h3 className="font-display text-sm font-bold text-[#222321]">
              Obstáculos em Progressão
            </h3>
          </div>
          <p className="text-xs text-[#222321]/75 leading-relaxed font-body">
            Conforme a partida avança, pequenos pinos geométricos surgem no campo (sempre menores que o alvo principal). Contorne-os para manter sua sequência.
          </p>
        </div>

        {/* Passo 4 */}
        <div className="bg-white p-4 rounded-2xl border border-[#222321]/10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#D94336]/10 text-[#D94336] flex items-center justify-center font-display font-bold text-xs">
              04
            </div>
            <h3 className="font-display text-sm font-bold text-[#222321]">
              Atravesse Seus Próprios Erros
            </h3>
          </div>
          <p className="text-xs text-[#222321]/75 leading-relaxed font-body">
            O campo se transforma em uma escultura viva das suas decisões. Encontre frestas milimétricas para acertar o centro e assinar sua partida.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-safe shrink-0 w-full pt-1">
        <button
          onClick={handleClose}
          className="w-full h-11 sm:h-12 bg-[#222321] text-[#F3EBDD] font-display text-sm font-bold tracking-wide rounded-xl flex items-center justify-center active:scale-95 transition-all"
        >
          ENTENDIDO
        </button>
      </footer>
    </div>
  );
};
