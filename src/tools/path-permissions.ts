import { resolve } from '@std/path'
import type { ApplicationData } from '../application-data.ts'
import type { RealPath } from '../types.ts'
import { requestedPath } from './path-permissions/requested-path.ts'

type PathPermissionsArguments = {
  applicationData: ApplicationData
  allowedDirectories?: string[]
}

export class PathPermissions {
  private allowedDirectories: string[]
  private getRealPath: RealPath
  private cache: Map<string, boolean>

  constructor(
    { applicationData, allowedDirectories = [Deno.cwd()] }:
      PathPermissionsArguments,
  ) {
    this.allowedDirectories = allowedDirectories
    this.getRealPath = applicationData.getRealPath()
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

  private absoluteDirectories() {
    return this.allowedDirectories.map((directory) =>
      resolve(Deno.cwd(), directory)
    )
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
