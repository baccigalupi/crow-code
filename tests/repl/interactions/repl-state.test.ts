import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  initialReplState,
  updateRepl,
} from '../../../src/repl/interactions/repl-state.ts'

describe('repl state', () => {
  it('when submitting twice, appends entry-0 and entry-1', () => {
    const typed = updateRepl(
      initialReplState(),
      { kind: 'insert', text: 'hi' },
      80,
    )

    const first = updateRepl(typed, { kind: 'submit' }, 80)
    const second = updateRepl(
      updateRepl(first, { kind: 'insert', text: 'yo' }, 80),
      { kind: 'submit' },
      80,
    )

    expect(second.history[0].id).toBe('entry-0')
    expect(second.history[1].id).toBe('entry-1')
    expect(second.history[0].text).toBe('hi')
    expect(second.history[1].text).toBe('yo')
    expect(second.buffer).toEqual({ text: '', cursor: 0 })
    expect(second.inputRows).toBe(1)
  })

  it('when submitting after a newline, keeps the newline in text', () => {
    const typed = updateRepl(
      updateRepl(initialReplState(), { kind: 'insert', text: 'a' }, 80),
      { kind: 'newline' },
      80,
    )

    const done = updateRepl(
      updateRepl(typed, { kind: 'insert', text: 'b' }, 80),
      { kind: 'submit' },
      80,
    )

    expect(done.history[0].text).toBe('a\nb')
  })

  it('when the terminal widens, input rows shrink on resize', () => {
    const wide = updateRepl(
      initialReplState(),
      { kind: 'insert', text: 'x'.repeat(200) },
      80,
    )

    const resized = updateRepl(wide, { kind: 'resize' }, 400)

    expect(wide.inputRows).toBe(3)
    expect(resized.inputRows).toBe(1)
  })

  it('when backspacing, removes the char before the cursor', () => {
    const typed = updateRepl(
      initialReplState(),
      { kind: 'insert', text: 'ab' },
      80,
    )

    const next = updateRepl(typed, { kind: 'backspace' }, 80)

    expect(next.buffer.text).toBe('a')
  })

  it('when deleting, removes the char under the cursor', () => {
    const typed = updateRepl(
      initialReplState(),
      { kind: 'insert', text: 'ab' },
      80,
    )
    const home = updateRepl(typed, { kind: 'move', to: 'home' }, 80)

    const next = updateRepl(home, { kind: 'delete' }, 80)

    expect(next.buffer.text).toBe('b')
  })

  it('when quitting, returns state unchanged', () => {
    const state = initialReplState()

    const next = updateRepl(state, { kind: 'quit' }, 80)

    expect(next).toBe(state)
  })
})
