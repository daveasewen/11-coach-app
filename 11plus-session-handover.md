# 11+ Coaching App — Session Handover v1.2b

## Read this first. Every time.

---

## 1. What This Is

An AI-enhanced coaching and testing tool for Dave's son (age 10–11) preparing for:
- **Kent Test (PESE)** — Early September 2026
- **Bexley Selection Test** — 2–10 September 2026 ✅ **Registered**

**Users:** Student (primary practice), Parent/Dave (monitoring), Tutor (session planning)

**Product standard:** SLC/MLP — solid and trustworthy, not a prototype.

**Architecture ambition:** Built for Dave's son, architected to generalise (any exam region, any student) without a rebuild. Don't build the generalisation — just don't foreclose it.

---

## 2. Exam Strategy (non-negotiable context)

### Weighting difference
| Subject | Kent | Bexley |
|---|---|---|
| Verbal/English | 33% | **50%** |
| Maths | 33% | 25% |
| NVR | 33% | 25% |

**Every 1% gained in vocabulary counts double for Bexley.** This shapes all priorities.

### Baseline mock (April 2026): 54% overall, target 85%
| Domain | Score | Gap | Priority |
|---|---|---|---|
| Vocabulary (Syn + Ant) | 39% | +46pp | 🔴 P1 Critical |
| Comprehension/Cloze | 59% | +26pp | 🟡 P2 Important |
| Maths | 60% | +25pp | 🟡 P3 Moderate |
| NVR | 58% | +27pp | 🟡 P3 Moderate |
| Verbal Reasoning | 64% | +21pp | 🟡 P3 Moderate |

**NVR deprioritised** — relative strength. SVG-based NVR deferred to August review if other domains on track.

---

## 3. App Version History

### v1.0 (built, untested by user)
- Student Mode: vocab practice (synonym + antonym), Leitner spaced repetition, session history, streak tracking
- Coach Mode: analytical dashboard (baseline, gap analysis, Leitner box counts, milestones, schedule), AI Advisor tab
- AI coaching on wrong answers (student), all answers (coach)
- Persistent storage via artifact storage API
- AI/non-AI toggle with graceful fallback
- Storage keys: `11plus:vocab-mastered`, `11plus:session-history`, `11plus:streak-data`

### v1.1 (built, tested)
- Three CTAs per answer option: 🔊 Pronounce, 📖 Definition, 💡 Simple Definition
- `simpleDefinition` field added to all 130 words in bank at the time — hand-written, ~reading age 8, static
- Aid buttons stop propagation; highlight gold when used
- Silent aid tracking: logs which aids used, on which option, whether correct, time taken
- Coach Mode: "Aid Usage" card showing unaided correct %, aided %, words needing most help
- AI Advisor system prompt includes unaided correct rate
- Storage keys upgraded to `-v1` suffix
- Session log schema: `{ date, correct, total, aidLog: [{ word, questionType, correct, timeMs, aidUsed, aids }] }`

### v1.1.1
- Aid buttons (🔊 📖 💡) added to the question word in the dark header
- Logged under `__question` key in aidLog
- Unaided correct on question word = strongest mastery signal (wired into v1.2a advancement)

### v1.1.2
- Option cards rebuilt: word on top, labelled aid buttons below
- `overflow:hidden` removed from `.opt-card` — was clipping definition reveals
- Aid buttons now have text labels matching question header style

### v1.1.3
- Click handling fixed — card click checks `e.target.tagName === "BUTTON"` before firing `onAnswer`
- Prevents aid button clicks accidentally submitting an answer
- `e.preventDefault()` added to aid button handlers

### v1.1.4
- `DISTRACTOR_DICT` added: 804 entries covering all synonym/antonym distractor values in the bank
- Sources: 322 API-scraped (dictionaryapi.dev), 402 manual, 80 original hand-crafted
- Each entry has `definition` and `simpleDefinition`
- `lookupWord(word)` helper: checks `WORD_MAP` first, falls back to `DISTRACTOR_DICT`, returns null if neither
- Option card definitions now display correctly for covered words

### v1.1.5
- `makeDistractors` fixed: now filters distractor pool to same POS as the correct answer
- Excludes the target word's own synonyms and antonyms from distractor pool
- Falls back to any POS only if same-POS pool is too thin (<6 words)
- Antonym questions now show plausible antonym distractors, not random adjectives

### v1.2.0
- **Four question formats:** synonym, antonym, definition-to-word, fill-in-the-blank
- **Format badge** moved to top-right of question header, larger, pill-shaped, colour-coded:
  - Synonym = blue, Antonym = orange, Definition = purple, Fill blank = green
- **Format-aware Leitner:** schema extended with `formats` object per word
- **`isMastered()`** now requires box >= 3 AND all available formats passed
- **`availableFormats()`** returns which formats a word supports based on its data
- **`nextFormatDue()`** picks the next format to serve based on Leitner history
- Definition questions: show definition as clue, pick the correct word from bank words
- Fill-blank questions: show example sentence with word blanked, pick the word
- Result block shows word + simpleDefinition for definition/fillblank question types
- `masteredCount` updated everywhere to use `isMastered()`

### v1.2.1 (built, tested by user ✅)
- **Format rotation fixed:** session queue now distributes formats at startup
- New words cycle through synonym → antonym → definition → fillblank across the queue
- Words with Leitner history use their Leitner-assigned next format
- All four badge colours visible in a single session from first play

### v1.2b
- **Vocab bank expanded:** 149 → **327 words** — 178 high-value Quest words added (earnest, cunning, feeble, majestic, tranquil, tyrant, etc.)
- **Vocab bank further expanded (May 2026):** 327 → **504 words** — 177 new entries added covering character adjectives (abject, adroit, belligerent, cantankerous, cynical, gregarious, imperious, irascible, obsequious, ostentatious, supercilious, taciturn, truculent, vivacious, whimsical…), verbs (admonish, allay, beguile, bolster, cajole, capitulate, castigate, dispel, elicit, embolden, evade, exonerate, fabricate, hamper, impede, mitigate, mollify, obliterate, ostracise, proclaim, relinquish, renounce, scrutinise, stifle, subjugate, surmount, tarnish, undermine, vanquish, vindicate…), and nouns (animosity, apathy, clemency, conscience, eloquence, empathy, enmity, forbearance, fortitude, guile, hubris, hypocrisy, indignation, lethargy, melancholy, mercy, negligence, perseverance, philanthropy, prejudice, tenacity, trepidation, vanity, zeal…). All entries pass the antonym quality bar from the May 2026 audit.
- **AI feature fixed:** Both `fetch()` calls replaced with `window.claude.complete(prompt, { system })`. No API key needed — the artifact environment provides authenticated access.
- **Timer UI added:** Live elapsed-seconds pill in stats row (green <20s, amber 20–30s, red >30s). Freezes to ✓ when answered.
- **QPM on completion screen:** Questions-per-minute calculated from `sessionLog.timeMs` totals, displayed alongside score/correct/review.
- VERSION bumped to `"1.2b"`

### v1.5b (current — built, Cowork artifact live ✅)
- **Fill-blank sentence overrides:** ~300 words now have sentences written specifically for fill-blank questions. Short (≤12 words target), concrete, one clearly correct answer. Stored in `fill-blank-examples.js`, injected at build time as `FILL_BLANK_EXAMPLES`. Falls back to `word.example` if no override exists.
- **`buildQuestion` updated:** uses `FILL_BLANK_EXAMPLES[word] || word.example` for fillblank. Regex now case-insensitive (`gi` flag).

### v1.5 (built, Cowork artifact live ✅)
- **ROOT_TIPS layer:** ~70 words have pre-researched hooks (Latin/Greek roots, sound associations, vivid images). Stored in `root-tips.js`, injected at build time as `ROOT_TIPS`. AI coaching prompt includes the hook when available — AI builds its tip around it rather than improvising.
- **`ROOT_TIPS` and `FILL_BLANK_EXAMPLES` stubs** defined in JSX, replaced by `build.js` at build time — same pattern as `callAI`.

### v1.4 (built, Cowork artifact live ✅)
- **Vocab bank expanded:** 504 → **648 words** — 144 new Exam Ninja entries added (abhorrent, acerbic, alacrity, antipathy, ardour, assuage, auspicious, bellicose, capricious, cathartic, coercion, complicity, culpable, decorum, duplicity, ebullient, ephemeral, equanimity, evanescent, furtive, garrulous, hackneyed, indomitable, insidious, laconic, lassitude, loquacious, maverick, mercurial, munificent, nefarious, obfuscate, officious, oscillate, panache, pedantic, perfunctory, pernicious, pugnacious, quintessential, rancour, rapacious, recalcitrant, reprehensible, resplendent, sagacious, serendipity, servile, spurious, subterfuge, surreptitious, ubiquitous, vacillate, vicarious, vitriolic, vociferous, and ~90 more). 8 already-present words skipped (formidable, haughty, magnanimous, mediocre, meticulous, nonchalant, pompous, wistful).
- **Multi-word antonyms/synonyms removed:** 16 entries fixed — all "tell the truth" style entries replaced with single-word equivalents.

### v1.3 (built, Cowork artifact live ✅)
- **30-second slow flag:** Amber banner on result card when question took >30s — shows exact time, prompts to aim faster
- **Timing card (Coach dashboard):** Avg time per question, per-format speed breakdown table (slowest format first), slow-words list (words answered in >30s, sorted by frequency)
- **Format progress table (Vocab card):** Per-word pip grid showing Syn/Ant/Def/Fill status — green=passed, red=pending, grey=N/A. Sorted by Leitner box descending. Scrollable.
- **currentTimeMs state:** Tracks answer time for the current question; fed from existing `timeMs` calculation in handleAnswer

### v1.2c (shipped ✅)
- **Platform:** App now runs as a Cowork artifact (`11plus-coach`). Self-contained HTML built from JSX source via `build.js` → Babel → Terser → `assemble.js`. ~388KB.
- **`callAI()` abstraction:** Single function wraps all AI calls. Tries `window.cowork.askClaude` first (Cowork, no key). Falls back to direct Anthropic API with user-supplied key stored in `localStorage('11plus:api-key')`. API key banner shown in standalone mode if no key stored.
- **Storage:** `window.storage` (Claude.ai) → `localStorage` in the built HTML.
- **AI coaching fixed (was silently broken):** `callAI` was not defined in the JSX — every answer threw a ReferenceError, caught silently, no coaching appeared. `callAI` is now defined in JSX as a `window.claude.complete` wrapper; build replaces it with the full Cowork/API version.
- **CoachAdvisor fixed:** Was still calling `window.claude.complete(history, { system: sys })` — now `callAI(history, sys)`.
- **Coaching prompt improved:** Completion-style format with `\nSentence:` cue. Student mode: max 15 words, one memory trick. Coach mode: 2 sentences, observation + action. Removes academic-analysis tone.
- **Build artefacts:** `build.js`, `assemble.js`, `node_modules/` in Claude outputs folder. Run `node build.js && node -e "babel..." && node -e "terser..." && node assemble.js` to rebuild.

---

## 4. Architecture (confirmed decisions — do not relitigate)

### Tech
- Single unified React JSX artifact (one file, no separate CSS/JS)
- **Source:** `11plus-coaching-app.jsx` (source of truth — edit this, rebuild to get new HTML)
- **Built output:** `11plus-coach.html` (~388KB self-contained) — also the Cowork artifact content
- **Cowork artifact ID:** `11plus-coach`
- Persistent storage: `localStorage` (built HTML) / `window.storage` (Claude.ai artifact fallback in JSX)
- Speech: `window.speechSynthesis`, lang `en-GB`, rate 0.85

### AI abstraction (`callAI`)
Defined in JSX as `window.claude.complete` stub. Build replaces it with:
1. `window.cowork.askClaude(system + '\n\n' + prompt, [])` — Cowork mode (Haiku, no key)
2. Direct Anthropic API (`claude-haiku-4-5-20251001`, max_tokens 100) — standalone mode, key from `localStorage('11plus:api-key')`

Coaching prompts use completion-style: end with `\nSentence:` to force single-sentence output from Haiku.

### AI vs Static split
- AI enhances, does not enable. App must work fully offline/AI-off.
- Simplified definitions: **pre-written static** (not AI-generated)
- AI layer: adaptive coaching on answers, advisor chat with real data in system prompt
- AI toggle visible in header. Graceful fallback if API call fails.

### Dual mode
- **Student mode:** Warm, encouraging, child-friendly. Explains WHY. Celebrates effort.
- **Coach mode:** Analytical, direct. Data-driven. Feedback templates. Progress metrics.

### Config separation (for future generalisation)
- `EXAM_CONFIG` — exam names, dates, weightings
- `BASELINE` — diagnostic scores
- `STORAGE_KEYS` — namespaced, versioned
- These are data, not logic. Swap them to support any exam/student without code changes.

---

## 5. Vocab Bank

### Current state
- **648 words** embedded in JSX (149 original + 178 Quest words + 177 new entries + 144 Exam Ninja entries, May 2026)
- **ROOT_TIPS:** ~70 entries in `root-tips.js` (outputs folder). Injected at build time. Extend by adding entries — no JSX change needed, just rebuild.
- **FILL_BLANK_EXAMPLES:** ~300 entries in `fill-blank-examples.js` (outputs folder). Same pattern. Falls back to `word.example` for uncovered words.
- Schema (stable — do not change): `{ word, definition, simpleDefinition, synonyms[], antonyms[], difficulty(1–5), pos, example }`
- `pos` field is critical — used by `makeDistractors` for same-POS filtering and by `availableFormats`/`buildQuestion` for definition and fill-blank options

### Distractor Dictionary
- **804 entries** in `DISTRACTOR_DICT` — words that appear as synonyms/antonyms of bank words but aren't target words
- Lightweight schema: `{ definition, simpleDefinition }` — display only, never tested, never tracked
- `lookupWord(word)` is the single entry point — always use this, never `WORD_MAP[word]` directly in components

### Scaling plan (content operation — not a code change)
| Phase | Bank target | Notes |
|---|---|---|
| Phase 1 (now) | 149 words ✅ | Complete |
| Phase 2 (done) | 300–500 words ✅ | **327 words** — Quest PDF cross-referenced, 178 added May 2026 |
| Phase 3 (done) | 500+ words ✅ | **504 words** — 177 new entries added May 2026. Character adjectives, verbs, nouns. All audited. |
| Phase 4 (done) | 648 words ✅ | **648 words** — 144 Exam Ninja entries added May 2026. All pass antonym quality bar. |

Add records to `VOCAB_BANK` array. Schema is stable. That's it.

---

## 6. Leitner System

6 boxes. Review intervals: Box 0 = immediate, 1 = 1 day, 2 = 3 days, 3 = 7 days, 4 = 14 days, 5 = 30 days.

Correct answer → advance one box. Wrong answer → back to Box 0 AND formats reset.

### Updated schema (v1.2.0+)
```
leitnerBoxes[word] = {
  box: 0–5,
  lastSeen: timestamp,
  formats: {
    synonym: timestamp | undefined,
    antonym: timestamp | undefined,
    definition: timestamp | undefined,
    fillblank: timestamp | undefined,
  }
}
```

### Mastery definition (v1.2.0+)
`isMastered(wordEntry, leitnerEntry)` — returns true when:
- `leitnerEntry.box >= 3` AND
- All formats returned by `availableFormats(wordEntry)` have a timestamp in `leitnerEntry.formats`

**Mastered = Box 3+ AND all available formats passed at least once.**

---

## 7. Question Formats

| Format | Badge colour | Clue shown | Correct answer | Options from |
|---|---|---|---|---|
| synonym | Blue | Question word | A synonym of the word | Other words' synonyms (same POS) |
| antonym | Orange | Question word | An antonym of the word | Other words' antonyms (same POS) |
| definition | Purple | The word's definition | The word itself | Other bank words (same POS) |
| fillblank | Green | Example sentence blanked | The word itself | Other bank words (same POS) |

### Session format distribution
- New words: cycled across formats in sequence at queue build time
- Words with Leitner history: served their `nextFormatDue` (least recently passed format)
- Session cap: 20 words per session

---

## 8. Files

| File | Location | Status |
|---|---|---|
| `11plus-coaching-app.jsx` | Project root | ✅ Source of truth — edit this, rebuild to deploy |
| `11plus-coach.html` | Project root | ✅ Built output / Cowork artifact content (~527KB) |
| `11plus-coach-<VERSION>.html` | Project root | ✅ Versioned backup written by assemble.js on each build |
| `build.js` | **Project root** | ✅ Injects callAI + ROOT_TIPS + FILL_BLANK_EXAMPLES → app-modified.jsx |
| `assemble.js` | **Project root** | ✅ Assembles clean single-copy HTML — always overwrites, never appends |
| `react.js` | Project root | ✅ React 18 UMD production (permanent — do not delete) |
| `reactdom.js` | Project root | ✅ ReactDOM 18 UMD production (permanent — do not delete) |
| `app-min.js` | Project root | ✅ Latest compiled + minified app (build artefact) |
| `root-tips.js` | Project root | ⚠️ ~70 Latin/Greek root hooks — recreate from last HTML if missing |
| `fill-blank-examples.js` | Project root | ⚠️ ~300 fill-blank sentences — recreate from last HTML if missing |
| `11plus-session-handover.md` | Project root | ✅ This file |
| `11plus-roadmap.md` | Project root | ✅ Living product roadmap |
| `11plus-coaching-context.md` | Project root | ✅ Full research doc (read-only) |

⚠️ **Build scripts now live permanently in the project root — NOT in the Claude outputs folder.** The outputs folder is volatile (wiped between sessions). Never store anything important there.

**The JSX file is the source of truth. Edit JSX → rebuild → update Cowork artifact.**

### Build pipeline (run from project root)
```
node build.js
./node_modules/.bin/babel --presets @babel/preset-react \
  --plugins @babel/plugin-proposal-optional-chaining,@babel/plugin-proposal-nullish-coalescing-operator \
  app-modified.jsx -o app-compiled.js
./node_modules/.bin/terser app-compiled.js -o app-min.js --compress --mangle
node assemble.js
```

If node_modules is missing:
```
npm install @babel/cli @babel/core @babel/preset-react @babel/plugin-proposal-optional-chaining @babel/plugin-proposal-nullish-coalescing-operator terser
```

⚠️ Use `./node_modules/.bin/babel` not `npx babel` — npx resolves to Babel 6 from cache and breaks on `?.` and `??`.

### What assemble.js guarantees
- Always writes a fresh file (never appends) — previous corruption was an appending bug, now fixed
- Fixes the ES module import (`import{...}from"react"` → `const{...}=React`) so the script runs in a plain `<script>` tag
- Writes `11plus-coach-<VERSION>.html` as a versioned backup alongside the main file
- Prints a verification summary (script tag count, import count, createRoot count)

### Versioning / rollback
Git is initialised in the project folder. To roll back the JSX to a previous state:
```
git log --oneline          # find the commit
git checkout <hash> -- 11plus-coaching-app.jsx
node build.js && [babel] && [terser] && node assemble.js
```
To commit after a successful build:
```
git add 11plus-coaching-app.jsx app-min.js 11plus-coach.html
git commit -m "vX.Y — description"
```

---

## 9. Backlog

### v1.2c — ✅ SHIPPED (Cowork artifact live)

- Cowork artifact built and deployed (`11plus-coach`)
- `callAI()` abstraction: Cowork → standalone API-key fallback
- AI coaching unbroken: `callAI` now defined in JSX (was undefined → silent failure → no coaching)
- CoachAdvisor fixed: `window.claude.complete` → `callAI`
- Coaching prompts: completion-style with `\nSentence:` cue, max 15 words student / 2 sentences coach

### v1.3 — Next priority

#### Timer enhancements
- 30-second rule mode: flag questions >30s with a red warning on the result card
- Timing metrics card in Coach dashboard (avg time per question, slow-question list)
- Per-format speed breakdown (are definition questions slower than synonym ones?)

#### Vocab dashboard improvements
- Format breakdown per word — which of the 4 formats passed vs pending
- "Needs most time" word list using `sessionLog.timeMs` data

### UI note held from v1.2.0
- Format badge: make it even more prominent / consider additional visual treatment so there are no silly mistakes reading the question type

### Dashboard updates needed
- Format breakdown per word — which formats passed, which pending
- Useful coach data now mastery is multi-format

### Future / not yet built
- Maths, comprehension, shuffled sentences question banks
- Tutor feedback export (structured report per session)
- Registration deadline alerts
- Difficulty level progression
- Coaching tone calibration (untested with actual child)
- Spaced repetition across question formats at word level (partially done — full cross-session tracking in v1.2.0+)

### Product vision boundary (support, don't build yet)
- Exam region config
- Child profiles + initial assessment
- Multi-user roles
- Question bank authoring
- Tutor collaboration workflow

---

## 10. Dave's Preferences

- Directs AI to build. Prompt/review/iterate pattern.
- Prefers direct challenge over validation.
- Mildly dyslexic — shorter chunks, clear signposting. Never mention misspellings.
- Values clean architecture and separation of concerns.
- Product thinker — wants generalisation potential visible in MVP.
- Mind can scatter — hold to the stated plan, challenge drift directly.
- **Standing instruction:** Challenge directly. Hold to stated vision. Resist drift. Keep him on track.

---

*Handover version: 1.5b*
*App version: v1.5b*
*Next session: v1.6 — Age band expansion (difficulty 1–2 words for age 8–9) + difficulty filter in session queue. Also consider: extend rootTips and fill-blank-examples coverage.*
*Last updated: May 2026*
*Audit note: v1.5b shipped — fill-blank sentences rewritten (~300 words, one clear answer each). v1.5 ROOT_TIPS layer live (~70 words). Build pipeline: use ./node_modules/.bin/babel with --plugins @babel/plugin-proposal-optional-chaining,@babel/plugin-proposal-nullish-coalescing-operator. NOT npx babel (resolves to Babel 6).*
