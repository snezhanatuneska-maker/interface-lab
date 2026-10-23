import React from 'react';

export const MipsInsight: React.FC = () => {
  return (
    <div className="bg-emerald-50/60 border border-emerald-200 border-l-4 border-l-emerald-600 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-emerald-900 mb-2 flex items-center gap-2">
        <span>⚡</span> Clean Energy Link: Standard Method for Characterising Fuel-Cell Catalyst Layers
      </h3>
      <p className="text-sm text-emerald-800 leading-relaxed">
        In proton-exchange membrane fuel cells (PEMFCs), gas diffusion layers (GDLs) and catalyst layers rely on a precise balance of hydrophilic and hydrophobic pores to transport reactant gases (O<sub>2</sub>, H<sub>2</sub>) and remove liquid product water. 
        Mercury Intrusion Porosimetry is the industry standard for mapping these pore-size distributions across high pressures, ensuring that electrode microstructures prevent flooding while maintaining optimal ionic and electrical conductivity.
      </p>
    </div>
  );
};
