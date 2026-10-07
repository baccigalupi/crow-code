import { walk } from '@std/fs'
import { relative } from '@std/path'

type FilePathsArguments = {
  root: string
  ignoredDirectories?: string[]
}

const defaultIgnoredDirectories = ['node_modules', '.git']

export class FilePaths {
  private root: string
  private ignoredDirectories: string[]

  constructor(
    { root, ignoredDirectories = defaultIgnoredDirectories }:
      FilePathsArguments,
  ) {
    this.root = root
    this.ignoredDirectories = ignoredDirectories
  }

  async all() {
    const walked = await Array.fromAsync(walk(this.root, this.walkOptions()))
    return walked.map((entry) => relative(this.root, entry.path))
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
