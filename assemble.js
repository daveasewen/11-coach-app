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

// Banner + polling Cowork detection (never shows in Cowork; shows in standalone after 2s)
const bannerJs = `
// Show API key banner only in standalone mode (no Cowork environment)
function showBannerIfNeeded() {
  if (localStorage.getItem('11plus:api-key')) return;
  var attempts = 0, maxAttempts = 20;
  function check() {
    if (window.cowork && typeof window.cowork.askClaude === 'function') return;
    if (++attempts < maxAttempts) { setTimeout(check, 100); return; }
    document.getElementById('api-key-banner').style.display = 'flex';
  }
  setTimeout(check, 100);
}
function saveApiKey() {
  var key = document.getElementById('api-key-input').value.trim();
  if (key) { localStorage.setItem('11plus:api-key', key); dismissBanner(); }
}
function dismissBanner() {
  document.getElementById('api-key-banner').style.display = 'none';
}
window.addEventListener('load', showBannerIfNeeded);
`;

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

<div id="api-key-banner" style="display:none;background:#1a1a2e;color:#fff;padding:10px 18px;font-family:sans-serif;font-size:13px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
  <span>🔑 Enter your Anthropic API key to enable AI coaching:</span>
  <input id="api-key-input" type="password" placeholder="sk-ant-..." style="flex:1;min-width:200px;padding:6px 10px;border-radius:6px;border:none;font-size:13px">
  <button onclick="saveApiKey()" style="background:#e85d26;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-weight:600">Save</button>
  <button onclick="dismissBanner()" style="background:transparent;color:rgba(255,255,255,0.5);border:none;cursor:pointer">✕</button>
</div>

<div id="root"></div>

<script>${storagePolyfill}</script>
<script>${bannerJs}</script>
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
console.log(`  Script tags:    ${(html.match(/<script/g) || []).length} (expected 6)`);
console.log(`  import{{:        ${(html.match(/import\{/g) || []).length} (expected 0)`);
console.log(`  createRoot:     ${(html.match(/createRoot/g) || []).length} (expected 2)`);
console.log("");
console.log("Next: update the Cowork artifact with the new 11plus-coach.html");
