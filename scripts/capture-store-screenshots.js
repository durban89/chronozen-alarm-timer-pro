import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const PORT = 45678;
const CHROME_PATH = '/usr/bin/google-chrome';
const BUILD_DIR = path.resolve('./.output/chrome-mv3');
const ASSETS_DIR = path.resolve('./assets');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Simple static HTTP server to serve the compiled extension and stage page
function createServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
  };

  return http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];

    if (reqUrl === '/stage') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getStageHtml());
      return;
    }

    let filePath = path.join(BUILD_DIR, reqUrl === '/' ? 'popup.html' : reqUrl);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

function getStageHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Chrome Browser - ChronoZen In-Use Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1280px;
      height: 800px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #090d16;
      display: flex;
      flex-direction: column;
      user-select: none;
    }

    /* Chrome Title & Tab Bar */
    .browser-header {
      background: #1e222d;
      border-bottom: 1px solid #2d3343;
      display: flex;
      flex-direction: column;
      z-index: 10;
    }

    .title-bar {
      height: 38px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 12px;
    }

    .window-controls {
      display: flex;
      gap: 7px;
      margin-right: 8px;
    }
    .win-dot { width: 11px; height: 11px; rounded-full; border-radius: 50%; }
    .dot-red { background: #ff5f56; }
    .dot-yellow { background: #ffbd2e; }
    .dot-green { background: #27c93f; }

    .tab-bar {
      display: flex;
      align-items: flex-end;
      flex: 1;
      height: 100%;
    }

    .tab {
      background: #11141c;
      color: #e2e8f0;
      font-size: 11.5px;
      font-weight: 500;
      padding: 8px 14px;
      border-radius: 8px 8px 0 0;
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 210px;
      border-top: 1px solid #2d3343;
      border-left: 1px solid #2d3343;
      border-right: 1px solid #2d3343;
    }

    .tab-favicon {
      width: 14px;
      height: 14px;
      border-radius: 2px;
    }

    .tab-close {
      color: #64748b;
      font-size: 13px;
      margin-left: auto;
    }

    .tab-inactive {
      background: transparent;
      color: #94a3b8;
      border: none;
      font-size: 11.5px;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Chrome Navigation / Omnibox Bar */
    .nav-bar {
      background: #11141c;
      height: 44px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 10px;
      border-bottom: 1px solid #232936;
    }

    .nav-btns {
      display: flex;
      gap: 12px;
      color: #64748b;
      font-size: 14px;
    }

    .omnibox {
      flex: 1;
      background: #1e222d;
      height: 28px;
      border-radius: 14px;
      border: 1px solid #2d3343;
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 8px;
      font-size: 11.5px;
      color: #cbd5e1;
      max-width: 720px;
    }

    .lock-icon { color: #10b981; font-size: 10px; }

    .extensions-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
      position: relative;
    }

    .ext-icon-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      cursor: pointer;
      position: relative;
    }

    .ext-icon-btn.active {
      background: #2d3343;
      box-shadow: 0 0 0 1px #10b981;
    }

    .ext-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: #10b981;
      color: #022c22;
      font-size: 8px;
      font-weight: 800;
      padding: 0 3px;
      border-radius: 4px;
    }

    /* Webpage Content Workspace Backdrop */
    .browser-viewport {
      flex: 1;
      position: relative;
      background: radial-gradient(circle at 30% 30%, #172033 0%, #0b0f19 100%);
      display: flex;
      padding: 40px 60px;
    }

    /* Mock Productivity Dashboard / Webpage in Background */
    .mock-webpage {
      flex: 1;
      background: rgba(18, 24, 38, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
      padding: 32px 40px;
      backdrop-filter: blur(12px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      gap: 20px;
      filter: blur(1px) brightness(0.85);
    }

    .mock-hero-title {
      font-size: 26px;
      font-weight: 700;
      color: #f1f5f9;
      letter-spacing: -0.5px;
    }

    .mock-subtext {
      color: #94a3b8;
      font-size: 13px;
      max-width: 480px;
      line-height: 1.6;
    }

    .mock-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 10px;
      max-width: 580px;
    }

    .mock-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 16px;
    }

    .mock-card-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .mock-card-val { font-size: 20px; font-weight: 700; color: #38bdf8; margin-top: 4px; }

    /* The Real ChronoZen Extension Popup Container */
    .popup-wrapper {
      position: absolute;
      top: 10px;
      right: 28px;
      width: 380px;
      height: 580px;
      border-radius: 20px;
      box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.8),
                  0 0 35px rgba(16, 185, 129, 0.25),
                  0 0 0 1px rgba(16, 185, 129, 0.35);
      overflow: hidden;
      background: #020617;
      z-index: 99;
      animation: dropDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Small connector caret pointing to ChronoZen toolbar button */
    .popup-caret {
      position: absolute;
      top: 2px;
      right: 76px;
      width: 14px;
      height: 14px;
      background: #0f172a;
      border-top: 1px solid rgba(16, 185, 129, 0.4);
      border-left: 1px solid rgba(16, 185, 129, 0.4);
      transform: rotate(45deg);
      z-index: 100;
    }

    iframe {
      width: 380px;
      height: 580px;
      border: none;
      display: block;
    }
  </style>
</head>
<body>
  <!-- Browser Header & Omnibox -->
  <div class="browser-header">
    <div class="title-bar">
      <div class="window-controls">
        <div class="win-dot dot-red"></div>
        <div class="win-dot dot-yellow"></div>
        <div class="win-dot dot-green"></div>
      </div>
      <div class="tab-bar">
        <div class="tab">
          <img src="/icon/32.png" class="tab-favicon" alt="ChronoZen" />
          <span>Productivity Workspace</span>
          <span class="tab-close">×</span>
        </div>
        <div class="tab-inactive">
          <span>GitHub - Repository</span>
        </div>
      </div>
    </div>

    <div class="nav-bar">
      <div class="nav-btns">
        <span>←</span>
        <span>→</span>
        <span>↻</span>
      </div>
      <div class="omnibox">
        <span class="lock-icon">🔒</span>
        <span>https://workspace.google.com/dashboard</span>
      </div>
      <div class="extensions-bar">
        <div class="ext-icon-btn active" id="chronozen-btn">
          <img src="/icon/32.png" width="18" height="18" alt="ChronoZen" />
          <span class="ext-badge">2</span>
        </div>
        <div class="ext-icon-btn">
          <span style="color: #64748b; font-size: 13px;">🧩</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Browser Main Viewport with Backdrop & Floating Active Extension -->
  <div class="browser-viewport">
    <!-- Mock Workspace Backdrop -->
    <div class="mock-webpage">
      <div>
        <div style="font-size: 12px; color: #10b981; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">Daily Focus & Workflow</div>
        <h1 class="mock-hero-title">Engineering Sprint & Task Flow</h1>
        <p class="mock-subtext">Manage morning standups, pomodoro sessions, and precision execution seamlessly with ChronoZen in your browser.</p>
      </div>

      <div class="mock-cards-grid">
        <div class="mock-card">
          <div class="mock-card-label">Focus Time Today</div>
          <div class="mock-card-val" style="color: #10b981;">3h 45m</div>
        </div>
        <div class="mock-card">
          <div class="mock-card-label">Pomodoro Cycles</div>
          <div class="mock-card-val" style="color: #38bdf8;">6 / 8</div>
        </div>
        <div class="mock-card">
          <div class="mock-card-label">Alarms Active</div>
          <div class="mock-card-val" style="color: #f59e0b;">2 Set</div>
        </div>
      </div>
    </div>

    <!-- Triangle Caret -->
    <div class="popup-caret"></div>

    <!-- The 100% Real Live Popup Window -->
    <div class="popup-wrapper">
      <iframe id="extension-frame" src="/popup.html"></iframe>
    </div>
  </div>
</body>
</html>
  `;
}

async function captureScreenshots() {
  console.log('Starting local HTTP server...');
  const server = createServer();

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Server running at http://localhost:${PORT}`);

  console.log('Launching Headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1280,800',
      '--hide-scrollbars',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

  console.log('Navigating to in-browser preview stage...');
  await page.goto(`http://localhost:${PORT}/stage`, { waitUntil: 'networkidle0' });

  // Wait for the iframe to load and render React
  await page.waitForSelector('iframe');
  const frameElement = await page.$('iframe');
  const frame = await frameElement.contentFrame();

  // Wait for React to render inside the iframe
  await frame.waitForSelector('header');
  await new Promise((r) => setTimeout(r, 1200));

  // --- SCREENSHOT 1: Alarms Tab ---
  console.log('Capturing Screenshot 1 (Alarms Tab)...');
  const buffer1 = await page.screenshot({ type: 'png' });
  const path1 = path.join(ASSETS_DIR, 'store-screenshot-1-alarms-1280x800.png');
  await sharp(buffer1).resize(1280, 800).png().toFile(path1);
  console.log(`✓ Saved: ${path1}`);

  // Also set as the main default screenshot
  const mainPath = path.join(ASSETS_DIR, 'store-screenshot-1280x800.png');
  await sharp(buffer1).resize(1280, 800).png().toFile(mainPath);
  console.log(`✓ Saved Main: ${mainPath}`);

  // --- SCREENSHOT 2: Focus Timer Tab ---
  console.log('Switching to Timer Tab...');
  const timerTabBtn = (await frame.$$('nav button'))[1];
  if (timerTabBtn) {
    await timerTabBtn.click();
    await new Promise((r) => setTimeout(r, 800));

    console.log('Capturing Screenshot 2 (Focus Timer Tab)...');
    const buffer2 = await page.screenshot({ type: 'png' });
    const path2 = path.join(ASSETS_DIR, 'store-screenshot-2-timer-1280x800.png');
    await sharp(buffer2).resize(1280, 800).png().toFile(path2);
    console.log(`✓ Saved: ${path2}`);
  }

  // --- SCREENSHOT 3: Stopwatch Tab ---
  console.log('Switching to Stopwatch Tab...');
  const stopwatchTabBtn = (await frame.$$('nav button'))[2];
  if (stopwatchTabBtn) {
    await stopwatchTabBtn.click();
    await new Promise((r) => setTimeout(r, 800));

    console.log('Capturing Screenshot 3 (Stopwatch Tab)...');
    const buffer3 = await page.screenshot({ type: 'png' });
    const path3 = path.join(ASSETS_DIR, 'store-screenshot-3-stopwatch-1280x800.png');
    await sharp(buffer3).resize(1280, 800).png().toFile(path3);
    console.log(`✓ Saved: ${path3}`);
  }

  await browser.close();
  server.close();
  console.log('🎉 All in-browser store screenshots captured successfully!');
}

captureScreenshots().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
