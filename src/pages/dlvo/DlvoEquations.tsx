import React from 'react';

export const DlvoEquations: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-l-4 border-l-blue-600 space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Core Physical Principles & Equations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
        <div className="p-4 bg-blue-50/40 rounded-lg space-y-2 border border-blue-100">
          <h4 className="font-semibold text-blue-900">Total DLVO Interaction Energy</h4>
          <p>The net interaction potential (<span className="italic font-serif">V<sub>total</sub></span>) is the sum of double-layer repulsion (<span className="italic font-serif">V<sub>R</sub></span>) and van der Waals attraction (<span className="italic font-serif">V<sub>A</sub></span>):</p>
          <div className="p-3 bg-white rounded border border-blue-200 text-center font-mono font-medium text-blue-700 text-base shadow-sm">
            V<sub>total</sub> = V<sub>R</sub> + V<sub>A</sub>
          </div>
        </div>
        <div className="p-4 bg-blue-50/40 rounded-lg space-y-2 border border-blue-100">
          <h4 className="font-semibold text-blue-900">The Schulze-Hardy Rule</h4>
          <p>The Critical Coagulation Concentration (CCC) decreases exponentially with the valency (<span className="italic font-serif">z</span>) of counter-ions:</p>
          <div className="p-3 bg-white rounded border border-blue-200 text-center font-mono font-medium text-blue-700 text-sm shadow-sm">
            CCC &propto; 1 / z<sup>6</sup>
          </div>
        </div>
      </div>
    </div>
  );
};
