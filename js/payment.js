/* =========================================================
   payment.js
   Fake subscription modal + fake payment flow.
   Exposes window.Payment
   ========================================================= */
(function () {
  "use strict";

  const PLANS = [
    {
      id: "pro",
      icon: "💸",
      name: "Pro Pack",
      price: "$20,000",
      desc: "Unlock basic mathematics.",
      variant: "",
    },
    {
      id: "ultimate",
      icon: "👑",
      name: "Ultimate Pack",
      price: "$50,000",
      desc: "Unlock premium numbers.",
      variant: "",
    },
    {
      id: "universe",
      icon: "birdIcon", // special-cased: renders the original parody bird SVG
      name: "Universe Pack",
      price: "$1,000,000,000",
      desc: "Certified by Angry Birds.",
      variant: "plan-card--universe",
    },
  ];

  const LOADING_MESSAGES = [
    "Talking to the bank...",
    "Printing fake money...",
    "Downloading mathematics...",
    "Installing Premium Brain...",
    "Contacting NASA...",
    "Negotiating with Angry Birds...",
    "Calculating taxes...",
    "Loading...",
  ];

  // Original parody bird icon (NOT a copyrighted asset) — simple geometric
  // angry-looking round bird built from shapes, used purely as a joke motif.
  const BIRD_SVG = `
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="26" r="16" fill="#ff453a"/>
      <path d="M8 24 Q4 16 12 14 Q10 20 14 22 Z" fill="#c62b22"/>
      <path d="M40 24 Q44 16 36 14 Q38 20 34 22 Z" fill="#c62b22"/>
      <circle cx="18" cy="22" r="5" fill="white"/>
      <circle cx="30" cy="22" r="5" fill="white"/>
      <circle cx="19.5" cy="23" r="2.2" fill="#111"/>
      <circle cx="28.5" cy="23" r="2.2" fill="#111"/>
      <path d="M18 12 Q24 4 30 12" stroke="#7a1a12" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M20 30 L24 35 L28 30 Z" fill="#ffb703"/>
    </svg>`;

  let els = {};
  let onPurchaseComplete = null;
  let loadingTimer = null;
  let loadingMsgTimer = null;

  function cacheEls() {
    els = {
      premiumOverlay: document.getElementById("premiumOverlay"),
      plansContainer: document.getElementById("plansContainer"),
      confirmOverlay: document.getElementById("confirmOverlay"),
      confirmPlanLabel: document.getElementById("confirmPlanLabel"),
      confirmCancelBtn: document.getElementById("confirmCancelBtn"),
      confirmYesBtn: document.getElementById("confirmYesBtn"),
      loadingOverlay: document.getElementById("loadingOverlay"),
      loadingMessage: document.getElementById("loadingMessage"),
      progressFill: document.getElementById("progressFill"),
      successOverlay: document.getElementById("successOverlay"),
      continueBtn: document.getElementById("continueBtn"),
    };
  }

  function renderPlans() {
    if (!els.plansContainer) return;
    els.plansContainer.innerHTML = PLANS.map((plan) => `
      <button class="plan-card ${plan.variant}" data-plan-id="${plan.id}" type="button">
        <span class="plan-card__icon">${plan.icon === "birdIcon" ? BIRD_SVG : plan.icon}</span>
        <span class="plan-card__body">
          <span class="plan-card__name">${plan.name}</span>
          <p class="plan-card__desc">${plan.desc}</p>
        </span>
        <span class="plan-card__price">${plan.price}</span>
      </button>
    `).join("");

    els.plansContainer.querySelectorAll(".plan-card").forEach((card) => {
      card.addEventListener("click", () => {
        const plan = PLANS.find((p) => p.id === card.dataset.planId);
        if (plan) openConfirm(plan);
      });
    });
  }

  function showOverlay(el) {
    if (!el) return;
    el.hidden = false;
  }
  function hideOverlay(el) {
    if (!el) return;
    el.hidden = true;
  }

  function openPaywall() {
    showOverlay(els.premiumOverlay);
  }

  function closePaywall() {
    hideOverlay(els.premiumOverlay);
  }

  let activePlan = null;

  function openConfirm(plan) {
    activePlan = plan;
    els.confirmPlanLabel.textContent = `${plan.name} — ${plan.price}`;
    showOverlay(els.confirmOverlay);
  }

  function closeConfirm() {
    hideOverlay(els.confirmOverlay);
  }

  function startLoading() {
    closeConfirm();
    hideOverlay(els.premiumOverlay);
    showOverlay(els.loadingOverlay);

    els.progressFill.style.width = "0%";
    let progress = 0;
    let msgIndex = 0;
    els.loadingMessage.textContent = LOADING_MESSAGES[0];

    const totalDuration = 3200 + Math.random() * 1400; // 3.2s - 4.6s
    const tickInterval = 90;
    const totalTicks = totalDuration / tickInterval;
    let ticks = 0;

    loadingTimer = setInterval(() => {
      ticks += 1;
      progress = Math.min(100, (ticks / totalTicks) * 100);
      els.progressFill.style.width = `${progress}%`;
      if (ticks >= totalTicks) {
        clearInterval(loadingTimer);
        clearInterval(loadingMsgTimer);
        finishLoading();
      }
    }, tickInterval);

    loadingMsgTimer = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
      els.loadingMessage.style.opacity = "0";
      setTimeout(() => {
        els.loadingMessage.textContent = LOADING_MESSAGES[msgIndex];
        els.loadingMessage.style.opacity = "1";
      }, 150);
    }, 1000);
  }

  function finishLoading() {
    hideOverlay(els.loadingOverlay);
    showOverlay(els.successOverlay);
    if (window.Animations) {
      window.Animations.playSuccess();
      window.Animations.burstConfetti();
    }
  }

  function handleContinue() {
    hideOverlay(els.successOverlay);
    activePlan = null;
    if (typeof onPurchaseComplete === "function") onPurchaseComplete();
  }

  function bindEvents() {
    els.confirmCancelBtn.addEventListener("click", () => {
      closeConfirm();
      showOverlay(els.premiumOverlay);
    });
    els.confirmYesBtn.addEventListener("click", startLoading);
    els.continueBtn.addEventListener("click", handleContinue);
  }

  function init({ onComplete } = {}) {
    cacheEls();
    renderPlans();
    bindEvents();
    onPurchaseComplete = onComplete || null;
  }

  window.Payment = {
    init,
    openPaywall,
    closePaywall,
    PLANS,
  };
})();
