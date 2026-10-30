import type { Definition } from '../language-parsers/types.ts'
import { Languages } from '../language-parsers/languages.ts'

export class SymbolText {
  private definition: Definition
  private language: string
  private text: string
  private languages = new Languages()

  constructor(definition: Definition, language: string, text: string) {
    this.definition = definition
    this.language = language
    this.text = text
  }

  docComment() {
    return this.languages
      .languageParserFor(this.language)
      .docComment(this.definition.node)
  }

  source() {
    const { startLine, endLine } = this.definition.symbol
    return this.text
      .split('\n')
      .slice(startLine - 1, endLine)
      .join('\n')
  }
}
