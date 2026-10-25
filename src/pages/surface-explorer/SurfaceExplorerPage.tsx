import React from 'react';
import { SurfaceExplorerTryThis } from './SurfaceExplorerTryThis';
import { SurfaceExplorerTheory } from './SurfaceExplorerTheory';
import { SurfaceExplorerEquations } from './SurfaceExplorerEquations';
import { SurfaceExplorerQuiz } from './SurfaceExplorerQuiz';
import { SurfaceExplorerInsight } from './SurfaceExplorerInsight';

export const SurfaceExplorerPage: React.FC = () => {
  return (
    <div className="space-y-12 pb-16 max-w-5xl mx-auto px-4">
      <header className="space-y-3 border-b border-gray-200 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Surface Characterization Explorer: SEM, AFM, XPS
        </h1>
        <p className="text-base text-gray-600 max-w-2xl">
          Compare what Scanning Electron Microscopy (SEM), Atomic Force Microscopy (AFM), and X-ray Photoelectron Spectroscopy (XPS) each reveal about the same catalyst or electrode surface.
        </p>
      </header>

      <section>
        <SurfaceExplorerTheory />
      </section>

      <section>
        <SurfaceExplorerTryThis />
      </section>

      <section>
        <SurfaceExplorerEquations />
      </section>

      <section>
        <SurfaceExplorerQuiz />
      </section>

      <section>
        <SurfaceExplorerInsight />
      </section>
    </div>
  );
};
