import { relative, resolve } from '@std/path'
import type { RealPath } from '../../types.ts'

type RequestedPathArguments = {
  path: string
  allowedDirectories: string[]
  getRealPath: RealPath
  ignoredPaths: string[]
  cwd: string
}

export class RequestedPath {
  private path: string
  private allowedDirectories: string[]
  private getRealPath: RealPath
  private ignoredPaths: string[]
  private cwd: string

  constructor(
    { path, allowedDirectories, getRealPath, ignoredPaths, cwd }:
      RequestedPathArguments,
  ) {
    this.path = path
    this.allowedDirectories = allowedDirectories
    this.getRealPath = getRealPath
    this.ignoredPaths = ignoredPaths
    this.cwd = cwd
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
    return resolve(this.cwd, this.path)
  }

  private async followingSymlinks() {
    const path = this.absolutePath()
    try {
      return await this.getRealPath(path)
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
