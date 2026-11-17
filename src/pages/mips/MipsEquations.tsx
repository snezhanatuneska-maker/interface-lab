import Tex from '../../components/Tex'

export function MipsEquations() {
  return (
    <section className="section" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        Young–Laplace (cylindrical pore) applied to mercury intrusion
      </h2>
      <div className="eq-grid">
        <div className="card eq-card">
          <h3>Entry pressure of a pore</h3>
          <p>
            For a non-wetting liquid the capillary pressure is negative, so mercury enters a cylindrical pore of radius
            r<sub>c</sub> only when the applied pressure p reaches
          </p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`p_c = -\frac{2\gamma\cos\delta}{r_c}`} />
            </div>
            <span className="formula-number">(1)</span>
          </div>
          <p className="note">
            γ: surface tension of mercury (0.485 N/m); δ: contact angle (through the mercury), about 130–140° (140°
            assumed here), so cos δ &lt; 0 and p<sub>c</sub> &gt; 0 is the pressure that must be applied.
          </p>
        </div>
        <div className="card eq-card">
          <h3>Pore diameter from the pressure</h3>
          <p>With d = 2r<sub>c</sub>, the smallest pore diameter filled at the applied pressure p is</p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`d = -\frac{4\gamma\cos\delta}{p}`} />
            </div>
            <span className="formula-number">(2)</span>
          </div>
          <p className="note">Rule of thumb for mercury: d [nm] ≈ 1490/p [MPa].</p>
        </div>
      </div>
      <p className="note prose">
        Mercury intrusion porosimetry was first reported by Edward Washburn in 1921.
      </p>
    </section>
  )
}
