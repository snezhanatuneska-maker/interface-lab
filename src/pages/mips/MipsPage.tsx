import { MipsTryThis } from './MipsTryThis'
import { MipsTheory } from './MipsTheory'
import { MipsEquations } from './MipsEquations'
import { MipsInsight } from './MipsInsight'

export function MipsPage() {
  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Mercury Intrusion Porosimetry (MIP)</h1>
        <p className="lede">
          Explore how high-pressure non-wetting mercury intrusion reveals pore-size distributions, threshold radii, and
          void volumes in porous electrodes.
        </p>
      </header>

      <MipsTryThis />
      <MipsTheory />
      <MipsEquations />
      <MipsInsight />
    </article>
  )
}
