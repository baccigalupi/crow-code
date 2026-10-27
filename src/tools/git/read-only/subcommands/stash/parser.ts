export class GitStashParser {
  private output: string

  constructor(output: string) {
    this.output = output
  }

  parse() {
    const lines = this.output.split('\n').filter((line) => line !== '')
    return { entries: lines.map((line) => this.parseLine(line)) }
  }

  private parseLine(line: string) {
    const colon = line.indexOf(': ')
    return { selector: line.slice(0, colon), message: line.slice(colon + 2) }
  }
}
