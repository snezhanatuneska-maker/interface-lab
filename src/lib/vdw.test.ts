import { describe, expect, it } from 'vitest'
import { C_UNIT, coefficients, dominant, K_B, MOLECULES, phi, shares, thermalDistance } from './vdw'

const mol = (id: string) => MOLECULES.find((m) => m.id === id)!

describe('van der Waals coefficients', () => {
  it('reproduces the H₂O values at 293 K (×10⁻⁷⁹ J·m⁶)', () => {
    const w = mol('H2O')
    const c = coefficients(w.mu, w.alpha, w.I, 293)
    expect(c.keesom / C_UNIT).toBeCloseTo(96, -0.5)
    expect(c.debye / C_UNIT).toBeCloseTo(10, -0.5)
    expect(c.london / C_UNIT).toBeCloseTo(33, -0.5)
    expect(dominant(c)).toBe('keesom')
    expect(Math.round(shares(c).keesom)).toBe(69)
  })

  it('gives only London for nonpolar molecules', () => {
    for (const id of ['Ar', 'H2', 'CH4']) {
      const m = mol(id)
      const c = coefficients(m.mu, m.alpha, m.I, 293)
      expect(c.keesom).toBe(0)
      expect(c.debye).toBe(0)
      expect(c.london).toBeGreaterThan(0)
      expect(shares(c).london).toBeCloseTo(100)
    }
  })

  it('makes London the largest term for HCl', () => {
    const m = mol('HCl')
    expect(dominant(coefficients(m.mu, m.alpha, m.I, 293))).toBe('london')
  })

  it('scales Keesom as 1/T and leaves Debye and London unchanged', () => {
    const a = coefficients(1.5, 2, 12, 200)
    const b = coefficients(1.5, 2, 12, 400)
    expect(a.keesom / b.keesom).toBeCloseTo(2)
    expect(a.debye).toBe(b.debye)
    expect(a.london).toBe(b.london)
  })

  it('scales φ as −1/r⁶ and finds where |φ| = kT', () => {
    const C = 100 * C_UNIT
    expect(phi(C, 0.5) / phi(C, 1)).toBeCloseTo(64)
    expect(phi(C, 0.3)).toBeLessThan(0)
    const r = thermalDistance(C, 293)
    expect(-phi(C, r)).toBeCloseTo(K_B * 293, 25)
  })
})
