import { resolve } from '@std/path'
import type { ApplicationData } from '../application-data.ts'
import type { RealPath } from '../types.ts'
import { requestedPath } from './path-permissions/requested-path.ts'

type PathPermissionsArguments = {
  applicationData: ApplicationData
  allowedDirectories?: string[] | Promise<string[]>
}

export class PathPermissions {
  protected applicationData: ApplicationData
  private allowedDirectories: string[] | Promise<string[]>
  private getRealPath: RealPath
  private cache: Map<string, boolean>

  constructor(
    { applicationData, allowedDirectories }: PathPermissionsArguments,
  ) {
    this.applicationData = applicationData
    this.allowedDirectories = allowedDirectories || [Deno.cwd()]
    this.getRealPath = applicationData.getRealPath()
    this.cache = new Map()
  }

  async allows(path: string): Promise<boolean> {
    if (this.cache.has(path)) return this.cache.get(path)!

    const allowed = await (await this.requested(path)).isAllowed()
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

  protected async absoluteDirectories(): Promise<string[]> {
    const directories = await this.allowedDirectories
    return directories.map((directory) => resolve(Deno.cwd(), directory))
  }

  private async requested(path: string) {
    return requestedPath({
      path,
      allowedDirectories: await this.absoluteDirectories(),
      getRealPath: this.getRealPath,
    })
  }
}

export const pathPermissions = (args: PathPermissionsArguments) => {
  return new PathPermissions(args)
}
