import type { GitRefKind } from '../../../types.ts'

export class GitRefKindParser {
  private exactKinds: Record<string, GitRefKind> = {
    HEAD: 'head',
    'refs/stash': 'stash',
  }

  private prefixKinds: [prefix: string, kind: GitRefKind][] = [
    ['refs/heads/', 'branch'],
    ['refs/tags/', 'tag'],
    ['refs/remotes/', 'remote'],
    ['', 'other'],
  ]

  private name: string

  constructor(name: string) {
    this.name = name
  }

  parse() {
    return this.exactKinds[this.name] || this.prefixKind()
  }

  private prefixKind() {
    const matches = this.prefixKinds.filter(([prefix]) =>
      this.name.startsWith(prefix),
    )
    return matches[0][1]
  }
}
