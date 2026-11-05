import type { InputText } from '../types.ts'

// The typed text split around the block cursor. Masked inputs show only
// bullets.
export class PromptLineViewModel {
  private readonly maskCharacter = '•'
  private input: InputText
  private masked: boolean

  constructor(input: InputText, masked: boolean) {
    this.input = input
    this.masked = masked
  }

  beforeCursor() {
    return this.text().slice(0, this.input.cursor)
  }

  atCursor() {
    if (this.input.cursor >= this.text().length) return ' '

    return this.text().charAt(this.input.cursor)
  }

  afterCursor() {
    return this.text().slice(this.input.cursor + 1)
  }

  private text() {
    if (this.masked) return this.maskCharacter.repeat(this.input.text.length)

    return this.input.text
  }
}

export const promptLineViewModel = (input: InputText, masked: boolean) =>
  new PromptLineViewModel(input, masked)
