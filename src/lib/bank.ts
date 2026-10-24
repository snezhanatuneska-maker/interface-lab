import type { Rng } from './random'
import { DIFFICULTIES, labelled, type Difficulty, type Generator } from './training'

// Concept questions for the trainers: fixed multiple-choice questions (the ones that used to sit in each page's
// "Try this" or quiz section), drawn at random and with their options shuffled. Banks live in src/data/practice/.

export interface BankQuestion {
  question: string
  correct: string
  /** Three wrong options. */
  wrong: [string, string, string]
  /** Shown as the worked solution. */
  explanation: string
  /** Lowest difficulty that asks it (default 'easy'): harder levels also ask the easier questions. */
  level?: Difficulty
}

export interface BankData {
  kind: 'bank'
}

const rank = (d: Difficulty) => DIFFICULTIES.indexOf(d)

/** Questions asked at this difficulty. */
export const atLevel = (bank: BankQuestion[], d: Difficulty) => bank.filter((q) => rank(q.level ?? 'easy') <= rank(d))

export function bankGenerator(bank: BankQuestion[]): Generator<BankData> {
  return (rng: Rng, difficulty: Difficulty) => {
    const pool = atLevel(bank, difficulty)
    const q = rng.pick(pool.length > 0 ? pool : bank)
    const { options, answer } = labelled(rng, [q.correct, ...q.wrong], 0)
    return { question: q.question, options, answer, steps: [{ text: q.explanation }], data: { kind: 'bank' } }
  }
}

/** Picks one of several generators at random, in proportion to its weight. */
export function mix<D>(parts: [number, Generator<D>][]): Generator<D> {
  const total = parts.reduce((a, [w]) => a + w, 0)
  return (rng, difficulty) => {
    let u = rng.next() * total
    for (const [w, g] of parts) {
      if (u < w) return g(rng, difficulty)
      u -= w
    }
    return parts[parts.length - 1][1](rng, difficulty)
  }
}

export const isBank = (data: unknown): data is BankData =>
  typeof data === 'object' && data !== null && (data as { kind?: string }).kind === 'bank'
