import type { BankQuestion } from '../../lib/bank'

// Zisman plot concept questions (moved from the Zisman page's knowledge check).

export const ZISMAN_BANK: BankQuestion[] = [
  {
    question: 'At what value of cos θ is a Zisman plot extrapolated to find the critical surface tension $\\gamma_c$?',
    correct: 'cos θ = 1 (complete wetting, θ = 0°)',
    wrong: ['cos θ = 0 (θ = 90°)', 'cos θ = −1 (complete non-wetting)', 'cos θ = 0.5'],
    explanation: 'γ_c is the γ_LV at which the straight line through the data reaches cos θ = 1: liquids below it spread completely.',
  },
  {
    question: 'Why does PTFE (Teflon) have such a low critical surface tension (about 18 mN/m)?',
    correct: 'Its tightly packed CF₂ groups have low polarizability, so the intermolecular forces are weak',
    wrong: ['It is highly soluble in water', 'It conducts electricity very well', 'It absorbs liquid droplets instantly'],
    explanation: 'The fluorine sheath around the carbon backbone gives only weak dispersion forces, hence a very low surface energy.',
  },
  {
    question: 'How do high-energy surfaces such as clean metals or glass interact with water?',
    correct: 'Water wets them well (low θ), since their surface energy exceeds water’s surface tension',
    wrong: ['They bead water up into high contact angles', 'They dissolve into the droplet', 'They prevent any hydrogen bonding'],
    explanation: 'A liquid spreads on a solid whose critical surface tension is above the liquid’s γ_LV.',
  },
]
