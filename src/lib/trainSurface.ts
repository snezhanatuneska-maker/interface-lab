import type { Rng } from './random'
import { fmt, fmtTex, numericOptions, round, type Difficulty, type Generator } from './training'

export interface SurfaceData {
  kind: 'surface'
  topic: 'sem' | 'afm' | 'xps'
  question: string
  options: string[]
  answer: number
  explanation: string
}

export const generateSurface: Generator<SurfaceData> = (rng: Rng, difficulty: Difficulty) => {
  const topic = rng.pick(['sem', 'afm', 'xps'] as const)

  if (topic === 'sem') {
    const acceleratingVoltage = rng.pick([5, 10, 15, 20, 30]) // kV
    const workingDistance = rng.pick([4, 6, 8, 10]) // mm
    return {
      kind: 'surface',
      topic: 'sem',
      question: `In an SEM operating at an accelerating voltage of ${acceleratingVoltage} kV and a working distance of ${workingDistance} mm, what is the primary signal utilized for high-resolution surface topography imaging?`,
      options: [
        'Secondary electrons (SE)',
        'Backscattered electrons (BSE)',
        'Characteristic X-rays',
        'Transmitted electrons'
      ],
      answer: 0,
      explanation: 'Secondary electrons have very shallow escape depths (~few nm), making them exceptionally sensitive to surface morphology and topography.'
    }
  } else if (topic === 'afm') {
    const springConstant = rng.pick([0.1, 0.5, 2.0, 42.0]) // N/m
    return {
      kind: 'surface',
      topic: 'afm',
      question: `An AFM cantilever features a nominal spring constant of ${springConstant} N/m. Which operational mode is best suited for soft biological or polymer samples to eliminate destructive lateral shear forces?`,
      options: [
        'TappingMode (Intermittent contact)',
        'Contact mode (Constant force)',
        'STM (Scanning Tunneling Mode)',
        'Direct scratching mode'
      ],
      answer: 0,
      explanation: 'TappingMode oscillates the cantilever near its resonance frequency, touching the sample lightly to minimize lateral friction and sample damage.'
    }
  } else {
    const photonEnergy = rng.pick([1253.6, 1486.6]) // Mg Ka or Al Ka in eV
    const bindingEnergy = rng.round(rng.uniform(280, 650), 1)
    const kineticEnergy = rng.round(photonEnergy - bindingEnergy - 4.2, 1) // work function ~4.2 eV
    const wrong1 = rng.round(bindingEnergy + 25.5, 1)
    const wrong2 = rng.round(photonEnergy + kineticEnergy, 1)
    
    return {
      kind: 'surface',
      topic: 'xps',
      question: `In an XPS setup using an Al K$\alpha$ source ($h\\nu = ${photonEnergy}$ eV) with a spectrometer work function of 4.2 eV, a core-level photoelectron peak appears at a kinetic energy of ${kineticEnergy} eV. What is its binding energy ($E_b$)?`,
      options: [
        `${bindingEnergy} eV`,
        `${wrong1} eV`,
        `${wrong2} eV`,
        `${rng.round(photonEnergy + bindingEnergy, 1)} eV`
      ],
      answer: 0,
      explanation: `Using the photoelectric relation $E_k = h\\nu - E_b - \\Phi$, rearranging gives $E_b = h\\nu - E_k - \\Phi = ${photonEnergy} - ${kineticEnergy} - 4.2 \\approx ${bindingEnergy}$ eV.`
    }
  }
}
