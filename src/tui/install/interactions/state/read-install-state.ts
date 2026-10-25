import type { InstallState, InstallStore } from '../../types.ts'

export const readInstallState = (installStore: InstallStore) => {
  const entries = Object.entries(installStore).map(([key, source]) => [
    key,
    source.peek(),
  ])
  return Object.fromEntries(entries) as InstallState
}
