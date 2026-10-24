import type { BankQuestion } from '../../lib/bank'

// Van der Waals concept questions (moved from the van der Waals page's quiz).

export const VDW_BANK: BankQuestion[] = [
  {
    question: 'Which interaction acts between two argon atoms?',
    correct: 'London only',
    wrong: ['Keesom only', 'Keesom and Debye', 'All three equally'],
    explanation: 'Ar has no dipole (μ = 0), so C_Keesom = C_Debye = 0. Only the fluctuating electron clouds attract.',
  },
  {
    question: 'Which van der Waals contribution decreases with increasing temperature?',
    correct: 'Keesom',
    wrong: ['Debye', 'London', 'None of them'],
    explanation: 'Keesom ∝ 1/T: faster tumbling averages out the dipole alignment. Debye and London do not depend on T.',
  },
  {
    question: 'The Debye interaction is between…',
    correct: 'a permanent dipole and an induced dipole',
    wrong: ['two permanent dipoles', 'two induced dipoles', 'an ion and a permanent dipole'],
    explanation: 'The permanent dipole polarizes its neighbour (α₀) and attracts the dipole it induced.',
  },
  {
    question: 'How do all three van der Waals terms scale with distance?',
    correct: '−1/r⁶',
    wrong: ['−1/r', '−1/r³', '−1/r¹²'],
    explanation: 'All three give φ = −C/r⁶, so they add into a single C_vdW. Halving r makes the attraction 64× stronger.',
  },
  {
    question: 'For HCl (μ = 1.08 D, α = 2.63 Å³), the largest van der Waals contribution is…',
    correct: 'London',
    wrong: ['Keesom', 'Debye', 'They are always equal'],
    explanation: 'The dipole is modest but the polarizability is large, so London gives about 86 % of C_vdW.',
    level: 'medium',
  },
  {
    question: 'For H₂O (μ = 1.85 D, α = 1.48 Å³), the largest van der Waals contribution at room temperature is…',
    correct: 'Keesom',
    wrong: ['London', 'Debye', 'None: water has no vdW forces'],
    explanation: 'A large dipole and a small polarizability: Keesom gives about 69 % at 293 K.',
    level: 'medium',
  },
  {
    question: 'London forces originate from…',
    correct: 'instantaneous fluctuations of the electron cloud',
    wrong: ['permanent dipoles lining up', 'net charges on the molecules', 'hydrogen bonds between molecules'],
    explanation: 'At any instant the electrons are off-centre. That brief dipole induces one in the neighbour, and they attract.',
  },
  {
    question: 'Why is H₂ so hard to liquefy?',
    correct: 'Small polarizability, so only weak London forces',
    wrong: ['Its strong dipole makes molecules repel', 'Keesom forces are too strong at low T', 'H₂ molecules are charged'],
    explanation: 'H₂ is nonpolar with α = 0.80 Å³, so only a weak London term holds it together. It boils at about 20 K.',
    level: 'medium',
  },
]
