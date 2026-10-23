import React from 'react';

export const DlvoTheory: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 border-b pb-3">Energy Barriers & Particle Interactions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">The Energy Barrier</h4>
          <p>
            DLVO theory combines repulsive electrostatic forces and attractive van der Waals forces. A high energy barrier prevents particles from falling into the deep primary minimum, keeping the colloid stable.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">Primary & Secondary Minima</h4>
          <p>
            At large separations, weak attraction creates a shallow <strong className="font-semibold text-gray-900">secondary minimum</strong> (reversible flocculation). At contact, the deep <strong className="font-semibold text-gray-900">primary minimum</strong> causes irreversible particle aggregation.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">The Schulze-Hardy Rule</h4>
          <p>
            Adding salt compresses the electrical double layer. Counter-ion valency (<span className="font-serif italic">z</span>) drastically impacts stability, with the Critical Coagulation Concentration scaling as <span className="font-mono">CCC &prop; 1/z<sup>6</sup></span>.
          </p>
        </div>
      </div>
    </div>
  );
};
