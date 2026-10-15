import { resolve } from '@std/path'
import type { ApplicationOperationArguments } from '../../../types.ts'
import type { PathListing } from '../../types.ts'
import { filePaths } from './search/file-paths.ts'
import { ReadOnlyFileOperation } from './base-operation.ts'

type TaskArguments = {
  path: string
  pattern: string
}

type FindFilesArguments = ApplicationOperationArguments<TaskArguments>

export class FindFiles
  extends ReadOnlyFileOperation<TaskArguments, PathListing> {
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
    return filePaths({
      directory: this.searchPath(),
      ignoredDirectories: this.permissions().ignoredPaths(),
      filePattern: this.operationArguments.pattern,
    }).all()
  }

  private searchPath() {
    return resolve(
      this.applicationData.runtime.cwd(),
      this.operationArguments.path,
    )
  }
}

export const findFiles = (findFilesArguments: FindFilesArguments) => {
  return new FindFiles(findFilesArguments)
}
