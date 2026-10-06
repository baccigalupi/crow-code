import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  deleteBackward,
  deleteForward,
  insertText,
  measureRows,
  moveCursor,
} from '../../../src/tui/interactions/input-buffer.ts'

describe('input buffer', () => {
  it('when inserting in the middle, inserts at the cursor', () => {
    const start = { text: 'ac', cursor: 1 }

    const next = insertText(start, 'b')

    expect(next).toEqual({ text: 'abc', cursor: 2 })
  })

  it('when text has CRLF, normalizes to LF', () => {
    const start = { text: '', cursor: 0 }

    const next = insertText(start, 'a\r\nb\rc')

    expect(next).toEqual({ text: 'a\nb\nc', cursor: 5 })
  })

  it('when backspacing at 0, is a no-op', () => {
    const start = { text: 'ab', cursor: 0 }

    const next = deleteBackward(start)

    expect(next).toBe(start)
  })

  it('when backspacing mid-text, removes the previous char', () => {
    const start = { text: 'abc', cursor: 2 }

    const next = deleteBackward(start)

    expect(next).toEqual({ text: 'ac', cursor: 1 })
  })

  it('when deleting at the end, is a no-op', () => {
    const start = { text: 'ab', cursor: 2 }

    const next = deleteForward(start)

    expect(next).toBe(start)
  })

  it('when deleting mid-text, removes the next char', () => {
    const start = { text: 'abc', cursor: 1 }

    const next = deleteForward(start)

    expect(next).toEqual({ text: 'ac', cursor: 1 })
  })

  it('when moving left past the start, clamps at 0', () => {
    const start = { text: 'ab', cursor: 0 }

    const next = moveCursor(start, 'left')

    expect(next.cursor).toBe(0)
  })

  it('when moving right past the end, clamps at length', () => {
    const start = { text: 'ab', cursor: 2 }

    const next = moveCursor(start, 'right')

    expect(next.cursor).toBe(2)
  })

  it('when moving home on the second line, goes to that line start', () => {
    const start = { text: 'ab\ncd', cursor: 4 }

    const next = moveCursor(start, 'home')

    expect(next.cursor).toBe(3)
  })

  it('when moving end on the first line, goes to that line end', () => {
    const start = { text: 'ab\ncd', cursor: 0 }

    const next = moveCursor(start, 'end')

    expect(next.cursor).toBe(2)
  })

  it('when moving end on the last line, goes to the text end', () => {
    const start = { text: 'ab\ncd', cursor: 4 }

    const next = moveCursor(start, 'end')

    expect(next.cursor).toBe(5)
  })

  it('when a line wraps, counts each wrapped row', () => {
    const text = 'x'.repeat(200)

    const rows = measureRows(text, 80)

    expect(rows).toBe(3)
  })

  it('when rows exceed the cap, clamps to 8', () => {
    const text = 'x\nx\nx\nx\nx\nx\nx\nx\nx\nx\nx\nx\nx\nx\nx\nx\nx\nx\nx\nx'

    const rows = measureRows(text, 80)

    expect(rows).toBe(8)
  })

  it('when the line fits the width, is a single row', () => {
    const text = 'x'.repeat(200)

    const rows = measureRows(text, 400)

    expect(rows).toBe(1)
  })

  it('when text is empty, is a single row', () => {
    const text = ''

    const rows = measureRows(text, 80)

    expect(rows).toBe(1)
  })

  it('when columns is 0, counts one row per line', () => {
    const text = 'x'.repeat(200) + '\n' + 'y'.repeat(200)

    const rows = measureRows(text, 0)

    expect(rows).toBe(2)
  })
})
