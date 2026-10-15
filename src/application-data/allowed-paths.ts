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
    return this.permitting([
      Deno.cwd(),
      ...this.applicationData.config.writableDirectories,
    ])
  }

  @memoize
  read() {
    return this.permitting([
      Deno.cwd(),
      ...this.applicationData.config.readableDirectories,
      ...this.applicationData.config.writableDirectories,
    ])
  }

  @memoize
  git() {
    return this.permitting([this.applicationData.repositoryRoot])
  }

  private permitting(allowedDirectories: string[]) {
    return pathPermissions({
      getRealPath: this.applicationData.getRealPath(),
      envars: this.applicationData.envars(),
      allowedDirectories,
    })
  }
}
