# Session Handover — 21 May 2026c (v1.18.0)

## Project

11+ coaching app for Kent Test and Bexley Selection Test (exam: September 2026).
Single-file React/JSX app. Student-facing practice + parent/coach analytics dashboard.

**Stack:** `11plus-coaching-app.jsx` → `node build.js` → babel → terser → `node assemble.js` → `11plus-coach.html`
**Always use** `./node_modules/.bin/babel`, never `npx babel`.

---

## Current version: v1.18.0 — 759 KB

---

## Feature inventory

### Core loop
- **Vocab practice** — Leitner spaced repetition, ~1541-word bank, synonym / antonym / definition / fill-blank question types
- **VR practice** — Leitner spaced repetition across 8 question types (below)
- **Progression system (v1.12)** — mastery-based difficulty band unlock, celebration overlays
- **Timed mode** — 30s per question, auto-submit on timeout
- **Streak + badges (v1.14)**
- **Session history** — stored per profile, shown in dashboard

### VR question types (all live)
| Type | Generator | Hints & Aids |
|------|-----------|--------------|
| analogy | VR_BANK (static) | 💡 Hint (relationship), post-answer hint |
| odd_one_out | VR_BANK (static) | 💡 Hint (category), post-answer explanation |
| antonym_pair / synonym_pair | ANTONYM_BANK / SYNONYM_BANK | — |
| letter_sequence | generateLetterSequence | 🔤 Alphabet + 💡 Hint (pattern rule) |
| number_sequence | generateNumberSequence | 💡 Hint (pattern rule) |
| letters_numbers | lettersNumbersGenerator | 🔤 Alphabet + 💡 Hint (substitution steps) |
| number_bracket | numberBracketGenerator | post-answer step hint (built into q.hint) |
| equation_completion | equationCompletionGenerator | 💡 Hint (evaluates LHS, gives target) |
| letter_code_analogy | letterCodeAnalogyGenerator | 🔤 Alphabet + 💡 Hint (rule + worked check) |

### Aids system
- `AlphabetAid` — A(1)–Z(26) grid toggle, turns gold when used
- `HintAid` — type-specific hint text toggle, turns gold when used
- `alphabetAidUsed` + `hintAidUsed` tracked per question in results (data captured, not yet enforced in progression)

### Coach features
- **Preview Qs tab** — fully interactive (coach answers for real, timer, result block, all aids, AI coaching if enabled)
- **AI Advisor tab** — session-history analysis
- **Dashboard** — Leitner box progress, session history charts

### AI coaching (optional, off by default)
- Header pill toggle → if no API key stored → `AiKeyModal` (validates `sk-ant-`/`sk-` prefix, stores to `localStorage('11plus:api-key')`)
- Works in Cowork env via `window.cowork.askClaude` (no key needed)
- Per-type AI prompts in VRSession and VocabSession
- `aiEnabled` prop threaded through to VRSession, VocabSession, QuestionPreview

### Mini games
- **Letter Blitz** — A=1..Z=26 drill, 20 questions, 4 types, personal best tracking

### Profile system
- Multi-profile, per-profile storage keys, year group, avatar
- Export/import JSON backup
- Reset progress

### Storage
- `storageGet` / `storageSet` — localStorage with `getUserStorageKeys(profileId)` namespacing
- Key shapes: leitnerBoxes, vrLeitner, sessionHistory, streakData, progression, letterBlitzBest

---

## Deferred / next up

- **Soft progression** — discuss mastery-triggered next-band unlock before v1.9 planning (deferred from v1.7)
- **Shift Trainer mini-game** — after Letter Blitz proven useful
- **Alphabet Tap mini-game** — lower priority
- **Aid-usage progression gates** — data captured (hintAidUsed, alphabetAidUsed), logic not yet enforced
- **Admin layer** — reset button, export CSV, Leitner overrides, session length config
- **Coaching memory / pattern detection** — needs ~20+ timed sessions of data
- **NVR questions** — August 2026 review point
- **Maths questions** — deprioritised
- **Phase 1 backend** — auth, DB, API proxy (next commercial step)

---

## Key implementation notes

- VERSION constant at top of JSX — bump for every shipped change
- `buildVRQueue` pulls from Leitner boxes + fills with due/new questions
- `generateVRByType(type, maxDiff)` is the single dispatch for all generated types
- `HintAid` and helper functions (`getAnalogyHint`, `getEquationHint`, `getLettersNumbersHint`, `getLetterCodeHint`) live just before the VR component definitions
- Babel "deoptimised styling" warning on build = normal (file >500 KB), not an error
- Dave commits to GitHub manually — never run git commands; provide a commit summary instead
