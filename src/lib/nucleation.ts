// Classical nucleation theory for a spherical cluster of diameter d (m).
// θ (degrees) is the contact angle of the nucleus on the substrate, measured through the nucleus:
// 180° = the nucleus does not wet the surface at all, 0° = it spreads into a film.

export const K_B = 1.380649e-23 // Boltzmann constant, J/K
export const V_M = 3e-29 // molecular volume, m³ (fixed)
/** Prefactor used for both rates, so only the exponential term is compared (illustrative). */
export const LOG10_J0 = 30

export const S_RANGE: [number, number] = [1.05, 20]
export const GAMMA_RANGE: [number, number] = [0.02, 0.5]
export const THETA_RANGE: [number, number] = [0, 180]
export const T_RANGE: [number, number] = [250, 500]

export const S_DEFAULT = 5
export const GAMMA_DEFAULT = 0.1
export const THETA_DEFAULT = 60
export const T_DEFAULT = 298

const RAD = Math.PI / 180

/** Free energy of a cluster of diameter d: −(πd³/6V_m)·kT ln S + πd²γ, in J. */
export function deltaG(d: number, S: number, gamma: number, T: number, vm = V_M): number {
  return (-(Math.PI * d ** 3) / (6 * vm)) * K_B * T * Math.log(S) + Math.PI * d ** 2 * gamma
}

/** Critical diameter d* = 4γV_m/(kT ln S), in m; null when S ≤ 1 (no stable nucleus). */
export function criticalDiameter(S: number, gamma: number, T: number, vm = V_M): number | null {
  if (S <= 1) return null
  return (4 * gamma * vm) / (K_B * T * Math.log(S))
}

/** Homogeneous barrier ΔG*_hom = 16πγ³V_m²/[3(kT ln S)²], in J; null when S ≤ 1. */
export function barrierHom(S: number, gamma: number, T: number, vm = V_M): number | null {
  if (S <= 1) return null
  return (16 * Math.PI * gamma ** 3 * vm ** 2) / (3 * (K_B * T * Math.log(S)) ** 2)
}

/** Shape factor f(θ) = (2 + cos θ)(1 − cos θ)²/4 = V_cap/V_sphere, between 0 and 1. */
export function shapeFactor(thetaDeg: number): number {
  const c = Math.cos(thetaDeg * RAD)
  return ((2 + c) * (1 - c) ** 2) / 4
}

/** log₁₀ J for a barrier given in units of kT: log₁₀ J₀ − ΔG* / (kT ln 10). No exp(), so nothing overflows. */
export function log10Rate(barrierKT: number): number {
  return LOG10_J0 - barrierKT / Math.LN10
}

export interface Nucleus {
  /** Critical diameter, nm. */
  dStar: number
  /** Barriers in units of kT. */
  homKT: number
  hetKT: number
  f: number
  /** log₁₀(J_het/J_hom) = (1 − f)·ΔG*_hom/(kT ln 10). */
  log10Ratio: number
}

/** Everything the readout needs; null when S ≤ 1. */
export function solve(S: number, gamma: number, theta: number, T: number): Nucleus | null {
  const d = criticalDiameter(S, gamma, T)
  const g = barrierHom(S, gamma, T)
  if (d === null || g === null) return null
  const f = shapeFactor(theta)
  const homKT = g / (K_B * T)
  return { dStar: d * 1e9, homKT, hetKT: f * homKT, f, log10Ratio: ((1 - f) * homKT) / Math.LN10 }
}
