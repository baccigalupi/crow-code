import { resolve } from 'node:path'
import type { ApplicationOperationArguments } from '../../../types.ts'
import type { DirectoryEntry, DirectoryListing } from '../../types.ts'
import { directoryEntries } from './list/entries.ts'
import { ReadOnlyFileOperation } from './base-operation.ts'
import { walk } from './walk.ts'

type TaskArguments = {
  path: string
  recursive?: boolean
}

type ListDirectoryArguments = ApplicationOperationArguments<TaskArguments>

export class ListDirectory
  extends ReadOnlyFileOperation<TaskArguments, DirectoryListing> {
  protected override logPrefix = 'List directory: '
  private entries: DirectoryEntry[] = []

  result() {
    return { path: this.operationArguments.path, entries: this.entries }
  }

  protected override async perform() {
    const directory = this.directory()
    const walked = await walk(directory, this.options())
    this.entries = directoryEntries({ directory, walked }).sorted()
  }

  private options() {
    return { maxDepth: this.depth() }
  }

  private depth() {
    if (this.operationArguments.recursive === true) return Infinity

    return 1
  }

  private directory() {
    return resolve(
      this.applicationData.runtime.cwd,
      this.operationArguments.path,
    )
  }
}

export const listDirectory = (
  listDirectoryArguments: ListDirectoryArguments,
) => {
  return new ListDirectory(listDirectoryArguments)
}
