import { describe, expect, it } from 'vitest'
import { attraction, barrier, ccc, HAMAKER_DEFAULT, RADIUS_DEFAULT, repulsion } from './dlvo'

const base = { z: 1, psi0: 50, a: RADIUS_DEFAULT, hamaker: HAMAKER_DEFAULT }

describe('DLVO', () => {
  it('repels and attracts with the right signs, and repulsion decays with the gap', () => {
    const p = { ...base, c0: 10 }
    expect(repulsion(1, p)).toBeGreaterThan(repulsion(5, p))
    expect(repulsion(5, p)).toBeGreaterThan(0)
    expect(attraction(1, p)).toBeLessThan(0)
  })

  it('loses its barrier as salt is added', () => {
    const b = [1, 10, 100, 1000].map((c0) => barrier({ ...base, c0 }))
    for (let i = 1; i < b.length; i++) expect(b[i]).toBeLessThanOrEqual(b[i - 1])
    expect(b[0]).toBeGreaterThan(15)
    expect(b[3]).toBe(0)
  })

  it('follows the Schulze–Hardy rule CCC ∝ 1/z⁶ at high surface potential', () => {
    const high = { ...base, psi0: 200 }
    const ratio = ccc({ ...high, z: 1 }) / ccc({ ...high, z: 2 })
    expect(ratio).toBeGreaterThan(64 * 0.8)
    expect(ratio).toBeLessThan(64 * 1.2)
  })
})
