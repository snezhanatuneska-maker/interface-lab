import { describe, expect, it } from 'vitest'
import { debyeLength, ionRatios, potentialAt, psiOhp, solve, sternCapacitance, toMicroFcm2 } from './edl'

describe('Debye length', () => {
  it('matches 0.304/√I nm for a 1:1 electrolyte at 298 K', () => {
    expect(debyeLength(10, 1)).toBeCloseTo(3.04, 2)
    expect(debyeLength(100, 1)).toBeCloseTo(0.96, 2)
  })

  it('shrinks with valency as 1/z (I ∝ z²)', () => {
    expect(debyeLength(10, 2)).toBeCloseTo(debyeLength(10, 1) / 2, 6)
  })
})

describe('Stern layer', () => {
  it('keeps ψd below ψ₀ and charge balanced', () => {
    for (const c0 of [0.1, 10, 1000])
      for (const z of [1, 2, 3])
        for (const psi0 of [10, 75, 200]) {
          const s = solve('gcs', psi0, c0, z, 0.5)
          expect(s.psiD).toBeGreaterThan(0)
          expect(s.psiD).toBeLessThan(psi0)
          const sternSigma = (sternCapacitance(0.5) * (psi0 - s.psiD)) / 1e3
          expect(sternSigma).toBeCloseTo(s.sigma, 6)
        }
  })

  it('tends to ψ₀ as δ → 0', () => {
    expect(psiOhp('gcs', 75, 10, 1, 1e-4)).toBeCloseTo(75, 0)
  })

  it('caps the total capacitance below C_Stern while GC grows without bound', () => {
    const gc = solve('gc', 200, 10, 1, 0.5)
    const gcs = solve('gcs', 200, 10, 1, 0.5)
    expect(toMicroFcm2(gc.cTotal)).toBeGreaterThan(500)
    expect(gcs.cTotal).toBeLessThan(sternCapacitance(0.5))
  })
})

describe('profiles', () => {
  it('starts at ψ₀ and decays to zero with bulk ion concentrations far away', () => {
    const s = solve('gcs', 75, 10, 1, 0.5)
    expect(potentialAt(0, 'gcs', 75, s.psiD, 10, 1, 0.5)).toBeCloseTo(75, 6)
    expect(potentialAt(0.5, 'gcs', 75, s.psiD, 10, 1, 0.5)).toBeCloseTo(s.psiD, 6)
    const far = potentialAt(60, 'gcs', 75, s.psiD, 10, 1, 0.5)
    expect(Math.abs(far)).toBeLessThan(1e-3)
    expect(ionRatios(far, 1).anion).toBeCloseTo(1, 4)
    expect(ionRatios(far, 1).cation).toBeCloseTo(1, 4)
  })

  it('reduces to ψ₀·exp(−κx) at low potential', () => {
    const k = debyeLength(10, 1)
    expect(potentialAt(k, 'gc', 1, 1, 10, 1, 0.5)).toBeCloseTo(Math.exp(-1), 3)
  })
})
