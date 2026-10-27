import { crowConfigFromInputs } from '../../crow-config/from-inputs.ts'
import type { CrowConfigInputs } from '../../types.ts'

export const envPromptViewModel = (inputs: CrowConfigInputs) => {
  return { defaultValue: crowConfigFromInputs(inputs).crowConfig().envFile }
}
