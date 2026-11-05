import { describe, expect, it, mock } from 'bun:test'
import { effect } from '@preact/signals-core'
import { TextFieldStore } from '../../../../../src/tui/install/interactions/data-stores/text-field-store.ts'

describe('TextFieldStore', () => {
  it('when new, holds empty text', () => {
    const field = new TextFieldStore()

    const text = field.text.peek()

    expect(text).toBe('')
  })

  it('when replaced, notifies watchers with the new text', () => {
    const field = new TextFieldStore()
    const watcher = mock()
    effect(() => watcher(field.text.value))

    field.replace('./crow')

    expect(watcher.mock.calls).toEqual([[''], ['./crow']])
  })

  it('when cleared, empties the text', () => {
    const field = new TextFieldStore()
    field.replace('~/x')

    field.clear()

    expect(field.text.peek()).toBe('')
  })
})
