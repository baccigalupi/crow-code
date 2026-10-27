export class GitConfigParser {
  private readonly separators: Record<string, string> = {
    '--list': '=',
    '-l': '=',
    '--get-regexp': ' ',
  }

  private output: string
  private form: string

  constructor(output: string, form: string) {
    this.output = output
    this.form = form
  }

  parse() {
    if (!(this.form in this.separators)) return { values: this.lines() }
    return { entries: this.lines().map((line) => this.parseLine(line)) }
  }

  private lines() {
    return this.output.split('\n').filter((line) => line !== '')
  }

  private parseLine(line: string) {
    const separator = line.indexOf(`${this.separators[this.form]}`)
    return { key: line.slice(0, separator), value: line.slice(separator + 1) }
  }
}
