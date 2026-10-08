import { relative, resolve } from '@std/path'
import type { RealPath } from '../../types.ts'

type RequestedPathArguments = {
  path: string
  allowedDirectories: string[]
  getRealPath: RealPath
}

export class RequestedPath {
  private path: string
  private allowedDirectories: string[]
  private getRealPath: RealPath

  constructor(
    { path, allowedDirectories, getRealPath }: RequestedPathArguments,
  ) {
    this.path = path
    this.allowedDirectories = allowedDirectories
    this.getRealPath = getRealPath
  }

  async isAllowed() {
    if (!this.inAllowedDirectory()) return false

    return await this.symlinkWithinDirectory()
  }

  private inAllowedDirectory() {
    return this.allowedDirectories.some((directory) =>
      this.within(directory, this.absolutePath())
    )
  }

  private async symlinkWithinDirectory() {
    const realPath = await this.followingSymlinks()
    return this.allowedDirectories.some((directory) =>
      this.within(directory, realPath)
    )
  }

  private absolutePath() {
    return resolve(Deno.cwd(), this.path)
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
