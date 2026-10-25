export class GitCatFileSizeParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('-s')
  }

  parse() {
    return { size: Number(this.output.trim()) }
  }
}
