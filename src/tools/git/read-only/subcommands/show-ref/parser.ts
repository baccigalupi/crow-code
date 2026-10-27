import { GitRefKindParser } from '../ref-kind-parser.ts'

export class GitShowRefParser {
  private output: string

  constructor(output: string) {
    this.output = output
  }

  parse() {
    return { entries: this.lines().map((line) => this.parseLine(line)) }
  }

  private lines() {
    return this.output.split('\n').filter((line) => line !== '')
  }

  private parseLine(line: string) {
    const [sha, reference] = line.split(' ')
    const name = reference.replace(/\^\{\}$/, '')
    const kind = new GitRefKindParser(name).parse()
    return { name, sha, kind, ...this.peeled(reference) }
  }

  private peeled(reference: string) {
    if (!reference.endsWith('^{}')) return {}
    return { peeled: true }
  }
}
