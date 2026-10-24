import { describe, expect, it } from 'vitest'
import { TOOLS, TOPICS, type Subtopic } from '../data/subtopics'
import { chipCounts, EXAMPLE_KEYWORD, filterDemos, matchesQuery } from './demos'

const demo = (over: Partial<Subtopic>): Subtopic => ({
  id: 'x',
  title: 'Wetting & Contact Angle',
  topic: 'Liquid Interfaces',
  description: 'Tune surface energy and roughness.',
  concepts: ["Young's equation", 'Cassie–Baxter'],
  cepLink: '',
  href: '#/x',
  ...over,
})

describe('demo search', () => {
  it('matches title, description and concept tags, ignoring case and accents', () => {
    const s = demo({})
    expect(matchesQuery(s, 'WETTING')).toBe(true)
    expect(matchesQuery(s, 'roughness')).toBe(true)
    expect(matchesQuery(s, 'young')).toBe(true)
    expect(matchesQuery(s, 'cassie')).toBe(true)
    expect(matchesQuery(demo({ title: 'Zéta' }), 'zeta')).toBe(true)
    expect(matchesQuery(s, 'debye')).toBe(false)
  })

  it('needs every word of the query, and an empty query matches everything', () => {
    expect(matchesQuery(demo({}), 'contact roughness')).toBe(true)
    expect(matchesQuery(demo({}), 'contact debye')).toBe(false)
    expect(matchesQuery(demo({}), '   ')).toBe(true)
  })

  it('filters by topic as well as by query', () => {
    expect(filterDemos(TOOLS, '', 'all')).toEqual(TOOLS)
    for (const t of TOPICS) expect(filterDemos(TOOLS, '', t.name).every((s) => s.topic === t.name)).toBe(true)
    expect(filterDemos(TOOLS, 'debye', 'Liquid Interfaces')).toEqual([])
    expect(filterDemos(TOOLS, 'debye', 'Colloidal Systems').length).toBeGreaterThan(0)
  })

  it('counts matches per chip; the topic counts add up to All', () => {
    for (const q of ['', 'debye', 'nothing-matches-this']) {
      const [all, ...topics] = chipCounts(TOOLS, q)
      expect(all.id).toBe('all')
      expect(topics.map((c) => c.id)).toEqual(TOPICS.map((t) => t.name))
      expect(topics.reduce((a, c) => a + c.count, 0)).toBe(all.count)
    }
    expect(chipCounts(TOOLS, '')[0].count).toBe(TOOLS.length)
  })

  it('suggests an example keyword that finds something', () => {
    expect(filterDemos(TOOLS, EXAMPLE_KEYWORD, 'all').length).toBeGreaterThan(0)
  })
})
