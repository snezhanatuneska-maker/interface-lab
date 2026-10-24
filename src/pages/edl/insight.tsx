import type { ReactNode } from 'react'
import type { EdlState, Model } from '../../lib/edl'

/** One-sentence explanation of what the current setting shows, shown under the controls. */
export function insight(model: Model, psi0: number, s: EdlState): ReactNode {
  if (psi0 === 0) return 'No surface potential, no double layer: the ions stay at their bulk concentration.'
  if (model === 'gc' && psi0 > 120)
    return 'High potential in Gouy–Chapman: point-charge ions pile up at the surface, so the capacitance shoots up. Turn on Stern.'
  if (model === 'gc') return `The potential decays over about κ⁻¹ = ${s.debye.toFixed(2)} nm. Add salt to squeeze the layer.`
  const sternShare = (psi0 - s.psiD) / psi0
  if (sternShare > 0.5)
    return `${Math.round(sternShare * 100)} % of the potential drops across the Stern layer, so C_Stern sets C_tot.`
  return `Most of the potential is in the diffuse layer, so C_diffuse is the smaller capacitor and sets C_tot.`
}
