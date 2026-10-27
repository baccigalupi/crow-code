import { GitLogRecord, logSeparator } from './record.ts'

const headerPattern = new RegExp(`^[0-9a-f]{40}${logSeparator}`)

export class GitLogRecords {
  private output: string

  constructor(output: string) {
    this.output = output
  }

  records() {
    const lines = this.output.split('\n')
    const starts = lines.flatMap((line, index) => this.start(line, index))
    return starts.map((start, index) => {
      return new GitLogRecord(lines.slice(start, starts[index + 1]))
    })
  }

  private start(line: string, index: number) {
    if (headerPattern.test(line)) return [index]
    return []
  }
}
