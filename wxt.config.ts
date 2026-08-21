import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  webExt: {
    disabled: true, // 禁用 wxt 在容器内自动打开浏览器
  },

  manifest: ({ browser }) => ({
    name: 'ChronoZen - Smart Alarm Clock & Focus Timer',
    description: 'Lightweight alarm clock, countdown timer, and stopwatch with customizable sound notifications and snooze for daily productivity.',
    version: '1.0.1',
    // "offscreen" is Chromium-only; Firefox background pages can play audio directly.
    permissions: ['alarms', 'notifications', 'storage', ...(browser === 'firefox' ? [] : ['offscreen'])],
    action: {
      default_title: 'ChronoZen Alarm & Timer',
    },
    icons: {
      16: '/icon/16.png',
      32: '/icon/32.png',
      48: '/icon/48.png',
      128: '/icon/128.png',
    },
  }),
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
