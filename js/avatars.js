/* =========================================================
   avatars.js  (NEW in v2.1 — Gaming & Community Update)
   Two small, fully original cartoon avatars:
     Avatar A = the project creator
     Avatar B = the visitor / player
   Exposes window.Avatars
   ========================================================= */
(function () {
  "use strict";

  // Original geometric cartoon face — NOT based on any real photo or
  // existing character. Simple circle + dot eyes + shapes only.
  const AVATAR_A_SVG = `
    <svg viewBox="0 0 64 64" width="40" height="40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Creator avatar">
      <defs>
        <linearGradient id="smpGradA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7c5cff"/>
          <stop offset="100%" stop-color="#3fd0ff"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#smpGradA)"/>
      <rect x="14" y="14" width="36" height="8" rx="4" fill="#08080d" opacity="0.78"/>
      <circle cx="24" cy="32" r="4" fill="#08080d"/>
      <circle cx="40" cy="32" r="4" fill="#08080d"/>
      <path d="M22 44 Q32 52 42 44" stroke="#08080d" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;

  const AVATAR_B_SVG = `
    <svg viewBox="0 0 64 64" width="40" height="40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Visitor avatar">
      <defs>
        <linearGradient id="smpGradB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffd60a"/>
          <stop offset="100%" stop-color="#2fae5f"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#smpGradB)"/>
      <path d="M12 26 Q32 6 52 26" stroke="#08080d" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.78"/>
      <circle cx="24" cy="32" r="4" fill="#08080d"/>
      <circle cx="40" cy="32" r="4" fill="#08080d"/>
      <path d="M22 42 Q32 48 42 42" stroke="#08080d" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;

  const CREATOR_LINES = [
    "I definitely tested this.",
    "Trust me bro.",
    "It's not a bug, it's a feature.",
    "99% tested. Probably.",
    "Works on my machine.",
  ];

  const VISITOR_LINES = [
    "Why am I paying for a calculator?",
    "I regret nothing.",
    "This better be worth it.",
    "Send help.",
    "I just wanted to add 2 + 2.",
  ];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getRandomCreatorLine() {
    return pick(CREATOR_LINES);
  }

  function getRandomVisitorLine() {
    return pick(VISITOR_LINES);
  }

  function renderDuo(opts = {}) {
    const creatorLine = opts.creatorLine || getRandomCreatorLine();
    const visitorLine = opts.visitorLine || getRandomVisitorLine();
    return `
      <div class="avatar-duo">
        <div class="avatar-card">
          ${AVATAR_A_SVG}
          <span class="avatar-card__label">Creator</span>
          <p class="avatar-card__bubble">"${creatorLine}"</p>
        </div>
        <div class="avatar-card">
          ${AVATAR_B_SVG}
          <span class="avatar-card__label">You</span>
          <p class="avatar-card__bubble">"${visitorLine}"</p>
        </div>
      </div>`;
  }

  window.Avatars = {
    AVATAR_A_SVG,
    AVATAR_B_SVG,
    getRandomCreatorLine,
    getRandomVisitorLine,
    renderDuo,
  };
})();
