import React from 'react';
import { ZismanTryThis } from './ZismanTryThis';
import { ZismanTheory } from './ZismanTheory';
import { ZismanEquations } from './ZismanEquations';
import { ZismanQuiz } from './ZismanQuiz';
import { ZismanInsight } from './ZismanInsight';

export const ZismanPage: React.FC = () => {
  return (
    <div className="space-y-12 pb-16 max-w-5xl mx-auto px-4">
      <header className="space-y-3 border-b border-gray-200 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Surface Energy & The Zisman Plot
        </h1>
        <p className="text-base text-gray-600 max-w-2xl">
          Explore how contact angles across various liquids allow us to construct Zisman plots, determine critical surface tension, and evaluate hydrophobic coatings like Teflon.
        </p>
      </header>

      <section>
        <ZismanTheory />
      </section>

      <section>
        <ZismanTryThis />
      </section>

      <section>
        <ZismanEquations />
      </section>

      <section>
        <ZismanQuiz />
      </section>

      <section>
        <ZismanInsight />
      </section>
    </div>
  );
};
