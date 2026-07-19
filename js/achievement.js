/* =========================================================
   achievements.js
   Tracks funny in-session achievements and shows a gold
   toast via Notifications when one is unlocked.
   Exposes window.Achievements

   v2.1 Gaming & Community Update:
   - added Miner, Builder, Gamer, Survivor, Champion,
     Multiverse badges
   - unlock toasts occasionally include a one-line visitor
     avatar reaction (via window.Avatars)
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
    // --- v2.1 Gaming & Community Update ---
    miner: {
      icon: "⛏️",
      name: "Miner",
      desc: "Perform 20 calculations.",
    },
    builder: {
      icon: "🧱",
      name: "Builder",
      desc: "Reset calculator 5 times.",
    },
    gamer: {
      icon: "🎮",
      name: "Gamer",
      desc: "Trigger all gaming events.",
    },
    survivor: {
      icon: "🔥",
      name: "Survivor",
      desc: "Reach 5 calculations without mistakes.",
    },
    champion: {
      icon: "⚽",
      name: "Champion",
      desc: "Purchase Ultimate Pack.",
    },
    multiverse: {
      icon: "🌌",
      name: "Multiverse",
      desc: "Purchase Universe Pack.",
    },
  };

  const unlocked = new Set();

  function unlock(id) {
    const achievement = ACHIEVEMENTS[id];
    if (!achievement || unlocked.has(id)) return;
    unlocked.add(id);

    let text = `Achievement Unlocked: ${achievement.name} — ${achievement.desc}`;
    if (window.Avatars && Math.random() < 0.4) {
      text += ` "${window.Avatars.getRandomVisitorLine()}"`;
    }

    if (window.Notifications) {
      window.Notifications.show(achievement.icon, text, 4800, true);
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
