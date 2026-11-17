// Wetting simulator: Young, Wenzel and Cassie–Baxter contact angles, in the course compendium's notation
// (δ: contact angle through the liquid; γ_sg, γ_sl, γ_lg; A_r: roughness ratio; f_solid: solid fraction).
// Angles in degrees, tensions in mN/m.

export type InputMode = 'angle' | 'tension'
export type Wettability = 'hydrophilic' | 'hydrophobic' | 'superhydrophobic'

/** Young angle δ on a smooth surface: water never exceeds about 120° (–CF₃ monolayers). */
export const DELTA_RANGE: [number, number] = [0, 120]
export const AR_RANGE: [number, number] = [1, 3]
export const FSOLID_RANGE: [number, number] = [0.05, 1]
export const GAMMA_RANGE: [number, number] = [0, 100]
export const GAMMA_LG_RANGE: [number, number] = [20, 80]
export const GAMMA_WATER = 72 // mN/m, water: the single value used on the site (exercise value)

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
 * Lecture classes: δ < 90° partially wetting (hydrophilic for water), δ > 90° non-wetting (hydrophobic), δ > 150°
 * (water) superhydrophobic, which in full also needs low hysteresis, δ_a − δ_r < 5°.
 */
export function wettability(delta: number): Wettability {
  return delta > 150 ? 'superhydrophobic' : delta > 90 ? 'hydrophobic' : 'hydrophilic'
}

/** Badge text for each class. */
export const WET_LABEL: Record<Wettability, string> = {
  hydrophilic: 'partially wetting (hydrophilic)',
  hydrophobic: 'non-wetting (hydrophobic)',
  superhydrophobic: 'superhydrophobic',
}

/** Superhydrophobic in the lecture's sense: δ > 150° and contact-angle hysteresis δ_a − δ_r < 5°. */
export const isSuperhydrophobic = (delta: number, deltaA: number, deltaR: number) => delta > 150 && deltaA - deltaR < 5

export interface Preset {
  id: 'glass' | 'ptfe' | 'lotus'
  label: string
  delta: number
  Ar: number
  fSolid: number
  /** Wetting state shown for this surface. */
  view: 'wenzel' | 'cassie'
}

export const PRESETS: Preset[] = [
  { id: 'glass', label: 'Glass (hydrophilic)', delta: 40, Ar: 1.2, fSolid: 0.8, view: 'wenzel' },
  { id: 'ptfe', label: 'Teflon/PTFE (hydrophobic)', delta: 110, Ar: 1.5, fSolid: 0.6, view: 'wenzel' },
  { id: 'lotus', label: 'Lotus leaf (superhydrophobic)', delta: 110, Ar: 3, fSolid: 0.1, view: 'cassie' },
]

// ---------- Spreading coefficient and contact-angle hysteresis ----------

/** Spreading coefficient S_w = γ_sg − γ_sl − γ_lg: > 0 spreads (dynamic wetting), < 0 sessile drop (static). */
export const spreadingCoefficient = (gSG: number, gSL: number, gLG: number) => gSG - gSL - gLG

/**
 * Furmidge retention force F = k w γ_lg (cos δ_r − cos δ_a), N. w: lateral drop width (m), γ_lg in N/m,
 * k = 1 for an ideal spherical cap.
 */
export const furmidgeForce = (w: number, gLG: number, deltaA: number, deltaR: number, k = 1) =>
  k * w * gLG * (Math.cos(deltaR * RAD) - Math.cos(deltaA * RAD))

/**
 * Sliding angle (deg): the tilt α at which the gravity component m g sin α equals the Furmidge force.
 * Null when even a vertical surface cannot move the drop. m = ρ_L V.
 */
export function slidingAngle(F: number, volume: number, rhoL = 1000, g = 9.81): number | null {
  const s = F / (rhoL * volume * g)
  return s > 1 ? null : Math.asin(Math.max(0, s)) / RAD
}
