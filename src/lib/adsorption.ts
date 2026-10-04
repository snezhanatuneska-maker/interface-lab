// Adsorption isotherm models. Everything is written in terms of the relative
// pressure x = P/P0 (0 ≤ x < 1) and returns a dimensionless loading:
// θ for Langmuir, n/nm for BET.

export type Model = 'langmuir' | 'bet'

/** Langmuir (monolayer) coverage θ = K·x / (1 + K·x). Bounded by 1. */
export function langmuirTheta(x: number, K: number): number {
  return (K * x) / (1 + K * x)
}

/** BET (multilayer) loading n/nm = c·x / [(1 − x)(1 − x + c·x)]. Diverges as x → 1. */
export function betLoading(x: number, c: number): number {
  return (c * x) / ((1 - x) * (1 - x + c * x))
}

/** Loading (θ or n/nm) of the given model. */
export function loading(model: Model, x: number, K: number, c: number): number {
  return model === 'langmuir' ? langmuirTheta(x, K) : betLoading(x, c)
}

/**
 * BET statistics of layer stacks: fraction of surface sites carrying exactly
 * i molecules. In BET theory s1 = c·x·s0 and s_i = x^(i−1)·s1, so
 *   θ0 = (1 − x) / (1 − x + c·x),   θi = c·x^i·θ0  (i ≥ 1)
 * and Σ i·θi = n/nm. Returns fractions for i = 0..maxLayers; the last entry
 * lumps together every stack ≥ maxLayers.
 */
export function betStackFractions(x: number, c: number, maxLayers: number): number[] {
  const s0 = 1 / (1 + (c * x) / (1 - x)) // normalized so Σ s_i = 1
  const out: number[] = [s0]
  let tail = 1 - s0
  for (let i = 1; i < maxLayers; i++) {
    const si = c * Math.pow(x, i) * s0
    out.push(si)
    tail -= si
  }
  out.push(Math.max(0, tail))
  return out
}

/** Round fractions·n to integers that sum to n (largest-remainder method). */
function apportion(fractions: number[], n: number): number[] {
  const raw = fractions.map((f) => f * n)
  const counts = raw.map(Math.floor)
  let left = n - counts.reduce((a, b) => a + b, 0)
  const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0])
  for (let k = 0; left > 0; k++, left--) counts[order[k % order.length][1]]++
  return counts
}

/**
 * Number of molecules stacked on each of `siteOrder.length` sites, so that the
 * total equals round(N · loading). Langmuir never stacks (0 or 1 per site);
 * BET follows the stack statistics above. `siteOrder` is a fixed scrambled
 * order in which sites get occupied, so molecules stay put as P changes.
 */
export function siteStackHeights(model: Model, x: number, K: number, c: number, siteOrder: number[]): number[] {
  const n = siteOrder.length
  const heights = new Array<number>(n).fill(0)

  if (model === 'langmuir') {
    const filled = Math.round(langmuirTheta(x, K) * n)
    for (let k = 0; k < filled; k++) heights[siteOrder[k]] = 1
    return heights
  }

  const target = Math.round(betLoading(x, c) * n)
  const counts = apportion(betStackFractions(x, c, 400), n)
  const sorted: number[] = []
  for (let i = counts.length - 1; i >= 0; i--) for (let k = 0; k < counts[i]; k++) sorted.push(i)

  // Nudge so the total matches round(N · n/nm) exactly.
  let diff = target - sorted.reduce((a, b) => a + b, 0)
  for (let k = 0; diff !== 0 && k < 10000; k++) {
    const j = k % n
    if (diff > 0) {
      sorted[j]++
      diff--
    } else if (sorted[j] > 0) {
      sorted[j]--
      diff++
    }
  }
  sorted.sort((a, b) => b - a)
  sorted.forEach((h, k) => (heights[siteOrder[k]] = h))
  return heights
}
