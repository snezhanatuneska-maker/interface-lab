// Wetting simulator: Young, Wenzel and Cassie–Baxter contact angles. Angles in degrees, tensions in mN/m.

export type InputMode = 'angle' | 'tension'
export type WetState = 'wenzel' | 'cassie'
export type Wettability = 'hydrophilic' | 'hydrophobic' | 'superhydrophobic'

export const THETA_RANGE: [number, number] = [0, 180]
export const R_RANGE: [number, number] = [1, 3]
export const FS_RANGE: [number, number] = [0.05, 1]
export const GAMMA_RANGE: [number, number] = [0, 100]
export const GAMMA_LV_RANGE: [number, number] = [20, 80]
export const GAMMA_WATER = 72.8

export const THETA_DEFAULT = 110
export const R_DEFAULT = 1.5
export const FS_DEFAULT = 0.5
export const GAMMA_SV_DEFAULT = 40
export const GAMMA_SL_DEFAULT = 20

const RAD = Math.PI / 180
const clampCos = (c: number) => Math.min(1, Math.max(-1, c))
const acosDeg = (c: number) => Math.acos(clampCos(c)) / RAD

/** cos θ_Y = (γ_SV − γ_SL)/γ_LV. Outside [−1, 1] there is no angle: complete wetting or non-wetting. */
export function youngFromTensions(gSV: number, gSL: number, gLV: number): {
  cos: number
  theta: number
  limit: 'complete wetting' | 'complete non-wetting' | null
} {
  const cos = (gSV - gSL) / gLV
  return { cos, theta: acosDeg(cos), limit: cos > 1 ? 'complete wetting' : cos < -1 ? 'complete non-wetting' : null }
}

/** Wenzel: cos θ_W = r cos θ_Y (clamped to [−1, 1]). */
export const wenzelAngle = (thetaY: number, r: number) => acosDeg(r * Math.cos(thetaY * RAD))

/** Cassie–Baxter: cos θ_CB = f_s (cos θ_Y + 1) − 1. */
export const cassieAngle = (thetaY: number, fs: number) => acosDeg(fs * (Math.cos(thetaY * RAD) + 1) - 1)

/**
 * θ_Y above which Cassie–Baxter has the lower energy: cos θ_c = (f_s − 1)/(r − f_s).
 * Always between 90° and 180°. Null when r = f_s = 1 (both models reduce to Young).
 */
export function criticalAngle(r: number, fs: number): number | null {
  if (r - fs < 1e-9) return null
  return acosDeg((fs - 1) / (r - fs))
}

/** Favored state: Cassie–Baxter when θ_Y is above the critical angle, else Wenzel. */
export function favoredState(thetaY: number, r: number, fs: number): WetState {
  const c = criticalAngle(r, fs)
  return c !== null && thetaY > c ? 'cassie' : 'wenzel'
}

export function wettability(theta: number): Wettability {
  return theta > 150 ? 'superhydrophobic' : theta > 90 ? 'hydrophobic' : 'hydrophilic'
}

export interface Preset {
  id: 'glass' | 'ptfe' | 'lotus'
  label: string
  thetaY: number
  r: number
  fs: number
}

export const PRESETS: Preset[] = [
  { id: 'glass', label: 'Glass (hydrophilic)', thetaY: 40, r: 1.2, fs: 0.8 },
  { id: 'ptfe', label: 'Teflon/PTFE (hydrophobic)', thetaY: 110, r: 1.5, fs: 0.6 },
  { id: 'lotus', label: 'Lotus leaf (superhydrophobic)', thetaY: 110, r: 3, fs: 0.1 },
]
