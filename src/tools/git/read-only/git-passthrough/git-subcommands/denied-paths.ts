import type { PathPermissions } from '../../../../../application-data/allowed-paths/path-permissions.ts'

type GitDeniedPathsArguments = {
  permissions: PathPermissions
  paths: string[]
}

export class GitDeniedPaths {
  private permissions: PathPermissions
  private paths: string[]

  constructor({ permissions, paths }: GitDeniedPathsArguments) {
    this.permissions = permissions
    this.paths = paths
  }

  async reason() {
    return this.message(await this.denied())
  }

  private message(denied: string[]) {
    if (denied.length === 0) return ''
    return `path not allowed: ${denied.join(', ')}`
  }

  private async denied() {
    const forbidden = await this.permissions.forbiddenPaths(
      this.paths.filter((path) => !path.startsWith(':')),
    )
    return this.paths.filter(
      (path) => path.startsWith(':') || forbidden.includes(path),
    )
  }
}
