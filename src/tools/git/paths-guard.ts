import type { ApplicationData } from '../../application-data.ts'

type GitPathsGuardArguments = {
  applicationData: ApplicationData
}

export class GitPathsGuard {
  private applicationData: ApplicationData

  constructor({ applicationData }: GitPathsGuardArguments) {
    this.applicationData = applicationData
  }

  async allowed(paths: string[]): Promise<boolean> {
    if (paths.some((path) => path.startsWith(':'))) return false
    return await this.applicationData.gitPathPermissions().allowsEvery(paths)
  }
}

export const gitPathsGuard = (args: GitPathsGuardArguments) => {
  return new GitPathsGuard(args)
}
