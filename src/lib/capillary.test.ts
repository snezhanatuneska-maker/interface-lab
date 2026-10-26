import { describe, expect, it } from 'vitest'
import { capillaryPressure, jurinHeight, kelvinRatio } from './capillary'

describe('capillary pore simulator', () => {
  it('gives the Young–Laplace pressure in kPa and scales as 1/r', () => {
    expect(capillaryPressure(15, 0)).toBeCloseTo(9600, 0)
    expect(capillaryPressure(5, 21) / capillaryPressure(50, 21)).toBeCloseTo(10)
    expect(capillaryPressure(15, 120)).toBeLessThan(0)
  })

  it('follows Jurin: about 1.5 cm in a 1 mm tube, ∝ cos θ / r', () => {
    expect(jurinHeight(1e6, 0)).toBeCloseTo(0.0147, 4)
    expect(jurinHeight(2, 0) / jurinHeight(50, 0)).toBeCloseTo(25)
    expect(jurinHeight(15, 60) / jurinHeight(15, 0)).toBeCloseTo(0.5)
    expect(jurinHeight(15, 120)).toBeLessThan(0)
  })

  it('gives the Kelvin ratio of water at 25 °C', () => {
    expect(kelvinRatio(2, 0)).toBeCloseTo(0.590, 2)
    expect(kelvinRatio(15, 21)).toBeCloseTo(0.937, 2)
    expect(kelvinRatio(50, 0)).toBeCloseTo(0.979, 2)
    expect(kelvinRatio(15, 120)).toBeGreaterThan(1)
  })
})
