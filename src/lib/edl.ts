// Electrical double layer: Gouy–Chapman (GC) and Gouy–Chapman–Stern (GCS) for a symmetric z:z electrolyte.
// SI units inside; the page passes c₀ in mM (= mol/m³), ψ in mV and δ in nm.

export type Model = 'gc' | 'gcs'

export const E0 = 8.8541878128e-12 // vacuum permittivity, F/m
export const KB = 1.380649e-23 // J/K
export const NA = 6.02214076e23 // 1/mol
export const QE = 1.602176634e-19 // C
export const T = 298 // K
export const EPS_BULK = 78.5 // water
export const EPS_STERN = 10 // ordered water in the Stern layer (6–10 in the literature)

export const C0_RANGE: [number, number] = [0.1, 1000] // mM
export const C0_DEFAULT = 10
export const PSI0_MAX = 200 // mV
export const PSI0_DEFAULT = 75
export const DELTA_RANGE: [number, number] = [0.2, 1.0] // nm
export const DELTA_DEFAULT = 0.5
export const Z_DEFAULT = 1

const KT = KB * T

/** Ionic strength of a z:z electrolyte, I = ½ Σ cᵢzᵢ² = c₀z² (same units as c₀). */
export const ionicStrength = (c0: number, z: number) => c0 * z * z

/** Debye length κ⁻¹ in nm; c₀ in mM. */
export function debyeLength(c0: number, z: number): number {
  const I = ionicStrength(c0, z) // mol/m³
  return Math.sqrt((E0 * EPS_BULK * KT) / (2 * NA * QE * QE * I)) * 1e9
}

/** Reduced potential zeψ/kT for ψ in mV. */
const reduced = (psi: number, z: number) => (z * QE * psi * 1e-3) / KT

/** Diffuse-layer charge (C/m²) for potential ψd (mV) at its start (Grahame equation). */
export function diffuseCharge(psiD: number, c0: number, z: number): number {
  return Math.sqrt(8 * c0 * NA * E0 * EPS_BULK * KT) * Math.sinh(reduced(psiD, z) / 2)
}

/** Stern capacitance ε₀ε_S/δ in F/m² (δ in nm). */
export const sternCapacitance = (delta: number) => (E0 * EPS_STERN) / (delta * 1e-9)

/** Differential diffuse-layer capacitance ε₀ε_rκ cosh(zeψd/2kT) in F/m². */
export function diffuseCapacitance(psiD: number, c0: number, z: number): number {
  return ((E0 * EPS_BULK) / (debyeLength(c0, z) * 1e-9)) * Math.cosh(reduced(psiD, z) / 2)
}

/**
 * Potential at the outer Helmholtz plane (mV). GC: ψd = ψ₀. GCS: solves
 * ε₀ε_S(ψ₀ − ψd)/δ = σ_diffuse(ψd) by bisection; the left side falls and the right rises with ψd,
 * so there is one root, between 0 and ψ₀.
 */
export function psiOhp(model: Model, psi0: number, c0: number, z: number, delta: number): number {
  if (model === 'gc' || psi0 <= 0) return Math.max(psi0, 0)
  const cs = sternCapacitance(delta)
  const f = (pd: number) => (cs * (psi0 - pd) * 1e-3) - diffuseCharge(pd, c0, z)
  let lo = 0
  let hi = psi0
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (f(mid) > 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export interface EdlState {
  debye: number // nm
  psiD: number // mV
  sigma: number // C/m²
  cStern: number // F/m² (Infinity in GC)
  cDiffuse: number // F/m²
  cTotal: number // F/m²
}

export function solve(model: Model, psi0: number, c0: number, z: number, delta: number): EdlState {
  const psiD = psiOhp(model, psi0, c0, z, delta)
  const cDiffuse = diffuseCapacitance(psiD, c0, z)
  const cStern = model === 'gc' ? Infinity : sternCapacitance(delta)
  const cTotal = model === 'gc' ? cDiffuse : 1 / (1 / cStern + 1 / cDiffuse)
  return { debye: debyeLength(c0, z), psiD, sigma: diffuseCharge(psiD, c0, z), cStern, cDiffuse, cTotal }
}

/**
 * Potential (mV) at distance x (nm) from the surface. In GCS it drops linearly across the Stern layer
 * (0 ≤ x < δ), then decays as in GC from the OHP: tanh(zeψ/4kT) = tanh(zeψd/4kT)·exp(−κ(x − δ)).
 */
export function potentialAt(x: number, model: Model, psi0: number, psiD: number, c0: number, z: number, delta: number): number {
  const start = model === 'gcs' ? delta : 0
  if (x < start) return psi0 - ((psi0 - psiD) * x) / delta
  const g = Math.tanh(reduced(psiD, z) / 4) * Math.exp(-(x - start) / debyeLength(c0, z))
  return (4 * Math.atanh(g) * KT) / (z * QE) * 1e3
}

/** Ion concentrations relative to the bulk, c±/c₀ = exp(∓zeψ/kT), at potential ψ (mV). */
export function ionRatios(psi: number, z: number): { cation: number; anion: number } {
  const r = reduced(psi, z)
  return { cation: Math.exp(-r), anion: Math.exp(r) }
}

/** F/m² → µF/cm². */
export const toMicroFcm2 = (c: number) => c * 100
/** C/m² → µC/cm². */
export const toMicroCcm2 = (s: number) => s * 100
