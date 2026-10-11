import { resolve } from '@std/path'
import type { ApplicationOperationArguments } from '../../types.ts'
import type { PathListing } from '../types.ts'
import { filePaths } from './search/file-paths.ts'
import { OperationWithResult } from '../../operation.ts'

type TaskArguments = {
  path: string
  pattern: string
  ignoredDirectories?: string[]
}

type FindFilesArguments = ApplicationOperationArguments<TaskArguments>

export class FindFiles extends OperationWithResult<TaskArguments, PathListing> {
  protected override logPrefix = 'Find files: '
  private paths: string[] = []

  async run() {
    if (await this.pathNotAllowed()) return this

    await this.find()
    return this
  }

  result(): PathListing {
    return { path: this.operationArguments.path, paths: this.paths }
  }

  private async pathNotAllowed() {
    const allowed = await this.applicationData.pathPermissions().allows(
      this.operationArguments.path,
    )
    if (!allowed) {
      this.fail(`path not allowed: ${this.operationArguments.path}`)
    }
    return !allowed
  }

  private async find() {
    try {
      const paths = await this.matchingPaths()
      this.paths = paths.sort((left, right) => left.localeCompare(right))
    } catch (error) {
      this.fail((error as Error).message)
    }
  }

  private matchingPaths() {
    const { ignoredDirectories, pattern } = this.operationArguments
    return filePaths({
      directory: this.searchPath(),
      ignoredDirectories,
      filePattern: pattern,
    }).all()
  }

  private searchPath() {
    return resolve(Deno.cwd(), this.operationArguments.path)
  }
}

export const findFiles = (findFilesArguments: FindFilesArguments) => {
  return new FindFiles(findFilesArguments)
}
