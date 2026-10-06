import type { CursorMove, InputBuffer } from '../types.ts'

const inputRowCap = 8

export const emptyBuffer = (): InputBuffer => ({ text: '', cursor: 0 })

const normalizeNewlines = (text: string): string =>
  text.replaceAll('\r\n', '\n').replaceAll('\r', '\n')

export const insertText = (buffer: InputBuffer, text: string): InputBuffer => {
  const inserted = normalizeNewlines(text)
  const next = buffer.text.slice(0, buffer.cursor) + inserted +
    buffer.text.slice(buffer.cursor)
  return { text: next, cursor: buffer.cursor + inserted.length }
}

export const deleteBackward = (buffer: InputBuffer): InputBuffer => {
  if (buffer.cursor === 0) return buffer
  const text = buffer.text.slice(0, buffer.cursor - 1) +
    buffer.text.slice(buffer.cursor)
  return { text, cursor: buffer.cursor - 1 }
}

export const deleteForward = (buffer: InputBuffer): InputBuffer => {
  if (buffer.cursor >= buffer.text.length) return buffer
  const text = buffer.text.slice(0, buffer.cursor) +
    buffer.text.slice(buffer.cursor + 1)
  return { text, cursor: buffer.cursor }
}

const lineStart = (text: string, cursor: number): number =>
  text.lastIndexOf('\n', cursor - 1) + 1

const lineEnd = (text: string, cursor: number): number => {
  if (text.indexOf('\n', cursor) === -1) return text.length
  return text.indexOf('\n', cursor)
}

const moveTarget = (buffer: InputBuffer, to: CursorMove): number => {
  if (to === 'left') return Math.max(0, buffer.cursor - 1)
  else if (to === 'right') {
    return Math.min(buffer.text.length, buffer.cursor + 1)
  } else if (to === 'home') {
    return lineStart(buffer.text, buffer.cursor)
  }
  return lineEnd(buffer.text, buffer.cursor)
}

export const moveCursor = (
  buffer: InputBuffer,
  to: CursorMove,
): InputBuffer => ({ ...buffer, cursor: moveTarget(buffer, to) })

const lineRows = (line: string, columns: number): number => {
  if (columns <= 0) return 1
  return Math.max(1, Math.ceil(line.length / columns))
}

export const measureLines = (text: string, columns: number): number =>
  text
    .split('\n')
    .map((line) => lineRows(line, columns))
    .reduce((total, count) => total + count, 0)

export const measureRows = (text: string, columns: number): number =>
  Math.min(inputRowCap, Math.max(1, measureLines(text, columns)))
