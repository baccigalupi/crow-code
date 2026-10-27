/** @jsxImportSource @opentui/react */
import { Prompt } from '../prompt.tsx'
import { envPromptViewModel } from './env-prompt-view-model.ts'
import type { CrowConfigInputs } from '../../types.ts'

export const EnvPrompt = (values: CrowConfigInputs) => {
  const { defaultValue } = envPromptViewModel(values)

  return (
    <Prompt
      label="Credentials .env file"
      input={values.envFile}
      defaultValue={defaultValue}
    />
  )
}
