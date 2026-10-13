import { resolve } from '@std/path'
import type { ApplicationOperationArguments } from '../../../types.ts'
import type { PathListing } from '../../types.ts'
import { filePaths } from './search/file-paths.ts'
import { FileOperation } from '../file-operation.ts'

type TaskArguments = {
  path: string
  pattern: string
  ignoredDirectories?: string[]
}

type FindFilesArguments = ApplicationOperationArguments<TaskArguments>

export class FindFiles extends FileOperation<TaskArguments, PathListing> {
  protected override logPrefix = 'Find files: '
  private paths: string[] = []

  result() {
    return { path: this.operationArguments.path, paths: this.paths }
  }

  protected override async perform() {
    const paths = await this.matchingPaths()
    this.paths = paths.sort((left, right) => left.localeCompare(right))
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
