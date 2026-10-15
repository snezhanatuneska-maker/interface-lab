// Capillary pore simulator. Pore radius r is in nm and the contact angle θ in degrees.

export type Mode = 'imbibition' | 'drainage'

export const GAMMA = 0.0728 // surface tension of water, N/m

export const R_DEFAULT = 15
export const THETA_DEFAULT = 21
export const MODE_DEFAULT: Mode = 'imbibition'
export const R_RANGE: [number, number] = [2, 50]
export const THETA_RANGE: [number, number] = [0, 85]

/** Young–Laplace: P_c = 2γ cos θ / r, in kPa. */
export function capillaryPressure(r: number, theta: number): number {
  return (2 * GAMMA * Math.cos((theta * Math.PI) / 180)) / (r * 1e-9) / 1e3
}

/** Jurin rise height shown by the simulator, in µm. */
export function jurinHeight(r: number): number {
  return 1500 / r
}

/** Kelvin saturation P/P₀ shown by the simulator. */
export function kelvinRatio(r: number): number {
  return Math.max(0.05, 1 - 35 / r)
}
