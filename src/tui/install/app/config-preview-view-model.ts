import type { CrowConfigInputs } from '../crow-config/types.ts'
import { crowConfigFromInputs } from '../crow-config/from-inputs.ts'

// The line naming where the crow config built from the answers so far goes.
export class ConfigPreviewViewModel {
  private inputs: CrowConfigInputs

  constructor(inputs: CrowConfigInputs) {
    this.inputs = inputs
  }

  pathLine() {
    const path = crowConfigFromInputs(this.inputs).crowConfigPath()
    return `Installing repo config in: ${path}`
  }
}
