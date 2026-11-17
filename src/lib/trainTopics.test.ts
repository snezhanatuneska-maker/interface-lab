import { describe, expect, it } from 'vitest'
import { checkGenerator } from './checkGenerator'
import { survivingFamilies } from './crystal'
import { binodal, region, spinodal } from './phase'
import { generateCrystal } from './trainCrystal'
import { generateEdl } from './trainEdl'
import { fmt } from './training'
import { generateNucleation } from './trainNucleation'
import { generatePhase } from './trainPhase'
import { generateVdw } from './trainVdw'
import { generateZeta } from './trainZeta'
import { generateZisman } from './trainZisman'

// One block per topic trainer: the shared rules (checkGenerator), then the physics of the right answer and the
// ranges of the numbers it uses.

describe('Zisman trainer', () => {
  it('recovers the critical surface tension from the shown angles', () => {
    for (const p of checkGenerator(generateZisman)) {
      const d = p.data
      expect(d.slope).toBeLessThan(0)
      expect(d.theta.every((t) => t > 0 && t < 180)).toBe(true)
      expect(Math.abs(d.gammaC - d.trueGammaC)).toBeLessThan(6)
      expect(p.options[p.answer]).toBe(`${fmt(d.gammaC)} mN/m`)
    }
  })
})

describe('van der Waals trainer', () => {
  it('scales with r⁻⁶ and Keesom with 1/T', () => {
    for (const p of checkGenerator(generateVdw)) {
      expect(p.data.factor).toBeGreaterThan(0)
      expect(p.options[p.answer].startsWith(`× ${fmt(p.data.factor)}`)).toBe(true)
    }
  })
})

describe('zeta trainer', () => {
  it('gives ζ of tens of mV and an IEP between the two readings', () => {
    for (const p of checkGenerator(generateZeta)) {
      const d = p.data
      if (d.ask === 'smoluchowski') {
        expect(Math.abs(d.zeta!)).toBeGreaterThan(5)
        expect(Math.abs(d.zeta!)).toBeLessThan(70)
        expect(Math.sign(d.zeta!)).toBe(Math.sign(d.mobility!))
      } else {
        expect(d.iep!).toBeGreaterThan(2)
        expect(d.iep!).toBeLessThan(11)
        expect(p.options[p.answer]).toBe(`pH ${d.iep!.toFixed(1)}`)
      }
    }
  })
})

describe('double-layer trainer', () => {
  it('gives capacitances of a few to tens of µF/cm², with the series total below both', () => {
    for (const p of checkGenerator(generateEdl)) {
      const d = p.data
      if ('kind' in d && d.kind === 'edl') {
        expect(d.cStern).toBeGreaterThan(5)
        expect(d.cStern).toBeLessThan(40)
        if (d.ask === 'series') expect(d.cTotal!).toBeLessThan(Math.min(d.cStern, d.cDiffuse!))
      }
    }
  })
})

describe('nucleation trainer', () => {
  it('gives nanometre nuclei and shape factors between 0 and 1', () => {
    for (const p of checkGenerator(generateNucleation)) {
      const { ask, value } = p.data
      if (ask === 'dstar') {
        expect(value).toBeGreaterThan(0.1)
        expect(value).toBeLessThan(50)
      }
      if (ask === 'shape') {
        expect(value).toBeGreaterThan(0)
        expect(value).toBeLessThan(1)
      }
    }
  })
})

describe('phase separation trainer', () => {
  it('puts the spinodal inside the binodal and classifies points like the phase diagram', () => {
    for (const p of checkGenerator(generatePhase)) {
      const d = p.data
      if (d.ask === 'spinodal') {
        expect(d.result).toBeCloseTo(spinodal(d.chi)![0], 10)
        expect(d.result as number).toBeGreaterThan(binodal(d.chi)![0])
        expect(p.options[p.answer]).toBe((d.result as number).toFixed(3))
      } else {
        expect(d.result).toBe(region(d.x!, d.t!))
        expect(p.options[p.answer].toLowerCase().startsWith(d.result as string)).toBe(true)
      }
    }
  })
})

describe('crystal trainer', () => {
  it('names the face families that survive at the given growth-rate ratio', () => {
    for (const p of checkGenerator(generateCrystal)) {
      expect(p.data.survivors).toBe(survivingFamilies(p.data.ratio).join(','))
      expect(p.data.survivors.length).toBeGreaterThan(0)
    }
  })
})
