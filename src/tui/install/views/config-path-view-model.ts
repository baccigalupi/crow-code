import { crowConfigFromInputs } from '../crow-config/from-inputs.ts'
import type { CrowConfigInputs } from '../types.ts'

export const configPathViewModel = (crowConfigInputs: CrowConfigInputs) => {
  const builder = crowConfigFromInputs(crowConfigInputs)
  return { crowConfigPath: builder.crowConfigPath() }
}
