import { describe, expect, it } from 'bun:test'
import { signal } from '@preact/signals-core'
import {
  TextInput,
  textInput,
} from '../../../../src/tui/install/interactions/text-input.ts'
import { emptyBuffer, insertText } from '../../../../src/tui/input-buffer.ts'

describe('TextInput', () => {
  it('when text is inserted, appends at the cursor', () => {
    const text = signal(emptyBuffer())

    new TextInput({ text, input: 'ab', key: {} }).edit()

    expect(text.peek().text).toBe('ab')
  })

  it('when backspace arrives, deletes the previous char', () => {
    const text = signal(insertText(emptyBuffer(), 'ab'))

    new TextInput({ text, input: '', key: { backspace: true } }).edit()

    expect(text.peek().text).toBe('a')
  })

  it('when delete arrives, removes the char under the cursor', () => {
    const text = signal(insertText(emptyBuffer(), 'ab'))

    new TextInput({ text, input: '', key: { leftArrow: true } }).edit()
    new TextInput({ text, input: '', key: { delete: true } }).edit()

    expect(text.peek().text).toBe('a')
  })

  it('when a ctrl-modified char arrives, does not insert', () => {
    const text = signal(insertText(emptyBuffer(), 'a'))

    new TextInput({ text, input: 'x', key: { ctrl: true } }).edit()

    expect(text.peek().text).toBe('a')
  })

  it('when a meta-modified char arrives, does not insert', () => {
    const text = signal(insertText(emptyBuffer(), 'a'))

    new TextInput({ text, input: 'x', key: { meta: true } }).edit()

    expect(text.peek().text).toBe('a')
  })

  it('when a key arrives with no input, nothing changes', () => {
    const text = signal(insertText(emptyBuffer(), 'a'))

    new TextInput({ text, input: '', key: {} }).edit()

    expect(text.peek().text).toBe('a')
  })

  it('when arrows arrive, moves the cursor', () => {
    const text = signal(insertText(emptyBuffer(), 'ab'))

    new TextInput({ text, input: '', key: { leftArrow: true } }).edit()
    new TextInput({ text, input: '', key: { rightArrow: true } }).edit()

    expect(text.peek().cursor).toBe(2)
  })

  it('when home and end arrive, moves the cursor to the edges', () => {
    const text = signal(insertText(emptyBuffer(), 'ab'))

    new TextInput({ text, input: '', key: { home: true } }).edit()
    new TextInput({ text, input: '', key: { end: true } }).edit()

    expect(text.peek().cursor).toBe(2)
  })

  it('when called through textInput, returns a TextInput', () => {
    const text = signal(emptyBuffer())

    const input = textInput({ text, input: 'x', key: {} })

    expect(input).toBeInstanceOf(TextInput)
  })
})
