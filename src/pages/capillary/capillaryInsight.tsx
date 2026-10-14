import React from 'react';

export const CapillaryInsight: React.FC = () => {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-emerald-900 mb-2">⚡ Clean Energy Link: Porous Electrodes & Catalyst Layers</h3>
      <p className="text-sm text-emerald-800 leading-relaxed">
        In hydrogen fuel cells and water electrolyzers, catalyst layers and gas diffusion layers (GDLs) consist of complex nanoscale porous carbon networks. 
        Managing capillary pressure ($P_c$) is vital: if capillary forces are too high, product water completely floods the pore network, starving the active sites of reactant gases ($O_2$ or $H_2$). 
        Balancing pore size distribution optimizes liquid water removal while preserving ionic conductivity.
      </p>
    </div>
  );
};
