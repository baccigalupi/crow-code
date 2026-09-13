import { describe, it, expect } from 'vitest'
import { sum } from '../src/sum'

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(2, 3)).toBe(5)
  })

  it('handles negative numbers', () => {
    expect(sum(-1, 1)).toBe(0)
  })

  it('handles zero', () => {
    expect(sum(0, 0)).toBe(0)
  })
})
