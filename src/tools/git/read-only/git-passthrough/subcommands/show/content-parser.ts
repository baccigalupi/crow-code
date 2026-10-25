export class GitShowContentParser {
  private options: string[]

  constructor(options: string[]) {
    this.options = options
  }

  isMatch() {
    const positionals = this.positionals()
    return positionals.length === 1 && this.isRevisionPath(positionals[0])
  }

  parse(stdout: string) {
    const revisionPath = this.positionals()[0]
    const path = revisionPath.slice(revisionPath.indexOf(':') + 1)
    return { path, text: stdout }
  }

  private positionals() {
    return this.options.filter((option) => !option.startsWith('-'))
  }

  private isRevisionPath(token: string) {
    return !token.startsWith(':') && token.includes(':')
  }
}
