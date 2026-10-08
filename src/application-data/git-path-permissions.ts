import type { ApplicationData } from '../application-data.ts'
import { PathPermissions } from './path-permissions.ts'
import { gitRepositoryRoot } from '../tools/git/repository-root.ts'

type GitPathPermissionsArguments = {
  applicationData: ApplicationData
}

export class GitPathPermissions extends PathPermissions {
  private root: Promise<string> = gitRepositoryRoot({
    applicationData: this.applicationData,
  }).run().then((operation) => operation.result())

  protected override async absoluteDirectories(): Promise<string[]> {
    return [await this.root]
  }
}

export const gitPathPermissions = (args: GitPathPermissionsArguments) => {
  return new GitPathPermissions(args)
}
