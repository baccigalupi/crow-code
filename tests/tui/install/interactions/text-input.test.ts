import { describe, expect, it } from 'bun:test'
import { TextInput } from '../../../../src/tui/install/interactions/text-input.ts'
import { TextFieldStore } from '../../../../src/tui/install/data-stores/text-field-store.ts'

describe('TextInput', () => {
  it('when text is inserted, appends at the cursor', () => {
    const field = new TextFieldStore()

    new TextInput({ field, input: 'ab', key: {} }).edit()

    expect(field.text.peek().text).toBe('ab')
  })

  it('when backspace arrives, deletes the previous char', () => {
    const field = new TextFieldStore()
    field.insert('ab')

    new TextInput({ field, input: '', key: { backspace: true } }).edit()

    expect(field.text.peek().text).toBe('a')
  })

  it('when delete arrives, removes the char under the cursor', () => {
    const field = new TextFieldStore()
    field.insert('ab')

    new TextInput({ field, input: '', key: { leftArrow: true } }).edit()
    new TextInput({ field, input: '', key: { delete: true } }).edit()

    expect(field.text.peek().text).toBe('a')
  })

  it('when a ctrl-modified char arrives, does not insert', () => {
    const field = new TextFieldStore()
    field.insert('a')

    new TextInput({ field, input: 'x', key: { ctrl: true } }).edit()

    expect(field.text.peek().text).toBe('a')
  })

  it('when a meta-modified char arrives, does not insert', () => {
    const field = new TextFieldStore()
    field.insert('a')

    new TextInput({ field, input: 'x', key: { meta: true } }).edit()

    expect(field.text.peek().text).toBe('a')
  })

  it('when a key arrives with no input, nothing changes', () => {
    const field = new TextFieldStore()
    field.insert('a')

    new TextInput({ field, input: '', key: {} }).edit()

    expect(field.text.peek().text).toBe('a')
  })

  it('when arrows arrive, moves the cursor', () => {
    const field = new TextFieldStore()
    field.insert('ab')

    new TextInput({ field, input: '', key: { leftArrow: true } }).edit()
    new TextInput({ field, input: '', key: { rightArrow: true } }).edit()

    expect(field.text.peek().cursor).toBe(2)
  })

  it('when home and end arrive, moves the cursor to the edges', () => {
    const field = new TextFieldStore()
    field.insert('ab')

    new TextInput({ field, input: '', key: { home: true } }).edit()
    new TextInput({ field, input: '', key: { end: true } }).edit()

    expect(field.text.peek().cursor).toBe(2)
  })
})
