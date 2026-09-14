import { describe, it, expect } from 'vitest'
import { formatCost, formatScore, padLeft, padRight } from '../src/render'

describe('render', () => {
  it('when a score is null, shows n/a', () => {
    const result = formatScore(null)

    expect(result).toBe('n/a')
  })

  it('when a score is a number, rounds to one decimal', () => {
    const result = formatScore(68.81)

    expect(result).toBe('68.8')
  })

  it('when both costs are zero, shows free', () => {
    const result = formatCost(0, 0)

    expect(result).toBe('free')
  })

  it('when costs are set, shows dollars per million', () => {
    const result = formatCost(0.5, 1.5)

    expect(result).toBe('$0.50/1.50')
  })

  it('when a string is shorter than the width, pads on the right', () => {
    const result = padRight('a', 4)

    expect(result).toBe('a   ')
  })

  it('when a string is shorter than the width, pads on the left', () => {
    const result = padLeft('1', 4)

    expect(result).toBe('   1')
  })
})
