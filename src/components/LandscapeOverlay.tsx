import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { soundEngine } from '../audio/soundEngine';
import { haptics } from '../utils/haptics';

export const LandscapeOverlay: React.FC = () => {
  const [isLandscapeMobile, setIsLandscapeMobile] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window === 'undefined') return;
      // Triggers if width > height AND height is short (phone in landscape, e.g. < 560px)
      const isLandscape = window.innerWidth > window.innerHeight;
      const isShortHeight = window.innerHeight < 580;
      setIsLandscapeMobile(isLandscape && isShortHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isLandscapeMobile || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    soundEngine.playButton();
    haptics.trigger('tap');
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F3EBDD]/96 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
      <div className="max-w-sm flex flex-col items-center">
        {/* Animated Phone Rotation */}
        <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
          <motion.div
            animate={{ rotate: [-90, 0, 0, -90] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.45, 0.75, 1],
            }}
            className="w-10 h-16 rounded-xl border-2 border-[#222321] bg-white flex flex-col items-center justify-between py-1.5 shadow-md"
          >
            <div className="w-3 h-0.5 rounded-full bg-[#B7B2A8]" />
            <div className="w-4 h-4 rounded-full border border-[#D94336] bg-[#D94336]/10 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D94336]" />
            </div>
            <div className="w-2.5 h-0.5 rounded-full bg-[#B7B2A8]" />
          </motion.div>

          <RotateCw className="absolute -top-1 -right-1 w-5 h-5 text-[#E9A23B] animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        {/* Text guidance */}
        <span className="text-[11px] font-mono tracking-widest text-[#D94336] uppercase font-bold mb-1">
          Orientação Recomendada
        </span>
        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#222321] mb-2">
          Gire para o Modo Retrato
        </h2>
        <p className="text-xs text-[#222321]/75 leading-relaxed font-body mb-5 max-w-xs">
          Aftershot foi desenhado para ser jogado na vertical. O modo retrato oferece visão completa do campo, balística ideal e acesso ergonômico aos botões.
        </p>

        {/* User override button */}
        <button
          onClick={handleDismiss}
          className="h-10 px-5 rounded-xl bg-white border border-[#222321]/20 text-[#222321] text-xs font-display font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-xs"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Continuar em Paisagem</span>
        </button>
      </div>
    </div>
  );
};
