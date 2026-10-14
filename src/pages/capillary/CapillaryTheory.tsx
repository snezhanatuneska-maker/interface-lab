import React from 'react';

export const CapillaryTheory: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 border-b pb-3">Capillary Rise, Condensation & Hysteresis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">Jurin's Law & Height</h4>
          <p>
            When a wetting liquid comes into contact with a narrow capillary, surface tension pulls the fluid upward. 
            The height (<span className="italic font-serif">h</span>) is inversely proportional to pore radius (<span className="italic font-serif">r</span>), meaning sub-micron pores generate enormous suction heights.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">Capillary Condensation</h4>
          <p>
            In mesopores, vapor condenses into liquid at relative pressures (<span className="font-mono">P/P<sub>0</sub> &lt; 1</span>) well below saturation due to the negative curvature of the menisci, as described by the Kelvin equation.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 text-base">Adsorption Hysteresis</h4>
          <p>
            The filling (imbibition) and emptying (drainage) pathways often follow different curves. This hysteresis loop arises from contact angle advancing/receding differences and pore network geometry effects.
          </p>
        </div>
      </div>
    </div>
  );
};
