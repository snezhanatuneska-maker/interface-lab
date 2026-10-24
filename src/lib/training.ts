import type { Rng } from './random'

// Shared pieces of the trainers (#/training/...): problem shape, answer options and number formatting.
// Text in questions, options and steps may hold inline TeX between $…$ (drawn by RichText.tsx).

export type Difficulty = 'easy' | 'medium' | 'hard'
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

/** One line of the worked solution: a sentence, optionally followed by a display equation. */
export interface Step {
  text: string
  tex?: string
}

export interface Problem<D = unknown> {
  question: string
  /** Exactly four distinct options. */
  options: string[]
  /** Index of the correct option. */
  answer: number
  steps: Step[]
  /** What the trainer draws above the question (table, plot); trainer-specific. */
  data: D
}

export type Generator<D> = (rng: Rng, difficulty: Difficulty) => Problem<D>

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

/** Number to `sig` significant figures, as plain text: 245, 0.0412, 3.1 × 10⁻⁵. */
export function fmt(x: number, sig = 3): string {
  if (x === 0) return '0'
  const a = Math.abs(x)
  if (a >= 1e5 || a < 1e-3) {
    const [m, e] = x.toExponential(sig - 1).split('e')
    return `${Number(m)} × 10${String(Number(e)).replace(/./g, (c) => SUPERSCRIPT[c])}`
  }
  return String(Number(x.toPrecision(sig)))
}

/** Same as fmt, but as TeX (for $…$ and display equations). */
export function fmtTex(x: number, sig = 3): string {
  if (x === 0) return '0'
  const a = Math.abs(x)
  if (a >= 1e5 || a < 1e-3) {
    const [m, e] = x.toExponential(sig - 1).split('e')
    return `${Number(m)} \\times 10^{${Number(e)}}`
  }
  return String(Number(x.toPrecision(sig)))
}

/** Rounds to `sig` significant figures (so the shown value and the computed one agree). */
export const round = (x: number, sig = 3) => Number(x.toPrecision(sig))

interface NumericOptions {
  /** Formats a value as an option label. */
  format: (v: number) => string
  /** Whether two values are far enough apart to be told apart (default: 15% relative difference). */
  apart?: (a: number, b: number) => boolean
  /** Values an option may take (default: positive and finite). */
  valid?: (v: number) => boolean
  /** Fallback distractors when the typical mistakes collide; default: multiples of the correct value. */
  fallback?: (correct: number, rng: Rng) => number[]
}

const relApart = (a: number, b: number) => Math.abs(a - b) > 0.15 * Math.max(Math.abs(a), Math.abs(b))

/**
 * Four options for a numeric answer: the correct value plus distractors from the typical mistakes, in order of
 * preference. A mistake is skipped when it is invalid or too close to an option already taken (e.g. "forgot the +1"
 * when C is large); fallback values fill any gap. Returned shuffled.
 */
export function numericOptions(
  rng: Rng,
  correct: number,
  mistakes: number[],
  { format, apart = relApart, valid = (v) => Number.isFinite(v) && v > 0, fallback }: NumericOptions,
): { options: string[]; answer: number } {
  const chosen = [correct]
  const take = (v: number) => {
    if (chosen.length >= 4 || !valid(v)) return
    if (chosen.some((c) => !apart(c, v) || format(c) === format(v))) return
    chosen.push(v)
  }
  mistakes.forEach(take)
  const extra = fallback ? fallback(correct, rng) : rng.shuffle([0.5, 2, 0.25, 4, 1.5, 0.67, 3, 0.33, 10, 0.1]).map((f) => correct * f)
  extra.forEach(take)
  if (chosen.length < 4) throw new Error('numericOptions: could not find four distinct options')
  return labelled(rng, chosen.map(format), 0)
}

/** Shuffles labelled options and tracks where the correct one (index `answer` before shuffling) ends up. */
export function labelled(rng: Rng, labels: string[], answer: number): { options: string[]; answer: number } {
  const order = rng.shuffle(labels.map((_, i) => i))
  return { options: order.map((i) => labels[i]), answer: order.indexOf(answer) }
}
