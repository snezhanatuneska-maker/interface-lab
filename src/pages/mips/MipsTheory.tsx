import React from 'react';

export const MipsTheory: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 border-b pb-3">Non-Wetting Intrusion & Pore Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">Non-Wetting Behavior</h4>
          <p>
            Mercury does not spontaneously wet most solids, exhibiting a contact angle greater than 90 degrees (<span className="font-serif italic">&theta; &gt; 90&deg;</span>). External pressure is required to force it into pores.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">The Washburn Equation</h4>
          <p>
            Pressure (<span className="font-serif italic">P</span>) is inversely proportional to the entry pore radius (<span className="font-serif italic">r</span>). Smaller nanopores require immense hydraulic pressures to intrude.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">Pore-Size Distribution</h4>
          <p>
            By recording cumulative mercury volume vs. applied pressure, porosimeters generate comprehensive pore-size distributions, distinguishing macro-, meso-, and micro-pore networks.
          </p>
        </div>
      </div>
    </div>
  );
};
