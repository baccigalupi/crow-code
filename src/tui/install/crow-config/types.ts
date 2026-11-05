import type { InstallProvider, StepName } from '../types.ts'

export type PermissionInputs = {
  readonly ignore: string
  readonly additionalRead: string
  readonly additionalWrite: string
  readonly escalateRead: string
  readonly escalateWrite: string
  readonly allowedLocalScripts: string
}

export type ProviderInputs = {
  readonly providerName: string
  readonly providerUrl: string
  readonly providerCredentials: string
  readonly providers: readonly InstallProvider[]
  readonly step?: StepName
}

export type CrowConfigInputs = PermissionInputs &
  ProviderInputs & {
    readonly globalDirectory: string
    readonly repoDirectory: string
    readonly envFile: string
  }
