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
          <p className="note">Defines the pressure jump across a curved liquid-gas interface inside confinements:</p>
          <div className="formula">
            <div className="formula-body eq-math">
              <Tex display tex={String.raw`P_c = \frac{2\,\gamma\cos\theta}{r}`} />
            </div>
            <span className="formula-number">(1)</span>
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
              <Tex display tex={String.raw`\ln\frac{P}{P_0} = \frac{-2\,\gamma\,V_m\cos\theta}{r\,R\,T}`} />
            </div>
            <span className="formula-number">(2)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
