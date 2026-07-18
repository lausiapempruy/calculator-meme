/* =========================================================
   memes.js
   Rotating meme/joke text for the footer.
   Exposes window.Memes

   v2.0 SMP Studios Edition: added football/SMP-flavored lines
   into the same rotation (randomized, not overused).
   ========================================================= */
(function () {
  "use strict";

  const MEMES = [
    "Math sponsored by capitalism.",
    "2 + 2 requires Premium.",
    "Certified by nobody.",
    "Powered by potatoes.",
    "NASA rejected this calculator.",
    "Error 404: Intelligence not found.",
    "This calculator has DLC.",
    "Calculating your future...",
    "Premium users unlock Number 7.",
    "Terms and conditions: there are none, we made them up.",
    "Your subscription funds absolutely nothing.",
    "Now with 12% more math.",
    "Division by zero requires Ultimate Pack.",
    "Warning: numbers may be judgmental.",
    "Free trial included a free trial of the free trial.",
    "Long division sold separately.",
    "Now optimized for maximum billing.",
    "Pi is only 90% accurate on the free tier.",
    // --- v2.0 football / SMP Studios lines ---
    "⚽ Penalty for using calculator.",
    "VAR is checking your calculation...",
    "Offside! Your answer has been cancelled.",
    "Goal!!! 20 + 20 = 40",
    "🟨 Yellow Card: Wrong Formula",
    "🟥 Red Card: Division by Zero",
    "The referee added 7 minutes of calculation.",
    "🐐 Messi approved this answer.",
    "Ronaldo says SIUUUU! 🐐",
    "Ballon d'Or Calculator 🏆",
    "Made by SMP Studios 🍌⚽",
    "Squad Minion Plenger approves this math.",
  ];

  let timerId = null;
  let footerEl = null;
  let idx = 0;

  function randomDelay() {
    // 5 - 8 seconds
    return 5000 + Math.random() * 3000;
  }

  function pickNextIndex() {
    if (MEMES.length <= 1) return 0;
    let next;
    do {
      next = Math.floor(Math.random() * MEMES.length);
    } while (next === idx);
    return next;
  }

  function swap() {
    if (!footerEl) return;
    footerEl.classList.add("is-swapping");
    setTimeout(() => {
      idx = pickNextIndex();
      footerEl.textContent = MEMES[idx];
      footerEl.classList.remove("is-swapping");
    }, 220);
    timerId = setTimeout(swap, randomDelay());
  }

  function init(elId) {
    footerEl = document.getElementById(elId);
    if (!footerEl) return;
    idx = Math.floor(Math.random() * MEMES.length);
    footerEl.textContent = MEMES[idx];
    timerId = setTimeout(swap, randomDelay());
  }

  function stop() {
    if (timerId) clearTimeout(timerId);
    timerId = null;
  }

  window.Memes = { init, stop, MEMES };
})();
