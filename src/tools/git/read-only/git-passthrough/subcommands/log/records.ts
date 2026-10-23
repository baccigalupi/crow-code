import { GitLogRecord, logSeparator } from './record.ts'

const headerPattern = new RegExp(`^[0-9a-f]{40}${logSeparator}`)

export class GitLogRecords {
  private stdout: string

  constructor(stdout: string) {
    this.stdout = stdout
  }

  records() {
    const lines = this.stdout.split('\n')
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
