import type { Keypress } from '../keypress.ts'
import type { AsyncOperation, CrowPermissionsConfig } from '../../types.ts'
import type { ApplicationData } from '../../application-data/application-data.ts'
import type { CrowConfigInputs } from './crow-config/types.ts'
import type { DataStore } from './data-store.ts'
import type { Router } from './router.ts'
import type { TextFieldStore } from './data-stores/text-field-store.ts'

// The names of the panels that take keys, derived from the registry. The
// template form keeps the literals from widening to string in object literals.
export type PanelName = `${Router['prompts'][number]['name']}`

export type PromptPanel = Router['prompts'][number]

export type InstallProvider = {
  readonly name: string
  readonly url: string
}

export type CrowProviderConfig = {
  readonly name: string
  readonly baseUrl: string
}

export type ConfigLineArguments = {
  readonly step: string
  readonly editable: boolean
  readonly selectedStep: string
}

export type ProviderRow = {
  readonly index: number
  readonly name: string
  readonly baseUrl: string
  readonly last: boolean
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

export type ProviderFieldName =
  'providerName' | 'providerUrl' | 'providerCredentials'

export type ProviderFieldState = 'answered' | 'live' | 'upcoming'

export type SetupTaskRow = SetupTaskStatus & {
  readonly state: 'failed' | 'done' | 'running' | 'waiting'
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
  readonly inputs: CrowConfigInputs
}

export type GlobalDirectoryTaskArguments = {
  readonly globalDirectory: string
}

export type RunAllArguments = SetupTaskArguments &
  GlobalDirectoryTaskArguments & {
    readonly finished: (task: StatefulTask) => void
  }

export type TextEditorArguments = {
  readonly field: TextFieldStore
  readonly keypress: Keypress
}

// How a prompt moves the installer: to another panel, or out.
export type Navigation = {
  goTo(name: PanelName): void
  exit(): void
}

export type PromptArguments<Panel> = {
  readonly panel: Panel
  readonly store: DataStore
  readonly navigation: Navigation
}
