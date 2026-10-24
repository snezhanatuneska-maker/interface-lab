import { TOPICS, type Subtopic } from '../data/subtopics'

// Search and topic filter for the demo library (#/demos).

/** Lower-case and strip accents, so "debye" finds "Debye" and "cassie" finds "Cassie–Baxter". */
const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Every word of the query must appear in the title, the description or a concept tag. An empty query matches all. */
export function matchesQuery(s: Subtopic, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const text = normalize([s.title, s.description, ...s.concepts].join(' '))
  return words.every((w) => text.includes(w))
}

/** 'all', or the name of a topic in TOPICS. */
export type TopicFilter = string

export function filterDemos(list: Subtopic[], query: string, topic: TopicFilter): Subtopic[] {
  return list.filter((s) => (topic === 'all' || s.topic === topic) && matchesQuery(s, query))
}

/** Count of search matches for the "All" chip and each topic chip, in TOPICS order. */
export function chipCounts(list: Subtopic[], query: string): { id: TopicFilter; label: string; count: number }[] {
  const hits = filterDemos(list, query, 'all')
  return [
    { id: 'all', label: 'All', count: hits.length },
    ...TOPICS.map((t) => ({ id: t.name, label: t.name, count: hits.filter((s) => s.topic === t.name).length })),
  ]
}

/** Keyword suggested in the empty state; the tests check that it finds at least one demo. */
export const EXAMPLE_KEYWORD = 'contact angle'
