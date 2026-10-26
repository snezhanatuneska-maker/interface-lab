import React from 'react';
import { ZismanTryThis } from './ZismanTryThis';
import { ZismanTheory } from './ZismanTheory';
import { ZismanEquations } from './ZismanEquations';
import { ZismanInsight } from './ZismanInsight';

export const ZismanPage: React.FC = () => {
  return (
    <article className="page">
      <header className="page-intro compact">
        <h1>Surface Energy & The Zisman Plot</h1>
        <p className="lede">
          Explore how contact angles across various liquids allow us to construct Zisman plots, determine critical surface tension, and evaluate hydrophobic coatings like Teflon.
        </p>
      </header>

      <ZismanTryThis />
      <ZismanTheory />
      <ZismanEquations />
      <ZismanInsight />
    </article>
  );
};
