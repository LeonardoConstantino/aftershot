import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Share2, Eye, Home } from 'lucide-react';
import { GameSession, BestStats } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { haptics } from '../utils/haptics';
import { drawDetailedArrow } from '../game/canvasRenderer';

interface GameOverModalProps {
  session: GameSession;
  stats: BestStats;
  isNewRecord: boolean;
  onPlayAgain: () => void;
  onOpenSharePoster: () => void;
  onExitMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  session,
  isNewRecord,
  onPlayAgain,
  onOpenSharePoster,
  onExitMenu,
}) => {
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replayIndex, setReplayIndex] = useState<number>(session.persistentArrows.length);
  const replayCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleAction = (callback: () => void) => {
    soundEngine.playButton();
    haptics.trigger('tap');
    callback();
  };

  /**
   * Render the miniature sculpture preview
   */
  useEffect(() => {
    const canvas = replayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#F3EBDD';
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = 'rgba(34, 35, 33, 0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    // Draw arrows up to replayIndex
    const visibleArrows = session.persistentArrows.slice(0, replayIndex);

    // Compute bounds to center the sculpture nicely
    let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;
    for (const a of session.persistentArrows) {
      if (a.startX < minX) minX = a.startX;
      if (a.tipX < minX) minX = a.tipX;
      if (a.startX > maxX) maxX = a.startX;
      if (a.tipX > maxX) maxX = a.tipX;
      if (a.startY < minY) minY = a.startY;
      if (a.tipY < minY) minY = a.tipY;
      if (a.startY > maxY) maxY = a.startY;
      if (a.tipY > maxY) maxY = a.tipY;
    }

    if (minX === 9999) {
      minX = 0; maxX = 390; minY = 0; maxY = 650;
    }

    const spanX = Math.max(maxX - minX, 100);
    const spanY = Math.max(maxY - minY, 100);
    const scale = Math.min((w - 40) / spanX, (h - 40) / spanY, 0.7);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(minX + maxX) / 2, -(minY + maxY) / 2);

    for (let i = 0; i < visibleArrows.length; i++) {
      const arrow = visibleArrows[i];
      const isRecent = i >= visibleArrows.length - 2;

      ctx.save();
      ctx.translate(arrow.startX, arrow.startY);
      ctx.rotate(arrow.angle);

      drawDetailedArrow(ctx, arrow.length, {
        strokeColor: isRecent ? '#222321' : '#B7B2A8',
        alpha: 1.0,
        isRecent,
        isHitTarget: arrow.isHitTarget,
      });

      ctx.restore();
    }

    ctx.restore();
  }, [session.persistentArrows, replayIndex]);

  /**
   * Fast accelerated 3-second replay
   */
  const startReplay = () => {
    if (session.persistentArrows.length === 0) return;
    setIsReplaying(true);
    setReplayIndex(0);

    const total = session.persistentArrows.length;
    const intervalTime = Math.max(2500 / total, 60);

    let curr = 0;
    const timer = setInterval(() => {
      curr += 1;
      setReplayIndex(curr);
      soundEngine.playWallEmbed();

      if (curr >= total) {
        clearInterval(timer);
        setIsReplaying(false);
      }
    }, intervalTime);
  };

  return (
    <div className="absolute inset-0 z-30 bg-[#F3EBDD]/90 backdrop-blur-xs flex flex-col justify-between p-6 sm:p-8 select-none animate-fadeIn">
      {/* Top Header */}
      <header className="pt-safe w-full flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#B7B2A8] uppercase">
            Fim de Partida
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#222321]">
            A Sua Assinatura
          </h2>
        </div>

        <button
          onClick={() => handleAction(onExitMenu)}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white/80 border border-[#222321]/15 flex items-center justify-center text-[#222321] active:scale-95 transition-all"
          aria-label="Voltar ao menu"
        >
          <Home className="w-5 h-5" />
        </button>
      </header>

      {/* Middle: Canvas sculpture of persistent arrows & session stats */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 gap-4">
        {/* Miniature Sculpture Frame */}
        <div className="relative w-full max-w-[280px] h-44 sm:h-52 bg-white rounded-2xl border border-[#222321]/15 shadow-sm overflow-hidden flex items-center justify-center">
          <canvas
            ref={replayCanvasRef}
            width={280}
            height={208}
            className="w-full h-full block"
          />

          {/* Replay trigger overlay */}
          {session.persistentArrows.length > 0 && !isReplaying && (
            <button
              onClick={startReplay}
              className="absolute bottom-2.5 right-2.5 px-2.5 py-1.5 rounded-lg bg-[#222321]/80 hover:bg-[#222321] text-[#F3EBDD] text-[11px] font-display font-medium flex items-center gap-1 backdrop-blur-xs active:scale-95 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Rever</span>
            </button>
          )}

          {isReplaying && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#D94336] text-white text-[10px] font-mono uppercase tracking-wider">
              Replay
            </div>
          )}
        </div>

        {/* Big Score & High Impact Stats */}
        <div className="flex flex-col items-center">
          {isNewRecord && (
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#D94336] uppercase mb-1 animate-pulse">
              Novo Recorde Pessoal
            </span>
          )}

          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-[#222321] tabular-nums leading-none">
              {session.score}
            </span>
            <span className="text-xs font-mono text-[#222321]/60 uppercase tracking-widest">
              pontos
            </span>
          </div>

          {/* Minimalist unboxed metrics */}
          <div className="flex items-center gap-3 text-xs text-[#222321]/70 font-body mt-2">
            <span>{session.precisionHits} precisos</span>
            <span aria-hidden="true" className="text-[#B7B2A8]">·</span>
            <span>Seq. máxima {session.maxStreak}</span>
            <span aria-hidden="true" className="text-[#B7B2A8]">·</span>
            <span>{session.persistentArrows.length} flechas no campo</span>
          </div>
        </div>
      </div>

      {/* Bottom CTAs: Mobile thumb zone */}
      <footer className="pb-safe w-full flex flex-col gap-2.5">
        {/* Primary CTA: Jogar Novamente */}
        <button
          onClick={() => handleAction(onPlayAgain)}
          className="w-full h-14 bg-[#222321] hover:bg-[#343532] text-[#F3EBDD] font-display text-base font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
        >
          <RotateCcw className="w-5 h-5" />
          <span>JOGAR NOVAMENTE</span>
        </button>

        {/* Secondary Action: Compartilhar Imagem (Pôster Minimalista) */}
        <button
          onClick={() => handleAction(onOpenSharePoster)}
          className="w-full h-12 bg-white hover:bg-[#FFFDF7] border border-[#222321]/15 text-[#222321] font-display text-xs font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Share2 className="w-4 h-4 text-[#D94336]" />
          <span>COMPARTILHAR IMAGEM</span>
        </button>
      </footer>
    </div>
  );
};
