# Calculator Pro Max Ultra Universe AI++ 🧠✨

A premium-looking, iOS-inspired calculator that is secretly a parody of predatory subscription models. It works perfectly... for 5 calculations. After that, it demands you purchase increasingly absurd "premium" plans using **100% fake money**.

> No real payments. No backend. No database. No authentication. No tracking. Everything runs entirely in your browser.

---

## ✨ Features

- **Real, working calculator** — addition, subtraction, multiplication, division, percentage, decimals, AC, DEL, and `=`.
- **iOS-inspired glassmorphism UI** — soft shadows, rounded corners, blurred glass panels, dark mode by default.
- **Usage limiter** — tracks `Usage: x / 5`. After 5 calculations, the calculator locks itself.
- **Fake Premium Paywall** — a beautifully designed modal offering three unmistakably fake plans:
  - 💸 **Pro Pack** — $20,000 — "Unlock basic mathematics."
  - 👑 **Ultimate Pack** — $50,000 — "Unlock premium numbers."
  - 🌌 **Universe Pack** — $1,000,000,000 — "Certified by Angry Birds." (an original parody bird icon, no copyrighted assets used)
- **Fake Payment Flow** — confirmation dialog → animated loading screen with rotating absurd status messages → progress bar → big green checkmark success screen → confetti.
- **Infinite loop of nonsense** — completing a "purchase" resets your usage to 0 so you can enjoy 5 more calculations before being asked to pay imaginary billions again.
- **Meme footer** — rotates a new joke every 5–8 seconds.
- **Fake toast notifications** — random unhelpful "updates" pop in from the corner.
- **Smooth animations everywhere** — button presses, modal fades, toast slides, loading spinners, confetti bursts.
- **Optional sound effects** — tiny click/success sounds generated with the Web Audio API (no external audio files required, nothing to download or break).
- **Fully responsive** — looks good on desktop and mobile.

---

## 🏆 v2.0 — "SMP Studios Edition"

A funny DLC-style update on top of v1.0, still iOS-minimal, still glassmorphism, still dark mode:

- **Football memes** woven into the footer and toast rotations (VAR checks, penalties, offside, GOAT references).
- **Messi & Ronaldo easter eggs** — playful, satirical, always positive toward both players.
- **Per-plan fake payment sequences** — Pro Pack, Ultimate Pack, and Universe Pack each have their own loading messages and success screen copy (`js/payment.js`).
- **Achievement system** (`js/achievements.js`, new file) — 7 funny badges (First Goal, Yellow Card, Red Card, GOAT, Billionaire, Banana Collector, Fake Genius) that pop in as a gold toast when unlocked.
- **SMP Studios branding** — a small, quiet "Made by SMP Studios" badge in the bottom corner, plus a subtle ⚽ 🍌 🏆 mascot row under the title. Nothing intrusive, nothing copyrighted.

---

## 🚀 How to run

No build tools, no npm install, no server required.

1. Download / clone this folder.
2. Double-click `index.html`, or open it in any modern browser (Chrome, Safari, Edge, Firefox).
3. Start "calculating." Try to beat the system. You can't. That's the joke.

Optional: serve it locally for a nicer dev experience:

```bash
cd calculator-premium
python3 -m http.server 8080
# then open http://localhost:8080
```

---

## 📁 Folder explanation

```
calculator-premium/
│
├── index.html              # Main page markup — calculator, modal, toast container
├── css/
│   └── style.css           # All styling: layout, glassmorphism, animations, responsiveness
│
├── js/
│   ├── calculator.js       # Core calculator engine (state machine + math operations)
│   ├── payment.js          # Fake subscription modal + fake payment flow logic
│   ├── memes.js            # Rotating footer joke text
│   ├── notifications.js    # Random toast notification system
│   ├── achievements.js     # v2.0 — funny badge/achievement system
│   ├── animations.js       # Confetti, button ripple, and misc animation helpers
│   └── app.js               # Wires every module together and boots the app
│
├── assets/
│   ├── icons/              # Reserved for custom icon assets (currently uses inline SVG)
│   ├── sounds/              # Reserved for audio files (currently uses generated Web Audio beeps)
│   └── images/              # Reserved for any future image assets
│
└── README.md
```

Everything is vanilla HTML/CSS/JS — no frameworks, no bundlers, no dependencies.

---

## 🎨 Customization

- **Usage limit**: change `MAX_USAGE` in `js/calculator.js`.
- **Plan prices/copy**: edit the `PLANS` array in `js/payment.js`.
- **Loading messages**: edit `LOADING_MESSAGES` in `js/payment.js`.
- **Meme footer lines**: edit the `MEMES` array in `js/memes.js`.
- **Toast messages**: edit the `TOASTS` array in `js/notifications.js`.
- **Colors / theme**: all design tokens are CSS custom properties at the top of `css/style.css` under `:root`.
- **Sounds**: toggle by editing `SOUND_ENABLED` in `js/animations.js`, or drop real audio files into `assets/sounds/` and update the play calls.

---

## 📜 License

This is a parody/meme project provided for fun and educational purposes. Do whatever you want with it — remix it, ship it, prank your friends. No warranty, express or implied. Not affiliated with Apple, Angry Birds/Rovio, NASA, or any bank. All "prices" are fictional and no payment is ever processed.
