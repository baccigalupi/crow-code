export class GitShowContentParser {
  private options: string[]
  private output: string

  constructor(options: string[], output: string) {
    this.options = options
    this.output = output
  }

  isMatch() {
    const positionals = this.positionals()
    return positionals.length === 1 && this.isRevisionPath(positionals[0])
  }

  parse() {
    const revisionPath = this.positionals()[0]
    const path = revisionPath.slice(revisionPath.indexOf(':') + 1)
    return { path, text: this.output }
  }

  private positionals() {
    return this.options.filter((option) => !option.startsWith('-'))
  }

  private isRevisionPath(token: string) {
    return !token.startsWith(':') && token.includes(':')
  }
}
