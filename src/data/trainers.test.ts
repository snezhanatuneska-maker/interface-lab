import { describe, expect, it } from 'vitest'
import appSource from '../App.tsx?raw'
import { CONFIGS } from '../pages/training/configs'
import { EXERCISES } from '../pages/training/exercises'
import { SUBTOPICS, TOOLS, TOPICS } from './subtopics'
import { trainerAt, TRAINERS } from './trainers'

describe('trainers', () => {
  it('have unique ids and routes, a known topic and subtopic, and a generator', () => {
    expect(new Set(TRAINERS.map((t) => t.id)).size).toBe(TRAINERS.length)
    expect(new Set(TRAINERS.map((t) => t.href)).size).toBe(TRAINERS.length)
    expect(Object.keys(CONFIGS).sort()).toEqual(TRAINERS.filter((t) => t.kind !== 'exercise').map((t) => t.id).sort())
    expect(Object.keys(EXERCISES).sort()).toEqual(TRAINERS.filter((t) => t.kind === 'exercise').map((t) => t.id).sort())
    for (const t of TRAINERS) {
      expect(TOPICS.map((x) => x.name)).toContain(t.topic)
      const s = SUBTOPICS.find((x) => x.id === t.subtopic)
      expect(s?.href, t.id).toBeDefined() // practises a finished page
      expect(s!.topic).toBe(t.topic)
      expect(t.href).toMatch(/^#\/training\/[a-z0-9-]+$/)
      expect(trainerAt(t.href.slice(1))).toBe(t)
    }
    expect(appSource).toContain(`route === '/training'`)
    expect(appSource).toContain('trainerAt(route)')
  })

  it('cover every finished topic (mercury porosimetry is practised through Exercise 1.3 and the exam)', () => {
    for (const s of TOOLS) if (s.id !== 'mercury-porosimetry') expect(TRAINERS.some((t) => t.subtopic === s.id), s.id).toBe(true)
  })

  it('list Exercise Sheet 1 (1.1–1.4) for Liquid Interfaces and none of the old trainers', () => {
    const li = TRAINERS.filter((t) => t.topic === 'Liquid Interfaces')
    expect(li.map((t) => t.id)).toEqual(['exercise-1-1', 'exercise-1-2', 'exercise-1-3', 'exercise-1-4'])
    expect(li.every((t) => t.kind === 'exercise')).toBe(true)
  })
})
