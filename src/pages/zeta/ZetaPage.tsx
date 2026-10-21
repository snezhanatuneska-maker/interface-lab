import React from 'react';
import { ZetaTryThis } from './ZetaTryThis';
import { ZetaTheory } from './ZetaTheory';
import { ZetaEquations } from './ZetaEquations';
import { ZetaQuiz } from './ZetaQuiz';
import { ZetaInsight } from './ZetaInsight';

export const ZetaPage: React.FC = () => {
  return (
    <div className="space-y-12 pb-16 max-w-5xl mx-auto px-4">
      <header className="space-y-3 border-b border-gray-200 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Zeta Potential & Isoelectric Point
        </h1>
        <p className="text-base text-gray-600 max-w-2xl">
          Explore how pH titration controls surface charge, slipping planes, electrophoretic mobility, and particle dispersion stability in catalyst inks.
        </p>
      </header>

      <section>
        <ZetaTheory />
      </section>

      <section>
        <ZetaTryThis />
      </section>

      <section>
        <ZetaEquations />
      </section>

      <section>
        <ZetaQuiz />
      </section>

      <section>
        <ZetaInsight />
      </section>
    </div>
  );
};
