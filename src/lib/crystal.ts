// Crystal growth & shape tool.
//
// Facet model (surface-reaction control): a 2D crystal is the intersection of half-planes from two face
// families, {10} with normals (±1, 0), (0, ±1) and {11} with normals (±1, ±1)/√2. Face i sits at distance
// h_i from the centre and moves outward at its own rate g_i. With a = h{10} and d = √2·h{11}, the crystal is
// the square |x|, |y| ≤ a cut by the diamond |x| + |y| ≤ d:
//   d ≥ 2a → square ({11} faces gone), d ≤ a → diamond ({10} faces gone), otherwise an octagon.
// The same geometry with h ∝ γ is the Wulff (equilibrium) shape.

export type Family = '10' | '11'

export const RATIO_RANGE: [number, number] = [0.3, 3] // g{11}/g{10}
export const RATIO_DEFAULT = 1
export const GAMMA_RATIO_RANGE: [number, number] = [0.5, 1.6] // γ{11}/γ{10}
export const GAMMA_RATIO_DEFAULT = 1.1
export const CAP_FACTOR = 0.4 // a capping agent multiplies the growth rate of the face it adsorbs on by this

export interface FacetShape {
  /** Length of one {10} face (0 if the family has grown out). */
  len10: number
  /** Length of one {11} face. */
  len11: number
  name: 'square' | 'diamond' | 'octagon'
  area: number
}

/** Shape from the face distances h{10} and h{11}. Faces shorter than `tol` of the perimeter count as gone. */
export function facetShape(h10: number, h11: number, tol = 0.01): FacetShape {
  const a = h10
  const d = Math.SQRT2 * h11
  let len10: number
  let len11: number
  let area: number
  if (d >= 2 * a) {
    len10 = 2 * a
    len11 = 0
    area = 4 * a * a
  } else if (d <= a) {
    len10 = 0
    len11 = Math.SQRT2 * d
    area = 2 * d * d
  } else {
    len10 = 2 * (d - a)
    len11 = Math.SQRT2 * (2 * a - d)
    area = 4 * a * a - 2 * (2 * a - d) ** 2
  }
  const perim = 4 * (len10 + len11)
  if (len11 < tol * perim) len11 = 0
  if (len10 < tol * perim) len10 = 0
  const name = len11 === 0 ? 'square' : len10 === 0 ? 'diamond' : 'octagon'
  return { len10, len11, name, area }
}

/** Vertices of the crystal (counter-clockwise), for drawing. */
export function facetPolygon(h10: number, h11: number): [number, number][] {
  const a = h10
  const d = Math.SQRT2 * h11
  if (d >= 2 * a) return [[a, -a], [a, a], [-a, a], [-a, -a]]
  if (d <= a) return [[d, 0], [0, d], [-d, 0], [0, -d]]
  const e = d - a
  return [
    [a, -e], [a, e], [e, a], [-e, a],
    [-a, e], [-a, -e], [-e, -a], [e, -a],
  ]
}

/**
 * Which families survive as the crystal keeps growing at constant rates (the long-time habit).
 * {11} survives only if √2·g{11} < 2·g{10}, {10} only if √2·g{11} > g{10}.
 */
export function survivingFamilies(ratio: number): Family[] {
  const out: Family[] = []
  if (ratio * Math.SQRT2 > 1) out.push('10')
  if (ratio < Math.SQRT2) out.push('11')
  return out
}

/** Effective g{11}/g{10} with an optional capping agent on one family. */
export function effectiveRatio(ratio: number, cap: Family | null): number {
  if (cap === '11') return ratio * CAP_FACTOR
  if (cap === '10') return ratio / CAP_FACTOR
  return ratio
}

/**
 * Wulff shape scaled to a given area: face distances h ∝ γ.
 * Returns [h10, h11].
 */
export function wulffDistances(gammaRatio: number, area: number): [number, number] {
  const unit = facetShape(1, gammaRatio, 0).area
  const k = Math.sqrt(area / unit)
  return [k, k * gammaRatio]
}

// ---------- Growth regimes ----------

export const S_RANGE: [number, number] = [1, 5]
export const S_DEFAULT = 1.5
const SIGMA_1 = 2 // BCF crossover from parabolic to linear, in σ = S − 1
const K_DIFF = 0.5 // diffusion-controlled prefactor (sketch units)

/** BCF spiral growth: G ∝ (σ²/σ₁)·tanh(σ₁/σ), parabolic at low σ and linear at high σ. */
export function bcfRate(S: number): number {
  const s = S - 1
  if (s <= 0) return 0
  return ((s * s) / SIGMA_1) * Math.tanh(SIGMA_1 / s)
}

/** Diffusion-controlled growth: G ∝ (S − 1). */
export function diffusionRate(S: number): number {
  return Math.max(0, K_DIFF * (S - 1))
}

/** The slower step controls the overall rate. */
export function controllingRegime(S: number): 'surface' | 'diffusion' {
  return bcfRate(S) <= diffusionRate(S) ? 'surface' : 'diffusion'
}

/** Sticking probability of a walker touching the crystal by one bond: 0.001 at S = 1 up to 1 at S = 5 (log scale). */
export function stickProbability(S: number): number {
  const t = Math.min(Math.max((S - S_RANGE[0]) / (S_RANGE[1] - S_RANGE[0]), 0), 1)
  return 10 ** (3 * t - 3)
}
