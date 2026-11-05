import type { CrowProviderConfig } from '../../types.ts'
import type { CrowConfigInputs } from '../../crow-config/types.ts'
import { theme } from '../../../theme.ts'
import { crowConfigFromInputs } from '../../crow-config/from-inputs.ts'

// The crow config's values, as plain data for the fields that draw them.
export class ConfigJsonViewModel {
  readonly background = theme.configPanel.background
  private inputs: CrowConfigInputs

  constructor(inputs: CrowConfigInputs) {
    this.inputs = inputs
  }

  crowGlobalDirectory() {
    return this.config().crowGlobalDirectory
  }

  envFile() {
    return this.config().envFile
  }

  ignore() {
    return this.listJson(this.permissions().ignore)
  }

  additionalRead() {
    return this.listJson(this.permissions().additionalRead)
  }

  additionalWrite() {
    return this.listJson(this.permissions().additionalWrite)
  }

  escalateRead() {
    return this.listJson(this.permissions().escalateRead)
  }

  escalateWrite() {
    return this.listJson(this.permissions().escalateWrite)
  }

  allowedLocalScripts() {
    return this.listJson(this.permissions().allowedLocalScripts)
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

  json() {
    return crowConfigFromInputs(this.inputs).crowConfigJson()
  }

  private listJson(list: readonly string[]) {
    return JSON.stringify(list, null, 2)
  }

  private permissions() {
    return this.config().permissions
  }

  private config() {
    return crowConfigFromInputs(this.inputs).crowConfig()
  }
}
