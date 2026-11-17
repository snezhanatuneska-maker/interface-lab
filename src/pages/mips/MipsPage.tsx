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
          Mercury intrusion is an application of the capillary pressure curve (lecture 4.3). Mercury is non-wetting, so
          it must be pushed into a pore system; the pressure at which it enters tells the pore size, and the intruded
          volume against pressure gives the pore-size distribution.
        </p>
        <p className="note">
          Background: <a href="#/capillary">Curved Interfaces &amp; Capillarity</a> (Young–Laplace, capillary pressure
          curve).
        </p>
      </header>

      <MipsTryThis />
      <MipsTheory />
      <MipsEquations />
      <MipsInsight />
    </article>
  )
}
