import { describe, expect, it } from 'vitest'
import appSource from '../App.tsx?raw'
import { groupByTopic, SUBTOPICS, TOOLS, TOPICS, UPCOMING } from './subtopics'

describe('homepage subtopics', () => {
  it('puts every subtopic under a known topic, with unique ids', () => {
    const names = TOPICS.map((t) => t.name)
    for (const s of SUBTOPICS) expect(names).toContain(s.topic)
    expect(new Set(SUBTOPICS.map((s) => s.id)).size).toBe(SUBTOPICS.length)
  })

  it('links every finished tool to a route that App.tsx renders', () => {
    for (const s of TOOLS) {
      expect(s.href).toMatch(/^#\//)
      expect(appSource).toContain(`route === '${s.href!.slice(1)}'`)
    }
  })

  it('splits subtopics into Tools and Upcoming Projects by whether they have a page', () => {
    expect(TOOLS.length + UPCOMING.length).toBe(SUBTOPICS.length)
    expect(UPCOMING.every((s) => !s.href)).toBe(true)
  })

  it('groups in topic order and leaves out topics with nothing to show', () => {
    const groups = groupByTopic(UPCOMING)
    const order = TOPICS.map((t) => t.name)
    const shown = groups.map((g) => g.topic.name)
    expect(shown).toEqual(order.filter((n) => UPCOMING.some((s) => s.topic === n)))
    expect(groups.every((g) => g.subtopics.length > 0)).toBe(true)
    expect(groupByTopic([])).toEqual([])
  })
})
