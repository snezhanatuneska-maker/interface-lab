import React from 'react';

export const ZismanInsight: React.FC = () => {
  return (
    <div className="bg-emerald-50/60 border border-emerald-200 border-l-4 border-l-emerald-600 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-emerald-900 mb-2 flex items-center gap-2">
        <span>⚡</span> Clean Energy Link: Choosing Coatings and Membranes with the Right Wettability
      </h3>
      <p className="text-sm text-emerald-800 leading-relaxed">
        In proton-exchange membrane (PEM) fuel cells and water electrolyzers, gas diffusion layers (GDLs) must be impregnated with hydrophobic polymers like PTFE (Teflon) to maintain proper surface energy. 
        If the critical surface tension is too high, liquid product water floods the porous electrode, cutting off oxygen (O<sub>2</sub>) and hydrogen (H<sub>2</sub>) supply. 
        Engineered surface energy ensures optimal water management, balancing gas permeability with ionic conductivity.
      </p>
    </div>
  );
};
