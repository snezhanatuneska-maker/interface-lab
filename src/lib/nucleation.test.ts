import { describe, expect, it } from 'vitest'
import { barrierHom, criticalDiameter, deltaG, K_B, shapeFactor, solve } from './nucleation'

describe('critical nucleus', () => {
  it('puts the maximum of ΔG(d) at d* with height ΔG*_hom', () => {
    for (const [S, gamma, T] of [
      [5, 0.1, 298],
      [1.2, 0.05, 250],
      [20, 0.5, 500],
    ]) {
      const dStar = criticalDiameter(S, gamma, T)!
      const g = barrierHom(S, gamma, T)!
      let best = 0
      let bestD = 0
      const n = 20000
      for (let i = 1; i <= n; i++) {
        const d = (i / n) * 3 * dStar
        const v = deltaG(d, S, gamma, T)
        if (v > best) [best, bestD] = [v, d]
      }
      expect(bestD / dStar).toBeCloseTo(1, 3)
      expect(best / g).toBeCloseTo(1, 6)
    }
  })

  it('gives d* ≈ 1.81 nm and ΔG* ≈ 83.6 kT at the defaults', () => {
    const s = solve(5, 0.1, 60, 298)!
    expect(s.dStar).toBeCloseTo(1.812, 2)
    expect(s.homKT).toBeCloseTo(83.6, 0)
    expect(s.hetKT).toBeCloseTo(83.6 * 0.15625, 0)
  })

  it('scales the barrier as γ³ and d* as 1/ln S', () => {
    expect(barrierHom(5, 0.2, 298)! / barrierHom(5, 0.1, 298)!).toBeCloseTo(8, 9)
    expect(criticalDiameter(25, 0.1, 298)! / criticalDiameter(5, 0.1, 298)!).toBeCloseTo(Math.log(5) / Math.log(25), 9)
  })

  it('has no stable nucleus for S ≤ 1', () => {
    expect(criticalDiameter(1, 0.1, 298)).toBeNull()
    expect(barrierHom(0.8, 0.1, 298)).toBeNull()
    expect(solve(1, 0.1, 60, 298)).toBeNull()
  })

  it('uses kT = k_B·T', () => {
    expect(solve(5, 0.1, 180, 298)!.homKT).toBeCloseTo(barrierHom(5, 0.1, 298)! / (K_B * 298), 9)
  })
})

describe('shape factor f(θ)', () => {
  it('runs from 0 (complete wetting) through 1/2 (hemisphere) to 1 (no wetting)', () => {
    expect(shapeFactor(0)).toBeCloseTo(0, 12)
    expect(shapeFactor(90)).toBeCloseTo(0.5, 12)
    expect(shapeFactor(180)).toBeCloseTo(1, 12)
    expect(shapeFactor(60)).toBeCloseTo(0.15625, 12)
  })

  it('equals the volume of the cap over the volume of the sphere', () => {
    for (const theta of [20, 60, 120, 170]) {
      const R = 1
      const h = R * (1 - Math.cos((theta * Math.PI) / 180)) // cap height
      const cap = (Math.PI * h * h * (3 * R - h)) / 3
      expect(cap / ((4 / 3) * Math.PI * R ** 3)).toBeCloseTo(shapeFactor(theta), 12)
    }
  })

  it('makes heterogeneous nucleation as hard as homogeneous at θ = 180°', () => {
    const s = solve(5, 0.1, 180, 298)!
    expect(s.hetKT).toBeCloseTo(s.homKT, 9)
    expect(s.log10Ratio).toBeCloseTo(0, 9)
  })
})
