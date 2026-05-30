# 11+ Coach App — Product Roadmap & Spec

*Living document. Updated automatically from session handovers after each session.*
*Last updated: 21 May 2026 — v1.18.0*

---

## Product Vision

An AI-enhanced coaching and testing tool for Dave's son, preparing for the Kent Test and Bexley Selection Test (September 2026). Warm and encouraging for the student; analytical and data-driven for the parent/tutor.

Built for one child. Architected to generalise (any exam region, any student) without a rebuild. Don't build the generalisation — just don't foreclose it.

**Non-negotiable:** Every 1% gained in vocabulary counts double for Bexley (50% verbal weighting). This shapes all priority decisions.

---

## Exam Context

| Subject | Kent | Bexley |
|---|---|---|
| Verbal/English | 33% | **50%** |
| Maths | 33% | 25% |
| NVR | 33% | 25% |

**Baseline mock (April 2026):** 54% overall. Target: 85%.

| Domain | Score | Gap | Priority |
|---|---|---|---|
| Vocabulary (Syn + Ant) | 39% | +46pp | 🔴 P1 Critical |
| Comprehension/Cloze | 59% | +26pp | 🟡 P2 |
| Maths | 60% | +25pp | 🟡 P3 |
| NVR | 58% | +27pp | 🟡 P3 |
| Verbal Reasoning | 64% | +21pp | 🟡 P3 |

NVR deprioritised — review August 2026 if other domains on track.

---

## Current State — v1.18.0 ✅

**Build:** `11plus-coaching-app.jsx` → `node build.js` → babel → terser → `node assemble.js` → `11plus-coach.html` (759 KB)

### Core loop
- **Vocab practice** — Leitner spaced repetition, ~1541-word bank, 4 question types (synonym / antonym / definition / fill-blank)
- **VR practice** — Leitner spaced repetition across 9 question types (see table below)
- **Progression system** — mastery-based difficulty band unlock, celebration overlays
- **Timed mode** — 30s per question, auto-submit on timeout
- **Streak + badges**
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
| number_bracket | numberBracketGenerator | post-answer step hint |
| equation_completion | equationCompletionGenerator | 💡 Hint (evaluates LHS, gives target) |
| letter_code_analogy | letterCodeAnalogyGenerator | 🔤 Alphabet + 💡 Hint (rule + worked check) |

### Aids system
- `AlphabetAid` — A(1)–Z(26) grid toggle, turns gold when used
- `HintAid` — type-specific hint text, turns gold when used
- `alphabetAidUsed` + `hintAidUsed` tracked per question (data captured, not yet enforced in progression)

### Coach features
- **Preview Qs tab** — fully interactive (coach answers for real, timer, result block, all aids, AI coaching if enabled)
- **AI Advisor tab** — session-history analysis
- **Dashboard** — Leitner box progress, session history charts

### AI coaching (optional, off by default)
- Header pill toggle → if no API key → `AiKeyModal` (validates `sk-ant-`/`sk-` prefix, stores to `localStorage('11plus:api-key')`)
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

## Version History

| Version | Key changes |
|---|---|
| v1.3 | Timer + Dashboard — 30s rule, timing metrics, per-format speed breakdown |
| v1.4 | Content quality pass — antonym/synonym audit (25 fixes), bank scaled to 504 words |
| v1.5 | Etymology + mnemonic layer — `rootTip` field, ~70 words with hooks, AI coaching revamp |
| v1.6 | User profiles — multi-profile, per-profile storage, avatars |
| v1.7 | VR foundation — first VR question types, Leitner for VR |
| v1.8 | VR expansion — analogy, odd_one_out, antonym_pair/synonym_pair, letter/number sequences |
| v1.9 | VR aids — AlphabetAid, HintAid, per-type hint logic |
| v1.10 | VR completion — letters_numbers, number_bracket, equation_completion, letter_code_analogy |
| v1.11 | Vocab bank scaling — ~1541 words |
| v1.12 | Progression system — mastery-based difficulty band unlock, celebration overlays |
| v1.13 | Timed mode — 30s per question, auto-submit |
| v1.14 | Streaks + badges |
| v1.15 | Letter Blitz mini-game |
| v1.16 | Coach preview tab — fully interactive, all aids, AI coaching |
| v1.17 | AI Advisor tab — session history analysis |
| v1.18 | Session history charts in dashboard |

---

## Roadmap

### Next up — candidates for v1.19+

| Feature | Priority | Notes |
|---|---|---|
| Soft progression — mastery-triggered next-band unlock | Medium | Deferred from v1.7. Discuss before v1.19 planning. Data already captured in progression system. |
| Aid-usage progression gates | Low | `hintAidUsed` + `alphabetAidUsed` captured per question. Logic not yet enforced. |
| Shift Trainer mini-game | Low | After Letter Blitz proven useful |
| Alphabet Tap mini-game | Low | Lower priority |
| Admin layer — reset, export CSV, Leitner overrides, session length config | Medium | First piece: reset button in profile editor |
| Coaching memory / pattern detection | Medium | Needs ~20+ timed sessions of data |

### August 2026 review point

| Feature | Priority | Notes |
|---|---|---|
| NVR questions | Medium | Deprioritised — revisit August 2026 if other domains on track |
| Maths questions | Low | 25% Bexley weighting. Deprioritised. |
| Comprehension/Cloze | Medium | 59% baseline — meaningful gap to close |

### Backend track — Supabase (active, feature/supabase branch)

Running in parallel with core app development. See `supabase-progress.md` for detailed task status.

| Feature | Status | Notes |
|---|---|---|
| Supabase project setup | Not started | Free tier, Postgres + Auth + JS client |
| Dual-mode storage adapter | Not started | Supabase first, localStorage fallback — app always works offline |
| Login/signup screen | Not started | Email + password; minimal UI added to JSX |
| localStorage → Supabase data migration | Not started | Auto-migrates on first login; localStorage kept as offline cache |
| Vercel preview deployment | Not started | `feature/supabase` branch → preview URL; `main` stays live for Alex |

**Branching rule:** Core app work stays on `main`. Backend work on `feature/supabase`. Docs (handovers, roadmap) stay on `main` throughout. Full handover written on merge day.

### Future / Not Committed

- Standalone hosting (Netlify/GitHub Pages)
- Exam region config (generalise beyond Kent/Bexley)
- Tutor collaboration workflow
- Coaching tone calibration (untested with actual child)
- Question bank authoring UI
- API proxy (Anthropic key server-side) — Phase 2, after auth is in place

---

## Known Issues / Backlog

| Issue | Severity | Status | Notes |
|---|---|---|---|
| Format badge visibility | Low | 🟡 Backlog | Make format badge more prominent — silly mistakes reading question type |

---

## Data / Content Operations

| Task | Status | Notes |
|---|---|---|
| Original 149-word bank | ✅ Done | Hand-crafted, reviewed |
| Quest PDF cross-reference (178 words) | ✅ Done | May 2026 |
| Antonym/synonym accuracy audit | ✅ Done (May 2026) | 25 corrections across all 327 words |
| Distractor dictionary (804 entries) | ✅ Done | Used for option card definitions |
| Scale to 504 words | ✅ Done (May 2026) | 177 new entries — character adjectives, verbs, nouns |
| Exam Ninja 1800-word cross-reference | ✅ Done (May 2026) | 144 new entries added. Bank reached 648 words. |
| Etymology/mnemonic layer (`rootTip`) | ✅ Done (v1.5) | ~70 words have root tips injected at build time |
| Scale to ~1541 words | ✅ Done (v1.11) | — |

**Vocab bank schema (stable — do not change):**
`{ word, definition, simpleDefinition, synonyms[], antonyms[], difficulty(1–5), pos, example, rootTip? }`

**Quality bar for antonyms:** Single word. Directly opposite in meaning. Same or compatible POS. Age-appropriate for 10–11 year olds.

---

## Decisions Log

| Decision | Rationale | Date |
|---|---|---|
| Vocab as P1, NVR deprioritised | Bexley 50% verbal weighting — vocab gains disproportionately impactful | Apr 2026 |
| Cowork artifact over standalone hosting | Faster iteration, no deployment friction, AI available without API key | May 2026 |
| Single JSX file, build pipeline | Self-contained, no framework overhead, AI-readable source | May 2026 |
| Leitner mastery = box ≥3 AND all formats | Box alone insufficient — word must be seen in all available question types | May 2026 |
| AI enhances, does not enable | App must work fully offline/AI-off. Static definitions always available | May 2026 |
| Coaching prompts: completion-style with Sentence: cue | Forces single-sentence output from Haiku, prevents academic analysis waffle | May 2026 |
| Etymology/mnemonic layer (v1.5) | Pre-built root tips beat AI-improvised hooks — AI should build on an anchor, not invent one | May 2026 |
| Tightened coaching prompts (student mode) | Ban "however"/"while", require concrete examples, no word comparisons | May 2026 |
| Antonym quality: must be precise not associative | "reveal" as antonym of "delude" accepted by app but pedagogically weak — triggered full audit | May 2026 |
| AI off by default | Key prompt shown when AI selected without key; core loop never depends on AI | May 2026 |
| Aid usage tracked but not gated | Data captured (hintAidUsed, alphabetAidUsed) for future progression gates — not yet enforced | May 2026 |

---

## Product Principles

1. **Exam-outcome driven.** Every feature decision traces back to what moves the score.
2. **SLC/MLP standard.** Ship lean, maintain quality, avoid premature complexity.
3. **AI enhances, does not enable.** Core practice works without AI. AI adds coaching layer.
4. **Backlog items are tracked, not ignored.** Explicit deferral is a decision.
5. **Architecture supports generalisation.** Don't build it. Don't foreclose it.
6. **Challenge drift.** If a feature doesn't trace to exam outcome, question it directly.

---

## Key Implementation Notes

- VERSION constant at top of JSX — bump for every shipped change
- `buildVRQueue` pulls from Leitner boxes + fills with due/new questions
- `generateVRByType(type, maxDiff)` is the single dispatch for all generated types
- `HintAid` and helpers (`getAnalogyHint`, `getEquationHint`, `getLettersNumbersHint`, `getLetterCodeHint`) live just before VR component definitions
- Babel "deoptimised styling" warning on build = normal (file >500 KB), not an error
- Dave commits to GitHub manually — never run git commands; provide a commit summary instead
- Always use `./node_modules/.bin/babel`, never `npx babel`
