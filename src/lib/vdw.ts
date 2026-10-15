// Van der Waals forces between two identical neutral molecules: Keesom, Debye and London.
// Inputs use the textbook units (μ in debye, α as α₀/(4πε₀) in Å³, I in eV, T in K, r in nm);
// everything is converted to SI before the formulas are applied.

// ---------- Physical constants (SI) ----------
export const K_B = 1.380649e-23 // Boltzmann constant, J/K
export const EPS0 = 8.8541878128e-12 // vacuum permittivity, F/m
export const FOUR_PI_EPS0 = 4 * Math.PI * EPS0 // 4πε₀, C²/(J·m)
export const DEBYE = 3.33564e-30 // 1 D in C·m
export const ANGSTROM3 = 1e-30 // 1 Å³ in m³
export const EV = 1.602176634e-19 // 1 eV in J
// ---------------------------------------------

/** C values are shown in units of 10⁻⁷⁹ J·m⁶. */
export const C_UNIT = 1e-79
/** Energies on the φ(r) plot are shown in zJ (10⁻²¹ J). */
export const ZJ = 1e-21

export interface Molecule {
  id: string
  /** Display name (with Unicode subscripts). */
  name: string
  /** Dipole moment, D. */
  mu: number
  /** Polarizability volume α₀/(4πε₀), Å³. */
  alpha: number
  /** Ionisation energy, eV (hν ≈ I). */
  I: number
}

export const MOLECULES: Molecule[] = [
  { id: 'Ar', name: 'Ar', mu: 0, alpha: 1.63, I: 15.8 },
  { id: 'H2', name: 'H₂', mu: 0, alpha: 0.8, I: 15.4 },
  { id: 'CH4', name: 'CH₄', mu: 0, alpha: 2.6, I: 12.6 },
  { id: 'CO', name: 'CO', mu: 0.11, alpha: 1.95, I: 14.0 },
  { id: 'HCl', name: 'HCl', mu: 1.08, alpha: 2.63, I: 12.7 },
  { id: 'NH3', name: 'NH₃', mu: 1.47, alpha: 2.26, I: 10.2 },
  { id: 'H2O', name: 'H₂O', mu: 1.85, alpha: 1.48, I: 12.6 },
]

export const MU_RANGE: [number, number] = [0, 3]
export const ALPHA_RANGE: [number, number] = [0.5, 5]
export const I_RANGE: [number, number] = [8, 16]
export const T_RANGE: [number, number] = [100, 600]
export const R_RANGE: [number, number] = [0.3, 1.0]
export const T_DEFAULT = 293
export const R_DEFAULT = 0.4
export const MOLECULE_DEFAULT = 'H2O'

export interface Coefficients {
  keesom: number
  debye: number
  london: number
  total: number
}

/**
 * C coefficients (J·m⁶) for two identical molecules, so that φ(r) = −C/r⁶:
 *   C_K = μ⁴ / (3(4πε₀)² kT),  C_D = 2μ²α′/(4πε₀),  C_L = (3/4) α′² I,  with α′ = α₀/(4πε₀) in m³.
 */
export function coefficients(muD: number, alphaA3: number, IeV: number, T: number): Coefficients {
  const mu = muD * DEBYE
  const a = alphaA3 * ANGSTROM3
  const I = IeV * EV
  const keesom = mu ** 4 / (3 * FOUR_PI_EPS0 ** 2 * K_B * T)
  const debye = (2 * mu ** 2 * a) / FOUR_PI_EPS0
  const london = 0.75 * a ** 2 * I
  return { keesom, debye, london, total: keesom + debye + london }
}

/** Pair energy φ = −C/r⁶ in J, with r in nm. */
export const phi = (C: number, rNm: number) => -C / (rNm * 1e-9) ** 6

/** Distance (nm) where |φ| = kT; beyond it thermal motion wins. */
export const thermalDistance = (C: number, T: number) => (C / (K_B * T)) ** (1 / 6) * 1e9

export type Term = 'keesom' | 'debye' | 'london'
export const TERM_NAMES: Record<Term, string> = { keesom: 'Keesom', debye: 'Debye', london: 'London' }

/** Percentage shares of the three terms (they add up to 100). */
export function shares(c: Coefficients): Record<Term, number> {
  const t = c.total || 1
  return { keesom: (100 * c.keesom) / t, debye: (100 * c.debye) / t, london: (100 * c.london) / t }
}

export function dominant(c: Coefficients): Term {
  const terms: Term[] = ['keesom', 'debye', 'london']
  return terms.reduce((best, t) => (c[t] > c[best] ? t : best), 'london')
}
