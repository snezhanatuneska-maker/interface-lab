import React from 'react';

export const ZetaTheory: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 border-b pb-3">Surface Charge & The Slipping Plane</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">Potential-Determining Ions</h4>
          <p>
            In metal oxides, <span className="font-serif italic">H<sup>+</sup></span> and <span className="font-serif italic">OH<sup>-</sup></span> adsorb specifically onto the surface, directly governing the net surface charge depending on the solution pH.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">The Slipping Plane & Zeta Potential</h4>
          <p>
            As a charged particle moves through liquid, a thin layer of counter-ions moves with it. The electric potential at this boundary—known as the slipping plane—is defined as the <strong className="font-semibold text-gray-900">zeta potential (<span className="font-serif italic">ζ</span>)</strong>.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">IEP = PZC</h4>
          <p>
            At the <strong className="font-semibold text-gray-900">Isoelectric Point (IEP)</strong>, the zeta potential is zero (<span className="font-serif italic">ζ</span> = 0), corresponding to zero net surface charge (Point of Zero Charge, PZC), leading to particle flocculation.
          </p>
        </div>
      </div>
    </div>
  );
};
