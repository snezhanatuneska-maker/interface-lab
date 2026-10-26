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
            <h3>Young–Laplace equation</h3>
          </div>
          <p className="note">Pressure jump across the curved meniscus in a cylindrical pore of radius r:</p>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`P_c = \frac{2\,\gamma\cos\theta}{r}`} />
            </div>
            <span className="formula-number">(1)</span>
          </div>
          <p className="note">
            γ: surface tension (water 72.0 mN/m at 25 °C); θ: contact angle through the liquid; r: pore radius. Jurin’s
            law follows by setting P<sub>c</sub> = ρgh:
          </p>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`h = \frac{2\,\gamma\cos\theta}{\rho\,g\,r}`} />
            </div>
            <span className="formula-number">(2)</span>
          </div>
        </div>

        <div className="card eq-card">
          <div className="eq-head">
            <h3>Kelvin equation</h3>
          </div>
          <p className="note">
            Governs capillary condensation, explaining vapor condensation at reduced relative pressures:
          </p>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`\ln\frac{P}{P_0} = \frac{-2\,\gamma\,V_\text{mol}\cos\theta}{r\,R\,T}`} />
            </div>
            <span className="formula-number">(3)</span>
          </div>
          <p className="note">
            V<sub>mol</sub>: molar volume of the liquid (water 18.07 cm³/mol); R: gas constant; T: temperature. The
            factor 2 is for a hemispherical meniscus (emptying); a pore filling through a cylindrical meniscus has
            factor 1. In real pores an adsorbed film of thickness t lines the wall first, so the pore radius is r + t.
          </p>
        </div>
      </div>
    </section>
  )
}
