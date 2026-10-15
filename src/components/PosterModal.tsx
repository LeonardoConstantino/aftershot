import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Share2, Download, Copy, Check } from 'lucide-react';
import { GameSession } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { haptics } from '../utils/haptics';
import { drawDetailedArrow } from '../game/canvasRenderer';

interface PosterModalProps {
  session: GameSession;
  isNewRecord: boolean;
  onClose: () => void;
}

const QUOTES = [
  "Cada flecha deixa uma história. Esta foi a minha.",
  "Consegui passar por aqui. Você consegue?",
  "Meu campo. Meus erros. Meu recorde.",
  "Uma tentativa a mais mudou tudo.",
];

export const PosterModal: React.FC<PosterModalProps> = ({
  session,
  isNewRecord,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number>(0);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);

  // Pick quote based on score or seed
  useEffect(() => {
    const idx = (session.score + session.persistentArrows.length) % QUOTES.length;
    setSelectedQuoteIndex(idx);
  }, [session]);

  const quote = QUOTES[selectedQuoteIndex];

  /**
   * Render high-resolution editorial poster onto Canvas (1080x1350 4:5 aspect ratio)
   */
  const renderPoster = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 1080;
    const h = 1350;

    canvas.width = w;
    canvas.height = h;

    // 1. Background Ivory
    ctx.fillStyle = '#F3EBDD';
    ctx.fillRect(0, 0, w, h);

    // 2. Subtle editorial grain / hairline border
    ctx.strokeStyle = 'rgba(34, 35, 33, 0.15)';
    ctx.lineWidth = 2.5;
    const pad = 60;
    ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

    // Corner marks
    const tick = 24;
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(34, 35, 33, 0.4)';
    ctx.beginPath();
    // Top-left
    ctx.moveTo(pad, pad + tick); ctx.lineTo(pad, pad); ctx.lineTo(pad + tick, pad);
    // Top-right
    ctx.moveTo(w - pad - tick, pad); ctx.lineTo(w - pad, pad); ctx.lineTo(w - pad, pad + tick);
    // Bottom-left
    ctx.moveTo(pad, h - pad - tick); ctx.lineTo(pad, h - pad); ctx.lineTo(pad + tick, h - pad);
    // Bottom-right
    ctx.moveTo(w - pad - tick, h - pad); ctx.lineTo(w - pad, h - pad); ctx.lineTo(w - pad, h - pad - tick);
    ctx.stroke();

    // 3. Header Wordmark
    ctx.fillStyle = '#222321';
    ctx.font = '700 48px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AFTERSHOT', w / 2, pad + 80);

    ctx.fillStyle = '#B7B2A8';
    ctx.font = '500 20px "Plus Jakarta Sans", monospace';
    ctx.fillText('ARQUIVO DE PARTIDA · ASSINATURA DE ERROS', w / 2, pad + 120);

    // 4. Central Arrow Sculpture Box
    const boxX = pad + 40;
    const boxY = pad + 160;
    const boxW = w - (pad + 40) * 2;
    const boxH = 640;

    // Box subtle border
    ctx.strokeStyle = 'rgba(34, 35, 33, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Draw central target reference
    ctx.save();
    ctx.translate(w / 2, boxY + boxH * 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.strokeStyle = '#D94336';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#D94336';
    ctx.fill();
    ctx.restore();

    // Compute bounding box of persistent arrows to scale them neatly inside the poster box
    const arrows = session.persistentArrows;
    if (arrows.length > 0) {
      let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;
      for (const a of arrows) {
        if (a.startX < minX) minX = a.startX;
        if (a.tipX < minX) minX = a.tipX;
        if (a.startX > maxX) maxX = a.startX;
        if (a.tipX > maxX) maxX = a.tipX;
        if (a.startY < minY) minY = a.startY;
        if (a.tipY < minY) minY = a.tipY;
        if (a.startY > maxY) maxY = a.startY;
        if (a.tipY > maxY) maxY = a.tipY;
      }

      const spanX = Math.max(maxX - minX, 120);
      const spanY = Math.max(maxY - minY, 120);
      const scale = Math.min((boxW - 60) / spanX, (boxH - 60) / spanY, 1.4);

      ctx.save();
      ctx.translate(boxX + boxW / 2, boxY + boxH / 2);
      ctx.scale(scale, scale);
      ctx.translate(-(minX + maxX) / 2, -(minY + maxY) / 2);

      for (let i = 0; i < arrows.length; i++) {
        const arrow = arrows[i];
        const isRecent = i >= arrows.length - 2;

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
    }

    // 5. Score & Stats Section
    const statY = boxY + boxH + 70;

    ctx.fillStyle = '#D94336';
    ctx.font = '700 96px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${session.score}`, w / 2, statY);

    ctx.fillStyle = '#222321';
    ctx.font = '600 22px "Space Grotesk", sans-serif';
    ctx.fillText('PONTOS CONQUISTADOS', w / 2, statY + 36);

    // Unboxed sub-metrics
    ctx.fillStyle = '#222321';
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    const subtext = `${session.precisionHits} Acertos Precisos  ·  Sequência de ${session.maxStreak}  ·  ${session.persistentArrows.length} Flechas no Campo`;
    ctx.fillText(subtext, w / 2, statY + 76);

    // 6. Curated Quote
    ctx.fillStyle = '#222321';
    ctx.font = 'italic 500 24px "Plus Jakarta Sans", serif';
    ctx.fillText(`“${quote}”`, w / 2, statY + 140);

    // 7. Footer
    ctx.fillStyle = '#B7B2A8';
    ctx.font = '500 18px "Plus Jakarta Sans", monospace';
    const dateStr = new Date().toLocaleDateString('pt-BR');
    ctx.fillText(`REGISTRO ${session.id.slice(-6).toUpperCase()}  ·  ${dateStr}`, w / 2, h - pad - 30);
  }, [session, quote]);

  useEffect(() => {
    renderPoster();
  }, [renderPoster]);

  /**
   * Native Share API handler
   */
  const handleNativeShare = async () => {
    soundEngine.playButton();
    haptics.trigger('tap');

    const canvas = canvasRef.current;
    if (!canvas) return;

    const shareText = `AFTERSHOT: Fiz ${session.score} pontos com ${session.persistentArrows.length} flechas no campo!\n\n"${quote}"\n\nConsegue superar esta marca?`;

    try {
      if (navigator.share && canvas.toBlob) {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `aftershot_poster_${session.score}.png`, { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Minha Assinatura — AFTERSHOT',
              text: shareText,
              files: [file],
            });
          } else {
            // Share text only if file sharing unsupported
            await navigator.share({
              title: 'Minha Assinatura — AFTERSHOT',
              text: shareText,
            });
          }
        }, 'image/png');
      } else {
        // Fallback to copy text
        handleCopyText();
      }
    } catch {
      // User cancelled or share dismissed
    }
  };

  /**
   * Direct PNG Download
   */
  const handleDownload = () => {
    soundEngine.playButton();
    haptics.trigger('tap');

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `aftershot_${session.score}pts_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  /**
   * Copy caption text
   */
  const handleCopyText = () => {
    soundEngine.playButton();
    haptics.trigger('tap');

    const shareText = `AFTERSHOT: Fiz ${session.score} pontos com ${session.persistentArrows.length} flechas no campo!\n\n"${quote}"\n\nConsegue superar esta marca?`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#222321]/60 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6 select-none animate-fadeIn">
      {/* Header bar */}
      <header className="pt-safe w-full flex items-center justify-between text-[#F3EBDD]">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight">
            Pôster da Partida
          </h3>
          <p className="text-xs text-[#F3EBDD]/70 font-body">
            A sua escultura de erros pronta para compartilhar
          </p>
        </div>

        <button
          onClick={onClose}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F3EBDD] active:scale-95 transition-all"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Poster Canvas Preview */}
      <div className="flex-1 flex items-center justify-center my-3 overflow-hidden">
        <div className="relative max-h-full max-w-full aspect-[4/5] rounded-xl shadow-2xl border border-white/20 overflow-hidden flex items-center justify-center bg-[#F3EBDD]">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain block"
          />
        </div>
      </div>

      {/* Quotes picker: tap to switch quote */}
      <div className="flex items-center justify-center gap-1.5 mb-2">
        {QUOTES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedQuoteIndex(i);
              soundEngine.playButton();
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              selectedQuoteIndex === i ? 'bg-[#D94336] scale-125' : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Frase ${i + 1}`}
          />
        ))}
      </div>

      {/* Bottom Actions: Native Share, Download, Copy */}
      <footer className="pb-safe w-full flex flex-col gap-2">
        {/* Dominant Primary CTA */}
        <button
          onClick={handleNativeShare}
          className="w-full h-13 bg-[#D94336] hover:bg-[#c3382c] text-white font-display text-sm font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
        >
          <Share2 className="w-4 h-4 fill-current" />
          <span>COMPARTILHAR IMAGEM</span>
        </button>

        {/* Secondary Clean Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownload}
            className="h-11 bg-white/15 hover:bg-white/25 text-[#F3EBDD] border border-white/10 rounded-xl text-xs font-display font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            {downloaded ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{downloaded ? 'Baixado!' : 'Salvar PNG'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="h-11 bg-white/15 hover:bg-white/25 text-[#F3EBDD] border border-white/10 rounded-xl text-xs font-display font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedText ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
