/* =========================================================
   notifications.js
   Random fake toast notifications.
   Exposes window.Notifications

   v2.0 SMP Studios Edition:
   - added football-themed toasts to the rotation
   - show() now accepts an isAchievement flag so
     achievements.js can render a distinct gold toast

   v2.1 Gaming & Community Update:
   - mixes original Minecraft/Roblox/Free Fire style toasts
     (from window.Gaming) into the same rotation
   - reports which gaming category was just shown to
     window.Gaming, so the "Gamer" achievement can unlock
     once all three have appeared at least once
   ========================================================= */
(function () {
  "use strict";

  const TOASTS = [
    { icon: "🚀", text: "New Premium Pack available!" },
    { icon: "🎉", text: "Universe Pack now 0% off!" },
    { icon: "⚠️", text: "Calculator update requires another subscription." },
    { icon: "🏆", text: "Congratulations! You unlocked absolutely nothing." },
    { icon: "📉", text: "Your fake balance has reached $0.00." },
    { icon: "🔔", text: "Reminder: 7 is still locked behind Premium." },
    { icon: "🐦", text: "Angry Birds has approved this transaction." },
    { icon: "💳", text: "No card was charged. Probably." },
    { icon: "🧮", text: "Multiplication tables restocking soon." },
    { icon: "🛰️", text: "NASA has left your calculator on read." },
    // --- v2.0 football / SMP Studios toasts ---
    { icon: "⚽", text: "VAR is checking..." },
    { icon: "🐐", text: "Messi approved your equation." },
    { icon: "🐐", text: "Ronaldo celebrated your answer. SIUUUU!" },
    { icon: "🥅", text: "GOAL!!!" },
    { icon: "🟨", text: "Penalty awarded." },
    { icon: "🍌", text: "Banana supply restored." },
    { icon: "⏱️", text: "Calculator has entered injury time." },
  ];

  function buildToastPool() {
    // Static toasts + whatever gaming.js currently exposes, tagged
    // with a category so we can report back which one was shown.
    const pool = TOASTS.map((t) => ({ ...t, category: null }));
    if (window.Gaming) {
      window.Gaming.MINECRAFT_LINES.forEach((t) => pool.push({ ...t, category: "minecraft" }));
      window.Gaming.ROBLOX_LINES.forEach((t) => pool.push({ ...t, category: "roblox" }));
      window.Gaming.FREEFIRE_LINES.forEach((t) => pool.push({ ...t, category: "freefire" }));
    }
    return pool;
  }

  let containerEl = null;
  let timerId = null;
  let toastCounter = 0;

  function randomInterval() {
    // every 9 - 16 seconds
    return 9000 + Math.random() * 7000;
  }

  function show(icon, text, duration = 4200, isAchievement = false) {
    if (!containerEl) return;
    const toast = document.createElement("div");
    toast.className = "toast" + (isAchievement ? " toast--achievement" : "");
    toast.id = `toast-${++toastCounter}`;
    toast.innerHTML = `<span aria-hidden="true">${icon}</span><span>${text}</span>`;
    containerEl.appendChild(toast);

    const removeTimer = setTimeout(() => remove(toast), duration);
    toast.addEventListener("click", () => {
      clearTimeout(removeTimer);
      remove(toast);
    });
  }

  function remove(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add("is-leaving");
    setTimeout(() => toast.remove(), 350);
  }

  function showRandom() {
    const pool = buildToastPool();
    const pick = pool[Math.floor(Math.random() * pool.length)];
    show(pick.icon, pick.text);
    if (pick.category && window.Gaming) {
      window.Gaming.noteCategoryTriggered(pick.category);
    }
    schedule();
  }

  function schedule() {
    timerId = setTimeout(showRandom, randomInterval());
  }

  function init(containerId) {
    containerEl = document.getElementById(containerId);
    if (!containerEl) return;
    // first toast arrives a bit after load so it doesn't feel instant
    timerId = setTimeout(showRandom, 6000 + Math.random() * 4000);
  }

  function stop() {
    if (timerId) clearTimeout(timerId);
    timerId = null;
  }

  window.Notifications = { init, stop, show };
})();
