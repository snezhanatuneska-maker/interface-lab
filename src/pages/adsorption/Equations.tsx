import type { ReactNode } from 'react'
import Tex from '../../components/Tex'
import type { Model } from '../../lib/adsorption'

function Term({ sym, children }: { sym: string; children: ReactNode }) {
  return (
    <>
      <dt>
        <Tex tex={sym} />
      </dt>
      <dd>{children}</dd>
    </>
  )
}

const withX = <Tex display tex={String.raw`\text{with}\quad x = \frac{p}{p_0}`} />

export default function Equations({ mode }: { mode: Model }) {
  const lang = mode === 'langmuir'
  const bet = mode === 'bet'
  return (
    <section className="section equations" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        The equations
      </h2>
      <div className="eq-grid">
        <div className={`card eq-card lang${lang ? ' current' : ''}`}>
          <div className="eq-head">
            <h3>Langmuir isotherm (monolayer)</h3>
            {lang && <span className="tag">shown above</span>}
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\theta = \frac{V}{V_m} = \frac{K\,x}{1 + K\,x}`} />
              {withX}
            </div>
            <span className="formula-number">(1)</span>
          </div>
          <dl className="terms">
            <Term sym={String.raw`\theta`}>
              share of sites taken (0 = empty, 1 = full layer)
            </Term>
            <Term sym="V">amount adsorbed, cm³(STP)/g</Term>
            <Term sym="V_m">amount in one full layer</Term>
            <Term sym="K">
              binding strength (adsorption ÷ desorption rate). Higher K = fills at lower pressure
            </Term>
          </dl>
          <p className="note">
            Straight line: slope 1/V<sub>m</sub>, intercept 1/(K·V<sub>m</sub>).
          </p>
          <div className="formula-body eq-math">
            <Tex display tex={String.raw`\frac{x}{V} = \frac{1}{K\,V_m} + \frac{x}{V_m}`} />
          </div>
          <p className="note">
            Usually written θ = K′p/(1 + K′p). Here K = K′p₀, so both models share the p/p₀ axis.
          </p>
          <h4>Assumptions</h4>
          <ul className="assumptions">
            <li>one molecule per site: one layer</li>
            <li>all sites identical</li>
            <li>no interaction between neighbours</li>
          </ul>
        </div>

        <div className={`card eq-card bet${bet ? ' current' : ''}`}>
          <div className="eq-head">
            <h3>BET isotherm (multilayer)</h3>
            {bet && <span className="tag">shown above</span>}
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\frac{V}{V_m} = \frac{C\,x}{(1 - x)\,(1 - x + C\,x)}`} />
              {withX}
            </div>
            <span className="formula-number">(2)</span>
          </div>
          <dl className="terms">
            <Term sym="V">
              amount adsorbed, cm³(STP)/g
            </Term>
            <Term sym="V_m">amount in one full layer</Term>
            <Term sym="V/V_m">layers’ worth adsorbed (can exceed 1)</Term>
            <Term sym="p_0">saturation pressure: the gas condenses here</Term>
            <Term sym="C">
              how much more strongly layer 1 binds than the rest:{' '}
              <Tex tex={String.raw`C \approx \exp\!\left(\frac{E_1 - E_L}{RT}\right)`} />
            </Term>
          </dl>
          <h4>Assumptions</h4>
          <ul className="assumptions">
            <li>each layer is a Langmuir layer for the next; no limit</li>
            <li>layer 1 binds to the solid (E₁)</li>
            <li>higher layers bind like a liquid (E<sub>L</sub>)</li>
            <li>no interaction between neighbours</li>
          </ul>
        </div>
      </div>
      <p className="callout">
        <strong>In short:</strong> Langmuir stops at V = V<sub>m</sub>. BET has a knee when layer 1 fills, then rises
        steeply toward p₀.
      </p>
    </section>
  )
}
