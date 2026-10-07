import type { ApplicationOperationArguments } from '../../types.ts'
import type { PathPermissions } from '../path-permissions.ts'
import type { SearchListing } from '../types.ts'
import { sortedMatches } from './search/sorted-matches.ts'
import { OperationWithResult } from '../../operation.ts'

type TaskArguments = {
  path: string
  pattern: string
  flags?: string
  ignoredDirectories?: string[]
  pathPermissions?: PathPermissions
}

type SearchFilesArguments = ApplicationOperationArguments<TaskArguments>

export class SearchFiles
  extends OperationWithResult<TaskArguments, SearchListing> {
  protected override logPrefix = 'Search files: '
  private matches: SearchListing['matches'] = []

  async run() {
    if (await this.pathNotAllowed()) return this

    await this.search()
    return this
  }

  result(): SearchListing {
    return { path: this.operationArguments.path, matches: this.matches }
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

  private async search() {
    try {
      this.matches = await sortedMatches(this.operationArguments).all()
    } catch (error) {
      this.fail((error as Error).message)
    }
  }
}

export const searchFiles = (searchFilesArguments: SearchFilesArguments) => {
  return new SearchFiles(searchFilesArguments)
}
