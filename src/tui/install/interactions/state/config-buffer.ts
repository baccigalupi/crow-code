import { signal } from '@preact/signals-core'
import { emptyBuffer } from '../../../input-buffer.ts'
import type { InstallSignals, InstallStep } from '../../types.ts'

export const defaultCrowRepoDirectory = '.crow'
export const defaultCrowGlobalDirectory = '~/.crow'

export const crowRepoDirectoryInput = signal(emptyBuffer())
export const crowGlobalDirectoryInput = signal(emptyBuffer())
export const envFileInput = signal(emptyBuffer())

export const installStep = signal<InstallStep>('repo')
export const writeConfirmation = signal(true)

export const installSignals: InstallSignals = {
  repoDirectory: crowRepoDirectoryInput,
  globalDirectory: crowGlobalDirectoryInput,
  envFile: envFileInput,
  step: installStep,
  confirmation: writeConfirmation,
}
