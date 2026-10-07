import type { ApplicationData } from '../../application-data.ts'
import type { Logger } from '../../types.ts'
import type { PathPermissions } from '../path-permissions.ts'
import type { SearchMatch } from '../types.ts'
import { sortedMatches } from './search/sorted-matches.ts'

type CommandArguments = {
  path: string
  pattern: string
  flags?: string
  ignoredDirectories?: string[]
}

type SearchFilesArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
  pathPermissions?: PathPermissions
}

export class SearchFiles {
  commandArguments: CommandArguments
  private permissions: PathPermissions
  private logger: Logger
  private matches: SearchMatch[]
  private succeeded: boolean

  constructor(
    {
      applicationData,
      commandArguments,
      pathPermissions = applicationData.pathPermissions(),
    }: SearchFilesArguments,
  ) {
    this.commandArguments = commandArguments
    this.permissions = pathPermissions
    this.logger = applicationData.logger()
    this.matches = []
    this.succeeded = false
  }

  success() {
    return this.succeeded
  }

  async run() {
    if (await this.pathNotAllowed()) return this

    await this.search()
    return this
  }

  result() {
    return { path: this.commandArguments.path, matches: this.matches }
  }

  private async pathNotAllowed() {
    const allowed = await this.permissions.allows(this.commandArguments.path)
    if (!allowed) {
      this.handleError(`path not allowed: ${this.commandArguments.path}`)
    }
    return !allowed
  }

  private async search() {
    try {
      this.matches = await sortedMatches(this.commandArguments).all()
      this.succeeded = true
    } catch (error) {
      this.handleError((error as Error).message)
    }
  }

  private handleError(message: string) {
    this.logger.error(`File error: ${message}`)
  }
}

export const searchFiles = (searchFilesArguments: SearchFilesArguments) => {
  return new SearchFiles(searchFilesArguments)
}
