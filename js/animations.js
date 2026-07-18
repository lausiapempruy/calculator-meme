/* =========================================================
   animations.js
   Confetti burst, button ripple, and tiny sound effects.
   Exposes window.Animations
   ========================================================= */
(function () {
  "use strict";

  const SOUND_ENABLED = true;
  let audioCtx = null;

  function getAudioCtx() {
    if (!SOUND_ENABLED) return null;
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (err) {
        return null;
      }
    }
    return audioCtx;
  }

  function beep({ freq = 880, duration = 0.08, type = "sine", gain = 0.05 } = {}) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gainNode.gain.value = gain;

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  }

  function playClick() {
    beep({ freq: 720, duration: 0.05, type: "sine", gain: 0.04 });
  }

  function playSuccess() {
    beep({ freq: 523.25, duration: 0.12, type: "triangle", gain: 0.06 });
    setTimeout(() => beep({ freq: 659.25, duration: 0.12, type: "triangle", gain: 0.06 }), 100);
    setTimeout(() => beep({ freq: 783.99, duration: 0.18, type: "triangle", gain: 0.07 }), 200);
  }

  function playError() {
    beep({ freq: 220, duration: 0.16, type: "square", gain: 0.035 });
  }

  /* ---------------- Button ripple ---------------- */
  function attachRipple(buttonEl) {
    buttonEl.addEventListener("pointerdown", (e) => {
      const rect = buttonEl.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
      const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;

      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      buttonEl.appendChild(ripple);
      setTimeout(() => ripple.remove(), 520);
    });
  }

  /* ---------------- Confetti ---------------- */
  let confettiCanvas = null;
  let confettiCtx = null;
  let confettiParticles = [];
  let confettiRaf = null;

  const CONFETTI_COLORS = ["#7c5cff", "#3fd0ff", "#ffd60a", "#32d74b", "#ff453a", "#ffffff"];

  function initConfetti(canvasId) {
    confettiCanvas = document.getElementById(canvasId);
    if (!confettiCanvas) return;
    confettiCtx = confettiCanvas.getContext("2d");
    resizeConfettiCanvas();
    window.addEventListener("resize", resizeConfettiCanvas);
  }

  function resizeConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function burstConfetti(count = 140) {
    if (!confettiCanvas || !confettiCtx) return;
    const w = confettiCanvas.width;
    confettiParticles = [];

    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: w / 2 + (Math.random() - 0.5) * 120,
        y: -20 - Math.random() * 200,
        r: 4 + Math.random() * 5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.5 ? "rect" : "circle",
        life: 0,
        maxLife: 140 + Math.random() * 60,
      });
    }

    if (!confettiRaf) tickConfetti();
  }

  function tickConfetti() {
    if (!confettiCtx || !confettiCanvas) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let alive = false;
    confettiParticles.forEach((p) => {
      if (p.life >= p.maxLife) return;
      alive = true;
      p.life += 1;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.rotation += p.vr;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.shape === "rect") {
        confettiCtx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      } else {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      }
      confettiCtx.restore();
    });

    if (alive) {
      confettiRaf = requestAnimationFrame(tickConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiParticles = [];
      confettiRaf = null;
    }
  }

  window.Animations = {
    attachRipple,
    initConfetti,
    burstConfetti,
    playClick,
    playSuccess,
    playError,
  };
})();
