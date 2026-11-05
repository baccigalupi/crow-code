import { describe, expect, it } from 'bun:test'
import { PasteEvent } from '@opentui/core'
import { keypressFromPaste } from '../../../../../src/tui/install/interactions/listeners/keypress-from-paste.ts'

describe('keypressFromPaste', () => {
  it('when the paste has newlines, the input drops them', () => {
    const event = new PasteEvent(new TextEncoder().encode('sk-1\r\n23\n'))

    const keypress = keypressFromPaste(event)

    expect(keypress.input).toBe('sk-123')
    expect(keypress.key).toEqual({})
  })

  it('when the paste has ansi sequences, the input drops them', () => {
    const event = new PasteEvent(new TextEncoder().encode('\x1b[31mred\x1b[0m'))

    const keypress = keypressFromPaste(event)

    expect(keypress.input).toBe('red')
  })
})
