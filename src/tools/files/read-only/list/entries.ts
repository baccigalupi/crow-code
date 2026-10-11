import type { WalkEntry } from '@std/fs'
import { relative } from '@std/path'
import type { DirectoryEntry, DirectoryEntryKind } from '../../../types.ts'

type DirectoryEntriesArguments = {
  directory: string
  walked: WalkEntry[]
}

export class DirectoryEntries {
  private directory: string
  private walked: WalkEntry[]

  constructor({ directory, walked }: DirectoryEntriesArguments) {
    this.directory = directory
    this.walked = walked
  }

  sorted() {
    return this.walked
      .filter((entry) => entry.path !== this.directory)
      .map((entry) => this.toEntry(entry))
      .sort((left, right) => this.byPath(left, right))
  }

  private toEntry(entry: WalkEntry) {
    return {
      path: relative(this.directory, entry.path),
      kind: this.kind(entry),
    }
  }

  private kind(entry: WalkEntry): DirectoryEntryKind {
    if (entry.isDirectory) {
      return 'directory'
    } else if (entry.isSymlink) {
      return 'symlink'
    } else {
      return 'file'
    }
  }

  private byPath(left: DirectoryEntry, right: DirectoryEntry) {
    return left.path.localeCompare(right.path)
  }
}

export const directoryEntries = (
  directoryEntriesArguments: DirectoryEntriesArguments,
) => {
  return new DirectoryEntries(directoryEntriesArguments)
}
