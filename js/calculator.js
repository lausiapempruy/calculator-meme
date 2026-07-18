/* =========================================================
   calculator.js
   Core calculator engine: state, math, and usage limiter.
   Exposes window.Calculator

   v2.0 SMP Studios Edition:
   - tracks lifetime stats (total equals, reset count)
   - emits extra events for the achievement system:
     "first-equals", "wrong-calc", "divide-by-zero",
     "hundred-equals", "reset", "ten-resets"
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
    totalEquals: 0,
    resetCount: 0,
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
      case "%": result = b === 0 ? NaN : a % b; break;
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

    let isError = false;
    let isDivideByZero = false;

    if (state.operator !== null && state.previousValue !== null) {
      if (state.operator === "÷" && parseFloat(state.currentValue) === 0) {
        isDivideByZero = true;
      }
      const result = compute();
      if (isNaN(result)) isError = true;
      state.currentValue = isNaN(result) ? "Error" : String(result);
      state.previousValue = null;
      state.operator = null;
    }
    state.justEvaluated = true;
    state._awaitingNext = false;

    state.usage += 1;
    state.totalEquals += 1;

    emit("change", getSnapshot());
    emit("equals", { ...getSnapshot(), isError, isDivideByZero, totalEquals: state.totalEquals });

    if (state.totalEquals === 1) emit("first-equals", getSnapshot());
    if (isDivideByZero) {
      emit("divide-by-zero", getSnapshot());
    } else if (isError) {
      emit("wrong-calc", getSnapshot());
    }
    if (state.totalEquals === 100) emit("hundred-equals", getSnapshot());

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
    const hadContent = state.currentValue !== "0" || state.operator !== null || state.previousValue !== null;
    state.currentValue = "0";
    state.previousValue = null;
    state.operator = null;
    state.justEvaluated = false;
    state._awaitingNext = false;
    emit("change", getSnapshot());

    if (hadContent) {
      state.resetCount += 1;
      emit("reset", { count: state.resetCount });
      if (state.resetCount === 10) emit("ten-resets", getSnapshot());
    }
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
      totalEquals: state.totalEquals,
      resetCount: state.resetCount,
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
