export class FileDiffParser {
  private output: string
  parts!: string[]

  constructor(output: string) {
    this.output = output
  }

  parse() {
    this.split()

    return this.parts
      .filter(this.lineHasContent)
      .map(this.removeStatusCode)
      .map(this.removeRenameSource)
      .map((line) => this.unquote(line))
  }

  private split() {
    this.parts = this.output.split('\n')
  }

  private lineHasContent(line: string) {
    return line.trim().length > 0
  }

  private removeStatusCode(line: string) {
    return line.replace(/^.../, '')
  }

  private removeRenameSource(line: string) {
    return line.replace(/.* -> /, '')
  }

  private unquote(path: string) {
    if (this.pathIsWrappedInQuotes(path)) return path

    return path.slice(1, -1)
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"')
  }

  private pathIsWrappedInQuotes(path: string) {
    return path.length < 2 || !path.startsWith('"') || !path.endsWith('"')
  }
}

export const fileDiffParser = (output: string) => {
  return new FileDiffParser(output)
}
