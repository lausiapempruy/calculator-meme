/* =========================================================
   app.js
   Boots the app: wires calculator UI to Calculator engine,
   hooks up the paywall, memes, toasts, and animations.
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

    window.Calculator.on("equals", () => {
      if (window.Animations) window.Animations.playClick();
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
      onComplete: () => {
        window.Calculator.unlock();
      },
    });

    /* ---------- Initial paint ---------- */
    render(window.Calculator.getSnapshot());
  });
})();
