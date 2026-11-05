import { describe, expect, it } from 'bun:test'
import { Keypress } from '../../../../src/tui/keypress.ts'
import { TextEditor } from '../../../../src/tui/install/text-prompt/text-editor.ts'
import { TextFieldStore } from '../../../../src/tui/install/interactions/data-stores/text-field-store.ts'

describe('TextEditor', () => {
  it('when text is inserted, appends at the cursor', () => {
    const field = new TextFieldStore()

    new TextEditor({ field, keypress: new Keypress('ab', {}) }).edit()

    expect(field.text.peek().text).toBe('ab')
  })

  it('when backspace arrives, deletes the previous char', () => {
    const field = new TextFieldStore()
    field.insert('ab')

    new TextEditor({
      field,
      keypress: new Keypress('', { backspace: true }),
    }).edit()

    expect(field.text.peek().text).toBe('a')
  })

  it('when delete arrives, removes the char under the cursor', () => {
    const field = new TextFieldStore()
    field.insert('ab')

    new TextEditor({
      field,
      keypress: new Keypress('', { leftArrow: true }),
    }).edit()
    new TextEditor({
      field,
      keypress: new Keypress('', { delete: true }),
    }).edit()

    expect(field.text.peek().text).toBe('a')
  })

  it('when a ctrl-modified char arrives, does not insert', () => {
    const field = new TextFieldStore()
    field.insert('a')

    new TextEditor({
      field,
      keypress: new Keypress('x', { ctrl: true }),
    }).edit()

    expect(field.text.peek().text).toBe('a')
  })

  it('when a meta-modified char arrives, does not insert', () => {
    const field = new TextFieldStore()
    field.insert('a')

    new TextEditor({
      field,
      keypress: new Keypress('x', { meta: true }),
    }).edit()

    expect(field.text.peek().text).toBe('a')
  })

  it('when a key arrives with no input, nothing changes', () => {
    const field = new TextFieldStore()
    field.insert('a')

    new TextEditor({ field, keypress: new Keypress('', {}) }).edit()

    expect(field.text.peek().text).toBe('a')
  })

  it('when arrows arrive, moves the cursor', () => {
    const field = new TextFieldStore()
    field.insert('ab')

    new TextEditor({
      field,
      keypress: new Keypress('', { leftArrow: true }),
    }).edit()
    new TextEditor({
      field,
      keypress: new Keypress('', { rightArrow: true }),
    }).edit()

    expect(field.text.peek().cursor).toBe(2)
  })

  it('when home and end arrive, moves the cursor to the edges', () => {
    const field = new TextFieldStore()
    field.insert('ab')

    new TextEditor({ field, keypress: new Keypress('', { home: true }) }).edit()
    new TextEditor({ field, keypress: new Keypress('', { end: true }) }).edit()

    expect(field.text.peek().cursor).toBe(2)
  })
})
