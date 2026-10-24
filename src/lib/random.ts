// Seeded random numbers for the trainers, so a problem can be reproduced from its seed (and tested).

export interface Rng {
  /** Uniform in [0, 1). */
  next: () => number
  /** Uniform in [lo, hi). */
  uniform: (lo: number, hi: number) => number
  /** Log-uniform in [lo, hi), for quantities spanning decades (salt concentration, C). */
  logUniform: (lo: number, hi: number) => number
  /** Integer in [lo, hi] (both included). */
  int: (lo: number, hi: number) => number
  pick: <T>(list: readonly T[]) => T
  /** A shuffled copy. */
  shuffle: <T>(list: readonly T[]) => T[]
  /** Normally distributed, mean 0, standard deviation 1 (Box–Muller). */
  normal: () => number
}

/** Mulberry32: small, fast and good enough for practice problems. */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const uniform = (lo: number, hi: number) => lo + (hi - lo) * next()
  const rng: Rng = {
    next,
    uniform,
    logUniform: (lo, hi) => lo * (hi / lo) ** next(),
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: (list) => list[Math.floor(next() * list.length)],
    shuffle: (list) => {
      const out = [...list]
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
    normal: () => Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next()),
  }
  return rng
}

/** A fresh seed for a new problem. */
export const newSeed = () => Math.floor(Math.random() * 2 ** 32)
