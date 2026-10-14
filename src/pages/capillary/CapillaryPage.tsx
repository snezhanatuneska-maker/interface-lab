import React from 'react';
import { CapillaryTryThis } from './CapillaryTryThis';
import { CapillaryEquations } from './CapillaryEquations';
import { CapillaryTheory } from './CapillaryTheory';
import { CapillaryQuiz } from './CapillaryQuiz';
import { CapillaryInsight } from './capillaryInsight';

export const CapillaryPage: React.FC = () => {
  return (
    <div className="space-y-12 pb-16 max-w-5xl mx-auto px-4">
      <header className="space-y-3 border-b border-gray-200 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Capillary Pressure & Pore Filling
        </h1>
        <p className="text-base text-gray-600 max-w-2xl">
          Explore how pore radius controls capillary pressure, fluid rise, vapor condensation, and contact angle hysteresis.
        </p>
      </header>

      <section>
        <CapillaryTheory />
      </section>

      <section>
        <CapillaryTryThis />
      </section>

      <section>
        <CapillaryEquations />
      </section>

      <section>
        <CapillaryQuiz />
      </section>

      <section>
        <CapillaryInsight />
      </section>
    </div>
  );
};
