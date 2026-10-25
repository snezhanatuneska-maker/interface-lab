import React from 'react';

export const SurfaceExplorerInsight: React.FC = () => {
  return (
    <div className="bg-emerald-50/60 border border-emerald-200 border-l-4 border-l-emerald-600 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-emerald-900 mb-2 flex items-center gap-2">
        <span>⚡</span> Clean Energy Link: How Catalyst and Electrode Surfaces are Characterised in Practice
      </h3>
      <p className="text-sm text-emerald-800 leading-relaxed">
        In real-world fuel-cell and electrolyzer research, no single technique tells the whole story. 
        Researchers use SEM to inspect catalyst layer cracking and carbon support distribution over wide areas, AFM to measure precise roughness and thickness of catalyst coated membranes (CCMs), and XPS to confirm platinum oxidation states and alloy surface segregation within the top few nanometers where electrochemical reactions actually occur.
      </p>
    </div>
  );
};
