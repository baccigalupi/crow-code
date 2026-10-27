import { describe, expect, it, mock } from 'bun:test'
import { effect } from '@preact/signals-core'
import { TextFieldStore } from '../../../../src/tui/install/data-stores/text-field-store.ts'

describe('TextFieldStore', () => {
  it('when text is inserted then deleted backward, keeps the text before the cursor', () => {
    const field = new TextFieldStore()
    field.insert('~/x')

    field.deleteBackward()

    expect(field.text.peek()).toEqual({ text: '~/', cursor: 2 })
  })

  it('when moved home then deleted forward, drops the first character', () => {
    const field = new TextFieldStore()
    field.insert('~/x')
    field.move('home')

    field.deleteForward()

    expect(field.text.peek()).toEqual({ text: '/x', cursor: 0 })
  })

  it('when several characters are inserted, notifies watchers once', () => {
    const field = new TextFieldStore()
    const watcher = mock()
    effect(() => watcher(field.text.value))

    field.insert('abc')

    expect(watcher.mock.calls).toEqual([
      [{ text: '', cursor: 0 }],
      [{ text: 'abc', cursor: 3 }],
    ])
  })

  it('when cleared, empties the text', () => {
    const field = new TextFieldStore()
    field.insert('~/x')

    field.clear()

    expect(field.text.peek()).toEqual({ text: '', cursor: 0 })
  })
})
