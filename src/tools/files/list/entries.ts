import type { WalkEntry } from '@std/fs'
import { relative } from '@std/path'
import type { DirectoryEntry, DirectoryEntryKind } from '../../types.ts'

type DirectoryEntriesArguments = {
  root: string
  walked: WalkEntry[]
}

export class DirectoryEntries {
  private root: string
  private walked: WalkEntry[]

  constructor({ root, walked }: DirectoryEntriesArguments) {
    this.root = root
    this.walked = walked
  }

  sorted() {
    return this.walked
      .filter((entry) => entry.path !== this.root)
      .map((entry) => this.toEntry(entry))
      .sort((left, right) => this.byPath(left, right))
  }

  private toEntry(entry: WalkEntry) {
    return { path: relative(this.root, entry.path), kind: this.kind(entry) }
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
