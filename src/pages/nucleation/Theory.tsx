export function Concept() {
  return (
    <section className="section iso-text" aria-labelledby="concept-title">
      <h2 id="concept-title" className="section-title">
        The idea
      </h2>
      <p>
        A new phase (a droplet, a crystal, a bubble) starts as a tiny cluster. Its inside is more stable than the
        old phase, but its surface costs energy. Small clusters are mostly surface, so they dissolve again; only a
        cluster larger than a critical size d* keeps growing. Getting there means climbing an energy barrier ΔG*.
      </p>
      <p>
        <strong className="hom-ink">Homogeneous nucleation</strong> happens in the bulk: the cluster has to build all
        of its interface itself.
      </p>
      <p>
        <strong className="het-ink">Heterogeneous nucleation</strong> happens on a surface, an impurity or a wall. The
        surface replaces part of the costly new interface, so the barrier drops. How much depends on how well the
        nucleus wets the surface, through the contact angle θ.
      </p>
    </section>
  )
}

export function WhatToNotice() {
  return (
    <section className="section" aria-labelledby="notice-title">
      <h2 id="notice-title" className="section-title">
        What to notice
      </h2>
      <ul className="why-list">
        <li>
          <strong>Same d*, lower peak.</strong> Both curves peak at the same diameter; the surface only scales the
          height by f(θ).
        </li>
        <li>
          <strong>Supersaturation shrinks everything.</strong> Raising S makes d* smaller (∝ 1/ln S) and the barrier
          much smaller (∝ 1/(ln S)²).
        </li>
        <li>
          <strong>γ matters most.</strong> Doubling γ raises the barrier 8×, because ΔG* ∝ γ³.
        </li>
        <li>
          <strong>Exponential switch.</strong> In the rate plot the heterogeneous curve switches on at a much lower S. A
          barrier drop of 70 kT means about 30 orders of magnitude in rate. Growth follows once a nucleus passes d*.
        </li>
      </ul>
    </section>
  )
}

export function CepRelation() {
  return (
    <section className="section" aria-labelledby="cep-title">
      <h2 id="cep-title" className="section-title">
        Why it matters: bubbles on electrolyser electrodes
      </h2>
      <p className="prose">
        In a water electrolyser for green hydrogen, H₂ and O₂ are produced at the electrodes and first dissolve, so
        the liquid next to the electrode becomes strongly supersaturated. Bubbles almost never form homogeneously in
        the liquid: they nucleate heterogeneously on the electrode, at defects, pits and hydrophobic spots.
      </p>
      <p className="prose">
        <strong>Mind the angle.</strong> In this tool θ is measured through the nucleus, here the gas. Wettability is
        usually quoted through the liquid, and θ<sub>gas</sub> = 180° − θ<sub>liquid</sub>. A hydrophobic spot with
        θ<sub>liquid</sub> = 120° gives θ<sub>gas</sub> = 60° and f = 0.16: the barrier drops more than 6×, so bubbles
        form there first. A hydrophilic spot (θ<sub>liquid</sub> = 30°, θ<sub>gas</sub> = 150°) gives f ≈ 0.99,
        almost no help.
      </p>
      <p className="prose">
        <strong>Engineering consequence.</strong> Bubbles stuck to the electrode block active area and raise the
        overpotential. Electrode wettability and surface structure are therefore designed to control where bubbles
        nucleate and how quickly they detach.
      </p>
    </section>
  )
}
