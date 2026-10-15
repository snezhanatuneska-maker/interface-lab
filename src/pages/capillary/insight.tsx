import type { ReactNode } from 'react'
import { capillaryPressure } from '../../lib/capillary'

const sig = (v: number) => Number(v.toPrecision(2)).toString()

/** One-sentence explanation of what the current setting shows, shown under the controls. */
export function insight(r: number, theta: number): ReactNode {
  const pc = capillaryPressure(r, theta)
  if (Math.abs(theta - 90) < 0.5) return 'θ = 90°: the meniscus is flat, so there is no pressure jump and no rise.'
  if (theta > 90)
    return `Non-wetting: the liquid has to be pushed in with ${sig(-pc)} MPa. This is how mercury porosimetry and PTFE-treated gas diffusion layers work.`
  if (r < 2) return `Micropore: ${sig(pc)} MPa of suction, hundreds of atmospheres. Here the pore is only a few molecules wide, so Young–Laplace is only a rough guide.`
  if (r <= 50) return `Mesopore: ${sig(pc)} MPa of suction. Water wicks in strongly, and vapour condenses here below p₀ (see Figure 2).`
  return `Macropore: only ${sig(pc)} MPa. Halve r and the pressure doubles: P_c ∝ 1/r.`
}
