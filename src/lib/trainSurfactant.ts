import type { Rng } from './random'
import { areaPerMolecule, cmcNoSalt, HEADS, type HeadType } from './surfactants'
import { fmt, fmtTex, numericOptions, round, type Difficulty, type Generator } from './training'

// Surfactant training: the Klevens rule for the CMC against tail length (src/lib/surfactants.ts), and the area per
// molecule at the interface from the surface excess Γ.

export interface SurfactantData {
  kind: 'surfactant'
  ask: 'klevens' | 'area'
  head?: HeadType
  n1?: number
  n2?: number
  cmc1?: number // mM
  cmc2?: number // mM
  gamma?: number // µmol/m²
  area?: number // nm²
}

const HEAD_NAMES: Record<HeadType, string> = { anionic: 'anionic', cationic: 'cationic', nonionic: 'non-ionic', zwitterionic: 'zwitterionic' }

export const generateSurfactant: Generator<SurfactantData> = (rng: Rng, difficulty: Difficulty) => {
  const ask = difficulty === 'easy' ? 'klevens' : rng.pick(['klevens', 'area'] as const)

  if (ask === 'klevens') {
    const head: HeadType = difficulty === 'hard' ? rng.pick(['anionic', 'cationic', 'nonionic'] as const) : rng.pick(['anionic', 'cationic'] as const)
    const B = HEADS[head].klevensB
    const n1 = rng.int(10, 14)
    const dn = rng.pick(difficulty === 'easy' ? [1, 2] : [-2, -1, 1, 2])
    const n2 = n1 + dn
    const cmc1 = round(cmcNoSalt(head, n1) * 1000, 2) // mM
    const cmc2 = cmc1 * 10 ** (-B * dn)
    const { options, answer } = numericOptions(
      rng,
      cmc2,
      [cmc1 * 10 ** (B * dn), (cmc1 * n1) / n2, cmc1 * 10 ** -dn, cmc1], // sign flipped; linear in n; ÷10 per CH₂; unchanged
      { format: (v) => `${fmt(v, 2)} mM` },
    )
    return {
      question: `A ${HEAD_NAMES[head]} surfactant with a C${n1} tail has a CMC of ${fmt(cmc1, 2)} mM. Estimate the CMC of the same surfactant with a C${n2} tail (Klevens rule, B = ${B}).`,
      options,
      answer,
      steps: [
        { text: 'Klevens rule:', tex: `\\log_{10}\\mathrm{CMC} = A - B\\,n \;\\Rightarrow\; \\mathrm{CMC}_2 = \\mathrm{CMC}_1 \\times 10^{-B(n_2 - n_1)}` },
        { text: 'Insert the values:', tex: `\\mathrm{CMC}_2 = ${fmtTex(cmc1, 2)}\\ \\mathrm{mM} \\times 10^{-${B} \\times (${dn})} = ${fmtTex(cmc2, 2)}\\ \\mathrm{mM}` },
        { text: `Each extra CH₂ makes leaving the water more favourable, so a longer tail lowers the CMC (×${fmt(10 ** -B, 2)} per CH₂ here).` },
      ],
      data: { kind: 'surfactant', ask, head, n1, n2, cmc1, cmc2 },
    }
  }

  const gamma = round(rng.uniform(1.5, 5), 2) // µmol/m²
  const A = areaPerMolecule(gamma * 1e-6) // nm², Γ in mol/m²
  // Å² read as nm²; 1/a; Γ taken per mole of ion pairs counted twice
  const { options, answer } = numericOptions(rng, A, [A * 100, 1 / A, A / 2], { format: (v) => `${fmt(v)} nm²` })
  return {
    question: `From the Gibbs equation, the surface excess just below the CMC is Γ = ${fmt(gamma)} µmol/m². What area does each surfactant molecule occupy at the interface?`,
    options,
    answer,
    steps: [
      { text: 'Area per molecule:', tex: 'a = \\frac{1}{\\Gamma N_A}' },
      { text: 'Insert Γ in mol/m²:', tex: `a = \\frac{1}{${fmtTex(gamma)} \\times 10^{-6} \\times 6.022 \\times 10^{23}}\\ \\mathrm{m^2} = ${fmtTex(A)}\\ \\mathrm{nm^2}` },
      { text: 'Typical values are 0.3–1 nm² per molecule: a densely packed monolayer.' },
    ],
    data: { kind: 'surfactant', ask, gamma, area: A },
  }
}
