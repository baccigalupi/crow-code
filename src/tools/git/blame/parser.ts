import type { GitBlameLine } from '../../types.ts'

export class BlameParser {
  private lines: GitBlameLine[] = []
  private current: Partial<GitBlameLine> = {}

  private output: string

  constructor(output: string) {
    this.output = output
  }

  parse() {
    this.output
      .split('\n')
      .forEach((line) => this.parseLine(line))

    return this.lines
  }

  private parseLine(rawLine: string) {
    if (rawLine.startsWith('\t')) {
      this.finishLine(rawLine)
    } else {
      this.parseMetadata(rawLine)
    }
  }

  private finishLine(rawLine: string) {
    this.current.content = rawLine.slice(1)
    this.lines.push(this.current as GitBlameLine)
    this.current = {}
  }

  private parseMetadata(rawLine: string) {
    const header = rawLine.match(/^(\^?[0-9a-f]{40}) \d+ (\d+)/)
    if (header) {
      this.startLine(header)
    } else {
      this.parseField(rawLine)
    }
  }

  private startLine(header: RegExpMatchArray) {
    this.current = {
      sha: header[1].replace(/^\^/, ''),
      line: Number(header[2]),
    }
  }

  private parseField(rawLine: string) {
    if (!rawLine.includes(' ')) return
    const [key, ...rest] = rawLine.split(' ')
    this.applyField(key, rest.join(' '))
  }

  private applyField(key: string, value: string) {
    if (key === 'author') {
      this.current.author = value
    } else if (key === 'author-time') {
      this.current.date = new Date(Number(value) * 1000).toISOString()
    } else if (key === 'summary') {
      this.current.summary = value
    }
  }
}

export const blameParser = (output: string) => {
  return new BlameParser(output)
}
