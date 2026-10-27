export class GitRemoteParser {
  private output: string
  private form: string

  constructor(output: string, form: string) {
    this.output = output
    this.form = form
  }

  parse() {
    if (this.form === 'get-url') return { url: this.output.trim() }
    return { entries: this.lines().map((line) => this.parseLine(line)) }
  }

  private lines() {
    return this.output.split('\n').filter((line) => line !== '')
  }

  private parseLine(line: string) {
    if (this.form === '-v') return this.parseVerboseLine(line)
    return { name: line }
  }

  private parseVerboseLine(line: string) {
    const tab = line.indexOf('\t')
    const space = line.lastIndexOf(' ')
    const name = line.slice(0, tab)
    const url = line.slice(tab + 1, space)
    return { name, url, direction: line.slice(space + 2, -1) }
  }
}
