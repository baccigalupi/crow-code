import type { InputText } from '../../types.ts'
import type { InstallProvider, PanelName } from '../types.ts'

export type PermissionInputs = {
  readonly ignore: InputText
  readonly additionalRead: InputText
  readonly additionalWrite: InputText
  readonly escalateRead: InputText
  readonly escalateWrite: InputText
  readonly allowedLocalScripts: InputText
}

export type ProviderInputs = {
  readonly providerName: InputText
  readonly providerUrl: InputText
  readonly providerCredentials: InputText
  readonly providers: readonly InstallProvider[]
  readonly step?: PanelName
}

export type CrowConfigInputs = PermissionInputs &
  ProviderInputs & {
    readonly globalDirectory: InputText
    readonly repoDirectory: InputText
    readonly envFile: InputText
  }
