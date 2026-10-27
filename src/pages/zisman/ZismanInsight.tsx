import React from 'react';

export const ZismanInsight: React.FC = () => {
  return (
    <section className="section" aria-labelledby="zisman-why-title">
      <h2 id="zisman-why-title" className="section-title">
        <span>⚡</span> Clean Energy Link: Choosing Coatings and Membranes with the Right Wettability
      </h2>
      <p className="prose">
        In proton-exchange membrane (PEM) fuel cells, the gas diffusion layers (GDLs) are impregnated with PTFE to lower their surface energy.
        If water wetted the pore walls (θ &lt; 90°, which on the Zisman line already happens once γ<sub>c</sub> is well below water’s 72 mN/m), capillary suction would pull product water into the pores and block the oxygen (O<sub>2</sub>) supply to the cathode catalyst.
        PEM water electrolysers need the opposite at the anode: water is the reactant there, so the titanium porous transport layer is kept hydrophilic, and the O<sub>2</sub> produced has to escape through it.
      </p>
    </section>
  );
};
