import type { Signal } from '@preact/signals-core'
import type { ExitApp, InputBuffer, KeyFlags } from '../types.ts'

export type InstallStep = 'repo' | 'user' | 'env' | 'confirm' | 'done'

export type CrowConfig = {
  readonly crowGlobalDirectory: string
  readonly envFile: string
  readonly permissions: {
    readonly ignore: string[]
    readonly additionalRead: string[]
    readonly additionalWrite: string[]
  }
}

export type BuiltCrowConfig = {
  readonly crowRepoDirectory: string
  readonly crowGlobalDirectory: string
  readonly crowConfigPath: string
  readonly config: CrowConfig
  readonly crowConfigJson: string
}

export type CrowConfigWriter = (config: BuiltCrowConfig) => void

export type BuildCrowConfigArguments = {
  readonly globalDirectory: InputBuffer
  readonly repoDirectory: InputBuffer
  readonly envFile: InputBuffer
}

export type InstallAppProps = {
  readonly repoDirectory?: Signal<InputBuffer>
  readonly globalDirectory?: Signal<InputBuffer>
  readonly envFile?: Signal<InputBuffer>
  readonly step?: Signal<InstallStep>
  readonly confirmation?: Signal<boolean>
  readonly save?: CrowConfigWriter
}

export type KeypressSignals = {
  readonly repoDirectory: Signal<InputBuffer>
  readonly globalDirectory: Signal<InputBuffer>
  readonly envFile: Signal<InputBuffer>
  readonly step: Signal<InstallStep>
  readonly confirmation: Signal<boolean>
  readonly save: CrowConfigWriter
}

export type KeypressArguments = {
  readonly signals: KeypressSignals
  readonly exit: ExitApp
  readonly input: string
  readonly key: KeyFlags
}
