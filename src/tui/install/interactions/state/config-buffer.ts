import { signal } from '@preact/signals-core'
import { emptyBuffer } from '../../../input-buffer.ts'
import type { InstallStep, InstallStore } from '../../types.ts'

export const defaultCrowRepoDirectory = '.crow'
export const defaultCrowGlobalDirectory = '~/.crow'

export const installStore: InstallStore = {
  repoDirectory: signal(emptyBuffer()),
  globalDirectory: signal(emptyBuffer()),
  envFile: signal(emptyBuffer()),
  additionalRead: signal(emptyBuffer()),
  escalateRead: signal(emptyBuffer()),
  escalateWrite: signal(emptyBuffer()),
  allowedLocalScripts: signal(emptyBuffer()),
  step: signal<InstallStep>('repo'),
  confirmation: signal(true),
}
