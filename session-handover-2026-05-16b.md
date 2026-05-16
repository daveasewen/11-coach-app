# Session Handover — 16 May 2026 (v1.9 complete)

## Status: v1.9 shipped ✅ — Ready for v1.10 planning and build

---

## What was accomplished this session

v1.9 built and committed. Full VR expansion — 4 new question types, auto-rotation, tutor preview panel.

### What shipped in v1.9

| Area | Detail |
|---|---|
| **ANTONYM_BANK** | Built at startup from all 731 VOCAB_BANK words with antonyms; stable IDs (`vr-ant-[word]`); Leitner tracked |
| **SYNONYM_BANK** | Same pattern; stable IDs (`vr-syn-[word]`); Leitner tracked |
| **Letter sequences** | On-the-fly generator, difficulty 1–2, step patterns (+2,+3,-1,+4,-2,+5,-3); id:null → Leitner skipped |
| **Number sequences** | On-the-fly arithmetic generator, difficulty 1–2; distractors exclude shown sequence terms; id:null → Leitner skipped |
| **getDueVRQuestions()** | Now pulls from VR_BANK + ANTONYM_BANK + SYNONYM_BANK; injects 2+2 generated sequences per session |
| **Student auto-rotation** | Domain tiles replaced with single Practice button; `pickDomain()` strictly alternates vocab/VR based on last session |
| **Tutor Preview Qs tab** | Domain + type + difficulty selectors; generates any question type with correct answer shown; no Leitner tracking |
| **AI coaching** | Prompts extended for antonym_pair, synonym_pair, letter_sequence, number_sequence |
| **VRWordPair component** | Handles antonym_pair and synonym_pair rendering |
| **VRSequence component** | Handles letter_sequence and number_sequence rendering |
| **Leitner guard** | `if (!r.id) return` in handleSessionEnd — generated sequences never write to vrLeitnerBoxes |

---

## Current app state (v1.9, live ✅)

- **Vocab bank:** 731 words, 4 question formats (synonym, antonym, definition, fillblank), Leitner 6-box
- **VR:** 6 types — analogy, odd_one_out, antonym_pair, synonym_pair, letter_sequence, number_sequence
- **Maths:** not in app (deliberately deprioritised — Alex is strong, Bexley verbal weighting makes VR/vocab far higher impact)
- **NVR:** not in app (SVG renderer needed — August 2026 review)
- **Profiles:** birthdate, age-gated difficulty, reset progress
- **Leitner:** 6-box spaced repetition; vocab and VR tracked separately; generated questions not tracked
- **AI coaching:** callAI() → Haiku (Cowork) or direct Anthropic API fallback
- **Student flow:** auto-rotation (strict alternation vocab/VR); no domain picker
- **Tutor flow:** Dashboard, AI Advisor, Preview Qs

---

## v1.10 scope — what to build next

### VR types deferred from v1.9 (all algorithmic, on-the-fly generation)

These are the remaining high-priority GL paper types from the research inventory:

**1. Letters = Numbers arithmetic**
- Pattern: A=2, B=3, C=4 etc. (or a custom offset). Give a formula like `B × D − E = ?`
- Student must substitute letter values and compute
- Difficulty bands: Band 1 = single operation; Band 2 = two operations; Band 3–4 = three ops with brackets
- GL format: usually gives 3 equations to establish the rule, then asks a 4th

**2. Number bracket puzzles**
- Pattern: `3(18)6` / `5(35)7` / `4(?)4` — find the rule linking the outer numbers to produce the inner
- Rules seen in GL papers: multiply, add then multiply, square then add, etc.
- Band 1: simple multiply; Band 2: two-step; Band 3–4: square/power rules

**3. Number equation completion**
- Pattern: `9 × 2 ÷ 3 = 7 × 2 − ?`
- Both sides equal; student finds the missing number
- Band 1: single operation each side; Band 2: two operations; Band 3: BIDMAS required

**4. Letter analogy (code)**
- Pattern: `AB : CD :: PQ : ?` — letters shift by a consistent rule
- Different from word analogy — purely positional/alphabetic
- Band 1: +2 shift; Band 2: split shifts (A shifts +1, B shifts +3); Band 3: reverse or alternating

**5. Geometric/alternating number sequences** (extend existing generator)
- ×2, ×3, ÷2 sequences
- Alternating-rule sequences: +3 +5 +3 +5
- Interleaved two sequences: 2 5 4 10 8 20 → ?

### What Opus should do in v1.10

1. **Design the generation logic** for each of the 4 new VR types — think through edge cases, difficulty calibration, and distractor quality before writing code
2. **Extend generateNumberSequence()** with geometric and alternating patterns
3. **Implement** all new generators following the existing pattern (id:null, type string, sequence/correct/options/rule/difficulty)
4. **Add rendering components**: VRLettersNumbers, VRNumberBracket, VREquationCompletion, VRLetterCodeAnalogy — each needs a clear visual display
5. **Extend AI coaching prompts** for each new type

### Architecture reminder
- All new types: `id: null` → skip Leitner (generated on-the-fly, no stable ID)
- Add to VRSession queue injection (currently injects letter+number sequences; extend to include new types)
- Add to Preview Qs dropdown in `VR_PREVIEW_TYPES` array
- Extend AI prompt dispatcher in `handleAnswer`

---

## Key decisions already made (do not re-discuss)

- Maths domain: deliberately not in v1.10 — Alex strong, verbal is the priority
- Soft progression (80% band unlock): deferred again, not in v1.10
- Tutor domain weighting sliders: future version (noted in admin layer backlog)
- Auto-rotation: strict alternation, no student domain picker
- NVR: August 2026 review

---

## Build pipeline reminders

- Use `./node_modules/.bin/babel` NOT `npx babel` (npx resolves to Babel 6, breaks optional chaining)
- Dave commits to GitHub manually — provide commit summary only, never run git commands
- **You are on Opus** — use it for generation logic design and reasoning; Sonnet is fine for straightforward code once design is settled

---

## Alex context

- Kent Test + Bexley Selection Test, **September 2026**
- Strong at maths (deliberately deprioritised)
- Biggest gap: verbal (vocab + VR). Bexley 50% verbal weighting
- Younger sibling Layla also in scope eventually, lower urgency
