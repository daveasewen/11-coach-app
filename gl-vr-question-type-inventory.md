# GL Assessment — Verbal Reasoning Question Type Inventory
*Synthesised from: Verbal Skills Fam, VR Fam 1, VR Fam 2, VR Fam 3 (© GL Assessment); cross-referenced with CGP GL VR Papers 1 & 2 (2012, 2018)*
*Date: May 2026 | Purpose: Inform app question bank design*

---

## Summary

Across four GL Assessment familiarisation papers and two CGP GL VR cross-reference papers we identified **21 distinct VR question types**. Our current app bank (v1.8) contains only 2 types (analogy A:B::C:D, odd-one-out), and neither appears prominently in the GL pure-VR papers. The biggest gaps are the four types that appear in **all four GL papers**.

**CGP cross-reference note**: The CGP GL Papers confirmed all types from the GL familiarisation papers and added one new type (#21, number bracket puzzles). Types 9 (letters = numbers) and 16 (word fusion) were confirmed by CGP GL2 under different names ("letter-as-number algebra" and "word compound formation"). No CGP-exclusive types are worth adding beyond #21, as CGP uses a broadly consistent GL format.

---

## Master Question Type Table

| # | Type | Short description | Papers (of 4) | Buildable |
|---|---|---|---|---|
| 1 | **Hidden 3-letter word** | Word in CAPS has 3 letters removed — find them (e.g. CABE → BAG → CABBAGE) | VS, VR1, VR2, VR3 | ★★★ Medium |
| 2 | **Logic deduction** | Read facts; determine which sentence must/cannot be true | VS, VR1, VR2, VR3 | ★ Hard |
| 3 | **Antonym pairs** | Two groups of 3 words; pick one from each that are most opposite | VS, VR1, VR3 | ★★★★ Easy |
| 4 | **Letter sequences** | Find next pair of letters in alphabetical-pattern series | VS, VR1, VR2 | ★★★★ Easy (algorithmic) |
| 5 | **Hidden 4-letter word** | A 4-letter word is hidden across the end/start of two consecutive words in a sentence | VR1, VR2, VR3 | ★★ Hard |
| 6 | **Letter completion** [?] | Same single letter completes word before bracket AND begins word after bracket | VS, VR1, VR2 | ★★★ Medium |
| 7 | **Number sequences** | Find next number in arithmetic/geometric/interleaved series | VR1, VR3 | ★★★★ Easy (algorithmic) |
| 8 | **Analogy completion** | "X is to (a b c) as Y is to (d e f)" — pick one from each group | VR1, VR3 | ★★★ Medium |
| 9 | **Letters = numbers** | Letters stand for numbers; solve arithmetic, give answer as letter | VR2, VR3 | ★★★★ Easy (algorithmic) |
| 10 | **Odd-two-out** | Five words; three are related — find the TWO that don't belong | VR2, VR3 | ★★★ Medium |
| 11 | **Move a letter** | Move one letter from word 1 to word 2; both must make new valid words | VR1, VR3 | ★★ Hard |
| 12 | **Number/letter codes** | Four words + three number codes; decode/encode using the cipher | VR1, VR2 | ★★★ Medium (algorithmic) |
| 13 | **Word construction** | Three words form a middle word by extracting letters — apply same rule to second trio | VR1, VR2 | ★★ Hard |
| 14 | **Double meaning** | One word that fits equally well with both word pairs | VS, VR1 | ★★★ Medium |
| 15 | **Synonym pairs** | Two groups; pick one from each closest in meaning | VR2 | ★★★★ Easy |
| 16 | **Word fusion** | Two words (one from each group) join to make one compound/valid word | VR2 | ★★★ Medium |
| 17 | **Number equation** | Find missing number to make both sides of equation equal | VR2 | ★★★★ Easy (algorithmic) |
| 18 | **Letter analogy** | AB is to CD as PQ is to ? (alphabet position transformation) | VR3 | ★★★★ Easy (algorithmic) |
| 19 | **Word derivation** | Three word pairs share a rule; apply rule to complete the third pair | VR3 | ★★ Hard |
| 20 | **Alphabet code** | Given code for WORD, encode/decode another word (different shift per letter) | VR3 | ★★★ Medium (algorithmic) |
| 21 | **Number bracket puzzles** | Two rows show "a (b) c" — find hidden rule linking outer numbers to middle (e.g. multiply); apply to third row to find missing middle value | CGP GL1 | ★★★★ Easy (algorithmic) |

---

## Current App Coverage

| Status | Types |
|---|---|
| ✅ In app (v1.8) | Analogy A:B::C:D, Odd-one-out (5 words, pick 1 odd) |
| ❌ Not in app | All 20 types above |

Note: our A:B::C:D analogy format appears in the Verbal Skills paper as part of VR but does NOT appear as a question type in VR1/2/3. GL's pure VR papers favour the "X is to (a b c) as Y is to (d e f)" format instead.

---

## Priority Build Order

### Tier 1 — High frequency + buildable (do first)
These appear in 3-4 papers AND can be generated at scale:

**Antonym pairs** (3 papers, easy)
Format: `(word1 word2 word3) (word4 word5 word6)` — pick one from each group that are most opposite.
We already have 731 vocab words with antonyms. This is the lowest-effort, highest-return addition.

**Letter sequences** (3 papers, algorithmic)
Format: `UD VF WH XJ [?]` — find the next letter pair.
Fully generatable: define a transform rule, apply it programmatically, generate unlimited questions.

**Number sequences** (2 papers, algorithmic)
Format: `4 8 11 15 18 [?]` — arithmetic/geometric/interleaved series.
Same: fully generatable. Alex is strong at maths so these are quick wins on scoring.

**Synonym pairs** (1 paper but closely related to antonyms, easy)
Format: same as antonym pairs but closest in meaning.
Same word bank applies.

### Tier 2 — Medium difficulty but high exam relevance
These require more effort but appear consistently:

**Hidden 3-letter word** (all 4 papers — highest frequency of all)
Format: `The cat scratched him with his CS` → find BAG → C**BAG**S → CLAWS
Needs a curated sentence bank. Cannot be generated algorithmically. ~100 quality questions would be enough.

**Letters = numbers arithmetic** (2 papers)
Format: `If A=2, B=3, C=4, D=5, E=6; B×D−E−D = ?`
Fully algorithmic — generate random letter-to-number mappings and valid arithmetic expressions.

**Number equation completion** (1 paper)
Format: `9×2÷3 = 7×2−[?]`
Algorithmic — solve left side, generate right side structure, find missing value.

**Letter analogy** (1 paper)
Format: `AB is to CD as PQ is to [?]`
Algorithmic — define alphabet position transforms, apply consistently.

**Number bracket puzzles** (CGP GL1 — likely appears in real GL papers, not in fam set)
Format: `3 (18) 6 / 5 (35) 7 / 4 (?) 4` — find the hidden rule (here: multiply outer numbers), apply to the third row.
Fully algorithmic — enumerate rules (add, subtract, multiply, divide, square), generate parameter sets, verify unique answer. Closely related to number sequences and number equation types.

**Number/letter codes** (2 papers)
Format: Four words, three codes shown, one missing — work out cipher, find code/word.
Semi-algorithmic: generate word sets + bijective letter-to-digit mappings.

**Double meaning** (2 papers)
Format: `(permit allow) (rent hire)` → answer: "let"
Needs curated word sets. Closely related to vocab. High verbal ability signal — important for Bexley.

**Analogy completion "X is to Y"** (2 papers)
Format: `Big is to (small orange colour) as wide is to (apple red narrow)`
Needs curated relationship pairs. Different from our A:B::C:D format.

### Tier 3 — Harder to build, lower ROI
- Logic deduction (bespoke, hard to scale)
- Move a letter (needs curated word pairs)
- Word construction (complex letter extraction rules)
- Hidden 4-letter word (needs curated sentences)
- Word derivation (complex patterns)
- Word fusion (needs compound word bank)
- Odd-two-out (needs curated semantic groups)
- Alphabet code (different shift per question — medium effort, medium ROI)

---

## Key Strategic Insight

The GL VR papers are heavily weighted towards **pattern recognition** (letter/number sequences, codes, arithmetic) and **word relationship** questions (antonyms, synonyms, analogies, double meaning). The current app's A:B::C:D analogy and odd-one-out formats are more typical of Bond/CEM style papers than GL style.

For Alex's September deadline, the highest-impact additions ranked by (frequency × buildability × time-to-build):

1. Antonym pairs — days to build, uses existing vocab bank
2. Letter sequences — hours to build, fully algorithmic  
3. Number sequences — hours to build, fully algorithmic
4. Hidden 3-letter word — weeks to build, needs curated sentence bank (100 questions minimum)
5. Letters = numbers arithmetic — hours to build, fully algorithmic
6. Double meaning — weeks to build, needs curated word sets (~80 questions)

---

## Notes for App Architecture

- **New question types do NOT need to be a separate "Verbal Reasoning" domain** from the existing one — they should expand the existing VR domain's question pool.
- Each type needs its own component (like `VRAnalogy` and `VROddOneOut` already exist).
- The Leitner system works per question ID, so any new type slots straight in.
- Algorithmic types (sequences, arithmetic) can have `difficulty` mapped to complexity of the pattern/numbers.
- For types requiring word knowledge (antonyms, double meaning), difficulty should map to word frequency/complexity — same bands as vocab.

---

## Papers Referenced
- Verbal Skills Familiarisation (GL Assessment, 2024) — Code 6853 946
- Verbal Reasoning Familiarisation 1 (GL Assessment, 2017) — Code 6853 920
- Verbal Reasoning Familiarisation 2 (GL Assessment, 2017) — Code 6853 922  
- Verbal Reasoning Familiarisation 3 (GL Assessment, 2019) — Code 6853 924

**Cross-reference (CGP, GL format):**
- CGP 11+ Verbal Reasoning Sample Paper for GL — Paper 1 (2012 edition) + Mark Scheme
- CGP 11+ Verbal Reasoning Sample Paper for GL — Paper 2 (2018 edition) + Mark Scheme
