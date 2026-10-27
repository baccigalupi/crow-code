export class GitCheckAttrParser {
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
    const parts = line.split(': ')
    const [attribute, value] = parts.slice(-2)
    return { path: parts.slice(0, -2).join(': '), attribute, value }
  }
}
