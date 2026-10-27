export class GitRevListParser {
  private output: string

  constructor(output: string) {
    this.output = output
  }

  parse() {
    return { shas: this.output.split('\n').filter((line) => line !== '') }
  }
}
