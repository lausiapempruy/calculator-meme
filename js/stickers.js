/* =========================================================
   sticker.js  (NEW in v2.1 — Gaming & Community Update)
   A small, cute "TERIMA KASIH" sticker that pops in after a
   successful fake payment, iMessage-sticker style, then
   fades away on its own.
   Exposes window.ThanksSticker
   ========================================================= */
(function () {
  "use strict";

  const VARIANTS = ["❤️", "🎉", "✨", "👍"];

  let stickerEl = null;
  let hideTimer = null;

  function ensureEl() {
    if (stickerEl) return stickerEl;
    stickerEl = document.createElement("div");
    stickerEl.className = "thanks-sticker";
    stickerEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(stickerEl);
    return stickerEl;
  }

  function show() {
    const el = ensureEl();
    const emoji = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
    el.innerHTML = `<span class="thanks-sticker__emoji">${emoji}</span><span>TERIMA KASIH</span><span class="thanks-sticker__emoji">${emoji}</span>`;

    // restart animation even if it's already visible
    el.classList.remove("is-visible");
    void el.offsetWidth;
    el.classList.add("is-visible");

    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      el.classList.remove("is-visible");
    }, 2600);
  }

  window.ThanksSticker = { show };
})();
