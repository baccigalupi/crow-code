import type { CursorMove, InputText } from './types.ts'

export const emptyText = (): InputText => ({ text: '', cursor: 0 })

const normalizeNewlines = (text: string): string =>
  text.replaceAll('\r\n', '\n').replaceAll('\r', '\n')

export const insertText = (input: InputText, text: string): InputText => {
  const inserted = normalizeNewlines(text)
  const next =
    input.text.slice(0, input.cursor) +
    inserted +
    input.text.slice(input.cursor)
  return { text: next, cursor: input.cursor + inserted.length }
}

export const deleteBackward = (input: InputText): InputText => {
  if (input.cursor === 0) return input
  const text =
    input.text.slice(0, input.cursor - 1) + input.text.slice(input.cursor)
  return { text, cursor: input.cursor - 1 }
}

export const deleteForward = (input: InputText): InputText => {
  if (input.cursor >= input.text.length) return input
  const text =
    input.text.slice(0, input.cursor) + input.text.slice(input.cursor + 1)
  return { text, cursor: input.cursor }
}

const lineStart = (text: string, cursor: number): number =>
  text.lastIndexOf('\n', cursor - 1) + 1

const lineEnd = (text: string, cursor: number): number => {
  if (text.indexOf('\n', cursor) === -1) return text.length
  return text.indexOf('\n', cursor)
}

const moveTarget = (input: InputText, to: CursorMove): number => {
  if (to === 'left') return Math.max(0, input.cursor - 1)
  else if (to === 'right') {
    return Math.min(input.text.length, input.cursor + 1)
  } else if (to === 'home') {
    return lineStart(input.text, input.cursor)
  }
  return lineEnd(input.text, input.cursor)
}

export const moveCursor = (input: InputText, to: CursorMove): InputText => ({
  ...input,
  cursor: moveTarget(input, to),
})
