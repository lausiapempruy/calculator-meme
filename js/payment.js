/* =========================================================
   payment.js
   Fake subscription modal + fake payment flow.
   Exposes window.Payment

   v2.0 SMP Studios Edition:
   - each plan now has its own loading message sequence
   - each plan now has its own success title/description
   - purchase completion reports which plan id was bought,
     so app.js can unlock plan-specific achievements

   v2.1 Gaming & Community Update:
   - blended gaming/event loading lines into each plan
   - success screen now shows the two SMP Studios avatars
     with a random speech-bubble reaction each time
   - a "TERIMA KASIH" thank-you sticker pops in after every
     successful fake payment
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

  // Distinct fake loading sequences per plan.
  // v2.1: each plan folds in a few gaming/football/NASA lines from the
  // "mix everything together" update, on top of its own v2.0 flavor.
  const LOADING_MESSAGES = {
    pro: [
      "Connecting to Calculator Server...",
      "Borrowing money from your friend...",
      "Counting coins...",
      "Finding discount coupon...",
      "Talking to NASA...",
      "Crafting Premium Calculator...",
      "Almost there...",
      "Payment accepted!",
    ],
    ultimate: [
      "Negotiating with FIFA...",
      "Asking Messi for approval...",
      "VAR is reviewing your payment...",
      "Ronaldo shouted SIUUUU...",
      "Joining Roblox server...",
      "Safe Zone shrinking...",
      "Bank says \"bro really?\"",
      "Unlocking Premium Numbers...",
      "Installing Extra Intelligence...",
      "Payment approved.",
    ],
    universe: [
      "Launching calculator into space...",
      "Calling NASA...",
      "Summoning football gods...",
      "Messi and Ronaldo are discussing your purchase...",
      "Finding Banana Galaxy...",
      "Mining Bananas...",
      "Searching for Universe Pack license...",
      "Generating Infinite IQ...",
      "Installing Quantum Mathematics...",
      "Loading Football DLC...",
      "Finding Diamonds...",
      "Downloading Football DLC...",
      "Talking to aliens...",
      "Negotiating with Angry Birds...",
      "Booyah!!",
      "Unlocking Calculator Multiverse...",
      "Teleporting to Universe...",
      "Removing Skill Issue...",
    ],
  };

  // Distinct success screen copy per plan.
  const SUCCESS_CONTENT = {
    pro: {
      title: "Payment Successful!",
      desc: "Congratulations! You unlocked Basic Mathematics.",
      achievement: null,
    },
    ultimate: {
      title: "Payment Approved!",
      desc: "You can now calculate like a champion. 🐐",
      achievement: null,
    },
    universe: {
      title: "Congratulations!",
      desc: "You have officially wasted absolutely fake money.",
      achievement: "🚀 Achievement Unlocked: Professional Fake Billionaire",
    },
  };

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
  let activePlan = null;

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
      successTitle: document.getElementById("successTitle"),
      successDesc: document.getElementById("successDesc"),
      successAvatars: document.getElementById("successAvatars"),
      successAchievement: document.getElementById("successAchievement"),
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

    const messages = LOADING_MESSAGES[activePlan.id] || LOADING_MESSAGES.pro;

    els.progressFill.style.width = "0%";
    let progress = 0;
    let msgIndex = 0;
    els.loadingMessage.textContent = messages[0];

    // longer plans (more messages) get a bit more time so every line gets seen
    const totalDuration = Math.max(3200, messages.length * 750) + Math.random() * 900;
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
      msgIndex = (msgIndex + 1) % messages.length;
      els.loadingMessage.style.opacity = "0";
      setTimeout(() => {
        els.loadingMessage.textContent = messages[msgIndex];
        els.loadingMessage.style.opacity = "1";
      }, 150);
    }, 900);
  }

  function finishLoading() {
    hideOverlay(els.loadingOverlay);

    const content = SUCCESS_CONTENT[activePlan.id] || SUCCESS_CONTENT.pro;
    els.successTitle.textContent = content.title;
    els.successDesc.textContent = content.desc;
    if (content.achievement) {
      els.successAchievement.textContent = content.achievement;
      els.successAchievement.hidden = false;
    } else {
      els.successAchievement.hidden = true;
      els.successAchievement.textContent = "";
    }

    if (els.successAvatars) {
      els.successAvatars.innerHTML = window.Avatars ? window.Avatars.renderDuo() : "";
    }

    showOverlay(els.successOverlay);
    if (window.Animations) {
      window.Animations.playSuccess();
      window.Animations.burstConfetti();
    }
    if (window.ThanksSticker) {
      window.ThanksSticker.show();
    }
  }

  function handleContinue() {
    hideOverlay(els.successOverlay);
    const purchasedId = activePlan ? activePlan.id : null;
    activePlan = null;
    if (typeof onPurchaseComplete === "function") onPurchaseComplete(purchasedId);
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
