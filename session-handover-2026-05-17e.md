# Session Handover — 17 May 2026 (v1.14.0 — soft progression + badges + DISTRACTOR_DICT expansion)

## Status: v1.14.0 shipped

---

## What was accomplished this session

This was a large session covering four interconnected features:

1. **Closed the band promotion loop** — `unlockedBand` now promotes to `currentBand`
2. **VR/Vocab clean split** — antonym_pair/synonym_pair fully moved to vocab domain
3. **Badge & celebration system** — awards on promotion, nearing-threshold nudges
4. **DISTRACTOR_DICT massively expanded** — 508 new definitions from dictionary.k12opened.com

---

## 1 — Band promotion loop (VR + Vocab)

### updateProgressionState (VR)
`promotedTypes[]` and `_nearingTypes[]` signals added to returned state.

Promotion fires when: `unlockedBand !== null && blendRate >= 0.60 && rolling 20-Q accuracy >= 0.80`

On promotion:
- `currentBand = unlockedBand`, `unlockedBand = null`
- `blendRate` reset to 0.20, `recentNextBandAttempts` cleared, `poorWindowStreak = 0`
- Type added to `_promotedTypes`

Nearing: any type with `unlockedBand` and `blendRate >= 0.45` but not yet promoted → `_nearingTypes`

### updateVocabProgressionState (new function)
Tracks a single `vocabBand` across all vocab question types.

Session accuracy recorded in `recentSessionAccuracy[]`. Mastery check: avg ≥ 0.80 over last 3 sessions → unlock next band.

Same blendRate auto-tune and promotion/step-back logic as VR.

Returns `_promotedVocab: true` and `_nearingVocab: true/false` signals.

---

## 2 — VR/Vocab clean split

`LEITNER_VR_TYPES` now: `['analogy', 'odd_one_out']` only.

`antonym_pair` and `synonym_pair` removed from:
- `LEITNER_VR_TYPES`
- `VR_TYPE_LABELS`
- `VR_PREVIEW_TYPES`
- `getDueVRQuestions` / `getDueVRQuestionsForBand` (no longer read ANTONYM_BANK/SYNONYM_BANK)
- `vrMasteredCount`

Added to:
- `VOCAB_PREVIEW_TYPES`

`QuestionPreview` default changed from `"antonym_pair"` to `"analogy"`.

ANTONYM_BANK and SYNONYM_BANK are derived from VOCAB_BANK so no data lost — they remain available for vocab sessions.

---

## 3 — Badge & celebration system

### Storage
`getUserStorageKeys` extended with:
```js
badges: `11plus:user:${userId}:badges-v1`
```

### Constants
`VR_TYPE_NAMES` — human-readable names for all 8 VR types.

### Badge IDs
- VR type mastery: `vr_{type}_medium`, `vr_{type}_hard`
- Vocab band mastery: `vocab_medium`, `vocab_hard`
- Milestones: `milestone_first_vr_medium`, `milestone_first_vr_hard`, `milestone_all_vr_medium`, `milestone_all_vr_hard`

### getBadgeInfo(id)
Returns `{ emoji, name, description }` for any badge ID.

### handleSessionEnd
After each session:
- Reads `_promotedTypes` / `_nearingTypes` (VR) or `_promotedVocab` / `_nearingVocab` (vocab)
- Awards appropriate badges (deduped against existing)
- Sets `pendingCelebration` state with `{ type: 'promotion'|'nearing', promotedTypes, nearingTypes, newBadges[] }`

### CelebrationOverlay component
Displayed when `pendingCelebration` is set. Shows:
- 🎉 "Level Up!" (promotion) or 🔥 "Keep Going!" (nearing)
- Green pills for promoted types, gold pills for nearing types
- New badges with emoji + name
- "Continue →" button to dismiss

---

## 4 — DISTRACTOR_DICT expansion

### Problem
Option card 📖 / 💡 buttons were showing "Definition not available" errors for words that appear as distractors but aren't in VOCAB_BANK.

### Fix part 1 — hide buttons when no data
`OptionCard` now renders definition/simple-definition buttons only when `data` / `data.simpleDefinition` exist. No more error text.

### Fix part 2 — DISTRACTOR_DICT populated
- ~80 high-frequency words added manually (devoted, sneaky, beneficial, bravery, etc.)
- 508 additional definitions fetched from `dictionary.k12opened.com` via their glossarybuilder2 API
- Total DISTRACTOR_DICT now: ~1541 entries

All k12 entries use the same `{ definition, simpleDefinition }` structure. Since k12 definitions are already kid-friendly, both fields are set to the same value.

Source data saved at: `k12_defs.json` (not in workspace — was fetched in session)

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

Babel emits a "deoptimised styling" note (not an error) because app-modified.jsx now exceeds 500KB. Build still completes cleanly.

---

## Current app state

- **VERSION**: 1.14.0
- All prior features intact (AI off by default, key modal, export/import, Leitner, timed mode, dark vocab card)
- Soft progression: VR and Vocab band promotion now fully functional
- Badge/celebration system: live
- DISTRACTOR_DICT: ~1541 entries

---

## Deferred (unchanged from v1.13)

- Coaching memory / pattern detection — needs ~20+ timed sessions
- Admin layer (export CSV, Leitner overrides, session length config)
- NVR questions — August 2026 review
- Maths questions — deprioritised
- Promoting `unlockedBand` → `currentBand` when fully blended — ✅ DONE this session
- Phase 1 backend (auth, DB, API proxy) — next commercial step
