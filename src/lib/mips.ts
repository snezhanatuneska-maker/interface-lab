// Mercury intrusion porosimetry, in the course compendium's notation: surface tension γ of mercury, contact angle δ
// (through the mercury), applied pressure p, pore diameter d = 2 r_c.

export const GAMMA_HG = 0.485 // N/m, surface tension of mercury (the usual value in porosimetry)
export const DELTA_HG = 140 // °, the usual assumed contact angle of mercury

/** −4γ cos δ for mercury, N/m: d = −4γ cos δ / p. Positive, because δ > 90°. */
export const MIP_CONSTANT = -4 * GAMMA_HG * Math.cos((DELTA_HG * Math.PI) / 180)

/** Smallest pore diameter d (nm) mercury enters at pressure p (MPa): d = −4γ cos δ / p (≈ 1486/p). */
export const entryDiameter = (pMPa: number) => (MIP_CONSTANT / (pMPa * 1e6)) * 1e9
/** Pressure p (MPa) needed to enter a pore of diameter d (nm). */
export const entryPressure = (dNm: number) => MIP_CONSTANT / (dNm * 1e-9) / 1e6
