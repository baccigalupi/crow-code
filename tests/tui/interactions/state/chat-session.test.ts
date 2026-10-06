import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { ChatSession } from '../../../../src/tui/interactions/state/chat-session.ts'

describe('ChatSession', () => {
  it('when submitting twice, appends entry-0 and entry-1', () => {
    const session = new ChatSession(80)

    session.insert('hi')
    session.submit()
    session.insert('yo')
    session.submit()

    expect(session.history.value[0].id).toBe('entry-0')
    expect(session.history.value[1].id).toBe('entry-1')
    expect(session.history.value[0].text).toBe('hi')
    expect(session.history.value[1].text).toBe('yo')
    expect(session.buffer.value).toEqual({ text: '', cursor: 0 })
    expect(session.inputRows.value).toBe(1)
  })

  it('when submitting after a newline, keeps the newline in text', () => {
    const session = new ChatSession(80)

    session.insert('a')
    session.newline()
    session.insert('b')
    session.submit()

    expect(session.history.value[0].text).toBe('a\nb')
  })

  it('when the terminal widens, input rows shrink on resize', () => {
    const session = new ChatSession(80)

    session.insert('x'.repeat(200))
    const before = session.inputRows.value
    session.resize(400)

    expect(before).toBe(3)
    expect(session.inputRows.value).toBe(1)
  })

  it('when backspacing, removes the char before the cursor', () => {
    const session = new ChatSession(80)

    session.insert('ab')
    session.backspace()

    expect(session.buffer.value.text).toBe('a')
  })

  it('when deleting at home, removes the char under the cursor', () => {
    const session = new ChatSession(80)

    session.insert('ab')
    session.moveCursor('home')
    session.delete()

    expect(session.buffer.value.text).toBe('b')
  })

  it('when moving the cursor, leaves text and rows unchanged', () => {
    const session = new ChatSession(80)

    session.insert('ab')
    session.moveCursor('left')

    expect(session.buffer.value).toEqual({ text: 'ab', cursor: 1 })
    expect(session.inputRows.value).toBe(1)
  })

  it('notifies buffer subscribers on change and stops after dispose', () => {
    const session = new ChatSession(80)
    const seen: string[] = []
    const dispose = session.buffer.subscribe((buffer) => {
      seen.push(buffer.text)
    })

    session.insert('a')
    dispose()
    session.insert('b')

    expect(seen).toEqual(['', 'a'])
  })
})
