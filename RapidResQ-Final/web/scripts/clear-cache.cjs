#!/usr/bin/env node
/** Clear CRA/Webpack babel cache — fixes ENOENT source-map-loader after dependency swaps (e.g. react-router-dom). */
const fs = require('fs');
const path = require('path');

const cwd = path.join(__dirname, '..');
const caches = [
  path.join(cwd, 'node_modules', '.cache'),
];

for (const dir of caches) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.warn('[clear-cache]', 'removed', dir);
    }
  } catch (e) {
    console.warn('[clear-cache]', 'skipped', dir, e.message);
  }
}
