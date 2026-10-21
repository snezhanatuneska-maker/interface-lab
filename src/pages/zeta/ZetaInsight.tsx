import React from 'react';

export const ZetaInsight: React.FC = () => {
  return (
    <div className="bg-emerald-50/60 border border-emerald-200 border-l-4 border-l-emerald-600 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-emerald-900 mb-2 flex items-center gap-2">
        <span>⚡</span> Clean Energy Link: Controlling Dispersion of Catalyst & Electrode Particles
      </h3>
      <p className="text-sm text-emerald-800 leading-relaxed">
        In manufacturing proton-exchange membrane fuel cells (PEMFCs) and water electrolyzers, platinum-on-carbon catalyst nanoparticles must be dispersed uniformly in solvent inks. 
        Managing zeta potential (P<sub>c</sub> and ζ) is vital: if the pH of the ink is near the isoelectric point (IEP), zero zeta potential causes severe particle agglomeration, starving active sites of reactant gases (O<sub>2</sub> or H<sub>2</sub>). 
        Tuning ink pH ensures high positive or negative zeta potential, stabilizing the suspension for uniform, high-efficiency electrode coating.
      </p>
    </div>
  );
};
