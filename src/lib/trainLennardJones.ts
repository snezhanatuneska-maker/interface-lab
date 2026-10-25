import type { Rng } from './random'
import { fmt, fmtTex, numericOptions, round, type Difficulty, type Generator, type Problem } from './training'

export interface LennardJonesData {
  epsilon: number
  sigma: number
}

export const generateLennardJones: Generator<LennardJonesData> = (
  rng: Rng,
  difficulty: Difficulty,
): Problem<LennardJonesData> => {
  const epsilon = round(rng.uniform(0.5, 2.5), 2) // kJ/mol or eV
  const sigma = round(rng.uniform(2.5, 4.5), 2) // Å

  const ask = difficulty === 'easy' ? 'rm' : rng.pick(['rm', 'force'] as const)

  if (ask === 'rm') {
    const rm = round(Math.pow(2, 1 / 6) * sigma, 3)
    const { options, answer } = numericOptions(
      rng,
      rm,
      [sigma, round(Math.pow(2, 1 / 3) * sigma, 3), round(1.5 * sigma, 3)],
      { format: (v) => `${fmt(v, 3)} Å` },
    )

    return {
      question: `For a Lennard-Jones fluid with a finite distance parameter $\\sigma = ${sigma}$ Å, what is the exact equilibrium distance $r_m$ where the potential energy reaches its minimum?`,
      options,
      answer,
      steps: [
        { text: 'Equilibrium condition:', tex: `r_m = 2^{1/6}\\sigma \\approx 1.1224 \\times \\sigma` },
        { text: 'Substitute the value of σ:', tex: `r_m = 1.1224 \\times ${fmtTex(sigma, 2)}\\ \\text{Å} = ${fmtTex(rm, 3)}\\ \\text{Å}` },
      ],
      data: { epsilon, sigma },
    }
  } else {
    // Force at r = sigma (where V(sigma) = 0, F = 24 epsilon / sigma)
    const forceAtSigma = round((24 * epsilon) / sigma, 2)
    const { options, answer } = numericOptions(
      rng,
      forceAtSigma,
      [round(forceAtSigma * 0.5, 2), round(forceAtSigma * 2, 2), 0],
      { format: (v) => `${fmt(v, 2)} units` },
    )

    return {
      question: `Given a Lennard-Jones potential with $\\epsilon = ${epsilon}$ and $\\sigma = ${sigma}$ Å, what is the magnitude of the conservative force $F(r) = -dV/dr$ exactly at $r = \\sigma$?`,
      options,
      answer,
      steps: [
        { text: 'Force derivative equation:', tex: `F(r) = -\\frac{dV}{dr} = 4\\epsilon \\left( \\frac{12\\sigma^{12}}{r^{13}} - \\frac{6\\sigma^6}{r^7} \\right)` },
        { text: 'Evaluate at $r = \\sigma$:', tex: `F(\\sigma) = \\frac{24\\epsilon}{\\sigma} = \\frac{24 \\times ${fmtTex(epsilon, 2)}}{${fmtTex(sigma, 2)}} = ${fmtTex(forceAtSigma, 2)}\\ \\text{units}` },
      ],
      data: { epsilon, sigma },
    }
  }
}
