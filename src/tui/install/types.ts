import type { ReadonlySignal } from '@preact/signals-core'
import type { RenderContext, Renderable } from '@opentui/core'
import type { InputText } from '../types.ts'
import type { Keypress } from '../keypress.ts'
import type { Navigator } from '../navigator.ts'
import type { AsyncOperation, CrowPermissionsConfig } from '../../types.ts'
import type { ApplicationData } from '../../application-data/application-data.ts'
import type { ConfirmPromptViewModel } from './view-models/confirm-prompt-view-model.ts'
import type { DoneMessageViewModel } from './view-models/done-message-view-model.ts'
import type { ProviderPromptViewModel } from './view-models/provider-prompt-view-model.ts'
import type { SetupProgressViewModel } from './view-models/setup-progress-view-model.ts'
import type { TextPromptViewModel } from './view-models/text-prompt-view-model.ts'
import type { DirectoriesStore } from './data-stores/directories-store.ts'
import type { PermissionsStore } from './data-stores/permissions-store.ts'
import type { SetupProgressStore } from './data-stores/setup-progress-store.ts'
import type { ConfirmStore } from './data-stores/confirm-store.ts'
import type { ProvidersStore } from './data-stores/providers-store.ts'
import type { TextFieldStore } from './data-stores/text-field-store.ts'

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

export type ConfigPanelValues = CrowConfigInputs & {
  readonly step: InstallStep
}

// The config json split around the line the current step edits.
export type HighlightedJson = {
  readonly before: string
  readonly highlighted: string
  readonly after: string
}

export type ConfigPanelProps = HighlightedJson & {
  readonly visible: boolean
  readonly crowConfigPath: string
}

export type StepValues = CrowConfigInputs & {
  readonly step: InstallStep
  readonly crowConfigPath: string
  readonly confirmation: boolean
  readonly setupTasks: readonly SetupTaskStatus[]
}

export type SetupProgressValues = Pick<StepValues, 'setupTasks'>

export type SetupProgressRow = {
  readonly id: string
  readonly label: string
  readonly indicator: string
  readonly done: boolean
  readonly error: string
}

export type SetupProgressProps = {
  readonly rows: readonly SetupProgressRow[]
}

export type DoneMessageProps = SetupProgressProps & {
  readonly hint: string
}

export type ProviderPromptValues = Pick<
  UserInputData,
  'step' | 'providers' | 'providerName' | 'providerUrl' | 'providerCredentials'
>

export type ProviderFieldDefinition = {
  readonly label: string
  readonly input: 'providerName' | 'providerUrl' | 'providerCredentials'
  readonly masked: boolean
}

export type ProviderFieldStatus = 'done' | 'active' | 'pending'

export type ProviderFieldProps = {
  readonly label: string
  readonly input: InputText
  readonly masked: boolean
  readonly status: ProviderFieldStatus
}

export type ProviderPromptProps = {
  readonly title: string
  readonly fields: readonly ProviderFieldProps[]
}

export type ConfirmPromptProps = {
  readonly selectedIndex: number
}

export type TextPromptStep = Extract<
  InstallStep,
  | 'repo'
  | 'crowGlobalDirectory'
  | 'envFile'
  | 'ignore'
  | 'additionalRead'
  | 'additionalWrite'
  | 'escalateRead'
  | 'escalateWrite'
  | 'allowedLocalScripts'
>

export type TextPromptInputKey = Extract<
  keyof CrowConfigInputs,
  | 'repoDirectory'
  | 'globalDirectory'
  | 'envFile'
  | 'ignore'
  | 'additionalRead'
  | 'additionalWrite'
  | 'escalateRead'
  | 'escalateWrite'
  | 'allowedLocalScripts'
>

export type TextPromptProps = {
  readonly label: string
  readonly input: InputText
  readonly defaultValue: string
  readonly bare?: boolean
}

export type TextPromptViewModelArguments = {
  readonly directories: DirectoriesStore
  readonly permissions: PermissionsStore
}

export type EmptyStepProps = Readonly<Record<string, never>>

export type StepProps =
  | TextPromptProps
  | ProviderPromptProps
  | ConfirmPromptProps
  | SetupProgressProps
  | DoneMessageProps
  | EmptyStepProps

// The current step and what its prompt view draws.
export type StepPromptsProps = {
  readonly step: InstallStep
  readonly props: StepProps
}

export type StepPropsBuilders = Partial<
  Record<InstallStep, (values: StepValues) => StepProps>
>

export type StepPromptsViewModelArguments = {
  readonly text: TextPromptViewModel
  readonly provider: ProviderPromptViewModel
  readonly confirm: ConfirmPromptViewModel
  readonly progress: SetupProgressViewModel
  readonly done: DoneMessageViewModel
}

export type StepView = {
  root(): Renderable
  update(props: StepProps): void
}

export type StepViewClass = new (renderer: RenderContext) => StepView

export type InstallScreenViews = {
  readonly configPanel: { update(props: ConfigPanelProps): void }
  readonly stepPrompts: { update(props: StepPromptsProps): void }
}

export type StatefulTask = {
  readonly reason: string
  label(): string
}

export type SetupTask = AsyncOperation & StatefulTask

export type DataStoreArguments = {
  readonly applicationData: ApplicationData
}

export type SetupTaskArguments = {
  readonly inputs: ReadonlySignal<UserInputData>
  readonly navigator: Navigator<InstallStep>
}

export type RunAllArguments = SetupTaskArguments & {
  readonly progress: SetupProgressStore
}

export type SetupStoreArguments = DataStoreArguments & SetupTaskArguments

export type TextEditorArguments = {
  readonly field: TextFieldStore
  readonly keypress: Keypress
}

export type ProviderFormControllerArguments = {
  readonly field: TextFieldStore
  readonly providers: ProvidersStore
  readonly back?: InstallStep
  readonly forward?: InstallStep
}

export type TextFlowArguments = {
  readonly directories: DirectoriesStore
  readonly permissions: PermissionsStore
}

export type InstallFlowArguments = {
  readonly directories: DirectoriesStore
  readonly permissions: PermissionsStore
  readonly providers: ProvidersStore
  readonly confirm: ConfirmStore
}
