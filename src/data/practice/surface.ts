import type { BankQuestion } from '../../lib/bank'

export const SURFACE_BANK: BankQuestion[] = [
  {
    question: 'Which microscopy technique offers exceptional vertical resolution (< 0.1 nm) for measuring surface step heights?',
    correct: 'Atomic Force Microscopy (AFM)',
    wrong: [
      'Scanning Electron Microscopy (SEM)',
      'X-ray Photoelectron Spectroscopy (XPS)',
      'Mercury Intrusion Porosimetry'
    ],
    explanation:
      'AFM uses a sharp tip on a flexible cantilever to physically track topography, enabling sub-nanometer vertical resolution.'
  },
  {
    question: 'What fundamental physical phenomenon is harnessed in XPS to determine core-level binding energies?',
    correct: 'The photoelectric effect',
    wrong: [
      'Secondary electron scattering',
      'Capillary condensation',
      'Electrostatic double-layer compression'
    ],
    explanation:
      'XPS irradiates samples with X-rays to eject core electrons via the photoelectric effect, measuring their kinetic energy.'
  },
  {
    question: 'What is the typical analytical information depth of standard XPS measurements?',
    correct: '~1–10 nm',
    wrong: [
      '1 to 10 micrometers',
      'Exactly 1 meter',
      'The entire bulk thickness of the electrode'
    ],
    explanation:
      'Because photoelectrons have short inelastic mean free paths in solids, XPS probes strictly the top ~1–10 nm of a surface.'
  }
]
