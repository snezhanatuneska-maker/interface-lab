import { afterEach, describe, expect, it, vi } from 'vitest'
import { SUBTOPICS, TOOLS, TOPICS } from '../data/subtopics'
import { TRAINERS } from '../data/trainers'
import { buildMenu, inSection, isCurrent, loadMenuHidden, saveMenuHidden } from './menu'

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

  it('lists the trainers in the Training section', () => {
    expect(menu.at(-1)!.links.map((l) => l.href)).toEqual(TRAINERS.map((t) => t.href))
  })

  it('highlights a header section on its sub-pages', () => {
    expect(inSection('#/training', '/training/bet')).toBe(true)
    expect(inSection('#/training', '/training')).toBe(true)
    expect(inSection('#/training', '/trainingx')).toBe(false)
    expect(inSection('#/', '/wetting')).toBe(false)
  })
})

describe('hidden sidebar setting', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('is remembered, and defaults to shown when storage is missing or blocked', () => {
    expect(loadMenuHidden()).toBe(false) // no localStorage in this test environment
    expect(() => saveMenuHidden(true)).not.toThrow()
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) })
    saveMenuHidden(true)
    expect(loadMenuHidden()).toBe(true)
    saveMenuHidden(false)
    expect(loadMenuHidden()).toBe(false)
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
    })
    expect(loadMenuHidden()).toBe(false)
  })
})
