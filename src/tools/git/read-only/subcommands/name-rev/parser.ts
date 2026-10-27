export class GitNameRevParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  parse() {
    if (this.nameText() === 'undefined') return {}
    return { name: this.nameText() }
  }

  private nameText() {
    if (this.options.includes('--name-only')) return this.output.trim()
    return this.output.trim().split(' ').slice(1).join(' ')
  }
}
