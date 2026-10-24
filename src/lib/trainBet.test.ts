import { describe, expect, it } from 'vitest'
import { AREA_PER_VM, betFromLine } from './adsorption'
import { makeRng } from './random'
import { DIFFICULTIES, fmt } from './training'
import { generateBet } from './trainBet'

describe('BET trainer', () => {
  for (const d of DIFFICULTIES)
    it(`gives four distinct options including the correct one (${d})`, () => {
      for (let seed = 0; seed < 300; seed++) {
        const p = generateBet(makeRng(seed), d)
        expect(p.options).toHaveLength(4)
        expect(new Set(p.options).size).toBe(4)
        const { Vm, C } = betFromLine(p.data.slope, p.data.intercept)
        const value = { Vm, C, area: Vm * AREA_PER_VM }[p.data.ask]
        expect(p.options[p.answer].startsWith(fmt(value))).toBe(true)
      }
    })

  it('keeps the data physically sensible and the fit close to the true sample', () => {
    for (let seed = 0; seed < 300; seed++) {
      const { data } = generateBet(makeRng(seed), 'hard')
      expect(data.x.every((x) => x >= 0.05 && x <= 0.35)).toBe(true)
      expect(data.V.every((v, i) => v > 0 && (i === 0 || v > data.V[i - 1]))).toBe(true)
      expect(data.slope).toBeGreaterThan(0)
      expect(data.intercept).toBeGreaterThan(0)
      const { Vm, C } = betFromLine(data.slope, data.intercept)
      expect(Vm * AREA_PER_VM).toBeGreaterThan(10)
      expect(Vm * AREA_PER_VM).toBeLessThan(1500)
      expect(Math.abs(Vm / data.trueVm - 1)).toBeLessThan(0.1)
      expect(C).toBeGreaterThan(5)
      expect(C).toBeLessThan(1000)
    }
  })

  it('reproduces the same problem from the same seed', () => {
    expect(generateBet(makeRng(9), 'medium')).toEqual(generateBet(makeRng(9), 'medium'))
  })
})
