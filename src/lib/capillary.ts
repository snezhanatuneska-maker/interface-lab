// Capillary pore simulator. Pore radius r is in nm and the contact angle θ in degrees. Water at 25 °C.

export type Mode = 'imbibition' | 'drainage'

export const GAMMA = 0.072 // surface tension of water at 25 °C, N/m
export const RHO = 997 // density of water at 25 °C, kg/m³
export const G = 9.81 // m/s²
export const V_MOL = 18.07e-6 // molar volume of liquid water at 25 °C, m³/mol
export const R_GAS = 8.314 // J/(mol·K)
export const T = 298.15 // K

export const R_DEFAULT = 15
export const THETA_DEFAULT = 21
export const MODE_DEFAULT: Mode = 'imbibition'
export const R_RANGE: [number, number] = [2, 50]
/** Up to 150° so the hydrophobic case (PTFE-treated GDL) can be shown too. */
export const THETA_RANGE: [number, number] = [0, 150]

const cosDeg = (theta: number) => Math.cos((theta * Math.PI) / 180)

/** Young–Laplace for a cylindrical pore: P_c = 2γ cos θ / r, in kPa. Negative for θ > 90°: liquid must be pushed in. */
export function capillaryPressure(r: number, theta: number): number {
  return (2 * GAMMA * cosDeg(theta)) / (r * 1e-9) / 1e3
}

/** Jurin's law: h = 2γ cos θ / (ρ g r), in m. Negative for θ > 90° (capillary depression). */
export function jurinHeight(r: number, theta: number): number {
  return (2 * GAMMA * cosDeg(theta)) / (RHO * G * r * 1e-9)
}

/**
 * Kelvin equation for a hemispherical meniscus of radius r/cos θ: p/p₀ = exp(−2γV_mol cos θ / (rRT)).
 * Below 1 for a wetting liquid (capillary condensation); above 1 for θ > 90° (no condensation below saturation).
 */
export function kelvinRatio(r: number, theta: number): number {
  return Math.exp((-2 * GAMMA * V_MOL * cosDeg(theta)) / (r * 1e-9 * R_GAS * T))
}
