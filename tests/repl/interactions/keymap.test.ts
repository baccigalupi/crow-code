import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { keyToAction } from '../../../src/repl/interactions/keymap.ts'

describe('keyToAction', () => {
  it('when ctrl+c arrives, quits', () => {
    const key = { ctrl: true }

    const action = keyToAction('c', key)

    expect(action).toEqual({ kind: 'quit' })
  })

  it('when shift+return arrives, inserts a newline', () => {
    const key = { return: true, shift: true }

    const action = keyToAction('\r', key)

    expect(action).toEqual({ kind: 'newline' })
  })

  it('when meta+return arrives, inserts a newline', () => {
    const key = { return: true, meta: true }

    const action = keyToAction('\r', key)

    expect(action).toEqual({ kind: 'newline' })
  })

  it('when ctrl+j arrives as a bare linefeed, inserts a newline', () => {
    const key = {}

    const action = keyToAction('\n', key)

    expect(action).toEqual({ kind: 'newline' })
  })

  it('when bare return arrives, submits', () => {
    const key = { return: true }

    const action = keyToAction('\r', key)

    expect(action).toEqual({ kind: 'submit' })
  })

  it('when backspace arrives, deletes backward', () => {
    const key = { backspace: true }

    const action = keyToAction('', key)

    expect(action).toEqual({ kind: 'backspace' })
  })

  it('when delete arrives, deletes forward', () => {
    const key = { delete: true }

    const action = keyToAction('', key)

    expect(action).toEqual({ kind: 'delete' })
  })

  it('when arrows arrive, moves the cursor', () => {
    const left = { leftArrow: true }
    const right = { rightArrow: true }

    const leftAction = keyToAction('', left)
    const rightAction = keyToAction('', right)

    expect(leftAction).toEqual({ kind: 'move', to: 'left' })
    expect(rightAction).toEqual({ kind: 'move', to: 'right' })
  })

  it('when home or end arrives, moves within the line', () => {
    const home = { home: true }
    const end = { end: true }

    const homeAction = keyToAction('', home)
    const endAction = keyToAction('', end)

    expect(homeAction).toEqual({ kind: 'move', to: 'home' })
    expect(endAction).toEqual({ kind: 'move', to: 'end' })
  })

  it('when a ctrl-modified key has no binding, returns null', () => {
    const key = { ctrl: true }

    const action = keyToAction('x', key)

    expect(action).toBeNull()
  })

  it('when a meta-modified key has no binding, returns null', () => {
    const key = { meta: true }

    const action = keyToAction('a', key)

    expect(action).toBeNull()
  })

  it('when a kitty query reply leaks, returns null', () => {
    const key = {}

    const action = keyToAction('[?0u', key)

    expect(action).toBeNull()
  })

  it('when a cursor position reply leaks, returns null', () => {
    const key = {}

    const action = keyToAction('[1;2R', key)

    expect(action).toBeNull()
  })

  it('when input still carries an escape byte, returns null', () => {
    const key = {}

    const action = keyToAction('\x1b[?0u', key)

    expect(action).toBeNull()
  })

  it('when a lone bracket arrives, inserts it', () => {
    const key = {}

    const action = keyToAction('[', key)

    expect(action).toEqual({ kind: 'insert', text: '[' })
  })

  it('when plain text arrives, inserts it', () => {
    const key = {}

    const action = keyToAction('hello', key)

    expect(action).toEqual({ kind: 'insert', text: 'hello' })
  })

  it('when a multi-char paste arrives, inserts the whole chunk', () => {
    const key = {}

    const action = keyToAction('pasted text', key)

    expect(action).toEqual({ kind: 'insert', text: 'pasted text' })
  })
})
