// Training mode: randomized practice for every finished topic. Each trainer here is listed on #/training (grouped by
// topic), in the side menu's Training section, and as a "Practise this topic" link on its topic's page.
// To add one: add an entry here and its generator in src/pages/training/configs.tsx.

export interface Trainer {
  id: string
  title: string
  /** Name of a topic in TOPICS. */
  topic: string
  /** Id of the subtopic (src/data/subtopics.ts) it practises. */
  subtopic: string
  /** One line on what the trainer asks. */
  description: string
  /** Route of the trainer page, e.g. '#/training/bet'. */
  href: string
}

export const TRAINERS: Trainer[] = [
  // ---------- Liquid Interfaces ----------
  {
    id: 'surfactants',
    title: 'Surfactants & CMC Training',
    topic: 'Liquid Interfaces',
    subtopic: 'surfactants-cmc',
    description: 'The CMC against tail length (Klevens), area per molecule, and what charge and salt do.',
    href: '#/training/surfactants',
  },
  {
    id: 'wetting',
    title: 'Wetting Training',
    topic: 'Liquid Interfaces',
    subtopic: 'wetting-contact-angle',
    description: 'Contact angles from Young, Wenzel and Cassie–Baxter, and the favoured state.',
    href: '#/training/wetting',
  },
  {
    id: 'capillary',
    title: 'Capillary Pressure Training',
    topic: 'Liquid Interfaces',
    subtopic: 'capillary-pressure',
    description: 'Young–Laplace pressure and pore radius, imbibition and capillary condensation.',
    href: '#/training/capillary',
  },
  {
    id: 'porosimetry',
    title: 'Mercury Porosimetry Training',
    topic: 'Liquid Interfaces',
    subtopic: 'mercury-porosimetry',
    description: 'Pore diameter and intrusion pressure from the Washburn equation.',
    href: '#/training/porosimetry',
  },
  // ---------- Solid Interfaces ----------
  {
    id: 'bet',
    title: 'BET Training',
    topic: 'Solid Interfaces',
    subtopic: 'langmuir-bet',
    description: 'Find Vₘ, C or the surface area in m²/g from a BET dataset.',
    href: '#/training/bet',
  },
  {
    id: 'isotherm',
    title: 'Isotherm Recognition',
    topic: 'Solid Interfaces',
    subtopic: 'langmuir-bet',
    description: 'Name the isotherm from its shape (Langmuir, BET, IUPAC I–IV) and compare Langmuir with BET.',
    href: '#/training/isotherms',
  },
  {
    id: 'zisman',
    title: 'Zisman Plot Training',
    topic: 'Solid Interfaces',
    subtopic: 'zisman-plot',
    description: 'Find the critical surface tension γ_c from contact angles of test liquids.',
    href: '#/training/zisman',
  },
  {
    id: 'surface-characterisation',
    title: 'Surface Characterisation Training',
    topic: 'Solid Interfaces',
    subtopic: 'surface-characterisation', // <-- This MUST match s.id in subtopics.ts exactly!
    description: 'SEM, AFM, and XPS resolution, cantilevers, and the photoelectric effect.',
    href: '#/training/surface-characterisation',
  },
  // ---------- Molecular & Macroscopic Interactions ----------
  {
    id: 'vdw',
    title: 'Van der Waals Training',
    topic: 'Molecular & Macroscopic Interactions',
    subtopic: 'van-der-waals',
    description: 'Keesom, Debye and London: which one dominates, r⁻⁶ scaling and the 1/T of Keesom.',
    href: '#/training/van-der-waals',
  },
  {
    id: 'lennard-jones',
    title: 'Lennard-Jones Potential Training',
    topic: 'Solid Interfaces',
    subtopic: 'lennard-jones',
    description: 'Tune ε and σ to explore the 12-6 potential well, equilibrium distance, and well depth.',
    href: '#/training/lennard-jones',
  },
  // ---------- Colloidal Systems ----------
  {
    id: 'edl',
    title: 'Double Layer Training',
    topic: 'Colloidal Systems',
    subtopic: 'double-layer',
    description: 'Debye length, Stern capacitance and capacitors in series.',
    href: '#/training/double-layer',
  },
  {
    id: 'zeta',
    title: 'Zeta Potential Training',
    topic: 'Colloidal Systems',
    subtopic: 'zeta-potential',
    description: 'ζ from electrophoretic mobility (Smoluchowski) and the isoelectric point.',
    href: '#/training/zeta',
  },
  {
    id: 'colloid',
    title: 'Colloid Stability Training',
    topic: 'Colloidal Systems',
    subtopic: 'dlvo',
    description: 'Debye length, stable or coagulating from a DLVO curve, and CCC ∝ 1/z⁶.',
    href: '#/training/colloids',
  },
  // ---------- Nucleation & Growth ----------
  {
    id: 'nucleation',
    title: 'Nucleation Training',
    topic: 'Nucleation & Growth',
    subtopic: 'nucleation-cnt',
    description: 'Critical diameter d*, the shape factor f(θ) and how the barrier scales.',
    href: '#/training/nucleation',
  },
  {
    id: 'phase',
    title: 'Phase Separation Training',
    topic: 'Nucleation & Growth',
    subtopic: 'phase-separation',
    description: 'Spinodal compositions, and stable, metastable or unstable mixtures.',
    href: '#/training/phase-separation',
  },
  {
    id: 'crystal',
    title: 'Crystal Growth Training',
    topic: 'Nucleation & Growth',
    subtopic: 'crystal-growth',
    description: 'Which faces survive, capping agents, BCF and diffusion-limited growth.',
    href: '#/training/crystal-growth',
  },
]

/** Trainers that practise a subtopic. */
export const trainersFor = (subtopicId: string) => TRAINERS.filter((t) => t.subtopic === subtopicId)

/** The trainer whose page is at this route (e.g. '/training/bet'), if any. */
export const trainerAt = (route: string) => TRAINERS.find((t) => t.href === `#${route}`)
