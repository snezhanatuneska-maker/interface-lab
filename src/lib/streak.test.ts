import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadStreak, nextStreak, saveStreak } from './streak'

describe('training streaks', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('extends on a right answer, resets on a wrong one, and keeps the best', () => {
    let s = { current: 0, best: 0 }
    for (const ok of [true, true, true, false, true]) s = nextStreak(s, ok)
    expect(s).toEqual({ current: 1, best: 3 })
  })

  it('saves and loads per trainer', () => {
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) })
    saveStreak('bet', { current: 2, best: 5 })
    expect(loadStreak('bet')).toEqual({ current: 2, best: 5 })
    expect(loadStreak('wetting')).toEqual({ current: 0, best: 0 })
  })

  it('still works when storage is missing, throws, or holds junk', () => {
    expect(loadStreak('bet')).toEqual({ current: 0, best: 0 }) // no localStorage in this test environment
    expect(() => saveStreak('bet', { current: 1, best: 1 })).not.toThrow()
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    })
    expect(loadStreak('bet')).toEqual({ current: 0, best: 0 })
    expect(() => saveStreak('bet', { current: 1, best: 1 })).not.toThrow()
    vi.stubGlobal('localStorage', { getItem: () => '{"current":"x","best":-3}', setItem: () => {} })
    expect(loadStreak('bet')).toEqual({ current: 0, best: 0 })
  })
})
