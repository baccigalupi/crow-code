import type { Signal } from '@preact/signals-core'
import type { ExitApp, InputText, KeyFlags } from '../types.ts'
import type { CrowPermissionsConfig } from '../../types.ts'
import type { TaskState } from './interactions/state/task-state.ts'

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
  | 'completeSetup'
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

export type SetupTaskStatus = {
  readonly id: string
  readonly label: string
  readonly done: boolean
  readonly error: string
}

export type UserInputData = {
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

export type CrowConfigInputs = Omit<
  UserInputData,
  'step' | 'confirmation' | 'envBuffer'
> &
  Partial<Pick<UserInputData, 'step'>>

export type ProviderInputs = Pick<
  CrowConfigInputs,
  'providerName' | 'providerUrl' | 'providerCredentials' | 'providers' | 'step'
>

export type PermissionInputs = Pick<
  CrowConfigInputs,
  | 'ignore'
  | 'additionalRead'
  | 'additionalWrite'
  | 'escalateRead'
  | 'escalateWrite'
  | 'allowedLocalScripts'
>

export type ConfigPanelProps = CrowConfigInputs & {
  readonly step: InstallStep
}

export type StepValues = CrowConfigInputs & {
  readonly step: InstallStep
  readonly crowConfigPath: string
  readonly confirmation: boolean
  readonly setupTasks: readonly SetupTaskStatus[]
}

export type SetupProgressProps = Pick<StepValues, 'setupTasks'>

export type SetupProgressRow = {
  readonly id: string
  readonly label: string
  readonly indicator: string
  readonly done: boolean
  readonly error: string
}

export type ProviderPromptProps = Pick<
  UserInputData,
  'step' | 'providers' | 'providerName' | 'providerUrl' | 'providerCredentials'
>

export type InstallAppProps = {
  readonly userInputStore?: UserInputStore
  readonly taskStates?: TaskStates
}

export type TaskStates = readonly TaskState[]

export type StatefulTask = {
  readonly reason: string
  label(): string
}

export type UserInputStore = {
  readonly [Key in keyof UserInputData]: Signal<UserInputData[Key]>
}

export type SetupTaskArguments = {
  readonly userInputStore: UserInputStore
}
export type KeypressArguments = {
  readonly userInputStore: UserInputStore
  readonly exit: ExitApp
  readonly input: string
  readonly key: KeyFlags
}
