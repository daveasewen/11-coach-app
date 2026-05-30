# Session Handover — 21 May 2026b (v1.18.0 — VR hints & aids, AI button verified)

## Status: v1.18.0 shipped — 759 KB

---

## What was accomplished this session

1. **AI button flow verified** — confirmed working exactly as specced
2. **VR hints & aids** — pre-answer 💡 Hint button + post-answer result hint across all 7 remaining VR question types

---

## 1 — AI Button Flow (verified, no changes needed)

`handleAiToggle` logic:
- If AI already on → toggle off
- If off: check `window.cowork.askClaude` (Cowork env) OR `localStorage('11plus:api-key')`
- If either present → enable directly
- If neither → show `AiKeyModal`

`AiKeyModal`:
- Password input, validates `sk-ant-` or `sk-` prefix
- Stores key to `localStorage('11plus:api-key')` on save
- "Get a key →" link to console.anthropic.com/settings/keys
- "Not now" dismiss keeps AI off
- On save → closes modal + enables AI

No bugs found. Exactly matches spec.

---

## 2 — VR Hints & Aids (v1.18.0)

### Architecture

**New components:**
- `HintAid({ hint, onUsed })` — toggle button (💡 Hint) that reveals a `hint-bubble` div on click. Turns gold when used (consistent with AlphabetAid). Placed right after AlphabetAid in the file.

**New helper functions** (pure, before VR components):
- `getAnalogyHint(q)` — category-aware relationship hint (covers opposites, synonyms, home, part-whole, young-adult, person-tool, cause-effect, feature-animal, person-place; fallback for unknown categories)
- `getLettersNumbersHint(q)` — computes letter-to-number substitution and shows numeric expression (e.g. "Substitute: A=1, C=3, E=5 → 1 + 3 + 5 = ?")
- `getEquationHint(q)` — evaluates the non-? LHS and tells student what target to aim for
- `getLetterCodeHint(q)` — formats rule + worked example from pair1→pair2 + instruction to apply to pair3

**New CSS:** `.hint-bubble` — gold left-border, semi-transparent background, fadeIn animation

### Per-type implementation

| Type | Pre-answer aid | Post-answer result hint |
|------|---------------|------------------------|
| Analogy | 💡 Hint (getAnalogyHint) | getAnalogyHint (on wrong) |
| Odd one out | 💡 Hint (category theme) | q.explanation ✓ (already existed) |
| Letter sequence | 💡 Hint (pattern rule) + 🔤 Alphabet | "Pattern: {q.rule}" (on wrong) |
| Number sequence | 💡 Hint (pattern rule) | "Pattern: {q.rule}" (on wrong) |
| Letters=Numbers | 💡 Hint (substitution steps) + 🔤 Alphabet | getLettersNumbersHint (on wrong) |
| Number bracket | — (hint already in result block) | q.hint ✓ (already existed) |
| Equation completion | 💡 Hint (LHS value + target) | getEquationHint (on wrong) |
| Letter code analogy | 💡 Hint (rule + verification) + 🔤 Alphabet | getLetterCodeHint (on wrong) |
| Antonym/Synonym pair | — (AI handles well) | — |

### VRSession tracking
- Added `hintAidUsed` ref (alongside `alphabetAidUsed`)
- Resets on each question
- Stored in results: `{ ..., hintAidUsed: bool }` — ready for future progression use

### onAlphabetAid fix in VRSession
VRSequence previously received `onAlphabetAid` for both letter AND number sequences. Fixed: now only passed for `letter_sequence` (number sequences don't use alphabet).

### QuestionPreview updated
All the same `onHintAid` props and result block hints wired identically in `QuestionPreview`.

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

- **VERSION**: 1.18.0 — 759 KB
- All VR question types now have pre-answer 💡 Hint buttons
- All VR question types now show contextual result hints on wrong answers
- hintAidUsed tracked per-question in results (for future progression gates)
- AI button + AiKeyModal verified correct
- All prior features intact

---

## Deferred

- **Shift Trainer mini-game** — after Letter Blitz is proven useful
- **Alphabet Tap mini-game** — lower priority
- Alphabet Aid / Hint Aid progression criterion — data captured, not yet enforced
- Coaching memory / pattern detection — needs ~20+ timed sessions
- Admin layer (export CSV, Leitner overrides, session length config)
- NVR questions — August 2026 review
- Maths questions — deprioritised
- Phase 1 backend (auth, DB, API proxy) — next commercial step
