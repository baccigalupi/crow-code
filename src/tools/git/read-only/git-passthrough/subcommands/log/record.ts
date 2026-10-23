export const logSeparator = '\x1f'

export const trimmedLines = (lines: string[]) => {
  const start = lines.findIndex((line) => line !== '')
  const end = lines.findLastIndex((line) => line !== '')
  return lines.slice(start, end + 1)
}

export class GitLogRecord {
  private header: string
  private lines: string[]

  constructor([header = '', ...lines]: string[]) {
    this.header = header
    this.lines = lines
  }

  entry() {
    const [sha, author, date, subject] = this.header.split(logSeparator)
    return { sha, author, date, subject }
  }

  body() {
    return trimmedLines(this.lines)
  }
}
