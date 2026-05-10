# 11+ Coach App — Product Roadmap & Spec

*Living document. Update this alongside the session handover after every significant change.*
*Last updated: May 2026 — v1.5c JSX complete, rebuild pending*

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

## Current State — v1.5 (Shipped ✅)

- **Vocab bank:** 648 words (149 original + 178 Quest words + 177 new entries + 144 Exam Ninja entries, May 2026)
- **Etymology + mnemonic layer:** ~70 words have `rootTip` hooks (Latin/Greek roots, sound associations, vivid images) — fed into AI coaching prompt when a word is answered
- **ROOT_TIPS object:** Injected at build time from `root-tips.js`. Separate from VOCAB_BANK schema — easy to extend
- **4 question formats:** synonym, antonym, definition, fill-in-the-blank
- **Leitner spaced repetition:** 6 boxes, format-aware mastery (box ≥3 AND all formats passed)
- **Aid buttons:** Pronounce, Definition, Simple Definition (on question word + each option)
- **Timer UI:** live elapsed-seconds pill (green/amber/red), QPM on session completion
- **30-second slow flag:** amber warning banner on result card when question took >30s
- **Timing card (Coach):** avg time per question, per-format speed breakdown, slow words list
- **Format progress table (Coach):** Syn/Ant/Def/Fill pip indicators per word in Vocabulary card
- **AI coaching:** student mode (memory tricks, max 2 sentences) + coach mode (observation + action)
- **Platform:** Cowork artifact (`11plus-coach`), self-contained HTML built from JSX source
- **Storage:** localStorage in built HTML

---

## Roadmap

### v1.3 — Timer + Dashboard ✅ (Shipped May 2026)

**Goal:** Surface timing data so slow questions can be identified and targeted.

| Feature | Priority | Notes |
|---|---|---|
| 30-second rule mode | High | ✅ Amber flag on result card when >30s, shows time taken |
| Timing metrics card (Coach) | High | ✅ Avg time, per-format breakdown, slow words list |
| Per-format speed breakdown | Medium | ✅ Sorted table: slowest format first |
| Format breakdown per word (Vocab dashboard) | Medium | ✅ Pip indicators (Syn/Ant/Def/Fill) per word, scrollable |

### v1.4 — Content Quality Pass

**Goal:** Fix known data quality issues before scaling the bank further.

| Feature | Priority | Notes |
|---|---|---|
| Antonym/synonym accuracy audit | ~~High~~ | ✅ Done May 2026 — 25 corrections, all 327 words reviewed. |
| Vocab bank scaling to 500+ words | ~~Medium~~ | ✅ Done May 2026 — 504 words. 177 new entries added (character adjectives, verbs, nouns). All pass antonym quality bar. |
| Multi-word antonym removal | ~~High~~ | ✅ Done May 2026 — 16 entries fixed, all multi-word synonyms/antonyms replaced with single-word equivalents. |

### v1.5 — Enhanced Coaching (Etymology + Mnemonics)

**Goal:** Give the AI coach real ammunition — pre-researched roots, mnemonics, and hooks — so it stops generating generic analysis and starts giving memory tricks that actually stick.

**Why this matters:** Root knowledge is a decoding skill, not just a memory trick. A student who knows *vivere* (to live) gets vivacious, vivid, revive, survive, convivial for free. That transfers into comprehension and verbal reasoning, not just vocab recall. Pre-built hooks are also far more reliable than AI-improvised ones — the AI's job becomes incorporating a specific anchor, not inventing one from scratch.

**Three-layer design:**

| Layer | What | Notes |
|---|---|---|
| Content research | Latin/Greek roots per word — root meaning, 2–3 sibling words that share it | Deep research task. Do pilot batch first (60–80 words with clearest roots) |
| Mnemonic hooks | One sharp sentence per word — root explanation OR vivid image OR sound trick | Hand-crafted, not AI-generated. Max 15 words, age-appropriate |
| Schema extension | Add optional `rootTip` field to VOCAB_BANK entries | Schema stays backward compatible — field is optional |
| Code integration | Pass `rootTip` into AI coaching prompt when available | Small code change. AI builds on the hook rather than improvising |

**Root patterns to research (pilot batch — highest leverage):**

| Root | Meaning | Words in bank |
|---|---|---|
| *vivere* (Latin) | to live | vivacious, convivial |
| *grex/gregis* (Latin) | flock, group | gregarious |
| *supercilium* (Latin) | eyebrow | supercilious |
| *animus* (Latin) | spirit, mind | animosity, magnanimous |
| *cred-* (Latin) | believe | credulous |
| *fort-* (Latin) | strong | fortitude |
| *viv-/vinc-* (Latin) | conquer | vanquish, vindicate |
| *sequ-* (Latin) | follow | obsequious |
| *fall-/fals-* (Latin) | fail, deceive | fallible, infallible |
| *greg-* (Latin) | assemble | gregarious |
| *loqui-* (Latin) | speak | eloquence |
| *phil-/anthrop-* (Greek) | love / human | philanthropy |
| *hyp-/hybris* (Greek) | excessive pride | hubris |
| *zelos* (Greek) | fervor | zeal |
| *chron-* (Greek) | time | not many — skip |
| *clem-* (Latin) | mild | clemency |
| *cap-/capit-* (Latin) | head | capitulate |
| *jud-* (Latin) | judge | judicious, prejudice |
| *mit-* (Latin) | soften | mitigate |

**Mnemonic patterns (where no clear root):**

- Sound association: *taciturn* → "taci-TURN-ing their back on every conversation"
- Visual image: *supercilious* → eyebrow raised at everyone (built into the Latin)
- Story hook: *cantankerous* → "can't anchor us" — impossible to pin down, always arguing
- Contrast pair: *fallible* vs *infallible* — teach together, one cancels the other

**Sequencing:**
1. Research phase — content operation, can run in parallel with v1.4 code work
2. Pilot integration — add `rootTip` to 60–80 words, wire into coaching prompt, test
3. Full rollout — remaining words, filling gaps where no root hook is available

### v1.6 — User Profiles

**Goal:** Support more than one user without data collision. Must be done before a second person (sibling, tutor, etc.) uses the app — sharing a single flat storage namespace would silently corrupt both users' Leitner data.

**Why now:** Dave's son's progress is real and being saved. Adding a second user without profiles would overwrite it.

**Scope — targeted, not a rebuild:**

| Feature | Priority | Notes |
|---|---|---|
| Profile selector on launch | High | Simple screen: pick your name. Two profiles to start (Dave's son + one spare). |
| Per-user storage key prefix | High | `11plus:user:<id>:vocab-mastered` etc. Single-line change per storage key. |
| Profile creation | Medium | Add name, select avatar/colour. Stored in `11plus:profiles`. |
| Active profile in app header | Medium | Small indicator so it's always clear whose session this is. |

**What doesn't change:** Leitner logic, question formats, vocab bank, AI coaching — all unchanged. This is purely a storage namespace + UI wrapper.

### v1.7 — Age Band Expansion (Ages 8–9)

**Goal:** Make the vocab bank useful for younger siblings and earlier-stage prep. No architecture changes needed — difficulty field already exists on every word.

**Why this fits the product vision:** "Built for one child, architected to generalise." The difficulty(1–5) field in the schema is the hook. Words already in the bank skew difficulty 3–4 because that's where the 11+ gap was. Covering 8–9 year olds is a content operation + one small code filter.

**Age → difficulty mapping:**

| Age | Difficulty band | Description |
|---|---|---|
| 8 | 1–2 | Words they're learning to read fluently — clear, concrete meanings |
| 9 | 2–3 | Bridging vocab — starting to encounter in books and comprehension |
| 10–11 | 3–5 | Current bank focus — 11+ exam vocabulary |

| Feature | Priority | Notes |
|---|---|---|
| Age 8 word bank (difficulty 1–2) | Medium | ~200 words. The Exam Ninja words we filtered as "too easy for 11+" are a ready starting point |
| Age 9 word bank (difficulty 2–3) | Medium | ~150 words. Bridge band — overlap with current bank at the lower end |
| Difficulty filter / level selector | Medium | Small code change — filter session queue to difficulty band matching the child's age. Schema already supports it |

**Note:** The ~85 Exam Ninja gap words filtered from v1.4 (judged too simple for 11+) are exactly right for the 8–9 band. That list is a near-complete starting point for difficulty 1–2.

### v1.8 — New Question Domains

**Goal:** Start coverage of non-vocab domains.

| Feature | Priority | Notes |
|---|---|---|
| Maths question bank | Medium | 25% Bexley weighting — start after vocab quality locked |
| Comprehension/Cloze | Medium | 59% baseline, meaningful gap to close |
| Shuffled sentences (Verbal Reasoning) | Low | 64% baseline, lowest gap |

### Future / Not Committed

- Standalone hosting (Netlify/GitHub Pages)
- Exam region config (generalise beyond Kent/Bexley)
- Child profiles + initial assessment
- Multi-user support
- Tutor collaboration workflow
- Difficulty level progression
- Coaching tone calibration (untested with actual child)
- Question bank authoring UI

---

## Known Issues

| Issue | Severity | Status | Notes |
|---|---|---|---|
| Antonym/synonym accuracy | High | ✅ Fixed (May 2026) | 25 corrections across all 327 words. Multi-word phrases removed, imprecise antonyms cut, 3 words had antonym field removed entirely (retort, feign, manipulate — no clean single-word antonym exists). |
| AI coaching — old prompts too academic | Fixed ✅ | Shipped in v1.2c + prompt tightening May 2026 | Student: concrete examples, no comparisons. Coach: 2 sentences, no waffle. |
| Format badge visibility | Low | 🟡 Backlog | Make format badge more prominent — silly mistakes reading question type |

---

## Data / Content Operations

These are content tasks, not code tasks. Run as separate operations.

| Task | Status | Notes |
|---|---|---|
| Original 149-word bank | ✅ Done | Hand-crafted, reviewed |
| Quest PDF cross-reference (178 words) | ✅ Done | May 2026 |
| Antonym/synonym accuracy audit | ✅ Done (May 2026) | 25 corrections across all 327 words. Single-word, precise antonyms enforced. |
| Distractor dictionary (804 entries) | ✅ Done | Used for option card definitions |
| Scale to 500+ words | ✅ Done (May 2026) | 504 words. 177 new entries — character adjectives, verbs, nouns. All entries audited against antonym quality bar. |
| Exam Ninja 1800-word list cross-reference | ✅ Done (May 2026) | 144 new entries added from cross-reference against 1800-word list. Bank now 648 words. |

**Vocab bank schema (stable — do not change):**
`{ word, definition, simpleDefinition, synonyms[], antonyms[], difficulty(1–5), pos, example }`

**Quality bar for antonyms:** Single word. Directly opposite in meaning (not associatively related). Same or compatible POS with the target word. Age-appropriate for 10–11 year olds.

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
| Etymology/mnemonic layer planned for v1.5 | Pre-built root tips beat AI-improvised hooks — AI should build on an anchor, not invent one. Schema extension (optional `rootTip` field) keeps it backward compatible. | May 2026 |
| Tightened coaching prompts (student mode) | Ban "however"/"while", require concrete examples, no word comparisons | May 2026 |
| Antonym quality: must be precise not associative | "reveal" as antonym of "delude" accepted by app but pedagogically weak — triggers full audit | May 2026 |

---

## Product Principles

1. **Exam-outcome driven.** Every feature decision traces back to what moves the score.
2. **SLC/MLP standard.** Ship lean, maintain quality, avoid premature complexity.
3. **AI enhances, does not enable.** Core practice works without AI. AI adds coaching layer.
4. **Backlog items are tracked, not ignored.** Explicit deferral is a decision.
5. **Architecture supports generalisation.** Don't build it. Don't foreclose it.
6. **Challenge drift.** If a feature doesn't trace to exam outcome, question it directly.
