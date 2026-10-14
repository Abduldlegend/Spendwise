import { describe, expect, it } from 'vitest'
import { getFirstName, getGreeting } from './greeting'

describe('getGreeting', () => {
  const at = (hour, minute = 0) => new Date(2026, 0, 15, hour, minute)

  it('greets the morning before noon', () => {
    expect(getGreeting(at(0))).toBe('Good morning')
    expect(getGreeting(at(11, 59))).toBe('Good morning')
  })

  it('greets the afternoon from noon to before 18:00', () => {
    expect(getGreeting(at(12))).toBe('Good afternoon')
    expect(getGreeting(at(17, 59))).toBe('Good afternoon')
  })

  it('greets the evening from 18:00 onward', () => {
    expect(getGreeting(at(18))).toBe('Good evening')
    expect(getGreeting(at(23, 59))).toBe('Good evening')
  })
})

describe('getFirstName', () => {
  it('takes the first whitespace-delimited token', () => {
    expect(getFirstName('Dami Adebayo')).toBe('Dami')
    expect(getFirstName('  Damilola   Adebayo ')).toBe('Damilola')
  })

  it('falls back to a neutral name when empty', () => {
    expect(getFirstName('')).toBe('there')
    expect(getFirstName(undefined)).toBe('there')
  })
})
