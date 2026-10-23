import { signal } from '@preact/signals-core'
import { emptyText } from '../../../input-text.ts'
import type { InstallStep, InstallStore } from '../../types.ts'

export const defaultCrowRepoDirectory = '.crow'
export const defaultCrowGlobalDirectory = '~/.crow'

export const installStore: InstallStore = {
  repoDirectory: signal(emptyText()),
  globalDirectory: signal(emptyText()),
  envFile: signal(emptyText()),
  ignore: signal(emptyText()),
  additionalRead: signal(emptyText()),
  escalateRead: signal(emptyText()),
  escalateWrite: signal(emptyText()),
  allowedLocalScripts: signal(emptyText()),
  step: signal<InstallStep>('repo'),
  confirmation: signal(true),
}
