# Session Handover — 17 May 2026 (v1.16.0 — Letter Blitz mini-game)

## Status: v1.16.0 shipped

---

## What was accomplished this session

1. **Alphabet Aid** (v1.15.0) — 🔤 toggle on all three letter-based VR question types
2. **Letter Blitz** (v1.16.0) — new mini-game for memorising A=1 to Z=26

---

## 1 — Alphabet Aid (v1.15.0, carry-over)

Toggle button on `VRLetterCodeAnalogy`, `VRSequence` (letter type only), `VRLettersNumbers`.
Reveals A(1)–Z(26) compact row. Aid usage tracked per-question as `alphabetAidUsed` flag in result objects.

---

## 2 — Letter Blitz mini-game (v1.16.0)

### Purpose
Dedicated practice for memorising letter positions — the foundational skill for all letter-based VR questions. Desgined to build internalized recall so students no longer need the Alphabet Aid crutch.

### `generateLetterBlitzQueue(count = 20)`
Generates 20 random questions in 4 types (5 each, then shuffled):
- `letter_to_pos`: "What position is M?" → answer is a number (1–26)
- `pos_to_letter`: "What letter is position 7?" → answer is a letter
- `shift_forward`: "C +4 = ?" → answer is letter at position+shift
- `shift_backward`: "K −3 = ?" → answer is letter at position−shift

Each question has 4 options (1 correct + 3 plausible nearby distractors).

### `LetterBlitz` component
Props: `{ onDone, blitzBest }`
- Shows question counter + elapsed timer
- Instant feedback: answer highlights green/red for 550ms then auto-advances
- Results screen: score/20, time in seconds, personal best detection
- `onDone(score, timeMs, isNewBest)` callback

### Storage
`getUserStorageKeys` extended with:
```js
letterBlitzBest: `11plus:user:${userId}:letter-blitz-best-v1`
```
Shape: `{ score: number, timeMs: number }` or `null`

New state in App: `[blitzBest, setBlitzBest]`, `[blitzMode, setBlitzMode]`

`handleBlitzDone(score, timeMs, isNewBest)` — saves new best, clears blitzMode.

### Home screen tile
A purple gradient card labelled "⚡ Letter Blitz" appears in a "Mini Games" section on the student practice tab, below the main practice card. Shows personal best when set.

### Render flow
`blitzMode` takes priority over `practising`:
```
tab === "practice" && mode === "student"
  └─ blitzMode  → <LetterBlitz>
  └─ practising → VocabSession / VRSession
  └─ else       → home screen (with Blitz tile)
```

### Deferred alphabet mini-games
Two options noted for future builds:
- **Shift Trainer** — shows a pair like `C → F`, asks for the shift (+3). Targets exactly the mental operation in letter code analogy questions. Build after Blitz is proven.
- **Alphabet Tap** — speed-run tapping letters in order; more game-like, good for younger students. Lower priority.

---

## Build pipeline (unchanged)

```
node build.js
→ ./node_modules/.bin/babel --presets @babel/preset-react \
     --plugins @babel/plugin-proposal-optional-chaining,@babel/plugin-proposal-nullish-coalescing-operator \
     app-modified.jsx -o app-compiled.js
→ ./node_modules/.bin/terser app-compiled.js -o app-min.js --compress --mangle
→ node assemble.js
```

---

## Current app state

- **VERSION**: 1.16.0 — 745 KB
- Alphabet Aid: live on letter_code_analogy, letter_sequence, letters_numbers
- Letter Blitz: live — accessible from student home screen
- Personal best stored per user profile
- All prior features intact

---

## Deferred

- Shift Trainer mini-game (after Blitz is proven)
- Alphabet Tap mini-game (lower priority)
- Alphabet Aid progression criterion — data captured, not yet enforced
- Coaching memory / pattern detection — needs ~20+ timed sessions
- Admin layer (export CSV, Leitner overrides, session length config)
- NVR questions — August 2026 review
- Maths questions — deprioritised
- Phase 1 backend (auth, DB, API proxy) — next commercial step
