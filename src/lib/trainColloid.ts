import { barrier, HAMAKER_DEFAULT, RADIUS_DEFAULT, STABLE_BARRIER, total, type DlvoParams } from './dlvo'
import { debyeLength } from './edl'
import type { Rng } from './random'
import { fmt, fmtTex, labelled, numericOptions, round, type Difficulty, type Generator, type Step } from './training'

// Colloid stability training: Debye length κ⁻¹ from salt and valency (src/lib/edl.ts), stable or coagulating from a
// DLVO curve (src/lib/dlvo.ts), and the Schulze–Hardy rule CCC ∝ 1/z⁶.

export type ColloidAsk = 'debye' | 'dlvo' | 'ccc'

export interface ColloidData {
  ask: ColloidAsk
  c0?: number // mM
  z?: number
  debye?: number // nm
  /** DLVO questions: the curve to draw, V/kT against h (nm), and its barrier. */
  dlvo?: { params: DlvoParams; h: number[]; V: number[]; barrier: number; stable: boolean }
  /** CCC questions: the known CCC (mM) at valency z1, and the answer at z2. */
  ccc?: { z1: number; c1: number; z2: number; c2: number }
}

const ASKS: Record<Difficulty, ColloidAsk[]> = { easy: ['debye', 'ccc'], medium: ['debye', 'ccc', 'dlvo'], hard: ['debye', 'ccc', 'dlvo'] }
const SALTS: Record<number, string> = { 1: 'NaCl', 2: 'MgSO₄', 3: '3:3' }
const salt = (z: number) => (z === 3 ? 'a 3:3 electrolyte' : `${SALTS[z]} (a ${z}:${z} electrolyte)`)
const CONCS = [1, 2, 5, 10, 20, 50, 100, 200] // mM

export const DLVO_GAPS = Array.from({ length: 120 }, (_, i) => 0.3 + (i * 29.7) / 119) // nm

export const generateColloid: Generator<ColloidData> = (rng: Rng, difficulty: Difficulty) => {
  const ask = rng.pick(ASKS[difficulty])

  if (ask === 'debye') {
    const c0 = rng.pick(CONCS)
    const z = difficulty === 'easy' ? 1 : rng.int(1, 3)
    const L = debyeLength(c0, z)
    const I = c0 * z * z
    const { options, answer } = numericOptions(
      rng,
      L,
      // ignored z (I = c₀); mM taken as M; I in M taken as mM; I written as ½c₀z² for a z:z salt
      [debyeLength(c0, 1), L / Math.sqrt(1000), L * Math.sqrt(1000), L * Math.SQRT2],
      { format: (v) => `${fmt(v)} nm` },
    )
    const steps: Step[] = [
      { text: 'Ionic strength of a z:z electrolyte:', tex: `I = \\tfrac12\\sum_i c_i z_i^2 = c_0 z^2 = ${c0}\\ \\mathrm{mM} \\times ${z}^2 = ${fmtTex(I / 1000)}\\ \\mathrm{M}` },
      {
        text: 'Debye length in water at 25 °C (ε_r = 78.5):',
        tex: `\\kappa^{-1} = \\sqrt{\\frac{\\varepsilon_0 \\varepsilon_r k T}{2 N_A e^2 I}} \\approx \\frac{0.304\\ \\mathrm{nm}}{\\sqrt{I/\\mathrm{M}}} = \\frac{0.304}{\\sqrt{${fmtTex(I / 1000)}}}\\ \\mathrm{nm} = ${fmtTex(L)}\\ \\mathrm{nm}`,
      },
      { text: 'More salt or a higher valency compresses the double layer: κ⁻¹ ∝ 1/(z√c₀).' },
    ]
    return {
      question: `What is the Debye length $\\kappa^{-1}$ in ${c0} mM ${salt(z)} in water at 25 °C?`,
      options,
      answer,
      steps,
      data: { ask, c0, z, debye: L },
    }
  }

  if (ask === 'ccc') {
    const z1 = difficulty === 'hard' ? rng.int(1, 2) : 1
    const z2 = rng.int(z1 + 1, 3)
    const c1 = round(rng.uniform(50, 200), 2)
    const ratio = (z1 / z2) ** 6
    const c2 = c1 * ratio
    const { options, answer } = numericOptions(
      rng,
      c2,
      [c1 * (z1 / z2) ** 2, c1 * (z1 / z2), c1 / ratio, c1 * (z1 / z2) ** 3], // z², linear, upside down, z³
      { format: (v) => `${fmt(v, 2)} mM` },
    )
    return {
      question: `A dispersion coagulates above ${c1} mM of a ${z1}:${z1} salt. Using the Schulze–Hardy rule, estimate the critical coagulation concentration (CCC) when the counter-ions have valency z = ${z2} instead.`,
      options,
      answer,
      steps: [
        { text: 'Schulze–Hardy rule (DLVO, high surface potential):', tex: '\\mathrm{CCC} \\propto \\frac{1}{z^6}' },
        { text: 'Scale the known CCC:', tex: `\\mathrm{CCC}_{z=${z2}} = ${c1}\\ \\mathrm{mM} \\times \\left(\\frac{${z1}}{${z2}}\\right)^6 = ${c1} \\times ${fmtTex(ratio)} = ${fmtTex(c2, 2)}\\ \\mathrm{mM}` },
        { text: 'Multivalent counter-ions screen the charge far more strongly, so far less salt is needed to coagulate.' },
      ],
      data: { ask, ccc: { z1, c1, z2, c2 } },
    }
  }

  // DLVO curve: stable (barrier above ~15 kT) or coagulating? Medium shows clear cases, hard ones near the line.
  let params: DlvoParams, b: number
  do {
    params = { c0: rng.pick(CONCS), z: rng.int(1, 3), psi0: rng.pick([25, 35, 50, 75]), a: RADIUS_DEFAULT, hamaker: HAMAKER_DEFAULT }
    b = barrier(params)
  } while (difficulty === 'hard' ? b < 3 || b > 40 || Math.abs(b - STABLE_BARRIER) < 4 : b > 0 && b < 40)
  const stable = b >= STABLE_BARRIER
  const V = DLVO_GAPS.map((h) => total(h, params))
  const labels = [
    'Stable: the energy barrier stops particles reaching the primary minimum',
    'Coagulating: the barrier is too low (or absent) to keep particles apart',
    'Stable: the salt screens the van der Waals attraction',
    'Coagulating: adding salt strengthens the double-layer repulsion',
  ]
  const { options, answer } = labelled(rng, labels, stable ? 0 : 1)
  const L = debyeLength(params.c0, params.z)
  return {
    question: `The plot shows the DLVO energy of two ${2 * params.a} nm particles ($\\psi_0$ = ${params.psi0} mV) in ${params.c0} mM ${salt(params.z)}. Is the dispersion stable or coagulating?`,
    options,
    answer,
    steps: [
      { text: 'DLVO adds double-layer repulsion and van der Waals attraction:', tex: 'V(h) = V_R(h) + V_A(h),\\quad V_R \\propto e^{-\\kappa h},\\quad V_A = -\\frac{A a}{12 h}' },
      { text: `Here κ⁻¹ = ${fmt(L)} nm, so the repulsion reaches about that far.` },
      {
        text:
          b > 0
            ? `The curve peaks at about ${Math.round(b)} kT. A barrier above ~${STABLE_BARRIER} kT is rarely crossed by thermal motion (≈ kT per collision).`
            : 'The curve has no maximum above zero: attraction wins at every distance.',
      },
      {
        text: stable
          ? 'So particles cannot reach the primary minimum: the dispersion is stable.'
          : 'So particles fall into the primary minimum: the dispersion coagulates.',
      },
    ],
    data: { ask, c0: params.c0, z: params.z, debye: L, dlvo: { params, h: DLVO_GAPS, V, barrier: b, stable } },
  }
}
