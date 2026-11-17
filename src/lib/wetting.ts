// Wetting simulator: Young, Wenzel and Cassie–Baxter contact angles, in the course compendium's notation
// (δ: contact angle through the liquid; γ_sg, γ_sl, γ_lg; A_r: roughness ratio; f_solid: solid fraction).
// Angles in degrees, tensions in mN/m.

export type InputMode = 'angle' | 'tension'
export type WetState = 'wenzel' | 'cassie'
export type Wettability = 'hydrophilic' | 'hydrophobic' | 'superhydrophobic'

/** Young angle δ on a smooth surface: water never exceeds about 120° (–CF₃ monolayers). */
export const DELTA_RANGE: [number, number] = [0, 120]
export const AR_RANGE: [number, number] = [1, 3]
export const FSOLID_RANGE: [number, number] = [0.05, 1]
export const GAMMA_RANGE: [number, number] = [0, 100]
export const GAMMA_LG_RANGE: [number, number] = [20, 80]
export const GAMMA_WATER = 72.0 // mN/m at 25 °C, as on the capillary and surfactant pages

export const DELTA_DEFAULT = 110
export const AR_DEFAULT = 1.5
export const FSOLID_DEFAULT = 0.5
export const GAMMA_SG_DEFAULT = 40
export const GAMMA_SL_DEFAULT = 20

const RAD = Math.PI / 180
const clampCos = (c: number) => Math.min(1, Math.max(-1, c))
const acosDeg = (c: number) => Math.acos(clampCos(c)) / RAD

/** Young: cos δ = (γ_sg − γ_sl)/γ_lg. Outside [−1, 1] there is no angle: complete wetting or non-wetting. */
export function youngFromTensions(gSG: number, gSL: number, gLG: number): {
  cos: number
  delta: number
  limit: 'complete wetting' | 'complete non-wetting' | null
} {
  const cos = (gSG - gSL) / gLG
  return { cos, delta: acosDeg(cos), limit: cos > 1 ? 'complete wetting' : cos < -1 ? 'complete non-wetting' : null }
}

/** Wenzel: cos δ_rough = A_r cos δ_smooth (clamped to [−1, 1]). */
export const wenzelAngle = (deltaSmooth: number, Ar: number) => acosDeg(Ar * Math.cos(deltaSmooth * RAD))

/** Cassie–Baxter: cos δ_rough = f_solid (cos δ_smooth + 1) − 1. */
export const cassieAngle = (deltaSmooth: number, fSolid: number) => acosDeg(fSolid * (Math.cos(deltaSmooth * RAD) + 1) - 1)

/**
 * δ_smooth above which Cassie–Baxter has the lower energy: cos δ_c = (f_solid − 1)/(A_r − f_solid).
 * Always between 90° and 180°. Null when A_r = f_solid = 1 (both models reduce to Young).
 */
export function criticalAngle(Ar: number, fSolid: number): number | null {
  if (Ar - fSolid < 1e-9) return null
  return acosDeg((fSolid - 1) / (Ar - fSolid))
}

/** Favored state: Cassie–Baxter when δ_smooth is above the critical angle, else Wenzel. */
export function favoredState(deltaSmooth: number, Ar: number, fSolid: number): WetState {
  const c = criticalAngle(Ar, fSolid)
  return c !== null && deltaSmooth > c ? 'cassie' : 'wenzel'
}

export function wettability(delta: number): Wettability {
  return delta > 150 ? 'superhydrophobic' : delta > 90 ? 'hydrophobic' : 'hydrophilic'
}

export interface Preset {
  id: 'glass' | 'ptfe' | 'lotus'
  label: string
  delta: number
  Ar: number
  fSolid: number
}

export const PRESETS: Preset[] = [
  { id: 'glass', label: 'Glass (hydrophilic)', delta: 40, Ar: 1.2, fSolid: 0.8 },
  { id: 'ptfe', label: 'Teflon/PTFE (hydrophobic)', delta: 110, Ar: 1.5, fSolid: 0.6 },
  { id: 'lotus', label: 'Lotus leaf (superhydrophobic)', delta: 110, Ar: 3, fSolid: 0.1 },
]
