// src/components/SeasonalParticles.jsx
// Globally mounted in App.jsx — covers every page (Login, Register, Dashboard, Chat, Video, Whiteboard).
// Auto-activates when a seasonal theme is active via ThemeContext.

import { useEffect, useRef, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

// ══════════════════════════════════════════════════════════════════════════════
// PARTICLE DRAW FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

// ── SAKURA — realistic cherry blossom petals with 5-lobe shape ───────────────
function drawSakura(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = p.alpha;

  const s = p.size;
  // Main petal body (5-petal flower silhouette)
  ctx.beginPath();
  // Heart-shaped petal with notch at top
  ctx.moveTo(0, s * 0.1);
  ctx.bezierCurveTo(s * 0.6, -s * 0.5, s * 0.9, -s * 0.1, s * 0.5, s * 0.55);
  ctx.bezierCurveTo(s * 0.25, s * 0.9, -s * 0.25, s * 0.9, -s * 0.5, s * 0.55);
  ctx.bezierCurveTo(-s * 0.9, -s * 0.1, -s * 0.6, -s * 0.5, 0, s * 0.1);
  ctx.closePath();

  // Gradient fill
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
  grad.addColorStop(0, p.colorInner);
  grad.addColorStop(0.6, p.color);
  grad.addColorStop(1, p.colorOuter);
  ctx.fillStyle = grad;
  ctx.fill();

  // Petal highlight / shine
  ctx.beginPath();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.ellipse(-s * 0.12, s * 0.18, s * 0.18, s * 0.32, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Subtle center vein lines
  ctx.strokeStyle = "rgba(255,160,180,0.3)";
  ctx.lineWidth = 0.5;
  for (let v = 0; v < 3; v++) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.15);
    const a = (-0.4 + v * 0.4);
    ctx.lineTo(Math.sin(a) * s * 0.55, s * 0.65);
    ctx.stroke();
  }

  ctx.restore();
}

// ── WINTER — detailed crystalline snowflakes ──────────────────────────────────
function drawSnowflake(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = p.alpha;

  const s = p.size;
  ctx.strokeStyle = p.color;
  ctx.lineWidth = Math.max(0.6, s * 0.07);
  ctx.lineCap = "round";

  for (let arm = 0; arm < 6; arm++) {
    ctx.save();
    ctx.rotate((arm * Math.PI) / 3);

    // Main arm
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s); ctx.stroke();

    // 3 branch pairs along the arm
    [0.65, 0.42, 0.22].forEach((frac, bi) => {
      const bLen = s * (0.28 - bi * 0.06);
      const bY   = -s * frac;
      ctx.beginPath();
      ctx.moveTo(0, bY); ctx.lineTo(bLen * 0.7,  bY - bLen * 0.7); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, bY); ctx.lineTo(-bLen * 0.7, bY - bLen * 0.7); ctx.stroke();
    });

    // Tip diamond
    ctx.beginPath();
    ctx.moveTo(0, -s); ctx.lineTo(s * 0.06, -s + s * 0.07);
    ctx.lineTo(0, -s + s * 0.13); ctx.lineTo(-s * 0.06, -s + s * 0.07);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();

    ctx.restore();
  }

  // Glowing center hexagon
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.18);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(1, p.color);
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.restore();
}

// ── SPRING — mixed petals, leaves, dandelion seeds, butterflies ───────────────
function drawSpring(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = p.alpha;

  const s = p.size;

  if (p.type === 0) {
    // Rounded flower petal
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.bezierCurveTo(s * 0.65, s * 0.6, s * 0.65, -s * 0.3, 0, -s);
    ctx.bezierCurveTo(-s * 0.65, -s * 0.3, -s * 0.65, s * 0.6, 0, s);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, -s, 0, s);
    g.addColorStop(0, p.colorInner);
    g.addColorStop(1, p.color);
    ctx.fillStyle = g;
    ctx.fill();
    // vein
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(0, -s * 0.7); ctx.lineTo(0, s * 0.7); ctx.stroke();

  } else if (p.type === 1) {
    // Leaf with stem
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * 0.8, -s * 0.2, s * 0.7, -s * 1.1, 0, -s * 1.3);
    ctx.bezierCurveTo(-s * 0.7, -s * 1.1, -s * 0.8, -s * 0.2, 0, 0);
    ctx.closePath();
    const g2 = ctx.createLinearGradient(0, 0, 0, -s * 1.3);
    g2.addColorStop(0, p.color);
    g2.addColorStop(1, p.colorInner);
    ctx.fillStyle = g2;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -s * 1.2); ctx.stroke();

  } else if (p.type === 2) {
    // Dandelion seed (circle with radiating lines)
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.strokeStyle = p.colorInner;
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 8; r++) {
      const ang = (r * Math.PI * 2) / 8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * s * 0.12, Math.sin(ang) * s * 0.12);
      ctx.lineTo(Math.cos(ang) * s * 0.65, Math.sin(ang) * s * 0.65);
      ctx.stroke();
      // Tiny ball at tip
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * s * 0.65, Math.sin(ang) * s * 0.65, s * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = p.colorInner;
      ctx.fill();
    }
  }

  ctx.restore();
}

// ── SUMMER — sunflower petals, golden sparkles, fireflies ────────────────────
function drawSummer(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = p.alpha;

  const s = p.size;

  if (p.type === 0) {
    // Sunflower petal — elongated with rounded end
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * 0.4, -s * 0.15, s * 0.45, -s * 0.7, 0, -s);
    ctx.bezierCurveTo(-s * 0.45, -s * 0.7, -s * 0.4, -s * 0.15, 0, 0);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, -s);
    g.addColorStop(0, "#FF8C00");
    g.addColorStop(0.5, p.color);
    g.addColorStop(1, "#FFE566");
    ctx.fillStyle = g;
    ctx.fill();
    // Highlight
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.ellipse(s * 0.1, -s * 0.4, s * 0.1, s * 0.25, 0.3, 0, Math.PI * 2);
    ctx.fill();

  } else if (p.type === 1) {
    // 8-pointed sparkle / starburst
    ctx.beginPath();
    for (let sp = 0; sp < 8; sp++) {
      const angle = (sp * Math.PI) / 4;
      const r = sp % 2 === 0 ? s : s * 0.38;
      sp === 0
        ? ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
        : ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
    sg.addColorStop(0, "rgba(255,255,200,0.95)");
    sg.addColorStop(0.4, p.color);
    sg.addColorStop(1, "rgba(255,140,0,0)");
    ctx.fillStyle = sg;
    ctx.fill();
    // Bright core
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,220,0.9)";
    ctx.fill();

  } else {
    // Firefly glow bubble
    const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
    fg.addColorStop(0, "rgba(255,255,160,0.9)");
    fg.addColorStop(0.4, p.color);
    fg.addColorStop(1, "rgba(255,200,0,0)");
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fillStyle = fg;
    ctx.fill();
  }

  ctx.restore();
}

// ══════════════════════════════════════════════════════════════════════════════
// SEASON CONFIGS
// ══════════════════════════════════════════════════════════════════════════════
const CONFIGS = {
  sakura: {
    count: 55,
    colors:      ["#FFB7C5", "#FF8FA3", "#FFCDD5", "#FF6B8A", "#FFC0CB"],
    colorInners: ["#FFFFFF", "#FFE0E8", "#FFF0F3", "#FFD6DF"],
    colorOuters: ["#FF8FA3", "#FF5C7A", "#FFAABF", "#E8678A"],
    draw: drawSakura,
    sizeRange:     [5, 13],
    speedRange:    [0.55, 1.9],
    swayRange:     [0.5, 1.4],
    rotSpeedRange: [0.006, 0.032],
    alphaRange:    [0.55, 0.92],
    // Subtle ambient atmospheric tint for this season
    ambientColor:  "rgba(255,100,130,0.04)",
  },

  winter: {
    count: 65,
    colors:      ["#FFFFFF", "#D6EEF8", "#A8D8EA", "#E8F4F8", "#C0E8F8"],
    colorInners: ["#FFFFFF"],
    colorOuters: ["#A8D8EA"],
    draw: drawSnowflake,
    sizeRange:     [4, 18],   // mix of tiny & large flakes
    speedRange:    [0.25, 1.2],
    swayRange:     [0.1, 0.7],
    rotSpeedRange: [0.001, 0.012],
    alphaRange:    [0.45, 0.9],
    ambientColor:  "rgba(168,216,234,0.03)",
  },

  spring: {
    count: 50,
    colors:      ["#FFB3C6", "#A8E6CF", "#F9D56E", "#B8F0BB", "#FFD1DC", "#98E4D4"],
    colorInners: ["#FFFFFF", "#FFF9F0", "#F0FFF0", "#FFFBE6"],
    colorOuters: ["#FF8FA3", "#5FAD64", "#E8A830", "#7BC67E"],
    draw: drawSpring,
    sizeRange:     [4, 11],
    speedRange:    [0.35, 1.4],
    swayRange:     [0.35, 1.1],
    rotSpeedRange: [0.004, 0.028],
    alphaRange:    [0.5, 0.88],
    ambientColor:  "rgba(120,200,130,0.03)",
    typeCount: 3,
  },

  summer: {
    count: 38,
    colors:      ["#FFD700", "#FFA500", "#FFE566", "#FFEC8A", "#FFB347", "#FFD040"],
    colorInners: ["#FFFFFF", "#FFFDE0"],
    colorOuters: ["#FF8C00", "#FF6B00"],
    draw: drawSummer,
    sizeRange:     [3, 10],
    speedRange:    [0.18, 0.85],
    swayRange:     [0.6, 1.8],
    rotSpeedRange: [0.008, 0.045],
    alphaRange:    [0.4, 0.82],
    ambientColor:  "rgba(255,210,0,0.03)",
    typeCount: 3,
  },
};

// ── Factory: make one particle ───────────────────────────────────────────────
function makeParticle(cfg, W, H, fromTop = false) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rng  = (mn, mx) => mn + Math.random() * (mx - mn);

  return {
    x:           rng(-30, W + 30),
    y:           fromTop ? rng(-80, -10) : rng(0, H),
    size:        rng(...cfg.sizeRange),
    color:       pick(cfg.colors),
    colorInner:  pick(cfg.colorInners || cfg.colors),
    colorOuter:  pick(cfg.colorOuters || cfg.colors),
    speed:       rng(...cfg.speedRange),
    sway:        rng(...cfg.swayRange),
    swayOffset:  Math.random() * Math.PI * 2,
    swaySpeed:   0.006 + Math.random() * 0.016,
    rot:         Math.random() * Math.PI * 2,
    rotSpeed:    (Math.random() < 0.5 ? 1 : -1) * rng(...cfg.rotSpeedRange),
    alpha:       rng(...(cfg.alphaRange || [0.5, 0.9])),
    alphaTarget: rng(...(cfg.alphaRange || [0.5, 0.9])),
    alphaSpeed:  0.003 + Math.random() * 0.006,
    type:        cfg.typeCount ? Math.floor(Math.random() * cfg.typeCount) : 0,
    wobble:      Math.random() * Math.PI * 2, // extra secondary sway
    wobbleSpeed: 0.003 + Math.random() * 0.005,
  };
}

// ── Ambient atmospheric overlay per season ────────────────────────────────────
function drawAmbient(ctx, W, H, cfg, t) {
  if (!cfg.ambientColor) return;
  // Subtle vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
  vg.addColorStop(0, "transparent");
  vg.addColorStop(1, cfg.ambientColor);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}

// ══════════════════════════════════════════════════════════════════════════════
export default function SeasonalParticles() {
  const { activeParticles } = useContext(ThemeContext);
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const stateRef   = useRef({ particles: [], t: 0 });
  const prevSeason = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    cancelAnimationFrame(rafRef.current);

    if (!activeParticles) {
      const ctx2 = canvas.getContext("2d");
      // Fade out gracefully
      let fade = 1;
      const fadeOut = () => {
        fade -= 0.04;
        if (fade > 0) {
          ctx2.globalAlpha = fade;
          rafRef.current = requestAnimationFrame(fadeOut);
        } else {
          ctx2.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
      fadeOut();
      return;
    }

    const cfg = CONFIGS[activeParticles];
    if (!cfg) return;

    const newSeason = activeParticles !== prevSeason.current;
    prevSeason.current = activeParticles;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Seed particles
    stateRef.current.particles = Array.from({ length: cfg.count }, () =>
      makeParticle(cfg, canvas.width, canvas.height, newSeason)
    );
    stateRef.current.t = 0;

    const ctx = canvas.getContext("2d");

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { t, particles } = stateRef.current;
      stateRef.current.t += 0.016;

      // Ambient seasonal tint
      drawAmbient(ctx, canvas.width, canvas.height, cfg, t);

      particles.forEach((p, i) => {
        // Physics — gravity + sway + wobble
        p.y   += p.speed;
        p.x   += Math.sin(t * p.swaySpeed + p.swayOffset) * p.sway
                + Math.cos(t * p.wobbleSpeed + p.wobble) * (p.sway * 0.3);
        p.rot += p.rotSpeed;

        // Gentle alpha breathing
        p.alpha += (p.alphaTarget - p.alpha) * p.alphaSpeed;
        if (Math.abs(p.alphaTarget - p.alpha) < 0.01)
          p.alphaTarget = (cfg.alphaRange ? cfg.alphaRange[0] + Math.random() * (cfg.alphaRange[1] - cfg.alphaRange[0]) : 0.5 + Math.random() * 0.4);

        // Bottom fade
        const fadeStart = canvas.height * 0.88;
        if (p.y > fadeStart) {
          p.alpha = Math.max(0, p.alpha - 0.025);
        }

        cfg.draw(ctx, p);

        // Recycle
        if (p.y > canvas.height + 40 || p.alpha <= 0.02) {
          stateRef.current.particles[i] = makeParticle(cfg, canvas.width, canvas.height, true);
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [activeParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: 9998,
        opacity: activeParticles ? 1 : 0,
        transition: "opacity 1.2s ease",
      }}
    />
  );
}