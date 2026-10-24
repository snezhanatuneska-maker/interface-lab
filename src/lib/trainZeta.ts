import { E0, EPS_BULK } from './edl'
import type { Rng } from './random'
import { fmt, fmtTex, numericOptions, round, type Difficulty, type Generator } from './training'

// Zeta potential training: ζ from electrophoretic mobility (Smoluchowski), and the isoelectric point from two
// measurements either side of it.

export const ETA_WATER = 0.89e-3 // Pa·s at 25 °C

export interface ZetaData {
  kind: 'zeta'
  ask: 'smoluchowski' | 'iep'
  zeta?: number // mV
  mobility?: number // µm·cm/(V·s)
  iep?: number
}

const signed = (v: number, unit: string) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${fmt(Math.abs(v), 2)} ${unit}`

export const generateZeta: Generator<ZetaData> = (rng: Rng, difficulty: Difficulty) => {
  const ask = difficulty === 'easy' ? 'smoluchowski' : rng.pick(['smoluchowski', 'iep'] as const)
  if (ask === 'smoluchowski') {
    const mobility = round(rng.uniform(0.5, 4.5), 2) * (rng.next() < 0.5 ? -1 : 1) // µm·cm/(V·s) = 10⁻⁸ m²/(V·s)
    const zeta = ((ETA_WATER * mobility * 1e-8) / (E0 * EPS_BULK)) * 1e3 // mV
    const { options, answer } = numericOptions(
      rng,
      zeta,
      [zeta * 1.5, -zeta, zeta * EPS_BULK, zeta / 1000], // Hückel factor; sign flipped; forgot ε_r; units
      { format: (v) => signed(v, 'mV'), valid: (v) => Number.isFinite(v) && v !== 0 },
    )
    return {
      question: `Particles in water at 25 °C (η = 0.89 mPa·s, ε_r = ${EPS_BULK}) move with electrophoretic mobility ${signed(mobility, 'µm·cm/(V·s)')}. The double layer is thin compared with the particle. What is ζ?`,
      options,
      answer,
      steps: [
        { text: 'Thin double layer (κa ≫ 1): Smoluchowski equation.', tex: '\\zeta = \\frac{\\eta\\,\\mu_e}{\\varepsilon_0\\varepsilon_r}' },
        {
          text: '1 µm·cm/(V·s) = 10⁻⁸ m²/(V·s):',
          tex: `\\zeta = \\frac{0.89 \\times 10^{-3} \\times ${fmtTex(mobility)} \\times 10^{-8}}{8.854 \\times 10^{-12} \\times ${EPS_BULK}}\\ \\mathrm{V} = ${fmtTex(zeta, 2)}\\ \\mathrm{mV}`,
        },
        { text: `The sign of ζ follows the direction of motion. |ζ| ${Math.abs(zeta) > 30 ? 'above about 30 mV usually means a stable dispersion' : 'below about 30 mV means only weak electrostatic stabilisation'}.` },
      ],
      data: { kind: 'zeta', ask, zeta, mobility },
    }
  }
  const p1 = rng.int(2, 6)
  const p2 = p1 + rng.int(3, 5)
  const a = rng.int(10, 45) // ζ(p1) = +a mV
  const b = rng.int(10, 45) // ζ(p2) = −b mV
  const iep = p1 + (a * (p2 - p1)) / (a + b)
  const { options, answer } = numericOptions(
    rng,
    iep,
    [p1 + (b * (p2 - p1)) / (a + b), p1, p2, (p1 + p2) / 2], // interpolated the wrong way; one of the readings; midpoint
    { format: (v) => `pH ${v.toFixed(1)}`, apart: (x, y) => Math.abs(x - y) >= 0.4 },
  )
  return {
    question: `An oxide suspension gives ζ = +${a} mV at pH ${p1} and ζ = −${b} mV at pH ${p2}. Assuming ζ varies linearly in between, where is the isoelectric point?`,
    options,
    answer,
    steps: [
      { text: 'The IEP is where ζ = 0. Interpolate linearly between the two readings:', tex: `\\mathrm{pH_{IEP}} = ${p1} + \\frac{${a}}{${a} + ${b}} \\times (${p2} - ${p1}) = ${iep.toFixed(2)}` },
      { text: 'Below the IEP the surface takes up H⁺ and ζ > 0; above it, it loses H⁺ and ζ < 0.' },
    ],
    data: { kind: 'zeta', ask, iep },
  }
}
