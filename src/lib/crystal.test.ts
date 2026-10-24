import { describe, expect, it } from 'vitest'
import {
  bcfRate,
  controllingRegime,
  diffusionRate,
  effectiveRatio,
  facetPolygon,
  facetShape,
  stickProbability,
  survivingFamilies,
  wulffDistances,
} from './crystal'

describe('facet geometry', () => {
  it('starts as a regular octagon when all faces are equally far', () => {
    const s = facetShape(1, 1)
    expect(s.name).toBe('octagon')
    expect(s.len10).toBeCloseTo(s.len11)
    expect(facetPolygon(1, 1)).toHaveLength(8)
  })

  it('becomes a square when the {11} faces are far out, a diamond when the {10} faces are', () => {
    expect(facetShape(1, 2).name).toBe('square')
    expect(facetShape(1, 2).area).toBeCloseTo(4)
    expect(facetShape(2, 1).name).toBe('diamond')
    expect(facetShape(2, 1).area).toBeCloseTo(4)
  })

  it('keeps the area continuous at the octagon limits', () => {
    expect(facetShape(1, Math.SQRT2 - 1e-9, 0).area).toBeCloseTo(4)
    expect(facetShape(1, 1 / Math.SQRT2 + 1e-9, 0).area).toBeCloseTo(2)
  })
})

describe('growth habit', () => {
  it('lets the fast family grow out', () => {
    expect(survivingFamilies(3)).toEqual(['10'])
    expect(survivingFamilies(0.3)).toEqual(['11'])
    expect(survivingFamilies(1)).toEqual(['10', '11'])
  })

  it('slows the capped family', () => {
    expect(effectiveRatio(1, '11')).toBeCloseTo(0.4)
    expect(effectiveRatio(1, '10')).toBeCloseTo(2.5)
    expect(effectiveRatio(1.3, null)).toBe(1.3)
  })

  it('scales the Wulff shape to the requested area with h ∝ γ', () => {
    const [h10, h11] = wulffDistances(1.2, 50)
    expect(h11 / h10).toBeCloseTo(1.2)
    expect(facetShape(h10, h11, 0).area).toBeCloseTo(50)
  })
})

describe('growth regimes', () => {
  it('BCF is parabolic at low S and linear at high S', () => {
    expect(bcfRate(1.2) / bcfRate(1.1)).toBeCloseTo(4, 1)
    expect(bcfRate(41) - bcfRate(31)).toBeCloseTo(10, 0)
    expect(diffusionRate(3) / diffusionRate(2)).toBeCloseTo(2)
  })

  it('is surface-controlled at low S and diffusion-controlled at high S', () => {
    expect(controllingRegime(1.3)).toBe('surface')
    expect(controllingRegime(4)).toBe('diffusion')
  })

  it('sticks more often at higher S', () => {
    expect(stickProbability(1)).toBeCloseTo(0.001)
    expect(stickProbability(5)).toBe(1)
    expect(stickProbability(3)).toBeGreaterThan(stickProbability(2))
  })
})
