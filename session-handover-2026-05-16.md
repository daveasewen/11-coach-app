# Session Handover — 16 May 2026

## Status: Research phase COMPLETE. Ready for v1.9 build planning.

---

## What was accomplished this session

This was a pure research session. No code was written. Three inventory documents were created/updated to map every GL Assessment question type across all shared papers.

### Inventories now complete

| File | Contents | Status |
|---|---|---|
| `gl-vr-question-type-inventory.md` | 21 VR question types across 4 GL fam papers + 2 CGP GL cross-ref papers | ✅ Complete |
| `gl-maths-question-type-inventory.md` | 75 topic types across 125 questions from 3 Maths papers | ✅ Complete |
| `gl-nvr-maths-question-type-inventory.md` | NVR S1 (10 transformation types) + NVR S2 (shape code attributes) + 25Q combined Maths | ✅ Complete |

---

## Key findings to carry into v1.9 planning

### VR (21 types identified)

**Biggest quick-wins (algorithmic, no content curation needed):**
- Letter sequences (e.g. UD VF WH XJ → ?)
- Number sequences (arithmetic/geometric/interleaved)
- Letters = numbers arithmetic (A=2, B=3 → B×D−E = ?)
- Number bracket puzzles (3(18)6 / 5(35)7 / 4(?)4 — find rule)
- Number equation completion (9×2÷3 = 7×2−?)
- Letter analogy (AB:CD :: PQ:?)

**Biggest content-dependent wins (needs curated words but uses existing vocab bank):**
- Antonym pairs — ALREADY HAVE 731 words with antonyms → lowest effort, highest return
- Synonym pairs — same bank applies
- Double meaning — needs ~80 curated sets

**Currently in app:** only A:B::C:D analogy and odd-one-out (wrong format for GL papers)

### Maths (build priorities)

**Tier 1 — text-only, ~500 questions achievable before any image assets:**
Place value, sequences, algebra/missing number, fractions (multi-step), percentages, ratio & proportion, powers & square numbers, unit conversion (all types), time (12hr/24hr/elapsed), Roman numerals, money calculations, BIDMAS, prime/factor/multiple, rounding, negative numbers, mental arithmetic strategies

**Tier 2 — HTML table (no images):**
Timetable reading, pricing/conditional tables, Venn diagrams

**Tier 3 — needs chart renderer or image assets:**
Bar charts, line graphs, pie charts, pictograms, coordinates

**Not in scope yet:** NVR (needs SVG shape renderer — separate infrastructure sprint, target August 2026 review)

### Difficulty bands (Maths)
- Band 1 (Q1–15 of dedicated papers): basic reading — charts, units, clock, area
- Band 2 (Q16–30): one-step reasoning — conditional tables, timetable, %, missing number
- Band 3 (Q31–40): upper KS2 — square numbers, decimals, unit conversion, powers, Roman numerals
- Band 4 (Q41–50): multi-step — fractions, ratio, word problems, strategy

The combined NVR+Maths paper (25Qs) maps: Q41–47 → Band 1, Q48–55 → Band 2, Q56–60 → Band 3, Q61–65 → Band 4.

---

## Current app state (v1.8, live ✅)

- **Vocab bank:** 731 words, 4 question formats (synonym, antonym, definition, fillblank)
- **VR:** A:B::C:D analogy + odd-one-out (seed bank, not domain-ready)
- **Maths:** not in app
- **NVR:** not in app
- **Profiles:** birthdate, age-gated difficulty, reset progress
- **Leitner 6-box** spaced repetition across all question types
- **AI coaching:** callAI() → Haiku (Cowork) or direct Anthropic API fallback
- Cowork artifact ID: `11plus-coach`

---

## What to do in the next session

**Agenda: v1.9 build planning**

Suggested questions to resolve before writing any code:

1. **Domain to add first:** VR question types OR Maths questions? (VR antonym pairs is the fastest; Maths Tier 1 text-only is highest volume)
2. **VR architecture:** New question types need new React components (`VRLetterSequence`, `VRNumberSequence`, `VRLettersNumbers`, etc.). Do we add all algorithmic types in one sprint or stage them?
3. **Maths architecture:** Maths needs its own domain alongside Vocab/VR. How does the student switch domains? Auto-rotation, domain picker, or profile-configured?
4. **Question generation:** Algorithmic types (sequences, letter codes, number brackets) should generate on-the-fly rather than from a static bank. Does the existing question interface support this, or does it need adapting?
5. **Soft progression:** Mastery-triggered band unlock (80% threshold, auto-tune ±5%) — was deferred from v1.7. Does this go into v1.9 or stay deferred?

---

## Deferred / backlog (unchanged)

- **Soft progression** — mastery-triggered next-band unlock, 80% threshold, auto-tune ±5% — discuss before v1.9 kicks off
- **Admin layer** — reset button shipped in v1.7; full management panel (export, overrides, config) deferred
- **NVR** — shape renderer infrastructure, target August 2026 review
- **Standalone hosting** — Netlify/GitHub Pages, not prioritised
- **Multi-child profiles** (Layla) — future

---

## Build pipeline reminders

- Use `./node_modules/.bin/babel` NOT `npx babel` (npx resolves to Babel 6, breaks optional chaining)
- Dave commits to GitHub manually — Claude provides commit summary only, never runs git commands
- **Switch to Opus** for question bank generation and open-ended reasoning; Sonnet for code

---

## Alex context

- Kent Test + Bexley Selection Test, **September 2026**
- Strong at maths (deprioritised, but Maths Tier 1 still worth adding for completeness)
- Biggest gap: verbal (vocab + VR). Bexley 50% verbal weighting.
- Younger sibling Layla also in scope eventually, lower urgency
