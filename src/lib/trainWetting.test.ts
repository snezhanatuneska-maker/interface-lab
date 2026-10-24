import { describe, expect, it } from 'vitest'
import { makeRng } from './random'
import { DIFFICULTIES } from './training'
import { generateWetting } from './trainWetting'
import { favoredState, FS_RANGE, R_RANGE } from './wetting'

describe('wetting trainer', () => {
  for (const d of DIFFICULTIES)
    it(`gives four distinct options including the correct one (${d})`, () => {
      for (let seed = 0; seed < 300; seed++) {
        const p = generateWetting(makeRng(seed), d)
        expect(p.options).toHaveLength(4)
        expect(new Set(p.options).size).toBe(4)
        const { result } = p.data
        if (typeof result === 'number') {
          expect(p.options[p.answer]).toBe(`${Math.round(result)}°`)
          // Angle options are at least 8° apart, so they can be told apart.
          const angles = p.options.map((o) => parseInt(o))
          for (const a of angles) for (const b of angles) if (a !== b) expect(Math.abs(a - b)).toBeGreaterThanOrEqual(7)
        } else expect(p.options[p.answer].startsWith(result === 'cassie' ? 'Cassie' : 'Wenzel')).toBe(true)
      }
    })

  it('keeps tensions, angles, r and f_s in physical ranges', () => {
    for (const d of DIFFICULTIES)
      for (let seed = 0; seed < 300; seed++) {
        const { data } = generateWetting(makeRng(seed), d)
        if (data.gSV !== undefined) {
          expect(data.gSV).toBeGreaterThan(0)
          expect(data.gSL).toBeGreaterThan(0)
          expect(Math.abs((data.gSV - data.gSL!) / data.gLV!)).toBeLessThanOrEqual(1)
        }
        if (typeof data.result === 'number') {
          expect(data.result).toBeGreaterThan(0)
          expect(data.result).toBeLessThan(180)
        }
        if (data.thetaY !== undefined) expect(data.thetaY).toBeGreaterThan(0)
        if (data.r !== undefined) expect(data.r).toBeGreaterThanOrEqual(R_RANGE[0])
        if (data.r !== undefined) expect(data.r).toBeLessThanOrEqual(R_RANGE[1])
        if (data.fs !== undefined) expect(data.fs).toBeGreaterThanOrEqual(FS_RANGE[0])
        if (data.fs !== undefined) expect(data.fs).toBeLessThanOrEqual(FS_RANGE[1])
        if (data.ask === 'state') expect(data.result).toBe(favoredState(data.thetaY!, data.r!, data.fs!))
      }
  })
})
