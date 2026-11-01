import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), {
    name: 'prune-generated-assets',
    // Remove obsolete hashed bundles, never vendor files or user assets.
    writeBundle(options, bundle) {
      const directory = resolve(options.dir!, 'web-assets');
      const current = new Set(Object.keys(bundle).map(path => resolve(options.dir!, path)));
      for (const file of readdirSync(directory, { withFileTypes: true })) {
        const path = resolve(directory, file.name);
        if (file.isFile() && !current.has(path)) unlinkSync(path);
      }
    },
  }],
  publicDir: false,
  build: {
    outDir: '../src/RealEFB/wwwroot',
    // Preserve the host's print pages, fonts, icons and vendored Leaflet.
    emptyOutDir: false,
    assetsDir: 'web-assets',
  },
  server: {
    proxy: Object.fromEntries(
      ['/api', '/vendor', '/js/flightlog-report.js', '/favicon.ico', '/manifest.webmanifest', '/assets', '/print'].map(
        path => [path, 'http://localhost:5150'],
      ),
    ),
  },
});
