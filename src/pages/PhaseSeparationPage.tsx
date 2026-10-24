import { useEffect, useState } from 'react'
import Tex from '../components/Tex'
import { useThemeColors } from '../lib/themeColors'
import PhaseDiagram from './phase/PhaseDiagram'
import ProfileAnimation from './phase/ProfileAnimation'
import NucleationBarrier from './phase/NucleationBarrier'
import PhaseQuiz from './phase/PhaseQuiz'

const NARROW = '(max-width: 600px)'
function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW).matches)
  useEffect(() => {
    const mq = window.matchMedia(NARROW)
    const onChange = () => setNarrow(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return narrow
}

const COMPARE: [string, string, string][] = [
  ['Trigger needed?', 'Yes: a nucleus must form', 'No: starts on its own'],
  ['Energy barrier?', 'Yes, ΔG*', 'None'],
  ['Composition change', 'Large and localized', 'Small and spread out at first'],
  ['Interface', 'Sharp from the start', 'Diffuse, sharpens later'],
  ['Resulting structure', 'Isolated droplets', 'Interconnected network'],
]

export default function PhaseSeparationPage() {
  const theme = useThemeColors()
  const narrow = useNarrow()

  return (
    <article className="page">
      <header className="page-intro compact">
        <a className="back-link" href="#/">
          ← All tools
        </a>
        <h1>Phase Separation: Nucleation vs Spinodal Decomposition</h1>
        <p className="lede">
          A homogeneous mixture becomes unstable and splits into an x₁-rich and an x₂-rich phase. There are two ways
          it can happen, and the phase diagram tells you which one occurs.
        </p>
      </header>

      <PhaseDiagram theme={theme} narrow={narrow} />

      <section className="section iso-text" aria-labelledby="model-title">
        <h2 id="model-title" className="section-title">
          The model
        </h2>
        <p className="prose">
          A regular solution, with χ = 2·T<sub>c</sub>/T. The binodal follows from the common tangent, the spinodal
          from the inflection points.
        </p>
        <div className="formula">
          <div className="formula-body eq-math">
            <Tex display tex={String.raw`\frac{G_\text{mix}}{kT} = x\ln x + (1-x)\ln(1-x) + \chi\,x(1-x)`} />
            <Tex
              display
              tex={String.raw`\text{binodal: } \ln\frac{x}{1-x} + \chi(1-2x) = 0`}
            />
            <Tex display tex={String.raw`\text{spinodal: } x = \tfrac12 \pm \tfrac12\sqrt{1 - 2/\chi}`} />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="anim-title">
        <h2 id="anim-title" className="section-title">
          Two ways to separate
        </h2>
        <p className="prose">
          Press Play. Nucleation makes a few sharp nuclei with depleted zones around them. Spinodal decomposition
          amplifies small fluctuations everywhere, by diffusion uphill, until they reach x₁ and x₂.
        </p>
        <ProfileAnimation theme={theme} />
        <div className="table-wrap phase-compare">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col" />
                <th scope="col" className="nuc-ink">
                  Nucleation &amp; growth
                </th>
                <th scope="col" className="spin-ink">
                  Spinodal decomposition
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([k, a, b]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{a}</td>
                  <td>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <NucleationBarrier theme={theme} narrow={narrow} />

      <section className="section" aria-labelledby="why-title">
        <h2 id="why-title" className="section-title">
          Why it matters
        </h2>
        <ul className="why-list">
          <li>
            <strong>LiFePO₄ battery cathodes.</strong> During charging and discharging the material separates into
            Li-rich and Li-poor phases. Fast cycling and small particles shift it between nucleation-type and
            spinodal-type separation, which affects rate capability and stress.
          </li>
          <li>
            <strong>Porous membranes by phase inversion.</strong> For separators and electrolyser or fuel-cell
            membranes, the polymer solution is pushed into the two-phase region. Nucleation gives closed cellular pores;
            spinodal decomposition gives an interconnected, bicontinuous pore network.
          </li>
          <li>
            <strong>Catalyst nanoparticle synthesis.</strong> For Pt in fuel cells, a short burst at high
            supersaturation S gives many nuclei with a small d*. The result is many small, uniform particles and a high
            surface area.
          </li>
        </ul>
      </section>

      <PhaseQuiz />
    </article>
  )
}
