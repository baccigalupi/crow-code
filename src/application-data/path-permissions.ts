import { resolve } from '@std/path'
import type { RealPath } from '../types.ts'
import type { Environment } from './env-vars.ts'
import { requestedPath } from './path-permissions/requested-path.ts'
import { expandHome } from './path-permissions/expand-home.ts'

type PathPermissionsArguments = {
  getRealPath: RealPath
  allowedDirectories: string[]
  envars: Environment
}

export class PathPermissions {
  private allowedDirectories: string[]
  private getRealPath: RealPath
  private envars: Environment
  private cache: Map<string, boolean>

  constructor(
    { getRealPath, allowedDirectories, envars }: PathPermissionsArguments,
  ) {
    this.allowedDirectories = allowedDirectories
    this.getRealPath = getRealPath
    this.envars = envars
    this.cache = new Map()
  }

  async allows(path: string): Promise<boolean> {
    if (this.cache.has(path)) return this.cache.get(path)!

    const allowed = await this.requested(path).isAllowed()
    this.cache.set(path, allowed)
    return allowed
  }

  async allowsEvery(paths: string[]): Promise<boolean> {
    const verdicts = await Promise.all(paths.map((path) => this.allows(path)))
    return verdicts.every((verdict) => verdict)
  }

  async filterPaths(paths: string[]): Promise<string[]> {
    const verdicts = await Promise.all(paths.map((path) => this.allows(path)))
    return paths.filter((_, index) => verdicts[index])
  }

  protected absoluteDirectories(): string[] {
    return expandHome({
      directories: this.allowedDirectories,
      envars: this.envars,
    }).directories()
      .map((directory) => resolve(Deno.cwd(), directory))
  }

  private requested(path: string) {
    return requestedPath({
      path,
      allowedDirectories: this.absoluteDirectories(),
      getRealPath: this.getRealPath,
    })
  }
}

export const pathPermissions = (args: PathPermissionsArguments) => {
  return new PathPermissions(args)
}
