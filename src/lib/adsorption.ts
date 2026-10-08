// Adsorption isotherm models. Everything is written in terms of the relative
// pressure x = p/p0 (0 ≤ x < 1) and returns a dimensionless loading V/Vm
// (amount adsorbed per monolayer amount; for Langmuir this is the coverage θ).

export type Model = 'langmuir' | 'bet'

/**
 * Default model constants: Langmuir K (per unit p/p₀) and BET C. Both are adjustable on the page.
 * They start equal because BET reduces to Langmuir with K = C at low pressure, so the overlay compares like with like.
 */
export const K_DEFAULT = 50
export const C_DEFAULT = 50

/** Slider ranges (log scale). C below 2 gives a type III isotherm (no knee). */
export const K_RANGE: [number, number] = [0.5, 200]
export const C_RANGE: [number, number] = [0.5, 500]

/** Usual fitting range of the BET equation (p/p₀). */
export const BET_FIT_RANGE: [number, number] = [0.05, 0.35]

/** Largest p/p₀ BET is evaluated at: it diverges at p = p₀, so x is kept just below 1. (Langmuir has no such limit.) */
export const X_LIMIT = 0.999

/** Pressure cannot be negative; non-finite input counts as no gas. */
const clampX = (x: number) => (Number.isFinite(x) ? Math.max(x, 0) : 0)
/** Model constants must be finite and positive; anything else counts as no binding. */
const clampConst = (k: number) => (Number.isFinite(k) && k > 0 ? k : 0)

/** Langmuir (monolayer) coverage θ = V/Vm = K·x / (1 + K·x). Bounded by 1. */
export function langmuirTheta(x: number, K: number): number {
  const kx = clampConst(K) * clampX(x)
  return kx / (1 + kx)
}

/** BET (multilayer) loading V/Vm = C·x / [(1 − x)(1 − x + C·x)]. Diverges as x → 1 (finite here, since x ≤ X_LIMIT). */
export function betLoading(x: number, c: number): number {
  const xc = Math.min(clampX(x), X_LIMIT)
  const cc = clampConst(c)
  if (xc === 0 || cc === 0) return 0
  return (cc * xc) / ((1 - xc) * (1 - xc + cc * xc))
}

/** Loading V/Vm of the given model. */
export function loading(model: Model, x: number, K: number, c: number): number {
  return model === 'langmuir' ? langmuirTheta(x, K) : betLoading(x, c)
}

/** p/p₀ at which the BET loading reaches one monolayer (V = Vm): point B, the knee. */
export function kneeX(c: number): number {
  return 1 / (1 + Math.sqrt(c))
}

/** Below this C the BET isotherm has no knee (type III) and the BET area is not reliable. */
export const C_MIN_VALID = 2

// ---------- BET plot and surface area ----------

/** BET transform y = (p/p₀) / [V (1 − p/p₀)], which is linear in p/p₀. */
export function betTransform(x: number, V: number): number {
  return x / (V * (1 - x))
}

/** Least-squares straight line through the points. */
export function fitLine(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const n = xs.length
  if (n === 0) return { slope: 0, intercept: 0 }
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let sxy = 0
  let sxx = 0
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my)
    sxx += (xs[i] - mx) ** 2
  }
  // All points at the same x (or only one point): no slope can be fitted, so return a flat line through the mean.
  const slope = sxx > 0 ? sxy / sxx : 0
  return { slope, intercept: my - slope * mx }
}

/** Slope = (C − 1)/(Vm·C), intercept = 1/(Vm·C)  ⇒  Vm = 1/(slope + intercept), C = slope/intercept + 1. */
export function betFromLine(slope: number, intercept: number): { Vm: number; C: number } {
  return { Vm: 1 / (slope + intercept), C: slope / intercept + 1 }
}

export const AVOGADRO = 6.02214076e23 // 1/mol
export const V_MOLAR_STP = 22414 // cm³/mol, ideal gas at STP (0 °C, 1 atm)
export const SIGMA_N2 = 0.162 // nm², cross-section of one adsorbed N₂ molecule at 77 K

/** Specific surface area per cm³(STP)/g of monolayer capacity: N_A·σ / V_mol ≈ 4.35 m²/g. */
export const AREA_PER_VM = (AVOGADRO * SIGMA_N2 * 1e-18) / V_MOLAR_STP

/** Specific surface area A/m (m²/g) from the monolayer capacity Vm (cm³(STP)/g) for N₂. */
export function surfaceArea(Vm: number): number {
  return Vm * AREA_PER_VM
}

export interface Sample {
  id: string
  name: string
  role: string
  /** Typical BET area, m²/g (rounded; real powders vary by supplier and treatment). */
  area: number
}

/** Example powders from fuel cells and electrolysers, with typical N₂ BET areas. */
export const SAMPLES: Sample[] = [
  { id: 'pt-black', name: 'Pt black', role: 'fuel-cell catalyst', area: 25 },
  { id: 'iro2', name: 'IrO₂ powder', role: 'electrolyser catalyst', area: 30 },
  { id: 'vulcan', name: 'Vulcan XC-72', role: 'Pt catalyst support', area: 240 },
  { id: 'ketjen', name: 'Ketjenblack EC-300J', role: 'high-area support', area: 800 },
]
export const SAMPLE_DEFAULT = 'vulcan'

// ---------- Pt particle size ----------

export const RHO_PT = 21.45 // g/cm³

/** Surface area per gram of spherical Pt particles of diameter d (nm): 6/(ρ·d), in m²/g. */
export function ptAreaPerGram(dNm: number): number {
  return 6 / (RHO_PT * 1e6 * dNm * 1e-9)
}
