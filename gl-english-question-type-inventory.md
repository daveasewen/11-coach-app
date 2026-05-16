# GL Assessment — English Question Type Inventory
*Synthesised from: English Familiarisation 1 & English Familiarisation 2 (© GL Assessment)*
*Date: May 2026 | Purpose: Inform app question bank design*

---

## Summary

GL Assessment English papers are structured in **four consistent sections** across both papers. The dominant section is reading comprehension (~47–52% of marks), testing a rich range of skills against a literary prose extract. The remaining three sections test spelling, punctuation, and grammar/cloze. All question types are multiple-choice (A–E), except spelling/punctuation which use A–D or N (no error).

The **biggest opportunity for the app** is the SPaG (Spelling, Punctuation & Grammar) and word-class sub-types — these are tractable to build at scale. Reading comprehension at full-passage level is hard to automate but vocabulary-in-context and literary device questions overlap directly with the existing Vocab domain.

---

## Paper Structure (Both Papers)

| Section | E1 Qs | E2 Qs | Format |
|---|---|---|---|
| Reading comprehension | 28 | 23 | 5-option MCQ (A–E) |
| Spelling error ID | 9 | 9 | 4 segments + N (no error) |
| Punctuation error ID | 9 | 8 | 4 segments + N (no error) |
| Grammar / cloze | 8 | 9 | 5-option MCQ (A–E) |
| **Total** | **54** | **49** | |

**Timing**: 50 minutes per paper.

---

## Section 1 — Reading Comprehension

Each paper presents a single literary prose extract (~45–62 lines, classic or contemporary fiction) followed by 23–28 questions. The questions are grouped into distinct sub-types that appear in both papers:

### Comprehension Sub-Types

| # | Sub-type | Description | Both papers | Buildable |
|---|---|---|---|---|
| 1 | **Literal retrieval** | Find a fact directly stated in the passage (e.g. "Where had the family kept their supplies?") | ✅ | ★ Hard — needs full passage context |
| 2 | **Inference** | Explain implied meaning / character motivation (e.g. "Why does the father compare himself to a prisoner set free?") | ✅ | ★ Hard — needs full passage context |
| 3 | **Vocabulary in context** | "What is another word for X?" / "What does X mean in this context?" — a synonym/definition question anchored to a quoted word | ✅ | ★★★★ Easy — overlaps with existing vocab bank |
| 4 | **Word class identification** | "What type of word is X?" — noun, verb, adjective, adverb, preposition | ✅ | ★★★★ Easy — fully generatable |
| 5 | **Literary device ID** | Identify simile, metaphor, personification, alliteration, onomatopoeia, repetition from a quoted phrase | ✅ | ★★★★ Easy — small fixed set of ~6 devices |
| 6 | **Author's intent / effect** | "Why might the author have written X?" / "Why is 'no one' repeated?" — effect of language choices | ✅ | ★ Hard — needs passage context |
| 7 | **Counting grammar in context** | "How many adjectives in this sentence?" | ✅ | ★★★ Medium — needs curated sentences |

**E1-only sub-types observed:**
- Identifying multiple words all of the same class in one question ("What type of words are the following? heavily, hard, vigorously, quickly, safely")

**E2-only sub-types observed:**
- "Which of these options is an adjective?" where all options end in -ing (testing that present participle ≠ always adjective)

### Passage characteristics
- Classic British fiction: Swiss Family Robinson (Wyss), Secret Garden (Burnett)
- Length: ~45–62 numbered lines
- Difficulty: Year 5–6 reading level, but vocabulary and inference demands are clearly 11+ level
- No poetry in these two papers (may appear in real tests)

---

## Section 2 — Spelling Error Identification

**Format**: A sentence is divided into 4 labelled segments (A, B, C, D) by bracket markers. Each numbered line either contains **one** spelling mistake somewhere in one segment, or **no mistake** (mark N). 9 questions per paper, presented as a continuous passage.

**Words misspelled in these papers (examples of difficulty level):**
- tournament (tornament) — E1
- received (recieved) — E1
- pursued (persued) — E1
- permission (permision) — E1
- compulsory (compulsery) — E1
- playful (playfull) — E1
- climbing (climing) — E1
- consistent (consistant) — E1
- anticipation (antisipation) — E2
- peaked (peeked used incorrectly, "peeked caps") — E2
- nowhere (knowhere) — E2
- plain (plane used incorrectly) — E2
- appearance (appearence) — E2
- difference (differance) — E2
- impersonation (impersonatian) — E2
- shepherded (sheperded) — E2

**Difficulty pattern**: common Year 5–6 words, mostly double-letter confusions, -tion/-sion endings, homophones, and vowel sequence errors.

---

## Section 3 — Punctuation Error Identification

**Format**: Same segment structure as spelling (A, B, C, D + N). Each line either has one punctuation mistake or none. 8–9 questions per paper.

**Punctuation error types seen:**
- Missing full stop at end of sentence
- Wrong question mark usage ("But how accurate is this." should be "…this?")
- Missing apostrophe (possessive or contraction): "suns harmful rays", "hadnt", "parents music"
- Missing comma (after introductory clause, in a series, after speech tag)
- Missing closing bracket
- Incorrect capital letter ("this Winter" — Winter shouldn't be capitalised)
- Missing comma before speech-tag
- Missing comma in parenthetical phrase

---

## Section 4 — Grammar / Cloze

**Format**: A short narrative passage (5–10 lines) with numbered blanks. For each blank, choose the best word or group of words from 5 options to complete the sentence grammatically and contextually.

**Grammar concepts tested:**

| Concept | Example (from papers) |
|---|---|
| Adjective form (comparative/superlative) | louder / loud / loudest |
| Correct pronoun | there / they're / their / those / them |
| Verb tense | was opened / will open / would open / had opened |
| Subject-verb agreement | is missing / has missed / misses / will miss |
| Subordinating conjunction | As / Because / Although / Before / Even as |
| Relative pronoun / preposition | next to / to which / onto / in between / from |
| Article | the / an / this / a / that |
| Adverb vs adjective | louder / loud / loudest |
| Verb form (participle vs infinitive) | daring / dared / to dare / having dared |
| Question tag | isn't it / won't it / will it / is it / could it |

---

## App Coverage Assessment

| Status | What we have |
|---|---|
| ✅ In app (v1.8) | Vocabulary synonyms / antonyms / definitions — directly overlaps with "vocabulary in context" comprehension sub-type |
| ❌ Not in app | All 4 English sections and all sub-types above |

---

## Priority Build Order for English Domain

### Tier 1 — Tractable, high signal, minimal content creation
These can be built quickly and test real skills:

**Word class identification** (both papers, easy)
Format: Present a sentence with one word highlighted — "What type of word is [X]?" — noun / verb / adjective / adverb / preposition.
Generatable: tag words in existing sentences. Could reuse existing vocab bank sentences.

**Literary device identification** (both papers, easy)
Format: Show a quoted phrase — "This is an example of…" — simile / metaphor / personification / alliteration / onomatopoeia / repetition.
Needs ~30–50 curated example phrases (one per device per difficulty band). Small, high-value set.

**Vocabulary in context** (both papers, easy)
Format: "What is another word for [X] as used in this context?"
Already have 731 vocab words. Just need to add sentence context to existing entries. Direct overlap with Vocab domain — same Leitner data could serve both.

### Tier 2 — Medium effort, high exam relevance

**Spelling error identification** (both papers)
Format: A sentence with 4 labelled segments — find the spelling mistake or mark "no mistake".
Needs a curated bank of ~120 sentences (each with a deliberate misspelling at one of 4 positions). Can generate N (no error) variants for free. Words to misspell: Year 5–6 statutory word list + common errors.

**Punctuation error identification** (both papers)
Format: Same segment structure, targeting punctuation errors.
Needs ~80 curated sentences with deliberate punctuation mistakes. The 8 error types above are a finite, trainable set.

**Grammar / cloze** (both papers)
Format: Short passage with blanks; choose best grammatical completion.
Partially generatable for specific grammar concepts (tense, pronoun choice, article). Needs ~60 curated cloze items.

### Tier 3 — Hard to scale without AI generation

**Reading comprehension** (both papers, ~50% of exam marks)
Full passage + questions is the hardest section to build at scale. Options:
- Use real public-domain texts (as GL does) — Swiss Family Robinson, Secret Garden, etc. are all out of copyright
- Build a curated bank of 10–15 passages with 15–20 questions each
- AI-generated questions against known passages (feasible — this is a good Opus use case)
- Sub-types 1 (literal), 2 (inference), 6 (author's intent) require full passage context
- Sub-types 3 (vocab in context), 4 (word class), 5 (literary device) can be surfaced as standalone questions without the full passage overhead

---

## Key Strategic Insights

**1. English ≠ VR in app architecture.** VR questions are largely standalone (one question = complete task). English comprehension requires a passage renderer — a full text displayed alongside questions. This is a non-trivial UI component but the passage can be scrollable and reused across many questions.

**2. The SPaG sub-types are the quick wins.** Word class ID, literary device ID, and vocabulary in context together represent ~30–40% of the non-comprehension content and can all be built without a passage renderer. These should be built first as standalone question types.

**3. Comprehension overlaps with Vocab.** "Vocabulary in context" questions in the comprehension section are essentially synonym questions with a sentence hint — exactly what our vocab domain already does. A child who drills vocab will directly improve their comprehension score.

**4. The grammar/cloze section tests KS2 grammar** (tenses, pronouns, conjunctions, articles). This is a gap we have no coverage for. For Alex's September deadline, this is worth addressing — it's algorithmically tractable for specific grammar concepts.

**5. Spelling difficulty is calibrated to Year 5–6 statutory word list.** The words that appear are not random — they map closely to words children are expected to know by the end of Year 6. This list is publicly available and gives us a ready-made difficulty-graded word bank.

---

## Papers Referenced
- English Familiarisation 1 (GL Assessment, 2017) — Code 6853 910
- English Familiarisation 2 (GL Assessment, 2017) — Code 6853 912
- English Parent's Guide (GL Assessment, 2017) — Code 6853 914
