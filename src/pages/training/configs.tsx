import type { ReactNode } from 'react'
import { ADSORPTION_BANK } from '../../data/practice/adsorption'
import { CAPILLARY_BANK } from '../../data/practice/capillary'
import { CRYSTAL_BANK } from '../../data/practice/crystal'
import { DLVO_BANK } from '../../data/practice/dlvo'
import { EDL_BANK } from '../../data/practice/edl'
import { MIPS_BANK } from '../../data/practice/mips'
import { NUCLEATION_BANK } from '../../data/practice/nucleation'
import { PHASE_BANK } from '../../data/practice/phase'
import { SURFACTANT_BANK } from '../../data/practice/surfactants'
import { VDW_BANK } from '../../data/practice/vdw'
import { WETTING_BANK } from '../../data/practice/wetting'
import { ZETA_BANK } from '../../data/practice/zeta'
import { ZISMAN_BANK } from '../../data/practice/zisman'
import { SURFACE_BANK } from '../../data/practice/surface'
import { bankGenerator, isBank, mix, type BankData } from '../../lib/bank'
import type { Generator, Problem } from '../../lib/training'
import { generateBet, type BetData } from '../../lib/trainBet'
import { generateCapillary, type CapillaryData } from '../../lib/trainCapillary'
import { generateColloid, type ColloidData } from '../../lib/trainColloid'
import { generateCrystal, type CrystalData } from '../../lib/trainCrystal'
import { generateEdl, type EdlData } from '../../lib/trainEdl'
import { generateIsotherm, type IsothermData } from '../../lib/trainIsotherm'
import { generateMips, type MipsData } from '../../lib/trainMips'
import { generateNucleation, type NucleationData } from '../../lib/trainNucleation'
import { generatePhase, type PhaseData } from '../../lib/trainPhase'
import { generateSurfactant, type SurfactantData } from '../../lib/trainSurfactant'
import { generateVdw, type VdwData } from '../../lib/trainVdw'
import { generateWetting, type WettingData } from '../../lib/trainWetting'
import { generateZeta, type ZetaData } from '../../lib/trainZeta'
import { generateZisman, type ZismanData } from '../../lib/trainZisman'
import { generateSurface, type SurfaceData } from '../../lib/trainSurface'
import { BetFigure, DlvoFigure, IsothermFigure, ZismanFigure } from './figures'

// What each trainer (src/data/trainers.ts) asks: a generator, a line under its title, and the figure drawn above
// the question. Most mix randomized numeric problems with the topic's concept questions (src/data/practice/).

export interface TrainerConfig {
  intro: string
  generate: Generator<unknown>
  renderData?: (problem: Problem<unknown>) => ReactNode
}

/** Numeric problems and concept questions, about two to one. */
const withBank = <D,>(generate: Generator<D>, bank: Parameters<typeof bankGenerator>[0], weight = 2): Generator<D | BankData> =>
  mix<D | BankData>([
    [weight, generate],
    [1, bankGenerator(bank)],
  ])

/** Draws a figure only for the problems it belongs to (not for concept questions). */
const figure =
  <D,>(Figure: (props: { data: D }) => ReactNode, has: (data: D) => boolean = () => true) =>
  (p: Problem<unknown>) =>
    isBank(p.data) || !has(p.data as D) ? null : <Figure data={p.data as D} />

export const CONFIGS: Record<string, TrainerConfig> = {
  surfactants: {
    intro: 'The CMC against tail length (Klevens), area per molecule from Γ, and what head charge and salt do.',
    generate: withBank<SurfactantData>(generateSurfactant, SURFACTANT_BANK, 1),
  },
  wetting: {
    intro: 'Contact angles from Young, Wenzel and Cassie–Baxter, and which state a rough surface favours.',
    generate: withBank<WettingData>(generateWetting, WETTING_BANK),
  },
  capillary: {
    intro: 'Young–Laplace pressure in nanometre pores, wetting and capillary condensation.',
    generate: withBank<CapillaryData>(generateCapillary, CAPILLARY_BANK),
  },
  porosimetry: {
    intro: 'Mercury intrusion: pore diameter and pressure from the Washburn equation, and why mercury must be pushed in.',
    generate: withBank<MipsData>(generateMips, MIPS_BANK),
  },
  bet: {
    intro: 'From a BET dataset to the monolayer capacity Vₘ, the BET constant C and the specific surface area.',
    generate: generateBet as Generator<unknown>,
    renderData: figure<BetData>(BetFigure),
  },
  isotherm: {
    intro: 'Name the isotherm from its shape: Langmuir, BET, or IUPAC type I–IV, and compare how Langmuir and BET behave.',
    generate: withBank<IsothermData>(generateIsotherm, ADSORPTION_BANK),
    renderData: figure<IsothermData>(IsothermFigure),
  },
  zisman: {
    intro: 'Plot cos θ against γ_LV, extrapolate to cos θ = 1, and read off the critical surface tension.',
    generate: withBank<ZismanData>(generateZisman, ZISMAN_BANK),
    renderData: figure<ZismanData>(ZismanFigure),
  },
  vdw: {
    intro: 'Keesom, Debye and London: where they come from, which one dominates, and how they scale.',
    generate: withBank<VdwData>(generateVdw, VDW_BANK, 1),
  },
  edl: {
    intro: 'Debye length, the Stern capacitance and the Stern and diffuse layers in series.',
    generate: withBank<EdlData | ColloidData>(generateEdl, EDL_BANK, 1),
  },
  zeta: {
    intro: 'ζ from electrophoretic mobility, the isoelectric point and what surface charge means for stability.',
    generate: withBank<ZetaData>(generateZeta, ZETA_BANK),
  },
  colloid: {
    intro: 'Debye length κ⁻¹ from salt and valency, stable or coagulating from a DLVO curve, and the Schulze–Hardy rule CCC ∝ 1/z⁶.',
    generate: withBank<ColloidData>(generateColloid, DLVO_BANK),
    renderData: figure<ColloidData>(DlvoFigure, (d) => !!d.dlvo),
  },
  nucleation: {
    intro: 'The critical diameter d*, the heterogeneous shape factor f(θ), and how the barrier scales with γ and S.',
    generate: withBank<NucleationData>(generateNucleation, NUCLEATION_BANK, 1),
  },
  phase: {
    intro: 'Spinodal compositions of a regular solution, and whether a mixture is stable, metastable or unstable.',
    generate: withBank<PhaseData>(generatePhase, PHASE_BANK, 1),
  },
  crystal: {
    intro: 'Which faces survive as a crystal grows, capping agents, BCF spirals and diffusion-limited growth.',
    generate: withBank<CrystalData>(generateCrystal, CRYSTAL_BANK, 1),
  },
  surface-characterisation: {
    intro: 'SEM, AFM, and XPS resolution, cantilevers, and the photoelectric effect.',
    generate: withBank<SurfaceData>(generateSurface, SURFACE_BANK, 1),
  },
}
