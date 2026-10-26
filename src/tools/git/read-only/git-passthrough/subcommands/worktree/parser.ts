export class GitWorktreeParser {
  private output: string
  private line = /^(.*\S)\s+([0-9a-f]+) (?:\[(.+)\]|\(.+\))$/

  constructor(output: string) {
    this.output = output
  }

  parse() {
    const lines = this.output.split('\n').filter((line) => line !== '')
    return { worktrees: lines.map((line) => this.parseLine(line)) }
  }

  private parseLine(line: string) {
    const [, path, head, branch] = line.match(this.line) as RegExpMatchArray
    if (branch === undefined) {
      return { path, head }
    } else {
      return { path, head, branch }
    }
  }
}
