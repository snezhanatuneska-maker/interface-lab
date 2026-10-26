import React from 'react';

export const SurfaceExplorerInsight: React.FC = () => {
  return (
    <section className="section" aria-labelledby="surface-why-title">
      <h2 id="surface-why-title" className="section-title">
        <span>⚡</span> Clean Energy Link: How Catalyst and Electrode Surfaces are Characterised in Practice
      </h2>
      <p className="prose">
        In real-world fuel-cell and electrolyzer research, no single technique tells the whole story. 
        Researchers use SEM to inspect catalyst layer cracking and carbon support distribution over wide areas, cross-sectional SEM for catalyst layer thickness, AFM to measure surface roughness and (in phase or conductive modes) the ionomer distribution, and XPS to confirm platinum oxidation states and alloy surface segregation within the top few nanometers where electrochemical reactions actually occur.
      </p>
    </section>
  );
};
