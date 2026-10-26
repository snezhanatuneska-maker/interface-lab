import Tex from '../../components/Tex'

export function ZetaEquations() {
  return (
    <section className="section" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        Core Physical Principles & Equations
      </h2>
      <div className="eq-grid">
        <div className="card eq-card">
          <h3>Henry's / Smoluchowski Equation</h3>
          <p>
            Relates particle electrophoretic mobility (<em>u<sub>e</sub></em>) to zeta potential (<em>ζ</em>); ε =
            ε₀ε<sub>r</sub> and η are the permittivity and viscosity of the liquid. Henry’s general form, with f(κa)
            between 1 (Hückel, thick double layer, κa ≪ 1) and 1.5 (Smoluchowski, thin double layer, κa ≫ 1):
          </p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`u_e = \frac{2\,\varepsilon\,\zeta}{3\,\eta}\,f(\kappa a)`} />
            </div>
          </div>
          <p>For κa ≫ 1 (most particles in water) this becomes Smoluchowski:</p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`u_e = \frac{\varepsilon\,\zeta}{\eta}`} />
            </div>
            <span className="formula-number">(1)</span>
          </div>
        </div>
        <div className="card eq-card">
          <h3>Electrostatic Stabilization</h3>
          <p>
            Particles remain stably dispersed when electrostatic repulsion (high absolute <em>ζ</em>) overcomes van der
            Waals attraction. A common rule of thumb (it depends on salt concentration and particle size):
          </p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`|\zeta| > 30\ \text{mV}\ \text{(Stable)}`} />
              <Tex display tex={String.raw`\zeta \approx 0\ \text{(Agglomeration)}`} />
            </div>
            <span className="formula-number">(2)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
