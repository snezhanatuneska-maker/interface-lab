import React from 'react';
import { SurfaceExplorerTryThis } from './SurfaceExplorerTryThis';
import { SurfaceExplorerTheory } from './SurfaceExplorerTheory';
import { SurfaceExplorerEquations } from './SurfaceExplorerEquations';
import { SurfaceExplorerQuiz } from './SurfaceExplorerQuiz';
import { SurfaceExplorerInsight } from './SurfaceExplorerInsight';

export const SurfaceExplorerPage: React.FC = () => {
  return (
    <article className="page">
      <header className="page-intro compact">
        <h1>Surface Characterization Explorer: SEM, AFM, XPS</h1>
        <p className="lede">
          Compare what Scanning Electron Microscopy (SEM), Atomic Force Microscopy (AFM), and X-ray Photoelectron Spectroscopy (XPS) each reveal about the same catalyst or electrode surface.
        </p>
      </header>

      <SurfaceExplorerTryThis />
      <SurfaceExplorerTheory />
      <SurfaceExplorerEquations />
      <SurfaceExplorerInsight />
      <SurfaceExplorerQuiz />
    </article>
  );
};
