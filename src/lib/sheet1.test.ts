import { describe, expect, it } from 'vitest'
import { makeRng } from './random'
import {
  EX11, EX12, EX13, EX14, OFFICIAL_12, gammaLGMix, parts11, parts12, parts13, parts14,
  randomize11, randomize12, randomize13, randomize14, solve11, solve12, solve13, solve14, withinTolerance,
} from './sheet1'

// Every official answer of Exercise Sheet 1, recomputed from the given data with the site's own functions.

const within = (v: number, official: number, rel = 0.03) => expect(Math.abs(v - official)).toBeLessThanOrEqual(rel * Math.abs(official))

describe('Exercise 1.1 (Wilhelmy plate, Du Noüy ring)', () => {
  it('(a) γ = 20.4 mN/m and (b) Δm = 0.127 g', () => {
    const s = solve11(EX11)
    within(s.gamma * 1e3, 20.4, 0.005)
    within(s.dm * 1e3, 0.127, 0.005)
    expect(s.inner * 1e3).toBeCloseTo(9.4, 9)
    expect(s.check).toBeCloseTo(s.F, 12) // Wilhelmy with the found γ gives back the measured force
  })
})

describe('Exercise 1.2 (Young: γ_sl = γ_sg − γ_lg cos δ)', () => {
  it('γ_lg(0) = 70.7 mN/m, and the f = 0 check values 40.5 and 27.4 mN/m', () => {
    expect(gammaLGMix(0)).toBeCloseTo(70.7, 1)
    const s = solve12(EX12)
    expect(s.bare[0]).toBeCloseTo(40.5, 0)
    expect(s.sil[0]).toBeCloseTo(27.4, 0)
  })
  it('(b) every γ_sl within ±2 mN/m of the answer sheet', () => {
    const s = solve12(EX12)
    s.bare.forEach((v, i) => expect(Math.abs(v - OFFICIAL_12.bare[i])).toBeLessThanOrEqual(2))
    s.sil.forEach((v, i) => expect(Math.abs(v - OFFICIAL_12.sil[i])).toBeLessThanOrEqual(2))
  })
  it('trends: γ_sl rises on bare glass and falls to ~0 on silanized glass', () => {
    const s = solve12(EX12)
    expect(s.bare[6]).toBeGreaterThan(s.bare[0] + 15)
    expect(s.sil[6]).toBeLessThan(3)
  })
})

describe('Exercise 1.3 (capillary pressure diagram)', () => {
  const s = solve13(EX13)
  it('(a) p_c = 4.32, 2.88, 1.44 bar and h = 44.0, 29.4, 14.7 m', () => {
    ;[4.32, 2.88, 1.44].forEach((v, k) => within(s.pc[k] / 1e5, v, 0.002))
    ;[44.0, 29.4, 14.7].forEach((v, k) => within(s.h[k], v, 0.005))
  })
  it('(b) drainage 1, 0.74, 0.61, 0 and imbibition 1, 0.38, 0.058, 0', () => {
    const dr = s.plain.drainage.map((p) => p.S)
    const im = s.plain.imbibition.map((p) => p.S)
    ;[1, 0.74, 0.61, 0].forEach((v, k) => expect(Math.abs(dr[k] - v)).toBeLessThan(0.005))
    ;[1, 0.38, 0.058, 0].forEach((v, k) => expect(Math.abs(im[k] - v)).toBeLessThan(0.005))
    im.forEach((v, k) => expect(v).toBeLessThanOrEqual(dr[k])) // hysteresis
  })
  it('(c) h_c = 14.7 mm for a 1 mm radius, comparable to the 30 mm pore system', () => {
    within(s.hWide * 1e3, 14.7, 0.005)
  })
  it('(d) with interconnections: drainage 1, 0.74, 0.15, 0.09', () => {
    const dr = s.linked.drainage.map((p) => p.S)
    ;[1, 0.74, 0.15, 0.09].forEach((v, k) => expect(Math.abs(dr[k] - v)).toBeLessThan(0.005))
  })
  it('subunit volumes ∝ r²: column totals 1.361, 1.361, 0.472, 0.611; total 3.806', () => {
    const cols = [[2, 1, 0], [0, 1, 2], [0, 1, 0], [1, 0, 1]].map((c) => c.reduce((a, t) => a + s.vol[t], 0))
    ;[1.361, 1.361, 0.472, 0.611].forEach((v, k) => expect(cols[k]).toBeCloseTo(v, 3))
    expect(cols.reduce((a, b) => a + b)).toBeCloseTo(3.806, 3)
  })
})

describe('Exercise 1.4 (Kelvin humidity sensor)', () => {
  const s = solve14(EX14)
  it('(b) d ≈ 18 nm, set by 40 °C (18.2 nm); 24.3 nm at −10 °C', () => {
    within(s.d[1] * 1e9, 18.2, 0.005)
    within(s.d[0] * 1e9, 24.3, 0.005)
    expect(s.dLargest).toBe(s.d[1])
  })
  it('(c) RH_min ≈ 46 %: 36 % at −10 °C and 46 % at 40 °C', () => {
    within(s.rh[0] * 100, 36, 0.02)
    within(s.rh[1] * 100, 46, 0.02)
    expect(s.rhMin).toBe(s.rh[1])
  })
})

describe('exercise parts', () => {
  const all = [
    [parts11, EX11, randomize11],
    [parts12, EX12, randomize12],
    [parts13, EX13, randomize13],
    [parts14, EX14, randomize14],
  ] as const
  it('original numbers: every field accepts its own value and the printed official answer', () => {
    for (const [parts, ex] of all)
      for (const p of (parts as (e: unknown, o: boolean) => ReturnType<typeof parts11>)(ex, true))
        for (const f of p.fields ?? []) {
          expect(withinTolerance(f.value, f)).toBe(true)
          expect(f.official, `${p.id} ${f.label}`).toBeDefined()
          const printed = Number(f.official!.replace(/[^0-9.]/g, ' ').trim().split(/\s+/)[0])
          expect(withinTolerance(printed, f), `${p.id} ${f.label}: ${f.official} vs ${f.value}`).toBe(true)
        }
  })
  it('new numbers: finite answers, inline TeX in pairs, a solution for every numeric part', () => {
    for (const [parts, , randomize] of all)
      for (let seed = 0; seed < 40; seed++) {
        const ex = (randomize as (r: ReturnType<typeof makeRng>) => unknown)(makeRng(seed))
        for (const p of (parts as (e: unknown, o: boolean) => ReturnType<typeof parts11>)(ex, false)) {
          for (const f of p.fields ?? []) expect(Number.isFinite(f.value)).toBe(true)
          if (p.fields) expect(p.steps!.length).toBeGreaterThan(0)
          for (const t of [p.prompt, p.answer, ...(p.steps ?? []).map((x) => x.text)]) {
            expect((t.match(/\$/g) ?? []).length % 2, t).toBe(0)
            expect(t).not.toMatch(/NaN|undefined|Infinity/)
          }
        }
      }
  })
})
