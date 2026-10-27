export class GitCheckIgnoreParser {
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
    if (!line.includes('\t')) return { path: line }
    const [rule, path] = line.split('\t')
    return { path, ...this.rule(rule) }
  }

  private rule(rule: string) {
    const [source, line, ...pattern] = rule.split(':')
    return { source, line: Number(line), pattern: pattern.join(':') }
  }
}
