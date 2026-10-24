import { describe, expect, it } from 'vitest'
import { makeRng } from './random'
import { fmt, fmtTex, labelled, numericOptions } from './training'

describe('number formatting', () => {
  it('keeps three significant figures and switches to powers of ten for very small or large numbers', () => {
    expect(fmt(245.37)).toBe('245')
    expect(fmt(0.041234)).toBe('0.0412')
    expect(fmt(3.1e-5, 2)).toBe('3.1 × 10⁻⁵')
    expect(fmt(2.5e6)).toBe('2.5 × 10⁶')
    expect(fmtTex(3.1e-5, 2)).toBe('3.1 \\times 10^{-5}')
  })
})

describe('answer options', () => {
  it('always gives four distinct options with the correct one among them', () => {
    for (let seed = 0; seed < 200; seed++) {
      const rng = makeRng(seed)
      const correct = rng.uniform(1, 100)
      // The mistakes deliberately include a duplicate and a value too close to the answer.
      const { options, answer } = numericOptions(rng, correct, [correct, correct * 1.01, correct * 3], { format: (v) => fmt(v) })
      expect(options).toHaveLength(4)
      expect(new Set(options).size).toBe(4)
      expect(options[answer]).toBe(fmt(correct))
    }
  })

  it('tracks the correct label through the shuffle', () => {
    for (let seed = 0; seed < 50; seed++) {
      const { options, answer } = labelled(makeRng(seed), ['a', 'b', 'c', 'd'], 2)
      expect(options[answer]).toBe('c')
    }
  })
})
