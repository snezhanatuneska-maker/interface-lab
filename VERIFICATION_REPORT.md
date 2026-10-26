# Independent verification: Interface Lab science

> **Status update — all issues below have been fixed** (commits `4f86def` and `cbcceb4`). After the fixes
> `tests/science.test.js` passes 83/83, the whole suite passes 228/228, and `npm run build` succeeds. The Hamaker exam
> was re-checked in headless Chromium.
> - R1 XPS keys, R2 Hamaker crash, R3 DLVO secondary minimum, R7 SEM/AFM answer order, R8 wetting θ_Y, R12
>   polystyrene and R14 TeX spacing are fixed in `4f86def`.
> - R4, R5, R6, R9, R10, R11, R13, R15 and R16 are fixed in `cbcceb4`. R16 is partly done: the trainer liquid
>   tables stay at their labelled 20 °C values, and the vdW page stays at 293 K (the temperature of its source table).
> - The "unsure" list at the end still needs a human expert.
>
> The rest of this report describes the site **before** those fixes.

Verifier: independent second pass, run after the `science-fixes` audit (SCIENCE_AUDIT.md). Nothing in the site was
edited. Added, uncommitted: `tests/science.test.js` (outside `src/`, so not in the build) and this report.

## Scope and how the branches were read

- `science-fixes` is already merged into `main` (PR #34, merge `1fcc4e2`). One more commit, `2c0f45e` ("Follow up the
  medium-confidence audit items"), sits on `origin/main` on top of it. So `git diff main...science-fixes` is now
  empty. Instead I reviewed **`0d00f75..2c0f45e`**: the whole audit, the fixes and the follow-up.
- The final site I verified is `2c0f45e` (`origin/main`, the working tree here).
- Method:
  1. For each demo I wrote down the governing equations first, then read the page, the library, the trainer and the
     question bank.
  2. I wrote `tests/science.test.js` (83 tests). It checks the site's own `src/lib` functions, and copies of the
     inline page formulas, against reference values. The references were computed with my own CODATA constants or
     quoted from textbooks, not taken from the site's constants.
  3. For every numeric trainer, 900 generated problems (300 seeds × 3 difficulties) were solved independently **from
     the question text**. Each keyed option was checked to be the closest option to that answer, within the display
     rounding.
  4. The built site was checked in headless Chromium (`vite preview` + Playwright) for the default readouts and the
     Hamaker trainer.
- Run: `npx vitest run tests/science.test.js`. **Result: 76 passed, 7 failed.** All 7 failures are real site
  issues, described below.
  - The tests went through several rounds. Failures that turned out to be bugs in my test (regexes, tolerances
    tighter than 2-significant-figure display rounding, comparing two near-zero numbers) were fixed in the test.
    They are not counted as findings.
  - Note: `npm test` (vitest) will also pick up this file and show the 7 failures until the site is fixed. The site's
    own 145 tests still pass, and `npm run build` succeeds.

## Summary table

| # | Demo | Fixes correct? | New issues found (this pass) | Tests passed/total | Verdict |
|---|------|----------------|------------------------------|:-:|---|
| 1 | Langmuir vs BET | Yes (ADS-1, ADS-2) | none | 5/5 (+BET, isotherm trainer keys ✓) | **verified** |
| 2 | Capillary | Yes, the core physics. Small slips in the new text | Kelvin readout always uses factor 2, even in "filling" mode (contradicts the page's own note); "1 mm tube" is ambiguous; "cavitates long before" is overstated | 4/4 (+trainer ✓) | issues remain (minor) |
| 3 | Mercury porosimetry | Yes (MIP-1…5) | none | 3/3 (+trainer ✓) | **verified** |
| 4 | Surfactants | Yes (SUR-1…3) | TeX glitch in the trainer's worked solution | 5/5 (+trainer ✓) | **verified** (cosmetic only) |
| 5 | Wetting | Mostly. The WET-1 cap is defensible; the WET-2 lotus example is doubtful | Trainer uses smooth-surface θ_Y up to 160–170°, contradicting the new "≤ 120°" text; lotus called "metastable" while the page's own lotus preset is the *stable* Cassie state; TeX glitch | 4/4 (+keys ✓, 1 consistency test ✗) | issues remain (minor) |
| 6 | Zisman | Yes (ZIS-1…6; drop and axis drawing verified) | Trainer uses polar test liquids, while the page now says the line holds for non-polar ones | 4/4 (+trainer ✓) | **verified** (minor note) |
| 7 | SEM/AFM/XPS | SFX-1, SFX-3 yes. **SFX-2 incomplete**: it missed the real bug | **XPS trainer: inputs and keys rounded to 1 significant figure. In 27 % of questions a correct calculation is marked wrong; the worked arithmetic is false in all of them.** SEM/AFM trainer: answer is always option 1. On-page quiz says "Not quite right. Correct! …" | 2/4 | **issues remain (CRITICAL)** |
| 8 | Lennard-Jones | Yes (LJ-1, LJ-2) | none | 4/4 (+trainer ✓) | **verified** |
| 9 | Van der Waals | VDW-1, VDW-3 yes. VDW-2 is correct but clashes with the page readout | Card says water "dipoles lock together" at 0.4 nm; the readout at the same 0.4 nm says "thermal motion wins" | 4/4 (+trainer ✓) | issues remain (minor) |
| 10 | Hamaker & Lifshitz | Yes (HAM-1…4; the equation shown is correct) | **Trainer crashes:** 2 of its 4 question types always throw. At Medium/Hard, "Generate" silently fails about 45 % of the time, and Exam mode cannot start (confirmed in the browser). Polystyrene A probably about 30 % too high (single ν_e) | 3/5 | **issues remain (MAJOR, functional)** |
| 11 | Double layer | Yes (EDL-1…3) | none | 5/5 (+trainer ✓) | **verified** |
| 12 | Zeta potential | Yes (ZET-1…6; mobility 0.078 µm·cm/(V·s) per mV confirmed) | none | 4/4 | **verified** |
| 13 | DLVO | DLV-1 yes: the page now uses the correct `lib/dlvo`. DLV-2 yes. DLV-3 created a bank ambiguity | **"Secondary minimum" readout shows −5.1 kT whenever there is no barrier (it is the edge of the plot)**; bank explanation now endorses a "wrong" option; the simulator can never show the 64× it promises | 5/6 (+trainer ✓) | **issues remain (MAJOR)** |
| 14 | Nucleation (CNT) | Yes (NUC-1, NUC-2, C-3) | Rate axis labelled m⁻³ s⁻¹ is also used for the heterogeneous rate (which is per area) | 4/4 (+trainer ✓) | **verified** (minor note) |
| 15 | Phase separation | Yes (PHA-1…4) | TeX glitch in the trainer | 5/5 (+trainer ✓) | **verified** (cosmetic) |
| 16 | Crystal growth | Yes (CRY-1…3) | none | 6/6 (+trainer ✓) | **verified** |
| – | Cross-demo trainer key checks | – | (counted in the rows above) | 9/11 | – |
| | **Total** | | | **76/83** | |

Of the previous session's ~60 fixes, I found **none that made the physics wrong**. Three fixes introduced new
inconsistencies: the DLVO secondary-minimum readout, the DLVO bank explanation, and the wetting 120° text versus the
trainer. Two fixes were incomplete: SFX-2, and DLV-1 in the sense that the page still cannot show the 1/z⁶ it teaches.
The audit's largest miss was in its "correct" verdicts. It rated SEM/AFM/XPS "correct" with "every … generator key
correct", and did not exercise the Hamaker trainer, which crashes.

---

## Step 1: The fixes, hunk by hunk

All fix hunks in `0d00f75..2c0f45e` were re-derived. Correct, no further comment:

- ADS-1, ADS-2.
- CAP-1/2: Jurin 2γcosθ/(ρgr), 916 m at the defaults; Kelvin exp(−2γV_mol cosθ/(rRT)), giving 0.937, 0.590 and 0.979.
- CAP-4/5/6/8: the meniscus is concave for θ < 90° (checked against the SVG geometry); the hysteresis split; the GDL
  and Ti PTL text.
- MIP-1…5: d = 1486/P nm, 3.7 nm at 400 MPa, intruded volume ∝ d².
- SUR-1…3; WET-3; ZIS-1…6.
  - The ZIS-3 drop arc was verified for θ < 90° and θ > 90°.
  - The water-on-PTFE line gives 130.1°.
  - Nylon 6,6 γ_c = 42.2 mN/m is confirmed by a compiled table ([Accudynetest](https://www.accudynetest.com/polytable_03.html)).
- SFX-1, SFX-3; LJ-1, LJ-2.
- VDW-1: the general Debye term is μ₁²α₀₂ + μ₂²α₀₁, i.e. 2μ²α₀ for identical molecules.
- VDW-3.
- HAM-1…4: the equation shown is Israelachvili eq. 13.16; the static term is screened in electrolyte.
- EDL-1…3.
- ZET-1…6:
  - u = εζ/η = 0.0781 µm·cm/(V·s) per mV.
  - Henry f(κa) runs from 1 to 1.5.
  - Specific adsorption shifts the IEP and the PZC in opposite directions.
- DLV-1: the page V(h) matches my independent sphere–sphere DLVO to < 0.1 %. The lib CCC matches the analytic κh = 1
  result to < 1 %.
- DLV-2, DLV-4.
- NUC-1, NUC-2; PHA-1…4; CRY-1…3.

Hunks with problems:

| Fix | Problem |
|---|---|
| SFX-2 (`lib/trainSurface.ts`) | It replaced the distractors and the source name, but left the real defect untouched (see **R1**). Because everything is rounded to 1 significant figure, the new "added Φ" distractor (E_b + 8.4 eV) collides with the key and is always dropped. |
| CAP-2/CAP-3 (`CapillaryPage.tsx:37`, `capillary/Equations.tsx`) | The note correctly says the factor 2 is for emptying and the factor is 1 for filling. The readout uses factor 2 in both modes, and the page opens in "imbibition (filling)" mode. See **R5**. |
| CAP-1 text (`CapillaryPage.tsx:108, 168`) | Wording issues. See **R6**. |
| WET-1 (`lib/wetting.ts:8`) | The 120° cap and text are correct for water. But the trainer still asks about smooth surfaces with θ_Y up to 170° (**R8**). The cap is defensible rather than necessary (mercury on glass is about 140°, though the page is water-centred). |
| WET-2 (`WettingPage.tsx:161-163`) | "below θ_c a Cassie–Baxter state can still survive as a metastable state (the lotus leaf is one)". The page's own lotus preset (θ_Y 110°, r = 3, f_s = 0.1) gives θ_c = 108°, so in the site's model the lotus is the *stable* Cassie state. See **R9**. |
| VDW-2 (`vdw/Theory.tsx:68`) | Physics checked: x = μ²/(4πε₀r³kT) = 1.32 for water at 0.4 nm. My numerical Boltzmann average is about 9 % weaker than Keesom, so "overestimates" is right. But see **R10**. |
| DLV-1 (`DlvoTryThis.tsx:44-46`) | New "secondary minimum" readout bug. See **R3**. |
| DLV-3 (`data/practice/dlvo.ts:15-16`) | The new explanation makes a "wrong" option correct in one regime. See **R4**. |
| DLV-3 text (`DlvoEquations.tsx:39`) | "Set ψ₀ low or high in the simulator to see the difference." The slider stops at 100 mV, where z = 1 : 2 is only about 24×, never 64×. See **R11**. |
| NUC-1 (`nucleation/Equations.tsx:97`, `NucleationPage.tsx:310`) | The unit m⁻³ s⁻¹ is given to the one J₀ used for both curves, but the heterogeneous rate is per area. See **R13**. |

No fix replaced a correct original with something worse in the physics.

---

## Disagreements with the previous audit

1. **§7 "SEM/AFM/XPS: correct … the three bank keys are correct" — disagree.** The generator was not checked
   numerically.
   - `bindingEnergy = round(rng.uniform(280, 650), 1)` and `kineticEnergy = round(..., 1)` use `round(x, sig)`,
     i.e. **1 significant figure**, not 1 decimal.
   - So the questions read "kinetic energy of 1000 eV" and the keys are 300/400/…/700 eV.
   - Independent check: in **176 of 654** XPS problems the keyed option is not the option nearest the correct
     hν − E_k − Φ. Example: hν = 1486.6, E_k = 1000 gives 482.4 eV. The options are 400/500/1000/2000, and the key
     is 400.
   - The worked solution prints "E_b = 1490 − 1000 − 4.2 = 400 eV" (fmtTex defaults to 3 significant figures).
2. **The audit did not exercise the Hamaker trainer.** It lists "trainer keys (combining relation, plane, sphere) are
   correct". In fact the `repulsive` and `sphere` branches throw on every call:
   - `numericOptions` rejects negative values, and the repulsive answer is always negative.
   - `round(radius, 0)` calls `toPrecision(0)`, which raises a RangeError.
3. **§5 WET-2:** I disagree with using the lotus leaf as the example of a metastable Cassie state. The site's own
   model says otherwise. In the literature, whether the lotus state is stable or metastable depends on the texture
   model. *Unsure.*
4. **§13 DLV-3:** The audit said the 1/z² distractor is "fine given 'Schulze–Hardy rule' in the stem". I agree it
   was fine *before*. After the fix, the explanation itself says DLVO gives 1/z² at low potential, which makes the
   item self-contradictory.
5. **§10 "silica/water/silica 0.68 (book 0.63–0.83) … PTFE 3.80 (book 3.8)":** I agree, and also water 3.73, mica
   9.2, alumina 13.9 against the book's 3.7 / 10 / 15. But the audit's blanket "Node check OK" missed polystyrene:
   8.5 × 10⁻²⁰ J. As I recall it (not confirmed online), the book's eq-13.16 value uses ν_e ≈ 2.3 × 10¹⁵ Hz and
   gives about 6.5, with Lifshitz about 6.6–7.9. *Medium confidence.*
6. **§9 vdW:** I agree with H₂O 96/10/33 and NH₃ Keesom 38 / Debye 9.8. My own recollection of HCl Keesom "18.6" and
   NH₃ London "70" turned out to be inconsistent with the textbook μ, α and I the site uses, so I withdrew them and
   did **not** count them as findings (see "Unsure").

---

## Remaining issues

Confidence: H = high, M = medium.

### CRITICAL

**R1 — XPS trainer: inputs and keys rounded to 1 significant figure; wrong keys.** H
- **Where:** `src/lib/trainSurface.ts:54-55` (and `:62`, `:71`).
- **Quoted code:**
  `const bindingEnergy = round(rng.uniform(280, 650), 1)` /
  `const kineticEnergy = round(photonEnergy - bindingEnergy - 4.2, 1)` /
  `format: (v) => `${fmt(v, 1)} eV``.
- **Effect:**
  - Questions give E_k as 600–1000 eV.
  - 27 % of keys are wrong: a correct calculation is marked wrong.
  - The worked step's arithmetic is false in every XPS question.
- **Correct version:** round to 0.1 eV, e.g. `Math.round(x * 10) / 10`, for E_b and E_k. Format the options as
  `x.toFixed(1)`, and pass `fmtTex(photonEnergy, 5)` in the worked step.
- **Reference:** E_b = hν − E_k − Φ_spec (Briggs & Seah; the page's own equation).

### MAJOR

**R2 — Hamaker trainer crashes for 2 of 4 question types.** H (reproduced in Chromium)
- **Where:** `src/lib/trainHamaker.ts:44-55` (repulsive) and `:91` (sphere).
- **Repulsive:** the key is always negative, but `numericOptions` only accepts positive values. It throws "could not
  find four distinct options".
- **Sphere:** `round(rng.uniform(200, 1000), 0)` calls `toPrecision(0)` and throws a RangeError.
- **Effect:**
  - 270 of 900 seeds throw (all of these question types at Medium/Hard).
  - In the browser, "Generate problem" does nothing about 45 % of the time at Medium/Hard.
  - Exam mode (10 questions) never starts at Medium or Hard.
- **Correct version:** pass `valid: Number.isFinite` (plus a sign-aware fallback) for the repulsive case, and use
  `Math.round(...)` for the radius.
- Also, `round(…, 1)` in this file is 1 significant figure. a₁₁ ∈ {6…10}, D ∈ {1, 2, 3} nm, and the sphere answer
  is shown to 1 significant figure (e.g. 185 kT becomes "200 kT"). These are self-consistent but coarse.
- This is a functional bug, not a physics error, but it takes away half of this demo's training.

**R3 — DLVO page "Secondary minimum" shows the plot edge when there is no barrier.** H
- **Where:** `src/pages/dlvo/DlvoTryThis.tsx:44-46`, readout at `:141`.
- **Quoted code:** `const secondary = Math.min(0, ...curve.V.slice(Math.max(peakIndex, 10)))`.
- **Effect:**
  - Above the CCC, V(h) rises monotonically, so the "minimum" is V at h_max = 20 nm, i.e. −Aa/(12·20 nm) = −5.1 kT.
  - At 300 mM, 1000 mM 1:1 and 100 mM 2:2, the page says "There is no barrier … coagulate" *and* "Secondary
    minimum −5.1 kT".
  - This covers the upper ~30 % of the 1:1 salt range and more for z = 2, 3.
  - At the default 10 mM the value (−5.1 kT at 15.9 nm) is a genuine minimum, so the bug is not visible at first.
- **Correct version:** report a secondary minimum only if V has an interior local minimum after a positive maximum
  (V′ changes sign − to +); otherwise show "none (no barrier)".
- **Reference:** Israelachvili §14; Hiemenz ch. 13.

### MINOR

**R4 — DLVO bank item now contradicts itself.** H
- **Where:** `src/data/practice/dlvo.ts:15-16`.
- **Quoted text:** wrong option "CCC ∝ 1/z²"; explanation "…at low surface potential DLVO gives a weaker 1/z²".
- **Correct version:** replace that distractor (e.g. "CCC ∝ z²" or "CCC ∝ 1/z³"), or reword the stem to "at high
  surface potential".

**R5 — Kelvin readout ignores the filling/emptying mode its own note describes.** H
- **Where:** `src/pages/CapillaryPage.tsx:37`; note in `capillary/Equations.tsx`.
- **The note says:** "factor 2 is for a hemispherical meniscus (emptying); a pore filling through a cylindrical
  meniscus has factor 1."
- **But:** the readout always uses factor 2, and the default mode is "imbibition (filling)".
- **Correct version:** use `exp(−γV cosθ/(rRT))` in imbibition mode and the factor 2 in drainage mode, or label the
  readout "desorption (emptying) branch".
- **Reference:** Cohan; Rouquerol ch. 7.

**R6 — Capillary wording.** M
- **Where:** `src/pages/CapillaryPage.tsx:168` and `:108`.
- **"about 1.5 cm in a 1 mm tube":** 1.5 cm is for a 1 mm *radius*; a tube is usually specified by its diameter
  (that gives 2.9 cm). *Fix:* "a tube of 1 mm radius".
- **"water cavitates long before such suction is reached":**
  - At r = 50 nm, P_c ≈ 2.9 MPa, a tension water can sustain (plant xylem reaches −2 to −10 MPa).
  - Better: "the formal height is meaningless here: gravity is irrelevant at the pore scale, and real pores are not
    hundreds of metres long; at the highest suctions water would also cavitate."

**R7 — SEM/AFM trainer: correct answer always option 1.** H
- **Where:** `src/lib/trainSurface.ts:23, 41` (`answer: 0`, options not shuffled).
- **Fix:** use `labelled(rng, [...], 0)`.

**R8 — Wetting trainer uses smooth-surface Young angles the page now says are impossible.** H
- **Where:**
  - `src/lib/trainWetting.ts:131` (`rng.int(19, 34) * 5`, up to 170°)
  - `:105` (up to 160°)
  - `:81` ("Water has θ_Y = … on the smooth material", up to about 140°)
- **Effect:** 148 of 900 problems exceed 125°.
- **Correct version:** keep θ_Y ≤ about 120° for "smooth" materials, or say "a hypothetical material".

**R9 — Lotus leaf cited as a metastable Cassie state.** M (the literature claim is *unsure*)
- **Where:** `src/pages/WettingPage.tsx:161-163`.
- **Problem:** this conflicts with the page's own lotus preset, which is above θ_c (110° > 108°).
- **Fix:** drop the parenthesis, or say "many textured hydrophobic surfaces".

**R10 — vdW card and readout disagree at the default r = 0.4 nm.** H
- **Where:** `src/pages/vdw/Theory.tsx:68`; `src/pages/VdwPage.tsx:194`.
- **The card says:** "closer in (e.g. water at 0.4 nm) the dipoles lock together".
- **The readout at 0.4 nm says:** "|φ| = 0.84 kT: thermal motion wins".
- Both are computed correctly, but with different criteria: μ²/(4πε₀r³) ≈ 1.3 kT versus the angle-averaged total of
  0.84 kT. "Lock together" is also too strong for x ≈ 1.3.
- **Fix:** "close to kT, so the angle-averaged formula is only approximate (it overestimates by ~10 %)".

**R11 — DLVO simulator cannot show the 1/z⁶ it teaches.** H
- **Where:** `src/pages/dlvo/DlvoEquations.tsx:39`; ψ₀ slider 10–100 mV.
- **Problem:** the CCC ratio z = 1 : z = 2 is about 8 at 50 mV and about 24 at 100 mV. The lib reaches 64 and 729
  only as ψ₀ → ∞ (verified at 1000 mV: 1530, 23.9, 2.10 mM).
- **Fix:** state the ratio the simulator gives, or extend the ψ₀ range.

**R12 — Polystyrene Hamaker constant probably too high.** M
- **Where:** `src/pages/hamaker/HamakerPage.tsx:25`.
- **Problem:** with the single ν_e = 3 × 10¹⁵ Hz, A(PS/vacuum) = 8.5 × 10⁻²⁰ J. Book (as recalled): ν_e ≈ 2.3 × 10¹⁵ Hz,
  A ≈ 6.5; Lifshitz 6.6–7.9.
- **Fix:** per-material ν_e, or drop PS. Same reasoning as the TiO₂ removal (HAM-1).

**R13 — Rate units in the nucleation plot.** M
- **Where:** `src/pages/nucleation/Equations.tsx:97`; `NucleationPage.tsx:310`.
- **Problem:** "J₀ = 10³⁰ m⁻³ s⁻¹ for both cases". Heterogeneous rates are per m² (the page's own term list says
  "per volume, or per area").
- **Fix:** say the axis is homogeneous-rate units and the heterogeneous curve compares the exponential term only.
- The value 10³⁰ m⁻³ s⁻¹ itself lies within quoted theoretical estimates of 10²⁶–10³⁰ m⁻³ s⁻¹
  ([arXiv cond-mat/0612526](https://arxiv.org/pdf/cond-mat/0612526)).

**R14 — TeX spacing lost in worked solutions.** H
- **Where:** `src/lib/trainPhase.ts:41`, `trainSurfactant.ts:44`, `trainWetting.ts:65, 151`.
- **Problem:** `\;` inside a JS template literal becomes a bare `;`. Students see "= 0 ;⇒; x(1 − x) = …".
- **Fix:** write `\\;`.

**R15 — On-page quiz feedback contradicts itself.** H
- **Where:** `src/pages/surface-explorer/SurfaceExplorerQuiz.tsx:111`.
- **Problem:** a wrong answer shows "✕ Not quite right. Correct! AFM physically…", because every explanation
  string starts with "Correct!".
- **Fix:** remove "Correct!" from the explanations.

**R16 — Remaining cross-demo inconsistencies.** H
- **Water γ:** 72.8 mN/m (20 °C) in wetting, the wetting and Zisman trainers and the capillary trainer's stated γ;
  72.0 (25 °C) in capillary and surfactants. Both are now labelled, but the capillary trainer prints "γ = 72 mN/m"
  while the wetting trainer prints 72.8.
- **Temperature:** 293 K (vdW), 298 K (EDL, DLVO, Hamaker, nucleation), 298.15 K (capillary, surfactants).
- **Zisman trainer** (`trainZisman.ts:21`) uses water, glycerol and formamide, while the page now says the straight
  line holds for non-polar liquids.

---

## For a human expert to check ("unsure")

1. Israelachvili Table 13.2 values for **polystyrene** (ν_e, A) — R12.
2. **HCl** Keesom and Debye coefficients in Israelachvili Table 6.2. The site computes 11.2 and 6.1 × 10⁻⁷⁹ J m⁶ from
   μ = 1.08 D and α = 2.63 Å³. These follow correctly from the formulas; I could not confirm the table entries.
3. Whether the **lotus leaf** is a stable or a metastable Cassie state (R9).
4. **Nylon 6,6 γ_c:** 42 (Accudyne compilation) or 46 (often attributed to Zisman).
5. **LiFePO₄** "helps … cycle life" and **ionomer raises |ζ|** in inks (follow-up items PHA-2 and ZET-6). These are
   plausible summaries of the literature; I did not re-check them against primary papers.
6. **Animations** were read but not compared quantitatively: the adsorption kinetic simulation (`SurfaceView.tsx`), the
   DLA/kinetic Monte Carlo, and the scripted nucleation profile. The Cahn–Hilliard equation, its stability limit
   (dt = 0.03 < 0.0625) and its fastest wavelength 2π√(2κ) were checked analytically.
7. **Course-notes conventions:** the `chapter` fields are empty and the notes are not in the repo. Items such as
   "IEP vs PZC" and S = c/c* could not be compared with the lecture.

## Overall confidence

- **High confidence** that the equations, constants and plotted values of all 16 demo *pages* are now correct. Every
  library function and copied page formula passed independent checks against textbook equations and limiting cases
  (BET knee and plot inversion, Young/Wenzel/Cassie limits, LJ minimum, Debye 0.304/√I and 1/z, Grahame = Gauss, CNT
  r* and ΔG* and f(θ), the DLVO analytic CCC, Schulze–Hardy 64/729 at high ψ₀, the common tangent, facet geometry,
  Washburn, Smoluchowski).
- The previous session's fixes are scientifically sound.
- The remaining serious problems are in **Training**:
  - The XPS key is wrong (CRITICAL).
  - The Hamaker trainer crashes (MAJOR).
- Plus one misleading DLVO readout (MAJOR), all three of which the previous audit missed, and a set of small
  consistency and wording issues.
- **Not verified:**
  - Every pixel of the canvases.
  - The live animations' long-time statistics.
  - The literature items listed above.
  - The concept-bank questions beyond solving each one by hand. All 76 bank questions have exactly one defensible
    answer, except the DLVO item in R4.
