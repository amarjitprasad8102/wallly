import { useEffect, useRef, useState } from 'react';
import { SelfieSegmentation, Results } from '@mediapipe/selfie_segmentation';
import type { BackgroundOption } from '@/components/VirtualBackgrounds';

/**
 * Composites the user's local video onto a canvas with a virtual background
 * (blur / solid color / image) using MediaPipe Selfie Segmentation.
 *
 * Returns a canvas ref to attach to a <canvas> element. When `background` is
 * null, no processing happens and the hook does nothing.
 */
export function useVirtualBackground(
  videoEl: HTMLVideoElement | null,
  background: BackgroundOption | null,
  enabled: boolean,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const segRef = useRef<SelfieSegmentation | null>(null);
  const rafRef = useRef<number | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);

  // Preload image backgrounds
  useEffect(() => {
    if (background?.type === 'image') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = background.value;
      img.onload = () => { bgImgRef.current = img; };
    } else {
      bgImgRef.current = null;
    }
  }, [background]);

  useEffect(() => {
    if (!enabled || !background || !videoEl) {
      setReady(false);
      return;
    }

    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const seg = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });
    seg.setOptions({ modelSelection: 1, selfieMode: false });
    segRef.current = seg;

    const drawBackground = (w: number, h: number) => {
      if (!background) return;
      if (background.type === 'color') {
        // Support CSS gradients via a temporary fill — fall back to flat color
        if (background.value.startsWith('linear-gradient')) {
          // Parse simple two-stop linear-gradient(angle, c1 0%, c2 100%)
          const m = background.value.match(/linear-gradient\(([^,]+),\s*([^,\s]+)[^,]*,\s*([^,\s]+)/);
          const c1 = m?.[2] ?? '#000';
          const c2 = m?.[3] ?? '#000';
          const grad = ctx.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, c1);
          grad.addColorStop(1, c2);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = background.value;
        }
        ctx.fillRect(0, 0, w, h);
      } else if (background.type === 'image' && bgImgRef.current) {
        ctx.drawImage(bgImgRef.current, 0, 0, w, h);
      } else if (background.type === 'blur') {
        // Draw blurred video as background
        const blurAmt = Number(background.value) || 10;
        ctx.filter = `blur(${blurAmt}px)`;
        ctx.drawImage(videoEl, 0, 0, w, h);
        ctx.filter = 'none';
      }
    };

    const onResults = (results: Results) => {
      if (cancelled) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.save();
      ctx.clearRect(0, 0, w, h);

      // 1) draw the person mask
      ctx.drawImage(results.segmentationMask, 0, 0, w, h);

      // 2) keep only person pixels from the source video
      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(results.image, 0, 0, w, h);

      // 3) draw background behind
      ctx.globalCompositeOperation = 'destination-over';
      drawBackground(w, h);

      ctx.restore();
    };

    seg.onResults(onResults);

    const loop = async () => {
      if (cancelled) return;
      if (videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
        if (canvas.width !== videoEl.videoWidth) canvas.width = videoEl.videoWidth;
        if (canvas.height !== videoEl.videoHeight) canvas.height = videoEl.videoHeight;
        try {
          await seg.send({ image: videoEl });
          if (!ready) setReady(true);
        } catch (e) {
          // ignore transient errors
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { seg.close(); } catch { }
      segRef.current = null;
      setReady(false);
    };
  }, [videoEl, background, enabled]);

  return { canvasRef, ready };
}
