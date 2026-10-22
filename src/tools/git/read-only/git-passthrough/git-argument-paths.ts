export class GitArgumentPaths {
  private positionals: string[]
  private flagPaths: string[]
  private pathspecs: string[]

  constructor({
    positionals,
    flagPaths,
    pathspecs,
  }: {
    positionals: string[]
    flagPaths: string[]
    pathspecs: string[]
  }) {
    this.positionals = positionals
    this.flagPaths = flagPaths
    this.pathspecs = pathspecs
  }

  paths() {
    const all = [
      ...this.positionals.flatMap((token) => this.split(token)),
      ...this.flagPaths,
      ...this.pathspecs,
    ]
    return [...new Set(all)]
  }

  private split(token: string) {
    if (this.isRevisionPath(token)) {
      return this.revisionAndPath(token)
    } else {
      return [token]
    }
  }

  private isRevisionPath(token: string) {
    return !token.startsWith(':') && token.includes(':')
  }

  private revisionAndPath(token: string) {
    const colon = token.indexOf(':')
    return [token.slice(0, colon), token.slice(colon + 1)]
  }
}
