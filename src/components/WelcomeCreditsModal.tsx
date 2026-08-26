"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api";

function burstConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => undefined;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const colors = ["#D3FB52", "#1A1A1A", "#7C8A6E", "#F4A261", "#4CC9F0", "#FFFFFF"];
  const pieces = Array.from({ length: 90 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    return {
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 80,
      y: window.innerHeight * 0.38,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      life: 0,
    };
  });

  let frame = 0;
  let raf = 0;
  const tick = () => {
    frame += 1;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of pieces) {
      p.vy += 0.18;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life += 1;
      const alpha = Math.max(0, 1 - p.life / 110);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (frame < 120) raf = window.requestAnimationFrame(tick);
  };
  raf = window.requestAnimationFrame(tick);

  const onResize = () => resize();
  window.addEventListener("resize", onResize);
  return () => {
    window.cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  };
}

export function WelcomeCreditsModal({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return burstConfetti(canvas);
  }, []);

  async function dismiss() {
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      await api("/api/handshake/me/welcome-seen", { method: "POST" });
    } catch {
      // Still close locally; next login will retry until the flag sticks.
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-hs-dark/45 backdrop-blur-sm" onClick={() => void dismiss()} />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
      />
      <div className="relative z-[2] w-full max-w-md overflow-hidden rounded-3xl border border-hs-line bg-white p-7 shadow-card">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-hs-accent via-[#7C8A6E] to-hs-accent" />
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-hs-muted">
          Welcome
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-hs-ink">
          Thanks for joining Handshake Alerts
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-hs-muted">
          You just got <span className="font-semibold text-hs-ink">5 free credits</span>{" "}
          to get started. Each credit sends one SMS when claimable tasks show up
          on a project you’re watching.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-hs-muted">
          Add a project below, keep alerts on, and we’ll text you when it’s time
          to claim. When you’re ready for more, grab a credit pack anytime.
        </p>
        <div className="mt-5 inline-flex items-center rounded-full border border-hs-line bg-hs-bg px-4 py-2 text-sm font-semibold text-hs-ink">
          5 free credits ready
        </div>
        <button
          type="button"
          className="btn-primary mt-6 w-full"
          onClick={() => void dismiss()}
        >
          Let’s go
        </button>
      </div>
    </div>
  );
}
