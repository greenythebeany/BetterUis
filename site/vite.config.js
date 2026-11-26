import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The React landing page plus the privacy policy and terms of use - plain
// HTML, as the store listings link them and they must read without JS.
const manifest = JSON.parse(readFileSync(resolve(import.meta.dirname, '../manifest.json'), 'utf8'));

export default defineConfig({
  plugins: [
    react(),
    // the version also goes into the page's structured data (index.html)
    { name: 'app-version-html', transformIndexHtml: (html) => html.replaceAll('__APP_VERSION__', manifest.version) },
  ],
  // shown on the site as the current version
  define: { __APP_VERSION__: JSON.stringify(manifest.version) },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        terms: resolve(import.meta.dirname, 'terms.html'),
      },
    },
  },
});
