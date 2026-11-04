import type { Keypress } from '../keypress.ts'
import type { AsyncOperation, CrowPermissionsConfig } from '../../types.ts'
import type { ApplicationData } from '../../application-data/application-data.ts'
import type { CrowConfigInputs } from './crow-config/types.ts'
import type { Panels } from './panels.ts'
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

// The config line a panel edits; a key that is not in the config highlights
// nothing.
export type PanelHighlights = Omit<HighlightJsonArguments, 'json'>

export type StatefulTask = {
  readonly reason: string
  label(): string
}

export type SetupTask = AsyncOperation & StatefulTask

export type DataStoreArguments = {
  readonly applicationData: ApplicationData
}

export type SetupTaskArguments = {
  readonly inputs: CrowConfigInputs
}

export type RunAllArguments = SetupTaskArguments & {
  readonly finished: (task: StatefulTask) => void
}

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
