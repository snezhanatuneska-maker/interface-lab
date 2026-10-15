// Capillary pressure, capillary rise and capillary condensation in a cylindrical pore.
// Pore radius r is in nm and the contact angle θ in degrees throughout.

export type LiquidId = 'water' | 'mercury'

export interface Liquid {
  name: string
  gamma: number // surface tension, N/m
  rho: number // density, kg/m³
  vMolar: number // molar volume of the liquid, m³/mol
  /** Typical contact angle on a pore wall: water wets oxides and carbon; mercury wets almost nothing. */
  thetaDefault: number
}

/** At 25 °C. */
export const LIQUIDS: Record<LiquidId, Liquid> = {
  water: { name: 'water', gamma: 0.072, rho: 997, vMolar: 18.07e-6, thetaDefault: 30 },
  mercury: { name: 'mercury', gamma: 0.485, rho: 13534, vMolar: 14.82e-6, thetaDefault: 140 },
}
const WATER = LIQUIDS.water

export const T = 298.15 // K
const R_GAS = 8.314 // J/(mol·K)
const G = 9.81 // m/s²

export const R_DEFAULT = 10
export const THETA_DEFAULT = WATER.thetaDefault
/** Slider ranges: radius on a log scale (micropores to macropores), angle from fully wetting to fully non-wetting. */
export const R_RANGE: [number, number] = [1, 1000]
export const THETA_RANGE: [number, number] = [0, 180]

const cosd = (deg: number) => Math.cos((deg * Math.PI) / 180)

/**
 * Young–Laplace for a hemispherical meniscus in a cylinder: P_c = 2γ cos θ / r, in MPa.
 * Positive: the liquid is pulled in (wetting). Negative: it must be pushed in (non-wetting).
 */
export function capillaryPressure(r: number, theta: number, liquid: Liquid = WATER): number {
  return (2 * liquid.gamma * cosd(theta)) / (r * 1e-9) / 1e6
}

/** Jurin's law: rise height h = 2γ cos θ / (ρ g r), in m. Negative means the liquid is pushed down. */
export function jurinHeight(r: number, theta: number, liquid: Liquid = WATER): number {
  return (2 * liquid.gamma * cosd(theta)) / (liquid.rho * G * r * 1e-9)
}

/** Kelvin length γV_m/RT in nm (about 0.52 nm for water at 25 °C). */
export const kelvinLength = (liquid: Liquid = WATER) => ((liquid.gamma * liquid.vMolar) / (R_GAS * T)) * 1e9
export const KELVIN_LENGTH = kelvinLength(WATER)

/**
 * Relative pressure p/p₀ at which a cylindrical pore of radius r fills or empties (Kelvin equation).
 * Filling goes through a cylindrical film meniscus (one curvature, 1/r); emptying through a hemispherical
 * meniscus (two curvatures, 2/r). Emptying therefore happens at a lower pressure: the hysteresis loop.
 * Values ≥ 1 mean the vapour does not condense below saturation.
 */
export function kelvinFill(r: number, theta: number, liquid: Liquid = WATER): number {
  return Math.exp((-kelvinLength(liquid) * cosd(theta)) / r)
}
export function kelvinEmpty(r: number, theta: number, liquid: Liquid = WATER): number {
  return Math.exp((-2 * kelvinLength(liquid) * cosd(theta)) / r)
}
