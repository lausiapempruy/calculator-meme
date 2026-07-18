/* =========================================================
   notifications.js
   Random fake toast notifications.
   Exposes window.Notifications
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
  ];

  let containerEl = null;
  let timerId = null;
  let toastCounter = 0;

  function randomInterval() {
    // every 9 - 16 seconds
    return 9000 + Math.random() * 7000;
  }

  function show(icon, text, duration = 4200) {
    if (!containerEl) return;
    const toast = document.createElement("div");
    toast.className = "toast";
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
    const pick = TOASTS[Math.floor(Math.random() * TOASTS.length)];
    show(pick.icon, pick.text);
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
