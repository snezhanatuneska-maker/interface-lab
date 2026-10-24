import type { BankQuestion } from '../../lib/bank'

// Phase separation concept questions (moved from the phase-separation page's quiz).

export const PHASE_BANK: BankQuestion[] = [
  {
    question: 'A mixture lies between the binodal and the spinodal. What happens?',
    correct: 'It is metastable and separates only after a trigger (nucleation)',
    wrong: ['It separates instantly', 'It stays mixed forever', 'It forms a bicontinuous network spontaneously'],
    explanation: 'd²G/dx² > 0 there, so small fluctuations decay. Separation needs a nucleus that crosses the barrier.',
  },
  {
    question: 'The spinodal is defined by…',
    correct: 'd²G/dx² = 0',
    wrong: ['dG/dx = 0', 'G = 0', 'the common tangent'],
    explanation: 'The spinodal is where the curvature of G changes sign: the inflection points.',
  },
  {
    question: 'Which phase-separation mechanism has no energy barrier?',
    correct: 'Spinodal decomposition',
    wrong: ['Nucleation & growth', 'Both', 'Neither'],
    explanation: 'Inside the spinodal any small fluctuation already lowers G, so nothing has to be crossed.',
  },
  {
    question: 'Concentration profiles during nucleation & growth show…',
    correct: 'large, sharp, localized composition changes',
    wrong: ['small fluctuations that grow everywhere', 'no change', 'a uniform drift'],
    explanation: 'Each nucleus jumps straight to x₂ with a sharp interface, while the rest of the matrix stays near x₀.',
    level: 'medium',
  },
  {
    question: 'Increasing the supersaturation S does what to the critical diameter d*?',
    correct: 'Decreases it',
    wrong: ['Increases it', 'No effect', 'Makes it negative'],
    explanation: 'd* = 4γV_m/(kT ln S): a larger ln S gives a smaller critical nucleus and a lower barrier.',
  },
  {
    question: 'For S < 1, small clusters…',
    correct: 'dissolve, because ΔG only increases with size',
    wrong: ['grow without limit', 'stop at d*', 'become spinodal'],
    explanation: 'With ln S < 0 both terms are positive, so there is no maximum and every cluster shrinks.',
    level: 'medium',
  },
  {
    question: 'The binodal compositions x₁ and x₂ are found from…',
    correct: 'the common tangent to G(x)',
    wrong: ['the inflection points', 'the minimum of G', 'the critical point'],
    explanation: 'Both phases must have equal chemical potentials, which is the common tangent touching G at x₁ and x₂.',
    level: 'medium',
  },
  {
    question: 'A membrane with an interconnected (bicontinuous) pore structure most likely formed by…',
    correct: 'spinodal decomposition',
    wrong: ['nucleation & growth', 'adsorption', 'crystallization from the melt'],
    explanation: 'Spinodal decomposition grows everywhere at once with one wavelength, giving a connected network.',
  },
]
