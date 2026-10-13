import type { ApplicationOperationArguments } from '../../../types.ts'
import type { SearchListing } from '../../types.ts'
import { sortedMatches } from './search/sorted-matches.ts'
import { FileOperation } from '../file-operation.ts'

type TaskArguments = {
  path: string
  pattern: string
  flags?: string
  context?: number
  ignoredDirectories?: string[]
  filePattern?: string
}

type SearchFilesArguments = ApplicationOperationArguments<TaskArguments>

export class SearchFiles extends FileOperation<TaskArguments, SearchListing> {
  protected override logPrefix = 'Search files: '
  private matches: SearchListing['matches'] = []

  result() {
    return { path: this.operationArguments.path, matches: this.matches }
  }

  protected override async perform() {
    this.matches = await sortedMatches(this.operationArguments).all()
  }
}

export const searchFiles = (searchFilesArguments: SearchFilesArguments) => {
  return new SearchFiles(searchFilesArguments)
}
