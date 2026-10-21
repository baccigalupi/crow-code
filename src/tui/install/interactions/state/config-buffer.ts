import { signal } from '@preact/signals-core'
import { emptyBuffer } from '../../../input-buffer.ts'
import type { InstallState, InstallStep } from '../../types.ts'

export const defaultCrowRepoDirectory = '.crow'
export const defaultCrowGlobalDirectory = '~/.crow'

export const installState: InstallState = {
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
