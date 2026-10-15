import type { PathPermissions } from '../../src/application-data/allowed-paths/path-permissions.ts'

export const denyAllPermissions = () =>
  ({ allows: () => Promise.resolve(false) }) as unknown as PathPermissions
