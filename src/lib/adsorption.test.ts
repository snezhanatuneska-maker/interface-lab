import { describe, expect, it } from 'vitest'
import {
  AREA_PER_VM,
  BET_FIT_RANGE,
  C_RANGE,
  K_RANGE,
  betFromLine,
  betLoading,
  betTransform,
  fitLine,
  kneeX,
  langmuirTheta,
  ptAreaPerGram,
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

describe('surface area', () => {
  it('uses 4.35 m² per cm³(STP) of N₂ monolayer', () => {
    expect(AREA_PER_VM).toBeCloseTo(4.353, 3)
    expect(surfaceArea(100)).toBeCloseTo(435.3, 1)
  })

  it('gives about 93 m²/g for 3 nm Pt spheres', () => {
    expect(ptAreaPerGram(3)).toBeCloseTo(93.2, 1)
  })
})

const grid = (a: number, b: number, n: number) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n)

describe('Langmuir, numerical checks', () => {
  it('starts at 0, is half covered at Kx = 1, rises monotonically and saturates at 1', () => {
    for (const K of [0.5, 1, 10, 200]) {
      expect(langmuirTheta(0, K)).toBe(0)
      expect(langmuirTheta(1 / K, K)).toBeCloseTo(0.5, 12)
      const ys = grid(0, 0.95, 500).map((x) => langmuirTheta(x, K))
      for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThan(ys[i - 1])
    }
    expect(langmuirTheta(0.9, 1e7)).toBeGreaterThan(0.999999)
  })

  it('recovers K and Vm from the straight line x/V = 1/(K·Vm) + x/Vm', () => {
    const K = 7.3
    const Vm = 42
    const xs = grid(0.02, 0.9, 20)
    const line = fitLine(xs, xs.map((x) => x / (Vm * langmuirTheta(x, K))))
    expect(1 / line.slope).toBeCloseTo(Vm, 8)
    expect(line.slope / line.intercept).toBeCloseTo(K, 8)
  })
})

describe('BET, numerical checks', () => {
  it('starts at 0, rises monotonically on 0 < x < 1 and reaches Vm at the knee', () => {
    for (const c of [0.5, 1, 2, 10, 50, 500, 1e5]) {
      expect(betLoading(0, c)).toBe(0)
      const ys = grid(1e-6, 0.99, 2000).map((x) => betLoading(x, c))
      for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThan(ys[i - 1])
      expect(betLoading(kneeX(c), c)).toBeCloseTo(1, 9)
    }
  })

  it('reduces to x/(1 − x) for C = 1', () => {
    for (const x of [0.1, 0.5, 0.9]) expect(betLoading(x, 1)).toBeCloseTo(x / (1 - x), 12)
  })

  it('recovers Vm and C within 1% from a fit over the BET range', () => {
    for (const [Vm, C] of [[55, 80], [10, 3], [200, 500], [1, 2.5]]) {
      const xs = grid(BET_FIT_RANGE[0], BET_FIT_RANGE[1], 12)
      const line = fitLine(xs, xs.map((x) => betTransform(x, Vm * betLoading(x, C))))
      const fit = betFromLine(line.slope, line.intercept)
      expect(Math.abs(fit.Vm / Vm - 1)).toBeLessThan(0.01)
      expect(Math.abs(fit.C / C - 1)).toBeLessThan(0.01)
    }
  })
})

describe('edge cases', () => {
  it('stays finite over the plotted range at the slider extremes', () => {
    for (const x of grid(0, 0.95, 300)) {
      for (const c of [...C_RANGE, 1]) expect(Number.isFinite(betLoading(x, c))).toBe(true)
      for (const K of K_RANGE) expect(Number.isFinite(langmuirTheta(x, K))).toBe(true)
    }
  })

  it('never returns NaN, Infinity or a negative loading for bad input', () => {
    const bad = [NaN, Infinity, -Infinity, -1, -0.5, 0, 1, 1.2]
    for (const x of bad)
      for (const k of [...bad, 50]) {
        for (const v of [betLoading(x, k), langmuirTheta(x, k)]) {
          expect(Number.isFinite(v)).toBe(true)
          expect(v).toBeGreaterThanOrEqual(0)
        }
      }
    expect(langmuirTheta(0.5, 0)).toBe(0)
    expect(betLoading(0.3, 0)).toBe(0)
  })

  it('fits a flat line instead of NaN when there is nothing to fit', () => {
    expect(fitLine([], [])).toEqual({ slope: 0, intercept: 0 })
    expect(fitLine([0.1], [2])).toEqual({ slope: 0, intercept: 2 })
    expect(fitLine([0.2, 0.2], [1, 3])).toEqual({ slope: 0, intercept: 2 })
  })
})
