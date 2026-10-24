import type { Rng } from './random'
import { fmt, fmtTex, numericOptions, round, type Difficulty, type Generator } from './training'

// Mercury porosimetry training: the Washburn equation d = −4γ cos θ / P links intrusion pressure and pore diameter.

export const GAMMA_HG = 0.485 // N/m, surface tension of mercury (the usual value in porosimetry)
export const THETA_HG = 140 // °, the usual assumed contact angle of mercury

export interface MipsData {
  kind: 'mips'
  ask: 'diameter' | 'pressure'
  P: number // MPa
  d: number // nm
}

const washburn = (P: number) => ((-4 * GAMMA_HG * Math.cos((THETA_HG * Math.PI) / 180)) / (P * 1e6)) * 1e9 // nm

export const generateMips: Generator<MipsData> = (rng: Rng, difficulty: Difficulty) => {
  const ask = difficulty === 'easy' ? 'diameter' : rng.pick(['diameter', 'pressure'] as const)
  const cos = Math.cos((THETA_HG * Math.PI) / 180)
  const law = {
    text: `Washburn equation for a cylindrical pore (γ = ${GAMMA_HG} N/m, θ = ${THETA_HG}°, so cos θ = ${cos.toFixed(3)}):`,
    tex: 'P = -\\frac{4\\gamma\\cos\\theta}{d}',
  }
  if (ask === 'diameter') {
    const P = round(rng.logUniform(0.1, 400), 2)
    const d = washburn(P)
    const { options, answer } = numericOptions(rng, d, [d / 2, d / Math.abs(cos), d * 10, d / 10], { format: (v) => `${fmt(v)} nm` })
    return {
      question: `Mercury ($\\gamma$ = ${GAMMA_HG} N/m, θ = ${THETA_HG}°) enters the pores of a catalyst layer at P = ${fmt(P)} MPa. What pore diameter does this correspond to?`,
      options,
      answer,
      steps: [
        law,
        { text: 'Solve for d:', tex: `d = -\\frac{4\\gamma\\cos\\theta}{P} = \\frac{4 \\times ${GAMMA_HG} \\times ${Math.abs(cos).toFixed(3)}}{${fmtTex(P)} \\times 10^{6}}\\ \\mathrm{m} = ${fmtTex(d)}\\ \\mathrm{nm}` },
        { text: 'A handy rule: d [nm] ≈ 1490 / P [MPa].' },
      ],
      data: { kind: 'mips', ask, P, d },
    }
  }
  const d = rng.pick([5, 10, 20, 50, 100, 200, 500, 1000, 2000])
  const P = washburn(d) // the relation is its own inverse: P [MPa] = 1490/d [nm]
  const { options, answer } = numericOptions(rng, P, [P / 2, P * 2, P / Math.abs(cos), P * 10], { format: (v) => `${fmt(v)} MPa` })
  return {
    question: `What pressure is needed to push mercury ($\\gamma$ = ${GAMMA_HG} N/m, θ = ${THETA_HG}°) into pores of diameter ${d} nm?`,
    options,
    answer,
    steps: [
      law,
      { text: 'Insert the diameter in metres:', tex: `P = \\frac{4 \\times ${GAMMA_HG} \\times ${Math.abs(cos).toFixed(3)}}{${d} \\times 10^{-9}}\\ \\mathrm{Pa} = ${fmtTex(P)}\\ \\mathrm{MPa}` },
      { text: 'Smaller pores need higher pressure: P ∝ 1/d.' },
    ],
    data: { kind: 'mips', ask, P, d },
  }
}
