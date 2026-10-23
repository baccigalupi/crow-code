export const logSeparator = '\x1f'

const headerPattern = new RegExp(`^[0-9a-f]{40}${logSeparator}`)

export const trimmedLines = (lines: string[]) => {
  const start = lines.findIndex((line) => line !== '')
  const end = lines.findLastIndex((line) => line !== '')
  return lines.slice(start, end + 1)
}

export class GitLogRecords {
  private stdout: string

  constructor(stdout: string) {
    this.stdout = stdout
  }

  records() {
    const lines = this.stdout.split('\n')
    const starts = lines.flatMap((line, index) => this.start(line, index))
    return starts.map((start, index) => {
      return this.record(lines.slice(start, starts[index + 1]))
    })
  }

  private record([header, ...body]: string[]) {
    return { header, body: trimmedLines(body) }
  }

  private start(line: string, index: number) {
    if (headerPattern.test(line)) return [index]
    return []
  }
}
