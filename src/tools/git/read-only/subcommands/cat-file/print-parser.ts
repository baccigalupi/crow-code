export class GitCatFilePrintParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('-p')
  }

  parse() {
    return { text: this.output }
  }
}
