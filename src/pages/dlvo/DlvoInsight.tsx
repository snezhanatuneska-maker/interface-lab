import React from 'react';

export const DlvoInsight: React.FC = () => {
  return (
    <div className="bg-emerald-50/60 border border-emerald-200 border-l-4 border-l-emerald-600 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-emerald-900 mb-2 flex items-center gap-2">
        <span>⚡</span> Clean Energy Link: Stable Inks and Slurries for Battery & Fuel-Cell Manufacturing
      </h3>
      <p className="text-sm text-emerald-800 leading-relaxed">
        In manufacturing lithium-ion battery cathodes (e.g., NMC slurries) and fuel-cell catalyst inks, solid particles (active material, carbon black, binders) are dispersed in liquid solvents. 
        If impurities introduce excess salt or multivalent ions, the DLVO energy barrier collapses, causing rapid agglomeration and gelation. 
        Controlling ionic strength and leveraging steric stabilization ensures homogeneous slurry viscosity, preventing cracking during doctor-blade coating and maximizing electrochemical performance.
      </p>
    </div>
  );
};
