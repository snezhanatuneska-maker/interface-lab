// Adsorption isotherm models. Everything is written in terms of the relative
// pressure x = P/P0 (0 ≤ x < 1) and returns a dimensionless loading:
// θ for Langmuir, n/nm for BET.

export type Model = 'langmuir' | 'bet'

/** Fixed model constants: Langmuir K (per unit P/P₀) and BET c. */
export const K_LANGMUIR = 10
export const C_BET = 50

/** Langmuir (monolayer) coverage θ = K·x / (1 + K·x). Bounded by 1. */
export function langmuirTheta(x: number, K: number): number {
  return (K * x) / (1 + K * x)
}

/** BET (multilayer) loading n/nm = c·x / [(1 − x)(1 − x + c·x)]. Diverges as x → 1. */
export function betLoading(x: number, c: number): number {
  return (c * x) / ((1 - x) * (1 - x + c * x))
}

/** Loading (θ or n/nm) of the given model. */
export function loading(model: Model, x: number, K: number, c: number): number {
  return model === 'langmuir' ? langmuirTheta(x, K) : betLoading(x, c)
}
