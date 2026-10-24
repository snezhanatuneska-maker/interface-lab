// Phase separation in a symmetric regular solution, the 1D profiles of the two mechanisms, and the
// classical nucleation barrier. Compositions x are mole fractions of component 2; temperatures are T/Tc.

export type Region = 'stable' | 'metastable' | 'unstable'

export const T_RANGE: [number, number] = [0.5, 1.1] // T/Tc on the phase diagram
export const X_DEFAULT = 0.2
export const T_DEFAULT = 0.75

/** Interaction parameter χ = 2·Tc/T, so the critical point sits at x = 0.5, χ = 2. */
export const chi = (t: number) => 2 / t

/** G_mix/kT = x ln x + (1 − x) ln(1 − x) + χ x (1 − x). */
export function gMix(x: number, c: number): number {
  const xlx = (v: number) => (v > 0 ? v * Math.log(v) : 0)
  return xlx(x) + xlx(1 - x) + c * x * (1 - x)
}

/** d²G/dx² = 1/(x(1 − x)) − 2χ. Negative inside the spinodal. */
export const g2 = (x: number, c: number) => 1 / (x * (1 - x)) - 2 * c

/** Spinodal compositions from d²G/dx² = 0, or null above Tc (χ ≤ 2). */
export function spinodal(c: number): [number, number] | null {
  if (c <= 2) return null
  const h = 0.5 * Math.sqrt(1 - 2 / c)
  return [0.5 - h, 0.5 + h]
}

/**
 * Binodal compositions: for the symmetric model the common tangent is horizontal, so x₁ solves
 * ln(x/(1 − x)) + χ(1 − 2x) = 0 below the spinodal, and x₂ = 1 − x₁. Null above Tc.
 */
export function binodal(c: number): [number, number] | null {
  const sp = spinodal(c)
  if (!sp) return null
  const f = (x: number) => Math.log(x / (1 - x)) + c * (1 - 2 * x)
  // f → −∞ at x → 0 and f > 0 at the spinodal, with one root in between. Bisect in log x: x₁ can be tiny.
  let lo = Math.log(1e-300)
  let hi = Math.log(sp[0])
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (f(Math.exp(mid)) < 0) lo = mid
    else hi = mid
  }
  const x1 = Math.exp((lo + hi) / 2)
  return [x1, 1 - x1]
}

export function region(x: number, t: number): Region {
  const c = chi(t)
  const b = binodal(c)
  if (!b || x <= b[0] || x >= b[1]) return 'stable'
  return g2(x, c) > 0 ? 'metastable' : 'unstable'
}

// ---------- 1D concentration profiles (animation) ----------
// Both panels use the same reduced order parameter φ, with φ = ±1 the two equilibrium phases x₁ and x₂.

export const PROFILE_N = 128
export const PROFILE_X1 = 0.15
export const PROFILE_X2 = 0.85
/** φ → composition between x₁ and x₂. */
export const toComposition = (phi: number) => (PROFILE_X1 + PROFILE_X2) / 2 + (phi * (PROFILE_X2 - PROFILE_X1)) / 2

export const PHI0_NUCLEATION = -0.6 // metastable: outside the spinodal φ = ±1/√3 of the φ⁴ model
export const PHI0_SPINODAL = 0 // unstable: the middle of the spinodal
export const PROFILE_T_END = 120

// Cahn–Hilliard: ∂φ/∂t = ∇²(φ³ − φ − κ∇²φ). Periodic grid, dx = 1, explicit Euler.
const KAPPA = 1.5 // fastest-growing wavelength 2π√(2κ) ≈ 11 grid cells
export const CH_DT = 0.03 // explicit limit is ≈ 2/(16κ + 8) ≈ 0.06

/** Small reproducible noise around φ₀ (a seeded generator, so Reset gives a fresh but valid start). */
export function spinodalStart(seed: number, phi0 = PHI0_SPINODAL, amp = 0.02): Float64Array {
  let s = seed >>> 0 || 1
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 2 ** 32
  }
  const phi = new Float64Array(PROFILE_N)
  for (let i = 0; i < PROFILE_N; i++) phi[i] = phi0 + amp * (2 * rand() - 1)
  return phi
}

/** One explicit Cahn–Hilliard step, in place. */
export function cahnHilliardStep(phi: Float64Array, dt = CH_DT, mu = new Float64Array(phi.length)): void {
  const n = phi.length
  for (let i = 0; i < n; i++) {
    const l = phi[(i - 1 + n) % n] - 2 * phi[i] + phi[(i + 1) % n]
    mu[i] = phi[i] ** 3 - phi[i] - KAPPA * l
  }
  for (let i = 0; i < n; i++) phi[i] += dt * (mu[(i - 1 + n) % n] - 2 * mu[i] + mu[(i + 1) % n])
}

// Nucleation & growth is scripted: nuclei appear at set times, jump sharply to x₂ and grow; each pulls
// a depleted zone (down to x₁ at the interface) that spreads by diffusion into the untouched x₀ matrix.
const NUCLEI = [
  { at: 22, born: 6 },
  { at: 61, born: 16 },
  { at: 97, born: 30 },
  { at: 118, born: 44 },
]

export function nucleationProfile(t: number, phi0 = PHI0_NUCLEATION): Float64Array {
  const phi = new Float64Array(PROFILE_N).fill(phi0)
  for (let i = 0; i < PROFILE_N; i++) {
    let depleted = phi0
    let inside = 0
    for (const nu of NUCLEI) {
      const age = t - nu.born
      if (age <= 0) continue
      const grow = Math.min(age / 3, 1) // fades in over a few time units instead of popping
      const R = 0.8 + 0.42 * Math.sqrt(age)
      const L = 1 + 1.1 * Math.sqrt(age)
      const d = Math.min(Math.abs(i - nu.at), PROFILE_N - Math.abs(i - nu.at)) // periodic distance
      const dep = phi0 - grow * (phi0 + 1) * Math.exp(-Math.max(d - R, 0) / L)
      depleted = Math.min(depleted, dep)
      inside = Math.max(inside, grow * 0.5 * (1 - Math.tanh((d - R) / 0.45)))
    }
    phi[i] = depleted + (1 - depleted) * inside
  }
  return phi
}

// ---------- Nucleation barrier ----------
// ΔG(d) = −(π d³ / 6V_m)·kT·ln S + π d² γ, for a spherical cluster of diameter d.

export const KT = 1.380649e-23 * 298 // J
export const VM = 3e-29 // m³ per molecule (≈ 0.03 nm³)
export const S_RANGE: [number, number] = [0.5, 5]
export const S_DEFAULT = 2
export const GAMMA_RANGE: [number, number] = [0.02, 0.2] // J/m²
export const GAMMA_DEFAULT = 0.05

/** ΔG in units of kT for a cluster of diameter d (nm). */
export function deltaG(dNm: number, S: number, gamma: number): number {
  const d = dNm * 1e-9
  return (-(Math.PI * d ** 3) / (6 * VM) * KT * Math.log(S) + Math.PI * d * d * gamma) / KT
}

/** Critical diameter d* = 4γV_m/(kT ln S) in nm, and barrier ΔG* = π d*² γ / 3 in kT. Null for S ≤ 1. */
export function critical(S: number, gamma: number): { d: number; g: number } | null {
  if (S <= 1) return null
  const d = (4 * gamma * VM) / (KT * Math.log(S))
  return { d: d * 1e9, g: (Math.PI * d * d * gamma) / 3 / KT }
}
