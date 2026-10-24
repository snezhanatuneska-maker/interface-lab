import { describe, expect, it } from 'vitest'
import appSource from '../App.tsx?raw'
import { CONFIGS } from '../pages/training/configs'
import { SUBTOPICS, TOOLS, TOPICS } from './subtopics'
import { trainerAt, TRAINERS } from './trainers'

describe('trainers', () => {
  it('have unique ids and routes, a known topic and subtopic, and a generator', () => {
    expect(new Set(TRAINERS.map((t) => t.id)).size).toBe(TRAINERS.length)
    expect(new Set(TRAINERS.map((t) => t.href)).size).toBe(TRAINERS.length)
    expect(Object.keys(CONFIGS).sort()).toEqual(TRAINERS.map((t) => t.id).sort())
    for (const t of TRAINERS) {
      expect(TOPICS.map((x) => x.name)).toContain(t.topic)
      const s = SUBTOPICS.find((x) => x.id === t.subtopic)
      expect(s?.href, t.id).toBeDefined() // practises a finished page
      expect(s!.topic).toBe(t.topic)
      expect(t.href).toMatch(/^#\/training\/[a-z-]+$/)
      expect(trainerAt(t.href.slice(1))).toBe(t)
    }
    expect(appSource).toContain(`route === '/training'`)
    expect(appSource).toContain('trainerAt(route)')
  })

  it('cover every finished topic, and none of the upcoming ones', () => {
    for (const s of TOOLS) expect(TRAINERS.some((t) => t.subtopic === s.id), s.id).toBe(true)
  })
})
