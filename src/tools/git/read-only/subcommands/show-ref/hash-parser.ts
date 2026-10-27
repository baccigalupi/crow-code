export class GitShowRefHashParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('-s') || this.options.includes('--hash')
  }

  parse() {
    return { shas: this.output.split('\n').filter((line) => line !== '') }
  }
}
