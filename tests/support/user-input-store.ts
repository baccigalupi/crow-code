import { signal } from '@preact/signals-core'
import { emptyText } from '../../src/tui/input-text.ts'
import type {
  InstallProvider,
  InstallStep,
  UserInputStore,
} from '../../src/tui/install/types.ts'

export const buildUserInputStore = (): UserInputStore => ({
  repoDirectory: signal(emptyText()),
  globalDirectory: signal(emptyText()),
  envFile: signal(emptyText()),
  ignore: signal(emptyText()),
  additionalRead: signal(emptyText()),
  additionalWrite: signal(emptyText()),
  escalateRead: signal(emptyText()),
  escalateWrite: signal(emptyText()),
  allowedLocalScripts: signal(emptyText()),
  providerName: signal(emptyText()),
  providerUrl: signal(emptyText()),
  providerCredentials: signal(emptyText()),
  providers: signal<readonly InstallProvider[]>([]),
  envBuffer: signal({}),
  step: signal<InstallStep>('repo'),
  confirmation: signal(true),
})
