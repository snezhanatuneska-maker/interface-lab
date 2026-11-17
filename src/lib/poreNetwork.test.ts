import { describe, expect, it } from 'vitest'
import { NETWORK_PRESETS } from '../pages/CapillaryPage'
import { pressureCurves } from './poreNetwork'

const water = { gamma: 0.072, delta: 0 }

describe('pore-network capillary pressure curve', () => {
  it('ink-bottle pore: the neck decides drainage, the body decides imbibition', () => {
    const net = NETWORK_PRESETS.find((p) => p.id === 'inkpot')!.net
    const { thresholds, drainage, imbibition } = pressureCurves(net, water)
    expect(thresholds.map((t) => t / 1e5)).toEqual([0.72, 2.88])
    expect(drainage.map((p) => p.S)).toEqual([1, 1, 0]) // nothing drains until the neck does
    expect(imbibition.map((p) => p.S)).toEqual([1, 0, 0]) // the body fills only below its own p_c
  })

  it('straight capillaries have no hysteresis', () => {
    const net = NETWORK_PRESETS.find((p) => p.id === 'parallel')!.net
    const { drainage, imbibition } = pressureCurves(net, water)
    expect(drainage.map((p) => p.S)).toEqual(imbibition.map((p) => p.S))
  })

  it('drainage S never rises with Δp, imbibition lies on or below drainage', () => {
    for (const { net } of NETWORK_PRESETS) {
      const { drainage, imbibition } = pressureCurves(net, water)
      for (let k = 1; k < drainage.length; k++) expect(drainage[k].S).toBeLessThanOrEqual(drainage[k - 1].S + 1e-12)
      drainage.forEach((p, k) => expect(imbibition[k].S).toBeLessThanOrEqual(p.S + 1e-12))
    }
  })
})
