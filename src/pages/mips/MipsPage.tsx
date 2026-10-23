import React from 'react';
import { MipsTryThis } from './MipsTryThis';
import { MipsTheory } from './MipsTheory';
import { MipsEquations } from './MipsEquations';
import { MipsQuiz } from './MipsQuiz';
import { MipsInsight } from './MipsInsight';

export const MipsPage: React.FC = () => {
  return (
    <div className="space-y-12 pb-16 max-w-5xl mx-auto px-4">
      <header className="space-y-3 border-b border-gray-200 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Mercury Intrusion Porosimetry (MIP)
        </h1>
        <p className="text-base text-gray-600 max-w-2xl">
          Explore how high-pressure non-wetting mercury intrusion reveals pore-size distributions, threshold radii, and void volumes in porous electrodes.
        </p>
      </header>

      <section>
        <MipsTheory />
      </section>

      <section>
        <MipsTryThis />
      </section>

      <section>
        <MipsEquations />
      </section>

      <section>
        <MipsQuiz />
      </section>

      <section>
        <MipsInsight />
      </section>
    </div>
  );
};
