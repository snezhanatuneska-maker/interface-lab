import Tex from '../../components/Tex'

export default function Equations() {
  return (
    <section className="section equations" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        Core physical principles
      </h2>
      <div className="eq-grid">
        <div className="card eq-card">
          <div className="eq-head">
            <h3>Capillary pressure and Jurin</h3>
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`p_c = \frac{2\gamma_{lg}\cos\delta}{r_c}`} />
            </div>
            <span className="formula-number">(1)</span>
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`h_c = \frac{2\gamma_{lg}\cos\delta}{\rho_L g r_c}`} />
            </div>
            <span className="formula-number">(2)</span>
          </div>
          <p className="note">
            γ<sub>lg</sub>: surface tension liquid–gas; δ: contact angle (through liquid); r<sub>c</sub>: capillary
            radius; ρ<sub>L</sub>: liquid density; g: gravitational acceleration.
          </p>
        </div>

        <div className="card eq-card">
          <div className="eq-head">
            <h3>Kelvin equation</h3>
          </div>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`p = p_0\exp\left(\frac{2V_m\gamma}{RTr}\right)`} />
            </div>
            <span className="formula-number">(3)</span>
          </div>
          <p className="note">
            p, p<sub>0</sub>: vapour pressure over the curved and the flat surface; V<sub>m</sub>: molar volume; R: gas
            constant; T: temperature; r: radius of curvature, signed. A convex droplet has r &gt; 0, so p &gt; p
            <sub>0</sub>; a concave meniscus in a wetting pore has r &lt; 0, so p &lt; p<sub>0</sub>, and for a pore
            with contact angle δ the meniscus radius is r = −r<sub>c</sub>/cos δ. Kelvin is approximate in pores of only
            a few nm.
          </p>
        </div>
      </div>
    </section>
  )
}
