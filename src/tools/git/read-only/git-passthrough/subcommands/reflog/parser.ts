export class GitReflogParser {
  private output: string

  constructor(output: string) {
    this.output = output
  }

  parse() {
    const lines = this.output.split('\n').filter((line) => line !== '')
    return { entries: lines.map((line) => this.parseLine(line)) }
  }

  private parseLine(line: string) {
    const space = line.indexOf(' ')
    const colon = line.indexOf(': ')
    const hash = line.slice(0, space)
    const selector = line.slice(space + 1, colon)
    return { hash, selector, message: line.slice(colon + 2) }
  }
}
