import { signal } from '@preact/signals-core'
import { emptyBuffer } from '../../../input-buffer.ts'

export const defaultRepoDirectory = './crow'
export const defaultUserDirectory = '~/.crow'

export const repoDirectoryBuffer = signal(emptyBuffer())
export const userDirectoryBuffer = signal(emptyBuffer())

export const installStep = signal<'repo' | 'user'>('repo')
