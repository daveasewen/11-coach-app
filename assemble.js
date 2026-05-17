#!/usr/bin/env node
/**
 * 11+ Coach — assemble.js
 * Run from the project folder AFTER babel + terser: node assemble.js
 * Reads: react.js, reactdom.js, app-min.js  (all in project folder after build)
 * Writes: 11plus-coach.html  (clean, single-copy, self-contained)
 *
 * IMPORTANT: This script ALWAYS writes a fresh file. It never appends.
 * If 11plus-coach.html already exists it is overwritten completely.
 *
 * Also writes a versioned backup: 11plus-coach-<VERSION>.html
 */

const fs = require("fs");
const path = require("path");

const D = __dirname;

// Read build artefacts
function read(name) {
  const p = path.join(D, name);
  if (!fs.existsSync(p)) { console.error(`✗ Missing: ${name}`); process.exit(1); }
  return fs.readFileSync(p, "utf8");
}

const reactJs    = read("react.js");
const reactdomJs = read("reactdom.js");
let   appJs      = read("app-min.js");

// Fix ES module import → global React destructure
// babel compiled the JSX but left the import statement; replace it so
// the script runs as a plain <script> tag using the UMD-loaded React global.
appJs = appJs.replace(
  /^import\s*\{([^}]+)\}\s*from\s*["']react["'];/m,
  (_, names) => `const {${names}} = React;`
);

if (appJs.includes('import{') || appJs.includes('import {')) {
  console.warn("⚠ Residual import statements found — check app-min.js");
}

// Extract VERSION from app for the backup filename
const vMatch = appJs.match(/VERSION\s*=\s*["']([^"']+)["']/);
const version = vMatch ? vMatch[1] : "unknown";

// localStorage polyfill for window.storage
// The JSX uses window.storage.get/set (old Claude.ai artifact API).
// This polyfill ensures data always lands in localStorage regardless of environment,
// so progress survives artifact updates. Cowork's own window.storage (if present) is
// overridden — localStorage is the source of truth.
const storagePolyfill = `
window.storage = {
  get: function(key) {
    try { var v = localStorage.getItem(key); return v !== null ? { value: v } : null; } catch(e) { return null; }
  },
  set: function(key, value) {
    try { localStorage.setItem(key, value); } catch(e) {}
  }
};
`;

// v1.13: API key banner removed — key entry is now handled by AiKeyModal inside the React app.
// The banner was shown on load whenever no key was present, which conflicts with "AI off by default".
// Users enable AI via the AI pill → modal flow instead.

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>11+ Coach</title>
<style>:root { color-scheme: light; }</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700&family=DM+Sans:wght@400;500;600&display=swap">
<style>@font-face { font-family: 'DM Sans'; src: local('system-ui'); }</style>
</head>
<body style="margin:0;padding:0;background:#faf8f3">

<div id="root"></div>

<script>${storagePolyfill}</script>
<script>${reactJs}</script>
<script>${reactdomJs}</script>
<script>${appJs}</script>

</body>
</html>`;

// Write main output (always overwrites — never appends)
const outMain = path.join(D, "11plus-coach.html");
fs.writeFileSync(outMain, html, "utf8");

// Write versioned backup
const outVersioned = path.join(D, `11plus-coach-${version}.html`);
fs.writeFileSync(outVersioned, html, "utf8");

const kb = (html.length / 1024).toFixed(0);
console.log(`✓ 11plus-coach.html written — ${kb} KB (v${version})`);
console.log(`✓ Backup: 11plus-coach-${version}.html`);
console.log("");
console.log("Verification:");
console.log(`  Script tags:    ${(html.match(/<script/g) || []).length} (expected 5)`);
console.log(`  import{{:        ${(html.match(/import\{/g) || []).length} (expected 0)`);
console.log(`  createRoot:     ${(html.match(/createRoot/g) || []).length} (expected 1)`);
console.log("");
console.log("Next: update the Cowork artifact with the new 11plus-coach.html");
