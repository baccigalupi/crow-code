export class GitTagParser {
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
    const name = line.replace(/\s.*$/, '')
    return { name, ...this.message(line.slice(name.length).trim()) }
  }

  private message(text: string) {
    if (text === '') return {}
    return { message: text }
  }
}
