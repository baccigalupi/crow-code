import { describe, expect, it, mock } from 'bun:test'
import { Navigator } from '../../src/tui/navigator.ts'

describe('Navigator', () => {
  it('when built, current is the initial panel', () => {
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: { a: {}, b: {} },
    })

    const result = navigator.current.peek()

    expect(result).toBe('a')
  })

  it('when goTo is called, current is that panel', () => {
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: { a: {}, b: {} },
    })

    navigator.goTo('b')

    expect(navigator.current.peek()).toBe('b')
  })

  it('when a panel is entered, calls its entered with the navigator', () => {
    const entered = mock()
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: { a: {}, b: { entered } },
    })

    navigator.goTo('b')

    expect(entered.mock.calls).toEqual([[navigator]])
  })
})
