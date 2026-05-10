#!/usr/bin/env node
/**
 * 11+ Coach — build.js
 * Run from the project folder: node build.js
 * Outputs: app-modified.jsx (ready for babel)
 *
 * What this does:
 *  1. Reads 11plus-coaching-app.jsx
 *  2. Replaces the callAI stub with the real Cowork/API implementation
 *  3. Injects ROOT_TIPS data (from root-tips.js if present, else empty stub)
 *  4. Injects FILL_BLANK_EXAMPLES data (from fill-blank-examples.js if present, else empty stub)
 *  5. Writes app-modified.jsx
 *
 * NEVER edit app-modified.jsx directly — it is a build artefact.
 * Edit 11plus-coaching-app.jsx, then rebuild.
 */

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "11plus-coaching-app.jsx");
const OUT = path.join(__dirname, "app-modified.jsx");
const ROOT_TIPS_FILE = path.join(__dirname, "root-tips.js");
const FILL_BLANK_FILE = path.join(__dirname, "fill-blank-examples.js");

let src = fs.readFileSync(SRC, "utf8");

// ─── 1. callAI replacement ────────────────────────────────────────────────────
// The JSX has a stub function. We replace it with the real implementation that:
//   a) Uses window.cowork.askClaude in Cowork artifact mode (no key needed)
//   b) Falls back to direct Anthropic API with key from localStorage

const CALL_AI_STUB = /\/\/ CALL_AI_STUB_START[\s\S]*?\/\/ CALL_AI_STUB_END/;
const CALL_AI_REAL = `async function callAI(prompt, system) {
  if (typeof window !== "undefined" && window.cowork && typeof window.cowork.askClaude === "function") {
    try {
      return await window.cowork.askClaude(system + "\\n\\n" + prompt, []);
    } catch (e) { return null; }
  }
  const apiKey = localStorage.getItem("11plus:api-key");
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 100,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data?.content?.[0]?.text || null;
  } catch (e) { return null; }
}`;

if (CALL_AI_STUB.test(src)) {
  src = src.replace(CALL_AI_STUB, CALL_AI_REAL);
  console.log("✓ callAI injected");
} else {
  // Try simple function replacement
  const simpleSub = src.indexOf("async function callAI(");
  if (simpleSub !== -1) {
    console.log("  callAI already present in source — skipping replacement");
  } else {
    console.warn("⚠ callAI stub not found — AI calls may not work");
  }
}

// ─── 2. ROOT_TIPS injection ───────────────────────────────────────────────────
let rootTipsData = "{}";
if (fs.existsSync(ROOT_TIPS_FILE)) {
  const rt = fs.readFileSync(ROOT_TIPS_FILE, "utf8");
  // Extract the object literal from: const ROOT_TIPS = { ... };
  const m = rt.match(/ROOT_TIPS\s*=\s*(\{[\s\S]*?\});?\s*$/m);
  if (m) { rootTipsData = m[1]; console.log("✓ ROOT_TIPS loaded"); }
  else { console.warn("⚠ Could not parse ROOT_TIPS from root-tips.js"); }
} else {
  console.log("  root-tips.js not found — using empty ROOT_TIPS stub");
}
src = src.replace(/const ROOT_TIPS\s*=\s*\{\s*\}/, `const ROOT_TIPS = ${rootTipsData}`);

// ─── 3. FILL_BLANK_EXAMPLES injection ────────────────────────────────────────
let fillBlankData = "{}";
if (fs.existsSync(FILL_BLANK_FILE)) {
  const fb = fs.readFileSync(FILL_BLANK_FILE, "utf8");
  const m = fb.match(/FILL_BLANK_EXAMPLES\s*=\s*(\{[\s\S]*?\});?\s*$/m);
  if (m) { fillBlankData = m[1]; console.log("✓ FILL_BLANK_EXAMPLES loaded"); }
  else { console.warn("⚠ Could not parse FILL_BLANK_EXAMPLES from fill-blank-examples.js"); }
} else {
  console.log("  fill-blank-examples.js not found — using empty FILL_BLANK_EXAMPLES stub");
}
src = src.replace(/const FILL_BLANK_EXAMPLES\s*=\s*\{\s*\}/, `const FILL_BLANK_EXAMPLES = ${fillBlankData}`);

// ─── Write output ─────────────────────────────────────────────────────────────
fs.writeFileSync(OUT, src, "utf8");
console.log(`✓ app-modified.jsx written (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
console.log("");
console.log("Next steps:");
console.log("  node_modules/.bin/babel --presets @babel/preset-react \\");
console.log("    --plugins @babel/plugin-proposal-optional-chaining,@babel/plugin-proposal-nullish-coalescing-operator \\");
console.log("    app-modified.jsx -o app-compiled.js");
console.log("  node_modules/.bin/terser app-compiled.js -o app-min.js --compress --mangle");
console.log("  node assemble.js");
