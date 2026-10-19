import type { ApplicationOperationArguments } from '../../../types.ts'
import type { SearchListing } from '../../types.ts'
import { sortedMatches } from './search/sorted-matches.ts'
import { ReadOnlyFileOperation } from './base-operation.ts'

type TaskArguments = {
  path: string
  pattern: string
  flags?: string
  context?: number
  filePattern?: string
}

type SearchFilesArguments = ApplicationOperationArguments<TaskArguments>

export class SearchFiles
  extends ReadOnlyFileOperation<TaskArguments, SearchListing> {
  protected override logPrefix = 'Search files: '
  private matches: SearchListing['matches'] = []

  result() {
    return { path: this.operationArguments.path, matches: this.matches }
  }

  protected override async perform() {
    this.matches = await this.sortedMatches().all()
  }

  private sortedMatches() {
    return sortedMatches({
      ...this.operationArguments,
      ignoredDirectories: this.permissions().ignoredPaths(),
      cwd: this.applicationData.runtime.cwd,
      filesystem: this.applicationData.filesystem,
    })
  }
}

export const searchFiles = (searchFilesArguments: SearchFilesArguments) => {
  return new SearchFiles(searchFilesArguments)
}
