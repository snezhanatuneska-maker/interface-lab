// Adsorption isotherm models. Everything is written in terms of the relative
// pressure x = P/P0 (0 ≤ x < 1) and returns the amount adsorbed V in the same
// units as Vm (here cm³(STP)/g).

/** Avogadro constant, 1/mol */
export const N_A = 6.02214076e23
/** Molar volume of an ideal gas at STP, cm³/mol */
export const MOLAR_VOLUME_STP = 22414
/** Cross-sectional area of an adsorbed N2 molecule, nm² */
export const SIGMA_N2_NM2 = 0.162

/** Langmuir (monolayer) coverage θ = V/Vm = K·x / (1 + K·x). Bounded by 1. */
export function langmuirTheta(x: number, K: number): number {
  return (K * x) / (1 + K * x)
}

/** BET (multilayer) loading V/Vm = C·x / [(1 − x)(1 − x + C·x)]. Diverges as x → 1. */
export function betLoading(x: number, C: number): number {
  return (C * x) / ((1 - x) * (1 - x + C * x))
}

/** Linearized BET ordinate: x / [V(1 − x)]. */
export function betTransform(x: number, V: number): number {
  return x / (V * (1 - x))
}

/** Exact slope and intercept of the linearized BET line for given Vm and C. */
export function betLineFromParams(Vm: number, C: number) {
  return { slope: (C - 1) / (Vm * C), intercept: 1 / (Vm * C) }
}

/** Invert the linearized BET line: Vm = 1/(slope + intercept), C = 1 + slope/intercept. */
export function betParamsFromLine(slope: number, intercept: number) {
  return { Vm: 1 / (slope + intercept), C: 1 + slope / intercept }
}

/**
 * Specific surface area from monolayer capacity.
 * S [m²/g] = Vm [cm³(STP)/g] · N_A · σ [m²] / 22414 [cm³/mol]
 */
export function specificSurfaceArea(Vm: number, sigmaNm2 = SIGMA_N2_NM2): number {
  return (Vm * N_A * sigmaNm2 * 1e-18) / MOLAR_VOLUME_STP
}

/** Ordinary least-squares straight line through (xs, ys). */
export function linearFit(xs: number[], ys: number[]) {
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let sxx = 0
  let sxy = 0
  let syy = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx
    const dy = ys[i] - my
    sxx += dx * dx
    sxy += dx * dy
    syy += dy * dy
  }
  const slope = sxy / sxx
  const intercept = my - slope * mx
  const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy)
  return { slope, intercept, r2 }
}

/**
 * BET statistics of layer stacks: fraction of surface sites carrying exactly
 * i molecules. In BET theory s1 = C·x·s0 and s_i = x^(i−1)·s1, so
 *   θ0 = (1 − x) / (1 − x + C·x),   θi = C·x^i·θ0  (i ≥ 1)
 * and Σ i·θi = V/Vm. Returns fractions for i = 0..maxLayers; the last entry
 * lumps together every stack ≥ maxLayers.
 */
export function betStackFractions(x: number, C: number, maxLayers: number): number[] {
  const s0 = 1 / (1 + (C * x) / (1 - x)) // normalized so Σ s_i = 1
  const out: number[] = [s0]
  let tail = 1 - s0
  for (let i = 1; i < maxLayers; i++) {
    const si = C * Math.pow(x, i) * s0
    out.push(si)
    tail -= si
  }
  out.push(Math.max(0, tail))
  return out
}

/** Simple seeded PRNG (mulberry32) so synthetic "measurements" are reproducible. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Standard normal sample via Box–Muller. */
export function gaussian(rand: () => number): number {
  const u = Math.max(rand(), 1e-12)
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
