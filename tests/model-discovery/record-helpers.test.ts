import { describe, it, expect } from 'vitest'
import {
  nullableNumber,
  nullableString,
  resolveCoding,
} from '../../src/model-discovery/record-helpers'

describe('record-helpers', () => {
  it('when the AA benchmark has a coding score, uses it with source AA', () => {
    const result = resolveCoding(
      { intelligence: 40, coding: 60, agentic: 30 },
      undefined,
    )

    expect(result).toEqual({ coding: 60, source: 'AA' })
  })

  it('when the benchmark is missing, falls back to the Aider score', () => {
    const result = resolveCoding(undefined, 88)

    expect(result).toEqual({ coding: 88, source: 'Aider' })
  })

  it('when neither source is available, returns null', () => {
    const result = resolveCoding(undefined, undefined)

    expect(result).toEqual({ coding: null, source: null })
  })

  it('when a number is undefined, returns null', () => {
    const result = nullableNumber(undefined)

    expect(result).toBeNull()
  })

  it('when a number is defined, returns it', () => {
    const result = nullableNumber(100)

    expect(result).toBe(100)
  })

  it('when a string is undefined, returns null', () => {
    const result = nullableString(undefined)

    expect(result).toBeNull()
  })

  it('when a string is defined, returns it', () => {
    const result = nullableString('2025')

    expect(result).toBe('2025')
  })
})
