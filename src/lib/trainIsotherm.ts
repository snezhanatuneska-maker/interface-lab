import { betLoading, langmuirTheta } from './adsorption'
import type { Rng } from './random'
import { labelled, type Difficulty, type Generator, type Step } from './training'

// Isotherm recognition: draw an isotherm and ask which it is. Langmuir is IUPAC type I and BET type II, so the four
// options always come from four different families (one name each), and exactly one is right.

export type Family = 'I' | 'II' | 'III' | 'IV'
export const FAMILIES: Family[] = ['I', 'II', 'III', 'IV']

export interface IsothermData {
  family: Family
  x: number[]
  /** Adsorption branch, V/Vₘ. */
  ads: number[]
  /** Desorption branch (type IV only: the hysteresis loop). */
  des?: number[]
}

/** Names a family may go by; easy questions add the tell-tale feature, hard ones give the bare name. */
const NAMES: Record<Family, string[]> = {
  I: ['Langmuir', 'IUPAC type I'],
  II: ['BET', 'IUPAC type II'],
  III: ['IUPAC type III'],
  IV: ['IUPAC type IV'],
}
const HINTS: Record<Family, string> = {
  I: 'monolayer, plateau',
  II: 'multilayer, knee at B',
  III: 'weak adsorbate–surface binding, no knee',
  IV: 'mesopores, hysteresis loop',
}

const N = 60
export const X_MAX = 0.95
export const Y_MAX = 4

/** Type IV: multilayer start, then capillary condensation in mesopores (a step at x₀) up to a plateau. */
function typeIV(x: number, c: number, x0: number, step: number, w: number): number {
  const sig = (v: number) => 1 / (1 + Math.exp(-v))
  return langmuirTheta(x, c) * (1 + 0.8 * x) + step * sig((x - x0) / w)
}

export const generateIsotherm: Generator<IsothermData> = (rng: Rng, difficulty: Difficulty) => {
  const family = rng.pick(FAMILIES)
  let x = Array.from({ length: N }, (_, i) => (X_MAX * (i + 1)) / N)
  // Harder problems pick parameters closer to where the families start to look alike.
  const hard = difficulty === 'hard'
  const easy = difficulty === 'easy'
  let ads: number[]
  let des: number[] | undefined
  if (family === 'I') {
    const K = easy ? rng.logUniform(50, 200) : hard ? rng.logUniform(5, 15) : rng.logUniform(15, 50)
    ads = x.map((xi) => langmuirTheta(xi, K))
  } else if (family === 'II') {
    const C = easy ? rng.logUniform(50, 200) : hard ? rng.logUniform(4, 10) : rng.logUniform(10, 50)
    ads = x.map((xi) => betLoading(xi, C))
  } else if (family === 'III') {
    const C = easy ? rng.uniform(0.1, 0.4) : hard ? rng.uniform(0.8, 1.5) : rng.uniform(0.4, 0.8)
    ads = x.map((xi) => betLoading(xi, C))
  } else {
    const C = rng.logUniform(20, 100)
    const x0 = rng.uniform(0.5, 0.7)
    const step = easy ? rng.uniform(2, 3) : hard ? rng.uniform(0.8, 1.3) : rng.uniform(1.3, 2)
    const loop = easy ? 0.1 : hard ? 0.05 : 0.07 // the desorption step comes at lower pressure
    ads = x.map((xi) => typeIV(xi, C, x0, step, 0.025))
    des = x.map((xi) => typeIV(xi, C, x0 - loop, step, 0.025))
  }

  // BET-type curves run off towards p₀: stop drawing them at V/Vₘ = Y_MAX rather than flattening them there.
  const shown = ads.findIndex((v) => v > Y_MAX)
  if (shown > 0) {
    x = x.slice(0, shown)
    ads = ads.slice(0, shown)
  }

  const labelFor = (f: Family) => {
    const name = rng.pick(NAMES[f])
    return easy ? `${name} (${HINTS[f]})` : name
  }
  const { options, answer } = labelled(rng, FAMILIES.map(labelFor), FAMILIES.indexOf(family))

  const steps: Step[] = {
    I: [
      { text: 'The amount adsorbed rises steeply at low p/p₀ and then levels off to a plateau: adsorption stops at one layer.' },
      { text: 'That is the Langmuir (IUPAC type I) isotherm, θ = V/Vₘ approaching 1:', tex: '\\theta = \\frac{V}{V_m} = \\frac{K\\,p/p_0}{1 + K\\,p/p_0}' },
    ],
    II: [
      { text: 'A knee at low p/p₀ (point B, about one monolayer), then a steady climb that turns sharply upward near p₀: multilayers keep forming.' },
      { text: 'That is the BET (IUPAC type II) isotherm on a non-porous or macroporous solid:', tex: '\\frac{V}{V_m} = \\frac{C\\,x}{(1-x)(1-x+C\\,x)},\\quad x = p/p_0' },
    ],
    III: [
      { text: 'No knee: the curve is convex from the start and only rises steeply near p₀.' },
      { text: 'The adsorbate binds to the surface hardly more strongly than to itself (C < 2 in BET terms): IUPAC type III.' },
    ],
    IV: [
      { text: 'It starts like type II, then shows a steep step at intermediate p/p₀ and a plateau: capillary condensation fills the mesopores.' },
      { text: 'Desorption follows a different path (a hysteresis loop). Both features mark IUPAC type IV, a mesoporous solid.' },
    ],
  }[family]

  return { question: 'Which isotherm is this?', options, answer, steps, data: { family, x, ads, des } }
}
