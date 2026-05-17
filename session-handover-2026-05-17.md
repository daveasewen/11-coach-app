# Session Handover — 17 May 2026 (v1.12 ready to build)

## Status: Design locked ✅ — Ready to build v1.12

---

## What was accomplished this session

- v1.11 confirmed shipped and stable (timed mode + distractor bugfix + react.js hotfix)
- v1.12 soft progression design fully locked — all four decisions agreed
- Spec document updated to v2.0
- Auto-tuning confirmed as a hard requirement (not deferred)
- Memory updated with locked design
- Product planning handover written (separate chat)

---

## Current app state (v1.11, live ✅)

- **VERSION**: 1.11.0
- **react.js**: Real React 18.3.1 UMD (10 KB) — standalone HTML build clean
- **Vocab bank**: 731 words, 4 question formats, Leitner 6-box
- **VR types — 10 total**:
  - Leitner-tracked (id persisted): analogy, odd_one_out, antonym_pair, synonym_pair
  - Generated (id:null): letter_sequence, number_sequence, letters_numbers, number_bracket, equation_completion, letter_code_analogy
- **Timed mode**: fully implemented (30s timer, timeout result, speed stats, dashboard speed trend)
- **Profiles**: birthdate, age-gated difficulty, timedMode default, reset progress
- **Maths**: not in app (deprioritised)
- **NVR**: not in app (August 2026 decision point)

---

## v1.12 — Soft Progression: Full Design

### Mastery measurement (hybrid)
- **Leitner-tracked types** (analogy, odd_one_out, antonym_pair, synonym_pair):
  Mastery = ≥50% of questions for that type sitting in Leitner boxes 4–6
- **Generated/untracked types** (letter_sequence, number_sequence, letters_numbers, number_bracket, equation_completion, letter_code_analogy):
  Mastery = ≥80% correct across last 3 sessions (or all sessions if fewer than 3 exist)

### Unlock mechanics
- **Per-type independent unlock** — each question type unlocks its own next difficulty band independently
- **Age sets starting band only** — age seeds the starting band at profile creation; after that, only mastery data drives band changes. Age is NOT a permanent runtime floor.
- On unlock: next-band questions blend in at **20% of session slots** for that type initially

### Auto-tuning — REQUIRED, NOT OPTIONAL
Both directions. Must ship in v1.12.

- Window: 20 next-band question attempts per type (rolling)
- ≥80% accuracy on next-band items → `blendRate += 0.05`, reset window
- <60% accuracy for 1 window → `blendRate -= 0.05`, reset window
- <60% accuracy for **2 consecutive windows** → step back: `unlockedBand = null`, `blendRate` reset to 0.20
- Clamp: `blendRate = Math.max(0.10, Math.min(0.60, blendRate))`

### Profile schema addition
```js
progressionState: {
  [type]: {
    currentBand,          // 'easy' | 'medium' | 'hard'
    unlockedBand,         // null | 'medium' | 'hard'
    blendRate,            // 0.10–0.60, default 0.20 on unlock
    recentNextBandAttempts: [{ correct: bool, ts: number }],  // rolling, trim to 40
    // generated types only:
    recentSessionAccuracy: [{ sessionId: string, correct: number, total: number }]  // last 3
  }
}
```

### Profile migration
Existing profiles get `progressionState` auto-populated on first load using their existing `difficulty` setting as `currentBand`, `unlockedBand: null`, `blendRate: 0.20`.

---

## v1.12 Build Order

1. **Profile schema + migration** — add `progressionState`, migrate existing profiles
2. **`checkMastery(type, profile)`** — returns bool; Leitner path checks box 4–6 %, generated path checks last 3 sessions
3. **Question picker blend logic** — when `unlockedBand` set, split session slots by `blendRate`
4. **`updateBlendRate(type, profile)`** — auto-tuning (both up and down), called at end of session
5. **Session result tracking** — record next-band attempts per question, append to `recentNextBandAttempts`, trim to 40
6. **Parent dashboard progression panel** — per-type status table (current band, blend rate, next-band accuracy), manual override slider
7. **End-to-end test** — manually force mastery → confirm unlock → force failure → confirm step-back

---

## Build pipeline reminders

- **Source**: `11plus-coaching-app.jsx`
- **Build**: `cp 11plus-coaching-app.jsx app-modified.jsx` → `./node_modules/.bin/babel --presets @babel/preset-react,@babel/preset-env app-modified.jsx -o app-compiled.js` → `./node_modules/.bin/terser app-compiled.js -o app-min.js --compress --mangle` → `node assemble.js`
- **Use `./node_modules/.bin/babel` NOT `npx babel`** — npx resolves to Babel 6, breaks optional chaining
- **assemble.js verification**: Script tags: 6, import{: 0, createRoot: 1 (all expected)
- **Final output**: `11plus-coach.html` + versioned backup `11plus-coach-<VERSION>.html`
- **Dave commits to GitHub manually** — provide commit summary only, never run git commands
- **Model**: Sonnet for code; flag Dave to switch to Opus for generation logic design or heavy reasoning

---

## Alex context

- Kent Test + Bexley Selection Test, **September 2026**
- Biggest gap: verbal (vocab + VR). Bexley 50% verbal weighting
- Maths deliberately deprioritised (Alex strong)
- Timed mode now live — addressing the #2 systemic issue
- Younger sibling Layla also in scope eventually, lower urgency

---

## Deferred (do not build in v1.12)

- Coaching memory / pattern detection — needs ~20+ timed sessions of data
- Admin layer (export CSV, Leitner overrides, session length config) — low priority
- NVR questions — August 2026 review
- Maths questions — deprioritised
