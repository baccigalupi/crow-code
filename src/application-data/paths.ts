import { memoize } from '../decorators.ts'
import { pathPermissions } from './path-permissions.ts'
import { gitPathPermissions } from './git-path-permissions.ts'
import type { ApplicationData } from '../application-data.ts'

export class Paths {
  private directory: string
  private applicationData: ApplicationData

  constructor(directory: string, applicationData: ApplicationData) {
    this.directory = directory
    this.applicationData = applicationData
  }

  crowDirectory() {
    return this.directory
  }

  @memoize
  pathPermissions() {
    return pathPermissions({
      getRealPath: this.applicationData.getRealPath(),
    })
  }

  @memoize
  gitPathPermissions() {
    return gitPathPermissions({
      getRealPath: this.applicationData.getRealPath(),
      repositoryRoot: this.applicationData.repositoryRoot(),
    })
  }
}
