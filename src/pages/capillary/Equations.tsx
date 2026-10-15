import type { ReactNode } from 'react'
import Tex from '../../components/Tex'

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

export default function Equations() {
  return (
    <section className="section equations" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        The equations
      </h2>
      <div className="eq-grid">
        <div className="card eq-card">
          <div className="eq-head">
            <h3>Young–Laplace (capillary pressure)</h3>
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`P_c = p_{\text{gas}} - p_{\text{liquid}} = \frac{2\,\gamma\cos\theta}{r}`} />
            </div>
            <span className="formula-number">(1)</span>
          </div>
          <dl className="terms">
            <Term sym="P_c">pressure jump across the meniscus</Term>
            <Term sym={String.raw`\gamma`}>surface tension (water: 0.072 N/m)</Term>
            <Term sym={String.raw`\theta`}>contact angle between liquid and wall</Term>
            <Term sym="r">pore radius</Term>
          </dl>
          <p className="note">
            θ &lt; 90°: P<sub>c</sub> &gt; 0, the pore sucks liquid in. θ &gt; 90°: P<sub>c</sub> &lt; 0, it has to be
            pushed in.
          </p>
          <h4>Assumptions</h4>
          <ul className="assumptions">
            <li>cylindrical pore, hemispherical meniscus</li>
            <li>bulk surface tension, even in nanopores</li>
            <li>one contact angle (no hysteresis)</li>
          </ul>
        </div>

        <div className="card eq-card">
          <div className="eq-head">
            <h3>Jurin’s law (capillary rise)</h3>
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`h = \frac{2\,\gamma\cos\theta}{\rho\,g\,r} = \frac{P_c}{\rho\,g}`} />
            </div>
            <span className="formula-number">(2)</span>
          </div>
          <dl className="terms">
            <Term sym="h">height of the column above the reservoir</Term>
            <Term sym={String.raw`\rho`}>liquid density</Term>
            <Term sym="g">9.81 m/s²</Term>
          </dl>
          <p className="note">
            The rise stops where the weight of the column balances P<sub>c</sub>. A 1 µm pore lifts water ~15 m.
          </p>
          <h4>Assumptions</h4>
          <ul className="assumptions">
            <li>vertical tube, liquid at rest</li>
            <li>meniscus small compared with h</li>
          </ul>
        </div>
      </div>
      <p className="callout">
        <strong>In short:</strong> P<sub>c</sub> ∝ cos θ / r. Small pores and wetting walls pull hard; above 90° the sign
        flips.
      </p>
    </section>
  )
}
