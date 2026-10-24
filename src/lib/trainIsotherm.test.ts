import { describe, expect, it } from 'vitest'
import { makeRng } from './random'
import { DIFFICULTIES } from './training'
import { FAMILIES, generateIsotherm } from './trainIsotherm'

const familyOf = (label: string) =>
  /Langmuir|type I\b(?!I|V)/.test(label) ? 'I' : /BET|type II\b(?!I)/.test(label) ? 'II' : /type III/.test(label) ? 'III' : /type IV/.test(label) ? 'IV' : '?'

describe('isotherm recognition trainer', () => {
  for (const d of DIFFICULTIES)
    it(`offers one option per family, the right one marked correct (${d})`, () => {
      for (let seed = 0; seed < 300; seed++) {
        const p = generateIsotherm(makeRng(seed), d)
        expect(new Set(p.options).size).toBe(4)
        expect(p.options.map(familyOf).sort()).toEqual([...FAMILIES].sort())
        expect(familyOf(p.options[p.answer])).toBe(p.data.family)
      }
    })

  it('draws non-negative, rising adsorption branches with a hysteresis loop only for type IV', () => {
    for (let seed = 0; seed < 300; seed++) {
      const { data } = generateIsotherm(makeRng(seed), 'hard')
      expect(data.ads.every((v, i) => v >= 0 && Number.isFinite(v) && (i === 0 || v >= data.ads[i - 1]))).toBe(true)
      expect(Math.max(...data.ads)).toBeLessThanOrEqual(6)
      expect(data.x).toHaveLength(data.ads.length)
      expect(data.x.length).toBeGreaterThan(20)
      if (data.family === 'IV') {
        expect(data.des!.every((v, i) => v >= data.ads[i] - 1e-9)).toBe(true)
      } else expect(data.des).toBeUndefined()
    }
  })
})
