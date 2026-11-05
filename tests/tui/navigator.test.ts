import { describe, expect, it, mock } from 'bun:test'
import { effect, signal } from '@preact/signals-core'
import { Keypress } from '../../src/tui/keypress.ts'
import { Navigator } from '../../src/tui/navigator.ts'

describe('Navigator', () => {
  it('when built, current is the initial panel', () => {
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: {
        a: { controller: { handle: () => 'stay' } },
        b: { controller: { handle: () => 'stay' } },
      },
    })

    const result = navigator.current.peek()

    expect(result).toBe('a')
  })

  it('when goTo is called, current is that panel', () => {
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: {
        a: { controller: { handle: () => 'stay' } },
        b: { controller: { handle: () => 'stay' } },
      },
    })

    navigator.goTo('b')

    expect(navigator.current.peek()).toBe('b')
  })

  it('when ctrl-c arrives, calls exit once and no controller', () => {
    const handle = mock(() => 'stay' as const)
    const exit = mock()
    const navigator = new Navigator<'a'>({
      initial: 'a',
      panels: { a: { controller: { handle } } },
    })

    navigator.press(new Keypress('c', { ctrl: true }), exit)

    expect(exit).toHaveBeenCalledTimes(1)
    expect(handle).toHaveBeenCalledTimes(0)
  })

  it('when a key arrives, the current panel controller handles it', () => {
    const keypress = new Keypress('x', {})
    const handleA = mock(() => 'stay' as const)
    const handleB = mock(() => 'stay' as const)
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: {
        a: { controller: { handle: handleA } },
        b: { controller: { handle: handleB } },
      },
    })

    navigator.press(keypress, mock())

    expect(handleA).toHaveBeenCalledWith(keypress)
    expect(handleB).toHaveBeenCalledTimes(0)
  })

  it('when the controller says next, goes to the next target', () => {
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: {
        a: { controller: { handle: () => 'next' }, next: 'b' },
        b: { controller: { handle: () => 'stay' } },
      },
    })

    navigator.press(new Keypress('x', {}), mock())

    expect(navigator.current.peek()).toBe('b')
  })

  it('when the controller says next with no target, stays', () => {
    const exit = mock()
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: {
        a: { controller: { handle: () => 'next' } },
        b: { controller: { handle: () => 'stay' } },
      },
    })

    navigator.press(new Keypress('x', {}), exit)

    expect(navigator.current.peek()).toBe('a')
    expect(exit).toHaveBeenCalledTimes(0)
  })

  it('when the controller says cancel, goes to the cancel target', () => {
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: {
        a: { controller: { handle: () => 'cancel' }, cancel: 'b' },
        b: { controller: { handle: () => 'stay' } },
      },
    })

    navigator.press(new Keypress('x', {}), mock())

    expect(navigator.current.peek()).toBe('b')
  })

  it('when the controller says exit, calls exit and stays', () => {
    const exit = mock()
    const navigator = new Navigator<'a'>({
      initial: 'a',
      panels: { a: { controller: { handle: () => 'exit' } } },
    })

    navigator.press(new Keypress('x', {}), exit)

    expect(exit).toHaveBeenCalledTimes(1)
    expect(navigator.current.peek()).toBe('a')
  })

  it('when the controller says goTo, goes to the named panel', () => {
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: {
        a: { controller: { handle: () => ({ goTo: 'b' as const }) } },
        b: { controller: { handle: () => 'stay' } },
      },
    })

    navigator.press(new Keypress('x', {}), mock())

    expect(navigator.current.peek()).toBe('b')
  })

  it('when the controller says stay, nothing changes', () => {
    const exit = mock()
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: {
        a: { controller: { handle: () => 'stay' }, next: 'b' },
        b: { controller: { handle: () => 'stay' } },
      },
    })

    navigator.press(new Keypress('x', {}), exit)

    expect(navigator.current.peek()).toBe('a')
    expect(exit).toHaveBeenCalledTimes(0)
  })

  it('when the panel has no controller, a key changes nothing', () => {
    const exit = mock()
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: { a: { next: 'b' }, b: {} },
    })

    navigator.press(new Keypress('x', {}), exit)

    expect(navigator.current.peek()).toBe('a')
    expect(exit).toHaveBeenCalledTimes(0)
  })

  it('when a panel is entered, calls its entered with the navigator', () => {
    const entered = mock()
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: {
        a: { controller: { handle: () => 'stay' } },
        b: { controller: { handle: () => 'stay' }, entered },
      },
    })

    navigator.goTo('b')

    expect(entered.mock.calls).toEqual([[navigator]])
  })

  it('when a panel declares no entered, moving to it works', () => {
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: {
        a: { controller: { handle: () => 'stay' } },
        b: { controller: { handle: () => 'stay' } },
      },
    })

    navigator.goTo('b')

    expect(navigator.current.peek()).toBe('b')
  })

  it('when the controller says next, calls entered on the next panel', () => {
    const entered = mock()
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: {
        a: { controller: { handle: () => 'next' }, next: 'b' },
        b: { controller: { handle: () => 'stay' }, entered },
      },
    })

    navigator.press(new Keypress('x', {}), mock())

    expect(entered.mock.calls).toEqual([[navigator]])
  })

  it('when a controller writes and navigates, notifies once', () => {
    const count = signal('0')
    const seen: string[][] = []
    const navigator = new Navigator<'a' | 'b'>({
      initial: 'a',
      panels: {
        a: {
          controller: {
            handle: () => {
              count.value = '1'
              return 'next'
            },
          },
          next: 'b',
        },
        b: { controller: { handle: () => 'stay' } },
      },
    })
    effect(() => {
      seen.push([count.value, navigator.current.value])
    })

    navigator.press(new Keypress('x', {}), mock())

    expect(seen).toEqual([
      ['0', 'a'],
      ['1', 'b'],
    ])
  })
})
