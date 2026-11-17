// Capillary pore simulator, in the course compendium's notation: capillary radius r_c (in nm here), contact angle δ
// (through the liquid, in degrees), capillary pressure p_c, capillary rise height h_c, liquid density ρ_L, molar
// volume V_m. Water at 25 °C.

export type Mode = 'imbibition' | 'drainage'

export const GAMMA = 0.072 // surface tension γ_lg of water, N/m
export const RHO_L = 997 // liquid density ρ_L of water at 25 °C, kg/m³
export const G = 9.81 // m/s²
export const V_M = 18.07e-6 // molar volume V_m of liquid water at 25 °C, m³/mol
export const R_GAS = 8.314 // J/(mol·K)
export const T = 298.15 // K

export const RC_DEFAULT = 15
export const DELTA_DEFAULT = 21
export const MODE_DEFAULT: Mode = 'imbibition'
export const RC_RANGE: [number, number] = [2, 50]
/** Up to 150° so the hydrophobic case (PTFE-treated GDL) can be shown too. */
export const DELTA_RANGE: [number, number] = [0, 150]

const cosDeg = (delta: number) => Math.cos((delta * Math.PI) / 180)

/** Capillary pressure p_c = 2γ_lg cos δ / r_c, in kPa. Negative for δ > 90°: liquid must be pushed in. */
export function capillaryPressure(rc: number, delta: number): number {
  return (2 * GAMMA * cosDeg(delta)) / (rc * 1e-9) / 1e3
}

/** Jurin: h_c = 2γ_lg cos δ / (ρ_L g r_c), in m. Negative for δ > 90° (capillary depression). */
export function jurinHeight(rc: number, delta: number): number {
  return (2 * GAMMA * cosDeg(delta)) / (RHO_L * G * rc * 1e-9)
}

/**
 * Kelvin equation, p/p₀ = exp(−kγV_m cos δ / (r_c R T)). Emptying (drainage) goes through a hemispherical meniscus of
 * radius r_c/cos δ, so k = 2; filling (imbibition) goes through a cylindrical meniscus along the wall (Cohan), so k = 1
 * and the pore fills at a higher p/p₀ than it empties. Below 1 for a wetting liquid (capillary condensation); above 1
 * for δ > 90° (no condensation below saturation).
 */
export function kelvinRatio(rc: number, delta: number, mode: Mode = 'drainage'): number {
  const k = mode === 'imbibition' ? 1 : 2
  return Math.exp((-k * GAMMA * V_M * cosDeg(delta)) / (rc * 1e-9 * R_GAS * T))
}
