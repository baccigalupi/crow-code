import type { Signal } from '@preact/signals-core'
import type { Filesystem } from '../../application-data/filesystem.ts'
import type { ExitApp, InputBuffer, KeyFlags } from '../types.ts'
import type { CrowPermissionsConfig } from '../../types.ts'

export type InstallStep =
  | 'repo'
  | 'crowGlobalDirectory'
  | 'envFile'
  | 'additionalRead'
  | 'escalateRead'
  | 'escalateWrite'
  | 'allowedLocalScripts'
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
  readonly additionalRead: InputBuffer
  readonly escalateRead: InputBuffer
  readonly escalateWrite: InputBuffer
  readonly allowedLocalScripts: InputBuffer
}

export type PermissionInputs = Pick<
  BuildCrowConfigArguments,
  'additionalRead' | 'escalateRead' | 'escalateWrite' | 'allowedLocalScripts'
>

export type ConfigPanelProps = BuildCrowConfigArguments & {
  readonly step: InstallStep
}

export type StepValues = BuildCrowConfigArguments & {
  readonly crowConfigPath: string
  readonly confirmation: boolean
}

export type InstallAppProps = {
  readonly installState?: InstallState
}

export type InstallValues = BuildCrowConfigArguments & {
  readonly step: InstallStep
  readonly confirmation: boolean
}

export type InstallState = {
  readonly [Key in keyof InstallValues]: Signal<InstallValues[Key]>
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
