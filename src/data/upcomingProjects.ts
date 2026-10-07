// Single source of truth for the "Upcoming Projects" tab on the homepage.
// Add, remove or reorder projects here; entries and category groups are rendered from this list.
// Categories appear in the order they are first used below.

export type ProjectStatus = 'live' | 'planned'

export interface Project {
  id: string
  title: string
  category: string
  /** 1–2 sentences on what the simulation shows. */
  description: string
  /** 3–5 short concept tags. */
  concepts: string[]
  /** One line on why it matters for clean energy. */
  cepLink: string
  status: ProjectStatus
  /** Route of the live tool; only used when status is 'live'. */
  href?: string
}

export const PROJECTS: Project[] = [
  // ---------- Liquid Interfaces ----------
  {
    id: 'surfactants-cmc',
    title: 'Surfactants & Micelle Formation (CMC)',
    category: 'Liquid Interfaces',
    description:
      'Surfactant concentration is increased step by step. Above the critical micelle concentration the monomers form micelles, and surface tension, conductivity, osmotic pressure, turbidity and self-diffusion all change slope at the CMC.',
    concepts: ['CMC', 'Anionic/cationic/non-ionic/zwitterionic (SDS, CTAB, Tween 20, betaine)', 'Tail length', 'Ionic repulsion'],
    cepLink: 'Surfactants control wetting and foaming in electrolytes and catalyst inks.',
    status: 'planned',
  },
  {
    id: 'wetting-contact-angle',
    title: 'Wetting & Contact Angle: Young, Wenzel, Cassie–Baxter',
    category: 'Liquid Interfaces',
    description:
      'Surface energy and roughness are varied to move a droplet between the Wenzel and Cassie–Baxter states, from hydrophilic to superhydrophobic and superomniphobic.',
    concepts: ["Young's equation", 'Roughness amplifies wetting', 'Contact angle >150°', 'Lotus effect'],
    cepLink: 'Water management in fuel-cell gas diffusion layers and bubble release on electrolyzer electrodes.',
    status: 'planned',
  },
  {
    id: 'capillary-pressure',
    title: 'Capillary Pressure & Pore Filling',
    category: 'Liquid Interfaces',
    description:
      "Young–Laplace and Jurin's law in pores of different radii, the capillary pressure–saturation curve with drainage/imbibition hysteresis, and Kelvin condensation, which fills the smallest pores first.",
    concepts: ['Young–Laplace', "Jurin's law", 'Capillary pressure ∝ 1/r', 'Hysteresis', 'Kelvin equation'],
    cepLink: 'Liquid transport in porous electrodes and catalyst layers.',
    status: 'planned',
  },
  {
    id: 'mercury-porosimetry',
    title: 'Mercury Intrusion Porosimetry',
    category: 'Liquid Interfaces',
    description: 'Mercury is forced into a model porous sample; the intrusion curve is converted into a pore-size distribution with the Washburn equation.',
    concepts: ['Washburn equation', 'Non-wetting intrusion', 'Pore-size distribution'],
    cepLink: 'Standard method for characterising fuel-cell catalyst layers.',
    status: 'planned',
  },

  // ---------- Solid Interfaces ----------
  {
    id: 'langmuir-bet',
    title: 'Langmuir vs BET Adsorption',
    category: 'Solid Interfaces',
    description:
      'Gas molecules adsorbing on a surface: one Langmuir monolayer compared with BET multilayers, with both isotherm equations and their assumptions.',
    concepts: ['Monolayer vs multilayer', 'Adsorption isotherm', 'Surface coverage θ', 'BET surface area'],
    cepLink: 'Gas storage, catalyst surface area and porous electrode characterisation.',
    status: 'live',
    href: '#/adsorption',
  },
  {
    id: 'zisman-plot',
    title: 'Surface Energy & the Zisman Plot',
    category: 'Solid Interfaces',
    description:
      'cos θ is plotted against the surface tension of several test liquids and extrapolated to cos θ = 1 to get the critical surface tension of the solid.',
    concepts: ['Zisman plot', 'Complete wetting', 'Polar vs non-polar surfaces', 'Teflon low surface energy'],
    cepLink: 'Choosing coatings and membranes with the right wettability.',
    status: 'planned',
  },
  {
    id: 'surface-characterisation',
    title: 'Surface Characterisation Explorer: SEM, AFM, XPS',
    category: 'Solid Interfaces',
    description:
      'What each technique measures on the same surface: SEM electron signals (secondary, backscattered, X-ray), AFM tip–sample forces, and XPS photoelectrons and chemical states.',
    concepts: ['Lateral/vertical resolution', 'Cantilever and tip', 'Photoelectric effect', 'Information depth ~1–10 nm'],
    cepLink: 'How catalyst and electrode surfaces are characterised in practice.',
    status: 'planned',
  },

  // ---------- Molecular & Macroscopic Interactions ----------
  {
    id: 'lennard-jones',
    title: 'Lennard-Jones Potential Explorer',
    category: 'Molecular & Macroscopic Interactions',
    description:
      'ε and σ are varied to show how the r⁻¹² repulsion and r⁻⁶ attraction add up to the potential well, together with the force curve F = −dV/dr.',
    concepts: ['12-6 potential', 'Equilibrium distance', 'Well depth', 'Hard-sphere limit'],
    cepLink: 'The molecular basis of adhesion, adsorption and cohesion.',
    status: 'planned',
  },
  {
    id: 'van-der-waals',
    title: 'Van der Waals Forces: Keesom, Debye, London',
    category: 'Molecular & Macroscopic Interactions',
    description:
      'Ion–ion, ion–dipole and dipole interactions, and the three r⁻⁶ van der Waals contributions, compared with the thermal energy kT.',
    concepts: ['Dipole moment', 'Polarisability', 'C_vdW = C_Keesom + C_Debye + C_London', 'Thermal energy kT'],
    cepLink: 'Why molecules stick to electrode and catalyst surfaces.',
    status: 'planned',
  },
  {
    id: 'hamaker-lifshitz',
    title: 'Hamaker & Lifshitz: vdW Between Surfaces',
    category: 'Molecular & Macroscopic Interactions',
    description:
      'Materials 1 and 2 and a medium 3 are chosen to show when the van der Waals attraction is strong, reduced, or repulsive (n₁ > n₃ > n₂).',
    concepts: ['Hamaker constant', 'A₁₃₂', 'Refractive index', 'Sphere–plane vs plane–plane geometry'],
    cepLink: 'Particle adhesion in electrode slurries and coatings.',
    status: 'planned',
  },

  // ---------- Colloidal Systems ----------
  {
    id: 'double-layer',
    title: 'Electrical Double Layer: Gouy–Chapman–Stern',
    category: 'Colloidal Systems',
    description:
      'Ion concentration and valency are varied; the potential decays from the surface through the Stern layer into the diffuse layer, and the Debye length is recalculated.',
    concepts: ['Stern layer', 'Diffuse layer', 'Debye length κ⁻¹', 'Ionic strength', 'Specific adsorption (IHP/OHP)'],
    cepLink: 'The double layer behind supercapacitors and every electrode–electrolyte interface.',
    status: 'planned',
  },
  {
    id: 'zeta-potential',
    title: 'Zeta Potential & Isoelectric Point',
    category: 'Colloidal Systems',
    description:
      'A model pH titration to find the isoelectric point, and how non-specific and specific ion adsorption reduce zeta or shift the IEP.',
    concepts: ['Slipping plane', 'Electrophoretic mobility', 'IEP = PZC', 'Potential-determining ions'],
    cepLink: 'Controlling dispersion of catalyst and electrode particles.',
    status: 'planned',
  },
  {
    id: 'dlvo',
    title: 'DLVO Theory & Colloid Stability',
    category: 'Colloidal Systems',
    description:
      'Van der Waals attraction and double-layer repulsion are added into the total interaction energy; adding salt lowers the barrier until the particles coagulate.',
    concepts: ['Energy barrier', 'Primary/secondary minimum', 'Critical coagulation concentration ∝ 1/z⁶', 'Steric stabilisation'],
    cepLink: 'Stable inks and slurries for fuel-cell and battery electrode manufacturing.',
    status: 'planned',
  },

  // ---------- Nucleation & Growth ----------
  {
    id: 'nucleation-cnt',
    title: 'Classical Nucleation Theory: Homogeneous vs Heterogeneous',
    category: 'Nucleation & Growth',
    description:
      'Supersaturation, surface tension and contact angle set the balance between the volume term (favours growth) and the surface term (opposes it), giving the barrier ΔG* and critical diameter d*. A surface lowers the barrier through the shape factor f(θ).',
    concepts: ['ΔG = −(πd³/6V_m)·kT·ln S + πd²γ', 'Critical nucleus d*', 'Nucleation rate J', 'Shape factor f(θ)', 'Seeding'],
    cepLink: 'Controlling nucleation sets the size and number of catalyst nanoparticles.',
    status: 'planned',
  },
  {
    id: 'phase-separation',
    title: 'Phase Separation: Nucleation vs Spinodal Decomposition',
    category: 'Nucleation & Growth',
    description:
      'A path through the phase diagram, comparing localised nucleation in the metastable region with spontaneous, growing fluctuations inside the spinodal.',
    concepts: ['Binodal', 'Spinodal', 'Metastable region', 'Supersaturation'],
    cepLink: 'Microstructure formation in membranes and precipitated materials.',
    status: 'planned',
  },
  {
    id: 'crystal-growth',
    title: 'Crystal Growth & Shape',
    category: 'Nucleation & Growth',
    description:
      'Crystal growth under surface-reaction or diffusion control, and how supersaturation and additives change the shape, from Wulff facets to dendritic DLA growth.',
    concepts: ['BCF model', 'Diffusion-limited growth', 'Wulff construction', 'DLA', 'Kinetic Monte Carlo'],
    cepLink: 'Tailoring nanoparticle catalysts by size and shape.',
    status: 'planned',
  },
]
