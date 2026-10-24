import type { Rng } from './random'
import { fmt, labelled, numericOptions, type Difficulty, type Generator } from './training'

// Van der Waals training: how the pair energy φ = −C/r⁶ changes with distance, and the 1/T dependence of Keesom.

export interface VdwData {
  kind: 'vdw'
  ask: 'distance' | 'keesom'
  factor: number
}

export const generateVdw: Generator<VdwData> = (rng: Rng, difficulty: Difficulty) => {
  const ask = difficulty === 'easy' ? 'distance' : rng.pick(['distance', 'keesom'] as const)
  if (ask === 'distance') {
    const k = rng.pick(difficulty === 'easy' ? [2, 3] : [1.5, 2, 2.5, 3])
    const closer = rng.next() < 0.5
    const factor = closer ? k ** 6 : k ** -6
    const { options, answer } = numericOptions(rng, factor, closer ? [k, k ** 2, k ** 12, k ** 3] : [1 / k, k ** -2, k ** -12, k ** -3], {
      format: (v) => `× ${fmt(v)}`,
    })
    return {
      question: `Two molecules attract by van der Waals forces. Their distance ${closer ? `shrinks by a factor of ${k}` : `grows by a factor of ${k}`}. By what factor does the attraction energy |φ| change?`,
      options,
      answer,
      steps: [
        { text: 'Keesom, Debye and London all scale the same way:', tex: '\\varphi(r) = -\\frac{C_\\text{vdW}}{r^6}' },
        { text: `So |φ| changes by (${closer ? k : `1/${k}`})⁶ = ${fmt(factor)}.`, tex: `\\frac{\\varphi(r_2)}{\\varphi(r_1)} = \\left(\\frac{r_1}{r_2}\\right)^6` },
      ],
      data: { kind: 'vdw', ask, factor },
    }
  }
  const T1 = rng.pick([250, 293, 300, 350])
  const T2 = rng.pick([200, 400, 500, 600].filter((t) => t !== T1))
  const factor = T1 / T2
  const { options, answer } =
    difficulty === 'hard'
      ? numericOptions(rng, factor, [T2 / T1, 1, factor ** 2, factor ** 0.5], { format: (v) => `× ${fmt(v)}` })
      : labelled(rng, [`× ${fmt(factor)} (Keesom ∝ 1/T)`, `× ${fmt(T2 / T1)} (Keesom ∝ T)`, '× 1 (no T dependence)', `× ${fmt(factor ** 2)} (Keesom ∝ 1/T²)`], 0)
  return {
    question: `A gas of polar molecules is heated from ${T1} K to ${T2} K. By what factor does the Keesom coefficient $C_\\text{Keesom}$ change?`,
    options,
    answer,
    steps: [
      { text: 'Keesom (rotating permanent dipoles, Boltzmann-averaged):', tex: 'C_\\text{Keesom} = \\frac{\\mu^4}{3(4\\pi\\varepsilon_0)^2 kT} \\propto \\frac{1}{T}' },
      { text: `So C changes by T₁/T₂ = ${T1}/${T2} = ${fmt(factor)}. Faster tumbling averages out the dipole alignment; Debye and London do not depend on T.` },
    ],
    data: { kind: 'vdw', ask, factor },
  }
}
