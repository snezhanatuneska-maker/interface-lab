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
            Mercury does not spontaneously wet most solids, exhibiting a contact angle greater than 90
            degrees (<em>θ &gt; 90°</em>). External pressure is required to force it into pores.
          </p>
        </div>
        <div>
          <h3>The Washburn Equation</h3>
          <p>
            Pressure (<em>P</em>) is inversely proportional to the entry pore radius (<em>r</em>). Smaller nanopores
            require immense hydraulic pressures to intrude.
          </p>
        </div>
        <div>
          <h3>Pore-Size Distribution</h3>
          <p>
            By recording cumulative mercury volume vs. applied pressure, porosimeters generate comprehensive pore-size
            distributions, distinguishing macro-, meso-, and micro-pore networks.
          </p>
        </div>
      </div>
    </section>
  )
}
