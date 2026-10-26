import React from 'react';

export const SurfaceExplorerEquations: React.FC = () => {
  return (
    <section className="section" aria-labelledby="surface-eq-title">
      <h2 id="surface-eq-title" className="section-title">Core Physical Principles & Equations</h2>
      <div className="eq-grid">
        <div className="card eq-card">
          <h3>The Photoelectric Effect (XPS)</h3>
          <p>Relates incoming X-ray photon energy (<em>h&nu;</em>) to photoelectron kinetic energy (<em>E<sub>k</sub></em>) and core binding energy (<em>E<sub>b</sub></em>, relative to the Fermi level); <em>&Phi;</em> is the work function of the spectrometer:</p>
          <div className="formula">
            <div className="formula-body formula-text">
              E<sub>b</sub> = h&nu; - E<sub>k</sub> - &Phi;
            </div>
          </div>
        </div>
        <div className="card eq-card">
          <h3>Information Depth (~1–10 nm)</h3>
          <p>Governed by the photoelectron inelastic mean free path (<em>&lambda;</em>, about 0.5–3 nm). Signal from depth <em>d</em> is attenuated as below, with <em>&theta;</em> the emission angle from the surface normal; 95 % comes from the top 3&lambda;&nbsp;cos&nbsp;&theta;:</p>
          <div className="formula">
            <div className="formula-body formula-text">
              I = I<sub>0</sub> &middot; exp(-d / (&lambda; &middot; cos(&theta;)))
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
