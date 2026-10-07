import { BET_FIT_RANGE, kneeX, langmuirTheta, type Model } from '../../lib/adsorption'

const f2 = (v: number) => v.toFixed(2)

/** One-sentence explanation of what the current setting shows, shown under the controls. */
export function insight(mode: Model, x: number, K: number, c: number): string {
  if (x === 0) return 'No gas, no adsorption. Raise p/p₀ to let molecules in.'

  if (mode === 'langmuir') {
    const theta = langmuirTheta(x, K)
    if (theta > 0.9)
      return `Plateau: ${Math.round(theta * 100)} % of the sites are taken. More pressure barely adds anything, because each site holds one molecule and there is no second layer.`
    if (theta < 0.5)
      return `Low coverage: θ still grows almost in proportion to pressure. Half the sites are taken at p/p₀ = 1/K = ${f2(1 / K)}.`
    return `More than half the sites are taken. Each new molecule is harder to place, because it must find one of the remaining free sites, so the curve bends towards θ = 1.`
  }

  if (c < 2)
    return 'C < 2: the solid holds the first layer no more strongly than the liquid holds itself, so no complete monolayer forms first. No knee (type III), and no point B to read Vₘ from.'
  const xB = kneeX(c)
  if (x < 0.8 * xB)
    return `Below point B (p/p₀ ≈ ${f2(xB)}): the first layer is still filling, and most new molecules land on bare solid, where they bind strongly.`
  if (x <= 1.25 * xB)
    return 'You are at point B, the knee: about one monolayer’s worth is adsorbed. Not one perfect layer, though: some sites are already two deep while a few are still bare.'
  if (x <= BET_FIT_RANGE[1])
    return 'Past point B, inside the BET fit range: the second and third layers are growing, and the curve rises gently and almost linearly.'
  if (x < 0.8)
    return 'Above the fit range the multilayer keeps thickening. In a real mesoporous sample, capillary condensation adds extra uptake here (a type IV isotherm, see below).'
  return 'Close to p₀ the film grows without limit: the gas is condensing into a liquid on the surface (V → ∞ as p → p₀).'
}
