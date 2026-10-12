import type { ApplicationData } from '../application-data.ts'
import type { PathPermissions } from './path-permissions.ts'
import { pathPermissions } from './path-permissions.ts'
import { gitRepositoryRoot } from './repository-root.ts'

type GitPathPermissionsArguments = {
  applicationData: ApplicationData
}

const repositoryRoot = (applicationData: ApplicationData) =>
  gitRepositoryRoot({
    denoCommand: applicationData.denoCommand(),
    logger: applicationData.logger(),
  }).run()
    .then((operation) => [operation.result()])

export const gitPathPermissions = (
  { applicationData }: GitPathPermissionsArguments,
): PathPermissions => {
  return pathPermissions({
    getRealPath: applicationData.getRealPath(),
    allowedDirectories: repositoryRoot(applicationData),
  })
}
