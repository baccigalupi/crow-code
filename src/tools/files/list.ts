import { walk } from '@std/fs'
import { resolve } from '@std/path'
import type { ApplicationOperationArguments, Logger } from '../../types.ts'
import type { PathPermissions } from '../path-permissions.ts'
import type { DirectoryEntry, DirectoryListing } from '../types.ts'
import { directoryEntries } from './list/entries.ts'

type TaskArguments = {
  path: string
  recursive?: boolean
}

type ListDirectoryArguments = ApplicationOperationArguments<TaskArguments> & {
  pathPermissions?: PathPermissions
}

export class ListDirectory {
  operationArguments: TaskArguments
  private permissions: PathPermissions
  private logger: Logger
  private entries: DirectoryEntry[]
  private succeeded: boolean

  constructor(
    {
      applicationData,
      operationArguments,
      pathPermissions = applicationData.pathPermissions(),
    }: ListDirectoryArguments,
  ) {
    this.operationArguments = operationArguments
    this.permissions = pathPermissions
    this.logger = applicationData.logger()
    this.entries = []
    this.succeeded = false
  }

  success() {
    return this.succeeded
  }

  async run() {
    if (await this.pathNotAllowed()) return this

    await this.list()
    return this
  }

  result(): DirectoryListing {
    return { path: this.operationArguments.path, entries: this.entries }
  }

  private async pathNotAllowed() {
    const allowed = await this.permissions.allows(this.operationArguments.path)
    if (!allowed) {
      this.handleError(`path not allowed: ${this.operationArguments.path}`)
    }
    return !allowed
  }

  private async list() {
    try {
      const walked = await Array.fromAsync(walk(this.root(), this.options()))
      this.entries = directoryEntries({ root: this.root(), walked }).sorted()
      this.succeeded = true
    } catch (error) {
      this.handleError((error as Error).message)
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

  private handleError(message: string) {
    this.logger.error(`File error: ${message}`)
  }
}

export const listDirectory = (
  listDirectoryArguments: ListDirectoryArguments,
) => {
  return new ListDirectory(listDirectoryArguments)
}
