# Session Handover — 17 May 2026 (v1.12 shipped ✅)

## Status: v1.12 built, tested, and assembled

---

## What was accomplished this session

- v1.12 fully built from the locked spec — all 7 build-order items completed
- 23/23 automated logic tests passed (unlock, auto-tune up/down, step-back, clamps, trims)
- Clean build: 6 script tags, 0 imports, 1 createRoot
- `11plus-coach.html` + `11plus-coach-1.12.0.html` written

---

## v1.12 — What shipped

### New constants/helpers
- `BAND_ORDER`, `BAND_DIFFICULTY`, `LEITNER_VR_TYPES`, `GENERATED_VR_TYPES`, `ALL_VR_TYPES`
- `nextBand(band)`, `difficultyToBand(maxDiff)`, `migrateProgressionState(profile)`

### New storage key
- `11plus:user:${userId}:progression-v1` — per-user progressionState object

### Profile schema migration
- On first load, if `progression` key missing: auto-creates from `getMaxDifficulty(profile)` → `difficultyToBand` → `currentBand` for all 10 VR types
- `unlockedBand: null`, `blendRate: 0.20`, `poorWindowStreak: 0` for all types
- Generated types also get `recentSessionAccuracy: []`

### `checkMastery(type, progressionState, vrLeitnerBoxes)`
- Leitner types: ≥50% of type's questions in boxes 4–6
- Generated types: ≥80% correct across last 3 `recentSessionAccuracy` entries
- Guards: `unlockedBand` already set → false; `_stepBackedThisUpdate` flag → false

### `buildVRQueue(vrLeitnerBoxes, maxDifficulty, progressionState)`
- Replaces the old inline queue-build in VRSession
- Falls back to legacy behaviour if `progressionState` is null
- Leitner-tracked: `getDueVRQuestionsForBand` blends per-type by `blendRate`; items tagged `isNextBand: bool`
- Generated: one per type; coin-flip weighted by `blendRate` picks current vs next-band difficulty; tagged `isNextBand`

### `updateProgressionState(results, prevState, vrLeitnerBoxes)`
- Called at end of every VR session (in `handleSessionEnd`)
- Records `recentSessionAccuracy` (trim to 3) for generated types
- Appends `recentNextBandAttempts` (trim to 40)
- Auto-tuning window (20 attempts):
  - ≥80% → `blendRate += 0.05`, reset window, `poorWindowStreak = 0`
  - <60% once → `blendRate -= 0.05`, reset window, `poorWindowStreak++`
  - <60% twice → step-back: `unlockedBand = null`, `blendRate = 0.20`, `poorWindowStreak = 0`
  - 60–80%: hold steady, reset window
- Clamp: `blendRate = Math.max(0.10, Math.min(0.60, blendRate))`
- Checks mastery and triggers `unlockedBand` if met

### VRSession changes
- Accepts `progressionState` prop (default null)
- Queue built via `buildVRQueue` instead of inline
- Results include `isNextBand: bool`

### App-level wiring
- New state: `progressionState` / `setProgressionState`
- `loadUserData`: loads or migrates progressionState; saves on migration
- `handleSessionEnd` (vr branch): calls `updateProgressionState`, persists to storage
- `handleResetProfile`: resets progressionState to fresh migration
- `handleSwitchProfile`: clears progressionState before loading new profile
- `handleOverrideProgression(type, key, value)`: parent can manually set blendRate for any type

### `ProgressionPanel` component (parent/coach dashboard)
- Table with all 10 VR types
- Columns: Type | Band (pill) | Unlocked band (pill or "locked") | Blend % (range slider when unlocked) | Next-band accuracy (last 20 attempts)
- `⚠N` warning badge when `poorWindowStreak > 0`
- Explanatory footnote on mastery thresholds and auto-tuning rules
- Shown below main Dashboard in coach mode → Dashboard tab

---

## Current app state (v1.12, ready to ship)

- **VERSION**: 1.12.0
- All v1.11 features intact (timed mode, distractor bugfix, react.js hotfix)
- New: soft progression with mastery-triggered band unlocks and auto-tuning both directions

---

## Build pipeline

- Source: `11plus-coaching-app.jsx`
- `node build.js` → `app-modified.jsx`
- `./node_modules/.bin/babel --presets @babel/preset-react --plugins @babel/plugin-proposal-optional-chaining,@babel/plugin-proposal-nullish-coalescing-operator app-modified.jsx -o app-compiled.js`
- `./node_modules/.bin/terser app-compiled.js -o app-min.js --compress --mangle`
- `node assemble.js`
- **Use `./node_modules/.bin/babel` NOT `npx babel`** — npx resolves to Babel 6
- **No `@babel/preset-env`** — use the plugin flags above (not in package.json)

---

## Deferred (unchanged from v1.12 spec)

- Coaching memory / pattern detection — needs ~20+ timed sessions
- Admin layer (export CSV, Leitner overrides, session length config)
- NVR questions — August 2026 review
- Maths questions — deprioritised
- Promoting `unlockedBand` → `currentBand` when fully blended — not yet designed
