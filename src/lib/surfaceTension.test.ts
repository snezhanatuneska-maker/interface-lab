import { describe, expect, it } from 'vitest'
import { duNouyForce, SURFACE_TENSIONS, wilhelmyForce } from './surfaceTension'

describe('surface tension', () => {
  it('Wilhelmy: F = γ · 2(width + thickness) · cos δ', () => {
    expect(wilhelmyForce(0.072, 0.02, 0.0002)).toBeCloseTo(0.072 * 0.0404, 12)
    expect(wilhelmyForce(0.072, 0.02, 0.0002, 60)).toBeCloseTo(0.072 * 0.0404 * 0.5, 12)
  })
  it('Du Noüy: two contact lines, F = γ π (d_outer + d_inner)', () => {
    expect(duNouyForce(0.072, 0.02, 0.0192)).toBeCloseTo(0.072 * Math.PI * 0.0392, 12)
  })
  it('lecture table: water 71.3 mN/m at 20 °C, ordered by γ', () => {
    expect(SURFACE_TENSIONS.find((f) => f.fluid === 'Water')!.gamma).toBe(71.3)
    const g = SURFACE_TENSIONS.map((f) => f.gamma)
    expect([...g].sort((a, b) => a - b)).toEqual(g)
  })
})
