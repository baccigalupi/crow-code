import { walk } from '@std/fs'
import { resolve } from '@std/path'
import type { ApplicationOperationArguments } from '../../types.ts'
import type { PathPermissions } from '../path-permissions.ts'
import type { DirectoryEntry, DirectoryListing } from '../types.ts'
import { directoryEntries } from './list/entries.ts'
import { OperationWithResult } from '../../operation.ts'

type TaskArguments = {
  path: string
  recursive?: boolean
  pathPermissions?: PathPermissions
}

type ListDirectoryArguments = ApplicationOperationArguments<TaskArguments>

export class ListDirectory
  extends OperationWithResult<TaskArguments, DirectoryListing> {
  protected override logPrefix = 'List directory: '
  private entries: DirectoryEntry[] = []

  async run() {
    if (await this.pathNotAllowed()) return this

    await this.list()
    return this
  }

  result(): DirectoryListing {
    return { path: this.operationArguments.path, entries: this.entries }
  }

  private get permissions() {
    if (this.operationArguments.pathPermissions) {
      return this.operationArguments.pathPermissions
    }
    return this.applicationData.pathPermissions()
  }

  private async pathNotAllowed() {
    const allowed = await this.permissions.allows(this.operationArguments.path)
    if (!allowed) {
      this.fail(`path not allowed: ${this.operationArguments.path}`)
    }
    return !allowed
  }

  private async list() {
    try {
      const walked = await Array.fromAsync(walk(this.root(), this.options()))
      this.entries = directoryEntries({ root: this.root(), walked }).sorted()
    } catch (error) {
      this.fail((error as Error).message)
    }
  }

  private options() {
    return { maxDepth: this.depth(), followSymlinks: false }
  }

  private depth() {
    if (this.operationArguments.recursive === true) return Infinity

    return 1
  }

  private root() {
    return resolve(Deno.cwd(), this.operationArguments.path)
  }
}

export const listDirectory = (
  listDirectoryArguments: ListDirectoryArguments,
) => {
  return new ListDirectory(listDirectoryArguments)
}
