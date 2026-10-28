import { basename, extname } from 'node:path'
import type { Grammar } from './types.ts'

export class Grammars {
  private grammars: Grammar[]

  constructor(grammars: Grammar[]) {
    this.grammars = grammars
  }

  grammarFor(path: string, text: string) {
    return this.grammars.filter((grammar) =>
      this.matches(grammar, path, text),
    )[0]
  }

  private matches(grammar: Grammar, path: string, text: string) {
    if (extname(path) === '') {
      return grammar.interpreters.includes(this.interpreter(text))
    }

    return grammar.extensions.includes(extname(path))
  }

  private interpreter(text: string) {
    if (!text.startsWith('#!')) return ''

    return this.program(text.slice(2).split('\n')[0].trim().split(/\s+/))
  }

  private program(words: string[]) {
    if (basename(words[0]) === 'env') return words[1]

    return basename(words[0])
  }
}
