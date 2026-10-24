// Current and best streak per trainer, kept in localStorage. Every access is wrapped in try/catch: with storage
// blocked (private mode, disabled cookies) or absent, the trainers still work and the streak lasts for the visit.

export interface Streak {
  current: number
  best: number
}

const EMPTY: Streak = { current: 0, best: 0 }
const key = (id: string) => `training-streak:${id}`

export function loadStreak(id: string): Streak {
  try {
    const raw = localStorage.getItem(key(id))
    if (!raw) return EMPTY
    const s = JSON.parse(raw) as Partial<Streak>
    const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0)
    return { current: n(s.current), best: Math.max(n(s.best), n(s.current)) }
  } catch {
    return EMPTY
  }
}

export function saveStreak(id: string, s: Streak): void {
  try {
    localStorage.setItem(key(id), JSON.stringify(s))
  } catch {
    // storage unavailable: keep the streak in memory only
  }
}

/** Streak after one answer: a right answer extends it (and maybe the best), a wrong one resets it. */
export function nextStreak(s: Streak, correct: boolean): Streak {
  const current = correct ? s.current + 1 : 0
  return { current, best: Math.max(s.best, current) }
}
