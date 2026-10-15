import { describe, expect, it } from 'vitest'
import { cassieAngle, criticalAngle, favoredState, PRESETS, wenzelAngle, wettability, youngFromTensions } from './wetting'

describe('wetting models', () => {
  it('Young from tensions, with the complete (non-)wetting limits', () => {
    expect(youngFromTensions(40, 40, 72.8).theta).toBeCloseTo(90)
    expect(youngFromTensions(40, 20, 72.8).theta).toBeCloseTo(74.06, 1)
    expect(youngFromTensions(100, 10, 72.8).limit).toBe('complete wetting')
    expect(youngFromTensions(0, 100, 72.8).limit).toBe('complete non-wetting')
    expect(youngFromTensions(40, 20, 72.8).limit).toBeNull()
  })

  it('Wenzel leaves 90° unchanged for any r and amplifies the existing tendency', () => {
    for (const r of [1, 1.5, 2, 3]) expect(wenzelAngle(90, r)).toBeCloseTo(90)
    expect(wenzelAngle(70, 1)).toBeCloseTo(70)
    expect(wenzelAngle(70, 1.5)).toBeLessThan(70)
    expect(wenzelAngle(110, 1.5)).toBeGreaterThan(110)
    expect(wenzelAngle(30, 3)).toBe(0) // r cos θ > 1 is clamped
  })

  it('Cassie–Baxter equals Young at f_s = 1 and rises as f_s falls', () => {
    for (const t of [0, 30, 90, 110, 170]) expect(cassieAngle(t, 1)).toBeCloseTo(t)
    expect(cassieAngle(110, 0.1)).toBeGreaterThan(cassieAngle(110, 0.5))
  })

  it('critical angle sits between 90° and 180°', () => {
    expect(criticalAngle(1, 1)).toBeNull()
    expect(criticalAngle(1, 0.5)).toBeCloseTo(180)
    expect(criticalAngle(3, 0.1)).toBeCloseTo(108.08, 1)
    expect(favoredState(60, 3, 0.1)).toBe('wenzel')
    expect(favoredState(110, 3, 0.1)).toBe('cassie')
  })

  it('labels angles', () => {
    expect(wettability(40)).toBe('hydrophilic')
    expect(wettability(120)).toBe('hydrophobic')
    expect(wettability(160)).toBe('superhydrophobic')
  })

  it('matches the numbers used in the quiz', () => {
    expect(Math.round(wenzelAngle(70, 1.5))).toBe(59) // Q2
    expect(Math.round(wenzelAngle(110, 1.5))).toBe(121) // Q3
    expect(Math.round(cassieAngle(110, 0.1))).toBe(159) // Q5
  })

  it('presets land in the intended regime', () => {
    const [glass, ptfe, lotus] = PRESETS
    expect(wettability(wenzelAngle(glass.thetaY, glass.r))).toBe('hydrophilic')
    expect(favoredState(ptfe.thetaY, ptfe.r, ptfe.fs)).toBe('wenzel')
    expect(favoredState(lotus.thetaY, lotus.r, lotus.fs)).toBe('cassie')
    expect(wettability(cassieAngle(lotus.thetaY, lotus.fs))).toBe('superhydrophobic')
  })
})
