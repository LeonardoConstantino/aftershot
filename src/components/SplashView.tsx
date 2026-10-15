import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { soundEngine } from '../audio/soundEngine';
import { haptics } from '../utils/haptics';

interface SplashViewProps {
  onStart: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onStart }) => {
  const handleClick = () => {
    soundEngine.unlock();
    soundEngine.playButton();
    haptics.trigger('tap');
    onStart();
  };

  // Auto proceed after 2.2 seconds if user does not tap immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      onStart();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onStart]);

  return (
    <div 
      onClick={handleClick}
      className="relative w-full h-full flex flex-col items-center justify-between p-8 paper-texture cursor-pointer select-none"
    >
      <div className="pt-safe w-full flex justify-end">
        <span className="text-xs font-mono tracking-widest text-[#B7B2A8] uppercase">
          Edição Arcade
        </span>
      </div>

      <div className="flex flex-col items-center text-center my-auto max-w-sm">
        {/* Animated Brand Wordmark with Crossing Arrow */}
        <div className="relative mb-6">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#222321]"
          >
            AFTERSHOT
          </motion.h1>

          {/* Minimalist arrow traversing the wordmark */}
          <motion.div 
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 120, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="absolute top-1/2 -translate-y-1/2 left-0 w-16 h-[2px] bg-[#D94336] pointer-events-none"
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-[#D94336]" />
          </motion.div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-sm text-[#222321]/75 leading-relaxed font-body max-w-xs"
        >
          Você não joga apenas para acertar o próximo alvo. Joga para atravessar tudo o que deixou para trás.
        </motion.p>
      </div>

      <div className="pb-safe w-full flex flex-col items-center gap-2">
        <motion.span 
          animate={{ opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs font-display tracking-widest text-[#222321] uppercase font-semibold"
        >
          Toque para Começar
        </motion.span>
      </div>
    </div>
  );
};
