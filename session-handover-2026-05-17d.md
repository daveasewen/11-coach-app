# Session Handover — 17 May 2026 (vocab card redesign ✅)

## Status: v1.13.0 — vocab card dark layout shipped

---

## What was accomplished this session

Single change: vocab question card redesigned to full dark-card layout matching reference screenshot.

---

## Vocab card — what changed

### CSS additions (in styles template literal)
New `.vocab-dark-card` block added after `.result-word`:
- `.vocab-dark-card` — full dark card (`background:var(--ink); color:white`)
- `.vc-prompt-row` — flex row: prompt text left, type badge right
- `.vc-prompt-text` — small italic label ("Choose the word CLOSEST in meaning to:")
- `.vc-word` — large centred serif word (Fraunces 46px bold)
- `.vc-clue` — italic centred block for definition/fillblank clue text
- `.vocab-dark-card .q-aids` — centred aids row
- `.vocab-dark-card .q-reveal` — centred definition reveals
- `.vocab-dark-card .hint-row` — muted white
- `.vocab-dark-card .timer-bar-wrap` — full-bleed top (`margin:-18px -18px 18px`)
- `.vocab-dark-card .next-btn` — frosted-glass style on dark
- **Cascade resets**: `.vocab-dark-card .opt-card { color:var(--ink) }` and `.vocab-dark-card .result-block { color:var(--ink) }` — prevents white text from bleeding into white-background children

### JSX changes (VocabSession)
Replaced `.card` + `.q-header` structure with:
```
<div className="card vocab-dark-card">
  [timer bar if timed mode]
  <div className="vc-prompt-row">
    <div className="vc-prompt-text">"Choose the word CLOSEST in meaning to:" / etc</div>
    <div className="q-badge badge-{type}">Synonym / Antonym / etc</div>
  </div>
  {synonym|antonym → <vc-word> + QuestionAids}
  {definition|fillblank → <vc-clue>{clue}</vc-clue>}
  [options grid — unchanged]
  [hint row, result block, AI box, next button — unchanged]
</div>
```

### What's preserved
- 🔊 📖 💡 aids on the question word (synonym/antonym only, as before)
- 🔊 📖 💡 aids on each option card (unchanged)
- Both definitions in option card reveals
- Result block with correct answer, example, AI coaching
- Timed mode timer bar

---

## Build pipeline (unchanged)

- `node build.js` → `app-modified.jsx`
- `./node_modules/.bin/babel --presets @babel/preset-react --plugins @babel/plugin-proposal-optional-chaining,@babel/plugin-proposal-nullish-coalescing-operator app-modified.jsx -o app-compiled.js`
- `./node_modules/.bin/terser app-compiled.js -o app-min.js --compress --mangle`
- `node assemble.js`

---

## Current app state

- **VERSION**: 1.13.0 (version not bumped — layout-only change)
- All v1.13 features intact (AI off by default, key modal, export/import, soft progression)
- Vocab card: full dark-card layout

---

## Deferred (unchanged)

- Coaching memory / pattern detection — needs ~20+ timed sessions
- Admin layer (export CSV, Leitner overrides, session length config)
- NVR questions — August 2026 review
- Maths questions — deprioritised
- Promoting `unlockedBand` → `currentBand` when fully blended — not yet designed
- Phase 1 backend (auth, DB, API proxy) — next commercial step
