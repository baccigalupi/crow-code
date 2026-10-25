export class GitLsFilesParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  parse(stdout: string) {
    const lines = stdout.split(this.separator()).filter((line) => line !== '')
    return { entries: lines.map((line) => this.parseLine(line)) }
  }

  private separator() {
    if (this.options.includes('-z')) {
      return '\0'
    } else {
      return '\n'
    }
  }

  private parseLine(line: string) {
    if (line.includes('\t')) {
      return this.parseStagedLine(line)
    } else {
      return { path: line }
    }
  }

  private parseStagedLine(line: string) {
    const [head, path] = line.split('\t')
    const [mode, sha, stage] = head.split(' ')
    return { path, mode, sha, stage: Number(stage) }
  }
}
