import { describe, expect, it } from 'vitest'
import { atLevel, bankGenerator, isBank, mix, type BankQuestion } from './bank'
import { checkGenerator } from './checkGenerator'
import { makeRng } from './random'
import type { Generator } from './training'

const BANK: BankQuestion[] = [
  { question: 'Q1', correct: 'a', wrong: ['b', 'c', 'd'], explanation: 'e1' },
  { question: 'Q2', correct: 'w', wrong: ['x', 'y', 'z'], explanation: 'e2', level: 'hard' },
]

describe('question banks', () => {
  it('shuffles the options and keeps track of the correct one', () => {
    const problems = checkGenerator(bankGenerator(BANK), 100)
    for (const p of problems) {
      const q = BANK.find((b) => b.question === p.question)!
      expect(p.options[p.answer]).toBe(q.correct)
      expect(p.steps[0].text).toBe(q.explanation)
      expect(isBank(p.data)).toBe(true)
    }
  })

  it('asks harder questions only at harder levels', () => {
    expect(atLevel(BANK, 'easy').map((q) => q.question)).toEqual(['Q1'])
    expect(atLevel(BANK, 'medium').map((q) => q.question)).toEqual(['Q1'])
    expect(atLevel(BANK, 'hard').map((q) => q.question)).toEqual(['Q1', 'Q2'])
  })

  it('mixes generators in proportion to their weights', () => {
    const a: Generator<string> = () => ({ question: 'a', options: ['1', '2', '3', '4'], answer: 0, steps: [], data: 'a' })
    const b: Generator<string> = () => ({ question: 'b', options: ['1', '2', '3', '4'], answer: 0, steps: [], data: 'b' })
    const g = mix([
      [3, a],
      [1, b],
    ])
    const rng = makeRng(1)
    let countA = 0
    for (let i = 0; i < 4000; i++) if (g(rng, 'easy').data === 'a') countA++
    expect(countA / 4000).toBeGreaterThan(0.7)
    expect(countA / 4000).toBeLessThan(0.8)
  })
})
