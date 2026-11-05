import type { CrowProviderConfig } from '../types.ts'
import type { CrowConfigInputs } from '../crow-config/types.ts'
import { theme } from '../theme.ts'
import { crowConfigFromInputs } from '../crow-config/from-inputs.ts'

// The crow config's values, as plain data for the lines that draw them.
export class ConfigJsonViewModel {
  readonly background = theme.configPanel.background
  private inputs: CrowConfigInputs
  private selectedStep: string

  constructor(inputs: CrowConfigInputs, selectedStep: string) {
    this.inputs = inputs
    this.selectedStep = selectedStep
  }

  // Changes whenever the json or the selected step does, remounting the
  // scrollbox so the highlighted line scrolls into view again.
  key() {
    return `${this.selectedStep}\n${this.json()}`
  }

  crowGlobalDirectory() {
    return this.config().crowGlobalDirectory
  }

  envFile() {
    return this.config().envFile
  }

  ignore() {
    return this.arrayJson(this.permissions().ignore)
  }

  additionalRead() {
    return this.arrayJson(this.permissions().additionalRead)
  }

  additionalWrite() {
    return this.arrayJson(this.permissions().additionalWrite)
  }

  escalateRead() {
    return this.arrayJson(this.permissions().escalateRead)
  }

  escalateWrite() {
    return this.arrayJson(this.permissions().escalateWrite)
  }

  allowedLocalScripts() {
    return this.arrayJson(this.permissions().allowedLocalScripts)
  }

  providers() {
    const { providers } = this.config()
    return providers.map((provider, index) =>
      this.providerRow(provider, index, providers.length),
    )
  }

  private providerRow(
    { name, baseUrl }: CrowProviderConfig,
    index: number,
    count: number,
  ) {
    const last = index === count - 1
    return { index, name, baseUrl, last }
  }

  private json() {
    return crowConfigFromInputs(this.inputs).crowConfigJson()
  }

  private arrayJson(paths: readonly string[]) {
    return JSON.stringify(paths, null, 2)
  }

  private permissions() {
    return this.config().permissions
  }

  private config() {
    return crowConfigFromInputs(this.inputs).crowConfig()
  }
}

export const configJsonViewModel = (
  inputs: CrowConfigInputs,
  selectedStep: string,
) => new ConfigJsonViewModel(inputs, selectedStep)
