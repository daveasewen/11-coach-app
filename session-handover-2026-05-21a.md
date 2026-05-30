# Session Handover — 21 May 2026 (v1.17.0 — Alphabet Aid, Letter Blitz, bracket hints, live preview)

## Status: v1.17.0 shipped — 752 KB

---

## What was accomplished this session

1. **Alphabet Aid** (v1.15.0) — toggle aid on all three letter-based VR question types
2. **Letter Blitz mini-game** (v1.16.0) — dedicated A=1..Z=26 drill with personal best
3. **Bracket question hints** (v1.16.0) — static worked-example hint + improved AI coaching prompt
4. **Live interactive preview** (v1.17.0) — coach Preview Qs tab now fully interactive

---

## 1 — Alphabet Aid (v1.15.0)

New `AlphabetAid` component: 🔤 Alphabet toggle button that reveals A(1)–Z(26) in a compact single-row grid. Button turns gold once opened (consistent with other aid buttons).

Wired into:
- `VRLetterCodeAnalogy` — always shown
- `VRSequence` — only when `q.type === "letter_sequence"`
- `VRLettersNumbers` — always shown

`onAlphabetAid` callback passed from VRSession. `alphabetAidUsed` ref resets each question, stored in result objects as `{ ..., alphabetAidUsed: bool }`. Data captured for future progression use — not yet enforced.

CSS added: `.alphabet-row`, `.alpha-cell`, `.alpha-letter`, `.alpha-num`

---

## 2 — Letter Blitz mini-game (v1.16.0)

### Purpose
Build internalized A=1..Z=26 recall so students no longer need the Alphabet Aid crutch.

### `generateLetterBlitzQueue(count = 20)`
20 questions, 4 types × 5 each (then shuffled):
- `letter_to_pos`: "What position is M?" → number answer
- `pos_to_letter`: "What letter is position 7?" → letter answer
- `shift_forward`: "C +4 = ?" → letter at position+shift
- `shift_backward`: "K −3 = ?" → letter at position−shift

4 options each (1 correct + 3 plausible nearby distractors).

### `LetterBlitz` component
Props: `{ onDone, blitzBest }`
- Question counter + elapsed timer
- 550ms auto-advance after answer (instant green/red feedback)
- Results screen: score/20, time in seconds, personal best detection
- `onDone(score, timeMs, isNewBest)` callback

### Storage
`getUserStorageKeys` extended with `letterBlitzBest: ...letter-blitz-best-v1`. Shape: `{ score, timeMs }` or `null`.

New App state: `[blitzBest, setBlitzBest]`, `[blitzMode, setBlitzMode]`.

`handleBlitzDone(score, timeMs, isNewBest)` — saves new best to storage, clears blitzMode.

### Home screen tile
Purple gradient "Mini Games" card on student practice tab. Shows personal best when set.

Render priority: `blitzMode` > `practising` > home screen.

### Deferred alphabet mini-games (noted for future)
- **Shift Trainer** — shows `C → F`, asks for shift (+3). Targets the exact mental operation in letter code analogy. Build after Blitz proven.
- **Alphabet Tap** — speed-run tapping letters in order. More game-like, younger students.

---

## 3 — Bracket question hints (v1.16.0)

### Static hint on wrong answer
`numberBracketGenerator` now computes a `hint` field with real numbers from row 1:
```js
hint: `Rule: ${rule.label}. Using row 1: ${bracketStepHint}.`
// e.g. "Rule: (a + b)² ÷ 2. Using row 1: 3 + 3 = 6, squared = 36, ÷ 2 = 18."
```
All 11 rule types have their own step template. Shown in VRSession result block when `!isCorrect`.

### AI coaching prompt upgrade
Bracket prompt now asks AI to: verify rule against row 1 with actual numbers, then apply same steps to the question row. Concrete, no algebra.

---

## 4 — Live interactive preview (v1.17.0)

`QuestionPreview` completely rewritten. Was: static display with correct answer pre-revealed. Now: full student session experience.

### What's live
- Questions start unanswered — coach actually clicks an answer
- Live elapsed timer while unanswered; final time shown in result
- Full result block: ✓/✗, correct answer, bracket hint, odd-one-out explanation
- All aids work: vocab 🔊 📖 💡, Alphabet Aid on letter types
- AI Coach fires if AI enabled — coach-framing prompt (observation + teaching action)
- "New example →" in controls regenerates same type/difficulty
- Vocab questions use `QuestionAids` + `OptionCard` (full dark card experience)

### Props
`QuestionPreview({ maxDifficulty, aiEnabled })` — `aiEnabled` now wired from App.

### Reminder — what's still deferred
Hints and aids for ALL VR question types were discussed but not implemented. Dave noted: "we need hints and aids for all the verbal reasoning — lets work through this after." This is the next logical feature area.

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

Babel "deoptimised styling" note present — not an error, file exceeds 500KB.

---

## Current app state

- **VERSION**: 1.17.0 — 752 KB
- Alphabet Aid: live on letter_code_analogy, letter_sequence, letters_numbers
- Letter Blitz: live on student home screen (Mini Games section)
- Bracket hints: static worked-example hint on wrong answer, improved AI prompt
- Preview Qs tab: fully interactive, all question types, AI coaching if enabled
- All prior features intact (badges, celebrations, progression, DISTRACTOR_DICT ~1541 entries)

---

## Deferred

- **Hints and aids for all VR question types** — explicitly requested, next priority
  - Analogy: relationship explanation aid
  - Odd-one-out: category/grouping hint
  - Number bracket: already has hint; might want an "explain the rule" aid button
  - Letter sequence: pattern hint
  - Number sequence: pattern hint
  - Letters=numbers: substitution step hint
  - Equation completion: working-out hint
  - Letter code analogy: shift calculation hint
- **Shift Trainer mini-game** — after Blitz is proven useful
- **Alphabet Tap mini-game** — lower priority
- Alphabet Aid progression criterion — data captured, not yet enforced
- Coaching memory / pattern detection — needs ~20+ timed sessions
- Admin layer (export CSV, Leitner overrides, session length config)
- NVR questions — August 2026 review
- Maths questions — deprioritised
- Phase 1 backend (auth, DB, API proxy) — next commercial step
