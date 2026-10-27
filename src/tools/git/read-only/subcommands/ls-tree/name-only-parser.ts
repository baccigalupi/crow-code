export class GitLsTreeNameOnlyParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    return this.options.includes('--name-only')
  }

  parse() {
    const paths = this.output.split('\n').filter((line) => line !== '')
    return { entries: paths.map((path) => ({ path })) }
  }
}
