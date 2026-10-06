import type { InputViewModelArguments } from '../types.ts'

export const inputViewModel = ({ buffer, height }: InputViewModelArguments) => {
  return {
    rowHeight: height,
    buffer,
    isEmpty: buffer.text.length === 0,
  }
}
