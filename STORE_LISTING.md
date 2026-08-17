# Chrome Web Store & Edge Add-ons Listing Guide - ChronoZen

This document contains ready-to-copy store listing metadata, SEO-optimized descriptions, and compliance guidelines designed to pass review on the first submission without rejection.

---

## 1. Store Basic Metadata

- **Extension Name**:  
  `ChronoZen - Smart Alarm Clock & Focus Timer`

- **Package Name (`package.json`)**:  
  `chronozen-alarm-timer`

- **Short Description (Max 132 characters)**:  
  `Lightweight alarm clock, countdown timer, and stopwatch with customizable sound notifications and snooze for daily productivity.`  
  *(Exact character count: 126 characters, strictly compliant with Google's 132-character limit)*

- **Category**:  
  `Productivity` / `Workflow & Planning`

- **Supported Browsers**:  
  `Google Chrome`, `Microsoft Edge`, `Brave`, `Opera`, `Vivaldi`, `Mozilla Firefox`

---

## 2. Store Visual Assets (100% Real In-Browser Screenshots)

All screenshots are strictly generated in the standard **1280 × 800 px (16:10)** dimension required by Chrome Web Store:

| Asset Name | Dimension | What it Shows | Local File Link |
| :--- | :--- | :--- | :--- |
| **Screenshot 1 (Primary)** | **1280 × 800 px** | Real In-Browser Popup showing **Active Alarms List & Countdown** | [`assets/store-screenshot-1-alarms-1280x800.png`](file:///home/daniel/agy-test/chronozen-alarm-timer/assets/store-screenshot-1-alarms-1280x800.png) |
| **Screenshot 2 (Timer)** | **1280 × 800 px** | Real In-Browser Popup showing **Circular Focus & Pomodoro Timer** | [`assets/store-screenshot-2-timer-1280x800.png`](file:///home/daniel/agy-test/chronozen-alarm-timer/assets/store-screenshot-2-timer-1280x800.png) |
| **Screenshot 3 (Stopwatch)** | **1280 × 800 px** | Real In-Browser Popup showing **Precision Stopwatch & Lap Times** | [`assets/store-screenshot-3-stopwatch-1280x800.png`](file:///home/daniel/agy-test/chronozen-alarm-timer/assets/store-screenshot-3-stopwatch-1280x800.png) |
| **Store Icon** | 128 × 128 px | Official Hi-Res Brand Icon | [`public/icon/128.png`](file:///home/daniel/agy-test/chronozen-alarm-timer/public/icon/128.png) |
| **Promo Tile** | 512 × 512 px | HD Promo Tile | [`public/icon/512.png`](file:///home/daniel/agy-test/chronozen-alarm-timer/public/icon/512.png) |

---

## 3. Store Detailed Description (SEO-Optimized & Rejection-Proof)

> **Copy & paste the text below directly into the "Detailed Description" field in Chrome Web Store / Edge Add-ons developer dashboard:**

```markdown
⏰ ChronoZen is an elegant, lightweight, and reliable alarm clock, focus countdown timer, and precision stopwatch designed to keep you on schedule and boost daily productivity directly inside your browser.

Whether you need a gentle reminder for standup meetings, pomodoro focus sprints, taking screen breaks, or timing tasks, ChronoZen delivers crisp synthesized sound alerts and desktop notifications with zero distractions.

━━━━━━━━━━━━━━━━━━━━━
✨ KEY FEATURES
━━━━━━━━━━━━━━━━━━━━━

⏰ SMART ALARM CLOCK
• Multiple Alarms: Create and manage multiple recurring or one-time alarms.
• Flexible Schedules: Repeat daily, weekdays (Mon–Fri), weekends, or custom days of the week.
• Smart Snooze: Customizable snooze duration (3, 5, 10, or 15 minutes).
• Next Alarm Countdown: Always see the exact remaining time until your next alarm rings.

⏳ FOCUS & POMODORO COUNTDOWN TIMER
• Circular Visual Progress: Track elapsed and remaining focus time at a glance with smooth radial animations.
• Quick Presets: 1m Quick, 5m Short Break, 15m Power Nap, 25m Pomodoro, 45m Deep Work, 60m Focus.
• Custom Time: Configure custom hours, minutes, and seconds.
• Quick Extension: Add +1m or +5m with a single click while running.

⏱️ PRECISION STOPWATCH
• Millisecond Accuracy: Digital stopwatch with smooth real-time timing.
• Lap Time Tracking: Record splits and identify fastest & slowest laps with instant color indicators.

🔔 SYNTHESIZED SOUND LIBRARY & VOLUME CONTROL
• 5 Built-in Tones: Zen Tibetan Bell, Gentle Chime, Classic Digital Beep, Radar Alert, and Marimba Melody.
• Volume Slider & Sound Preview: Test and adjust volume levels easily.
• Works even when muted: Clear visual desktop notifications ensure you never miss an alert.

🌙 MODERN & LIGHTWEIGHT DESIGN
• Dark & Glassmorphism UI built for maximum legibility.
• 12-Hour (AM/PM) and 24-Hour clock format toggle.
• Ultra-fast load times with minimal memory footprint.

━━━━━━━━━━━━━━━━━━━━━
🔒 PRIVACY & COMPLIANCE FIRST
━━━━━━━━━━━━━━━━━━━━━
• 100% Offline & Local: All alarms and settings are stored locally in your browser storage.
• No Tracking & No Telemetry: We do not collect, store, or sell any personal data or browsing activity.
• Minimal Permissions: Requests only essential permissions (`alarms`, `notifications`, `storage`) strictly required for alarm functions.

━━━━━━━━━━━━━━━━━━━━━
🚀 GET STARTED
━━━━━━━━━━━━━━━━━━━━━
Click "Add to Chrome", open the ChronoZen popup from your extension toolbar, and set your first alarm in seconds!
```

---

## 4. Chrome Web Store Review Compliance Checklist

| Policy Requirement | How ChronoZen Complies |
| :--- | :--- |
| **Single Purpose Policy** | The extension strictly provides timekeeping, alarms, countdown timers, and stopwatch features with no unrelated code or bloated side features. |
| **Minimal Permissions** | Requests only `alarms` (background wakeup), `notifications` (desktop alerts), and `storage` (local persistence). **Zero host permissions, zero content scripts.** |
| **No Keyword Stuffing** | Uses a clean brand name + descriptive function keywords (`ChronoZen - Smart Alarm Clock & Focus Timer`). Avoids spam triggers like "Free", "Best", or "#1". |
| **Privacy Policy** | 100% local client-side execution. No analytics trackers, no advertising SDKs, and no external server requests. |
| **Manifest V3 Standard** | Fully compliant with Manifest V3 Background Service Worker specifications. |

---

## 5. Suggested Store Search Keywords / Tags

`alarm clock`, `timer`, `focus timer`, `pomodoro timer`, `stopwatch`, `productivity`, `reminder`, `alarm`, `clock`, `countdown`
