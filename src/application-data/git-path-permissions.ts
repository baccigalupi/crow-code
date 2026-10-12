import type { RealPath } from '../types.ts'
import type { PathPermissions } from './path-permissions.ts'
import { pathPermissions } from './path-permissions.ts'

type GitPathPermissionsArguments = {
  getRealPath: RealPath
  repositoryRoot: string | Promise<string>
}

export const gitPathPermissions = (
  { getRealPath, repositoryRoot }: GitPathPermissionsArguments,
): PathPermissions => {
  return pathPermissions({
    getRealPath,
    allowedDirectories: Promise.resolve(repositoryRoot).then((root) => [root]),
  })
}
