// Curved interfaces and capillarity, in the course compendium's notation. SI units throughout (Pa, m, N/m, K)
// unless a name says otherwise; the page converts for display.
//
//   Young–Laplace     Δp = γ (1/r₁ + 1/r₂)                 drop 2γ/r, soap bubble 4γ/r, cylinder γ/r
//   Capillary press.  p_c = 2γ_lg cos δ / r_c
//   Jurin             h_c = 2γ_lg cos δ / (ρ_L g r_c) = 2Δγ_s / (ρ_L g r_c),  Δγ_s = γ_sg − γ_sl
//   Kelvin            p = p₀ exp(2V_mγ / (R T r)),  r signed: r > 0 convex drop, r < 0 concave meniscus
//                     (in a pore with contact angle δ the meniscus radius is r = −r_c / cos δ)

export const G = 9.81 // m/s²
export const R_GAS = 8.3145 // J/(K·mol)
export const V_M_WATER = 18e-6 // molar volume V_m of water, m³/mol (18 cm³/mol, taken as constant)
export const RHO_WATER = 1000 // liquid density ρ_L of water, kg/m³
export const GAMMA_WATER = 0.072 // N/m: the single value used for water (exercise value)
export const KELVIN_0 = 273.15

/** Water surface tension from the course: γ(T) = 121.5 mN/m − 0.1662 mN m⁻¹ K⁻¹ × T (T in K). Returns N/m. */
export const gammaWater = (T: number) => (121.5 - 0.1662 * T) / 1e3

const RAD = Math.PI / 180
const cosDeg = (delta: number) => Math.cos(delta * RAD)

// ---------- 4.1 Young–Laplace ----------

/** Δp = γ (1/r₁ + 1/r₂), Pa (r in m; an infinite radius is a flat direction). */
export const youngLaplace = (gamma: number, r1: number, r2: number) => gamma * (1 / r1 + 1 / r2)

export type Shape = 'drop' | 'bubble' | 'cylinder'
/** Δp for a spherical drop (2γ/r), a soap bubble with two surfaces (4γ/r) or a cylinder (γ/r), Pa. */
export function laplaceShape(shape: Shape, gamma: number, r: number): number {
  if (shape === 'drop') return youngLaplace(gamma, r, r)
  if (shape === 'bubble') return 2 * youngLaplace(gamma, r, r)
  return youngLaplace(gamma, r, Infinity)
}

// ---------- 4.2 Capillary pressure and rise ----------

/** p_c = 2γ_lg cos δ / r_c, Pa. Negative for δ > 90°: capillary depression, the liquid must be pushed in. */
export const capillaryPressure = (gammaLG: number, delta: number, rc: number) => (2 * gammaLG * cosDeg(delta)) / rc

/** Jurin: h_c = 2γ_lg cos δ / (ρ_L g r_c), m. Negative for δ > 90° (capillary depression). */
export const jurinHeight = (gammaLG: number, delta: number, rc: number, rhoL = RHO_WATER) =>
  capillaryPressure(gammaLG, delta, rc) / (rhoL * G)

/** Jurin from the surface-energy change: h_c = 2Δγ_s / (ρ_L g r_c), Δγ_s = γ_sg − γ_sl. */
export const jurinFromEnergies = (gSG: number, gSL: number, rc: number, rhoL = RHO_WATER) => (2 * (gSG - gSL)) / (rhoL * G * rc)

// ---------- 4.4 Kelvin ----------

/** Kelvin: p/p₀ = exp(2V_mγ / (R T r)) with a signed radius r (m): > 1 over a convex drop, < 1 over a concave meniscus. */
export const kelvinRatio = (gamma: number, r: number, T: number, Vm = V_M_WATER) => Math.exp((2 * Vm * gamma) / (R_GAS * T * r))

/** General Kelvin: p/p₀ = exp[(V_mγ / RT)(1/r₁ + 1/r₂)]. */
export const kelvinGeneral = (gamma: number, r1: number, r2: number, T: number, Vm = V_M_WATER) =>
  Math.exp(((Vm * gamma) / (R_GAS * T)) * (1 / r1 + 1 / r2))

/** Radius of the (hemispherical) meniscus in a pore of radius r_c with contact angle δ: r = −r_c / cos δ (concave → negative). */
export const meniscusRadius = (rc: number, delta: number) => -rc / cosDeg(delta)

/** p/p₀ at which a pore of radius r_c (m) fills by capillary condensation (hemispherical meniscus). */
export const poreKelvinRatio = (gamma: number, rc: number, delta: number, T: number, Vm = V_M_WATER) =>
  delta === 90 ? 1 : kelvinRatio(gamma, meniscusRadius(rc, delta), T, Vm)

/** Largest pore radius (m) filled at relative pressure p/p₀ < 1, for a wetting pore (δ = 0): r_c = −2V_mγ/(RT ln(p/p₀)). */
export const kelvinPoreRadius = (ratio: number, gamma: number, T: number, Vm = V_M_WATER) =>
  (-2 * Vm * gamma) / (R_GAS * T * Math.log(ratio))
