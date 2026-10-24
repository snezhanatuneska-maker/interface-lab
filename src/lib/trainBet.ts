import { AREA_PER_VM, betFromLine, betLoading, betTransform, fitLine, SIGMA_N2 } from './adsorption'
import type { Rng } from './random'
import { fmt, fmtTex, numericOptions, round, type Difficulty, type Generator, type Step } from './training'

// BET training: a slightly noisy N₂ dataset in the BET range; find Vₘ, C or the specific surface area from the
// straight line p/p₀ / [V(1 − p/p₀)] = 1/(Vₘ C) + (C − 1)/(Vₘ C) · p/p₀.

export type BetAsk = 'Vm' | 'C' | 'area'

export interface BetData {
  /** Relative pressures p/p₀. */
  x: number[]
  /** Adsorbed volumes V in cm³(STP)/g, as shown in the table (rounded, with noise). */
  V: number[]
  /** BET transform of each point. */
  y: number[]
  slope: number
  intercept: number
  /** Whether the question states slope and intercept (easy, medium) or they are read off the plot (hard). */
  lineGiven: boolean
  ask: BetAsk
  /** The sample's true values, before noise (for the tests). */
  trueVm: number
  trueC: number
}

const ASKS: Record<Difficulty, BetAsk[]> = { easy: ['Vm', 'C'], medium: ['area', 'C', 'Vm'], hard: ['area', 'C', 'Vm'] }
const NOISE: Record<Difficulty, number> = { easy: 0.003, medium: 0.008, hard: 0.015 }

export const generateBet: Generator<BetData> = (rng: Rng, difficulty: Difficulty) => {
  const area = rng.logUniform(20, 1000) // m²/g, from metal blacks to high-area carbons
  const trueVm = area / AREA_PER_VM
  const trueC = rng.logUniform(20, 200)
  const n = rng.int(5, 6)
  const x = Array.from({ length: n }, (_, i) => round(0.05 + (0.25 * i) / (n - 1), 2))
  const V = x.map((xi) => round(trueVm * betLoading(xi, trueC) * (1 + NOISE[difficulty] * rng.normal()), 3))
  const y = x.map((xi, i) => betTransform(xi, V[i]))
  const fit = fitLine(x, y)
  // The values the student works with are the rounded ones they see.
  const slope = round(fit.slope, 3)
  const intercept = round(fit.intercept, 3)
  const ask = rng.pick(ASKS[difficulty])
  const lineGiven = difficulty !== 'hard'

  const { Vm, C } = betFromLine(slope, intercept)
  const A = Vm * AREA_PER_VM

  const s = fmtTex(slope)
  const i = fmtTex(intercept)
  const steps: Step[] = [
    {
      text: lineGiven
        ? 'The straight-line BET plot gives the slope and intercept:'
        : 'Read the slope and intercept off the straight line through the points:',
      tex: `\\begin{gathered}\\text{slope} = \\frac{C-1}{V_m C} = ${s}\\ \\mathrm{g/cm^3} \\\\ \\text{intercept} = \\frac{1}{V_m C} = ${i}\\ \\mathrm{g/cm^3}\\end{gathered}`,
    },
  ]
  if (ask === 'Vm' || ask === 'area')
    steps.push({ text: 'Add them: slope + intercept = 1/Vₘ, so', tex: `V_m = \\frac{1}{\\text{slope} + \\text{intercept}} = \\frac{1}{${s} + ${i}} = ${fmtTex(Vm)}\\ \\mathrm{cm^3(STP)/g}` })
  if (ask === 'C')
    steps.push({ text: 'Divide them: slope/intercept = C − 1, so', tex: `C = \\frac{\\text{slope}}{\\text{intercept}} + 1 = \\frac{${s}}{${i}} + 1 = ${fmtTex(C)}` })
  if (ask === 'area')
    steps.push({
      text: `Each N₂ molecule covers σ = ${SIGMA_N2} nm² = ${fmtTex(SIGMA_N2 * 1e-18)} m², and one mole of gas at STP is 22 414 cm³:`,
      tex: `\\frac{A}{m} = \\frac{V_m N_A \\sigma}{V_{mol}} = \\frac{${fmtTex(Vm)} \\times 6.022 \\times 10^{23} \\times ${SIGMA_N2} \\times 10^{-18}}{22\\,414} = ${fmtTex(A)}\\ \\mathrm{m^2/g}`,
    })

  const unit = { Vm: ' cm³(STP)/g', C: '', area: ' m²/g' }[ask]
  const format = (v: number) => (ask === 'C' ? fmt(v) : `${fmt(v)}${unit}`)
  // Typical mistakes, most likely first.
  const mistakes = {
    Vm: [1 / slope, 1 / intercept, slope + intercept], // slope alone; intercept alone; forgot the reciprocal
    C: [intercept / slope + 1, 1 / intercept, slope / intercept - 1], // slope and intercept mixed up; forgot ÷Vₘ; sign slip
    area: [AREA_PER_VM / slope, A / 100, AREA_PER_VM / intercept], // slope alone; σ in Å² read as nm²; intercept alone
  }[ask]
  const correct = { Vm, C, area: A }[ask]
  const { options, answer } = numericOptions(rng, correct, mistakes, { format })

  const what = {
    Vm: 'the monolayer capacity Vₘ',
    C: 'the BET constant C',
    area: 'the specific surface area (N₂, σ = 0.162 nm²)',
  }[ask]
  const line = lineGiven ? ` The straight-line fit has slope ${fmt(slope)} g/cm³ and intercept ${fmt(intercept)} g/cm³.` : ''
  return {
    question: `N₂ adsorption at 77 K gave the data shown.${line} What is ${what}?`,
    options,
    answer,
    steps,
    data: { x, V, y, slope, intercept, lineGiven, ask, trueVm, trueC },
  }
}
