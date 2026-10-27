import { describe, expect, it } from 'vitest'
import {
  binodal,
  cahnHilliardStep,
  chi,
  critical,
  deltaG,
  g2,
  gMix,
  nucleationProfile,
  PROFILE_N,
  PROFILE_T_END,
  CH_DT,
  region,
  spinodal,
  spinodalStart,
} from './phase'

describe('regular solution', () => {
  it('has its critical point at x = 0.5, T = Tc', () => {
    expect(chi(1)).toBe(2)
    expect(spinodal(2)).toBeNull()
    expect(binodal(2)).toBeNull()
    expect(spinodal(2.0001)![0]).toBeCloseTo(0.5, 2)
  })

  it('puts the spinodal where d²G/dx² = 0, inside the binodal', () => {
    for (const t of [0.5, 0.7, 0.9, 0.99]) {
      const c = chi(t)
      const [s1, s2] = spinodal(c)!
      const [b1, b2] = binodal(c)!
      expect(g2(s1, c)).toBeCloseTo(0, 8)
      expect(g2(s2, c)).toBeCloseTo(0, 8)
      expect(b1).toBeLessThan(s1)
      expect(b2).toBeGreaterThan(s2)
    }
  })

  it('finds a common tangent at the binodal (equal slope and equal G for the symmetric case)', () => {
    const c = chi(0.6)
    const [b1, b2] = binodal(c)!
    const h = 1e-6
    const slope = (x: number) => (gMix(x + h, c) - gMix(x - h, c)) / (2 * h)
    expect(slope(b1)).toBeCloseTo(0, 5)
    expect(slope(b2)).toBeCloseTo(0, 5)
    expect(gMix(b1, c)).toBeCloseTo(gMix(b2, c), 10)
  })

  it('classifies the three regions', () => {
    expect(region(0.5, 1.05)).toBe('stable')
    expect(region(0.02, 0.75)).toBe('stable')
    expect(region(0.2, 0.75)).toBe('metastable')
    expect(region(0.5, 0.75)).toBe('unstable')
  })
})

describe('profiles', () => {
  it('Cahn–Hilliard stays stable, conserves mass and reaches the two phases', () => {
    const phi = spinodalStart(7)
    const mean0 = phi.reduce((a, b) => a + b) / PROFILE_N
    for (let t = 0; t < PROFILE_T_END; t += CH_DT) cahnHilliardStep(phi)
    const mean = phi.reduce((a, b) => a + b) / PROFILE_N
    expect(mean).toBeCloseTo(mean0, 8)
    expect(Math.max(...phi)).toBeGreaterThan(0.9)
    expect(Math.min(...phi)).toBeLessThan(-0.9)
    expect(Math.max(...phi.map(Math.abs))).toBeLessThan(1.1)
  })

  it('nucleation starts uniform and ends with sharp x₂ nuclei', () => {
    expect(nucleationProfile(0).every((v) => v === -0.7)).toBe(true)
    const end = nucleationProfile(PROFILE_T_END)
    expect(Math.max(...end)).toBeGreaterThan(0.99)
    expect(Math.min(...end)).toBeGreaterThan(-1.0001)
  })
})

describe('nucleation barrier', () => {
  it('has its maximum at d* = 4γVm/(kT ln S)', () => {
    const { d, g } = critical(2, 0.05)!
    expect(deltaG(d, 2, 0.05)).toBeCloseTo(g, 6)
    expect(deltaG(d * 0.99, 2, 0.05)).toBeLessThan(g)
    expect(deltaG(d * 1.01, 2, 0.05)).toBeLessThan(g)
  })

  it('lowers d* and ΔG* as S rises, and has no maximum for S ≤ 1', () => {
    expect(critical(4, 0.05)!.d).toBeLessThan(critical(2, 0.05)!.d)
    expect(critical(4, 0.05)!.g).toBeLessThan(critical(2, 0.05)!.g)
    expect(critical(1, 0.05)).toBeNull()
    expect(deltaG(2, 0.8, 0.05)).toBeGreaterThan(deltaG(1, 0.8, 0.05))
  })
})
