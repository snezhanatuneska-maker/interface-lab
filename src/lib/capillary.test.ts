import { describe, expect, it } from 'vitest'
import { capillaryPressure, jurinHeight, KELVIN_LENGTH, kelvinEmpty, kelvinFill, LIQUIDS } from './capillary'

describe('Young–Laplace', () => {
  it('gives 2γ/r for a fully wetting liquid and scales as 1/r', () => {
    expect(capillaryPressure(10, 0)).toBeCloseTo(14.4, 6) // MPa
    expect(capillaryPressure(1, 0) / capillaryPressure(100, 0)).toBeCloseTo(100)
  })

  it('is zero at 90° and changes sign for a non-wetting liquid', () => {
    expect(Math.abs(capillaryPressure(10, 90))).toBeLessThan(1e-9)
    expect(capillaryPressure(10, 140)).toBeLessThan(0)
  })
})

describe('mercury', () => {
  it('needs about 1 MPa to enter a 0.6 µm pore at 140° (Washburn)', () => {
    expect(capillaryPressure(600, 140, LIQUIDS.mercury)).toBeCloseTo(-1.24, 2)
    expect(jurinHeight(1000, 140, LIQUIDS.mercury)).toBeLessThan(0)
  })
})

describe('Jurin', () => {
  it('lifts water about 15 m in a 1 µm pore', () => {
    expect(jurinHeight(1000, 0)).toBeCloseTo(14.7, 1)
  })
})

describe('Kelvin', () => {
  it('has a Kelvin length of about 0.52 nm for water', () => {
    expect(KELVIN_LENGTH).toBeCloseTo(0.525, 2)
  })

  it('empties at a lower pressure than it fills (hysteresis) and approaches p₀ in wide pores', () => {
    for (const r of [2, 5, 20]) expect(kelvinEmpty(r, 0)).toBeLessThan(kelvinFill(r, 0))
    expect(kelvinEmpty(3, 0)).toBeCloseTo(kelvinFill(3, 0) ** 2)
    expect(kelvinFill(1000, 0)).toBeGreaterThan(0.999)
  })

  it('does not condense below p₀ for a non-wetting wall', () => {
    expect(kelvinFill(5, 120)).toBeGreaterThan(1)
  })
})
