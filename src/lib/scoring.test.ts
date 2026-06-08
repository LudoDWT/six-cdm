import { describe, it, expect } from 'vitest'
import { computePoints } from './scoring'

describe('computePoints', () => {
  it('score exact = 3', () => {
    expect(computePoints({ h: 2, a: 1 }, { h: 2, a: 1 })).toBe(3)
  })
  it('bon résultat (victoire dom) = 1', () => {
    expect(computePoints({ h: 2, a: 1 }, { h: 3, a: 0 })).toBe(1)
  })
  it('bon résultat (nul) = 1', () => {
    expect(computePoints({ h: 1, a: 1 }, { h: 0, a: 0 })).toBe(1)
  })
  it('mauvais résultat = 0', () => {
    expect(computePoints({ h: 2, a: 1 }, { h: 0, a: 2 })).toBe(0)
  })
  it('match non joué = null', () => {
    expect(computePoints({ h: 2, a: 1 }, null)).toBeNull()
  })
})
