import { GitRefKindParser } from '../ref-kind-parser.ts'

export class GitForEachRefParser {
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
    const [object, name] = line.split('\t')
    const [sha, objectType] = object.split(' ')
    const kind = new GitRefKindParser(name).parse()
    return { name, sha, kind, objectType }
  }
}
