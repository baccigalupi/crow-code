import type { ChangedFile } from '../../../../types.ts'

export class FileDiffParser {
  private output: string
  private filterInput?: string[]
  private filter?: Set<string>
  parts!: string[]

  constructor(output: string, filter?: string[]) {
    this.output = output
    this.filterInput = filter
  }

  private filters() {
    if (this.filter) return this.filter
    this.filter = new Set(this.filterInput!)
    return this.filter
  }

  parse() {
    this.split()

    return this.parts
      .filter(this.lineHasContent)
      .map((line) => this.parseChange(line))
      .filter((change) => this.pathMatchesFilter(change.path))
  }

  private pathMatchesFilter(path: string) {
    if (!this.filterInput) return true

    return this.filters().has(path)
  }

  private split() {
    this.parts = this.output.split('\n')
  }

  private lineHasContent(line: string) {
    return line.trim().length > 0
  }

  private parseChange(line: string): ChangedFile {
    return {
      path: this.parsePath(line),
      changeType: this.changeType(line),
    }
  }

  private parsePath(line: string) {
    return this.unquote(this.removeRenameSource(this.removeStatusCode(line)))
  }

  private changeType(line: string) {
    return line.slice(0, 2)
  }

  private removeStatusCode(line: string) {
    return line.replace(/^.../, '')
  }

  private removeRenameSource(line: string) {
    return line.replace(/.* -> /, '')
  }

  private unquote(path: string) {
    if (this.pathIsWrappedInQuotes(path)) return path

    return path.slice(1, -1).replace(/\\\\/g, '\\').replace(/\\"/g, '"')
  }

  private pathIsWrappedInQuotes(path: string) {
    return path.length < 2 || !path.startsWith('"') || !path.endsWith('"')
  }
}

export const fileDiffParser = (output: string, filter?: string[]) => {
  return new FileDiffParser(output, filter)
}
