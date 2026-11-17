import { describe, expect, it } from 'vitest'
import {
  C_RANGE,
  cmc,
  conductivity,
  diffusionRel,
  GAMMA_0,
  HEADS,
  makeSystem,
  osmoticRel,
  PRESETS,
  surfaceExcess,
  surfaceTension,
  TAIL_RANGE,
  turbidityRel,
  type HeadType,
} from './surfactants'

const HEAD_TYPES: HeadType[] = ['anionic', 'cationic', 'nonionic', 'zwitterionic']

describe('CMC (internal trend model)', () => {
  it('reproduces the preset CMCs', () => {
    const byId = Object.fromEntries(PRESETS.map((p) => [p.id, cmc(p.head, p.tail) * 1e3]))
    expect(byId.sds).toBeCloseTo(8.2, 5)
    expect(byId.ctab).toBeCloseTo(0.92, 5)
    expect(byId.tween20).toBeCloseTo(0.06, 5)
    expect(byId.betaine).toBeCloseTo(1.8, 5)
  })

  it('lecture trends: a longer tail lowers the CMC; non-ionic below ionic at the same tail', () => {
    for (const h of HEAD_TYPES) expect(cmc(h, 14)).toBeLessThan(cmc(h, 12))
    for (const n of [10, 12, 14]) expect(cmc('nonionic', n)).toBeLessThan(cmc('anionic', n))
  })

  it('keeps every CMC inside the concentration axis at the tail extremes', () => {
    for (const h of HEAD_TYPES)
      for (const n of TAIL_RANGE) {
        const v = cmc(h, n)
        expect(v).toBeGreaterThan(C_RANGE[0])
        expect(v).toBeLessThan(C_RANGE[1])
      }
  })
})

describe('surface tension', () => {
  it('starts at pure water (72 mN/m), falls, and is flat and continuous above the CMC', () => {
    expect(GAMMA_0).toBe(0.072)
    for (const h of HEAD_TYPES) {
      const sys = makeSystem(h, 12)
      expect(surfaceTension(sys, 0)).toBeCloseTo(GAMMA_0, 10)
      expect(surfaceTension(sys, sys.cmc)).toBeCloseTo(HEADS[h].gammaCmc, 8)
      expect(surfaceTension(sys, sys.cmc * 10)).toBeCloseTo(HEADS[h].gammaCmc, 10)
      expect(surfaceTension(sys, sys.cmc / 10)).toBeGreaterThan(surfaceTension(sys, sys.cmc / 2))
    }
  })

  it('fills the surface below the CMC and not further above it', () => {
    const sys = makeSystem('anionic', 12)
    expect(surfaceExcess(sys, sys.cmc * 100)).toBeCloseTo(surfaceExcess(sys, sys.cmc), 12)
    expect(surfaceExcess(sys, sys.cmc)).toBeLessThan(sys.gammaMax)
  })
})

describe('other properties (qualitative)', () => {
  it('conductivity: two lines meeting at the CMC, smaller slope above; none for non-ionic', () => {
    const sys = makeSystem('anionic', 12)
    const below = (conductivity(sys, sys.cmc) - conductivity(sys, sys.cmc / 2)) / (sys.cmc / 2)
    const above = (conductivity(sys, sys.cmc * 2) - conductivity(sys, sys.cmc)) / sys.cmc
    expect(above).toBeLessThan(below)
    expect(conductivity(makeSystem('nonionic', 12), 1e-3)).toBe(0)
  })

  it('osmotic pressure rises then nearly plateaus; turbidity only above; D falls above', () => {
    const sys = makeSystem('cationic', 16)
    expect(osmoticRel(sys, sys.cmc)).toBeCloseTo(1)
    expect(osmoticRel(sys, sys.cmc * 10)).toBeLessThan(1.1)
    expect(turbidityRel(sys, sys.cmc / 2)).toBe(0)
    expect(turbidityRel(sys, sys.cmc * 3)).toBeCloseTo(2)
    expect(diffusionRel(sys, sys.cmc / 2)).toBe(1)
    expect(diffusionRel(sys, sys.cmc * 10)).toBeLessThan(0.3)
  })
})
