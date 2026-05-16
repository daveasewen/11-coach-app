# Session Handover — 16 May 2026 (v1.10 complete)

## Status: v1.10 shipped ✅ — Ready for v1.10.1 hotfix and/or v1.11 planning

---

## What was accomplished this session

v1.10 built, smoke-tested, and committed. Full VR generator expansion — 4 new question types, extended number sequence v2, plus a v1.9 correctness bug fix.

### What shipped in v1.10

| Area | Detail |
|---|---|
| **lettersNumbersGenerator** | A=1…J=10 substitution + arithmetic. Bands: 1 single op, 2 two ops LTR, 3 BIDMAS + optional brackets, 4 nested brackets. Eval via Function constructor (safe — strings fully generated). |
| **numberBracketGenerator** | `outer1(inner)outer2`. 2 worked examples + 1 to solve. Band-internal ambiguity guard: rejects puzzles where another rule in the same band fits both examples. |
| **equationCompletionGenerator** | LHS = RHS with `?`. Band 1 single op each side, band 2 two ops LTR, band 3 BIDMAS, band 4 brackets. ? always resolves to positive integer. |
| **letterCodeAnalogyGenerator** | `AB : CD :: PQ : ?` with Z+1=A wraparound. Band 1 same shift, band 2 different shifts, band 3 mixed direction, band 4 splits between 3-letter codes and reverse-then-shift. |
| **generateNumberSequence v2** | Adds geometric (×2 ×3 ÷2), alternating (+x+y…), increasing-difference, interleaved sequences (band 3+), mixed +n/×2 (band 4). All wrapped in a `buildResult` helper for consistent distractor logic. |
| **4 new render components** | VRLettersNumbers, VRNumberBracket, VREquationCompletion, VRLetterCodeAnalogy. Matching badge styles + display CSS (vr-equation-display, vr-bracket-examples, vr-codepair-display). |
| **Session queue rebalance** | Injects 1 of each of the 6 generated types per session, plus Leitner-due vocab/antonym/synonym from existing banks. |
| **Tutor Preview Qs** | All 4 new types added to VR_PREVIEW_TYPES dropdown + generate() dispatcher + render dispatch. |
| **AI coaching** | 4 new prompt branches in handleAnswer dispatcher tuned per question type. |
| **v1.9 bug fix** | Removed `String(opt)` wrap in VRSequence — number_sequence answers were always logging as `correct: false` because `"25" === 25` is never true. Now passes opt directly. |
| **Truthiness fix** | `if (selected)` → `if (selected !== null)` in handleAnswer and render dispatchers, so numeric 0 answers don't false-positive as "no selection". |
| **VERSION bump** | 1.8.0 → 1.10.0. Added `Fragment` to React imports (used in VREquationCompletion for `?` placeholder splitting). |

### Smoke test (verification pass)

Each generator ran 25× at each band (1–4). All 24 (gen × band) combinations returned 25/25 valid: correct shape, correct in options, no duplicate options. Spot-checked sample math: substitution, BIDMAS, bracket-rule deduction, letter wraparound — all correct.

---

## Current app state (v1.10, live ✅)

- **Vocab bank:** 731 words, 4 question formats (synonym, antonym, definition, fillblank), Leitner 6-box
- **VR types — 10 total:**
  - From banks (Leitner-tracked): analogy, odd_one_out, antonym_pair, synonym_pair
  - Generated (id:null, no Leitner): letter_sequence, number_sequence, letters_numbers, number_bracket, equation_completion, letter_code_analogy
- **Difficulty:** Bands 1–4 supported across all generators; vocab/VR banks have their own difficulty fields up to 5
- **Maths:** still not in app
- **NVR:** still not in app (August 2026 review)
- **Profiles:** birthdate, age-gated difficulty, reset progress
- **Leitner:** 6-box spaced repetition; vocab and VR tracked separately; generated questions never tracked
- **AI coaching:** callAI() → Haiku (Cowork) or direct Anthropic API fallback
- **Student flow:** auto-rotation (strict alternation vocab/VR); no domain picker
- **Tutor flow:** Dashboard, AI Advisor, Preview Qs (now 10 VR types)

---

## ⚠ Known issue carried into v1.11 — react.js corruption

The local HTML build pipeline has a pre-existing problem: `react.js` in the project folder is NOT the React UMD library — it contains an old v1.8.0 copy of the app code, complete with a stray `import{useState,useEffect,useRef}from"react"` at the top.

**Impact:**
- The final `11plus-coach.html` embeds that stray import line as a `<script>` tag
- A plain browser hitting that line will throw a SyntaxError (module syntax in a non-module script)
- The Claude.ai artifact deploy path is unaffected — Claude.ai compiles the JSX server-side and provides its own React

**Fix (probably v1.10.1 hotfix):**
- Replace `react.js` with a real React UMD bundle (download `react.production.min.js` from a CDN and rename, ~250KB)
- Confirm `reactdom.js` is correct (it is — 132KB, last modified May 10)
- Re-run assemble.js, confirm verification shows `import{:  0 (expected 0)`

assemble.js verification line for reference:
```
import{:        1 (expected 0)   ← currently failing
```

---

## v1.11 scope candidates — to discuss next session

### Option A — Time-pressure mode (high pedagogical value)

The 11+ context doc flags timing as the **#2 priority** after vocabulary (cross-cutting issue suppressing scores across all domains in mocks). Currently the app shows elapsed seconds per question but doesn't enforce. Idea:

- Add a "timed mode" toggle in student practice
- Per-question time limit (configurable, default 30s)
- Soft warning at 20s, hard cutoff at 30s → auto-marks wrong and moves on
- Session stats: avg time per question, % under 30s, slowest-question flag
- Tutor dashboard view: time-pressure performance trend

### Option B — Soft progression (deferred 3 times now)

Mastery-triggered next-band unlock. Currently bands gate by profile age. Idea: once student achieves 80% across N questions in a band, the next band unlocks. Spec was deferred from v1.7, v1.8, and v1.9.

### Option C — Admin layer (deferred from v1.6 onwards)

Full management panel: reset, export to CSV/JSON, manual Leitner box overrides, config knobs (session length, generator weights, etc.). First piece would be reset-progress button in profile editor.

### Option D — Coaching memory / pattern detection

Use AI to spot recurring error patterns per student (e.g. "Alex consistently misses BIDMAS questions where division comes second"). Surface as actionable hints in AI Advisor tab.

### What Opus should do next session

Probably ask Dave to pick between A/B/C/D, OR start with a quick v1.10.1 hotfix on react.js before moving to v1.11.

---

## Key decisions already made (do not re-discuss)

- Maths domain: deliberately not in scope — Alex strong, verbal is the priority
- NVR: August 2026 review
- Auto-rotation: strict alternation, no student domain picker
- Generated VR types: always `id: null` → never tracked in Leitner (preserves clean Leitner state)
- Letters=Numbers offset: A=1 baseline (fixed, not randomized)
- Letter analogy: Z+1=A wraparound (standard GL convention)
- Number Bracket: 2 worked examples + 1 to solve (standard GL convention)
- Session injection: 1 of each of the 6 generated types per session

---

## Build pipeline reminders

- Source: `11plus-coaching-app.jsx`
- Build steps: `node build.js` → `./node_modules/.bin/babel ... app-modified.jsx -o app-compiled.js` → `./node_modules/.bin/terser app-compiled.js -o app-min.js --compress --mangle` → `node assemble.js`
- **Use `./node_modules/.bin/babel` NOT `npx babel`** (npx resolves to Babel 6, breaks optional chaining)
- Final output: `11plus-coach.html` plus versioned backup `11plus-coach-<VERSION>.html`
- Dave commits to GitHub manually — provide commit summary only, never run git commands
- You are on Opus — use it for generation logic design and reasoning; Sonnet is fine for straightforward code once design is settled

---

## Alex context

- Kent Test + Bexley Selection Test, **September 2026**
- Strong at maths (deliberately deprioritised)
- Biggest gap: verbal (vocab + VR). Bexley 50% verbal weighting
- Timing is the #2 priority — flagged in context doc as a cross-cutting issue across all mock sections
- Younger sibling Layla also in scope eventually, lower urgency
