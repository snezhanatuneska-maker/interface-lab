import { describe, expect, it } from 'vitest'
import {
  capillaryPressure,
  gammaWater,
  jurinFromEnergies,
  jurinHeight,
  kelvinGeneral,
  kelvinPoreRadius,
  kelvinRatio,
  laplaceShape,
  meniscusRadius,
  poreKelvinRatio,
} from './capillary'

describe('Young–Laplace', () => {
  it('drop 2γ/r, soap bubble 4γ/r, cylinder γ/r', () => {
    expect(laplaceShape('drop', 0.072, 1e-3)).toBeCloseTo(144)
    expect(laplaceShape('bubble', 0.072, 1e-3)).toBeCloseTo(288)
    expect(laplaceShape('cylinder', 0.072, 1e-3)).toBeCloseTo(72)
  })
})

describe('capillary pressure and Jurin', () => {
  it('p_c = 2γ cos δ / r_c and h_c = p_c/(ρ_L g)', () => {
    expect(capillaryPressure(0.072, 0, 1e-6)).toBeCloseTo(144000)
    expect(capillaryPressure(0.072, 90, 1e-6)).toBeCloseTo(0, 6)
    expect(capillaryPressure(0.072, 120, 1e-6)).toBeLessThan(0) // capillary depression
    expect(jurinHeight(0.072, 0, 1e-3)).toBeCloseTo(0.01468, 4) // ~1.5 cm in a 1 mm tube
    expect(jurinHeight(0.072, 60, 1e-3) / jurinHeight(0.072, 0, 1e-3)).toBeCloseTo(0.5)
  })
  it('Δγ_s form equals the γ_lg cos δ form (Young)', () => {
    const [gSG, gSL, gLG] = [0.05, 0.02, 0.072]
    const delta = (Math.acos((gSG - gSL) / gLG) * 180) / Math.PI
    expect(jurinFromEnergies(gSG, gSL, 1e-4)).toBeCloseTo(jurinHeight(gLG, delta, 1e-4), 9)
  })
})

describe('Kelvin', () => {
  it('uses the course water surface tension γ(T)', () => {
    expect(gammaWater(273.15) * 1e3).toBeCloseTo(76.1, 1)
    expect(gammaWater(373.15) * 1e3).toBeCloseTo(59.5, 1)
  })
  it('signed radius: convex drop p > p₀, concave meniscus p < p₀', () => {
    const T = 298.15
    const g = gammaWater(T)
    expect(kelvinRatio(g, 10e-9, T)).toBeGreaterThan(1)
    expect(kelvinRatio(g, -10e-9, T)).toBeLessThan(1)
    expect(kelvinRatio(g, 10e-9, T) * kelvinRatio(g, -10e-9, T)).toBeCloseTo(1, 12)
    expect(kelvinGeneral(g, 10e-9, 10e-9, T)).toBeCloseTo(kelvinRatio(g, 10e-9, T), 12)
  })
  it('a pore with contact angle δ has meniscus radius −r_c / cos δ', () => {
    expect(meniscusRadius(5e-9, 0)).toBeCloseTo(-5e-9, 18)
    expect(meniscusRadius(5e-9, 60)).toBeCloseTo(-10e-9, 18)
    expect(poreKelvinRatio(0.072, 5e-9, 90, 298)).toBe(1)
    expect(poreKelvinRatio(0.072, 5e-9, 120, 298)).toBeGreaterThan(1) // no condensation below saturation
  })
  it('inverts: the pore that fills at p/p₀ = 0.9', () => {
    const T = 313.15
    const rc = kelvinPoreRadius(0.9, gammaWater(T), T)
    expect(poreKelvinRatio(gammaWater(T), rc, 0, T)).toBeCloseTo(0.9, 10)
  })
})
