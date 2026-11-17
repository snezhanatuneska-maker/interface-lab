import Tex from '../../components/Tex'

export function MipsEquations() {
  return (
    <section className="section" aria-labelledby="eq-title">
      <h2 id="eq-title" className="section-title">
        Core Physical Principles & Equations
      </h2>
      <div className="eq-grid">
        <div className="card eq-card">
          <h3>The Washburn Equation</h3>
          <p>
            Relates the applied pressure (<em>p</em>) to the pore radius (<em>r</em><sub>c</sub>) and the mercury
            surface tension (<em>γ</em>):
          </p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`p = -\frac{2\gamma\cos\delta}{r_c}`} />
            </div>
            <span className="formula-number">(1)</span>
          </div>
          <p className="note">
            For a cylindrical pore of radius r<sub>c</sub> (diameter d = 2r<sub>c</sub>, so d = −4γ cos δ/p). Mercury:
            γ = 0.485 N/m and δ ≈ 130–140° (140° assumed here), so cos δ &lt; 0 and p &gt; 0. Rule of thumb: d [nm] ≈
            1490/p [MPa].
          </p>
        </div>
        <div className="card eq-card">
          <h3>Work of Intrusion</h3>
          <p>
            The mechanical work required to force non-wetting mercury into pore volumes (<em>V</em>):
          </p>
          <div className="formula">
            <div className="formula-body">
              <Tex display tex={String.raw`W = \int p\,dV`} />
            </div>
            <span className="formula-number">(2)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
