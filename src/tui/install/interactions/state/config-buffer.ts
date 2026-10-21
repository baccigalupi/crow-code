import { signal } from '@preact/signals-core'
import { emptyBuffer } from '../../../input-buffer.ts'
import type { InstallState, InstallStep } from '../../types.ts'

export const defaultCrowRepoDirectory = '.crow'
export const defaultCrowGlobalDirectory = '~/.crow'

export const crowRepoDirectoryInput = signal(emptyBuffer())
export const crowGlobalDirectoryInput = signal(emptyBuffer())
export const envFileInput = signal(emptyBuffer())
export const additionalReadInput = signal(emptyBuffer())
export const escalateReadInput = signal(emptyBuffer())
export const escalateWriteInput = signal(emptyBuffer())
export const allowedLocalScriptsInput = signal(emptyBuffer())

export const installStep = signal<InstallStep>('repo')
export const writeConfirmation = signal(true)

export const installState: InstallState = {
  repoDirectory: crowRepoDirectoryInput,
  globalDirectory: crowGlobalDirectoryInput,
  envFile: envFileInput,
  additionalRead: additionalReadInput,
  escalateRead: escalateReadInput,
  escalateWrite: escalateWriteInput,
  allowedLocalScripts: allowedLocalScriptsInput,
  step: installStep,
  confirmation: writeConfirmation,
}
