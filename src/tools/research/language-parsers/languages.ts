import { JsTsLanguageParser } from './js-ts/language-parser.ts'
import type { LanguageParser } from './types.ts'

export class Languages {
  private languageParsers: LanguageParser[] = [new JsTsLanguageParser()]

  grammars() {
    return this.languageParsers.flatMap((parser) => parser.grammars())
  }

  languageParserFor(language: string) {
    return this.languageParsers.find((parser) => parser.handles(language))!
  }
}
