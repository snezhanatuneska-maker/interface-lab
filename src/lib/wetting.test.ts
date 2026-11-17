import { describe, expect, it } from 'vitest'
import { cassieAngle, furmidgeForce, PRESETS, slidingAngle, spreadingCoefficient, wenzelAngle, wettability, youngFromTensions } from './wetting'

describe('wetting models', () => {
  it('Young from tensions, with the complete (non-)wetting limits', () => {
    expect(youngFromTensions(40, 40, 72).delta).toBeCloseTo(90)
    expect(youngFromTensions(40, 20, 72).delta).toBeCloseTo(73.87, 1)
    expect(youngFromTensions(100, 10, 72).limit).toBe('complete wetting')
    expect(youngFromTensions(0, 100, 72).limit).toBe('complete non-wetting')
    expect(youngFromTensions(40, 20, 72).limit).toBeNull()
  })

  it('Wenzel leaves 90° unchanged for any A_r and amplifies the existing tendency', () => {
    for (const Ar of [1, 1.5, 2, 3]) expect(wenzelAngle(90, Ar)).toBeCloseTo(90)
    expect(wenzelAngle(70, 1)).toBeCloseTo(70)
    expect(wenzelAngle(70, 1.5)).toBeLessThan(70)
    expect(wenzelAngle(110, 1.5)).toBeGreaterThan(110)
    expect(wenzelAngle(30, 3)).toBe(0) // A_r cos δ > 1 is clamped
  })

  it('Cassie–Baxter equals Young at f_solid = 1 and rises as f_solid falls', () => {
    for (const d of [0, 30, 90, 110, 170]) expect(cassieAngle(d, 1)).toBeCloseTo(d)
    expect(cassieAngle(110, 0.1)).toBeGreaterThan(cassieAngle(110, 0.5))
  })

  it('spreading coefficient: S_w = γ_sg − γ_sl − γ_lg; spreading exactly when Young has no angle', () => {
    expect(spreadingCoefficient(100, 10, 72)).toBe(18)
    expect(youngFromTensions(100, 10, 72).limit).toBe('complete wetting')
    expect(spreadingCoefficient(40, 20, 72)).toBeLessThan(0)
  })

  it('Furmidge: F = w γ_lg (cos δ_r − cos δ_a), zero without hysteresis; sliding angle from m g sin α = F', () => {
    expect(furmidgeForce(3e-3, 0.072, 100, 100)).toBeCloseTo(0, 12)
    const F = furmidgeForce(3e-3, 0.072, 110, 90)
    expect(F).toBeCloseTo(3e-3 * 0.072 * Math.cos((110 * Math.PI) / 180) * -1, 9)
    const a = slidingAngle(F, 20e-9)!
    expect(1000 * 20e-9 * 9.81 * Math.sin((a * Math.PI) / 180)).toBeCloseTo(F, 12)
    expect(slidingAngle(1, 20e-9)).toBeNull()
  })

  it('labels angles', () => {
    expect(wettability(40)).toBe('hydrophilic')
    expect(wettability(120)).toBe('hydrophobic')
    expect(wettability(160)).toBe('superhydrophobic')
  })

  it('matches textbook numbers', () => {
    expect(Math.round(wenzelAngle(70, 1.5))).toBe(59)
    expect(Math.round(wenzelAngle(110, 1.5))).toBe(121)
    expect(Math.round(cassieAngle(110, 0.1))).toBe(159)
  })

  it('presets land in the intended regime', () => {
    const [glass, ptfe, lotus] = PRESETS
    expect(wettability(wenzelAngle(glass.delta, glass.Ar))).toBe('hydrophilic')
    expect(ptfe.view).toBe('wenzel')
    expect(lotus.view).toBe('cassie')
    expect(wettability(cassieAngle(lotus.delta, lotus.fSolid))).toBe('superhydrophobic')
  })
})
