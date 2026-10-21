import type { Signal } from '@preact/signals-core'
import type { Filesystem } from '../../application-data/filesystem.ts'
import type { ExitApp, InputBuffer, KeyFlags } from '../types.ts'
import type { CrowPermissionsConfig } from '../../types.ts'

export type InstallStep =
  | 'repo'
  | 'crowGlobalDirectory'
  | 'envFile'
  | 'escalateRead'
  | 'escalateWrite'
  | 'confirm'
  | 'write'
  | 'done'

export type CrowConfig = {
  readonly crowGlobalDirectory: string
  readonly envFile: string
  readonly permissions: CrowPermissionsConfig
}

export type BuiltCrowConfig = {
  readonly crowRepoDirectory: string
  readonly crowGlobalDirectory: string
  readonly crowConfigPath: string
  readonly config: CrowConfig
  readonly crowConfigJson: string
}

export type BuildCrowConfigArguments = {
  readonly globalDirectory: InputBuffer
  readonly repoDirectory: InputBuffer
  readonly envFile: InputBuffer
  readonly escalateRead: InputBuffer
  readonly escalateWrite: InputBuffer
}

export type ConfigPanelProps = BuildCrowConfigArguments & {
  readonly step: InstallStep
}

export type InstallAppProps = {
  readonly repoDirectory?: Signal<InputBuffer>
  readonly globalDirectory?: Signal<InputBuffer>
  readonly envFile?: Signal<InputBuffer>
  readonly escalateRead?: Signal<InputBuffer>
  readonly escalateWrite?: Signal<InputBuffer>
  readonly step?: Signal<InstallStep>
  readonly confirmation?: Signal<boolean>
}

export type InstallState = {
  readonly repoDirectory: Signal<InputBuffer>
  readonly globalDirectory: Signal<InputBuffer>
  readonly envFile: Signal<InputBuffer>
  readonly escalateRead: Signal<InputBuffer>
  readonly escalateWrite: Signal<InputBuffer>
  readonly step: Signal<InstallStep>
  readonly confirmation: Signal<boolean>
}

export type WriteCrowConfigArguments = {
  readonly installData: InstallState
  readonly filesystem: Filesystem
}

export type KeypressArguments = {
  readonly installData: InstallState
  readonly exit: ExitApp
  readonly input: string
  readonly key: KeyFlags
}
