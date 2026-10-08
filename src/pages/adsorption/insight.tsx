import type { ReactNode } from 'react'
import { BET_FIT_RANGE, kneeX, langmuirTheta, type Model } from '../../lib/adsorption'

const f2 = (v: number) => v.toFixed(2)

/** One-sentence explanation of what the current setting shows, shown under the controls. */
export function insight(mode: Model, x: number, K: number, c: number): ReactNode {
  if (x === 0) return 'No gas, no adsorption. Raise p/p₀.'

  if (mode === 'langmuir') {
    const theta = langmuirTheta(x, K)
    if (theta > 0.9) return `Plateau: ${Math.round(theta * 100)} % of sites taken. One molecule per site, so no more room.`
    if (theta < 0.5 && K < 1)
      return `Weak binding: half full only at p/p₀ = 1/K = ${f2(1 / K)}, above p₀. No plateau on this axis.`
    if (theta < 0.5) return `Low coverage: θ grows almost linearly. Half full at p/p₀ = 1/K = ${f2(1 / K)}.`
    return 'Over half full. Free sites get scarce, so the curve bends toward θ = 1.'
  }

  if (c < 2)
    return (
      <>
        C &lt; 2: no knee (type III), so no point B to read V<sub>m</sub> from.
      </>
    )
  const xB = kneeX(c)
  if (x < 0.8 * xB) return `Below B (p/p₀ ≈ ${f2(xB)}): the first layer is still filling.`
  if (x <= 1.25 * xB) return 'At B: about one monolayer’s worth. Some sites are bare, some already two deep.'
  if (x <= BET_FIT_RANGE[1]) return 'Past B, in the fit range: layers 2 and 3 grow, almost linearly.'
  if (x < 0.8) return 'The film keeps thickening. In mesopores, capillary condensation adds more here (type IV).'
  return 'Near p₀ the gas condenses: V → ∞.'
}
