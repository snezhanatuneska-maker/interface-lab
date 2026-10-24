import { groupByTopic, type Subtopic } from '../data/subtopics'
import type { Trainer } from '../data/trainers'

// Side menu content, built from src/data/subtopics.ts and src/data/trainers.ts (nothing is hard-coded here).

export interface MenuLink {
  title: string
  href: string
}

export interface MenuSection {
  heading: string
  links: MenuLink[]
}

/** One section per topic (TOPICS order, finished pages only), then the Training section (always present). */
export function buildMenu(subtopics: Subtopic[], trainers: Trainer[]): MenuSection[] {
  const topics = groupByTopic(subtopics.filter((s) => s.href)).map(({ topic, subtopics: list }) => ({
    heading: topic.name,
    links: list.map((s) => ({ title: s.title, href: s.href! })),
  }))
  return [...topics, { heading: 'Training', links: trainers.map((t) => ({ title: t.title, href: t.href })) }]
}

/**
 * Whether a link points at the current route. "#/" also covers the homepage's "#upcoming" tab;
 * a section index such as "#/training" is current only on itself, not on its sub-pages.
 */
export function isCurrent(href: string, route: string): boolean {
  const path = href.replace(/^#/, '')
  if (path === '/') return route === '/' || route === 'upcoming'
  return route === path
}

/** Whether the route is inside a header section: "#/training" covers "/training" and "/training/bet". */
export function inSection(href: string, route: string): boolean {
  const path = href.replace(/^#/, '')
  return isCurrent(href, route) || (path !== '/' && route.startsWith(path + '/'))
}
