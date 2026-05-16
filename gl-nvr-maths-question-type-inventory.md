# GL Assessment — Non-Verbal Reasoning & Mathematics Question Type Inventory
*Synthesised from: NVR & Maths Test Booklet (© GL Assessment 2024), Parent's Guide, Answer Sheet*
*Code: 6853 948 | Date: May 2026 | Purpose: Inform app question bank design*

---

## Summary

GL Assessment NVR & Mathematics is a **single combined paper** (~1 hour). It opens with two NVR sections (40 questions, ~20 min) followed by one Mathematics section (25 questions, ~30 min). The NVR sections are purely visual — abstract shape tasks with no text — making them the hardest domain to build in a web app. Mathematics covers the full KS2 National Curriculum in 25 questions of increasing difficulty, mapping cleanly to the existing difficulty band system.

**The biggest opportunity for the app** is Mathematics: algorithmically tractable, well-mapped to curriculum, and directly buildable with the existing MCQ infrastructure. NVR is the highest-effort domain — it requires custom shape-rendering infrastructure before any questions can be displayed.

---

## Paper Structure

| Section | Questions | Timing | Format |
|---|---|---|---|
| NVR Section 1 — Shape Analogies | Q1–20 (20 Qs) | ~10 min | 5-option MCQ (A–E) |
| NVR Section 2 — Shape Codes | Q21–40 (20 Qs) | ~10 min | 5-option MCQ (A–E) |
| Mathematics | Q41–65 (25 Qs) | ~30 min | Varies (MCQ, single value, unit) |
| **Total** | **65** | **~1 hour** | |

**Paper code**: 6853 948 (2024 edition — most recent available)

---

## NVR Section 1 — Shape Analogies

**Format**: Shape1 → Shape2 :: Shape3 → ? (pick from A–E)
Each question presents an analogy: a transformation rule is demonstrated by Shape1→Shape2, and the student must apply the same rule to Shape3 to select the correct output.

### Transformation Types Observed (Q1–20)

| # | Transformation | Description | Frequency |
|---|---|---|---|
| 1 | **Rotation 180°** | Shape flipped upside-down / point reversed | Common |
| 2 | **Rotation 90°** | Shape turned a quarter-turn clockwise or anticlockwise | Common |
| 3 | **Reflection** | Shape mirrored horizontally or vertically | Common |
| 4 | **Shading reversal** | Black shapes become white; white shapes become black | Common |
| 5 | **Line style change** | Solid outlines become dashed (or vice versa) | Occasional |
| 6 | **Size scaling** | Shape grows or shrinks; proportions preserved | Occasional |
| 7 | **Decomposition** | One composite shape separates into component parts | Occasional |
| 8 | **Composition** | Two separate shapes combine into one | Occasional |
| 9 | **Element addition/removal** | Decorating elements (dots, lines, arrows) added or removed | Occasional |
| 10 | **Orientation flip** | Directional shape (arrow, chevron) reverses direction | Occasional |

### NVR S1 Answer Key (for reference)
Q1–20: E, E, C, E, D, B, C, D, E, E, A, B, C, B, B, C, E, A, B, E

### App Buildability Assessment

Building NVR S1 requires:
1. A **shape renderer** capable of displaying abstract 2D shapes with configurable fill, size, rotation, and line style
2. A **transformation engine** that applies rules consistently across shape pairs
3. A curated library of shape/transformation combinations — not generatable without the renderer

**Rating: ★ Very hard.** Not feasible until a shape rendering infrastructure is built. This is a prerequisite gating all NVR content.

---

## NVR Section 2 — Shape Codes

**Format**: 3–4 reference shapes are shown, each labelled with a two-letter code (one letter on top, one on bottom). The top letter and bottom letter each encode a different visual attribute. Students decode the system from the reference set, then find the correct two-letter code for a test shape.

### Attributes Used as Code Dimensions (Q21–40)

| Attribute | Values seen |
|---|---|
| Shape type | Circle, triangle, square, hexagon, pentagon, star, cross |
| Fill / shading | White (hollow), striped/hatched, solid black, grey |
| Size | Large, small (sometimes medium) |
| Orientation | Pointing up, down, left, right |
| Number of internal elements | 0, 1, 2 dots or internal shapes |
| Line style | Solid, dashed |
| Arrow rotation | Clockwise, anticlockwise |
| Inner vs outer shape | What shape is inside vs outside (compound shapes) |

### Difficulty progression within S2
Early questions (Q21–25) use 2 attributes (shape type + fill). Later questions (Q35–40) use 3 attributes or compound shapes with inner/outer coding. The two-letter code must be decoded correctly on both dimensions simultaneously.

### NVR S2 Answer Key (for reference)
Q21–40: C, E, B, E, B, D, E, A, C, E, C, A, A, C, A, D, B, C, E, A

### App Buildability Assessment

NVR S2 is **harder than S1** from a rendering standpoint: students must see 3–4 reference shapes simultaneously alongside a test shape, all with precise visual attributes. The attribute-decoding mechanic also requires careful UI design so that the relationship between code letters and attributes is explorable.

**Rating: ★ Very hard.** Same infrastructure dependency as S1. May be worth scoping as a separate phase even after S1 is built.

---

## Mathematics — Full Topic Inventory

**Format**: 25 questions in increasing difficulty order. Questions draw from across the full KS2 National Curriculum. Most are 5-option MCQ but some accept a numerical answer directly. Timing: ~30 minutes.

### Complete Question-by-Question Inventory

| Q# | Topic Area | Skill Tested | Answer |
|---|---|---|---|
| 41 | Data — pictogram | Read pictogram (symbol = 12 units), compare two categories | 6 |
| 42 | Number — place value | Identify value of a digit in a 4-digit number | 7 thousands |
| 43 | Measurement — length | Unit conversion + decimal addition (m + cm → m) | 1.45 m |
| 44 | Measurement — capacity | Subtraction with units (1 litre − 700 ml) | 0.3 litres |
| 45 | Data — bar chart | Read 3 bars, sum values | 7.5 h |
| 46 | Geometry — area | Count unit squares in a rectangle (6 × 3 cm) | 18 |
| 47 | Measurement — time | Convert 12-hour (quarter past 7 pm) to 24-hour clock | 19:15 |
| 48 | Data — table / conditional logic | Read pricing table with conditions, calculate correct tier | £46.50 |
| 49 | Geometry — shape classification | Identify which shape is NOT a quadrilateral (pentagon) | A |
| 50 | Measurement — time | Read timetable, calculate time difference | 16 min |
| 51 | Number — percentage | What % of £5 is 50p? | 10% |
| 52 | Geometry — angles | Classify an angle as acute / right / obtuse / reflex | Obtuse |
| 53 | Number — division (missing number) | 105 ÷ □ = 21 | 5 |
| 54 | Number — multi-step problem | Membership payback calculation (division + comparison) | 5 visits |
| 55 | Data — line graph | Read line graph (population over time), find year for doubled value | 1875 |
| 56 | Number — number properties | Identify what property 9, 36, 81 share (square numbers) | Square numbers |
| 57 | Number — decimal addition | 37.5°C + 3°C | 40.5 |
| 58 | Measurement — mass / unit conversion | 5 × 800g → answer in kg | 4 kg |
| 59 | Number — powers | 3² = ? | 9 |
| 60 | Number — Roman numerals | XXVI × XLI = 1066 = ? in Roman numerals | MLXVI |
| 61 | Geometry / Number — word problem | Frog halving distance over 3 jumps, find position from edge | 75 cm |
| 62 | Number — mental arithmetic strategy | 27 × 99 = 27 × (100 − 1) → identify correct method | 27 × 100 − 27 |
| 63 | Number — fractions (multi-step) | Ali eats ⅓, sister eats ¼ of remainder, find fraction left | ½ |
| 64 | Measurement — multi-step (time + weight) | Cooking time 2½ hours, find weight from cooking chart | 1.8 kg |
| 65 | Number — ratio / proportion | 2:17:1 ratio paint mix, find amount of red in 40 litres | 4 litres |

### Topic Distribution Summary

| Topic Area | Question Count | % of section |
|---|---|---|
| Number (arithmetic, fractions, ratio, place value) | 11 | 44% |
| Measurement (time, length, capacity, mass) | 6 | 24% |
| Data handling (charts, tables, graphs) | 5 | 20% |
| Geometry (shapes, area, angles) | 3 | 12% |

### Difficulty Bands (approximate)
- **Q41–47** (Band 1): Basic reading — charts, units, clock, area
- **Q48–55** (Band 2): One-step reasoning — conditional table, timetable, percentage, missing number
- **Q56–60** (Band 3): KS2 upper tier — square numbers, decimals, unit conversion, powers, Roman numerals
- **Q61–65** (Band 4): Multi-step problems — fractions, ratio, word problems, strategy selection

---

## App Coverage Assessment

| Domain | Status |
|---|---|
| NVR — Section 1 (shape analogies) | ❌ Not in app — needs shape renderer |
| NVR — Section 2 (shape codes) | ❌ Not in app — needs shape renderer + multi-shape layout |
| Maths — Data handling | ❌ Not in app (charts require image assets or renderer) |
| Maths — Number & calculation | ❌ Not in app (but algorithmically buildable) |
| Maths — Measurement | ❌ Not in app (but algorithmically buildable) |
| Maths — Geometry | ❌ Not in app (shape recognition Qs need diagrams) |

---

## Priority Build Order

### Tier 1 — Algorithmically tractable, text-only (no renderer needed)

These Maths topics can be generated as pure text MCQ or fill-in-the-blank:

- **Place value** — "What is the value of [digit] in [number]?" — trivially generatable
- **Percentages** — "What % of £X is £Y?" — parameterisable
- **Fractions (multi-step)** — parameter-driven word problems (start quantity → fraction eaten → fraction remaining)
- **Ratio & proportion** — ratio stated, total stated, find one part — generatable
- **Powers and square numbers** — small fixed set (2²–12²), fully enumerable
- **Missing number / division** — a × □ = b — generatable across all factor pairs
- **Unit conversion (text-only)** — m↔cm, kg↔g, l↔ml — generatable with number parameters
- **Time (clock reading / 24-hour)** — generatable for all times of day
- **Roman numerals** — fully enumerable for I–MMCCC range
- **Mental arithmetic strategies** — near-100 multiplication, rounding — small curated set

**Suggested initial bank**: 20–30 questions per topic, graded across the 4 difficulty bands. This alone would give solid Maths domain coverage for Band 1–3 questions.

### Tier 2 — Needs data assets (charts, tables, timetables)

- **Pictogram reading** — requires image asset of the pictogram or SVG generator
- **Bar chart reading** — requires chart image or rendered bar chart
- **Line graph reading** — requires chart image or canvas-drawn graph
- **Timetable questions** — can be done as formatted HTML table (no image needed)
- **Pricing/conditional table** — same as timetable — structured table is sufficient

These are **medium effort**: timetable and pricing tables are pure HTML/CSS; chart types need either pre-made SVG assets or a lightweight chart renderer (Chart.js or similar).

### Tier 3 — Needs diagram rendering

- **Geometry (area, angles, shape classification)** — requires shape diagrams
- **Word problems with geometric elements** — may need simple SVG illustrations

These overlap with the NVR infrastructure problem. Can be partially solved by using text descriptions ("a rectangle 6 cm wide and 3 cm tall") without diagrams for simpler Qs.

### NVR — Dedicated phase (post-Maths)

NVR is architecturally separate from all other domains. It requires:
1. An SVG-based **shape component library** (5–10 primitive shapes: circle, triangle, square, hexagon, arrow, etc.)
2. **Attribute system** (fill, size, rotation, line-style) as CSS/SVG props
3. **Question layout component** for Section 1 (analogy grid: 3 shapes + 5 answer shapes)
4. **Code question layout** for Section 2 (reference grid: 3–4 labelled shapes + test shape + 5 coded answers)

Recommended approach: build the shape component library as a standalone deliverable, then layer question types on top. NVR S1 analogies are simpler to render than S2 codes.

---

## Key Strategic Insights

**1. NVR is a separate infrastructure problem, not a content problem.** The bottleneck is not "what questions to ask" but "how to render abstract shapes." Once a shape renderer exists, question generation is straightforward. Plan NVR as a dedicated technical sprint, not a content task.

**2. Mathematics is the highest-ROI domain to build next.** 11 out of 25 questions are pure number work — no diagrams, no charts, trivially text-encodable. Given Alex's September 2026 deadline, a focused Maths domain would add meaningful exam coverage with modest build effort.

**3. Data handling questions (charts, tables) are the Maths quick-wins after pure number.** HTML tables cover timetable and pricing questions. Chart images can be sourced once and reused across multiple question variants. These are lower effort than geometry.

**4. The paper is the most recent GL edition (2024).** Unlike the English papers (2017), this represents the current format. The two-section NVR structure (analogies + codes) has been stable historically but the 2024 edition is the authoritative reference.

**5. Mathematics difficulty bands map cleanly to the app's existing band system.** Q41–47 ≈ Band 1, Q48–55 ≈ Band 2, Q56–60 ≈ Band 3, Q61–65 ≈ Band 4. The Leitner system and mastery thresholds would apply without modification.

**6. NVR S1 and S2 are roughly equal in question count but S2 is harder to build.** S1 (transformations) can be partially approximated with text-described rules; S2 (codes) requires the student to see all reference shapes simultaneously, which is a harder layout problem. Build S1 before S2.

---

## Papers Referenced
- Non-Verbal Reasoning & Mathematics Test Booklet (GL Assessment, 2024) — Code 6853 948
- Non-Verbal Reasoning & Mathematics Parent's Guide (GL Assessment, 2024) — Code 6853 949
- Non-Verbal Reasoning & Mathematics Answer Sheet (GL Assessment, 2024)
