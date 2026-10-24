import { E0, EPS_STERN, sternCapacitance, toMicroFcm2 } from './edl'
import type { Rng } from './random'
import { debyeProblem, type ColloidData } from './trainColloid'
import { fmt, fmtTex, numericOptions, round, type Difficulty, type Generator, type Problem } from './training'

// Double-layer training: Debye length (shared with the colloid trainer), the Stern-layer capacitance ε₀ε_S/δ, and
// the Stern and diffuse capacitances in series (src/lib/edl.ts).

export interface EdlData {
  kind: 'edl'
  ask: 'stern' | 'series'
  cStern: number // µF/cm²
  cDiffuse?: number // µF/cm²
  cTotal?: number // µF/cm²
}

function sternProblem(rng: Rng): Problem<EdlData> {
  const delta = round(rng.uniform(0.3, 1.0), 2) // nm
  const c = toMicroFcm2(sternCapacitance(delta))
  const { options, answer } = numericOptions(
    rng,
    c,
    [(c * 78.5) / EPS_STERN, c / EPS_STERN, c / 10, c * 10], // bulk ε_r; forgot ε_S; δ in Å; F/m² read as µF/cm²
    { format: (v) => `${fmt(v)} µF/cm²` },
  )
  return {
    question: `The Stern layer is modelled as a parallel-plate capacitor of thickness δ = ${delta} nm filled with ordered water ($\\varepsilon_S$ = ${EPS_STERN}). What is its capacitance per area?`,
    options,
    answer,
    steps: [
      { text: 'Parallel-plate capacitor:', tex: 'C_\\text{Stern} = \\frac{\\varepsilon_0\\varepsilon_S}{\\delta}' },
      {
        text: '1 F/m² = 100 µF/cm²:',
        tex: `C_\\text{Stern} = \\frac{${fmtTex(E0, 4)} \\times ${EPS_STERN}}{${delta} \\times 10^{-9}}\\ \\mathrm{F/m^2} = ${fmtTex(c)}\\ \\mathrm{\\mu F/cm^2}`,
      },
      { text: 'Measured double-layer capacitances are of this order (10–30 µF/cm²).' },
    ],
    data: { kind: 'edl', ask: 'stern', cStern: c },
  }
}

function seriesProblem(rng: Rng): Problem<EdlData> {
  const cS = rng.int(10, 30)
  const cD = rng.pick([5, 10, 20, 50, 100, 300])
  const cT = 1 / (1 / cS + 1 / cD)
  const { options, answer } = numericOptions(
    rng,
    cT,
    [cS + cD, (cS + cD) / 2, Math.max(cS, cD)], // in parallel; average; the larger one
    { format: (v) => `${fmt(v)} µF/cm²` },
  )
  return {
    question: `In the Gouy–Chapman–Stern model, $C_\\text{Stern}$ = ${cS} µF/cm² and $C_\\text{diffuse}$ = ${cD} µF/cm². What is the total double-layer capacitance?`,
    options,
    answer,
    steps: [
      { text: 'The Stern and diffuse layers are capacitors in series:', tex: '\\frac{1}{C_\\text{tot}} = \\frac{1}{C_\\text{Stern}} + \\frac{1}{C_\\text{diffuse}}' },
      { text: 'Insert the values:', tex: `C_\\text{tot} = \\left(\\frac{1}{${cS}} + \\frac{1}{${cD}}\\right)^{-1} = ${fmtTex(cT)}\\ \\mathrm{\\mu F/cm^2}` },
      { text: 'In series the smaller capacitor wins: C_tot is always below both.' },
    ],
    data: { kind: 'edl', ask: 'series', cStern: cS, cDiffuse: cD, cTotal: cT },
  }
}

export const generateEdl: Generator<EdlData | ColloidData> = (rng: Rng, difficulty: Difficulty) => {
  const ask = rng.pick(difficulty === 'easy' ? ['debye', 'stern'] : ['debye', 'stern', 'series'])
  if (ask === 'debye') return debyeProblem(rng, difficulty)
  return ask === 'stern' ? sternProblem(rng) : seriesProblem(rng)
}
