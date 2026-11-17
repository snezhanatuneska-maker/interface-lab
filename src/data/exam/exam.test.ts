import { describe, expect, it } from 'vitest'
import { EXAM_TOPICS, examAt, partPoints } from './index'
import { LIQUID_INTERFACES_EXAM as E, T1, t1Ar, t1Delta, t1Dcrit, t1Pc } from './liquidInterfaces'

describe('exam practice: Liquid Interfaces', () => {
  it('Task 1 (a), (c), (d), (e) with the calculated and the fallback angle', () => {
    expect(t1Delta).toBeCloseTo(45.77, 1)
    expect(t1Ar(t1Delta)).toBeCloseTo(1.329, 2)
    expect(t1Ar(T1.fallback)).toBeCloseTo(1.442, 2)
    expect(t1Pc(t1Delta) / 1e5).toBeCloseTo(1.144, 2)
    expect(t1Pc(T1.fallback) / 1e5).toBeCloseTo(1.054, 2)
    expect(t1Dcrit(t1Delta) * 1e6).toBeCloseTo(5.72, 1)
    expect(t1Dcrit(T1.fallback) * 1e6).toBeCloseTo(5.27, 1)
  })

  it('points as in the exam: Task 1 = 11, Task 2 (a, b, f) = 4, total 15; marking adds up per part', () => {
    const [t1, t2] = E.tasks
    expect(t1.parts.reduce((s, p) => s + p.points, 0)).toBe(11)
    expect(t2.parts.reduce((s, p) => s + p.points, 0)).toBe(4)
    expect(t2.parts.map((p) => p.id)).toEqual(['a', 'b', 'f'])
    expect(partPoints(E)).toBe(15)
    for (const p of [...t1.parts, ...t2.parts]) expect(p.marking.reduce((s, m) => s + m.points, 0), p.id).toBe(p.points)
  })

  it('accepts the carry-forward answers, and only Liquid Interfaces is listed', () => {
    const c = E.tasks[0].parts.find((p) => p.id === 'c')!
    expect(c.numeric!.accept.map((a) => a.value)).toEqual([t1Ar(t1Delta), t1Ar(T1.fallback)])
    expect(EXAM_TOPICS.map((t) => t.id)).toEqual(['liquid-interfaces'])
    expect(examAt('/exam/liquid-interfaces')).toBe(E)
    // no Langmuir parts (Task 2 c–e) and no other chapters
    expect(JSON.stringify(E.tasks.flatMap((t) => t.parts))).not.toMatch(/Langmuir isotherm|particle size distribution/i)
  })
})
