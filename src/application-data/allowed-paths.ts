import { memoize } from '../decorators.ts'
import type { ApplicationData } from './application-data.ts'
import { pathPermissions } from './allowed-paths/path-permissions.ts'

export class AllowedPaths {
  private applicationData: ApplicationData

  constructor(applicationData: ApplicationData) {
    this.applicationData = applicationData
  }

  @memoize
  write() {
    return pathPermissions({
      applicationData: this.applicationData,
      allowedDirectories: this.config().writableDirectories,
    })
  }

  @memoize
  read() {
    return pathPermissions({
      applicationData: this.applicationData,
      allowedDirectories: [
        ...this.config().readableDirectories,
        ...this.config().writableDirectories,
      ],
    })
  }

  @memoize
  git() {
    const { applicationData: data } = this
    return pathPermissions({
      applicationData: data,
      allowedDirectories: [data.repositoryRoot],
    })
  }

  @memoize
  private config() {
    return this.applicationData.config
  }
}
