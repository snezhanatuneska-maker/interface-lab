import { criticalDiameter, shapeFactor, V_M } from './nucleation'
import type { Rng } from './random'
import { fmt, fmtTex, numericOptions, type Difficulty, type Generator } from './training'

// Classical nucleation training: the critical diameter d* = 4γV_m/(kT ln S), the heterogeneous shape factor f(θ),
// and how the barrier ΔG* ∝ γ³/(ln S)² scales (src/lib/nucleation.ts).

export interface NucleationData {
  kind: 'nucleation'
  ask: 'dstar' | 'shape' | 'scaling'
  value: number
}

const T = 298

export const generateNucleation: Generator<NucleationData> = (rng: Rng, difficulty: Difficulty) => {
  const ask = rng.pick<NucleationData['ask']>(difficulty === 'easy' ? ['dstar', 'scaling'] : ['dstar', 'shape', 'scaling'])

  if (ask === 'dstar') {
    const S = rng.pick([1.5, 2, 3, 5, 10, 20])
    const gamma = rng.pick([0.05, 0.1, 0.15, 0.2, 0.3])
    const d = criticalDiameter(S, gamma, T)! * 1e9 // nm
    const { options, answer } = numericOptions(
      rng,
      d,
      [d / 2, d * Math.LN10, d * 2], // radius instead of diameter; log₁₀ instead of ln; 8 instead of 4
      { format: (v) => `${fmt(v)} nm` },
    )
    return {
      question: `A solution at T = ${T} K has supersaturation S = ${S}. The nucleus has surface tension $\\gamma$ = ${gamma} J/m² and molecular volume $V_m$ = 3 × 10⁻²⁹ m³. What is the critical diameter d*?`,
      options,
      answer,
      steps: [
        { text: 'd* is where ΔG(d) = −(πd³/6V_m)·kT ln S + πd²γ has its maximum:', tex: 'd^* = \\frac{4\\gamma V_m}{kT\\ln S}' },
        {
          text: `kT = ${fmtTex(1.380649e-23 * T)} J and ln ${S} = ${Math.log(S).toFixed(3)}:`,
          tex: `d^* = \\frac{4 \\times ${gamma} \\times ${fmtTex(V_M)}}{${fmtTex(1.380649e-23 * T)} \\times ${Math.log(S).toFixed(3)}}\\ \\mathrm{m} = ${fmtTex(d)}\\ \\mathrm{nm}`,
        },
        { text: 'Clusters smaller than d* tend to dissolve; larger ones grow.' },
      ],
      data: { kind: 'nucleation', ask, value: d },
    }
  }

  if (ask === 'shape') {
    const theta = rng.pick([30, 45, 60, 90, 120, 150])
    const f = shapeFactor(theta)
    const c = Math.cos((theta * Math.PI) / 180)
    const { options, answer } = numericOptions(
      rng,
      f,
      [1 - f, (1 - c) / 2, (2 + c) * (1 - c) / 4, ((1 - c) ** 2) / 4], // complement; missing terms
      { format: (v) => fmt(v, 2), apart: (a, b) => Math.abs(a - b) >= 0.04 && Math.abs(a - b) > 0.15 * Math.max(a, b) },
    )
    return {
      question: `A nucleus forms on a substrate with contact angle θ = ${theta}°. By what factor f(θ) = ΔG*_het/ΔG*_hom is the nucleation barrier reduced?`,
      options,
      answer,
      steps: [
        { text: 'The cap-shaped nucleus needs only a fraction of the sphere’s volume:', tex: 'f(\\theta) = \\frac{(2 + \\cos\\theta)(1 - \\cos\\theta)^2}{4}' },
        { text: 'Insert the values:', tex: `f = \\frac{(2 + ${c.toFixed(3)})(1 - ${c.toFixed(3)})^2}{4} = ${fmtTex(f, 2)}` },
        { text: 'f = 0 for complete wetting (no barrier) and f = 1 at θ = 180° (no help from the surface).' },
      ],
      data: { kind: 'nucleation', ask, value: f },
    }
  }

  // Barrier scaling with γ or with ln S
  const byGamma = rng.next() < 0.5
  const k = rng.pick([1.5, 2, 3])
  const factor = byGamma ? k ** 3 : 1 / k ** 2
  const mistakes = byGamma ? [k, k ** 2, k ** 6] : [1 / k, k ** 2, 1 / k ** 3]
  const { options, answer } = numericOptions(rng, factor, mistakes, { format: (v) => `× ${fmt(v)}` })
  return {
    question: byGamma
      ? `The interfacial tension γ of a nucleus grows by a factor of ${k} (all else the same). By what factor does the homogeneous barrier ΔG* change?`
      : `ln S grows by a factor of ${k} (all else the same). By what factor does the homogeneous barrier ΔG* change?`,
    options,
    answer,
    steps: [
      { text: 'Homogeneous nucleation barrier:', tex: '\\Delta G^*_\\text{hom} = \\frac{16\\pi\\gamma^3 V_m^2}{3(kT\\ln S)^2}' },
      { text: byGamma ? `ΔG* ∝ γ³, so the barrier changes by ${k}³ = ${fmt(factor)}.` : `ΔG* ∝ 1/(ln S)², so the barrier changes by 1/${k}² = ${fmt(factor)}.` },
    ],
    data: { kind: 'nucleation', ask, value: factor },
  }
}
