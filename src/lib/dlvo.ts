import { debyeLength, KB, NA, QE, T } from './edl'

// DLVO interaction between two equal spheres in a symmetric z:z electrolyte (Derjaguin approximation):
// double-layer repulsion from the weak-overlap (superposition) result plus non-retarded van der Waals attraction.
// Energies in units of kT; h is the surface–surface gap in nm, c₀ in mM, ψ₀ in mV, a in nm, A in J.

const KT = KB * T

export interface DlvoParams {
  c0: number // mM
  z: number
  psi0: number // mV
  a: number // particle radius, nm
  hamaker: number // J
}

/** Illustrative aqueous colloid: 100 nm radius, A = 5 × 10⁻²⁰ J (within the usual 10⁻²⁰–10⁻¹⁹ J). */
export const RADIUS_DEFAULT = 100
export const HAMAKER_DEFAULT = 5e-20
/** Rule of thumb: a barrier above ~15 kT keeps a dispersion stable for practical times. */
export const STABLE_BARRIER = 15

/** Double-layer repulsion V_R = (64π a n kT γ²/κ²) e^(−κh), γ = tanh(zeψ₀/4kT). In kT. */
export function repulsion(h: number, p: DlvoParams): number {
  const n = p.c0 * NA // ions per m³ (c₀ in mM = mol/m³)
  const k = 1 / (debyeLength(p.c0, p.z) * 1e-9) // 1/m
  const g = Math.tanh((p.z * QE * p.psi0 * 1e-3) / (4 * KT))
  return ((64 * Math.PI * p.a * 1e-9 * n * g * g) / (k * k)) * Math.exp(-k * h * 1e-9)
}

/** Van der Waals attraction between equal spheres, V_A = −A a/(12 h). In kT. */
export function attraction(h: number, p: DlvoParams): number {
  return -(p.hamaker * p.a) / (12 * h) / KT
}

export const total = (h: number, p: DlvoParams) => repulsion(h, p) + attraction(h, p)

/** Gaps (nm) on a log grid from 0.1 to 100 nm, where the curve is searched for its barrier. */
const GRID = Array.from({ length: 1500 }, (_, i) => 0.1 * 1000 ** (i / 1499))

/** Height of the energy barrier (kT): the highest local maximum of V above zero, or 0 when there is none. */
export function barrier(p: DlvoParams): number {
  const v = GRID.map((h) => total(h, p))
  let best = 0
  for (let i = 1; i < v.length - 1; i++) if (v[i] >= v[i - 1] && v[i] > v[i + 1]) best = Math.max(best, v[i])
  return best
}

/** Critical coagulation concentration (mM): the lowest c₀ at which the barrier vanishes (bisection on log c₀). */
export function ccc(p: Omit<DlvoParams, 'c0'>): number {
  let lo = Math.log(0.01)
  let hi = Math.log(1e5)
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (barrier({ ...p, c0: Math.exp(mid) }) > 0) lo = mid
    else hi = mid
  }
  return Math.exp(hi)
}
