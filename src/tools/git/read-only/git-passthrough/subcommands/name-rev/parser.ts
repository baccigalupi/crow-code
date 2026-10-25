export class GitNameRevParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  parse(stdout: string) {
    if (this.nameText(stdout) === 'undefined') return {}
    return { name: this.nameText(stdout) }
  }

  private nameText(stdout: string) {
    if (this.options.includes('--name-only')) return stdout.trim()
    return stdout.trim().split(' ').slice(1).join(' ')
  }
}
