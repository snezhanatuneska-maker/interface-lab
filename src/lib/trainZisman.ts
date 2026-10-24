import { fitLine } from './adsorption'
import type { Rng } from './random'
import { fmt, fmtTex, numericOptions, round, type Difficulty, type Generator } from './training'

// Zisman training: contact angles of several test liquids on one solid; plot cos θ against γ_LV, fit a straight
// line and extrapolate to cos θ = 1 to find the critical surface tension γ_c.

export interface ZismanData {
  kind: 'zisman'
  gLV: number[] // mN/m
  theta: number[] // deg, rounded as shown
  cos: number[]
  slope: number
  intercept: number
  lineGiven: boolean
  gammaC: number // from the fit of the shown data
  trueGammaC: number
}

/** Surface tensions of common test liquids at 20 °C, mN/m (water, glycerol, formamide, diiodomethane, ethylene glycol, α-bromonaphthalene). */
const LIQUIDS = [72.8, 63.4, 58.2, 50.8, 47.7, 44.4]
const RAD = Math.PI / 180

export const generateZisman: Generator<ZismanData> = (rng: Rng, difficulty: Difficulty) => {
  const trueGammaC = round(rng.uniform(18, 35), 3)
  const b = rng.uniform(0.02, 0.035)
  const gLV = rng.shuffle(LIQUIDS).slice(0, 4).sort((x, y) => x - y)
  const noise = difficulty === 'hard' ? 1 : 0.5 // degrees, on top of rounding to whole degrees
  const theta = gLV.map((g) => Math.round(Math.acos(Math.max(-0.9, 1 - b * (g - trueGammaC))) / RAD + noise * rng.normal()))
  const cos = theta.map((t) => Math.cos(t * RAD))
  const fit = fitLine(gLV, cos)
  const slope = round(fit.slope, 3)
  const intercept = round(fit.intercept, 3)
  const gammaC = (1 - intercept) / slope
  const lineGiven = difficulty === 'easy'
  const { options, answer } = numericOptions(
    rng,
    gammaC,
    [-intercept / slope, gLV[0], gLV.reduce((a, g) => a + g, 0) / gLV.length], // cos θ = 0; lowest liquid; mean γ_LV
    { format: (v) => `${fmt(v)} mN/m`, apart: (a, c) => Math.abs(a - c) >= 4 },
  )
  const line = lineGiven ? ` The straight-line fit is cos θ = ${intercept} ${slope < 0 ? '−' : '+'} ${Math.abs(slope)}·γ_LV (γ_LV in mN/m).` : ''
  return {
    question: `Four liquids were placed on a polymer film; their contact angles are shown.${line} What is the critical surface tension $\\gamma_c$ of the film?`,
    options,
    answer,
    steps: [
      { text: 'Zisman plot: cos θ falls roughly linearly with γ_LV. The fitted line is', tex: `\\cos\\theta = ${fmtTex(intercept)} ${slope < 0 ? '-' : '+'} ${fmtTex(Math.abs(slope))}\\,\\gamma_{LV}` },
      { text: 'γ_c is where the line reaches complete wetting, cos θ = 1:', tex: `\\gamma_c = \\frac{1 - ${fmtTex(intercept)}}{${fmtTex(slope)}} = ${fmtTex(gammaC)}\\ \\mathrm{mN/m}` },
      { text: 'Liquids with γ_LV below γ_c spread completely on this solid.' },
    ],
    data: { kind: 'zisman', gLV, theta, cos, slope, intercept, lineGiven, gammaC, trueGammaC },
  }
}
