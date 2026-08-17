# ChronoZen - Smart Alarm Clock & Focus Timer ⏰

> A modern, lightweight, and reliable browser extension alarm clock, focus countdown timer, and precision stopwatch built with **WXT Framework**, **Tailwind CSS v4**, **React 19**, and **Web Audio API**.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-emerald)
![WXT](https://img.shields.io/badge/WXT-v0.21-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-cyan)
![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-orange)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-green)

---

## 🌟 Key Features

1. **⏰ Smart Alarm Clock**
   - Manage multiple independent alarms with labels and quick tags (e.g., Morning Standup, Hydration, Market Open).
   - Flexible recurrence: Once, Daily, Weekdays (Mon–Fri), Weekends, or Custom Days.
   - Smart Snooze options: 3m, 5m, 10m, or 15m.
   - Dynamic Countdown: Live display of the exact time remaining until the next upcoming alarm.

2. **⏳ Circular Focus & Pomodoro Timer**
   - Animated SVG radial progress indicator.
   - Quick presets: 1m Quick, 5m Short Break, 15m Power Nap, 25m Pomodoro, 45m Deep Work, 60m Focus.
   - Custom hours, minutes, and seconds configuration.
   - On-the-fly time extensions: Add `+1 min` or `+5 min` with a single click while running.

3. **⏱️ Precision Stopwatch**
   - Millisecond-accuracy digital stopwatch.
   - Lap time recording with automated highlighting for **Fastest Lap (MIN)** and **Slowest Lap (MAX)**.

4. **🔔 Web Audio API Synthesizer**
   - 5 built-in synthesized alarm tones: **Zen Tibetan Bell**, **Gentle Chime**, **Classic Digital Beep**, **Radar Alert**, and **Marimba Melody**.
   - Built-in volume slider and instant sound preview.
   - Global sound mute toggle in header.

5. **🌙 Sleek Modern UI & Lightweight Architecture**
   - Designed with Tailwind CSS v4 using glassmorphism dark aesthetic.
   - Responsive popup layout tailored for Chrome / Edge / Firefox extensions (380px × 580px).

6. **🔒 100% Privacy & Store Rejection-Proof Compliance**
   - **Single Purpose Policy**: Strictly focused on timekeeping and alarms.
   - **Minimal Permissions**: Requests only `alarms`, `notifications`, and `storage`.
   - **Zero Tracking**: 100% offline and local. No personal data collected or transmitted.

---

## 🛠️ Tech Stack

- **Framework**: [WXT (Next-Gen Web Extension Framework)](https://wxt.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/) (`v11.22.0`)
- **UI Library**: React 19 + TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Icons**: Lucide React
- **Audio Engine**: Native Web Audio API Synthesizer (No external audio file dependencies, zero CORS or missing asset issues)
- **Background Worker**: Chrome Manifest V3 Background Service Worker + `chrome.alarms`

---

## 🚀 Getting Started & Build Commands (pnpm)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Local Development Server (with Hot Module Replacement)
```bash
pnpm run dev
```

### 3. Build for Production (Chrome MV3)
```bash
pnpm run build
```
The compiled extension output will be located in `.output/chrome-mv3/`.

### 4. Package Extension as a ZIP for Store Submission
```bash
pnpm run zip
```
Generates `.output/chronozen-alarm-timer-1.0.0-chrome.zip` ready for upload to the Chrome Web Store and Edge Add-ons dashboard.

---

## 📦 How to Load and Test in Chrome / Edge

1. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/`).
2. Toggle on **Developer mode** in the top right corner.
3. Click **Load unpacked**.
4. Select the `.output/chrome-mv3` directory from this project.
5. Pin ChronoZen to your toolbar and click the icon to start using it!

---

## 📄 Store Submission Metadata

For ready-to-copy store descriptions, SEO keywords, and review compliance checklists, refer to [STORE_LISTING.md](file:///home/daniel/agy-test/chronozen-alarm-timer/STORE_LISTING.md).
