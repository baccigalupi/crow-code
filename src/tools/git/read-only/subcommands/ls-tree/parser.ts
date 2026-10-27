import type { GitLsTreeKind } from '../../../../types.ts'

export class GitLsTreeParser {
  private output: string

  constructor(output: string) {
    this.output = output
  }

  parse() {
    const lines = this.output.split('\n').filter((line) => line !== '')
    return { entries: lines.map((line) => this.parseLine(line)) }
  }

  private parseLine(line: string) {
    const [head, path] = line.split('\t')
    const [mode, kind, sha] = head.split(' ')
    return { path, mode, kind: kind as GitLsTreeKind, sha }
  }
}
