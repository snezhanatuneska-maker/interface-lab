import { expect } from 'vitest'
import { makeRng } from './random'
import { DIFFICULTIES, type Generator, type Problem } from './training'

// Test helper for the trainer tests: runs a generator over many seeds at every difficulty and checks the rules
// every problem must follow. Returns the problems so a test can check its own physics on top.

export function checkGenerator<D>(generate: Generator<D>, seeds = 200): Problem<D>[] {
  const all: Problem<D>[] = []
  for (const d of DIFFICULTIES)
    for (let seed = 0; seed < seeds; seed++) {
      const p = generate(makeRng(seed), d)
      expect(p.options).toHaveLength(4)
      expect(new Set(p.options).size).toBe(4)
      expect(p.answer).toBeGreaterThanOrEqual(0)
      expect(p.answer).toBeLessThan(4)
      expect(p.question.length).toBeGreaterThan(0)
      expect(p.steps.length).toBeGreaterThan(0)
      expect(p.options.every((o) => !/NaN|Infinity|undefined/.test(o))).toBe(true)
      all.push(p)
    }
  // Same seed, same problem.
  expect(generate(makeRng(123), 'medium')).toEqual(generate(makeRng(123), 'medium'))
  return all
}
