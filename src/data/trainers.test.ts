import { describe, expect, it } from 'vitest'
import appSource from '../App.tsx?raw'
import { TOPICS } from './subtopics'
import { TRAINERS } from './trainers'

describe('trainers', () => {
  it('have unique ids, known topics and a route that App.tsx renders', () => {
    expect(new Set(TRAINERS.map((t) => t.id)).size).toBe(TRAINERS.length)
    for (const t of TRAINERS) {
      expect(TOPICS.map((x) => x.name)).toContain(t.topic)
      expect(t.href).toMatch(/^#\/training\//)
      expect(appSource).toContain(`route === '${t.href.slice(1)}'`)
    }
    expect(appSource).toContain(`route === '/training'`)
  })
})
