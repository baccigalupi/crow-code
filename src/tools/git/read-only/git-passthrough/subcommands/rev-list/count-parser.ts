export class GitRevListCountParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  isMatch() {
    return this.options.includes('--count')
  }

  parse(stdout: string) {
    return { count: Number(stdout.trim()) }
  }
}
