import { describe, it, expect } from 'vitest'
import { isLocked } from './lock'

describe('isLocked', () => {
  it("verrouillé si le coup d'envoi est passé", () => {
    expect(isLocked('2020-01-01T00:00:00Z', new Date('2026-06-08'))).toBe(true)
  })
  it("ouvert si le coup d'envoi est futur", () => {
    expect(isLocked('2030-01-01T00:00:00Z', new Date('2026-06-08'))).toBe(false)
  })
})
