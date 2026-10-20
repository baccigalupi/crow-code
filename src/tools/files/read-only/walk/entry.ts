import type { Dirent } from 'node:fs'
import { join } from 'node:path'
import type { WalkEntry } from '../../../types.ts'
import type { WalkSettings } from './types.ts'

export class Entry {
  private directory: string
  private dirent: Dirent
  private settings: WalkSettings

  constructor(directory: string, dirent: Dirent, settings: WalkSettings) {
    this.directory = directory
    this.dirent = dirent
    this.settings = settings
  }

  path() {
    return join(this.directory, this.dirent.name)
  }

  isDirectory() {
    return this.dirent.isDirectory()
  }

  ignored() {
    return this.settings.ignore.some((pattern) => pattern.test(this.path()))
  }

  own(): WalkEntry[] {
    if (this.included()) return [this.walkEntry()]

    return []
  }

  private walkEntry() {
    return {
      path: this.path(),
      name: this.dirent.name,
      isFile: this.dirent.isFile(),
      isDirectory: this.isDirectory(),
      isSymlink: this.dirent.isSymbolicLink(),
    }
  }

  private included() {
    if (this.dirent.isSymbolicLink()) {
      return this.settings.includeSymlinks
    } else if (this.isDirectory()) {
      return this.settings.includeDirs
    } else {
      return this.settings.includeFiles
    }
  }
}
