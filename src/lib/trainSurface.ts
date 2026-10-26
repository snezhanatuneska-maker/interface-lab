import type { Rng } from './random'
import { fmt, fmtTex, numericOptions, round, type Difficulty, type Generator, type Problem } from './training'

export interface SurfaceData {
  topic: 'sem' | 'afm' | 'xps'
}

export const generateSurface: Generator<SurfaceData> = (rng: Rng, difficulty: Difficulty): Problem<SurfaceData> => {
  const topic = difficulty === 'easy' ? rng.pick(['sem', 'afm'] as const) : rng.pick(['sem', 'afm', 'xps'] as const)

  if (topic === 'sem') {
    const acceleratingVoltage = rng.pick([5, 10, 15, 20, 30]) // kV
    const workingDistance = rng.pick([4, 6, 8, 10]) // mm

    return {
      question: `In an SEM operating at an accelerating voltage of ${acceleratingVoltage} kV and a working distance of ${workingDistance} mm, what is the primary signal utilized for high-resolution surface topography imaging?`,
      options: [
        'Secondary electrons (SE)',
        'Backscattered electrons (BSE)',
        'Characteristic X-rays',
        'Transmitted electrons'
      ],
      answer: 0,
      steps: [
        { text: 'Interaction volume and escape depth:' },
        { text: 'Secondary electrons originate from the top few nanometers of the sample surface, providing maximum topographic contrast.' }
      ],
      data: { topic: 'sem' }
    }
  } else if (topic === 'afm') {
    const springConstant = rng.pick([0.1, 0.5, 2.0, 42.0]) // N/m

    return {
      question: `An AFM cantilever features a nominal spring constant of ${springConstant} N/m. Which operational mode is best suited for soft biological or polymer samples to eliminate destructive lateral shear forces?`,
      options: [
        'TappingMode (Intermittent contact)',
        'Contact mode (Constant force)',
        'STM (Scanning Tunneling Mode)',
        'Direct scratching mode'
      ],
      answer: 0,
      steps: [
        { text: 'Force minimization principle:' },
        { text: 'TappingMode oscillates the tip vertically near resonance, reducing destructive lateral friction forces on soft or loosely bound substrates.' }
      ],
      data: { topic: 'afm' }
    }
  } else {
    const source = rng.pick([
      { name: 'Mg', hv: 1253.6 },
      { name: 'Al', hv: 1486.6 },
    ]) // eV, Kα lines
    const photonEnergy = source.hv
    const bindingEnergy = round(rng.uniform(280, 650), 1)
    const kineticEnergy = round(photonEnergy - bindingEnergy - 4.2, 1)

    const { options, answer } = numericOptions(
      rng,
      bindingEnergy,
      // took E_k as E_b; added Φ instead of subtracting it; took hν as E_b
      [kineticEnergy, photonEnergy - kineticEnergy + 4.2, photonEnergy],
      { format: (v) => `${fmt(v, 1)} eV` }
    )

    return {
      question: `In an XPS setup using an ${source.name} K$\\alpha$ source ($h\\nu = ${photonEnergy}$ eV) with a spectrometer work function of 4.2 eV, a core-level photoelectron peak appears at a kinetic energy of ${kineticEnergy} eV. What is its binding energy ($E_b$)?`,
      options,
      answer,
      steps: [
        { text: 'Photoelectric relation:', tex: `E_k = h\\nu - E_b - \\Phi \\;\\Rightarrow\\; E_b = h\\nu - E_k - \\Phi` },
        { text: 'Substitute the given values:', tex: `E_b = ${fmtTex(photonEnergy)} - ${fmtTex(kineticEnergy)} - 4.2 = ${fmtTex(bindingEnergy)}\\ \\mathrm{eV}` }
      ],
      data: { topic: 'xps' }
    }
  }
}
