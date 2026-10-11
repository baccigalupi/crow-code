import { walk } from '@std/fs'
import { basename, globToRegExp, relative } from '@std/path'

type FilePathsArguments = {
  directory: string
  ignoredDirectories?: string[]
  filePattern?: string
}

const defaultIgnoredDirectories = ['node_modules', '.git']

export class FilePaths {
  private directory: string
  private ignoredDirectories: string[]
  private filePattern?: string
  private include?: RegExp

  constructor(
    {
      directory,
      ignoredDirectories = defaultIgnoredDirectories,
      filePattern,
    }: FilePathsArguments,
  ) {
    this.directory = directory
    this.ignoredDirectories = ignoredDirectories
    this.filePattern = filePattern
  }

  async all() {
    const walked = await Array.fromAsync(
      walk(this.directory, this.walkOptions()),
    )
    return walked
      .map((entry) => relative(this.directory, entry.path))
      .filter((path) => this.included(path))
  }

  private included(path: string) {
    if (!this.filePattern) return true

    return this.compiled().test(this.subject(path))
  }

  private compiled() {
    if (this.include) return this.include
    this.include = globToRegExp(this.filePattern!, { globstar: true })
    return this.include
  }

  private subject(path: string) {
    if (this.filePattern === undefined || this.filePattern.includes('/')) {
      return path
    }
    return basename(path)
  }

  private walkOptions() {
    return {
      includeDirs: false,
      includeSymlinks: false,
      followSymlinks: false,
      skip: this.ignoredDirectories.map((name) => this.skipPattern(name)),
    }
  }

  private skipPattern(name: string) {
    return new RegExp(`(^|/)${this.escapeRegex(name)}(/|$)`)
  }

  private escapeRegex(name: string) {
    return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

export const filePaths = (filePathsArguments: FilePathsArguments) => {
  return new FilePaths(filePathsArguments)
}
