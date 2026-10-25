import { signal } from '@preact/signals-core'
import { emptyText } from '../../../input-text.ts'
import type { InstallState, InstallStore } from '../../types.ts'

export const defaultCrowRepoDirectory = '.crow'
export const defaultCrowGlobalDirectory = '~/.crow'

export const initialInstallState = (): InstallState => ({
  repoDirectory: emptyText(),
  globalDirectory: emptyText(),
  envFile: emptyText(),
  ignore: emptyText(),
  additionalWrite: emptyText(),
  additionalRead: emptyText(),
  escalateRead: emptyText(),
  escalateWrite: emptyText(),
  allowedLocalScripts: emptyText(),
  providerName: emptyText(),
  providerUrl: emptyText(),
  providerCredentials: emptyText(),
  providers: [],
  envBuffer: {},
  step: 'repo',
  confirmation: true,
})

const signals = (state: InstallState) => {
  const entries = Object.entries(state).map(([key, value]) => [
    key,
    signal(value),
  ])
  return Object.fromEntries(entries) as InstallStore
}

export const installStore = signals(initialInstallState())
