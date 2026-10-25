import { signal } from '@preact/signals-core'
import { emptyText } from '../../../input-text.ts'
import type {
  EnvBuffer,
  InstallProvider,
  InstallStep,
  InstallStore,
} from '../../types.ts'

export const defaultCrowRepoDirectory = '.crow'
export const defaultCrowGlobalDirectory = '~/.crow'

export const installStore: InstallStore = {
  repoDirectory: signal(emptyText()),
  globalDirectory: signal(emptyText()),
  envFile: signal(emptyText()),
  ignore: signal(emptyText()),
  additionalWrite: signal(emptyText()),
  additionalRead: signal(emptyText()),
  escalateRead: signal(emptyText()),
  escalateWrite: signal(emptyText()),
  allowedLocalScripts: signal(emptyText()),
  providerName: signal(emptyText()),
  providerUrl: signal(emptyText()),
  providerCredentials: signal(emptyText()),
  providers: signal<readonly InstallProvider[]>([]),
  envBuffer: signal<EnvBuffer>({}),
  step: signal<InstallStep>('repo'),
  confirmation: signal(true),
}
