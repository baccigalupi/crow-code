// The typed key drawn as dots behind the input that edits it.
export class MaskedFieldViewModel {
  private readonly maskCharacter = '•'
  private text: string

  constructor(text: string) {
    this.text = text
  }

  dots() {
    return this.maskCharacter.repeat(this.text.length)
  }
}

export const maskedFieldViewModel = (text: string) =>
  new MaskedFieldViewModel(text)
