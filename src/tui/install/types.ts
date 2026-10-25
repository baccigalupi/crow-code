import type { Signal } from '@preact/signals-core'
import type { Filesystem } from '../../application-data/filesystem.ts'
import type { ExitApp, InputText, KeyFlags } from '../types.ts'
import type { CrowPermissionsConfig } from '../../types.ts'

export type InstallStep =
  | 'repo'
  | 'crowGlobalDirectory'
  | 'envFile'
  | 'ignore'
  | 'additionalRead'
  | 'additionalWrite'
  | 'escalateRead'
  | 'escalateWrite'
  | 'allowedLocalScripts'
  | 'providerName'
  | 'providerUrl'
  | 'providerCredentials'
  | 'confirm'
  | 'write'
  | 'done'

export type InstallProvider = {
  readonly name: string
  readonly url: string
}

export type CrowProviderConfig = {
  readonly name: string
  readonly baseUrl: string
}

export type HighlightJsonArguments = {
  readonly json: string
  readonly key: string
  readonly occurrence?: 'first' | 'last'
}

export type EnvBuffer = Readonly<Record<string, string>>

export type CrowConfig = {
  readonly crowGlobalDirectory: string
  readonly envFile: string
  readonly permissions: CrowPermissionsConfig
  readonly providers: readonly CrowProviderConfig[]
}

export type BuiltCrowConfig = {
  readonly crowRepoDirectory: string
  readonly crowGlobalDirectory: string
  readonly crowConfigPath: string
  readonly config: CrowConfig
  readonly crowConfigJson: string
}

export type InstallState = {
  readonly globalDirectory: InputText
  readonly repoDirectory: InputText
  readonly envFile: InputText
  readonly ignore: InputText
  readonly additionalRead: InputText
  readonly additionalWrite: InputText
  readonly escalateRead: InputText
  readonly escalateWrite: InputText
  readonly allowedLocalScripts: InputText
  readonly providerName: InputText
  readonly providerUrl: InputText
  readonly providerCredentials: InputText
  readonly providers: readonly InstallProvider[]
  readonly step: InstallStep
  readonly confirmation: boolean
  readonly envBuffer: EnvBuffer
}

export type BuildCrowConfigArguments = Omit<
  InstallState,
  'step' | 'confirmation' | 'envBuffer'
> &
  Partial<Pick<InstallState, 'step'>>

export type ProviderInputs = Pick<
  BuildCrowConfigArguments,
  'providerName' | 'providerUrl' | 'providerCredentials' | 'providers' | 'step'
>

export type PermissionInputs = Pick<
  BuildCrowConfigArguments,
  | 'ignore'
  | 'additionalRead'
  | 'additionalWrite'
  | 'escalateRead'
  | 'escalateWrite'
  | 'allowedLocalScripts'
>

export type ConfigPanelProps = BuildCrowConfigArguments & {
  readonly step: InstallStep
}

export type StepValues = BuildCrowConfigArguments & {
  readonly step: InstallStep
  readonly crowConfigPath: string
  readonly confirmation: boolean
}

export type ProviderPromptProps = Pick<
  InstallState,
  'step' | 'providers' | 'providerName' | 'providerUrl' | 'providerCredentials'
>

export type InstallAppProps = {
  readonly installStore?: InstallStore
}

export type InstallStore = {
  readonly [Key in keyof InstallState]: Signal<InstallState[Key]>
}

export type WriteCrowConfigArguments = {
  readonly installData: InstallStore
  readonly filesystem: Filesystem
}

export type KeypressArguments = {
  readonly installData: InstallStore
  readonly exit: ExitApp
  readonly input: string
  readonly key: KeyFlags
}
