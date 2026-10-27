# Final sign-off: Interface Lab science

> **Status update — fixes applied on `science-fixes` (`3eaf011..2d8000c`, fast-forward from `main`).**
> M1–M4, m1–m12, m14–m16, m19, m20 and T1–T3 are fixed. T4 (tests on copies of inline page formulas) is not: it needs the
> MIPS, Zisman, Lennard-Jones, Hamaker and Zeta formulas moved into `src/lib`, which is a refactor rather than a fix.
> Notation note m8 is partly done: Zisman and XPS equations now use KaTeX, γ_LV is used throughout, the DLVO Γ symbol is
> gone and the raw `γ_lv` and `r_m` labels are fixed; kT vs k_BT is left as is.
> After the fixes: 227/227 tests pass, `npm run build` succeeds, and all 16 pages load in Chromium with no console or
> KaTeX errors and no NaN/Infinity at any slider extreme. At 1280 px no equation overflows its box any more.
> The rest of this file describes the site before the fixes.

Reviewer: final pass before the site is shown to Prof. Klupp. Read-only: no site file was changed. This file is not committed.

**Version reviewed:** `7e21119` (= `origin/main` = this working tree). `origin/science-fixes` stops at `f01b520`, which is
5 commits *behind* this version. It was merged in PR #34, and the follow-up fixes plus the verification were added on `main` after that merge.

**Method**
- Read every page, library, trainer and question bank of the 16 demos.
- Ran `tests/science.test.js` and the full suite.
- Swept every model library over its slider extremes, in a scratch copy of the repo.
- Swept the DLVO page logic over its whole slider grid: 3 valencies × 19 ψ₀ values × 81 salt values.
- Built the site and loaded all 16 pages in headless Chromium at 1280 px and 390 px.
- In the browser, checked console errors, KaTeX errors, leftover raw TeX, NaN/Infinity, axis titles and equation overflow, and set every range slider to its minimum and maximum.

---

## Summary table

| # | Demo | Verdict | Open items |
|---|------|---------|------------|
| 1 | Langmuir vs BET | **ready** | m6 (Langmuir θ on Pt is an approximation) |
| 2 | Capillary pressure | **minor fixes** | **M4** (Kelvin validity, r vs r + t), m12 |
| 3 | Mercury porosimetry | **minor fixes** | **M3** (entry/throat size and ink-bottle caveat missing on the page) |
| 4 | Surfactants | **ready** | m20 |
| 5 | Wetting | **ready** | m10 (one equation needs horizontal scroll) |
| 6 | Zisman | **minor fixes** | m4, m5, m8, m11 |
| 7 | SEM / AFM / XPS | **ready** | m16 (cosmetic) |
| 8 | Lennard-Jones | **ready** | m14, m8 |
| 9 | Van der Waals | **ready** | needs-expert Q1 (HCl table values) |
| 10 | Hamaker & Lifshitz | **ready** | – |
| 11 | Double layer | **ready** | m10 |
| 12 | Zeta potential | **ready** | m9 |
| 13 | DLVO | **not ready** (one wrong on-screen readout) | **M1**, m1, m2, m19, T1 |
| 14 | Nucleation (CNT) | **minor fixes** | **M2** (no capillary-approximation caveat; sub-molecular d* shown), m3, m10 |
| 15 | Phase separation | **ready** | m7 |
| 16 | Crystal growth | **ready** | m15 |

**Totals: 0 CRITICAL, 4 MAJOR, 17 MINOR, 4 test-file issues.** (MINOR numbering has gaps: m13, m17 and m18 were
dropped after checking.)
- None of the MAJOR items is a wrong equation. They are one wrong readout (M1) and three missing validity caveats (M2–M4).
- Every fix is local: one sentence, or a few lines.

---

## Step 1: Open items from the earlier reports

`SCIENCE_AUDIT.md`: every finding is marked fixed. I spot-checked these in code and in the browser:
- CAP-1/2, MIP-1/2, ZET-1, DLV-1, VDW-1, HAM-1, WET-1, ZIS-1/3 and EDL-1.
- All are correct.

`VERIFICATION_REPORT.md`: R1–R16 are marked fixed.
- Re-checked: R1, R2, R4–R15 are fixed.
- **R3 (DLVO secondary minimum) is only partly fixed.** See **M1**.
- R16 is still only partly done, as that report says: 20 °C water γ in the trainer liquid tables and 293 K on the vdW page. Both are labelled. I accept that.

The "unsure" list from `VERIFICATION_REPORT.md`:

| Item | Resolution |
|---|---|
| 1. Polystyrene Hamaker constant | **Closed.** PS was removed from the page, and `science.test.js:495` enforces this. |
| 2. HCl Keesom/Debye vs Israelachvili Table 6.2 | **Open → expert Q1.** The site's 11.2 / 6.1 × 10⁻⁷⁹ J m⁶ follow correctly from μ = 1.08 D, α = 2.63 Å³ and T = 293 K. I cannot confirm the printed table entries. |
| 3. Lotus leaf stable or metastable | **Closed.** The wording no longer cites the lotus as metastable (`WettingPage.tsx:161-163`), and the lotus preset is the stable Cassie state, so the page is self-consistent. |
| 4. Nylon 6,6 γ_c 42 vs 46 mN/m | **Open → expert Q2.** Both values are in circulation. Zisman's own tables are usually quoted as 46; compiled tables give 42. |
| 5a. LiFePO₄ suppression of phase separation | **Closed.** Bai, Cogswell & Bazant, *Nano Lett.* 11 (2011) 4890; Cogswell & Bazant, *ACS Nano* 6 (2012) 2215. The page wording matches. |
| 5b. Ionomer raises \|ζ\| in catalyst inks | **Open → expert Q5.** This is a literature summary, not textbook material. It is plausible, and I did not verify it against primary papers. |
| 6. Animations (adsorption kMC, DLA, scripted nucleation) | **Still not verified quantitatively.** See "What I could not verify". |
| 7. Course-notes conventions | **Open → expert Q3.** The notes are not in the repo, and the `chapter` field is still a TODO (`src/data/subtopics.ts:40`). |

### Tests

`npx vitest run`: **228 / 228 pass** (26 files). `tests/science.test.js`: 83 / 83 pass. `npm run build`: succeeds.

The reference values I re-derived are correct. That covers:
- the BET algebra
- the analytic DLVO CCC (κh = 1)
- sphere–sphere V_R = 64πa n kT Γ²/κ² e^(−κh)
- Grahame, Kelvin and Washburn
- CNT d* and ΔG*
- the common tangent

The test file has four weaknesses. None of them makes a wrong value look right, **except T1**:

- **T1 (matters):** `science.test.js:688-716` tests the DLVO secondary-minimum readout only at ψ₀ = 50 mV.
  - The bug in **M1** appears at ψ₀ ≳ 60 mV, so the test passes while the page is wrong.
  - Add, for example, `[10, 1, 90]` with expected ≈ −4.3 kT, and check the readout against a long-range grid.
- **T2:** three tests are tautologies and pass whatever the site does:
  - `:612-615` (Hückel, `(2/3)*1/1.0` vs `(2/3)*1`)
  - `:330-332` (1 − e⁻³)
  - `:914-916` (3·(π/6)/π)
  - Either delete them or point them at site code.
- **T3:** the Kelvin test (`:160-166`) only exercises the default `'drainage'` factor 2. The factor-1 filling branch that the page shows by default is never tested.
- **T4:** the MIPS, Zisman, Lennard-Jones, Hamaker, Zeta and DLVO-readout tests test **copies** of inline page formulas.
  - I checked by eye that every copy matches the page today.
  - A later page edit will not fail the test, though. Moving these formulas into `src/lib` would fix that.
  - A cosmetic point: the EDL reference uses ε_r = 78.4 at `:557` but 78.5 at `:584`. Both are within tolerance.

---

## Step 2/3: New issues

Severity follows the brief:
- **MAJOR:** a wrong on-screen result, or a missing caveat a professor would expect.
- **MINOR:** wording, notation or cosmetics.

Confidence: H = high, M = medium.

### MAJOR

**M1 — DLVO "Secondary minimum" readout says "none" when there is a −1 to −4.3 kT minimum just beyond the plot.** H
- **Where:**
  - `src/pages/dlvo/DlvoTryThis.tsx:38` (`hMax = Math.min(100, Math.max(20, 6 * debye))`)
  - `:44-53` (minimum search on the plotted grid only)
  - readout at `:148-149`
- **Reproduced in Chromium:**
  - At 10 mM 1:1 with ψ₀ = 90 mV the page shows "Secondary minimum: none".
  - The true minimum is **−4.3 kT at h ≈ 20 nm**: it sits at or just past the 20 nm plot edge.
- **Sweep result:** this happens in 794 of 3,078 slider settings. Most are shallow (< 1 kT), but many lie between −1 and −4.3 kT. Two areas are affected:
  - 1:1 salt at 0.5–10 mM with ψ₀ ≥ 30 mV
  - low salt everywhere
- **Why it matters:** raising ψ₀ from 50 to 90 mV makes the secondary minimum "disappear". That teaches a wrong trend: in reality it only gets slightly shallower and moves outward.
- **Correct version:**
  - Search the secondary minimum on a long grid (e.g. up to 10 κ⁻¹ or 200 nm), independent of the plotted range.
  - Extend `hMax` so that it lies inside the plot, e.g. `hMax = max(20, 6κ⁻¹, 1.3·h_sec)`.
- **Reference:** Israelachvili §14.4; Hiemenz & Rajagopalan §13.5. The secondary minimum always exists when A > 0 and V_R decays exponentially.

**M2 — Nucleation: the capillary approximation of CNT is never stated, and the page shows "critical nuclei" smaller than one molecule.** H
- **Where:** `src/pages/nucleation/Equations.tsx` (no validity note anywhere); readout `src/pages/NucleationPage.tsx:328`; slider ranges `src/lib/nucleation.ts:10-13`.
- **Default case:** d* = 1.81 nm, about **100 molecules**, and the page uses the bulk, flat-interface γ for it.
- **Extreme case:** at S = 20, γ = 0.02 J/m², T = 500 K the page shows d* = 0.12 nm and ΔG* = 0.04 kT. That is a nucleus of **0.03 molecules**, with no warning.
- **Correct version:**
  - Add: "CNT treats the cluster as a small piece of bulk phase with the flat-interface γ (capillary approximation). This is questionable for clusters of a few tens of molecules and meaningless below about 10, where the predicted barrier is only qualitative."
  - Show a warning in the readout when the number of molecules in the critical nucleus, πd*³/(6v_m), falls below about 10.
- **Reference:** Mullin, *Crystallization*, ch. 5; Butt/Graf/Kappl, nucleation section; Kashchiev, *Nucleation* (2000).

**M3 — Mercury porosimetry: the page never says that MIP measures *entry (throat) sizes* under a cylindrical-pore model.** H
- **Where:** `src/pages/mips/MipsTheory.tsx:25-26`: "porosimeters generate comprehensive pore-size distributions".
- **Problem:**
  - The ink-bottle effect appears only in the Training bank (`data/practice/mips.ts:19`), not on the page.
  - A student can memorise "MIP gives the pore-size distribution" and lose marks: it gives the distribution of the **entry diameters** through which volume is reached.
- **Correct version:** "…generate the distribution of pore *entry* (throat) diameters, assuming cylindrical pores. A large cavity behind a narrow neck is counted at the neck size (ink-bottle effect), and some mercury stays trapped on extrusion."
- **Reference:** Rouquerol et al., *Adsorption by Powders and Porous Solids*, ch. 9; Giesche, *Part. Part. Syst. Charact.* 23 (2006) 9.

**M4 — Capillary: the Kelvin readout has no lower validity limit, and it contradicts its own r + t note.** H
- **Where:** `src/lib/capillary.ts:15` (r slider 2–50 nm) and `src/pages/capillary/Equations.tsx:46-50`.
- **Validity limit:**
  - The Kelvin equation with bulk γ and V_mol becomes unreliable in the narrow-mesopore range, below about 2–4 nm.
  - Below 2 nm, micropore filling replaces capillary condensation.
  - The readout is shown down to r = 2 nm with no caveat.
- **Contradiction:**
  - The note says "the pore radius is r + t", which makes r the *Kelvin* radius.
  - But the slider and the drawing call r the *pore* radius, and the readout uses it as the Kelvin radius.
- **Correct version:**
  - Add: "Kelvin with bulk γ is reliable only in mesopores wider than a few nm; below 2 nm pores fill by micropore filling instead."
  - Either label r as the Kelvin (core) radius, or say the readout neglects t.
- **Reference:** Rouquerol ch. 7–8; IUPAC 2015 (Thommes et al., *Pure Appl. Chem.* 87, 1051).

### MINOR

**DLVO page display bugs**

| # | Where | Problem | Fix |
|---|---|---|---|
| m1 | `DlvoTryThis.tsx:153, 195` | CCC is printed with `toPrecision(2)`, so the browser shows "**3.8e+2 mM**" and "4.9e+2 mM" at ψ₀ ≥ 90 mV. | Use a formatter that writes 380 mM. (H) |
| m2 | `DlvoTryThis.tsx:108, 193-194` | A barrier between 0 and 0.5 kT is shown as "0 kT", and the insight then says "The barrier of 0 kT is low enough…". This happens at 16 sweep settings, at low ψ₀ and salt. | Show "< 1 kT". (H) |

**m3 — Nucleation bank key wording.** M
- **Where:** `data/practice/nucleation.ts:20`, "…so a smaller cluster reaches the critical size".
- **Problem:** the page's own point is "Same d*, lower peak". What shrinks is the *number of molecules* (the cap volume), not the critical radius.
- **Fix:** "…so the critical nucleus needs fewer molecules and the barrier is lower (same radius of curvature)."

**m4 — Zisman CEP sentence.** M
- **Where:** `ZismanInsight.tsx:11`, "If their critical surface tension were above that of water, product water would spread into the pores".
- **Problem:** the sentence is true, but it invites a wrong converse. Water already imbibes whenever θ < 90°, which with the page's own b = 0.03 means γ_c above about 39 mN/m, not 72.
- **Fix:** "…if their surfaces were wetted by water (θ < 90°)…".

**m5 — Zisman: γ_c treated as the solid surface energy.** M
- **Where:** `ZismanTheory.tsx:26`, "very low surface energy (γ_c ≈ 18 mN/m)".
- **Problem:** γ_c is an empirical quantity close to, but not equal to, γ_S. The equation card correctly says "apparent".
- **Fix:** "a very low critical surface tension, close to its surface energy".

**m6 — Langmuir on Pt is an approximation.** M
- **Where:** `AdsorptionPage.tsx:419`, "Reactions on Pt go through adsorbed species, described by the Langmuir θ".
- **Problem:** H and O on Pt show strong lateral interactions (Frumkin/Temkin behaviour).
- **Fix:** "…often approximated by the Langmuir θ".

**m7 — Phase animation and phase diagram disagree about x₀.** H
- **Where:** `lib/phase.ts:65` (φ₀ = −0.6, i.e. x₀ = 0.29); label at `ProfileAnimation.tsx:172`, "x₀ in the metastable region".
- **Problem:** the animation is metastable in its own φ⁴ model. But in the page's regular-solution diagram, binodal 0.15 means spinodal 0.28, so x₀ = 0.29 is **unstable**.
- **Fix:** φ₀ = −0.7 (x₀ = 0.255) is metastable in both models.

**m8 — Notation.**
- Γ is the surface excess on the Surfactants page, but the tanh factor in DLVO (`DlvoEquations.tsx:20`).
- γ_lv (Zisman) vs γ_LV (Wetting).
- kT (DLVO, Nucleation) vs k_BT (EDL).
- Raw underscores in canvas and Plotly labels: "γ_lv" (`ZismanTryThis.tsx:60`) and "r_m" (`LennardJonesPage.tsx:149, 165`).
- The Zisman and SEM/AFM/XPS equations are plain HTML, while the other 14 pages use KaTeX. (H)

**m9 — Zeta wording.** M
- **Binary status** (`ZetaTryThis.tsx:71, 102`): every |ζ| < 30 mV shows "AGGLOMERATED (Flocculated)". At 25 mV that is too strong. Suggest a middle band, "limited stability", for 10–30 mV.
- **"κa ≫ 1 (most particles in water)"** (`ZetaEquations.tsx:22`) is doubtful for the catalyst nanoparticles the page is about.

**m10 — Equations cut off at desktop width.**
- At 1280 px these need horizontal scrolling inside their box:
  - the Cassie–Baxter equation (Wetting)
  - Grahame and C_S/C_d (EDL)
  - V_R (DLVO)
  - f(θ) and ΔG*_het (Nucleation): "= V_cap/V_sphere" is visibly clipped.
- At 390 px many more do. There is no page-level horizontal scroll.
- (H, cosmetic)

**m11 — Zisman plot and back links.**
- The Zisman plot has no γ_lv tick values, so γ_c cannot be read off it.
- The Zisman, Lennard-Jones, Hamaker and SEM/AFM/XPS pages lack the "← All tools" link the other pages have. (H, cosmetic)

**m12 — Capillary lede.** `CapillaryPage.tsx:53-54` says pore radius controls "contact angle hysteresis". It does not. (H)

**m14 — Lennard-Jones repulsion term.** M
- **Where:** `LennardJonesPage.tsx:130` and bank `lennardJones.ts:12`.
- **Problem:** the r⁻¹² term is presented as the physics of electron-cloud overlap. The exponent 12 is chosen for convenience (it is the square of r⁻⁶). Real Pauli repulsion is closer to exponential (Born–Mayer).
- **Fix:** add "(the exponent 12 is chosen for convenience)". Israelachvili §8.2.

**m15 — Crystal page cross-reference.**
- **Where:** `CrystalPage.tsx:131`, "covered in Prof. Klupp's nucleation & growth simulation".
- **Problem:** the site has its own CNT page. Attributing a simulation to the professor, on a site shown to him, is odd.
- **Fix:** link to `#/nucleation`. (H)

**m16 — XPS view.** `SurfaceExplorerTryThis.tsx:69-80`: the "spectrum" is two rectangular plateaus with random noise redrawn on every render, and no binding-energy ticks. (H, cosmetic)

**m19 — DLVO validity not stated.** M
- The caption names the approximations (Derjaguin, weak overlap) but not their conditions: κa ≫ 1 and κh ≳ 1.
- At 0.1 mM, κa = 3.3.
- ψ₀ is held fixed as salt is added, while in reality it falls with salt.
- **Fix:** one sentence.

**m20 — Surfactant table row.** `surfactants/Theory.tsx:163`: the surface-tension row still says "the surface is full and the monomer concentration stops rising". This keeps the causal "surface full" wording that SUR-1 removed elsewhere. Only the second half is the reason. (M)

### Quiz / bank ambiguity

All 76 bank questions and the 3 on-page quiz questions have exactly one defensible answer. m3 is a wording issue in a key, not a second correct option. Crystal Q5 ("Wulff … growth rate only") is safe only because of the word "only": the *kinetic* Wulff construction uses growth rates. That is acceptable.

### CEP claims

Every application example is real and correctly described after the earlier fixes. The remaining caveats are m4 (Zisman GDL) and m6 (Langmuir on Pt). No example is invented.

### Browser check (Step 3)

All 16 pages pass:
- They load, with no console errors or warnings and no `.katex-error`.
- No raw TeX, NaN or Infinity, at default values or with every slider at its minimum and maximum.
- Every Plotly plot has labelled axes with units. The vdW share chart is a labelled bar chart.
- The displayed text is the fixed version (built from `7e21119`).

Apart from M1 and m1–m2, every readout I compared against the equations matched.

---

## Needs a human expert (questions for the professor)

1. **HCl in Israelachvili Table 6.2:** do the Keesom and Debye entries match 11.2 and 6.1 × 10⁻⁷⁹ J m⁶ (μ = 1.08 D, α = 2.63 Å³, 293 K)?
2. **Nylon 6,6:** should the site quote γ_c ≈ 42 or 46 mN/m?
3. **Course notation:** should the site follow the lecture shorthand (S = c/c*, IEP = PZC for indifferent electrolyte, CCC ∝ z⁻⁶), or the strict textbook forms the site now uses?
4. **Kelvin on filling:** does the course use the Cohan cylindrical-meniscus form (factor 1) for filling, as the readout does by default, or only the hemispherical form (factor 2)?
5. **Catalyst inks:** is "ionomer adsorption raises |ζ| in catalyst inks" an acceptable summary for the course?
6. **Thresholds:** are the 90° hydrophilic/hydrophobic boundary, |ζ| > 30 mV, and the 15 kT barrier the values the course uses?
7. **Chapter mapping:** can the lecture chapter numbers be provided to fill the `chapter` field?

---

## Overall confidence and limits

**High confidence** that the equations, constants and plotted curves of all 16 demos are correct:
- Every library passed independent checks and extreme-value sweeps, with no NaN, Infinity, θ > 1, angle outside 0–180°, negative coverage or wrong-sign energy.
- All trainer keys pass across 900 generated problems each.

What remains is one wrong DLVO readout (M1), three missing validity caveats (M2–M4) and minor wording and notation. After M1–M4, and ideally m1–m3, I would sign the site off.

**Not verified:**
- The long-time statistics of the three animations: adsorption kMC, DLA/kMC crystal growth, and the scripted nucleation profile.
- Pixel-level accuracy of the canvas drawings.
- Literature claims beyond textbooks (Q5).
- Printed table entries I could not consult (Q1, Q2).
- The course notes, which are not in the repo.
- Dark mode was not screenshot-checked page by page.
