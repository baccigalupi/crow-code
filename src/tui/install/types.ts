import type { Signal } from '@preact/signals-core'
import type { InputBuffer } from '../types.ts'

export type InstallStep = 'repo' | 'user'

export type InstallAppProps = {
  readonly repo?: Signal<InputBuffer>
  readonly user?: Signal<InputBuffer>
  readonly step?: Signal<InstallStep>
}

export type InstallKeysArgs = {
  readonly repo: Signal<InputBuffer>
  readonly user: Signal<InputBuffer>
  readonly step: Signal<InstallStep>
}
