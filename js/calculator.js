/* =========================================================
   calculator.js
   Core calculator engine: state, math, and usage limiter.
   Exposes window.Calculator
   ========================================================= */
(function () {
  "use strict";

  const MAX_USAGE = 5;

  const state = {
    currentValue: "0",
    previousValue: null,
    operator: null,
    justEvaluated: false,
    usage: 0,
    locked: false,
  };

  const listeners = {
    change: [],
    locked: [],
    unlocked: [],
    equals: [],
  };

  function emit(event, payload) {
    (listeners[event] || []).forEach((fn) => {
      try { fn(payload); } catch (err) { console.error(err); }
    });
  }

  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  }

  function formatNumber(numStr) {
    if (numStr === "Error") return "Error";
    const [intPart, decPart] = numStr.split(".");
    const negative = intPart.startsWith("-");
    const digits = negative ? intPart.slice(1) : intPart;
    const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    let result = (negative ? "-" : "") + withCommas;
    if (decPart !== undefined) result += "." + decPart;
    return result;
  }

  function inputNumber(digit) {
    if (state.locked) return;
    if (state.justEvaluated) {
      state.currentValue = digit === "." ? "0." : digit;
      state.justEvaluated = false;
    } else if (state.currentValue === "0" && digit !== ".") {
      state.currentValue = digit;
    } else {
      // limit length to keep display sane
      if (state.currentValue.replace("-", "").replace(".", "").length >= 15) return;
      state.currentValue += digit;
    }
    emit("change", getSnapshot());
  }

  function inputDecimal() {
    if (state.locked) return;
    if (state.justEvaluated) {
      state.currentValue = "0.";
      state.justEvaluated = false;
      emit("change", getSnapshot());
      return;
    }
    if (!state.currentValue.includes(".")) {
      state.currentValue += ".";
      emit("change", getSnapshot());
    }
  }

  function chooseOperator(op) {
    if (state.locked) return;
    if (state.operator && !state.justEvaluated && state.previousValue !== null) {
      // chain operations: evaluate first
      const result = compute();
      state.previousValue = result;
      state.currentValue = String(result);
    } else {
      state.previousValue = parseFloat(state.currentValue);
    }
    state.operator = op;
    state.justEvaluated = false;
    // ready for next number to overwrite the display
    state.currentValue = state.previousValue !== null ? String(state.previousValue) : state.currentValue;
    state._awaitingNext = true;
    emit("change", getSnapshot());
  }

  function compute() {
    const a = state.previousValue;
    const b = parseFloat(state.currentValue);
    if (a === null || isNaN(a) || isNaN(b)) return b;
    let result;
    switch (state.operator) {
      case "+": result = a + b; break;
      case "-": result = a - b; break;
      case "×": result = a * b; break;
      case "÷": result = b === 0 ? NaN : a / b; break;
      case "%": result = a % b; break;
      default: result = b;
    }
    if (!isFinite(result)) return NaN;
    // round to avoid float precision noise
    return Math.round((result + Number.EPSILON) * 1e10) / 1e10;
  }

  function equals() {
    if (state.locked) return;
    if (state.usage >= MAX_USAGE) {
      lock();
      return;
    }

    if (state.operator !== null && state.previousValue !== null) {
      const result = compute();
      state.currentValue = isNaN(result) ? "Error" : String(result);
      state.previousValue = null;
      state.operator = null;
    }
    state.justEvaluated = true;
    state._awaitingNext = false;

    state.usage += 1;
    emit("change", getSnapshot());
    emit("equals", getSnapshot());

    if (state.usage >= MAX_USAGE) {
      lock();
    }
  }

  function toggleSign() {
    if (state.locked) return;
    if (state.currentValue === "0") return;
    state.currentValue = state.currentValue.startsWith("-")
      ? state.currentValue.slice(1)
      : "-" + state.currentValue;
    emit("change", getSnapshot());
  }

  function deleteLast() {
    if (state.locked) return;
    if (state.justEvaluated) {
      clearAll();
      return;
    }
    if (state.currentValue.length <= 1 || (state.currentValue.length === 2 && state.currentValue.startsWith("-"))) {
      state.currentValue = "0";
    } else {
      state.currentValue = state.currentValue.slice(0, -1);
    }
    emit("change", getSnapshot());
  }

  function clearAll() {
    if (state.locked) return;
    state.currentValue = "0";
    state.previousValue = null;
    state.operator = null;
    state.justEvaluated = false;
    state._awaitingNext = false;
    emit("change", getSnapshot());
  }

  function lock() {
    state.locked = true;
    emit("locked", getSnapshot());
  }

  function unlock() {
    state.locked = false;
    state.usage = 0;
    clearAll();
    emit("unlocked", getSnapshot());
    emit("change", getSnapshot());
  }

  function getExpressionString() {
    if (state.operator && state.previousValue !== null) {
      return `${formatNumber(String(state.previousValue))} ${state.operator}`;
    }
    return "";
  }

  function getSnapshot() {
    return {
      display: formatNumber(state.currentValue),
      expression: getExpressionString(),
      usage: state.usage,
      maxUsage: MAX_USAGE,
      locked: state.locked,
    };
  }

  window.Calculator = {
    MAX_USAGE,
    on,
    inputNumber,
    inputDecimal,
    chooseOperator,
    equals,
    deleteLast,
    clearAll,
    toggleSign,
    lock,
    unlock,
    getSnapshot,
  };
})();
