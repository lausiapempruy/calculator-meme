/* =========================================================
   achievements.js  (NEW in v2.0 — SMP Studios Edition)
   Tracks funny in-session achievements and shows a gold
   toast via Notifications when one is unlocked.
   Exposes window.Achievements
   ========================================================= */
(function () {
  "use strict";

  const ACHIEVEMENTS = {
    first_goal: {
      icon: "⚽",
      name: "First Goal",
      desc: "Complete your first calculation.",
    },
    yellow_card: {
      icon: "🟨",
      name: "Yellow Card",
      desc: "Calculate something wrong.",
    },
    red_card: {
      icon: "🟥",
      name: "Red Card",
      desc: "Try dividing by zero.",
    },
    goat: {
      icon: "🐐",
      name: "GOAT",
      desc: "Purchase Ultimate Pack.",
    },
    billionaire: {
      icon: "🚀",
      name: "Billionaire",
      desc: "Purchase Universe Pack.",
    },
    banana_collector: {
      icon: "🍌",
      name: "Banana Collector",
      desc: "Reset calculator 10 times.",
    },
    fake_genius: {
      icon: "🧠",
      name: "Fake Genius",
      desc: "Calculate 100 equations.",
    },
  };

  const unlocked = new Set();

  function unlock(id) {
    const achievement = ACHIEVEMENTS[id];
    if (!achievement || unlocked.has(id)) return;
    unlocked.add(id);

    if (window.Notifications) {
      window.Notifications.show(
        achievement.icon,
        `Achievement Unlocked: ${achievement.name} — ${achievement.desc}`,
        4600,
        true
      );
    }
  }

  function isUnlocked(id) {
    return unlocked.has(id);
  }

  function getUnlocked() {
    return Array.from(unlocked);
  }

  function getAll() {
    return ACHIEVEMENTS;
  }

  window.Achievements = { unlock, isUnlocked, getUnlocked, getAll };
})();
