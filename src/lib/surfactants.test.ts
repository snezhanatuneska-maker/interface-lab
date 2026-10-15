import { describe, expect, it } from 'vitest'
import {
  areaPerMolecule,
  C_RANGE,
  cmc,
  cmcNoSalt,
  conductivity,
  counterionBinding,
  diffusionRel,
  GAMMA_0,
  HEADS,
  makeSystem,
  osmoticRel,
  PRESETS,
  SALT_MAX,
  surfaceExcess,
  surfaceTension,
  TAIL_RANGE,
  turbidityRel,
  type HeadType,
} from './surfactants'

const HEAD_TYPES: HeadType[] = ['anionic', 'cationic', 'nonionic', 'zwitterionic']

describe('CMC', () => {
  it('reproduces the preset CMCs at 25 °C without salt', () => {
    const byId = Object.fromEntries(PRESETS.map((p) => [p.id, cmcNoSalt(p.head, p.tail) * 1e3]))
    expect(byId.sds).toBeCloseTo(8.2, 5)
    expect(byId.ctab).toBeCloseTo(0.92, 5)
    expect(byId.tween20).toBeCloseTo(0.06, 5)
    expect(byId.betaine).toBeCloseTo(1.8, 5)
  })

  it('Klevens: one CH₂ halves an ionic CMC and divides a non-ionic one by ~3', () => {
    expect(cmcNoSalt('anionic', 12) / cmcNoSalt('anionic', 13)).toBeCloseTo(10 ** 0.3)
    expect(cmcNoSalt('nonionic', 12) / cmcNoSalt('nonionic', 13)).toBeCloseTo(10 ** 0.5)
  })

  it('Corrin–Harkins: salt lowers the ionic CMC and solves the equation', () => {
    const c0 = cmc('anionic', 12, 0)
    const c1 = cmc('anionic', 12, 0.1)
    expect(c1).toBeLessThan(c0)
    expect(c1 * 1e3).toBeGreaterThan(1.2)
    expect(c1 * 1e3).toBeLessThan(2)
    const b = HEADS.anionic.corrinB
    expect(Math.log10(c1)).toBeCloseTo((1 + b) * Math.log10(c0) - b * Math.log10(c1 + 0.1), 8)
    // More salt, lower CMC
    expect(cmc('cationic', 16, SALT_MAX)).toBeLessThan(cmc('cationic', 16, 0.01))
  })

  it('salt does not change non-ionic or zwitterionic CMCs', () => {
    expect(cmc('nonionic', 12, 0.2)).toBe(cmcNoSalt('nonionic', 12))
    expect(cmc('zwitterionic', 12, 0.2)).toBe(cmcNoSalt('zwitterionic', 12))
  })

  it('keeps every CMC inside the concentration axis at the tail and salt extremes', () => {
    for (const h of HEAD_TYPES)
      for (const n of TAIL_RANGE)
        for (const s of [0, SALT_MAX]) {
          const v = cmc(h, n, s)
          expect(Number.isFinite(v)).toBe(true)
          expect(v).toBeGreaterThan(C_RANGE[0])
          expect(v).toBeLessThan(C_RANGE[1])
        }
  })
})

describe('surface tension', () => {
  it('starts at pure water, falls, and is flat and continuous above the CMC', () => {
    for (const h of HEAD_TYPES)
      for (const s of [0, 0.1]) {
        const sys = makeSystem(h, 12, s)
        expect(surfaceTension(sys, 0)).toBeCloseTo(GAMMA_0, 10)
        expect(surfaceTension(sys, sys.cmc)).toBeCloseTo(HEADS[h].gammaCmc, 8)
        expect(surfaceTension(sys, sys.cmc * 10)).toBeCloseTo(HEADS[h].gammaCmc, 10)
        expect(surfaceTension(sys, sys.cmc / 10)).toBeGreaterThan(surfaceTension(sys, sys.cmc / 2))
      }
  })

  it('uses n = 2 for ionic surfactants without salt, approaching 1 in excess salt', () => {
    expect(makeSystem('anionic', 12, 0).n).toBe(2)
    expect(makeSystem('anionic', 12, 0.2).n).toBeLessThan(1.02)
    expect(makeSystem('nonionic', 12, 0).n).toBe(1)
  })

  it('gives SDS a sensible area per molecule at saturation', () => {
    const a = areaPerMolecule(HEADS.anionic.gammaMax)
    expect(a).toBeGreaterThan(0.45)
    expect(a).toBeLessThan(0.6)
    const sys = makeSystem('anionic', 12, 0)
    expect(surfaceExcess(sys, sys.cmc * 100)).toBeCloseTo(surfaceExcess(sys, sys.cmc), 12)
    expect(surfaceExcess(sys, sys.cmc)).toBeLessThan(sys.gammaMax)
  })
})

describe('other properties', () => {
  it('conductivity: two lines meeting at the CMC; β from the slopes', () => {
    const sys = makeSystem('anionic', 12, 0)
    const k = conductivity(sys, sys.cmc)
    expect(k).toBeCloseTo(0.072 * 8.2, 6)
    const below = (conductivity(sys, sys.cmc) - conductivity(sys, sys.cmc / 2)) / (sys.cmc / 2)
    const above = (conductivity(sys, sys.cmc * 2) - conductivity(sys, sys.cmc)) / sys.cmc
    expect(1 - above / below).toBeCloseTo(counterionBinding('anionic')!, 6)
    expect(counterionBinding('nonionic')).toBeNull()
    expect(conductivity(makeSystem('nonionic', 12, 0), 1e-3)).toBe(0)
  })

  it('osmotic pressure rises then nearly plateaus; turbidity only above; D falls above', () => {
    const sys = makeSystem('cationic', 16, 0)
    expect(osmoticRel(sys, sys.cmc)).toBeCloseTo(1)
    expect(osmoticRel(sys, sys.cmc * 10)).toBeLessThan(1.1)
    expect(turbidityRel(sys, sys.cmc / 2)).toBe(0)
    expect(turbidityRel(sys, sys.cmc * 3)).toBeCloseTo(2)
    expect(diffusionRel(sys, sys.cmc / 2)).toBe(1)
    expect(diffusionRel(sys, sys.cmc * 10)).toBeLessThan(0.3)
  })
})
