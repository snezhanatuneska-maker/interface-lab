// Training mode: randomized practice for every finished topic. Each trainer here is listed on #/training (grouped by
// topic), in the side menu's Training section, and as a "Practise this topic" link on its topic's page.
// To add one: add an entry here and its generator in src/pages/training/configs.tsx (or, for a course exercise with
// kind 'exercise', its definition in src/pages/training/exercises.tsx).

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
  /** 'exercise': a course exercise (task, parts, worked solution) instead of randomized multiple choice. */
  kind?: 'exercise'
  /** Heading the trainer is grouped under on #/training, when it is not the topic name. */
  group?: string
}

export const SHEET1 = 'Liquid Interfaces – Exercise Sheet 1'

export const TRAINERS: Trainer[] = [
  // ---------- Liquid Interfaces: Exercise Sheet 1 ----------
  {
    id: 'exercise-1-1',
    title: 'Exercise 1.1: Wilhelmy plate and Du Noüy ring',
    topic: 'Liquid Interfaces',
    subtopic: 'surfactants-cmc',
    description: 'Surface tension from a Wilhelmy plate, the extra mass on a Du Noüy ring, and soap above the CMC.',
    href: '#/training/exercise-1-1',
    kind: 'exercise',
    group: SHEET1,
  },
  {
    id: 'exercise-1-2',
    title: 'Exercise 1.2: Ethanol–water on bare and silanized glass',
    topic: 'Liquid Interfaces',
    subtopic: 'wetting-contact-angle',
    description: 'Contact-angle trends from surface chemistry, and γ_sl from Young’s equation for both substrates.',
    href: '#/training/exercise-1-2',
    kind: 'exercise',
    group: SHEET1,
  },
  {
    id: 'exercise-1-3',
    title: 'Exercise 1.3: Capillary pressure diagram of a model pore system',
    topic: 'Liquid Interfaces',
    subtopic: 'capillary-pressure',
    description: 'Capillary pressures and rise heights, drainage and imbibition curves, gravity, and interconnections.',
    href: '#/training/exercise-1-3',
    kind: 'exercise',
    group: SHEET1,
  },
  {
    id: 'exercise-1-4',
    title: 'Exercise 1.4: Optical humidity sensor (Kelvin)',
    topic: 'Liquid Interfaces',
    subtopic: 'capillary-pressure',
    description: 'Capillary condensation in small pores, the largest pore needed and the lowest measurable humidity.',
    href: '#/training/exercise-1-4',
    kind: 'exercise',
    group: SHEET1,
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
    topic: 'Molecular & Macroscopic Interactions',
    subtopic: 'lennard-jones',
    description: 'Tune ε and σ to explore the 12-6 potential well, equilibrium distance, and well depth.',
    href: '#/training/lennard-jones',
  },
  {
    id: 'hamaker',
    title: 'Hamaker Constant Training',
    topic: 'Molecular & Macroscopic Interactions',
    subtopic: 'hamaker-lifshitz',
    description: 'A₁₃₂ from the combining relation, attraction or repulsion, and vdW energy for plane–plane and sphere–plane geometry.',
    href: '#/training/hamaker',
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
