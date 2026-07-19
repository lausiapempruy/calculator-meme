/* =========================================================
   app.js
   Boots the app: wires calculator UI to Calculator engine,
   hooks up the paywall, memes, toasts, and animations.

   v2.0 SMP Studios Edition: wires the achievements module
   to calculator events (first calc, wrong calc, divide-by-
   zero, 100 calcs) and to plan purchases (GOAT / Billionaire).

   v2.1 Gaming & Community Update:
   - wires the About/Credits dialog (with avatars)
   - rolls random events + easter eggs on every calculation
   - wires the new Miner / Builder / Gamer / Survivor /
     Champion / Multiverse achievements
   ========================================================= */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const displayExpression = document.getElementById("displayExpression");
    const displayResult = document.getElementById("displayResult");
    const usagePill = document.getElementById("usagePill");
    const statusDot = document.getElementById("statusDot");
    const keypad = document.getElementById("keypad");
    const keys = Array.from(keypad.querySelectorAll(".key"));

    /* ---------- Confetti canvas ---------- */
    if (window.Animations) {
      window.Animations.initConfetti("confettiCanvas");
    }

    /* ---------- Ripple on every key ---------- */
    keys.forEach((key) => {
      if (window.Animations) window.Animations.attachRipple(key);
    });

    /* ---------- Memes + Notifications ---------- */
    if (window.Memes) window.Memes.init("memeFooter");
    if (window.Notifications) window.Notifications.init("toastContainer");

    /* ---------- Render helpers ---------- */
    function render(snapshot) {
      displayResult.textContent = snapshot.display;
      displayExpression.textContent = snapshot.expression || "\u00A0";

      usagePill.textContent = `Usage: ${snapshot.usage} / ${snapshot.maxUsage}`;
      usagePill.classList.remove("is-low", "is-empty");
      if (snapshot.usage >= snapshot.maxUsage) {
        usagePill.classList.add("is-empty");
      } else if (snapshot.usage >= snapshot.maxUsage - 1) {
        usagePill.classList.add("is-low");
      }

      statusDot.classList.toggle("is-locked", snapshot.locked);
      keys.forEach((k) => { k.disabled = snapshot.locked; });

      displayResult.classList.remove("pulse");
      // force reflow so the animation can retrigger
      void displayResult.offsetWidth;
      displayResult.classList.add("pulse");
    }

    /* ---------- Calculator wiring ---------- */
    window.Calculator.on("change", render);

    window.Calculator.on("equals", (snapshot) => {
      if (window.Animations) window.Animations.playClick();

      // v2.1: every calculation has a shot at a random event or a
      // rare easter egg — text-only, calculator logic is untouched.
      if (window.Gaming) {
        window.Gaming.maybeTriggerRandomEvent();
        window.Gaming.checkEasterEggs();
      }
      if (window.Achievements && snapshot.totalEquals === 20) {
        window.Achievements.unlock("miner");
      }
    });

    window.Calculator.on("locked", () => {
      if (window.Notifications) {
        window.Notifications.show("🔒", "Free trial expired. Time to pay up (not really).", 3200);
      }
      setTimeout(() => window.Payment.openPaywall(), 350);
    });

    window.Calculator.on("unlocked", () => {
      if (window.Notifications) {
        window.Notifications.show("✅", "Calculator restored. Enjoy your 5 free calculations.", 3200);
      }
    });

    /* ---------- Achievement wiring ---------- */
    window.Calculator.on("first-equals", () => {
      if (window.Achievements) window.Achievements.unlock("first_goal");
    });
    window.Calculator.on("wrong-calc", () => {
      if (window.Achievements) window.Achievements.unlock("yellow_card");
    });
    window.Calculator.on("divide-by-zero", () => {
      if (window.Achievements) window.Achievements.unlock("red_card");
    });
    window.Calculator.on("hundred-equals", () => {
      if (window.Achievements) window.Achievements.unlock("fake_genius");
    });
    window.Calculator.on("ten-resets", () => {
      if (window.Achievements) window.Achievements.unlock("banana_collector");
    });
    // v2.1
    window.Calculator.on("five-resets", () => {
      if (window.Achievements) window.Achievements.unlock("builder");
    });
    window.Calculator.on("streak-five", () => {
      if (window.Achievements) window.Achievements.unlock("survivor");
    });
    if (window.Gaming) {
      window.Gaming.on("all-games-triggered", () => {
        if (window.Achievements) window.Achievements.unlock("gamer");
      });
    }

    keypad.addEventListener("click", (e) => {
      const btn = e.target.closest(".key");
      if (!btn || btn.disabled) return;

      const action = btn.dataset.action;
      const value = btn.dataset.value;

      if (window.Animations) window.Animations.playClick();

      switch (action) {
        case "number":
          window.Calculator.inputNumber(value);
          break;
        case "decimal":
          window.Calculator.inputDecimal();
          break;
        case "operator":
          window.Calculator.chooseOperator(value);
          break;
        case "equals":
          window.Calculator.equals();
          break;
        case "delete":
          window.Calculator.deleteLast();
          break;
        case "clear":
          window.Calculator.clearAll();
          break;
      }
    });

    /* ---------- Keyboard support ---------- */
    document.addEventListener("keydown", (e) => {
      if (window.Calculator.getSnapshot().locked) return;
      const key = e.key;
      if (/^[0-9]$/.test(key)) {
        window.Calculator.inputNumber(key);
      } else if (key === ".") {
        window.Calculator.inputDecimal();
      } else if (key === "+" || key === "-") {
        window.Calculator.chooseOperator(key);
      } else if (key === "*") {
        window.Calculator.chooseOperator("×");
      } else if (key === "/") {
        e.preventDefault();
        window.Calculator.chooseOperator("÷");
      } else if (key === "%") {
        window.Calculator.chooseOperator("%");
      } else if (key === "Enter" || key === "=") {
        window.Calculator.equals();
      } else if (key === "Backspace") {
        window.Calculator.deleteLast();
      } else if (key === "Escape") {
        window.Calculator.clearAll();
      }
    });

    /* ---------- Payment wiring ---------- */
    window.Payment.init({
      onComplete: (planId) => {
        window.Calculator.unlock();
        if (window.Achievements) {
          if (planId === "ultimate") {
            window.Achievements.unlock("goat");
            window.Achievements.unlock("champion");
          }
          if (planId === "universe") {
            window.Achievements.unlock("billionaire");
            window.Achievements.unlock("multiverse");
          }
        }
      },
    });

    /* ---------- About / Credits dialog (v2.1) ---------- */
    const aboutBtn = document.getElementById("aboutBtn");
    const aboutOverlay = document.getElementById("aboutOverlay");
    const aboutCloseBtn = document.getElementById("aboutCloseBtn");
    const aboutAvatars = document.getElementById("aboutAvatars");

    if (aboutBtn && aboutOverlay) {
      aboutBtn.addEventListener("click", () => {
        if (aboutAvatars && window.Avatars) {
          aboutAvatars.innerHTML = window.Avatars.renderDuo();
        }
        aboutOverlay.hidden = false;
      });
    }
    if (aboutCloseBtn && aboutOverlay) {
      aboutCloseBtn.addEventListener("click", () => {
        aboutOverlay.hidden = true;
      });
    }
    if (aboutOverlay) {
      aboutOverlay.addEventListener("click", (e) => {
        if (e.target === aboutOverlay) aboutOverlay.hidden = true;
      });
    }

    /* ---------- Initial paint ---------- */
    render(window.Calculator.getSnapshot());
  });
})();
