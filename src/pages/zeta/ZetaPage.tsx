import { ZetaTryThis } from './ZetaTryThis'
import { ZetaTheory } from './ZetaTheory'
import { ZetaEquations } from './ZetaEquations'
import { ZetaInsight } from './ZetaInsight'

export function ZetaPage() {
  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Zeta Potential & Isoelectric Point</h1>
        <p className="lede">
          Explore how pH titration controls surface charge, slipping planes, electrophoretic mobility, and particle
          dispersion stability in catalyst inks.
        </p>
      </header>

      <ZetaTryThis />
      <ZetaTheory />
      <ZetaEquations />
      <ZetaInsight />
    </article>
  )
}
