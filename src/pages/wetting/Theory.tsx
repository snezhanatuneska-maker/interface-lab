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

export default function Theory() {
  return (
    <section className="section equations" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        Three models
      </h2>
      <div className="wet-eq-grid">
        <div className="card eq-card wet-young">
          <h3>Young: ideal smooth surface</h3>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\cos\delta = \frac{\gamma_{sg} - \gamma_{sl}}{\gamma_{lg}}`} />
            </div>
          </div>
          <dl className="terms">
            <Term sym={String.raw`\delta`}>contact angle (through liquid)</Term>
            <Term sym={String.raw`\gamma_{sg}`}>surface tension (interfacial energy) solid–gas</Term>
            <Term sym={String.raw`\gamma_{sl}`}>surface tension (interfacial energy) solid–liquid</Term>
            <Term sym={String.raw`\gamma_{lg}`}>surface tension liquid–gas (water: 72 mN/m)</Term>
          </dl>
          <p className="note">The three tensions balance along the surface at the contact line.</p>
        </div>

        <div className="card eq-card wet-wenzel">
          <h3>Wenzel: liquid fills the roughness</h3>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\cos\delta_\text{rough} = A_r\cos\delta_\text{smooth}`} />
            </div>
          </div>
          <dl className="terms">
            <Term sym={String.raw`\delta_\text{rough}`}>apparent contact angle on the rough surface</Term>
            <Term sym={String.raw`\delta_\text{smooth}`}>contact angle on the smooth surface (Young)</Term>
            <Term sym="A_r">ratio of true surface area to projected surface area of a rough surface (≥ 1)</Term>
          </dl>
          <p className="note">
            Roughness amplifies what the surface already is: below 90° it pulls liquid in (more wetting), above 90° it
            repels more.
          </p>
        </div>

        <div className="card eq-card wet-cassie">
          <h3>Cassie–Baxter: drop sits on trapped air</h3>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\begin{aligned} &\cos\delta_\text{rough} \\ &= f_\text{solid}(\cos\delta_\text{smooth} + 1) - 1 \end{aligned}`} />
            </div>
          </div>
          <dl className="terms">
            <Term sym={String.raw`\delta_\text{rough}`}>apparent contact angle on the textured surface</Term>
            <Term sym={String.raw`f_\text{solid}`}>
              solid fraction under the drop, <Tex tex={String.raw`A_\text{proj, solid}/(A_\text{proj, solid}+A_\text{proj, gas})`} />; the rest is gas
            </Term>
          </dl>
          <p className="note">Less solid contact gives a higher angle. This is how lotus leaves reach &gt; 150° with drops that roll
            off.</p>
        </div>
      </div>
    </section>
  )
}
