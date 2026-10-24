import type { BankQuestion } from '../../lib/bank'

// Zeta potential concept questions (moved from the zeta page's knowledge check).

export const ZETA_BANK: BankQuestion[] = [
  {
    question: 'What is the zeta potential of a metal-oxide particle when the pH equals its isoelectric point (IEP)?',
    correct: 'Zero (ζ = 0)',
    wrong: ['Its maximum positive value', 'Strongly negative', 'It fluctuates unpredictably'],
    explanation: 'At the IEP the particle carries no net charge at the slipping plane, so it does not move in an electric field.',
  },
  {
    question: 'Why is a high |ζ| (above about 30 mV) important when preparing fuel-cell catalyst inks?',
    correct: 'Strong electrostatic repulsion keeps the nanoparticles from agglomerating',
    wrong: ['It raises the electrical conductivity of the carbon support', 'It speeds up solvent evaporation', 'It stops the solvent from freezing'],
    explanation: 'Well-dispersed particles keep their full active surface area and give a uniform catalyst layer.',
  },
  {
    question: 'Which ions are the potential-determining ions for metal-oxide surfaces in water?',
    correct: 'H⁺ and OH⁻',
    wrong: ['Na⁺ and Cl⁻', 'SO₄²⁻ and Ca²⁺', 'Pt²⁺ and C⁺'],
    explanation: 'Surface –OH groups take up H⁺ or release it (react with OH⁻), so pH sets the surface charge.',
  },
  {
    question: 'The pH of an oxide suspension is moved from its IEP towards the acidic side. The particles become…',
    correct: 'positively charged',
    wrong: ['negatively charged', 'uncharged', 'charged only if salt is added'],
    explanation: 'Below the IEP the surface groups take up H⁺ (–OH₂⁺), so ζ > 0; above it they lose H⁺ (–O⁻), so ζ < 0.',
    level: 'medium',
  },
]
