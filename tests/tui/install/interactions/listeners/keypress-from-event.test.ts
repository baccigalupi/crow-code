import { describe, expect, it } from 'bun:test'
import type { KeyEvent } from '@opentui/core'
import { keypressFromEvent } from '../../../../../src/tui/install/interactions/listeners/keypress-from-event.ts'

describe('keypressFromEvent', () => {
  it('when a letter arrives, input is the letter', () => {
    const event = {
      name: 'x',
      sequence: 'x',
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: 'x',
      key: { ctrl: false, shift: false, meta: false },
    })
  })

  it('when return arrives, the return flag is set and input is empty', () => {
    const event = {
      name: 'return',
      sequence: '\r',
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: '',
      key: { ctrl: false, shift: false, meta: false, return: true },
    })
  })

  it('when backspace arrives, the backspace flag is set and input is empty', () => {
    const event = {
      name: 'backspace',
      sequence: '\x7f',
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: '',
      key: { ctrl: false, shift: false, meta: false, backspace: true },
    })
  })

  it('when delete arrives, the delete flag is set and input is empty', () => {
    const event = {
      name: 'delete',
      sequence: '\x1b[3~',
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: '',
      key: { ctrl: false, shift: false, meta: false, delete: true },
    })
  })

  it('when escape arrives, the escape flag is set and input is empty', () => {
    const event = {
      name: 'escape',
      sequence: '\x1b',
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: '',
      key: { ctrl: false, shift: false, meta: false, escape: true },
    })
  })

  it('when left arrives, the leftArrow flag is set and input is empty', () => {
    const event = {
      name: 'left',
      sequence: '\x1b[D',
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: '',
      key: { ctrl: false, shift: false, meta: false, leftArrow: true },
    })
  })

  it('when right arrives, the rightArrow flag is set and input is empty', () => {
    const event = {
      name: 'right',
      sequence: '\x1b[C',
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: '',
      key: { ctrl: false, shift: false, meta: false, rightArrow: true },
    })
  })

  it('when up arrives, the upArrow flag is set and input is empty', () => {
    const event = {
      name: 'up',
      sequence: '\x1b[A',
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: '',
      key: { ctrl: false, shift: false, meta: false, upArrow: true },
    })
  })

  it('when down arrives, the downArrow flag is set and input is empty', () => {
    const event = {
      name: 'down',
      sequence: '\x1b[B',
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: '',
      key: { ctrl: false, shift: false, meta: false, downArrow: true },
    })
  })

  it('when home arrives, the home flag is set and input is empty', () => {
    const event = {
      name: 'home',
      sequence: '\x1b[H',
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: '',
      key: { ctrl: false, shift: false, meta: false, home: true },
    })
  })

  it('when end arrives, the end flag is set and input is empty', () => {
    const event = {
      name: 'end',
      sequence: '\x1b[F',
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: '',
      key: { ctrl: false, shift: false, meta: false, end: true },
    })
  })

  it('when space arrives, input is a space', () => {
    const event = {
      name: 'space',
      sequence: ' ',
      ctrl: false,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: ' ',
      key: { ctrl: false, shift: false, meta: false },
    })
  })

  it('when an uppercase letter arrives, input is the uppercase letter and shift is set', () => {
    const event = {
      name: 'x',
      sequence: 'X',
      ctrl: false,
      meta: false,
      shift: true,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: 'X',
      key: { ctrl: false, shift: true, meta: false },
    })
  })

  it('when ctrl and a letter arrive, input is the letter and ctrl is set', () => {
    const event = {
      name: 'c',
      sequence: '\x03',
      ctrl: true,
      meta: false,
      shift: false,
      option: false,
    } as KeyEvent

    const result = keypressFromEvent(event)

    expect(result).toEqual({
      input: 'c',
      key: { ctrl: true, shift: false, meta: false },
    })
  })
})
