import { describe, expect, it } from 'vitest'
import { makeRng } from './random'

describe('seeded random numbers', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = makeRng(42)
    const b = makeRng(42)
    for (let i = 0; i < 20; i++) expect(a.next()).toBe(b.next())
    expect(makeRng(1).next()).not.toBe(makeRng(2).next())
  })

  it('stays inside the requested ranges', () => {
    const r = makeRng(7)
    for (let i = 0; i < 1000; i++) {
      const u = r.next()
      expect(u).toBeGreaterThanOrEqual(0)
      expect(u).toBeLessThan(1)
      const k = r.int(1, 4)
      expect(k).toBeGreaterThanOrEqual(1)
      expect(k).toBeLessThanOrEqual(4)
      const l = r.logUniform(0.1, 1000)
      expect(l).toBeGreaterThanOrEqual(0.1)
      expect(l).toBeLessThan(1000)
      expect(Number.isFinite(r.normal())).toBe(true)
    }
  })

  it('shuffles without losing or adding items', () => {
    const r = makeRng(3)
    expect(r.shuffle([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5])
  })
})
