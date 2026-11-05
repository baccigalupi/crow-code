import type { CrowProviderConfig } from '../../types.ts'
import type { CrowConfigInputs } from '../../crow-config/types.ts'
import type { CrowPermissionsConfig } from '../../../../types.ts'
import { theme } from '../../../theme.ts'
import { crowConfigFromInputs } from '../../crow-config/from-inputs.ts'

// The crow config's values, as plain data for the fields that draw them.
export class ConfigJsonViewModel {
  readonly background = theme.configPanel.background
  private inputs: CrowConfigInputs

  constructor(inputs: CrowConfigInputs) {
    this.inputs = inputs
  }

  value(name: 'crowGlobalDirectory' | 'envFile') {
    return this.config()[name]
  }

  permission(name: keyof CrowPermissionsConfig) {
    return this.config().permissions[name]
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

  private config() {
    return crowConfigFromInputs(this.inputs).crowConfig()
  }
}
