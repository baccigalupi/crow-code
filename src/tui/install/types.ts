import type { Signal } from '@preact/signals-core'
import type { ExitApp, InputBuffer, KeyFlags } from '../types.ts'

export type InstallStep = 'repo' | 'user' | 'confirm' | 'done'

export type CrowConfig = {
  readonly userDirectory: string
  readonly permissions: {
    readonly ignore: string[]
    readonly additionalRead: string[]
    readonly additionalWrite: string[]
  }
}

export type InstallConfig = {
  readonly repoDirectory: string
  readonly userDirectory: string
  readonly filePath: string
  readonly config: CrowConfig
  readonly json: string
}

export type InstallConfigSaver = (config: InstallConfig) => void

export type InstallConfigArguments = {
  readonly user: InputBuffer
  readonly repo: InputBuffer
}

export type InstallAppProps = {
  readonly repo?: Signal<InputBuffer>
  readonly user?: Signal<InputBuffer>
  readonly step?: Signal<InstallStep>
  readonly confirmation?: Signal<boolean>
  readonly save?: InstallConfigSaver
}

export type KeypressSignals = {
  readonly repo: Signal<InputBuffer>
  readonly user: Signal<InputBuffer>
  readonly step: Signal<InstallStep>
  readonly confirmation: Signal<boolean>
  readonly save: InstallConfigSaver
}

export type KeypressArguments = {
  readonly signals: KeypressSignals
  readonly exit: ExitApp
  readonly input: string
  readonly key: KeyFlags
}
