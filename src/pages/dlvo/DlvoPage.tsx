import React from 'react';
import { DlvoTryThis } from './DlvoTryThis';
import { DlvoTheory } from './DlvoTheory';
import { DlvoEquations } from './DlvoEquations';
import { DlvoQuiz } from './DlvoQuiz';
import { DlvoInsight } from './DlvoInsight';

export const DlvoPage: React.FC = () => {
  return (
    <div className="space-y-12 pb-16 max-w-5xl mx-auto px-4">
      <header className="space-y-3 border-b border-gray-200 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          DLVO Theory & Colloid Stability
        </h1>
        <p className="text-base text-gray-600 max-w-2xl">
          Explore how electrolyte concentration and ion valency control the energy barrier, primary and secondary minima, and critical coagulation concentration in battery and catalyst slurries.
        </p>
      </header>

      <section>
        <DlvoTheory />
      </section>

      <section>
        <DlvoTryThis />
      </section>

      <section>
        <DlvoEquations />
      </section>

      <section>
        <DlvoQuiz />
      </section>

      <section>
        <DlvoInsight />
      </section>
    </div>
  );
};
