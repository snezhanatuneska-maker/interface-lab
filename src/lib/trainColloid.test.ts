import { describe, expect, it } from 'vitest'
import { debyeLength } from './edl'
import { makeRng } from './random'
import { DIFFICULTIES, fmt } from './training'
import { generateColloid } from './trainColloid'

describe('colloid stability trainer', () => {
  for (const d of DIFFICULTIES)
    it(`gives four distinct options including the correct one (${d})`, () => {
      for (let seed = 0; seed < 200; seed++) {
        const p = generateColloid(makeRng(seed), d)
        expect(p.options).toHaveLength(4)
        expect(new Set(p.options).size).toBe(4)
        const right = p.options[p.answer]
        if (p.data.ask === 'debye') expect(right).toBe(`${fmt(debyeLength(p.data.c0!, p.data.z!))} nm`)
        if (p.data.ask === 'ccc') {
          const { z1, c1, z2 } = p.data.ccc!
          expect(right).toBe(`${fmt(c1 * (z1 / z2) ** 6, 2)} mM`)
        }
        if (p.data.ask === 'dlvo') expect(right.startsWith(p.data.dlvo!.stable ? 'Stable: the energy barrier' : 'Coagulating: the barrier')).toBe(true)
      }
    })

  it('keeps salt, valency, Debye length and barriers in physical ranges', () => {
    for (const d of DIFFICULTIES)
      for (let seed = 0; seed < 200; seed++) {
        const { data } = generateColloid(makeRng(seed), d)
        if (data.c0 !== undefined) {
          expect(data.c0).toBeGreaterThanOrEqual(1)
          expect(data.c0).toBeLessThanOrEqual(200)
          expect([1, 2, 3]).toContain(data.z)
          expect(data.debye).toBeGreaterThan(0.1)
          expect(data.debye).toBeLessThan(15)
        }
        if (data.ccc) {
          expect(data.ccc.z2).toBeGreaterThan(data.ccc.z1)
          expect(data.ccc.c2).toBeLessThan(data.ccc.c1)
          expect(data.ccc.c2).toBeGreaterThan(0)
        }
        if (data.dlvo) {
          expect(data.dlvo.V.every(Number.isFinite)).toBe(true)
          expect(data.dlvo.barrier).toBeGreaterThanOrEqual(0)
          if (d === 'hard') expect(data.dlvo.barrier).toBeGreaterThan(0)
        }
      }
  })
})
