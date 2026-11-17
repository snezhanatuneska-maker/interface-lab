// Surface tension (lecture section 2): the lecture's table and the two force methods, in compendium notation.

export const G = 9.81 // m/s²

export interface FluidTension {
  fluid: string
  /** °C */
  T: number
  /** mN/m */
  gamma: number
  /** Boiling point, °C */
  boil: number
  metal?: boolean
}

/** Lecture values; γ scales with the strength of the intermolecular forces. */
export const SURFACE_TENSIONS: FluidTension[] = [
  { fluid: 'Pentane', T: 20, gamma: 16.0, boil: 36.1 },
  { fluid: 'Hexane', T: 20, gamma: 18.4, boil: 68.7 },
  { fluid: 'Heptane', T: 20, gamma: 20.1, boil: 98.4 },
  { fluid: 'Ethanol', T: 20, gamma: 22.3, boil: 78.3 },
  { fluid: 'Toluene', T: 20, gamma: 28.5, boil: 110.6 },
  { fluid: 'Water', T: 20, gamma: 71.3, boil: 100 },
  { fluid: 'Hg', T: 20, gamma: 484, boil: 356.6, metal: true },
  { fluid: 'Gold', T: 1200, gamma: 1070, boil: 2600, metal: true },
  { fluid: 'Platinum', T: 2000, gamma: 1800, boil: 4300, metal: true },
]

/** Wilhelmy plate: F = γ P cos δ with wetted perimeter P = 2(width + thickness). SI units; δ = 0 for a clean plate. */
export const wilhelmyForce = (gamma: number, width: number, thickness: number, delta = 0) =>
  gamma * 2 * (width + thickness) * Math.cos((delta * Math.PI) / 180)

/** Du Noüy ring: F = γ π (d_outer + d_inner), two contact lines. SI units. */
export const duNouyForce = (gamma: number, dOuter: number, dInner: number) => gamma * Math.PI * (dOuter + dInner)
