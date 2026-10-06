import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { spy } from '@std/testing/mock'
import { Keymap } from '../../../src/tui/interactions/keymap.ts'
import { ChatSession } from '../../../src/tui/interactions/state/chat-session.ts'
import { chatSession } from '../../../src/tui/interactions/state.ts'

describe('Keymap', () => {
  it('when ctrl+c arrives, quits', () => {
    const session = new ChatSession(80)
    const exit = spy()
    const keymap = new Keymap(exit, session)

    keymap.handle('c', { ctrl: true })

    expect(exit.calls.length).toBe(1)
    expect(session.history.value).toEqual([])
  })

  it('when shift+return arrives, inserts a newline', () => {
    const session = new ChatSession(80)
    const keymap = new Keymap(spy(), session)

    keymap.handle('\r', { return: true, shift: true })

    expect(session.buffer.value.text).toBe('\n')
  })

  it('when meta+return arrives, inserts a newline', () => {
    const session = new ChatSession(80)
    const keymap = new Keymap(spy(), session)

    keymap.handle('\r', { return: true, meta: true })

    expect(session.buffer.value.text).toBe('\n')
  })

  it('when ctrl+j arrives as a bare linefeed, inserts a newline', () => {
    const session = new ChatSession(80)
    const keymap = new Keymap(spy(), session)

    keymap.handle('\n', {})

    expect(session.buffer.value.text).toBe('\n')
  })

  it('when bare return arrives, submits', () => {
    const session = new ChatSession(80)
    const keymap = new Keymap(spy(), session)

    keymap.handle('\r', { return: true })

    expect(session.history.value).toEqual([{ id: 'entry-0', text: '' }])
  })

  it('when backspace arrives, deletes backward', () => {
    const session = new ChatSession(80)
    const keymap = new Keymap(spy(), session)
    session.insert('ab')

    keymap.handle('', { backspace: true })

    expect(session.buffer.value.text).toBe('a')
  })

  it('when delete arrives, deletes forward', () => {
    const session = new ChatSession(80)
    const keymap = new Keymap(spy(), session)
    session.insert('ab')
    session.moveCursor('home')

    keymap.handle('', { delete: true })

    expect(session.buffer.value.text).toBe('b')
  })

  it('when arrows arrive, moves the cursor', () => {
    const session = new ChatSession(80)
    const keymap = new Keymap(spy(), session)
    session.insert('ab')

    keymap.handle('', { leftArrow: true })
    const left = session.buffer.value.cursor
    keymap.handle('', { rightArrow: true })

    expect(left).toBe(1)
    expect(session.buffer.value.cursor).toBe(2)
  })

  it('when home or end arrives, moves within the line', () => {
    const session = new ChatSession(80)
    const keymap = new Keymap(spy(), session)
    session.insert('ab')

    keymap.handle('', { home: true })
    const home = session.buffer.value.cursor
    keymap.handle('', { end: true })

    expect(home).toBe(0)
    expect(session.buffer.value.cursor).toBe(2)
  })

  it('when a ctrl-modified key has no binding, does nothing', () => {
    const session = new ChatSession(80)
    const exit = spy()
    const keymap = new Keymap(exit, session)

    keymap.handle('x', { ctrl: true })

    expect(session.buffer.value.text).toBe('')
    expect(exit.calls.length).toBe(0)
  })

  it('when a meta-modified key has no binding, does nothing', () => {
    const session = new ChatSession(80)
    const exit = spy()
    const keymap = new Keymap(exit, session)

    keymap.handle('a', { meta: true })

    expect(session.buffer.value.text).toBe('')
    expect(exit.calls.length).toBe(0)
  })

  it('when a kitty query reply leaks, does nothing', () => {
    const session = new ChatSession(80)
    const exit = spy()
    const keymap = new Keymap(exit, session)

    keymap.handle('[?0u', {})

    expect(session.buffer.value.text).toBe('')
    expect(exit.calls.length).toBe(0)
  })

  it('when a cursor position reply leaks, does nothing', () => {
    const session = new ChatSession(80)
    const exit = spy()
    const keymap = new Keymap(exit, session)

    keymap.handle('[1;2R', {})

    expect(session.buffer.value.text).toBe('')
    expect(exit.calls.length).toBe(0)
  })

  it('when input still carries an escape byte, does nothing', () => {
    const session = new ChatSession(80)
    const exit = spy()
    const keymap = new Keymap(exit, session)

    keymap.handle('\x1b[?0u', {})

    expect(session.buffer.value.text).toBe('')
    expect(exit.calls.length).toBe(0)
  })

  it('when a lone bracket arrives, inserts it', () => {
    const session = new ChatSession(80)
    const keymap = new Keymap(spy(), session)

    keymap.handle('[', {})

    expect(session.buffer.value.text).toBe('[')
  })

  it('when plain text arrives, inserts it', () => {
    const session = new ChatSession(80)
    const keymap = new Keymap(spy(), session)

    keymap.handle('hello', {})

    expect(session.buffer.value.text).toBe('hello')
  })

  it('when a multi-char paste arrives, inserts the whole chunk', () => {
    const session = new ChatSession(80)
    const keymap = new Keymap(spy(), session)

    keymap.handle('pasted text', {})

    expect(session.buffer.value.text).toBe('pasted text')
  })

  it('when no session is given, uses the singleton', () => {
    const exit = spy()
    const keymap = new Keymap(exit)

    keymap.handle('a', {})

    expect(chatSession.buffer.value.text).toBe('a')
    chatSession.backspace()
  })
})
