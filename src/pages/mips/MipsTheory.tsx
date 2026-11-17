export function MipsTheory() {
  return (
    <section className="section" aria-labelledby="theory-title">
      <h2 id="theory-title" className="section-title">
        Non-Wetting Intrusion & Pore Analysis
      </h2>
      <div className="concept-grid">
        <div>
          <h3>Non-Wetting Behavior</h3>
          <p>
            Mercury is non-wetting for almost all materials (<em>δ ≈ 130–140°</em>). Its capillary pressure is
            negative, so an external pressure is needed to force it into pores, the opposite of drainage of a wetting
            liquid in the capillary pressure curve.
          </p>
        </div>
        <div>
          <h3>Pressure and pore size</h3>
          <p>
            By Young–Laplace for a cylindrical pore, the pressure (<em>p</em>) needed to enter a pore is inversely
            proportional to its radius (<em>r</em><sub>c</sub>). Smaller pores need higher pressures.
          </p>
        </div>
        <div>
          <h3>Pore-Size Distribution</h3>
          <p>
            By recording cumulative mercury volume vs. applied pressure, porosimeters give the distribution of pore{' '}
            <em>entry</em> (throat) diameters for macropores and mesopores, assuming cylindrical pores. A large cavity
            reachable only through a narrow neck is counted at the neck size (ink-bottle effect), and some mercury stays
            trapped in it on extrusion. At the usual maximum of about 400 MPa mercury reaches pores of
            about 3–4 nm diameter; micropores (&lt; 2 nm) need gas adsorption instead.
          </p>
        </div>
      </div>
    </section>
  )
}
