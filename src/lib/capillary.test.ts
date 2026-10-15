import { describe, expect, it } from 'vitest'
import { capillaryPressure, jurinHeight, kelvinRatio } from './capillary'

describe('capillary pore simulator', () => {
  it('gives the Young–Laplace pressure in kPa and scales as 1/r', () => {
    expect(capillaryPressure(15, 0)).toBeCloseTo(9706.7, 1)
    expect(capillaryPressure(5, 21) / capillaryPressure(50, 21)).toBeCloseTo(10)
  })

  it('raises the column higher in smaller pores', () => {
    expect(jurinHeight(15)).toBeCloseTo(100)
    expect(jurinHeight(2)).toBeGreaterThan(jurinHeight(50))
  })

  it('keeps the Kelvin ratio between 0.05 and 1', () => {
    expect(kelvinRatio(2)).toBe(0.05)
    expect(kelvinRatio(50)).toBeCloseTo(0.3)
  })
})
