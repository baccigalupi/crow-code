import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../src/tui/install/keypress.ts'

describe('Keypress', () => {
  it('when c arrives with ctrl, is quit', () => {
    const keypress = new Keypress('c', { ctrl: true })

    const result = keypress.isQuit()

    expect(result).toBe(true)
  })

  it('when c arrives alone, is not quit', () => {
    const keypress = new Keypress('c', {})

    const result = keypress.isQuit()

    expect(result).toBe(false)
  })

  it('when the escape flag is set, is escape', () => {
    const keypress = new Keypress('', { escape: true })

    const result = keypress.isEscape()

    expect(result).toBe(true)
  })

  it('when a raw escape character arrives, is escape', () => {
    const keypress = new Keypress('\x1b', {})

    const result = keypress.isEscape()

    expect(result).toBe(true)
  })

  it('when x arrives, is not escape', () => {
    const keypress = new Keypress('x', {})

    const result = keypress.isEscape()

    expect(result).toBe(false)
  })
})
