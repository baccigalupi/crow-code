import type { InputBuffer } from '../types.ts'

const cursorCharacter = (buffer: InputBuffer) => {
  if (buffer.cursor >= buffer.text.length) return ' '
  return buffer.text.charAt(buffer.cursor)
}

export const bufferViewModel = (buffer: InputBuffer) => {
  return {
    before: buffer.text.slice(0, buffer.cursor),
    cursor: cursorCharacter(buffer),
    after: buffer.text.slice(buffer.cursor + 1),
  }
}
