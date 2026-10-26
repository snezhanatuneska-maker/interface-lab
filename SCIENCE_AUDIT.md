# Science audit: Interface Engineering Lab

Scope: the science of the 16 demo pages, their equations and plotted values, the explanatory text, the quiz and
Training answer keys, and the clean-energy (CEP) claims. Code style and design are out of scope.
References: Israelachvili, *Intermolecular and Surface Forces* (3rd ed.); Butt/Graf/Kappl, *Physics and Chemistry of
Interfaces*; Hiemenz & Rajagopalan, *Principles of Colloid and Surface Chemistry*; Mullin, *Crystallization*;
Rouquerol et al., *Adsorption by Powders and Porous Solids*.

**Severity:** CRITICAL means wrong physics, a wrong equation or a wrong answer key. MAJOR means a misleading trend,
wrong units, unrealistic numbers or a wrong CEP claim. MINOR means wording, imprecision or a missing caveat.

**Method:** I read every page, its library and its Training generator and question bank. I also ran a throwaway
script, `node --experimental-strip-types check.ts` (kept in the session scratchpad, not in the repo). It runs the
site's own `src/lib/*.ts` functions, and copies of the inline page formulas, at about 90 textbook points. Its results
are quoted below as "Node check".

---

## Summary

| # | Demo | Critical | Major | Minor | Verdict |
|---|------|:-:|:-:|:-:|---|
| 1 | Langmuir vs BET Adsorption | 0 | 0 | 2 | correct |
| 2 | Capillary Pressure & Pore Filling | **2** | 2 | 3 | **seriously wrong** |
| 3 | Mercury Intrusion Porosimetry | **1** | 2 | 2 | **seriously wrong** |
| 4 | Surfactants & Micelle Formation | 0 | 0 | 3 | correct |
| 5 | Wetting & Contact Angle | 0 | 0 | 3 | correct |
| 6 | Surface Energy & Zisman Plot | 0 | 2 | 4 | needs fixes |
| 7 | Surface Characterisation (SEM/AFM/XPS) | 0 | 0 | 3 | correct |
| 8 | Lennard-Jones Potential | 0 | 0 | 2 | correct |
| 9 | Van der Waals (Keesom/Debye/London) | 0 | 1 | 2 | needs fixes |
| 10 | Hamaker & Lifshitz | 0 | 1 | 3 | needs fixes |
| 11 | Electrical Double Layer (GC/GCS) | 0 | 0 | 3 | correct |
| 12 | Zeta Potential & IEP | **1** | 2 | 3 | needs fixes |
| 13 | DLVO & Colloid Stability | **1** | 1 | 2 | **seriously wrong** |
| 14 | Classical Nucleation Theory | 0 | 0 | 2 | correct |
| 15 | Phase Separation | 0 | 0 | 4 | correct |
| 16 | Crystal Growth & Shape | 0 | 0 | 3 | correct |
| | **Total** | **5** | **11** | **44** | |

Plus 7 cross-demo consistency items (section 17), all minor.

**Pattern:** the pages built on a `src/lib/*.ts` model are accurate and agree with Israelachvili and the literature
to within a few percent. Those are Adsorption, Surfactants, Wetting, vdW, EDL, Nucleation, Phase and Crystal. All 5
critical findings are in pages with inline "toy" formulas: Capillary, MIPS, Zeta and DLVO. In three of them the repo
already holds a correct implementation that the page does not use: `lib/dlvo.ts`, `trainMips.ts` and
`trainZeta.ts`. So the page and its Training section give different numbers for the same quantity.

---

## Step 1: Inventory

16 demos, exactly as expected. `SUBTOPICS` (`src/data/subtopics.ts`) has 16 entries with an `href`, `App.tsx` has 16
matching routes, and `#/demos` renders `TOOLS` (the same 16). No upcoming or unrouted demos exist.

**Lecture chapter:** cannot be filled in. The `chapter` field is empty for every subtopic (TODO at
`src/data/subtopics.ts:40-41`), and the course notes are not in the repository. The column below gives the course
topic group instead.

| # | Demo | Route | Main files | Lecture chapter / topic |
|---|------|-------|-----------|--------------------------|
| 1 | Langmuir vs BET | `#/adsorption` | `pages/AdsorptionPage.tsx`, `pages/adsorption/*`, `components/SurfaceView.tsx`, `lib/adsorption.ts` | not set; Solid Interfaces |
| 2 | Capillary Pressure | `#/capillary` | `pages/CapillaryPage.tsx`, `pages/capillary/*`, `lib/capillary.ts` | not set; Liquid Interfaces |
| 3 | Mercury Porosimetry | `#/mips` | `pages/mips/*` (formulas inline) | not set; Liquid Interfaces |
| 4 | Surfactants & CMC | `#/surfactants` | `pages/SurfactantPage.tsx`, `pages/surfactants/*`, `lib/surfactants.ts` | not set; Liquid Interfaces |
| 5 | Wetting | `#/wetting` | `pages/WettingPage.tsx`, `pages/wetting/*`, `lib/wetting.ts` | not set; Liquid Interfaces |
| 6 | Zisman Plot | `#/zisman` | `pages/zisman/*` (formulas inline) | not set; Solid Interfaces |
| 7 | SEM/AFM/XPS Explorer | `#/surface-characterisation` | `pages/surface-explorer/*` | not set; Solid Interfaces |
| 8 | Lennard-Jones | `#/lennard-jones` | `pages/lennard-jones/LennardJonesPage.tsx` (also an unlinked legacy `public/lennard-jones.html`) | not set; Molecular & Macroscopic Interactions |
| 9 | Van der Waals | `#/van-der-waals` | `pages/VdwPage.tsx`, `pages/vdw/Theory.tsx`, `lib/vdw.ts` | not set; Molecular & Macroscopic Interactions |
| 10 | Hamaker & Lifshitz | `#/hamaker-lifshitz` | `pages/hamaker/HamakerPage.tsx` (formulas inline) | not set; Molecular & Macroscopic Interactions |
| 11 | Double Layer | `#/double-layer` | `pages/EdlPage.tsx`, `pages/edl/*`, `lib/edl.ts` | not set; Colloidal Systems |
| 12 | Zeta Potential | `#/zeta` | `pages/zeta/*` (formulas inline) | not set; Colloidal Systems |
| 13 | DLVO | `#/dlvo` | `pages/dlvo/*` (formulas inline; `lib/dlvo.ts` is used only by Training) | not set; Colloidal Systems |
| 14 | Nucleation (CNT) | `#/nucleation` | `pages/NucleationPage.tsx`, `pages/nucleation/*`, `lib/nucleation.ts` | not set; Nucleation & Growth |
| 15 | Phase Separation | `#/phase-separation` | `pages/PhaseSeparationPage.tsx`, `pages/phase/*`, `lib/phase.ts` | not set; Nucleation & Growth |
| 16 | Crystal Growth | `#/crystal-growth` | `pages/CrystalPage.tsx`, `pages/crystal/*`, `lib/crystal.ts` | not set; Nucleation & Growth |

**Where the quizzes are:** only the SEM/AFM/XPS page has an on-page quiz (`SurfaceExplorerQuiz.tsx`). All other
questions are in Training: the concept banks in `src/data/practice/*.ts` and the numeric generators in
`src/lib/train*.ts`. I checked all of them.

---

## 1. Langmuir vs BET Adsorption: correct

The equations and code are correct: Langmuir θ = Kx/(1+Kx), BET V/Vₘ = Cx/[(1−x)(1−x+Cx)], the linearised BET
plot, slope (C−1)/(VₘC) and intercept 1/(VₘC), the knee at x = 1/(1+√C), the C < 2 → type III rule, N₂ area
4.35 m² per cm³(STP), Pt area 6/(ρd) and the 210 µC/cm² H-UPD value. Node check: all values match, and the BET plot
recovers Vₘ and C exactly. The fit range 0.05–0.35 and the IUPAC type texts are correct. Every concept question and
generator key checked out (e.g. BET C = 50 at x = 0.8 gives 4.98; Langmuir gives 0.976).

- **ADS-1 MINOR**, `pages/adsorption/Equations.tsx:46`, "K: binding strength (adsorption ÷ desorption rate)".
  K is the ratio of the rate *constants* k_ads/k_des, not of the rates; at equilibrium the rates are equal.
  *Fix:* "ratio of adsorption to desorption rate constants". Standard result. Confidence: high.
- **ADS-2 MINOR**, `pages/AdsorptionPage.tsx:400-401` and `insight.tsx:26-27`. Point B is defined as V = Vₘ
  ("the knee at B"). In Gregg & Sing and IUPAC, point B is the *start of the linear middle section*. It only roughly
  marks monolayer completion, and only for large C. The figure caption already says "(the knee, for large C)"; add
  the same note in the text. Rouquerol ch. 5. Confidence: medium.

## 2. Capillary Pressure & Pore Filling: seriously wrong

Young–Laplace is correct: `capillaryPressure` = 2γcosθ/r, giving 9062 kPa at r = 15 nm and θ = 21° (Node check OK).
The trainer `trainCapillary.ts` is correct. Two of the three readouts are invented.

- **CAP-1 CRITICAL**, `lib/capillary.ts:18-21`: `return 1500 / r` labelled "Jurin rise height (µm)".
  This is not Jurin's law: there is no γ, θ, ρ or g, and the value is wrong by about 10⁷. Jurin gives
  h = 2γcosθ/(ρgr). At the default (r = 15 nm, θ = 21°) that is about 9 × 10⁵ m; the page shows 100 µm (Node
  check). The page also never shows the Jurin equation. For nanometre pores the Jurin height is not physically
  meaningful (cavitation, gravity irrelevant). *Fix:* use h = 2γcosθ/(ρgr) and show it for µm–mm capillaries, or
  replace this readout with the capillary suction head Pc/(ρg) plus a note. Butt/Graf/Kappl ch. 2. Confidence: high.
- **CAP-2 CRITICAL**, `lib/capillary.ts:23-26`: `Math.max(0.05, 1 - 35 / r)` labelled "Kelvin saturation P/P₀".
  This does not match the Kelvin equation shown on the same page (`capillary/Equations.tsx:32`). It is clamped to
  0.05 for every r ≤ 37 nm, which includes the default, and it ignores θ. The real values for water at 25 °C with a
  hemispherical meniscus are 0.94 (r = 15 nm, θ = 21°), 0.59 (2 nm) and 0.98 (50 nm). The site shows 0.05, 0.05
  and 0.30 (Node check). *Fix:* p/p₀ = exp(−2γV_m cosθ/(rRT)), with V_m = 18.07 cm³/mol. Butt/Graf/Kappl ch. 2.
  Confidence: high.
- **CAP-3 MINOR**, `capillary/Equations.tsx:32`. The Kelvin equation has no symbol list: V_m (molar volume of the
  *liquid*), R and T are undefined. The factor 2 is for a hemispherical meniscus (the desorption branch); a
  cylindrical meniscus (adsorption, Cohan) has factor 1. The adsorbed film thickness t is also ignored
  (r_pore = r_K + t). Rouquerol ch. 7. Confidence: high.
- **CAP-4 MAJOR**, `CapillaryPage.tsx:160-164`, "Adsorption hysteresis … arises from contact angle
  advancing/receding differences and pore network geometry effects." This mixes two phenomena. Capillary-condensation
  (sorption) hysteresis comes from a different meniscus shape on filling and emptying (cylindrical vs hemispherical),
  metastable delayed condensation, and pore blocking (ink bottles). Contact-angle hysteresis explains
  imbibition/drainage hysteresis. Also, the Imbibition/Drainage toggle only changes the drawing (`PoreView.tsx:20-22`):
  no advancing or receding angle enters the numbers. *Fix:* separate the two hysteresis types, or make the toggle use
  θ_adv and θ_rec. Rouquerol ch. 7; Butt/Graf/Kappl ch. 7. Confidence: medium-high.
- **CAP-5 MAJOR**, `CapillaryPage.tsx:174-178`, CEP paragraph: "…water electrolyzers … product water floods the
  pore network, starving the active sites of reactant gases (O₂ or H₂)". In an electrolyser, H₂ and O₂ are
  *products* and water is the reactant. The PEM-electrolyser anode porous transport layer is hydrophilic titanium, not
  carbon. "If capillary forces are too high, water floods" is also only true for hydrophilic pores. GDLs work because
  PTFE makes θ > 90° and Pc < 0, but the θ slider stops at 85° (`lib/capillary.ts:11`), so the case the text describes
  cannot be shown. *Fix:* limit the flooding argument to fuel cells and allow θ > 90°. Confidence: high.
- **CAP-6 MINOR**, `CapillaryPage.tsx:174-175`, "catalyst layers and gas diffusion layers (GDLs) consist of complex
  nanoscale porous carbon networks". GDL carbon paper has pores of roughly 10–100 µm and the microporous layer
  about 0.1–1 µm. Only the catalyst layer is nanoscale (roughly 10–100 nm). Confidence: high.
- **CAP-7 MINOR**, `lib/capillary.ts:5`: γ = 72.8 mN/m is the 20 °C value. See C-1. Confidence: high.

## 3. Mercury Intrusion Porosimetry: seriously wrong

- **MIP-1 CRITICAL**, `pages/mips/MipsTryThis.tsx:14`: `equivalentRadius = 1500 / pressureMPa`, shown as
  "Equivalent Entry Radius (r)" (line 68). 1500/P is the *diameter*. With γ_Hg = 0.485 N/m and θ = 140°, Washburn
  gives r = 743/P nm and d = 1486/P nm. At 20 MPa the site shows r = 75 nm; the correct radius is 37 nm (Node check).
  This is a factor-2 error that contradicts the page's own radius equation, P = −2γcosθ/r (`MipsEquations.tsx:18`),
  and the MIPS trainer, which correctly uses d ≈ 1490/P (`lib/trainMips.ts:15`). The pore labels "45 nm … 6 nm"
  (line 42) are therefore diameters. *Fix:* relabel as diameter, or use 743/P for the radius; say which in the pore
  labels. Rouquerol ch. 9. Confidence: high.
- **MIP-2 MAJOR**, `MipsTryThis.tsx:15`: "Cumulative Volume Intruded" = min(100, max(5, P/200·100)) %. This is
  invented: intruded volume follows the pore-size distribution and is not linear in P. It also contradicts the
  drawing: at 200 MPa it shows 100 % while the 6 nm pore (threshold about 250 MPa) is still empty. *Fix:* compute it
  from the drawn pores (sum of the volumes of pores with d ≥ 1486/P), or remove it. Confidence: high.
- **MIP-3 MAJOR**, `MipsTheory.tsx:25-26`, "distinguishing macro-, meso-, and micro-pore networks". MIP cannot
  reach micropores (< 2 nm). At the usual instrument maximum of about 400 MPa (60 000 psi), d ≈ 3.6 nm (Node check).
  *Fix:* "macro- and mesopores down to about 3–4 nm; micropores need gas adsorption". Rouquerol ch. 9; IUPAC.
  Confidence: high.
- **MIP-4 MINOR**, `MipsEquations.tsx:12-18`. θ is undefined, and the typical values (γ_Hg ≈ 0.485 N/m,
  θ ≈ 130–140°) and the cylindrical-pore assumption are not stated. Confidence: high.
- **MIP-5 MINOR**, `MipsInsight.tsx:10-12`, "Mercury Intrusion Porosimetry is the industry standard for mapping
  these pore-size distributions … ensuring that electrode microstructures prevent flooding". This is overstated.
  MIP is common for GDLs and microporous layers, but the high pressure can compress soft catalyst-layer and ionomer
  structure. Mercury is non-wetting in every pore, so MIP cannot tell hydrophilic from hydrophobic pores, which is
  what flooding depends on (that needs water intrusion or the method of standard porosimetry). Confidence: medium.

## 4. Surfactants & Micelle Formation: correct

This is a careful model, with sources cited in the code. Node check, against the literature: SDS CMC 8.2 mM; SDS with
0.1 M NaCl 1.56 mM (literature about 1.4–1.6); C10 sulfate 32.6 mM (about 33); C14 2.06 mM (about 2.1); CTAB
0.92 mM; γ_CMC 39 mN/m; area 0.52 nm²; β 0.64. The Gibbs equation and the Szyszkowski surface excess agree to
10⁻⁴. The Klevens factors (×0.5 per CH₂ for ionic, ×⅓ for non-ionic), the Gibbs n = 2→1 rule, the Wilhelmy and
Du Noüy formulas and the property table are correct, and so is every bank and generator key.

- **SUR-1 MINOR**, `SurfactantPage.tsx:229-231` and `surfactants/Theory.tsx:132`: "once the surface is full, the
  extra molecules hide their tails in micelles". The causality is wrong. Γ is already close to Γmax well below the
  CMC; micellisation is set by the monomer chemical potential in the bulk, not triggered by a full surface. *Fix:*
  "by the time micelles form, the surface is nearly saturated". Hiemenz ch. 8. Confidence: medium.
- **SUR-2 MINOR**, `surfactants/Theory.tsx:208`, "Added Na⁺ or Cl⁻ ions crowd around the charged heads". Only the
  *counter-ions* do this (Na⁺ for SDS, Cl⁻ for CTAB); co-ions are depleted. Confidence: high.
- **SUR-3 MINOR**, `lib/surfactants.ts:240-249` and the table row "Osmotic pressure … almost constant". For ionic
  surfactants the unbound counter-ions (fraction 1 − β ≈ 0.36 for SDS) keep Π rising noticeably above the CMC. The
  code ignores them (it says so in a comment), but the page text says "almost constant". *Fix:* add "(slower rise for
  ionic surfactants)". Confidence: medium.

## 5. Wetting & Contact Angle: correct

Young, Wenzel, Cassie–Baxter and the critical angle cos θ_c = (f_s − 1)/(r − f_s) are correct (Node check: at θ_c
the Wenzel and Cassie angles agree). The trend is right: roughness amplifies the intrinsic tendency. All bank and
generator keys check out (59°, 121°, 159°).

- **WET-1 MINOR**, `lib/wetting.ts:7`: the Young-angle slider goes to 180°. No smooth surface gives water more than
  about 120° (–CF₃ monolayers), so a smooth surface can be badged "superhydrophobic". *Fix:* cap θ_Y at about 120°,
  or add a note. Butt/Graf/Kappl ch. 7. Confidence: high.
- **WET-2 MINOR**, `WettingPage.tsx:145-158`. The Cassie view is offered for hydrophilic θ_Y, where air is not
  trapped and hemiwicking applies. The "favoured state" text also reads as if Cassie cannot exist below θ_c, but
  metastable Cassie states are common (the lotus leaf is one). Add a caveat. Quéré, Annu. Rev. Mater. Res. 2008.
  Confidence: medium.
- **WET-3 MINOR**, `WettingPage.tsx:97-99` and `wetting/Theory.tsx:66`: "θ > 150° is superhydrophobic". The usual
  definition also needs low contact-angle hysteresis (a sliding angle below about 10°). Confidence: high.

## 6. Surface Energy & the Zisman Plot: needs fixes

The Zisman relation cos θ = 1 − b(γ_lv − γ_c) and γ_c at cos θ = 1 are correct. γ_c is about 18 mN/m for PTFE and
about 31 mN/m for PE, both correct. The trainer's test-liquid tensions are correct to 0.1 mN/m.

- **ZIS-1 MAJOR**, `ZismanTryThis.tsx:16` and line 120, "Clean Glass (High Energy, γ_c ≈ 72 mN/m)". Clean glass is a
  high-energy surface on which all the test liquids spread (θ = 0), including water, so γ_c cannot be found from a
  Zisman plot and is not 72. The page shows water at θ ≈ 14° on clean glass. *Fix:* replace it with a low-energy
  solid whose γ_c is measurable (e.g. PMMA ≈ 39, PVC ≈ 39, nylon ≈ 43 mN/m), or state "complete wetting; γ_c not
  determinable". Zisman 1964; Butt/Graf/Kappl ch. 7. Confidence: high.
- **ZIS-2 MINOR**, `ZismanTryThis.tsx:17`: one slope b = 0.03 for every solid. It gives water on PTFE as 130°
  (measured about 108–112°) (Node check). Zisman lines are only linear for homologous non-polar liquids; polar
  liquids such as water bend the curve, and b depends on the solid. Confidence: medium.
- **ZIS-3 MINOR**, `ZismanTryThis.tsx:76`: the drop is always drawn as a 90° semicircle, whatever θ is. The plot's
  y axis only spans cos θ = 0…1, and negative values are clipped (line 60). Confidence: high.
- **ZIS-4 MINOR**, `ZismanTheory.tsx:26`, PTFE "repels water completely". Water forms about 110° on PTFE, not
  complete non-wetting (180°). Also, –CF₃ surfaces are lower still (γ_c ≈ 6 mN/m). Confidence: high.
- **ZIS-5 MAJOR**, `ZismanInsight.tsx:10-11`: "In … PEM fuel cells and water electrolyzers, GDLs must be
  impregnated with … PTFE … cutting off oxygen and hydrogen supply". The same error as CAP-5: PEM-electrolyser anode
  transport layers are hydrophilic Ti (water must reach the anode), and H₂/O₂ are products there. Confidence: high.
- **ZIS-6 MINOR**, `ZismanTryThis.tsx:106`: labels "Hydrophobic / Hydrophilic" for an arbitrary test liquid. Those
  words refer to water; use "non-wetting / wetting". Confidence: high.

## 7. Surface Characterisation Explorer (SEM/AFM/XPS): correct

E_b = hν − E_k − Φ, the attenuation I = I₀exp(−d/λcosθ), the information depth of about 1–10 nm (≈ 3λ), SEM
resolution of about 1–5 nm and AFM vertical resolution below 0.1 nm are all correct. The three on-page quiz keys and
the three bank keys are correct, with exactly one correct option each.

- **SFX-1 MINOR**, `SurfaceExplorerEquations.tsx:13,22`. Φ is undefined (it is the *spectrometer* work function,
  for Fermi-level-referenced binding energies). θ is undefined (the emission angle from the surface normal) and
  clashes with θ as a contact angle elsewhere. Confidence: high.
- **SFX-2 MINOR**, `lib/trainSurface.ts:49-61`. The question always says "Al Kα source" but hν is picked at random
  from 1253.6 eV (that is Mg Kα) and 1486.6 eV. `K$\alpha$` inside a JS template literal loses its backslash and
  renders as "alpha". Two distractors are identical (hν − E_b = E_k + Φ). Confidence: high.
- **SFX-3 MINOR**, `SurfaceExplorerInsight.tsx:11`, "AFM to measure precise roughness and thickness of catalyst
  coated membranes". CCM and catalyst-layer thickness is usually measured from cross-sectional SEM. AFM gives
  roughness and, with phase or conductive modes, the ionomer distribution. Confidence: medium.

## 8. Lennard-Jones Potential Explorer: correct

The code implements V = 4ε[(σ/r)¹² − (σ/r)⁶] and F = −dV/dr correctly, with r_m = 2^{1/6}σ and the maximum
attraction at (26/7)^{1/6}σ. The defaults ε = 1.0 kJ/mol and σ = 3.4 Å are argon's (ε/k ≈ 120 K), which is good. The
bank and generator keys are correct (F(σ) = 24ε/σ).

- **LJ-1 MINOR**, `LennardJonesPage.tsx:116-215`. The page never shows the 12-6 equation itself, only its results.
  Add V(r) = 4ε[(σ/r)¹² − (σ/r)⁶] with its symbols defined. Confidence: high.
- **LJ-2 MINOR**, `lib/trainLennardJones.ts:28,44`. The answer unit is "units", and ε is described as "kJ/mol or
  eV". Force should be in ε/Å (e.g. kJ mol⁻¹ Å⁻¹). Confidence: high.

## 9. Van der Waals Forces: needs fixes

The C coefficients match Israelachvili Table 6.2 (×10⁻⁷⁹ J m⁶). Node check: H₂O Keesom 96.5 (book 96), Debye 10.1
(10), London 33.2 (33); HCl London 106 (106); Ar 50.4 (50). The molecular data are correct. The bank shares (H₂O
Keesom 69 %, HCl London 86 %) are correct, as are all keys.

- **VDW-1 MAJOR**, `vdw/Theory.tsx:76`: the Debye card shows φ = −μ²α₀/((4πε₀)²r⁶), while the code
  (`lib/vdw.ts:66`) uses C_D = 2μ²α′/(4πε₀), twice as much. The card formula is for one dipole polarising a
  *different* molecule. For two identical polar molecules each polarises the other, giving 2μ²α₀. The code is right;
  the displayed equation is half of what is plotted. *Fix:* show C_D = 2μ²α₀/(4πε₀)² for identical molecules (or
  the general (μ₁²α₀₂ + μ₂²α₀₁)). Israelachvili eq. 6.x (Debye). Confidence: high.
- **VDW-2 MINOR**, `lib/vdw.ts:47` (default r = 0.4 nm for H₂O). The angle-averaged Keesom formula needs
  μ²/(4πε₀r³) < kT; for water at 0.4 nm this is 1.3 kT (Node check), so the formula overestimates there (and
  H-bonding takes over). Add the validity condition. Israelachvili ch. 5. Confidence: medium-high.
- **VDW-3 MINOR**, `VdwPage.tsx:410-411`, "Storage in porous carbons or MOFs only works at cryogenic temperatures".
  Better: "gives useful capacities only at about 77 K; at room temperature physisorption stores less than about
  1 wt%". Confidence: medium.

## 10. Hamaker & Lifshitz: needs fixes

The Lifshitz single-oscillator formula (static plus dispersion term), sphere–plane W = −AR/6D and plane–plane
W = −A/12πD² (in mJ/m²) are correct. Node check: silica/water/silica 0.68 × 10⁻²⁰ J (book 0.63–0.83) and PTFE in
vacuum 3.80 × 10⁻²⁰ J (book 3.8). The air/hexane/silica "repulsive case" correctly gives A < 0, a wetting film. The
trainer keys (combining relation, plane, sphere) are correct.

- **HAM-1 MAJOR**, `HamakerPage.tsx:26,31`. One absorption frequency ν_e = 3 × 10¹⁵ Hz is used for every material.
  That is fine for silica and hydrocarbons, but far too high for high-index oxides. TiO₂/water/TiO₂ comes out at
  26 × 10⁻²⁰ J; Lifshitz literature values are about 5–6 × 10⁻²⁰ J (Bergström 1997, rutile) (Node check). *Fix:*
  give each material its own ν_e (TiO₂ ≈ 1.2 × 10¹⁵ Hz), or drop TiO₂. Israelachvili ch. 13; Bergström, Adv. Colloid
  Interface Sci. 70 (1997). Confidence: medium (TiO₂ ν_e and A from memory).
- **HAM-2 MINOR**, `HamakerPage.tsx:35-37`. The zero-frequency (static) term is screened by electrolyte; in salt
  water it largely disappears (Israelachvili §13.x). Add a note. Confidence: medium-high.
- **HAM-3 MINOR**: the page never shows the Lifshitz/Hamaker equation, only the geometry formulas in the caption.
  Confidence: high.
- **HAM-4 MINOR**, `HamakerPage.tsx:287-289`, "Choosing a solvent whose refractive index is close to the particles
  … keeps the slurry dispersed". Correct in principle, but not feasible for the absorbing, conducting particles in
  electrode slurries (carbon black, Pt, NMC, graphite; carbon has A of about 25–30 × 10⁻²⁰ J). Those slurries are
  stabilised by binders and polymers (steric) or by charge. Confidence: medium.

## 11. Electrical Double Layer (Gouy–Chapman–Stern): correct

κ⁻¹, Grahame, the GC potential profile, Boltzmann ion profiles, C_d = ε₀ε_rκcosh(…), C_Stern = ε₀ε_S/δ and the series
capacitance are all correct. Node check: κ⁻¹ = 3.04 nm at 10 mM and 9.62 nm at 1 mM (the 0.304/√I rule); halved for
2:2; GC C(200 mV) = 561 µF/cm² (bank: 560); C_Stern = 17.7 µF/cm² (bank: about 18); the GCS charge balance closes;
ψ(κ⁻¹) = ψ₀/e at low potential. All bank and generator keys are correct.

- **EDL-1 MINOR**, `edl/Theory.tsx:72-73`, "Pores must be wider than the double layer (and the ions) to use their
  surface". Since Chmiola et al. (Science 2006), sub-nm pores that desolvate the ions are known to *raise* the
  specific capacitance. Add this. Confidence: medium.
- **EDL-2 MINOR**, `edl/Theory.tsx:68`, "1 M salts or ionic liquids keep κ⁻¹ well below 1 nm". Debye–Hückel and
  Gouy–Chapman do not apply to ionic liquids (crowding and overscreening; Kornyshev 2007). Also GC itself is
  unreliable above about 0.1 M, while the slider goes to 1 M and 3:3. Confidence: medium.
- **EDL-3 MINOR**: typical capacitance is given as "5–20 µF/cm²" here (`edl/Theory.tsx:64`) but as "10–30 µF/cm²" in
  `lib/trainEdl.ts:36`. Pick one range. Confidence: high.

## 12. Zeta Potential & Isoelectric Point: needs fixes

The trainer `trainZeta.ts` is correct (Smoluchowski, IEP interpolation). The page's own numbers are not.

- **ZET-1 CRITICAL**, `ZetaTryThis.tsx:18`: `mobility = 0.8 * zetaNum`, in (µm/s)/(V/cm). Smoluchowski in water at
  25 °C gives u = ε₀ε_rζ/η = 0.078 (µm·cm)/(V·s) per mV, so 1 unit ≈ 12.8 mV (the standard rule of thumb). The page
  is 10× too high: at pH 12 it shows −48 where the correct value is −4.7 (Node check). It also contradicts the
  site's own Training. *Fix:* u = 0.0781·ζ[mV]. Hiemenz ch. 12. Confidence: high.
- **ZET-2 MINOR**, `ZetaTryThis.tsx:16,19` and `ZetaEquations.tsx:30-31`. ζ = −12(pH − 7) is linear and unbounded;
  real ζ(pH) curves are sigmoidal and level off at high and low pH. The stability threshold is 25 mV in the code but
  30 mV in the equation card. "|ζ| > 30 mV (Stable)" is typeset like a law but is a rule of thumb that depends on
  ionic strength and particle size. Confidence: high.
- **ZET-3 MAJOR**, `ZetaTheory.tsx:27-31` (also the concept tag "IEP = PZC" at `data/subtopics.ts:165`). "At the IEP
  … zero net surface charge (PZC)". IEP = PZC only without specific adsorption (indifferent electrolyte). Specifically
  adsorbed ions shift the IEP and the PZC in opposite directions, which is how specific adsorption is detected. Likely
  "matches notes, but incomplete per textbook". *Fix:* add "in the absence of specific adsorption". Hiemenz ch. 11–12;
  Lyklema. Confidence: high.
- **ZET-4 MINOR**, `ZetaEquations.tsx:11-18`. The title is "Henry's / Smoluchowski", but only Smoluchowski is shown,
  and ε (= ε₀ε_r) is undefined. Henry: u = 2εζf(κa)/(3η), with f running from 1 (Hückel, κa ≪ 1) to 1.5
  (Smoluchowski, κa ≫ 1). State the κa ≫ 1 condition. Confidence: high.
- **ZET-5 MINOR**, `ZetaTheory.tsx:11`, "H⁺ and OH⁻ adsorb specifically onto the surface". They are
  potential-determining ions (protonating or deprotonating surface –OH groups). "Specific adsorption" usually means
  other ions entering the Stern layer, which is the very thing that breaks IEP = PZC. Confidence: medium.
- **ZET-6 MAJOR**, `ZetaInsight.tsx:8-13`. "Managing zeta potential (P<sub>c</sub> and ζ)" contains a stray "Pc"
  copied from the capillary page. "…agglomeration, starving active sites of reactant gases (O₂ or H₂)" is the same
  copied sentence; agglomeration lowers ECSA and catalyst-layer uniformity, it does not starve sites of gas.
  "Tuning ink pH" is not the main handle: Pt/C inks are stabilised mostly by adsorbed ionomer (electrosteric) and
  the solvent mix, and Nafion makes the ink acidic anyway. Confidence: medium.

## 13. DLVO & Colloid Stability: seriously wrong (page); `lib/dlvo.ts` is correct

`lib/dlvo.ts` (used only by Training) is textbook DLVO for equal spheres: V_R = 64πa n kT γ²/κ² e^{−κh} and
V_A = −Aa/12h. It is correct.

- **DLV-1 CRITICAL**, `DlvoTryThis.tsx:15-16,34-35`:
  `barrierHeight = max(0, 25 − c·z⁶/15)` and an energy curve `50·exp(−dist·(0.5 + 0.05·c·z)) − 30/(dist + 0.5) + …`.
  This is not DLVO. The screening rate is linear in c·z (it should be κ ∝ z√c). There is no primary minimum (the
  curve is finite at contact). The barrier in "kT" is invented. Results versus `lib/dlvo.ts` (ψ₀ = 50 mV, a = 100 nm,
  A = 5 × 10⁻²⁰ J), from the Node check:

  | 1:1 salt | page barrier | DLVO barrier |
  |---|---|---|
  | 1 mM | 24.9 kT | 136 kT |
  | 10 mM | 24.3 kT | 72 kT |
  | 100 mM | 18.3 kT ("stable") | 0 (coagulated; CCC ≈ 64 mM) |

  With a 1:1 salt the page never coagulates anywhere on its 1–100 mM slider; it would need more than 300 mM. *Fix:*
  drive the page from `lib/dlvo.ts` (barrier, curve and CCC) and label the axes in kT and nm. Israelachvili ch. 14;
  Hiemenz ch. 13. Confidence: high.
- **DLV-2 MAJOR**, `DlvoEquations.tsx:26`, "The CCC decreases exponentially with the valency". It is a power law,
  CCC ∝ z⁻⁶, not exponential. Confidence: high.
- **DLV-3 MINOR**, `DlvoTheory.tsx:27`, `DlvoEquations.tsx:31`, `data/practice/dlvo.ts:15`. CCC ∝ 1/z⁶ holds only
  at high surface potential (γ = tanh(zeψ₀/4kT) → 1). At low ψ₀, CCC ∝ ψ₀⁴/z². The site's own DLVO gives a
  z = 1 : z = 2 CCC ratio of 15 at 75 mV and 4.6 at 20 mV, not 64 (Node check). The bank lists "CCC ∝ 1/z²" as a
  wrong option. That is fine given "Schulze–Hardy rule" in the stem, but the explanation should name the limit (the
  trainer already says "high surface potential"). Confidence: high.
- **DLV-4 MINOR**, `DlvoInsight.tsx:8-12`. NMC cathode slurries are in NMP with PVDF binder: an organic, nearly
  ion-free medium, where DLVO electrostatics plays a small role and binder/steric effects dominate. "Impurities
  introduce excess salt … the DLVO barrier collapses" fits aqueous slurries (graphite/CMC anodes, catalyst inks)
  better. Confidence: medium.

## 14. Classical Nucleation Theory: correct

ΔG(d), d* = 4γV_m/(kT ln S), ΔG* = 16πγ³V_m²/[3(kT ln S)²] = πd*²γ/3 and f(θ) = (2+cosθ)(1−cosθ)²/4 (with θ measured
through the nucleus) are correct. Node check: d* = 1.81 nm and ΔG* = 83.6 kT at the defaults (it equals the maximum
of ΔG(d)); f(60°) = 0.156, f(90°) = 0.5, f(150°) = 0.987; 70 kT ↔ 30.4 decades. The trends are right. The
θ_gas = 180° − θ_liquid explanation is correct. All bank and generator keys are correct.

- **NUC-1 MINOR**, `NucleationPage.tsx:310` and `nucleation/Equations.tsx:96-99`. The log₁₀ J axis has no unit;
  J₀ = 10³⁰ should be given per m³·s (homogeneous). Confidence: high.
- **NUC-2 MINOR**, `nucleation/Theory.tsx:59-62`. Electrode bubbles often grow from pre-existing gas cavities and
  pits (non-classical "type III/IV" nucleation, Jones et al. 1999), because classical heterogeneous nucleation on a
  flat surface still needs very high supersaturation. Add this. Confidence: medium.

## 15. Phase Separation: correct

The regular solution with χ = 2T_c/T, the spinodal x = ½ ± ½√(1 − 2/χ), the symmetric binodal
ln(x/(1−x)) + χ(1−2x) = 0, the region logic (d²G/dx² sign) and the barrier πd*²γ/3 are all verified in the Node
check. The Cahn–Hilliard animation is a correct form. All bank and generator keys are correct.

- **PHA-1 MINOR**, `PhaseSeparationPage.tsx:40`, "becomes unstable and splits into an x₁-rich and an x₂-rich
  phase". In the metastable region it is not unstable, and the phases *have* compositions x₁ and x₂. *Fix:*
  "becomes unstable or metastable and splits into phases of composition x₁ and x₂". Confidence: high.
- **PHA-2 MINOR**, `PhaseSeparationPage.tsx:110-112`, LiFePO₄: "Fast cycling and small particles shift it between
  nucleation-type and spinodal-type separation". The literature result is that high rates and nanoparticles
  *suppress* phase separation (a solid-solution path; Malik, Bazant et al.). Confidence: medium.
- **PHA-3 MINOR**, `PhaseSeparationPage.tsx:115-117`, phase inversion "for separators and electrolyser or
  fuel-cell membranes". PEM (Nafion-type) membranes are dense cast ionomer. Phase inversion makes porous diaphragms
  (e.g. Zirfon for alkaline electrolysis) and some separators. Confidence: medium.
- **PHA-4 MINOR**, `PhaseSeparationPage.tsx:25` and the bank. "Spinodal → interconnected network" holds near the
  critical composition; off-critical spinodal quenches give droplet morphologies. Add "near 50:50". Confidence:
  medium.

## 16. Crystal Growth & Shape: correct

The facet geometry and survival thresholds (1/√2, √2), "slow faces win", Wulff h ∝ γ, the BCF form
(σ²/σ₁)tanh(σ₁/σ) (Node check: parabolic, then linear), surface control at low S and diffusion control at high S, and
R = (3α/β)ρ_cG with the diffusion-controlled G (dimensions check) are all correct (Mullin ch. 6). All bank and
generator keys are correct.

- **CRY-1 MINOR**, `crystal/Equations.tsx:42,55`, "a*: equilibrium (saturation) activity, mol/m³". Activity is
  dimensionless; here it is the saturation *concentration* c*, with S = c/c*. Probably matches the course notes'
  notation, but it is incorrect per textbook. Confidence: medium.
- **CRY-2 MINOR**, `CrystalPage.tsx:437-439`, "octahedra that expose the more active {111} facets". This holds for
  Pt₃Ni(111) and for Pt(111) versus Pt(100) in non-adsorbing HClO₄. In H₂SO₄, Pt(111) is the *least* active facet
  because of (bi)sulfate adsorption. *Fix:* "e.g. Pt₃Ni octahedra with very active {111} facets". Stamenkovic et al.,
  Science 2007; Marković. Confidence: medium.
- **CRY-3 MINOR**, `CrystalPage.tsx:445-447` and `data/practice/crystal.ts:51-55`. Dendrites in the diffusion-limited
  sense need high current (above Sand's limit), but mossy and whisker Li also grows at low current (SEI-driven). The
  bank's distractor "the charging current is very low" is acceptable, but the explanation should say "tip-growing,
  diffusion-limited dendrites". Confidence: medium.

## 17. Consistency across demos (all MINOR)

- **C-1, water surface tension.** 72.8 mN/m (20 °C) in `lib/wetting.ts:12`, `lib/capillary.ts:5` and the trainers,
  but 72.0 mN/m (25 °C) in `lib/surfactants.ts:26`. The Kelvin, EDL and Hamaker pages use 298 K. Pick 25 °C and
  72.0 mN/m everywhere, or state the temperature.
- **C-2, temperature.** 293 K (vdW), 298 K (Hamaker, EDL, Phase, Nucleation) and 298.15 K (Surfactants). Harmless,
  but worth unifying.
- **C-3, V_m means three things.** The BET monolayer capacity (`adsorption/*`), the volume of one molecule
  (`nucleation/Equations.tsx:47`, `lib/phase.ts:129`) and, undefined, the liquid molar volume in Kelvin
  (`capillary/Equations.tsx:32`). Use v_m (molecular) and V_mol (molar) for the last two.
- **C-4, θ means four things.** Langmuir coverage, contact angle (through the liquid in Wetting and Capillary,
  through the nucleus in Nucleation), and the XPS emission angle. Nucleation states its convention explicitly, which
  is good; Langmuir θ is standard. Define θ on the XPS card.
- **C-5, stability thresholds.** ζ: 25 mV in code vs 30 mV in text (Zeta). Barrier: "< 5 kT = coagulated" on the
  DLVO page vs "≥ 15 kT = stable" in `lib/dlvo.ts:21` and Training.
- **C-6, typical double-layer capacitance.** 5–20 µF/cm² (EDL page) vs 10–30 µF/cm² (EDL trainer).
- **C-7, page vs Training for the same quantity.** MIPS (radius 1500/P vs diameter 1490/P), Zeta (0.8ζ vs 0.078ζ)
  and DLVO (toy barrier vs `lib/dlvo.ts`) disagree, so a student who checks the demo against the trainer gets
  different answers. Sign conventions are consistent everywhere (negative W/V = attraction; LJ F > 0 = repulsive;
  Hamaker A > 0 = attraction).

## What I could not verify

- **Lecture chapter mapping.** The `chapter` field is unset (TODO) and the course notes are not in the repository, so
  I could not map demos to chapters, or flag findings as "matches notes, but incorrect per textbook" with certainty.
  ZET-3 (IEP = PZC), CRY-1 (a* as an activity in mol/m³) and the CCC ∝ 1/z⁶ framing (DLV-3) look like course-notes
  shorthand.
- **TiO₂ Hamaker constant and ν_e (HAM-1).** The values (A ≈ 5–6 × 10⁻²⁰ J in water, ν_e ≈ 1.2 × 10¹⁵ Hz) are
  from memory of Bergström (1997). The direction and size of the error (about 4×) are solid; the exact reference
  values should be checked.
- **Literature-dependent CEP claims.** LiFePO₄ (PHA-2), Pt facet activity (CRY-2), sub-nm pore capacitance (EDL-1),
  ink stabilisation (ZET-6) and NMC slurry stabilisation (DLV-4) are medium-confidence summaries of the literature,
  not textbook results.
- **Animations.** The adsorption kinetic simulation (`SurfaceView.tsx`), DLA/kinetic Monte Carlo and Cahn–Hilliard
  were checked by reading the code only. I did not run them in a browser to compare their long-time averages with
  the equations; the adsorption one is designed to match, and its equilibrium stack distribution is correct BET.
- **Sample powder areas.** Pt black about 25, IrO₂ about 30, Vulcan about 240 and Ketjenblack about 800 m²/g are
  typical, but IrO₂ in particular varies widely (about 10–200 m²/g) with synthesis.
- **Legacy `public/lennard-jones.html`.** It is not linked from the app and was only skimmed: a generalised n-6
  potential, which looked correct.
