import { describe, expect, it, mock } from 'bun:test'
import { Navigator } from '../../../src/tui/install/navigator.ts'

describe('Navigator', () => {
  it('when built, current is the initial step', () => {
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      entered: mock(),
    })

    const result = navigator.current.peek()

    expect(result).toBe('a')
  })

  it('when goTo is called, current is that step', () => {
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      entered: mock(),
    })

    navigator.goTo('b')

    expect(navigator.current.peek()).toBe('b')
  })

  it('when a step is entered, reports it', () => {
    const entered = mock()
    const navigator = new Navigator<'a' | 'b'>({ initial: 'a', entered })

    navigator.goTo('b')

    expect(entered.mock.calls).toEqual([['b']])
  })
})
