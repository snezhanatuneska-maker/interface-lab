export function Seeing() {
  return (
    <section className="section iso-text" aria-labelledby="seeing-title">
      <h2 id="seeing-title" className="section-title">
        What you are seeing
      </h2>
      <p>
        <strong>Why a double layer forms.</strong> A charged surface attracts ions of the opposite sign (counter-ions)
        and repels ions of the same sign (co-ions). Thermal motion fights this and spreads the ions out, so the
        surface charge is screened by a cloud rather than a single sheet.
      </p>
      <p>
        <strong className="gc-ink">Gouy–Chapman:</strong> ions are point charges in a diffuse layer. The potential
        falls off roughly exponentially, over a distance called the Debye length κ⁻¹.
      </p>
      <p>
        <strong>Salt and valency.</strong> More ions, or more highly charged ones, screen the surface faster. κ⁻¹
        scales as 1/√I with I = c₀z², so 100× more salt makes the layer 10× thinner, and a 2:2 salt halves it.
      </p>
    </section>
  )
}

export function Stern() {
  return (
    <section className="section iso-text" aria-labelledby="stern-title">
      <h2 id="stern-title" className="section-title">
        Where Gouy–Chapman fails, and the Stern fix
      </h2>
      <p>
        <strong>The flaw.</strong> Real ions have a finite (hydrated) size, so they cannot get infinitely close to the
        surface. Treating them as points lets the counter-ion concentration grow without limit, which predicts an
        unrealistically large capacitance at high potential. It also ignores the very strong field right at the
        surface, which orders the water and lowers its permittivity.
      </p>
      <p>
        <strong className="gcs-ink">Gouy–Chapman–Stern:</strong> the closest ions sit at the outer Helmholtz plane
        (OHP), one hydrated radius δ from the surface. Between the surface and the OHP there is no charge, so the
        potential drops linearly; beyond it the diffuse layer starts. The two act as capacitors in series, and the
        smaller one dominates.
      </p>
      <p className="note">
        Ions that lose part of their hydration shell can adsorb specifically at the inner Helmholtz plane (IHP), which
        can reduce or even reverse the potential. The zeta potential is measured at the slipping plane, just outside
        the Stern layer, so it is close to ψd.
      </p>
    </section>
  )
}

export function WhyItMatters() {
  return (
    <section className="section" aria-labelledby="why-title">
      <h2 id="why-title" className="section-title">
        Why it matters: supercapacitors
      </h2>
      <ul className="why-list">
        <li>
          <strong>Charge in the double layer.</strong> An electric double-layer capacitor stores charge in the EDL at
          carbon electrodes with ~1000–2000 m²/g of surface. At ~10 µF/cm², that is over 100 F per gram of carbon.
        </li>
        <li>
          <strong>Stern sets the limit.</strong> C_Stern and C_diffuse are in series, so the smaller one wins. With a
          concentrated electrolyte C_diffuse is large and C_tot ≈ C_Stern, which is why measured values sit near 5–30
          µF/cm².
        </li>
        <li>
          <strong>Concentrated electrolytes.</strong> 1 M salts keep κ⁻¹ well below 1 nm, so the diffuse layer stays
          thin and its capacitance high. (At such concentrations, and in ionic liquids, Gouy–Chapman no longer holds:
          finite ion size causes crowding and overscreening, but the capacitance stays limited by the Stern layer.)
        </li>
        <li>
          <strong>Pore size.</strong> Pores must at least admit the ions. When the pore size approaches κ⁻¹ the layers
          from opposite walls overlap, so the simple flat-wall picture fails. In pores below about 1 nm, ions that
          shed part of their solvation shell sit closer to the wall, and the capacitance per area actually rises
          (Chmiola et al., 2006).
        </li>
      </ul>
      <p className="prose note">
        The same interface, with charge transfer added, sits at every electrode in batteries, fuel cells and
        electrolysers.
      </p>
    </section>
  )
}
