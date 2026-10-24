import { describe, expect, it } from 'vitest'
import { SUBTOPICS, TOOLS, TOPICS } from '../data/subtopics'
import { TRAINERS } from '../data/trainers'
import { buildMenu, isCurrent } from './menu'

describe('side menu', () => {
  const menu = buildMenu(SUBTOPICS, TRAINERS)

  it('lists the topics in TOPICS order, then Training', () => {
    const order = TOPICS.map((t) => t.name).filter((n) => TOOLS.some((s) => s.topic === n))
    expect(menu.map((s) => s.heading)).toEqual([...order, 'Training'])
  })

  it('lists every finished page once and nothing else', () => {
    const links = menu.slice(0, -1).flatMap((s) => s.links.map((l) => l.href))
    expect(links.sort()).toEqual(TOOLS.map((s) => s.href!).sort())
  })

  it('keeps the Training section even with no trainers', () => {
    expect(buildMenu(SUBTOPICS, []).at(-1)).toEqual({ heading: 'Training', links: [] })
  })

  it('marks the current route', () => {
    expect(isCurrent('#/wetting', '/wetting')).toBe(true)
    expect(isCurrent('#/wetting', '/dlvo')).toBe(false)
    expect(isCurrent('#/', '/')).toBe(true)
    expect(isCurrent('#/', 'upcoming')).toBe(true)
    expect(isCurrent('#/', '/wetting')).toBe(false)
    expect(isCurrent('#/training', '/training/bet')).toBe(false)
  })
})
