import type { ReadonlySignal } from '@preact/signals-core'
import type { Renderable } from '@opentui/core'
import type { InputText } from '../types.ts'
import type { Keypress } from '../keypress.ts'
import type { Navigator } from '../navigator.ts'
import type { AsyncOperation, CrowPermissionsConfig } from '../../types.ts'
import type { ApplicationData } from '../../application-data/application-data.ts'
import type { Panels } from './panels.ts'
import type { SetupProgressStore } from './data-stores/setup-progress-store.ts'
import type { ProviderEditFormStore } from './data-stores/provider-edit-form-store.ts'
import type { ProviderStore } from './data-stores/provider-store.ts'
import type { TextFieldStore } from './data-stores/text-field-store.ts'

// The names of the panels that take keys, derived from the registry. The
// template form keeps the literals from widening to string in object literals.
export type PanelName = `${Panels['prompts'][number]['name']}`

export type PromptPanel = Panels['prompts'][number]

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
  readonly step: PanelName
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
  readonly step: PanelName
}

// The config line a panel edits; a key that is not in the config highlights
// nothing.
export type PanelHighlights = Omit<HighlightJsonArguments, 'json'>

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
  readonly step: PanelName
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

export type TextPromptProps = {
  readonly label: string
  readonly input: InputText
  readonly defaultValue: string
  readonly bare?: boolean
}

export type StepProps =
  | TextPromptProps
  | ProviderPromptProps
  | ConfirmPromptProps
  | SetupProgressProps
  | DoneMessageProps

// What a prompt panel draws its prompt from and with.
export type PanelViewModel = {
  props(values: StepValues): StepProps
}

export type PanelView = {
  root(): Renderable
  update(props: StepProps): void
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
  readonly navigator: Navigator<PanelName>
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
  readonly form: ProviderEditFormStore
  readonly providers: ProviderStore
  readonly back?: PanelName
  readonly forward?: PanelName
}
