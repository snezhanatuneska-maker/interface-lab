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
            <h3>Capillary pressure (Young–Laplace)</h3>
          </div>
          <p className="note">Pressure jump across the curved meniscus in a cylindrical capillary of radius r<sub>c</sub>:</p>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`p_c = \frac{2\gamma_{lg}\cos\delta}{r_c}`} />
            </div>
            <span className="formula-number">(1)</span>
          </div>
          <p className="note">
            γ<sub>lg</sub>: surface tension liquid–gas (water 72 mN/m); δ: contact angle (through liquid); r<sub>c</sub>:
            capillary radius. Jurin’s law follows by setting p<sub>c</sub> = ρ<sub>L</sub>gh<sub>c</sub>:
          </p>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`h_c = \frac{2\gamma_{lg}\cos\delta}{\rho_L g r_c}`} />
            </div>
            <span className="formula-number">(2)</span>
          </div>
        </div>

        <div className="card eq-card">
          <div className="eq-head">
            <h3>Kelvin equation</h3>
          </div>
          <p className="note">
            Governs capillary condensation, explaining vapour condensation at reduced relative pressures:
          </p>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\ln\frac{p}{p_0} = -\frac{2V_m\gamma\cos\delta}{R T r_c}`} />
            </div>
            <span className="formula-number">(3)</span>
          </div>
          <p className="note">
            V<sub>m</sub>: molar volume of the liquid (water 18 cm³/mol); R: gas constant; T: temperature. The
            factor 2 is for a hemispherical meniscus (emptying); a pore filling through a cylindrical meniscus has
            factor 1; the readout switches with the filling/emptying mode. In real pores an adsorbed film of thickness t
            lines the wall first, so the pore radius is r<sub>c</sub> + t; the readout neglects t and uses the slider
            r<sub>c</sub>. The Kelvin equation with the bulk γ is reliable only in mesopores wider than a few nm: near
            2 nm it is at best approximate, and below 2 nm (micropores) pores fill by micropore filling instead.
          </p>
        </div>
      </div>
    </section>
  )
}
