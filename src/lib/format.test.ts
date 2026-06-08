import { describe, it, expect } from 'vitest'
import { formatCountdown } from './format'

describe('formatCountdown', () => {
  it('affiche j/h/m', () => {
    const ms = ((2 * 24 + 3) * 60 + 15) * 60 * 1000
    expect(formatCountdown(ms)).toBe('2j 3h 15m')
  })
  it("affiche \"Coup d'envoi\" si <= 0", () => {
    expect(formatCountdown(-1)).toBe("Coup d'envoi")
  })
})
