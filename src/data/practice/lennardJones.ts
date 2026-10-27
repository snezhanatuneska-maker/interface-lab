import type { BankQuestion } from '../../lib/bank'

export const LENNARD_JONES_BANK: BankQuestion[] = [
  {
    question: 'What is the exact relation between the equilibrium distance (r_m) and the finite distance sigma (σ) in the 12-6 Lennard-Jones potential?',
    correct: 'r_m = 2^(1/6) * σ ≈ 1.122 σ',
    wrong: ['r_m = σ', 'r_m = 2 σ', 'r_m = 0.5 σ'],
    explanation: 'Setting the first derivative of the 12-6 potential V(r) to zero yields r_m = 2^(1/6) * σ.'
  },
  {
    question: 'In the 12-6 Lennard-Jones potential, what physical phenomenon does the r⁻¹² repulsion term represent?',
    correct: 'Pauli exclusion principle / short-range electron cloud overlap',
    wrong: ['London dispersion attraction', 'Electrostatic dipole coupling', 'Magnetic repulsion'],
    explanation: 'The r⁻¹² term models the steep hard-sphere-like repulsion when electron clouds overlap. The exponent 12 is a convenient choice (the square of r⁻⁶); the true repulsion is closer to exponential.'
  },
  {
    question: 'At what separation distance does the Lennard-Jones potential energy cross zero ($V(r) = 0$)?',
    correct: 'r = σ',
    wrong: ['r = r_m', 'r = 2σ', 'r = 0.5σ'],
    explanation: 'When r = σ, the repulsive and attractive terms balance such that (σ/r)¹² equals (σ/r)⁶, giving V = 0.'
  }
]
