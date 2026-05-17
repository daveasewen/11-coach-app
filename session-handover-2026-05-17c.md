# Session Handover — 17 May 2026 (v1.13 shipped ✅)

## Status: v1.13 built and assembled — Phase 0 commercial requirements done

---

## What was accomplished this session

- v1.12 soft progression shipped (see session-handover-2026-05-17b.md)
- v1.13 Phase 0 commercial hardening implemented across all three items from commercial-deployment-plan.md

---

## v1.13 — What shipped (Phase 0)

### 1. AI off by default
- `aiEnabled` initialises to `false` instead of `true`
- Students start with a clean, fast practice loop — AI is opt-in
- Core practice flow (vocab and VR sessions) never depends on AI

### 2. API key modal (no hardcoded key)
- Clicking the AI pill when AI is off now checks:
  - If `window.cowork.askClaude` is available (Cowork mode) → enable immediately, no key needed
  - If `localStorage.getItem('11plus:api-key')` exists → enable immediately
  - Otherwise → show `AiKeyModal`
- `AiKeyModal` component: password input, validates `sk-ant-` / `sk-` prefix, saves to localStorage, link to Anthropic console, "Not now" dismiss
- Key is stored in localStorage only — never embedded in the built file
- The JSX `callAI` stub (`window.claude.complete`) contains no key; build.js injects the real localStorage-reading version

### 3. Data export / import
- **Export**: `handleExportData()` — collects leitnerBoxes, vrLeitner, sessionHistory, streakData, progression for the active profile and downloads as `11plus-{name}-{date}.json`
- **Import**: `handleImportData()` — file input reads a JSON backup, restores all keys to storage for the active profile, then calls `loadUserData` to refresh in-memory state; shows "✓ Imported!" flash for 3s
- Both accessible from the profile panel (⬇ Export / ⬆ Import buttons below "Add profile")

---

## Current app state (v1.13, ready to ship)

- **VERSION**: 1.13.0
- All v1.12 features intact (soft progression, mastery unlocks, auto-tuning)
- All Phase 0 commercial requirements from commercial-deployment-plan.md complete

---

## Build pipeline

Same as v1.12 — no changes:
- `node build.js` → `app-modified.jsx`
- `./node_modules/.bin/babel --presets @babel/preset-react --plugins @babel/plugin-proposal-optional-chaining,@babel/plugin-proposal-nullish-coalescing-operator app-modified.jsx -o app-compiled.js`
- `./node_modules/.bin/terser app-compiled.js -o app-min.js --compress --mangle`
- `node assemble.js`
- **Use `./node_modules/.bin/babel` NOT `npx babel`**

---

## Commercial deployment status

Per commercial-deployment-plan.md:

| Phase | Status |
|---|---|
| Phase 0 — Prototype hardening | ✅ Complete (v1.13) |
| Phase 1 — Backend (auth, DB, API proxy) | Not started |
| Phase 2 — Payments + compliance | Not started |
| Phase 3 — PWA polish | Not started |
| Phase 4 — App Store | Deferred |

**Next commercial step**: Phase 1 planning — backend tech stack selection (Supabase vs alternatives) before any further work that deepens localStorage dependency.

---

## Deferred (unchanged)

- Coaching memory / pattern detection — needs ~20+ timed sessions
- Admin layer (export CSV, Leitner overrides, session length config)
- NVR questions — August 2026 review
- Maths questions — deprioritised
- Promoting `unlockedBand` → `currentBand` when fully blended — not yet designed
