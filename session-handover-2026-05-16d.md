# Session Handover — 16 May 2026 (v1.11 complete)

## Status: v1.11 shipped ✅ — Ready for v1.12 planning

---

## What was accomplished this session

### v1.10.1 hotfix
- `react.js` was corrupted (contained old v1.8.0 app code). Replaced with real React 18.3.1 UMD bundle (unpkg, 10 KB).
- Fixed stale `createRoot: expected 2` check in `assemble.js` → now correctly expects 1 (the real react.js has 0 createRoot; only reactdom.js has 1).

### v1.11 — Time-pressure mode
Full feature, built and committed. Summary:

| Area | Detail |
|---|---|
| **Profile default** | `timedMode: boolean` added to profile schema. Toggle in ProfileCreator ("Timed mode default"). Saved to profile. |
| **Per-session override** | ⏱ toggle on "Ready to practise?" card, pre-loaded from profile, overridable per-session. Practice button shows "⏱ Practice →" when on. |
| **Draining timer bar** | 5px bar at top of question card; drains over 30s; green → amber (18s) → red (25s). Only visible while question unanswered. |
| **Countdown pill** | Stat pill shows remaining seconds ("27 / Left") instead of elapsed. Colour tracks same thresholds. |
| **Hard cutoff** | At 30s: ref-guarded `useEffect` fires `handleAnswer("__timeout__")`. Race-condition proof via `timeoutFired` ref reset on each question. |
| **Timeout result block** | Amber `timeout` CSS variant (not red wrong). ⏱ icon, "Time's up!" title. Correct answer shown. Dedicated AI coaching prompt for timed-out questions. |
| **End-screen stats** | Second row of stat pills in timed mode: Avg time / % Under 30s / Timed out count (colour-coded). |
| **Session history** | Saves `timedMode`, `avgTimeMs`, `pctUnder30`, `timedOutCount` on timed sessions. |
| **Dashboard Speed Trend** | Bar chart of avg time per timed session (last 8). Appears once ≥2 timed sessions exist. Target annotation "under 20s avg". |
| **Slow-flag suppressed** | Old passive slow-flag hidden in timed mode (redundant when cutoff is enforced). |

### Bugfix: vocab antonym/synonym distractor logic
Old logic: `makeDistractors(wordEntry, "antonyms")` for antonym questions → collected antonyms of semantically-related words → these looked like valid antonyms of the target too (e.g. "ominous" antonym question showed cheerful/warm/innocent/promising — all plausible antonyms).

Fix: Swap distractor source:
- **Antonym question** → distractors = target's own **synonyms** first (same direction = clearly wrong). Fall back to `makeDistractors(wordEntry, "synonyms")`.
- **Synonym question** → distractors = target's own **antonyms** first (opposite direction = clearly wrong). Fall back to `makeDistractors(wordEntry, "antonyms")`.

Both paths add `if (distractors.length < 3) return null` guard.

---

## Current app state (v1.11, live ✅)

- **VERSION**: 1.11.0
- **react.js**: Real React 18.3.1 UMD (10 KB) — standalone HTML build now clean
- **Timed mode**: fully implemented (see above)
- **Vocab bank**: 731 words, 4 question formats, Leitner 6-box
- **VR types — 10 total**: analogy, odd_one_out, antonym_pair, synonym_pair (Leitner-tracked); letter_sequence, number_sequence, letters_numbers, number_bracket, equation_completion, letter_code_analogy (generated, id:null)
- **Profiles**: birthdate, age-gated difficulty, timedMode default, reset progress
- **Maths**: not in app (deprioritised — Alex strong)
- **NVR**: not in app (August 2026 review)

---

## v1.12 scope candidates (agreed priority order)

**B — Soft progression** (deferred 3× from v1.7/v1.8/v1.9)
Mastery-triggered band unlocks. Once student hits 80% across N questions in a band, next band unlocks. Key design question: how to handle generated (untracked) question types alongside Leitner-tracked ones. Current banding is age-gated only.

**D — Coaching memory / pattern detection** (deferred — needs more data first)
AI pattern detection on error history. Noted in v1.11 planning: needs structured error-log redesign and more session history before useful. Best revisited when Alex has ~20+ timed sessions.

**C — Admin layer** (lowest priority)
Full management panel. First piece: reset button already exists in profile editor. Remainder: export CSV/JSON, manual Leitner overrides, session length config, generator weights.

---

## Build pipeline reminders

- Source: `11plus-coaching-app.jsx`
- Build: `cp 11plus-coaching-app.jsx app-modified.jsx` → `./node_modules/.bin/babel ... app-modified.jsx -o app-compiled.js` → `./node_modules/.bin/terser app-compiled.js -o app-min.js --compress --mangle` → `node assemble.js`
- **Use `./node_modules/.bin/babel` NOT `npx babel`** (npx resolves to Babel 6, breaks optional chaining)
- Final output: `11plus-coach.html` + versioned backup `11plus-coach-<VERSION>.html`
- assemble.js verification: Script tags: 6, import{: 0, createRoot: 1 (all expected)
- Dave commits to GitHub manually — provide commit summary only, never run git commands
- Use Sonnet for code; flag Dave to switch to Opus for generation logic design or heavy reasoning

---

## Alex context

- Kent Test + Bexley Selection Test, **September 2026**
- Timing is #2 priority (cross-cutting, now addressed by v1.11)
- Biggest gap: verbal (vocab + VR). Bexley 50% verbal weighting
- Maths deliberately deprioritised (Alex strong)
- Younger sibling Layla also in scope eventually, lower urgency
