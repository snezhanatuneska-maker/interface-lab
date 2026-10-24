import { DlvoTryThis } from './DlvoTryThis'
import { DlvoTheory } from './DlvoTheory'
import { DlvoEquations } from './DlvoEquations'
import { DlvoInsight } from './DlvoInsight'

export function DlvoPage() {
  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>DLVO Theory & Colloid Stability</h1>
        <p className="lede">
          Explore how electrolyte concentration and ion valency control the energy barrier, primary and secondary
          minima, and critical coagulation concentration in battery and catalyst slurries.
        </p>
      </header>

      <DlvoTryThis />
      <DlvoTheory />
      <DlvoEquations />
      <DlvoInsight />
    </article>
  )
}
