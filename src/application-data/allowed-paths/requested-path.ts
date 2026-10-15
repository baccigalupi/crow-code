import { relative, resolve } from '@std/path'
import type { Runtime } from '../runtime.ts'

type RequestedPathArguments = {
  path: string
  allowedDirectories: string[]
  ignoredPaths: string[]
  runtime: Runtime
}

export class RequestedPath {
  private path: string
  private allowedDirectories: string[]
  private ignoredPaths: string[]
  private runtime: Runtime

  constructor(
    { path, allowedDirectories, ignoredPaths, runtime }: RequestedPathArguments,
  ) {
    this.path = path
    this.allowedDirectories = allowedDirectories
    this.ignoredPaths = ignoredPaths
    this.runtime = runtime
  }

  async isAllowed() {
    if (!this.permitted(this.absolutePath())) return false

    return this.permitted(await this.followingSymlinks())
  }

  private permitted(path: string) {
    return this.inAllowedDirectory(path) && !this.inIgnoredPath(path)
  }

  private inAllowedDirectory(path: string) {
    return this.allowedDirectories.some((directory) =>
      this.within(directory, path)
    )
  }

  private inIgnoredPath(path: string) {
    return this.ignoredPaths.some((ignored) => this.within(ignored, path))
  }

  private absolutePath() {
    return resolve(this.runtime.cwd(), this.path)
  }

  private async followingSymlinks() {
    const path = this.absolutePath()
    try {
      return await this.runtime.realPath(path)
    } catch {
      return path
    }
  }

  private within(directory: string, path: string) {
    const distance = relative(directory, path)
    return distance === '' || (distance !== '..' && !distance.startsWith('../'))
  }
}

export const requestedPath = (args: RequestedPathArguments) => {
  return new RequestedPath(args)
}
