import React from 'react';
import { CapillaryTryThis } from './CapillaryTryThis';
import { CapillaryEquations } from './CapillaryEquations';
import { CapillaryInsight } from './capillaryInsight';

export const CapillaryPage: React.FC = () => {
  return (
    <div className="space-y-12 pb-16">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Capillary Pressure & Pore Filling</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore how pore radius controls capillary pressure, fluid rise, vapor condensation, and contact angle hysteresis.
        </p>
      </header>

      <section>
        <CapillaryTryThis />
      </section>

      <section>
        <CapillaryEquations />
      </section>

      <section>
        <CapillaryInsight />
      </section>
    </div>
  );
};
