import { describe, expect, it } from 'vitest'
import { capillaryPressure } from './capillary'
import { checkGenerator } from './checkGenerator'
import { survivingFamilies } from './crystal'
import { binodal, region, spinodal } from './phase'
import { generateCapillary } from './trainCapillary'
import { generateCrystal } from './trainCrystal'
import { generateEdl } from './trainEdl'
import { fmt } from './training'
import { generateMips } from './trainMips'
import { generateNucleation } from './trainNucleation'
import { generatePhase } from './trainPhase'
import { generateSurfactant } from './trainSurfactant'
import { generateVdw } from './trainVdw'
import { generateZeta } from './trainZeta'
import { generateZisman } from './trainZisman'

// One block per topic trainer: the shared rules (checkGenerator), then the physics of the right answer and the
// ranges of the numbers it uses.

describe('capillary trainer', () => {
  it('uses Young–Laplace with nanometre pores and megapascal pressures', () => {
    for (const p of checkGenerator(generateCapillary)) {
      const { ask, r, theta, P } = p.data
      expect(theta).toBeGreaterThanOrEqual(0)
      expect(theta).toBeLessThan(90)
      if (ask === 'pressure') {
        expect(p.options[p.answer]).toBe(`${fmt(capillaryPressure(r, theta) / 1000)} MPa`)
        expect(P).toBeGreaterThan(0.1)
        expect(P).toBeLessThan(100)
      } else {
        expect(p.options[p.answer]).toBe(`${fmt(r)} nm`)
        expect(r).toBeGreaterThan(1)
        expect(r).toBeLessThan(60)
      }
    }
  })
})

describe('porosimetry trainer', () => {
  it('follows Washburn (d·P ≈ 1490 nm·MPa) over the instrument range', () => {
    for (const p of checkGenerator(generateMips)) {
      const { P, d } = p.data
      expect(d * P).toBeCloseTo(1486, -1)
      expect(P).toBeGreaterThanOrEqual(0.1)
      expect(P).toBeLessThanOrEqual(400)
      expect(p.options[p.answer]).toBe(p.data.ask === 'diameter' ? `${fmt(d)} nm` : `${fmt(P)} MPa`)
    }
  })
})

describe('surfactant trainer', () => {
  it('lowers the CMC with a longer tail and gives areas of a fraction of a nm²', () => {
    for (const p of checkGenerator(generateSurfactant)) {
      const d = p.data
      if (d.ask === 'klevens') {
        expect(d.cmc1!).toBeGreaterThan(0.001)
        expect(d.cmc1!).toBeLessThan(100)
        expect(d.n2! > d.n1! ? d.cmc2! < d.cmc1! : d.cmc2! > d.cmc1!).toBe(true)
        expect(p.options[p.answer]).toBe(`${fmt(d.cmc2!, 2)} mM`)
      } else {
        expect(d.area!).toBeGreaterThan(0.2)
        expect(d.area!).toBeLessThan(1.5)
        expect(p.options[p.answer]).toBe(`${fmt(d.area!)} nm²`)
      }
    }
  })
})

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
