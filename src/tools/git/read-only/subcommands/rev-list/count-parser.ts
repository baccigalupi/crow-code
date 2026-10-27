export class GitRevListCountParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('--count')
  }

  parse() {
    return { count: Number(this.output.trim()) }
  }
}
