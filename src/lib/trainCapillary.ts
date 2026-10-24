import { capillaryPressure, GAMMA } from './capillary'
import type { Rng } from './random'
import { fmt, fmtTex, numericOptions, type Difficulty, type Generator } from './training'

// Capillary training: Young–Laplace P_c = 2γ cos θ / r for water in a cylindrical pore (src/lib/capillary.ts).

export interface CapillaryData {
  kind: 'capillary'
  ask: 'pressure' | 'radius'
  r: number // nm
  theta: number // deg
  P: number // MPa
}

const RADII = [2, 3, 5, 8, 10, 15, 20, 30, 50]
const RAD = Math.PI / 180

export const generateCapillary: Generator<CapillaryData> = (rng: Rng, difficulty: Difficulty) => {
  const ask = difficulty === 'easy' ? 'pressure' : rng.pick(['pressure', 'radius'] as const)
  const r = rng.pick(RADII)
  const theta = difficulty === 'easy' ? 0 : rng.int(1, 8) * 10
  const P = capillaryPressure(r, theta) / 1000 // MPa
  const cos = Math.cos(theta * RAD)
  const law = { text: 'Young–Laplace for a cylindrical pore:', tex: 'P_c = \\frac{2\\gamma\\cos\\theta}{r}' }

  if (ask === 'pressure') {
    const { options, answer } = numericOptions(rng, P, [P / 2, P / cos, P * 1000, P / 1000], { format: (v) => `${fmt(v)} MPa` })
    return {
      question: `Water ($\\gamma$ = ${GAMMA * 1000} mN/m) wets a cylindrical pore of radius r = ${r} nm with contact angle θ = ${theta}°. What is the capillary pressure $P_c$?`,
      options,
      answer,
      steps: [
        law,
        {
          text: 'Insert SI units (r in m):',
          tex: `P_c = \\frac{2 \\times ${GAMMA} \\times \\cos ${theta}^\\circ}{${r} \\times 10^{-9}}\\ \\mathrm{Pa} = ${fmtTex(P * 1e6)}\\ \\mathrm{Pa} = ${fmtTex(P)}\\ \\mathrm{MPa}`,
        },
        { text: 'Nanometre pores give pressures of megapascals: P_c ∝ 1/r.' },
      ],
      data: { kind: 'capillary', ask, r, theta, P },
    }
  }

  const Pr = Number(P.toPrecision(3))
  const rr = (2 * GAMMA * cos) / (Pr * 1e6) * 1e9
  const { options, answer } = numericOptions(rng, rr, [rr * 2, rr / 2, rr / cos], { format: (v) => `${fmt(v)} nm` })
  return {
    question: `A capillary pressure of ${fmt(Pr)} MPa is measured for water ($\\gamma$ = ${GAMMA * 1000} mN/m, θ = ${theta}°) in cylindrical pores. What is the pore radius?`,
    options,
    answer,
    steps: [
      law,
      { text: 'Solve for r:', tex: `r = \\frac{2\\gamma\\cos\\theta}{P_c} = \\frac{2 \\times ${GAMMA} \\times ${cos.toFixed(3)}}{${fmtTex(Pr)} \\times 10^{6}}\\ \\mathrm{m} = ${fmtTex(rr)}\\ \\mathrm{nm}` },
    ],
    data: { kind: 'capillary', ask, r: rr, theta, P: Pr },
  }
}
