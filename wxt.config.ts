import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'ChronoZen - Smart Alarm Clock & Focus Timer',
    description: 'Lightweight alarm clock, countdown timer, and stopwatch with customizable sound notifications and snooze for daily productivity.',
    version: '1.0.0',
    permissions: ['alarms', 'notifications', 'storage'],
    action: {
      default_title: 'ChronoZen Alarm & Timer',
    },
    icons: {
      16: '/icon/16.png',
      32: '/icon/32.png',
      48: '/icon/48.png',
      128: '/icon/128.png',
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
