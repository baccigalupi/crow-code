import type { InputBuffer } from '../types.ts'

const cursorCharacter = (buffer: InputBuffer) => {
  const character = buffer.text.charAt(buffer.cursor)
  if (character === '') return ' '

  return character
}

export const bufferViewModel = (buffer: InputBuffer) => {
  return {
    before: buffer.text.slice(0, buffer.cursor),
    cursor: cursorCharacter(buffer),
    after: buffer.text.slice(buffer.cursor + 1),
  }
}
