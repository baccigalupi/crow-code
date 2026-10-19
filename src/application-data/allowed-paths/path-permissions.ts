import { join, resolve } from '@std/path'
import type { ApplicationData } from '../application-data.ts'
import { requestedPath } from './requested-path.ts'
import { expandHome } from './expand-home.ts'

type PathPermissionsArguments = {
  applicationData: ApplicationData
  allowedDirectories: readonly string[]
}

export class PathPermissions {
  private applicationData: ApplicationData
  private allowedDirectories: readonly string[]
  private cache: Map<string, boolean>

  constructor(
    { applicationData, allowedDirectories }: PathPermissionsArguments,
  ) {
    this.applicationData = applicationData
    this.allowedDirectories = allowedDirectories
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

  async forbiddenPaths(paths: string[]): Promise<string[]> {
    const verdicts = await Promise.all(paths.map((path) => this.allows(path)))
    return paths.filter((_, index) => !verdicts[index])
  }

  ignoredPaths() {
    return [
      ...this.absolute(this.applicationData.config.ignoredDirectories),
      join(this.applicationData.repositoryRoot, '.git'),
    ]
  }

  protected absoluteDirectories() {
    return this.absolute([this.runtime().cwd, ...this.allowedDirectories])
  }

  private absolute(directories: string[]) {
    const envars = this.applicationData.envars
    return expandHome({ directories, envars }).directories()
      .map((directory) => resolve(this.runtime().cwd, directory))
  }

  private requested(path: string) {
    return requestedPath({
      path,
      allowedDirectories: this.absoluteDirectories(),
      ignoredPaths: this.ignoredPaths(),
      cwd: this.runtime().cwd,
      filesystem: this.applicationData.filesystem,
    })
  }

  private runtime() {
    return this.applicationData.runtime
  }
}

export const pathPermissions = (args: PathPermissionsArguments) => {
  return new PathPermissions(args)
}
