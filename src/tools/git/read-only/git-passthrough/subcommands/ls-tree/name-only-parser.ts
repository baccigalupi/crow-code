export class GitLsTreeNameOnlyParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  isMatch() {
    return this.options.includes('--name-only')
  }

  parse(stdout: string) {
    const paths = stdout.split('\n').filter((line) => line !== '')
    return { entries: paths.map((path) => ({ path })) }
  }
}
