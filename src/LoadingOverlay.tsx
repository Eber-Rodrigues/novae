import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState, useCallback } from "react";

type Phase = "loading" | "streaming" | "holding" | "revealing";

interface ParticleInit {
  tx: number; ty: number;
  sx: number; sy: number;
  cpx: number; cpy: number;
  size: number;
  speed: number;
  r: number; g: number; b: number;
  delay: number;
}

const HOLD_DURATION_MS = 2000;
const FADE_DURATION_MS = 1600;
const DISPLAY_SIZE = 400;
const SAMPLE_STEP = 4;
const AMBIENT_COUNT = 80;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function bezier(t: number, p0: number, cp: number, p1: number): number {
  const mt = 1 - t;
  return mt * mt * p0 + 2 * mt * t * cp + t * t * p1;
}

// ─── PARTICLE CANVAS ──────────────────────────────────────────────────────────

function ParticleCanvas({
  initialParticles,
  onComplete,
  phase,
}: {
  initialParticles: ParticleInit[];
  onComplete: () => void;
  phase: Phase;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(false);
  const frameRef = useRef<number>(0);
  const phaseRef = useRef(phase);
  const holdStartRef = useRef<number>(0);
  const flashRef = useRef({ active: false, progress: 0 });

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || initialParticles.length === 0) return;
    const ctx = canvas.getContext("2d")!;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    const cx = W / 2;
    const cy = H / 2;

    const particles = initialParticles.map((p) => ({
      ...p,
      x: p.sx, y: p.sy,
      progress: 0,
      currentDelay: p.delay,
      arrived: false,
    }));

    // Ambient dust
    const dust = Array.from({ length: AMBIENT_COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.8 + 0.3,
      alpha: Math.random() * 0.25 + 0.03,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Shockwave
    const shockwaves: { progress: number }[] = [];
    const total = particles.length;
    const threshold = Math.floor(total * 0.88);

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, W, H);

      // ─── Ambient dust ───
      for (const d of dust) {
        d.x += d.vx; d.y += d.vy; d.pulse += 0.015;
        if (d.x < -10) d.x = W + 10;
        if (d.x > W + 10) d.x = -10;
        if (d.y < -10) d.y = H + 10;
        if (d.y > H + 10) d.y = -10;

        // During streaming, dust gets pulled toward center
        if (phaseRef.current === "streaming") {
          const ddx = cx - d.x;
          const ddy = cy - d.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
          d.vx += (ddx / dist) * 0.01;
          d.vy += (ddy / dist) * 0.01;
          d.vx *= 0.998; d.vy *= 0.998;
        }

        const a = d.alpha * (0.4 + 0.6 * Math.sin(d.pulse));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#B8D10D";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── Main particles ───
      let arrivedCount = 0;

      for (const p of particles) {
        if (p.currentDelay > 0) {
          p.currentDelay--;
          continue;
        }

        if (p.progress < 1) {
          p.progress = Math.min(1, p.progress + p.speed);
        }
        if (p.progress >= 1) {
          arrivedCount++;
          if (!p.arrived) p.arrived = true;
        }

        const t = easeInOutCubic(p.progress);
        p.x = bezier(t, p.sx, p.cpx, p.tx);
        p.y = bezier(t, p.sy, p.cpy, p.ty);

        // ─── Color shift: start white/cyan, end at actual color ───
        const colorT = Math.min(1, p.progress * 1.8);
        const cr = Math.round(255 + (p.r - 255) * colorT);
        const cg = Math.round(255 + (p.g - 255) * colorT);
        const cb = Math.round(255 + (p.b - 255) * colorT);

        // ─── Glow trail (while moving) ───
        if (p.progress < 0.9 && p.progress > 0.01) {
          const trailSteps = 8;
          for (let j = trailSteps; j >= 1; j--) {
            const tj = easeInOutCubic(Math.max(0, p.progress - j * 0.012));
            const trailX = bezier(tj, p.sx, p.cpx, p.tx);
            const trailY = bezier(tj, p.sy, p.cpy, p.ty);
            const alpha = ((trailSteps - j) / trailSteps) * 0.35;
            const sz = 1.5 + (p.size * 0.4) * (1 - j / trailSteps);
            ctx.globalAlpha = alpha * 0.6;
            ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
            ctx.fillRect(trailX - sz / 2, trailY - sz / 2, sz, sz);
          }
        }

        // ─── Particle size: grow as it approaches ───
        const sizeT = Math.min(1, p.progress * 2);
        const currentSize = p.arrived
          ? p.size  // exact size when settled
          : 1 + (p.size - 1) * easeInOutCubic(sizeT);

        // ─── Glow halo ───
        if (p.progress > 0.5) {
          const glowAlpha = 0.12 * Math.min(1, (p.progress - 0.5) * 4);
          ctx.globalAlpha = glowAlpha;
          ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
          const gs = currentSize + 4;
          ctx.fillRect(
            Math.round(p.x) - 2,
            Math.round(p.y) - 2,
            gs, gs
          );
        }

        // ─── Main pixel ───
        ctx.globalAlpha = 1;
        ctx.fillStyle = p.arrived
          ? `rgb(${p.r},${p.g},${p.b})`
          : `rgb(${cr},${cg},${cb})`;

        if (p.arrived) {
          // Pixel-perfect snap when settled
          ctx.fillRect(Math.round(p.tx), Math.round(p.ty), p.size, p.size);
        } else {
          ctx.fillRect(
            Math.round(p.x),
            Math.round(p.y),
            currentSize, currentSize
          );
        }
      }

      // ─── Breathing glow during hold ───
      if (phaseRef.current === "holding") {
        if (!holdStartRef.current) holdStartRef.current = timestamp;
        const elapsed = timestamp - holdStartRef.current;
        const breathe = 0.5 + 0.5 * Math.sin(elapsed * 0.0025);

        ctx.globalAlpha = 0.06 + breathe * 0.05;
        const grad = ctx.createRadialGradient(cx + 50, cy - -200, 10, cx, cy, DISPLAY_SIZE * 0.9);
        grad.addColorStop(0, "rgba(204,255,0,0.5)");
        grad.addColorStop(0.4, "rgba(204,255,0,0.15)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(cx - DISPLAY_SIZE, cy - DISPLAY_SIZE, DISPLAY_SIZE * 2, DISPLAY_SIZE * 2);
      }

      // ─── Bloom flash ───
      if (flashRef.current.active) {
        flashRef.current.progress += 0.018;
        if (flashRef.current.progress < 1) {
          const fp = flashRef.current.progress;
          // Bright center flash
          ctx.globalAlpha = (1 - fp) * 0.5;
          const flashGrad = ctx.createRadialGradient(cx, cy - 30, 0, cx, cy, DISPLAY_SIZE * (0.5 + fp * 1.5));
          flashGrad.addColorStop(0, "rgba(255,255,255,0.8)");
          flashGrad.addColorStop(0.3, "rgba(204,255,0,0.3)");
          flashGrad.addColorStop(1, "transparent");
          ctx.fillStyle = flashGrad;
          ctx.fillRect(0, 0, W, H);
        }
      }



      ctx.globalAlpha = 1;

      // ─── Completion ───
      if (arrivedCount >= threshold && !doneRef.current) {
        doneRef.current = true;
        flashRef.current.active = true;
        shockwaves.push({ progress: 0 });
        setTimeout(() => shockwaves.push({ progress: 0 }), 150);
        setTimeout(onComplete, 600);
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [initialParticles, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
}

// ─── LOADING OVERLAY ──────────────────────────────────────────────────────────

interface LoadingOverlayProps {
  onRevealComplete: () => void;
}

export function LoadingOverlay({ onRevealComplete }: LoadingOverlayProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [particles, setParticles] = useState<ParticleInit[]>([]);
  const [overlayOpacity, setOverlayOpacity] = useState(1);

  useEffect(() => {
    const img = new Image();
    img.src = "images/nova_e.png";
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = DISPLAY_SIZE;
      off.height = DISPLAY_SIZE;
      const offCtx = off.getContext("2d")!;
      offCtx.drawImage(img, 0, 0, DISPLAY_SIZE, DISPLAY_SIZE);

      const data = offCtx.getImageData(0, 0, DISPLAY_SIZE, DISPLAY_SIZE).data;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cxPage = W / 2;
      const cyPage = H / 2;
      const originX = cxPage - DISPLAY_SIZE / 2;
      const originY = cyPage - DISPLAY_SIZE / 2 - 20; // slight upward offset for better centering

      const corners = [
        { x: -120, y: -120 },
        { x: W + 120, y: -120 },
        { x: -120, y: H + 120 },
        { x: W + 120, y: H + 120 },
      ];

      const result: ParticleInit[] = [];

      for (let y = 0; y < DISPLAY_SIZE; y += SAMPLE_STEP) {
        for (let x = 0; x < DISPLAY_SIZE; x += SAMPLE_STEP) {
          const idx = (y * DISPLAY_SIZE + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a > 80) {
            const corner = corners[Math.floor(Math.random() * 4)];
            const dx = x - DISPLAY_SIZE / 2;
            const dy = y - DISPLAY_SIZE / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = DISPLAY_SIZE * 0.72;

            const sx = corner.x + (Math.random() - 0.5) * 300;
            const sy = corner.y + (Math.random() - 0.5) * 300;
            const tx = originX + x;
            const ty = originY + y;

            // Stronger bezier curvature for dramatic arcs
            const mx = (sx + tx) / 2;
            const my = (sy + ty) / 2;
            const pdx = tx - sx;
            const pdy = ty - sy;
            const len = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
            const curveDir = Math.random() > 0.5 ? 1 : -1;
            const curvature = 0.25 + Math.random() * 0.35;
            const cpx = mx + (-pdy / len) * curvature * len * curveDir;
            const cpy = my + (pdx / len) * curvature * len * curveDir;

            result.push({
              tx, ty, sx, sy, cpx, cpy,
              size: SAMPLE_STEP,
              speed: 0.007 + Math.random() * 0.014,
              r, g, b,
              delay: Math.floor(Math.random() * 25 + (dist / maxDist) * 25),
            });
          }
        }
      }

      setParticles(result);
      setPhase("streaming");
    };
  }, []);

  const handleDone = useCallback(() => {
    setPhase("holding");
    setTimeout(() => {
      onRevealComplete();
      setTimeout(() => setPhase("revealing"), 700);
    }, HOLD_DURATION_MS);
  }, [onRevealComplete]);

  return (
    <AnimatePresence>
      {(phase !== "revealing" || overlayOpacity > 0) ? (
        <motion.div
          key="overlay"
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: phase === "revealing" ? 0 : 1,
            scale: phase === "revealing" ? 1.08 : 1,
          }}
          transition={{
            duration: FADE_DURATION_MS / 1000,
            ease: [0.16, 1, 0.3, 1],
          }}
          onAnimationComplete={() => {
            if (phase === "revealing") setOverlayOpacity(0);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            overflow: "hidden",
            background: "#020204",
          }}
        >
          {/* Subtle radial vignette */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
            pointerEvents: "none",
            zIndex: 3,
          }} />

          {phase !== "loading" && (
            <ParticleCanvas
              initialParticles={particles}
              onComplete={handleDone}
              phase={phase}
            />
          )}

          {/* Scanline texture */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)",
            pointerEvents: "none",
            zIndex: 8,
            opacity: 0.25,
          }} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}