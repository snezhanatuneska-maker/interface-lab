// Capillary pressure, capillary rise and capillary condensation for water in a cylindrical pore.
// Pore radius r is in nm and the contact angle θ in degrees throughout.

/** Water at 25 °C. */
export const GAMMA = 0.072 // surface tension, N/m
export const RHO = 997 // density, kg/m³
export const V_MOLAR = 18.07e-6 // molar volume of the liquid, m³/mol
export const T = 298.15 // K
const R_GAS = 8.314 // J/(mol·K)
const G = 9.81 // m/s²

export const R_DEFAULT = 10
export const THETA_DEFAULT = 30
/** Slider ranges: radius on a log scale (micropores to macropores), angle from fully wetting to fully non-wetting. */
export const R_RANGE: [number, number] = [1, 1000]
export const THETA_RANGE: [number, number] = [0, 180]

const cosd = (deg: number) => Math.cos((deg * Math.PI) / 180)

/**
 * Young–Laplace for a hemispherical meniscus in a cylinder: P_c = 2γ cos θ / r, in MPa.
 * Positive: the liquid is pulled in (wetting). Negative: it must be pushed in (non-wetting).
 */
export function capillaryPressure(r: number, theta: number): number {
  return (2 * GAMMA * cosd(theta)) / (r * 1e-9) / 1e6
}

/** Jurin's law: rise height h = 2γ cos θ / (ρ g r), in m. Negative means the liquid is pushed down. */
export function jurinHeight(r: number, theta: number): number {
  return (2 * GAMMA * cosd(theta)) / (RHO * G * r * 1e-9)
}

/** Kelvin length γV_m/RT in nm (about 0.52 nm for water at 25 °C). */
export const KELVIN_LENGTH = ((GAMMA * V_MOLAR) / (R_GAS * T)) * 1e9

/**
 * Relative pressure p/p₀ at which a cylindrical pore of radius r fills or empties (Kelvin equation).
 * Filling goes through a cylindrical film meniscus (one curvature, 1/r); emptying through a hemispherical
 * meniscus (two curvatures, 2/r). Emptying therefore happens at a lower pressure: the hysteresis loop.
 * Values ≥ 1 mean the vapour does not condense below saturation.
 */
export function kelvinFill(r: number, theta: number): number {
  return Math.exp((-KELVIN_LENGTH * cosd(theta)) / r)
}
export function kelvinEmpty(r: number, theta: number): number {
  return Math.exp((-2 * KELVIN_LENGTH * cosd(theta)) / r)
}
