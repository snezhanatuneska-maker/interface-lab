// Independent science verification of the 16 Interface Lab demos (see VERIFICATION_REPORT.md).
//
// Kept outside src/, so it is not part of the site build. Run with:  npx vitest run tests/science.test.js
//
// Method: every reference value below is computed here from the textbook equation with CODATA constants (or
// quoted from Israelachvili / Butt–Graf–Kappl / Hiemenz / Mullin), NOT from the site's constants. The site's own
// functions (src/lib) are imported; formulas that live inline in page components are copied verbatim, with the
// source file named next to the copy. A failing test is a finding, not a test bug: each one is discussed in the report.

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import * as ads from '../src/lib/adsorption'
import * as cap from '../src/lib/capillary'
import * as surf from '../src/lib/surfactants'
import * as wet from '../src/lib/wetting'
import * as vdw from '../src/lib/vdw'
import * as edl from '../src/lib/edl'
import * as dlvo from '../src/lib/dlvo'
import * as nuc from '../src/lib/nucleation'
import * as phase from '../src/lib/phase'
import * as cry from '../src/lib/crystal'
import { GAMMA_HG, THETA_HG, generateMips } from '../src/lib/trainMips'
import { ETA_WATER, generateZeta } from '../src/lib/trainZeta'
import { makeRng } from '../src/lib/random'
import { DIFFICULTIES } from '../src/lib/training'
import { generateBet } from '../src/lib/trainBet'
import { generateCapillary } from '../src/lib/trainCapillary'
import { generateColloid } from '../src/lib/trainColloid'
import { generateEdl } from '../src/lib/trainEdl'
import { generateHamaker } from '../src/lib/trainHamaker'
import { generateLennardJones } from '../src/lib/trainLennardJones'
import { generateNucleation } from '../src/lib/trainNucleation'
import { generatePhase } from '../src/lib/trainPhase'
import { generateSurface } from '../src/lib/trainSurface'
import { generateSurfactant } from '../src/lib/trainSurfactant'
import { generateVdw } from '../src/lib/trainVdw'
import { generateWetting } from '../src/lib/trainWetting'
import { generateZisman } from '../src/lib/trainZisman'
import { generateCrystal } from '../src/lib/trainCrystal'
import { generateIsotherm } from '../src/lib/trainIsotherm'

// ---------- Independent constants (CODATA 2018) ----------
const kB = 1.380649e-23
const NA = 6.02214076e23
const e = 1.602176634e-19
const eps0 = 8.8541878128e-12
const h = 6.62607015e-34
const R = kB * NA
const RAD = Math.PI / 180
const cosd = (t) => Math.cos(t * RAD)
const acosd = (c) => Math.acos(Math.max(-1, Math.min(1, c))) / RAD

/** Relative closeness. */
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1e-300)
const near = (a, b, tol) => expect(rel(a, b), `${a} vs ${b}`).toBeLessThan(tol)

/** Parse the first number of a formatted string: "3.1 × 10⁻⁵ nm", "−4.2 mV", "1,234". */
const SUP = { '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }
function num(s) {
  const t = s.replace(/−/g, '-').replace(/,/g, '')
  const m = t.match(/-?\d+(\.\d+)?(\s*×\s*10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+))?/)
  if (!m) return NaN
  let v = parseFloat(m[0])
  if (m[3]) v *= 10 ** Number([...m[3]].map((c) => SUP[c]).join(''))
  return v
}
const nums = (s) => [...s.replace(/−/g, '-').matchAll(/-?\d+(\.\d+)?/g)].map((m) => parseFloat(m[0]))

/** Every problem from a generator: 300 seeds × 3 difficulties. */
function problems(gen, seeds = 300) {
  const out = []
  for (const d of DIFFICULTIES) for (let s = 0; s < seeds; s++) out.push({ d, s, p: gen(makeRng(s), d) })
  return out
}

/**
 * Answer-key check: the keyed option must be the option closest to the independently computed answer, and within
 * `tol` of it. Returns the failures so the report can quote them.
 */
function keyFailures(list, solve, tol) {
  const bad = []
  for (const { d, s, p } of list) {
    const truth = solve(p)
    if (truth === undefined) continue
    const vals = p.options.map(num)
    const keyed = vals[p.answer]
    const closest = vals.reduce((bi, v, i) => (Math.abs(v - truth) < Math.abs(vals[bi] - truth) ? i : bi), 0)
    if (closest !== p.answer || rel(keyed, truth) > tol) bad.push({ d, s, truth, keyed: p.options[p.answer], options: p.options, q: p.question })
  }
  if (bad.length) console.log(`key check: ${bad.length} of ${list.length} fail; first: [${bad[0].d} seed ${bad[0].s}]`, bad[0].q, '| options', bad[0].options, '| keyed', bad[0].keyed, '| independent', bad[0].truth)
  return bad
}

// =====================================================================================================
// 1. Langmuir vs BET
// =====================================================================================================
describe('1 Adsorption (Langmuir, BET)', () => {
  it('Langmuir: θ → 1 as P → ∞, θ ≈ Kx at low x, θ = ½ at x = 1/K', () => {
    expect(ads.langmuirTheta(1e9, 50)).toBeGreaterThan(0.999999)
    near(ads.langmuirTheta(1e-6, 50), 50e-6, 1e-4)
    near(ads.langmuirTheta(1 / 37, 37), 0.5, 1e-12)
    near(ads.langmuirTheta(0.1, 200), 20 / 21, 1e-12) // bank: 0.95
    near(ads.langmuirTheta(0.1, 1), 0.1 / 1.1, 1e-12) // bank: 0.09
  })
  it('BET: textbook values, reduces to Langmuir (K = C) at low x, V = Vm at x = 1/(1+√C)', () => {
    const bet = (x, C) => (C * x) / ((1 - x) * (1 - x + C * x))
    for (const [x, C] of [[0.8, 50], [0.05, 50], [0.3, 100], [0.2, 5]]) near(ads.betLoading(x, C), bet(x, C), 1e-12)
    near(ads.betLoading(0.8, 50), 4.975, 1e-3) // bank "about 5 layers"
    near(ads.betLoading(0.05, 50), 0.763, 2e-3) // bank 0.76
    near(ads.betLoading(1e-6, 80), ads.langmuirTheta(1e-6, 80), 1e-4)
    for (const C of [4, 50, 300]) near(ads.betLoading(ads.kneeX(C), C), 1, 1e-12)
    near(ads.kneeX(50), 0.124, 3e-3) // bank 0.12
  })
  it('BET plot: slope and intercept give back Vm and C', () => {
    for (const [Vm, C] of [[55, 80], [3.2, 12], [230, 400]]) {
      const xs = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3]
      const ys = xs.map((x) => ads.betTransform(x, Vm * ads.betLoading(x, C)))
      const fit = ads.fitLine(xs, ys)
      near(fit.slope, (C - 1) / (Vm * C), 1e-9)
      near(fit.intercept, 1 / (Vm * C), 1e-9)
      const back = ads.betFromLine(fit.slope, fit.intercept)
      near(back.Vm, Vm, 1e-9)
      near(back.C, C, 1e-9)
    }
  })
  it('N₂ area per cm³(STP): 4.35 m²; Pt 6/(ρd)', () => {
    near(ads.AREA_PER_VM, (NA * 0.162e-18) / 22414, 1e-9)
    near(ads.AREA_PER_VM, 4.35, 2e-3)
    near(ads.ptAreaPerGram(3), 6 / (21.45e6 * 3e-9), 1e-12) // 93.2 m²/g
    near(ads.ptAreaPerGram(3), 93.2, 1e-3)
  })
  it('trend: higher K or C raises the loading at fixed x', () => {
    expect(ads.langmuirTheta(0.1, 100)).toBeGreaterThan(ads.langmuirTheta(0.1, 10))
    expect(ads.betLoading(0.1, 100)).toBeGreaterThan(ads.betLoading(0.1, 10))
    expect(ads.betLoading(0.9, 50)).toBeGreaterThan(ads.betLoading(0.5, 50))
  })
})

// =====================================================================================================
// 2. Capillary pressure
// =====================================================================================================
describe('2 Capillary (Young–Laplace, Jurin, Kelvin)', () => {
  const g = 0.07197 // water, 25 °C (CRC)
  const rho = 997.05
  const Vmol = 0.018015 / rho
  const T = 298.15
  it('Young–Laplace 2γcosθ/r (kPa)', () => {
    near(cap.capillaryPressure(15, 0), (2 * g) / 15e-9 / 1e3, 2e-3) // 9.6 MPa
    near(cap.capillaryPressure(15, 21), ((2 * g * cosd(21)) / 15e-9) / 1e3, 2e-3)
    near(cap.capillaryPressure(2, 60), ((2 * g * 0.5) / 2e-9) / 1e3, 2e-3)
    expect(Math.abs(cap.capillaryPressure(15, 90))).toBeLessThan(1e-9)
    expect(cap.capillaryPressure(15, 120)).toBeLessThan(0)
  })
  it('Jurin: 1.47 cm for r = 1 mm (radius), 14.7 m for r = 1 µm', () => {
    near(cap.jurinHeight(1e6, 0), (2 * g) / (rho * 9.80665 * 1e-3), 3e-3)
    near(cap.jurinHeight(1e3, 0), 14.7, 5e-3)
    near(cap.jurinHeight(15, 21), (2 * g * cosd(21)) / (rho * 9.80665 * 15e-9), 3e-3) // ~920 m
  })
  it('Kelvin (hemispherical meniscus), water 25 °C', () => {
    const k = (r, t) => Math.exp((-2 * g * Vmol * cosd(t)) / (r * 1e-9 * R * T))
    for (const [r, t] of [[2, 0], [15, 21], [50, 0], [5, 45]]) near(cap.kelvinRatio(r, t), k(r, t), 2e-3)
    near(cap.kelvinRatio(2, 0), 0.59, 5e-3)
    near(cap.kelvinRatio(1e9, 0), 1, 1e-6) // flat surface limit
    near(cap.kelvinRatio(15, 90), 1, 1e-12)
  })
  it('trends: smaller r → larger |Pc| and lower p/p₀; larger θ (<90°) → smaller Pc', () => {
    expect(cap.capillaryPressure(5, 21)).toBeGreaterThan(cap.capillaryPressure(20, 21))
    expect(cap.kelvinRatio(5, 21)).toBeLessThan(cap.kelvinRatio(20, 21))
    expect(cap.capillaryPressure(15, 60)).toBeLessThan(cap.capillaryPressure(15, 20))
  })
})

// =====================================================================================================
// 3. Mercury porosimetry (formulas copied from src/pages/mips/MipsTryThis.tsx)
// =====================================================================================================
describe('3 Mercury intrusion porosimetry', () => {
  const WASHBURN = -4 * GAMMA_HG * Math.cos((THETA_HG * Math.PI) / 180)
  const entryDiameter = (P) => (WASHBURN / (P * 1e6)) * 1e9
  const entryPressure = (d) => WASHBURN / (d * 1e-9) / 1e6
  const PORES = [45, 30, 20, 12, 6]
  const intruded = (P) => {
    const vol = (d) => d * d
    const filled = PORES.filter((d) => P >= entryPressure(d))
    return (100 * filled.reduce((a, d) => a + vol(d), 0)) / PORES.reduce((a, d) => a + vol(d), 0)
  }
  it('Washburn d = −4γcosθ/P: 1486/P nm with γ = 0.485 N/m, θ = 140°', () => {
    const ref = (P) => ((-4 * 0.485 * cosd(140)) / (P * 1e6)) * 1e9
    for (const P of [20, 100, 400]) near(entryDiameter(P), ref(P), 1e-9)
    near(entryDiameter(1), 1486, 1e-3)
    near(entryDiameter(400), 3.7, 0.01) // "3–4 nm at 400 MPa"
    near(entryDiameter(414), 3.6, 0.01) // 60 000 psi
    expect(entryPressure(entryDiameter(37))).toBeCloseTo(37, 9)
  })
  it('limits: θ = 90° needs no pressure; θ < 90° would be spontaneous', () => {
    expect(-4 * 0.485 * cosd(90)).toBeCloseTo(0, 12)
    expect(-4 * 0.485 * cosd(60)).toBeLessThan(0)
  })
  it('intruded share is monotonic and reaches 100 % only when the 6 nm pore fills', () => {
    let last = -1
    for (let P = 5; P <= 250; P++) {
      expect(intruded(P)).toBeGreaterThanOrEqual(last)
      last = intruded(P)
    }
    expect(intruded(247)).toBeLessThan(100)
    expect(intruded(250)).toBe(100)
    near(intruded(50), (100 * (45 * 45 + 30 * 30)) / (45 * 45 + 30 * 30 + 400 + 144 + 36), 1e-12)
  })
})

// =====================================================================================================
// 4. Surfactants
// =====================================================================================================
describe('4 Surfactants & CMC', () => {
  it('literature CMCs (25 °C): SDS 8.2 mM, CTAB ~0.9–1.0 mM, C10 sulfate ~33 mM, C14 ~2.1 mM', () => {
    near(surf.cmc('anionic', 12, 0) * 1e3, 8.2, 0.01)
    near(surf.cmc('cationic', 16, 0) * 1e3, 0.92, 0.1)
    near(surf.cmc('anionic', 10, 0) * 1e3, 33, 0.05)
    near(surf.cmc('anionic', 14, 0) * 1e3, 2.1, 0.05)
  })
  it('SDS in 0.1 M NaCl: ~1.4–1.6 mM (Corrin–Harkins); salt never raises the CMC', () => {
    const c = surf.cmc('anionic', 12, 0.1) * 1e3
    expect(c).toBeGreaterThan(1.3)
    expect(c).toBeLessThan(1.7)
    expect(surf.cmc('anionic', 12, 0.01)).toBeLessThan(surf.cmc('anionic', 12, 0))
    expect(surf.cmc('nonionic', 12, 0.1)).toBe(surf.cmc('nonionic', 12, 0))
  })
  it('Klevens: ×10^−0.3 ≈ ½ per CH₂ (ionic), ×10^−0.5 ≈ ⅓ (non-ionic)', () => {
    near(surf.cmc('anionic', 13, 0) / surf.cmc('anionic', 12, 0), 10 ** -0.3, 1e-9)
    near(surf.cmc('nonionic', 13, 0) / surf.cmc('nonionic', 12, 0), 10 ** -0.5, 1e-9)
  })
  it('Gibbs: Γ = −(1/nRT) dγ/dln c reproduces the Szyszkowski/Langmuir Γ; area per SDS ≈ 0.52 nm²', () => {
    for (const [head, tail, salt] of [['anionic', 12, 0], ['cationic', 16, 0.05], ['nonionic', 12, 0]]) {
      const s = surf.makeSystem(head, tail, salt)
      const c = s.cmc / 5
      const dl = 1e-5
      const dgdl = (surf.surfaceTension(s, c * Math.exp(dl)) - surf.surfaceTension(s, c * Math.exp(-dl))) / (2 * dl)
      near(-dgdl / (s.n * R * surf.T), surf.surfaceExcess(s, c), 1e-4)
      near(surf.surfaceTension(s, s.cmc), surf.HEADS[head].gammaCmc, 1e-9) // continuous at the CMC
      expect(surf.surfaceTension(s, 10 * s.cmc)).toBe(surf.surfaceTension(s, s.cmc)) // flat above
    }
    near(1 / (3.2e-6 * NA) * 1e18, 0.519, 2e-3)
    near(surf.areaPerMolecule(3.2e-6), 0.519, 2e-3)
    near(surf.counterionBinding('anionic'), 0.64, 0.01)
  })
  it('limits: γ = γ₀ with no surfactant; Gibbs n = 2 → 1 with excess salt', () => {
    expect(surf.surfaceTension(surf.makeSystem('anionic', 12, 0), 0)).toBe(surf.GAMMA_0)
    expect(surf.gibbsN('anionic', 8e-3, 0)).toBe(2)
    expect(surf.gibbsN('anionic', 1e-3, 10)).toBeLessThan(1.001)
  })
})

// =====================================================================================================
// 5. Wetting
// =====================================================================================================
describe('5 Wetting (Young, Wenzel, Cassie–Baxter)', () => {
  it('Young: cos θ = (γSV − γSL)/γLV', () => {
    near(wet.youngFromTensions(40, 20, 72.8).theta, acosd(20 / 72.8), 1e-12)
    near(wet.youngFromTensions(20, 40, 50).theta, acosd(-0.4), 1e-12)
    expect(wet.youngFromTensions(100, 10, 72.8).limit).toBe('complete wetting')
  })
  it('Wenzel with r = 1 and Cassie with f_s = 1 give Young; textbook numbers', () => {
    for (const t of [20, 70, 110]) {
      near(wet.wenzelAngle(t, 1), t, 1e-9)
      near(wet.cassieAngle(t, 1), t, 1e-9)
    }
    near(wet.wenzelAngle(70, 1.5), 59.1, 2e-3)
    near(wet.wenzelAngle(110, 1.5), 120.9, 2e-3)
    near(wet.cassieAngle(110, 0.1), 159.1, 2e-3)
    near(wet.cassieAngle(110, 1e-9), 180, 1e-4) // f_s → 0: drop on air
  })
  it('critical angle: Wenzel and Cassie energies equal at θc (cos θc = (fs − 1)/(r − fs))', () => {
    for (const [r, fs] of [[1.5, 0.5], [3, 0.1], [2, 0.3]]) {
      const tc = wet.criticalAngle(r, fs)
      near(r * cosd(tc), fs * (cosd(tc) + 1) - 1, 1e-9)
      expect(tc).toBeGreaterThan(90)
    }
  })
  it('trend: roughness amplifies the existing tendency', () => {
    expect(wet.wenzelAngle(60, 2)).toBeLessThan(60)
    expect(wet.wenzelAngle(100, 2)).toBeGreaterThan(100)
  })
})

// =====================================================================================================
// 6. Zisman (formula copied from src/pages/zisman/ZismanTryThis.tsx)
// =====================================================================================================
describe('6 Zisman plot', () => {
  const GAMMA_C = { teflon: 18, pe: 31, nylon: 42 }
  const angle = (sub, g) => acosd(Math.min(1, Math.max(-1, 1 - 0.03 * (g - GAMMA_C[sub]))))
  it('γ_c values: PTFE ≈ 18, PE ≈ 31, nylon 6,6 ≈ 42–46 mN/m (Zisman; compiled tables)', () => {
    expect(GAMMA_C.teflon).toBeGreaterThanOrEqual(18)
    expect(GAMMA_C.teflon).toBeLessThanOrEqual(19.5)
    expect(GAMMA_C.pe).toBeGreaterThanOrEqual(31)
    expect(GAMMA_C.pe).toBeLessThanOrEqual(35)
    expect(GAMMA_C.nylon).toBeGreaterThanOrEqual(42)
    expect(GAMMA_C.nylon).toBeLessThanOrEqual(46)
  })
  it('limits: θ = 0 for γ_lv ≤ γ_c; θ rises with γ_lv', () => {
    expect(angle('teflon', 18)).toBe(0)
    expect(angle('pe', 25)).toBe(0)
    expect(angle('teflon', 50)).toBeGreaterThan(angle('teflon', 30))
    expect(angle('nylon', 50)).toBeLessThan(angle('teflon', 50))
  })
  it('caption: the line gives ≈130° for water on PTFE (measured ≈108–112°)', () => {
    near(angle('teflon', 72.8), 130.1, 5e-3)
  })
  it('trainer: the keyed γ_c equals the fit extrapolated to cos θ = 1 and is near the true value', () => {
    const bad = []
    for (const { p } of problems(generateZisman, 200)) {
      const { slope, intercept, gLV, cos, trueGammaC } = p.data
      const fit = ads.fitLine(gLV, cos)
      const gc = (1 - fit.intercept) / fit.slope
      if (rel(num(p.options[p.answer]), (1 - intercept) / slope) > 0.006 || Math.abs(gc - trueGammaC) > 6) bad.push(p.data)
      void slope
    }
    expect(bad.length).toBe(0)
  })
})

// =====================================================================================================
// 7. Surface characterisation (XPS)
// =====================================================================================================
describe('7 Surface explorer (XPS)', () => {
  it('E_b = hν − E_k − Φ; Al Kα 1486.6 eV, Mg Kα 1253.6 eV', () => {
    const Eb = (hv, Ek, phi) => hv - Ek - phi
    near(Eb(1486.6, 1197.8, 4.2), 284.6, 1e-9) // adventitious C 1s
    near(Eb(1253.6, 1179.1, 4.5), 70.0, 1e-9) // Pt 4f7/2 ≈ 71 eV region
  })
  it('attenuation: 95 % of the signal from 3λ cos θ', () => {
    near(1 - Math.exp(-3), 0.95, 0.003)
  })
  it('trainer XPS: E_k in the question and the keyed E_b satisfy E_b = hν − E_k − Φ', () => {
    const xps = problems(generateSurface).filter(({ p }) => p.data.topic === 'xps')
    expect(xps.length).toBeGreaterThan(50)
    const bad = keyFailures(
      xps,
      (p) => {
        const hv = Number(p.question.match(/h\\nu = (\d+(?:\.\d+)?)/)[1])
        const Ek = Number(p.question.match(/kinetic energy of (\d+(?:\.\d+)?) eV/)[1])
        return hv - Ek - 4.2
      },
      0.02,
    )
    if (bad.length) console.log('XPS key failures:', bad.length, 'of', xps.length, '\n  e.g.', bad[0].q, '\n  options', bad[0].options, 'keyed', bad[0].keyed, 'true', bad[0].truth.toFixed(1))
    expect(bad.length).toBe(0)
  })
  it('trainer SEM/AFM: the correct option is not always in the same position', () => {
    const pos = problems(generateSurface).filter(({ p }) => p.data.topic !== 'xps').map(({ p }) => p.answer)
    expect(new Set(pos).size).toBeGreaterThan(1)
  })
})

// =====================================================================================================
// 8. Lennard-Jones (formulas copied from src/pages/lennard-jones/LennardJonesPage.tsx)
// =====================================================================================================
describe('8 Lennard-Jones', () => {
  const make = (epsilon, sigma) => ({
    V: (r) => {
      const s6 = Math.pow(sigma / r, 6)
      return 4 * epsilon * (s6 * s6 - s6)
    },
    F: (r) => {
      const s6 = Math.pow(sigma / r, 6)
      return ((24 * epsilon) / r) * (2 * s6 * s6 - s6)
    },
    rm: Math.pow(2, 1 / 6) * sigma,
    rF: Math.pow(26 / 7, 1 / 6) * sigma,
  })
  for (const [eps, sig] of [[1.0, 3.4], [0.5, 2.8], [2.5, 4.5]]) {
    it(`ε = ${eps}, σ = ${sig}: minimum −ε at 2^(1/6)σ, zero at σ, F = −dV/dr, F(σ) = 24ε/σ`, () => {
      const L = make(eps, sig)
      near(L.V(L.rm), -eps, 1e-12)
      expect(Math.abs(L.V(sig))).toBeLessThan(1e-12)
      expect(Math.abs(L.F(L.rm))).toBeLessThan(1e-12)
      // numerical minimum
      let best = 1e9
      let rb = 0
      for (let r = 0.9 * sig; r < 2 * sig; r += sig * 1e-5) if (L.V(r) < best) [best, rb] = [L.V(r), r]
      near(rb, 1.12246 * sig, 1e-4)
      for (const r of [0.95 * sig, 1.05 * sig, 1.6 * sig]) near(L.F(r), -(L.V(r + 1e-6) - L.V(r - 1e-6)) / 2e-6, 1e-5)
      near(L.F(sig), (24 * eps) / sig, 1e-12)
      near(L.F(L.rF), (-2.3964 * eps) / sig, 1e-4) // max attraction
      expect(L.F(0.95 * sig)).toBeGreaterThan(0) // repulsive inside σ
    })
  }
  it('argon: ε/k ≈ 120 K → 1.0 kJ/mol', () => {
    near((120 * R) / 1000, 1.0, 0.01)
  })
})

// =====================================================================================================
// 9. Van der Waals
// =====================================================================================================
describe('9 Van der Waals (Keesom, Debye, London)', () => {
  const byId = (id) => vdw.MOLECULES.find((m) => m.id === id)
  const C = (m, T = 293) => vdw.coefficients(m.mu, m.alpha, m.I, T)
  it('independent formulas: C_K = μ⁴/(3(4πε₀)²kT), C_D = 2μ²α₀/(4πε₀)², C_L = 3α₀²I/(4(4πε₀)²)', () => {
    const D = 3.33564e-30
    const fpe = 4 * Math.PI * eps0
    for (const id of ['H2O', 'HCl', 'NH3']) {
      const m = byId(id)
      const mu = m.mu * D
      const a0 = m.alpha * 1e-30 * fpe // α₀ in C²m²/J
      const c = C(m)
      near(c.keesom, mu ** 4 / (3 * fpe ** 2 * kB * 293), 1e-6)
      near(c.debye, (2 * mu ** 2 * a0) / fpe ** 2, 1e-6)
      near(c.london, (3 * a0 ** 2 * m.I * e) / (4 * fpe ** 2), 1e-6)
    }
  })
  it('Israelachvili Table 6.2 (10⁻⁷⁹ J m⁶, 293 K): H₂O 96/10/33, HCl London 106, NH₃ 38/9.8, Ar London 50', () => {
    const u = (v) => v / 1e-79
    const w = C(byId('H2O'))
    near(u(w.keesom), 96, 0.03)
    near(u(w.debye), 10, 0.03)
    near(u(w.london), 33, 0.03)
    const hcl = C(byId('HCl'))
    near(u(hcl.london), 106, 0.03) // HCl Keesom/Debye: see report (my recalled table values were not reliable)
    const nh3 = C(byId('NH3'))
    near(u(nh3.keesom), 38, 0.03)
    near(u(nh3.debye), 9.8, 0.03)
    near(u(C(byId('Ar')).london), 50, 0.03)
    near(vdw.shares(w).keesom, 69, 0.02) // bank 69 %
    near(vdw.shares(hcl).london, 86, 0.02) // bank 86 %
  })
  it('limits and trends: μ = 0 → only London; Keesom ∝ 1/T; φ ∝ r⁻⁶', () => {
    const ar = C(byId('Ar'))
    expect(ar.keesom).toBe(0)
    expect(ar.debye).toBe(0)
    const w = byId('H2O')
    near(C(w, 300).keesom / C(w, 600).keesom, 2, 1e-12)
    near(C(w, 300).london, C(w, 600).london, 1e-12)
    near(vdw.phi(1, 0.4) / vdw.phi(1, 0.8), 64, 1e-12)
  })
  it('Keesom validity: water at 0.4 nm has μ²/(4πε₀r³) ≈ 1.3 kT, and the exact Boltzmann average is weaker than Keesom', () => {
    const mu = 1.85 * 3.33564e-30
    const kT = kB * 293
    const x = mu ** 2 / (4 * Math.PI * eps0 * (0.4e-9) ** 3 * kT)
    near(x, 1.3, 0.05)
    // exact angle-averaged free energy −kT ln⟨exp(x f)⟩, f = 2cosθ₁cosθ₂ − sinθ₁sinθ₂cosφ (midpoint quadrature)
    const n = 120
    let Z = 0
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        for (let k = 0; k < n; k++) {
          const c1 = -1 + (2 * (i + 0.5)) / n
          const c2 = -1 + (2 * (j + 0.5)) / n
          const ph = (2 * Math.PI * (k + 0.5)) / n
          const f = 2 * c1 * c2 - Math.sqrt(1 - c1 * c1) * Math.sqrt(1 - c2 * c2) * Math.cos(ph)
          Z += Math.exp(x * f)
        }
    const exact = -Math.log(Z / n ** 3) // in kT
    const keesom = -(x * x) / 3
    expect(Math.abs(exact)).toBeLessThan(Math.abs(keesom)) // so Keesom overestimates here, as the card says
    expect(rel(exact, keesom)).toBeGreaterThan(0.03)
  })
})

// =====================================================================================================
// 10. Hamaker & Lifshitz (function copied from src/pages/hamaker/HamakerPage.tsx)
// =====================================================================================================
describe('10 Hamaker & Lifshitz', () => {
  const KT = 1.380649e-23 * 298
  const hamaker = (a, b, m) => {
    const s1 = (a.eps - m.eps) / (a.eps + m.eps)
    const s2 = (b.eps - m.eps) / (b.eps + m.eps)
    const stat = 0.75 * KT * s1 * s2
    const q1 = Math.sqrt(a.n * a.n + m.n * m.n)
    const q2 = Math.sqrt(b.n * b.n + m.n * m.n)
    const numr = (a.n * a.n - m.n * m.n) * (b.n * b.n - m.n * m.n)
    const disp = ((3 * 6.62607e-34 * 3.0e15) / (8 * Math.SQRT2)) * (numr / (q1 * q2 * (q1 + q2)))
    return stat + disp
  }
  const M = {
    vac: { eps: 1.0, n: 1.0 },
    water: { eps: 80, n: 1.333 },
    hexane: { eps: 1.9, n: 1.375 },
    ptfe: { eps: 2.1, n: 1.35 },
    ps: { eps: 2.55, n: 1.557 },
    silica: { eps: 3.8, n: 1.46 },
    mica: { eps: 7.0, n: 1.58 },
    alumina: { eps: 10.0, n: 1.75 },
  }
  const A = (a, m, b = a) => hamaker(M[a], M[b], M[m]) / 1e-20
  it('Israelachvili Table 13.2 (eq. 13.16 approximation), ×10⁻²⁰ J', () => {
    console.log('Hamaker A (1e-20 J) in vacuum:', Object.keys(M).map((k) => `${k} ${A(k, 'vac').toFixed(2)}`).join(', '), '| silica/water', A('silica', 'water').toFixed(2), '| PS/water', A('ps', 'water').toFixed(2))
    near(A('water', 'vac'), 3.7, 0.05)
    near(A('ptfe', 'vac'), 3.8, 0.05)
    near(A('silica', 'vac'), 6.3, 0.05)
    near(A('mica', 'vac'), 10, 0.1)
    near(A('alumina', 'vac'), 15, 0.1)
    expect(A('silica', 'water')).toBeGreaterThan(0.6)
    expect(A('silica', 'water')).toBeLessThan(1.0) // book 0.63–0.83
  })
  it('polystyrene (book ν_e ≈ 2.3×10¹⁵ Hz) is not offered with the single ν_e = 3×10¹⁵ Hz, which gives ~8.5 instead of ~6.5', () => {
    expect(A('ps', 'vac')).toBeGreaterThan(7.9 * 1.05) // the single-ν_e value really is too high…
    const page = readFileSync(new URL('../src/pages/hamaker/HamakerPage.tsx', import.meta.url), 'utf8')
    expect(page).not.toMatch(/name: 'Polystyrene'/) // …so the page must not list it
  })
  it('limits: A₁₃₁ ≥ 0 always; A = 0 when the medium equals the materials; A < 0 for air/hexane/silica', () => {
    for (const a of Object.keys(M)) for (const m of Object.keys(M)) expect(A(a, m)).toBeGreaterThanOrEqual(-1e-12)
    expect(Math.abs(A('silica', 'silica'))).toBeLessThan(1e-12)
    expect(A('vac', 'hexane', 'silica')).toBeLessThan(0)
  })
  it('geometry: sphere–plane −AR/6D, plane–plane −A/12πD² (trainer numbers)', () => {
    near((2e-20 * 500e-9) / (6 * 2e-9) / KT, 202.6, 2e-3)
    near((1e-20 / (12 * Math.PI * (2e-9) ** 2)) * 1e3, 0.0663, 2e-3)
  })
  it('trainer: keyed answers match an independent solution of each question', () => {
    const list = []
    const crashes = []
    for (const d of DIFFICULTIES)
      for (let s = 0; s < 300; s++) {
        try {
          list.push({ d, s, p: generateHamaker(makeRng(s), d) })
        } catch (err) {
          crashes.push(`${d}/${s}`)
        }
      }
    if (crashes.length) console.log('Hamaker trainer throws for', crashes.length, 'of 900 seeds, e.g.', crashes.slice(0, 5).join(', '))
    expect.soft(crashes.length, 'generator throws').toBe(0)
    const bad = keyFailures(
      list,
      (p) => {
        const q = p.question
        const a = (re) => Number(q.match(re)[1])
        if (q.includes('combining relation')) {
          const a11 = a(/A_\{11\} = A_\{22\} = (\d+(?:\.\d+)?)/)
          const a33 = a(/A_\{33\} = (\d+(?:\.\d+)?)/)
          return (Math.sqrt(a11) - Math.sqrt(a33)) ** 2 * 1e-20 // options read as J
        }
        if (q.includes('Material 1')) {
          const a11 = a(/A_\{11\} = (\d+(?:\.\d+)?)/)
          const a22 = a(/A_\{22\} = (\d+(?:\.\d+)?)/)
          const a33 = a(/A_\{33\} = (\d+(?:\.\d+)?)/)
          return (Math.sqrt(a11) - Math.sqrt(a33)) * (Math.sqrt(a22) - Math.sqrt(a33)) * 1e-20
        }
        const A132 = a(/A_\{132\} = (\d+(?:\.\d+)?)/) * 1e-20
        const D = a(/D = (\d+(?:\.\d+)?)\$? nm/) * 1e-9
        if (q.includes('flat plates')) return (A132 / (12 * Math.PI * D * D)) * 1e3
        const Rs = a(/R = (\d+(?:\.\d+)?)\$? nm/) * 1e-9
        return (A132 * Rs) / (6 * D) / KT
      },
      0.05,
    )
    expect.soft(bad.length, 'wrong keys').toBe(0)
    if (bad.length) console.log('Hamaker key failures:', bad.length, 'of', list.length, '\n  e.g.', bad[0].q, '\n  options', bad[0].options, 'keyed', bad[0].keyed, 'true', bad[0].truth)
    expect(bad.length).toBe(0)
  })
})

// =====================================================================================================
// 11. Electrical double layer
// =====================================================================================================
describe('11 Electrical double layer (GC, GCS)', () => {
  const T = 298.15
  const er = 78.4
  const debye = (cM, z) => Math.sqrt((eps0 * er * kB * T) / (2 * NA * e * e * cM * 1000 * z * z)) * 1e9
  it('Debye length ≈ 0.304/√I nm (1:1, 25 °C); ∝ 1/z', () => {
    for (const c of [1, 10, 100]) {
      near(edl.debyeLength(c, 1), debye(c / 1000, 1), 0.005)
      near(edl.debyeLength(c, 1), 0.304 / Math.sqrt(c / 1000), 0.005)
    }
    near(edl.debyeLength(10, 1) / edl.debyeLength(10, 2), 2, 1e-12)
    near(edl.debyeLength(10, 1) / edl.debyeLength(10, 3), 3, 1e-12)
    near(edl.debyeLength(1, 1), 9.62, 0.005)
  })
  it('Grahame equals Gauss: σ = −ε dψ/dx at the surface (GC profile)', () => {
    for (const [psi, c, z] of [[75, 10, 1], [150, 1, 1], [40, 100, 2]]) {
      const dx = 1e-5 // nm
      const p0 = edl.potentialAt(0, 'gc', psi, psi, c, z, 0)
      const p1 = edl.potentialAt(dx, 'gc', psi, psi, c, z, 0)
      const field = -((p1 - p0) * 1e-3) / (dx * 1e-9)
      near(edl.E0 * edl.EPS_BULK * field, edl.diffuseCharge(psi, c, z), 1e-3)
    }
  })
  it('differential capacitance dσ/dψ = ε κ cosh(zeψ/2kT); 561 µF/cm² at 200 mV, 10 mM', () => {
    for (const psi of [10, 100, 200]) {
      const d = 1e-4
      const num_ = (edl.diffuseCharge(psi + d, 10, 1) - edl.diffuseCharge(psi - d, 10, 1)) / (2 * d * 1e-3)
      near(num_, edl.diffuseCapacitance(psi, 10, 1), 1e-5)
    }
    near(edl.toMicroFcm2(edl.diffuseCapacitance(200, 10, 1)), 561, 0.01)
    near(edl.toMicroFcm2(edl.diffuseCapacitance(0, 10, 1)), (eps0 * 78.5) / 3.04e-9 * 100, 0.01) // GC minimum ε/κ⁻¹
  })
  it('GCS: charge balance closes; Stern 17.7 µF/cm²; series total below both', () => {
    const s = edl.solve('gcs', 200, 10, 1, 0.5)
    near(edl.sternCapacitance(0.5) * (200 - s.psiD) * 1e-3, edl.diffuseCharge(s.psiD, 10, 1), 1e-6)
    near(edl.toMicroFcm2(edl.sternCapacitance(0.5)), (eps0 * 10) / 0.5e-9 * 100, 1e-9)
    near(edl.toMicroFcm2(edl.sternCapacitance(0.5)), 17.7, 0.005)
    expect(s.cTotal).toBeLessThan(Math.min(s.cStern, s.cDiffuse))
  })
  it('low potential: ψ(κ⁻¹) = ψ₀/e; Boltzmann ions', () => {
    const L = edl.debyeLength(10, 1)
    near(edl.potentialAt(L, 'gc', 1, 1, 10, 1, 0), 1 / Math.E, 1e-4)
    const r = edl.ionRatios(-50, 1)
    near(r.cation, Math.exp((50e-3 * e) / (kB * 298)), 1e-9)
    expect(r.anion).toBeLessThan(1)
  })
})

// =====================================================================================================
// 12. Zeta potential (formulas copied from src/pages/zeta/ZetaTryThis.tsx)
// =====================================================================================================
describe('12 Zeta potential & IEP', () => {
  const MOBILITY_PER_MV = (edl.E0 * edl.EPS_BULK * 1e-3) / ETA_WATER / 1e-8
  const zeta = (ph) => -60 * Math.tanh((ph - 7) / 3)
  it('Smoluchowski u = ε₀ε_rζ/η: 0.078 µm·cm/(V·s) per mV, i.e. 1 unit ≈ 12.8 mV (water, 25 °C)', () => {
    near(MOBILITY_PER_MV, (eps0 * 78.5 * 1e-3) / 0.89e-3 / 1e-8, 1e-6)
    near(1 / MOBILITY_PER_MV, 12.8, 0.01)
  })
  it('Hückel limit is 2/3 of Smoluchowski (Henry f from 1 to 1.5)', () => {
    near((2 / 3) * 1 / 1.0, (2 / 3) * 1, 1e-12)
    near((2 / 3) * 1.5, 1, 1e-12)
  })
  it('model ζ(pH): 0 at the IEP, positive below, negative above, bounded and monotonic', () => {
    expect(zeta(7)).toBeCloseTo(0, 12)
    expect(zeta(4)).toBeGreaterThan(0)
    expect(zeta(10)).toBeLessThan(0)
    for (let p = 2; p < 12; p += 0.1) expect(zeta(p + 0.1)).toBeLessThan(zeta(p))
    expect(Math.abs(zeta(2))).toBeLessThan(60)
  })
  it('trainer: ζ = ηu/ε (Smoluchowski) and linear-interpolated IEP', () => {
    const list = problems(generateZeta)
    const bad = keyFailures(
      list,
      (p) => {
        const q = p.question.replace(/−/g, '-')
        if (q.includes('mobility')) {
          const u = Number(q.match(/mobility ([+-]?[\d.]+) µm/)[1].replace('+', ''))
          return ((0.89e-3 * u * 1e-8) / (eps0 * 78.5)) * 1e3
        }
        const [a, p1, b, p2] = [...q.matchAll(/ζ = [+-](\d+) mV at pH (\d+)/g)].flatMap((m) => [Number(m[1]), Number(m[2])])
        return p1 + (a * (p2 - p1)) / (a + b)
      },
      0.05, // options are shown to 2 significant figures
    )
    expect(bad.length).toBe(0)
  })
})

// =====================================================================================================
// 13. DLVO
// =====================================================================================================
describe('13 DLVO & Schulze–Hardy', () => {
  // Independent DLVO for two equal spheres (Israelachvili eq. 14.x with Derjaguin): V_R = 64πa n kT Γ²/κ² e^(−κh)
  const T = 298
  const kT = kB * T
  const epsW = eps0 * 78.5
  const kappa = (cmM, z) => Math.sqrt((2 * cmM * NA * z * z * e * e) / (epsW * kT))
  const Vtot = (hnm, { c0, z, psi0, a, hamaker }) => {
    const k = kappa(c0, z)
    const G = Math.tanh((z * e * psi0 * 1e-3) / (4 * kT))
    const n = c0 * NA
    const VR = ((64 * Math.PI * a * 1e-9 * n * kT * G * G) / (k * k)) * Math.exp(-k * hnm * 1e-9)
    const VA = -(hamaker * a * 1e-9) / (12 * hnm * 1e-9)
    return (VR + VA) / kT
  }
  /** Analytic CCC (V = 0 and dV/dh = 0 ⇒ κh = 1): κ = 384π ε (kT)² Γ² / (z² e² A e¹), n = εkTκ²/(2z²e²). In mM. */
  const cccAnalytic = (z, psi0, A) => {
    const G = Math.tanh((z * e * psi0 * 1e-3) / (4 * kT))
    const k = (384 * Math.PI * epsW * kT * kT * G * G) / (z * z * e * e * A * Math.E)
    return (epsW * kT * k * k) / (2 * z * z * e * e) / NA
  }
  const P = (c0, z, psi0) => ({ c0, z, psi0, a: 100, hamaker: 5e-20 })
  it('lib V(h) agrees with the independent formula', () => {
    for (const p of [P(1, 1, 50), P(10, 2, 75), P(50, 1, 25)])
      for (const hh of [0.5, 2, 5, 20]) near(dlvo.total(hh, p), Vtot(hh, p), 1e-3)
  })
  it('CCC from the lib equals the analytic κh = 1 result', () => {
    for (const [z, psi] of [[1, 50], [2, 50], [3, 100], [1, 20]]) near(dlvo.ccc({ z, psi0: psi, a: 100, hamaker: 5e-20 }), cccAnalytic(z, psi, 5e-20), 0.01)
  })
  it('Schulze–Hardy: CCC ratios → 1 : 1/64 : 1/729 at high ψ₀; ∝ ψ₀⁴/z² at low ψ₀', () => {
    const c = (z, psi) => dlvo.ccc({ z, psi0: psi, a: 100, hamaker: 5e-20 })
    near(c(1, 1000) / c(2, 1000), 64, 0.01)
    near(c(1, 1000) / c(3, 1000), 729, 0.01)
    console.log('CCC (mM) z=1,2,3 at 1000 mV:', [1, 2, 3].map((z) => c(z, 1000).toPrecision(3)).join(', '), '| at 10 mV:', [1, 2].map((z) => c(z, 10).toPrecision(3)).join(', '), '| at 50 mV:', [1, 2, 3].map((z) => c(z, 50).toPrecision(3)).join(', '))
    near(c(1, 10) / c(2, 10), 4, 0.05)
    near(c(1, 20) / c(1, 10), 16, 0.05) // ψ₀⁴ law, approximate at 10–20 mV
    // at the slider's ψ₀ = 50 mV the ratio is far from 64
    expect(c(1, 50) / c(2, 50)).toBeLessThan(30)
  })
  it('trends: more salt lowers the barrier; higher ψ₀ raises it; ψ₀ = 0 has no barrier', () => {
    expect(dlvo.barrier(P(1, 1, 50))).toBeGreaterThan(dlvo.barrier(P(10, 1, 50)))
    expect(dlvo.barrier(P(10, 1, 75))).toBeGreaterThan(dlvo.barrier(P(10, 1, 50)))
    expect(dlvo.barrier(P(10, 1, 0))).toBe(0)
  })
  it('page "secondary minimum" readout is a real minimum, not the end of the plotted range', () => {
    // logic copied from src/pages/dlvo/DlvoTryThis.tsx
    const readout = (c0, z, psi0) => {
      const debye = edl.debyeLength(c0, z)
      const hMax = Math.min(100, Math.max(20, 6 * debye))
      const p = P(c0, z, psi0)
      const hs = Array.from({ length: 401 }, (_, i) => 0.2 + ((hMax - 0.2) * i) / 400)
      const V = hs.map((x) => dlvo.total(x, p))
      const b = dlvo.barrier(p)
      const peakIndex = V.reduce((best, v, i) => (v > V[best] ? i : best), 0)
      let secondary = 0
      if (b > 0)
        for (let i = Math.max(peakIndex, 1); i < V.length - 1; i++)
          if (V[i] < V[i - 1] && V[i] <= V[i + 1]) {
            secondary = Math.min(0, V[i])
            break
          }
      // a reported minimum must be an interior point where V turns from falling to rising
      const i = V.indexOf(secondary)
      const atEnd = secondary < -0.05 && !(i > 0 && i < V.length - 1 && V[i] < V[i - 1] && V[i] <= V[i + 1])
      return { secondary, atEnd }
    }
    const cases = [[300, 1, 50], [1000, 1, 50], [100, 2, 50], [0.1, 1, 50], [10, 1, 50]].map((c) => ({ c, ...readout(...c) }))
    near(cases[4].secondary, -5.14, 0.01) // 10 mM: the genuine secondary minimum at 15.9 nm is still shown
    expect(cases[0].secondary).toBe(0) // above the CCC there is none
    const fake = cases.filter((x) => x.atEnd)
    if (fake.length) console.log('DLVO page reports the plot edge as a secondary minimum for', fake.map((x) => `${x.c[0]} mM z=${x.c[1]}: ${x.secondary.toFixed(1)} kT`).join('; '))
    expect(fake.length).toBe(0)
  })
  it('trainer: CCC keys follow (z₁/z₂)⁶; Debye keys follow 0.304/(z√c)', () => {
    const list = problems(generateColloid)
    const bad = keyFailures(
      list,
      (p) => {
        const q = p.question
        if (p.data.ask === 'ccc') {
          const [c1, z1] = [Number(q.match(/above (\d+(?:\.\d+)?) mM of a (\d):/)[1]), Number(q.match(/of a (\d):/)[1])]
          const z2 = Number(q.match(/valency z = (\d)/)[1])
          return c1 * (z1 / z2) ** 6
        }
        if (p.data.ask === 'debye') {
          const c0 = Number(q.match(/in (\d+(?:\.\d+)?) mM/)[1])
          const z = q.includes('3:3') ? 3 : q.includes('MgSO') ? 2 : 1
          return 0.304 / (z * Math.sqrt(c0 / 1000))
        }
        return undefined
      },
      0.05, // options are shown to 2 significant figures
    )
    expect(bad.length).toBe(0)
  })
})

// =====================================================================================================
// 14. Classical nucleation theory
// =====================================================================================================
describe('14 Classical nucleation theory', () => {
  const v = 3e-29
  it('r* = 2γv/(kT ln S), ΔG* = 16πγ³v²/(3(kT ln S)²); defaults d* = 1.81 nm, ΔG* = 83.6 kT', () => {
    for (const [S, g, T] of [[5, 0.1, 298], [2, 0.05, 300], [20, 0.3, 400]]) {
      const kT = kB * T
      const rstar = (2 * g * v) / (kT * Math.log(S))
      near(nuc.criticalDiameter(S, g, T), 2 * rstar, 1e-6)
      near(nuc.barrierHom(S, g, T), (16 * Math.PI * g ** 3 * v * v) / (3 * (kT * Math.log(S)) ** 2), 1e-6)
      near(nuc.barrierHom(S, g, T), (4 / 3) * Math.PI * rstar ** 2 * g, 1e-6) // = ⅓ of the surface energy
      // numerical maximum of ΔG(d) sits at d* with height ΔG*
      let best = -Infinity
      let db = 0
      for (let i = 1; i < 200000; i++) {
        const d = (i / 200000) * 4 * 2 * rstar
        const G = nuc.deltaG(d, S, g, T)
        if (G > best) [best, db] = [G, d]
      }
      near(db, 2 * rstar, 1e-4)
      near(best, nuc.barrierHom(S, g, T), 1e-6)
    }
    const s = nuc.solve(5, 0.1, 60, 298)
    near(s.dStar, 1.81, 0.005)
    near(s.homKT, 83.6, 0.005)
  })
  it('heterogeneous: f(180°) = 1, f(0°) = 0, f(90°) = ½, f(60°) = 0.156; barrier = f·homogeneous', () => {
    expect(nuc.shapeFactor(180)).toBeCloseTo(1, 12)
    expect(nuc.shapeFactor(0)).toBeCloseTo(0, 12)
    expect(nuc.shapeFactor(90)).toBeCloseTo(0.5, 12)
    near(nuc.shapeFactor(60), 0.15625, 1e-9)
    // f = V_cap/V_sphere for a cap with contact angle θ measured through the nucleus
    for (const t of [30, 60, 120]) {
      const c = cosd(t)
      const capVol = (Math.PI / 3) * (1 - c) ** 2 * (2 + c) // R = 1
      near(nuc.shapeFactor(t), capVol / ((4 / 3) * Math.PI), 1e-12)
    }
    const s = nuc.solve(3, 0.1, 75, 298)
    near(s.hetKT, s.f * s.homKT, 1e-12)
  })
  it('rate: 70 kT ↔ 30.4 decades; S ≤ 1 has no nucleus; trends', () => {
    near(nuc.log10Rate(0) - nuc.log10Rate(70), 30.4, 1e-3)
    expect(nuc.criticalDiameter(1, 0.1, 298)).toBeNull()
    expect(nuc.barrierHom(2, 0.2, 298) / nuc.barrierHom(2, 0.1, 298)).toBeCloseTo(8, 9)
    expect(nuc.criticalDiameter(10, 0.1, 298)).toBeLessThan(nuc.criticalDiameter(2, 0.1, 298))
  })
  it('trainer: d*, f(θ) and scaling keys', () => {
    const list = problems(generateNucleation)
    const bad = keyFailures(
      list,
      (p) => {
        const q = p.question
        if (p.data.ask === 'dstar') {
          const [T, S] = [Number(q.match(/T = (\d+) K/)[1]), Number(q.match(/S = (\d+(?:\.\d+)?)/)[1])]
          const g = Number(q.match(/= (\d+(?:\.\d+)?) J\/m²/)[1])
          return ((4 * g * v) / (kB * T * Math.log(S))) * 1e9
        }
        if (p.data.ask === 'shape') {
          const t = Number(q.match(/θ = (\d+)°/)[1])
          return ((2 + cosd(t)) * (1 - cosd(t)) ** 2) / 4
        }
        const k = Number(q.match(/factor of (\d+(?:\.\d+)?)/)[1])
        return q.includes('interfacial tension') ? k ** 3 : 1 / k ** 2
      },
      0.05, // f is shown to 2 significant figures
    )
    expect(bad.length).toBe(0)
  })
})

// =====================================================================================================
// 15. Phase separation
// =====================================================================================================
describe('15 Phase separation (regular solution)', () => {
  const G = (x, c) => x * Math.log(x) + (1 - x) * Math.log(1 - x) + c * x * (1 - x)
  const mu = (x, c) => Math.log(x / (1 - x)) + c * (1 - 2 * x) // dG/dx
  it('critical point χ = 2 at x = ½; spinodal d²G/dx² = 0', () => {
    expect(phase.spinodal(2)).toBeNull()
    for (const c of [2.2, 3, 4]) {
      const [s1, s2] = phase.spinodal(c)
      const d2 = (x) => (G(x + 1e-4, c) - 2 * G(x, c) + G(x - 1e-4, c)) / 1e-8
      expect(Math.abs(d2(s1))).toBeLessThan(1e-3)
      near(s1 + s2, 1, 1e-12)
    }
  })
  it('binodal is the common tangent: equal dG/dx and G₂ − G₁ = slope·(x₂ − x₁)', () => {
    for (const c of [2.2, 2.7, 4]) {
      const [x1, x2] = phase.binodal(c)
      expect(Math.abs(mu(x1, c) - mu(x2, c))).toBeLessThan(1e-9)
      expect(Math.abs(G(x2, c) - G(x1, c) - mu(x1, c) * (x2 - x1))).toBeLessThan(1e-9)
      expect(x1).toBeLessThan(phase.spinodal(c)[0])
    }
  })
  it('regions: T = 0.75 Tc (χ = 2.67), x = 0.05 stable, 0.15 metastable, 0.4 unstable', () => {
    near(phase.chi(0.75), 2.6667, 1e-4)
    expect(phase.region(0.05, 0.75)).toBe('stable')
    expect(phase.region(0.15, 0.75)).toBe('metastable')
    expect(phase.region(0.4, 0.75)).toBe('unstable')
    expect(phase.region(0.5, 1.05)).toBe('stable')
  })
  it('page barrier: πd*²γ/3 equals 16πγ³v²/(3(kT ln S)²)', () => {
    const c = phase.critical(2, 0.05)
    const kT = kB * 298
    near((c.g * kT), (16 * Math.PI * 0.05 ** 3 * 9e-58) / (3 * (kT * Math.log(2)) ** 2), 1e-6)
    expect(phase.critical(0.8, 0.05)).toBeNull()
  })
  it('trainer: spinodal key and region key', () => {
    const list = problems(generatePhase)
    const bad = keyFailures(
      list,
      (p) => {
        if (p.data.ask !== 'spinodal') return undefined
        const c = Number(p.question.match(/χ = (\d+(?:\.\d+)?)/)[1])
        return 0.5 - 0.5 * Math.sqrt(1 - 2 / c)
      },
      0.005,
    )
    expect(bad.length).toBe(0)
    for (const { p } of list.filter(({ p }) => p.data.ask === 'region')) {
      const { x, t } = p.data
      const c = 2 / t
      // independent region from the binodal/spinodal conditions
      let reg = 'stable'
      if (c > 2) {
        let lo = 1e-12
        let hi = 0.5 - 0.5 * Math.sqrt(1 - 2 / c)
        for (let i = 0; i < 200; i++) {
          const m = (lo + hi) / 2
          if (mu(m, c) < 0) lo = m
          else hi = m
        }
        const xb = lo
        const xs = 0.5 - 0.5 * Math.sqrt(1 - 2 / c)
        const xx = Math.min(x, 1 - x)
        reg = xx <= xb ? 'stable' : xx < xs ? 'metastable' : 'unstable'
      }
      expect(p.options[p.answer].toLowerCase().startsWith(reg)).toBe(true)
    }
  })
})

// =====================================================================================================
// 16. Crystal growth
// =====================================================================================================
describe('16 Crystal growth & shape', () => {
  const shoelace = (pts) => Math.abs(pts.reduce((a, [x, y], i) => a + x * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * y, 0)) / 2
  it('facet geometry: area matches the polygon; square, octagon, diamond thresholds', () => {
    for (const [a, b] of [[1, 1], [1, 0.6], [1, 1.5], [2, 1.1]]) near(cry.facetShape(a, b, 0).area, shoelace(cry.facetPolygon(a, b)), 1e-12)
    expect(cry.facetShape(1, Math.SQRT2 + 0.01).name).toBe('square')
    expect(cry.facetShape(1, Math.SQRT1_2 - 0.01).name).toBe('diamond')
    expect(cry.facetShape(1, 1).name).toBe('octagon')
  })
  it('slow faces win: survival thresholds 1/√2 and √2 (simulated growth)', () => {
    for (const ratio of [0.5, 0.9, 1.3, 2]) {
      const s = cry.facetShape(1000, 1000 * ratio)
      const fam = []
      if (s.len10 > 0) fam.push('10')
      if (s.len11 > 0) fam.push('11')
      expect(cry.survivingFamilies(ratio)).toEqual(fam)
    }
    expect(cry.effectiveRatio(1, '11')).toBeLessThan(1) // capped faces slow down
  })
  it('BCF: ∝ σ² at low σ, ∝ σ at high σ; surface control at low S, diffusion at high S', () => {
    near(cry.bcfRate(1.01), 0.01 ** 2 / 2, 1e-6)
    near(cry.bcfRate(1 + 200), 200, 1e-4)
    expect(cry.controllingRegime(1.2)).toBe('surface')
    expect(cry.controllingRegime(5)).toBe('diffusion')
  })
  it('Wulff: h ∝ γ', () => {
    const [h10, h11] = cry.wulffDistances(1.2, 10)
    near(h11 / h10, 1.2, 1e-12)
  })
  it('sphere shape factors: β = π, α = π/6 for diameter x; R = (3α/β)ρG', () => {
    near((3 * (Math.PI / 6)) / Math.PI, 0.5, 1e-12)
  })
  it('trainer: survivors key', () => {
    for (const { p } of problems(generateCrystal)) {
      const r = p.data.ratio
      const fam = [r * Math.SQRT2 > 1 && '{10}', r < Math.SQRT2 && '{11}'].filter(Boolean)
      const key = p.options[p.answer]
      expect(fam.every((f) => key.includes(f)) && !(fam.length === 1 && key.startsWith('Both'))).toBe(true)
    }
  })
})

// =====================================================================================================
// Remaining trainers whose keys are numeric
// =====================================================================================================
describe('Trainer answer keys (independent solution of the question text)', () => {
  it('BET: Vm = 1/(s + i), C = s/i + 1, A = 4.35·Vm', () => {
    const bad = keyFailures(
      problems(generateBet),
      (p) => {
        const { slope: s, intercept: i, ask } = p.data
        const Vm = 1 / (s + i)
        return ask === 'Vm' ? Vm : ask === 'C' ? s / i + 1 : (Vm * NA * 0.162e-18) / 22414
      },
      0.006,
    )
    expect(bad.length).toBe(0)
  })
  it('Capillary: Pc = 2γcosθ/r (γ as stated)', () => {
    const bad = keyFailures(
      problems(generateCapillary),
      (p) => {
        const q = p.question
        const g = Number(q.match(/= (\d+(?:\.\d+)?) mN\/m/)[1]) / 1000
        const t = Number(q.match(/θ = (\d+)°/)[1])
        if (p.data.ask === 'pressure') return (2 * g * cosd(t)) / (Number(q.match(/r = (\d+) nm/)[1]) * 1e-9) / 1e6
        return ((2 * g * cosd(t)) / (num(q.match(/pressure of (.+?) MPa/)[1]) * 1e6)) * 1e9
      },
      0.01,
    )
    expect(bad.length).toBe(0)
  })
  it('MIPS: d = −4γcosθ/P', () => {
    const bad = keyFailures(
      problems(generateMips),
      (p) => {
        const q = p.question
        const W = -4 * 0.485 * cosd(140)
        if (p.data.ask === 'diameter') return (W / (num(q.match(/P = (.+?) MPa/)[1]) * 1e6)) * 1e9
        return W / (Number(q.match(/diameter (\d+) nm/)[1]) * 1e-9) / 1e6
      },
      0.01,
    )
    expect(bad.length).toBe(0)
  })
  it('EDL: Stern ε₀ε_S/δ, series 1/(1/C_S + 1/C_d)', () => {
    const bad = keyFailures(
      problems(generateEdl),
      (p) => {
        const q = p.question
        if (q.includes('parallel-plate')) {
          const d = Number(q.match(/δ = (\d+(?:\.\d+)?) nm/)[1])
          const es = Number(q.match(/varepsilon_S\$ = (\d+)/)[1])
          return ((eps0 * es) / (d * 1e-9)) * 100
        }
        if (q.includes('Gouy–Chapman–Stern')) {
          const [cs, cd] = nums(q.replace(/C_\\text\{\w+\}/g, '')).slice(-2)
          return 1 / (1 / cs + 1 / cd)
        }
        const c0 = Number(q.match(/in (\d+(?:\.\d+)?) mM/)[1])
        const z = q.includes('3:3') ? 3 : q.includes('MgSO') ? 2 : 1
        return 0.304 / (z * Math.sqrt(c0 / 1000))
      },
      0.03,
    )
    expect(bad.length).toBe(0)
  })
  it('Lennard-Jones: r_m = 2^(1/6)σ, F(σ) = 24ε/σ', () => {
    const bad = keyFailures(
      problems(generateLennardJones),
      (p) => {
        const q = p.question
        const s = Number(q.match(/sigma = (\d+(?:\.\d+)?)\$? Å/)[1])
        if (q.includes('equilibrium distance')) return 2 ** (1 / 6) * s
        return (24 * Number(q.match(/epsilon = (\d+(?:\.\d+)?)/)[1])) / s
      },
      0.05, // shown to 2 significant figures
    )
    expect(bad.length).toBe(0)
  })
  it('Surfactant: Klevens and area per molecule', () => {
    const bad = keyFailures(
      problems(generateSurfactant),
      (p) => {
        const q = p.question
        if (q.includes('Klevens')) {
          const [n1, n2] = [...q.matchAll(/C(\d+) tail/g)].map((m) => Number(m[1]))
          const c1 = num(q.match(/CMC of (.+?) mM/)[1])
          const B = Number(q.match(/B = (\d+(?:\.\d+)?)/)[1])
          return c1 * 10 ** (-B * (n2 - n1))
        }
        const G = Number(q.match(/Γ = (\d+(?:\.\d+)?) µmol/)[1]) * 1e-6
        return 1e18 / (G * NA)
      },
      0.05, // CMC shown to 2 significant figures
    )
    expect(bad.length).toBe(0)
  })
  it('vdW: |φ| ∝ r⁻⁶; Keesom ∝ 1/T', () => {
    const bad = keyFailures(
      problems(generateVdw),
      (p) => {
        const q = p.question
        if (q.includes('Keesom')) {
          const [T1, T2] = [...q.matchAll(/(\d+) K/g)].map((m) => Number(m[1]))
          return T1 / T2
        }
        const k = Number(q.match(/factor of (\d+(?:\.\d+)?)/)[1])
        return q.includes('shrinks') ? k ** 6 : k ** -6
      },
      0.02,
    )
    expect(bad.length).toBe(0)
  })
  it('Wetting: Young, Wenzel, Cassie angles', () => {
    const bad = keyFailures(
      problems(generateWetting).filter(({ p }) => typeof p.data.result === 'number'),
      (p) => {
        const q = p.question
        const g = (re) => Number(q.match(re)[1])
        if (p.data.ask === 'young') return acosd((g(/gamma_\{SV\}\$ = (\d+(?:\.\d+)?)/) - g(/gamma_\{SL\}\$ = (\d+(?:\.\d+)?)/)) / g(/gamma_\{LV\}\$ = (\d+(?:\.\d+)?)/))
        if (p.data.ask === 'wenzel') return acosd(g(/\$r\$ = (\d+(?:\.\d+)?)/) * cosd(g(/theta_Y\$ = (\d+)/)))
        return acosd(g(/f_s\$ = (\d+(?:\.\d+)?)/) * (cosd(g(/theta_Y\$ = (\d+)/)) + 1) - 1)
      },
      0.03,
    )
    expect(bad.length).toBe(0)
  })
  it('Wetting: Young angles in questions stay within what a smooth surface can give (≤ ~120°, as the page now says)', () => {
    const over = problems(generateWetting)
      .filter(({ p }) => p.data.ask !== 'young' && p.data.thetaY !== undefined)
      .map(({ p }) => p.data.thetaY)
      .filter((t) => t > 125)
    if (over.length) console.log('Wetting trainer: θ_Y above 125° in', over.length, 'questions, max', Math.max(...over))
    expect(over.length).toBe(0)
  })
  it('Isotherm recognition: type III curves use C < 2, type I/II have the right form', () => {
    for (const { p } of problems(generateIsotherm, 100)) {
      const { family, x, ads: y } = p.data
      expect(p.options[p.answer]).toMatch(new RegExp(family === 'I' ? 'Langmuir|type I\\b' : family === 'II' ? 'BET|type II\\b' : `type ${family}\\b`))
      if (family === 'I') expect(Math.max(...y)).toBeLessThanOrEqual(1)
      if (family === 'III') expect(y[1] / x[1]).toBeLessThan(2) // initial slope C < 2
    }
  })
  it('no worked-solution TeX lost its spacing (“\\;” in a JS string becomes a bare “;”)', () => {
    const gens = { generatePhase, generateSurfactant, generateWetting }
    const hits = []
    for (const [name, gen] of Object.entries(gens))
      for (const { p } of problems(gen, 60)) for (const st of p.steps) if (st.tex && /(^|[^\\]);\\Rightarrow/.test(st.tex)) hits.push(`${name}: ${st.tex.slice(0, 80)}`)
    if (hits.length) console.log('TeX spacing lost, e.g.', hits[0])
    expect(hits.length).toBe(0)
  })
})
