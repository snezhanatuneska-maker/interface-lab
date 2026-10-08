import { describe, expect, it } from 'vitest'
import {
  AREA_PER_VM,
  betFromLine,
  betLoading,
  betTransform,
  fitLine,
  kneeX,
  langmuirTheta,
  ptAreaPerGram,
  siteHeightSd,
  surfaceArea,
} from './adsorption'

describe('Langmuir', () => {
  it('is half covered at x = 1/K and stays below one monolayer', () => {
    expect(langmuirTheta(1 / 10, 10)).toBeCloseTo(0.5)
    expect(langmuirTheta(0.95, 200)).toBeLessThan(1)
    expect(langmuirTheta(0, 50)).toBe(0)
  })
})

describe('BET', () => {
  it('reaches one monolayer at the knee x = 1/(1 + √C)', () => {
    for (const c of [2, 10, 50, 500]) expect(betLoading(kneeX(c), c)).toBeCloseTo(1, 10)
  })

  it('matches Langmuir with K = C at low pressure and diverges near p₀', () => {
    expect(betLoading(1e-4, 50) / langmuirTheta(1e-4, 50)).toBeCloseTo(1, 2)
    expect(betLoading(0.999, 50)).toBeGreaterThan(900)
  })

  it('recovers Vm and C from the straight-line BET plot', () => {
    const Vm = 55
    const C = 80
    const xs = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3]
    const ys = xs.map((x) => betTransform(x, Vm * betLoading(x, C)))
    const line = fitLine(xs, ys)
    expect(line.intercept).toBeCloseTo(1 / (Vm * C), 10)
    expect(line.slope).toBeCloseTo((C - 1) / (Vm * C), 10)
    const fit = betFromLine(line.slope, line.intercept)
    expect(fit.Vm).toBeCloseTo(Vm, 8)
    expect(fit.C).toBeCloseTo(C, 6)
  })
})

describe('site-height spread', () => {
  it('has the variance of a Bernoulli site for Langmuir', () => {
    expect(siteHeightSd('langmuir', 0.1, 10, 1)).toBeCloseTo(0.5)
    expect(siteHeightSd('bet', 0, 1, 50)).toBe(0)
  })
})

describe('surface area', () => {
  it('uses 4.35 m² per cm³(STP) of N₂ monolayer', () => {
    expect(AREA_PER_VM).toBeCloseTo(4.353, 3)
    expect(surfaceArea(100)).toBeCloseTo(435.3, 1)
  })

  it('gives about 93 m²/g for 3 nm Pt spheres', () => {
    expect(ptAreaPerGram(3)).toBeCloseTo(93.2, 1)
  })
})
