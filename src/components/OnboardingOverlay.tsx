import React from 'react';
import { motion } from 'motion/react';

interface OnboardingOverlayProps {
  visible: boolean;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center p-6 select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-[#222321]/90 text-[#F3EBDD] px-4 py-2.5 rounded-xl shadow-lg flex flex-col items-center text-center max-w-xs"
      >
        <span className="font-display text-xs font-semibold tracking-wider uppercase mb-1">
          Arraste para Mirar · Solte para Disparar
        </span>
        <span className="text-[11px] text-[#F3EBDD]/70 font-body">
          Puxe a corda para trás e aponte para o alvo vermelho
        </span>

        {/* Minimalist animated arrow icon illustrating pull */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-2 w-6 h-6 flex items-center justify-center"
        >
          <div className="w-0.5 h-4 bg-[#E9A23B] relative">
            <div className="absolute -bottom-1 -left-[3px] w-2 h-2 border-b-2 border-r-2 border-[#E9A23B] rotate-45" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
