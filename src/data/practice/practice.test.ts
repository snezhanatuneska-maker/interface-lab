import { describe, expect, it } from 'vitest'
import type { BankQuestion } from '../../lib/bank'
import { ADSORPTION_BANK } from './adsorption'
import { CAPILLARY_BANK } from './capillary'
import { CRYSTAL_BANK } from './crystal'
import { DLVO_BANK } from './dlvo'
import { EDL_BANK } from './edl'
import { MIPS_BANK } from './mips'
import { NUCLEATION_BANK } from './nucleation'
import { PHASE_BANK } from './phase'
import { SURFACTANT_BANK } from './surfactants'
import { VDW_BANK } from './vdw'
import { WETTING_BANK } from './wetting'
import { ZETA_BANK } from './zeta'
import { ZISMAN_BANK } from './zisman'

const BANKS: Record<string, BankQuestion[]> = {
  adsorption: ADSORPTION_BANK,
  capillary: CAPILLARY_BANK,
  crystal: CRYSTAL_BANK,
  dlvo: DLVO_BANK,
  edl: EDL_BANK,
  mips: MIPS_BANK,
  nucleation: NUCLEATION_BANK,
  phase: PHASE_BANK,
  surfactants: SURFACTANT_BANK,
  vdw: VDW_BANK,
  wetting: WETTING_BANK,
  zeta: ZETA_BANK,
  zisman: ZISMAN_BANK,
}

describe('practice question banks', () => {
  for (const [name, bank] of Object.entries(BANKS))
    it(`${name}: every question has four distinct options, an explanation, and something to ask at Easy`, () => {
      expect(bank.length).toBeGreaterThan(0)
      expect(new Set(bank.map((q) => q.question)).size).toBe(bank.length)
      for (const q of bank) {
        expect(new Set([q.correct, ...q.wrong]).size).toBe(4)
        expect(q.explanation.length).toBeGreaterThan(10)
        // Inline TeX comes in $…$ pairs.
        for (const s of [q.question, q.correct, ...q.wrong]) expect((s.match(/\$/g) ?? []).length % 2).toBe(0)
      }
      expect(bank.some((q) => (q.level ?? 'easy') === 'easy')).toBe(true)
    })
})
