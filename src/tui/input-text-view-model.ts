import type { InputText } from './types.ts'

const cursorCharacter = (input: InputText) => {
  if (input.cursor >= input.text.length) return ' '
  return input.text.charAt(input.cursor)
}

export const inputTextViewModel = (input: InputText) => {
  return {
    before: input.text.slice(0, input.cursor),
    cursor: cursorCharacter(input),
    after: input.text.slice(input.cursor + 1),
  }
}
