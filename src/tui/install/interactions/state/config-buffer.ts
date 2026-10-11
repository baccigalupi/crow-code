import { signal } from '@preact/signals-core'
import { emptyBuffer } from '../../../input-buffer.ts'
import type { InstallStep } from '../../types.ts'

export const defaultRepoDirectory = '.crow'
export const defaultUserDirectory = '~/.crow'

export const repoDirectoryInput = signal(emptyBuffer())
export const userDirectoryInput = signal(emptyBuffer())

export const installStep = signal<InstallStep>('repo')
export const writeConfirmation = signal(true)
