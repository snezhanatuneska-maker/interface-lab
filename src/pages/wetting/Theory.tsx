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
              <Tex display tex={String.raw`\cos\theta_Y = \frac{\gamma_{SV} - \gamma_{SL}}{\gamma_{LV}}`} />
            </div>
          </div>
          <dl className="terms">
            <Term sym={String.raw`\theta_Y`}>Young contact angle</Term>
            <Term sym={String.raw`\gamma_{SV}`}>solid–vapor tension</Term>
            <Term sym={String.raw`\gamma_{SL}`}>solid–liquid tension</Term>
            <Term sym={String.raw`\gamma_{LV}`}>liquid–vapor tension (water: 72.0 mN/m at 25 °C)</Term>
          </dl>
          <p className="note">The three tensions balance along the surface at the contact line.</p>
        </div>

        <div className="card eq-card wet-wenzel">
          <h3>Wenzel: liquid fills the roughness</h3>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\cos\theta_W = r\,\cos\theta_Y`} />
            </div>
          </div>
          <dl className="terms">
            <Term sym={String.raw`\theta_W`}>apparent angle on the rough surface</Term>
            <Term sym="r">actual area ÷ projected area (≥ 1)</Term>
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
              <Tex display tex={String.raw`\cos\theta_{CB} = f_s(\cos\theta_Y + 1) - 1`} />
            </div>
          </div>
          <dl className="terms">
            <Term sym={String.raw`\theta_{CB}`}>apparent angle on the textured surface</Term>
            <Term sym="f_s">solid fraction under the drop (0–1); the rest is air</Term>
          </dl>
          <p className="note">Less solid contact gives a higher angle. This is how lotus leaves reach &gt; 150° with drops that roll
            off.</p>
        </div>
      </div>
    </section>
  )
}
