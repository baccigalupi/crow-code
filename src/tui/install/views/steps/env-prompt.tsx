import { Prompt } from '../prompt.tsx'
import { envPromptViewModel } from './env-prompt-view-model.ts'
import type { StepValues } from '../../types.ts'

type EnvPromptProps = Pick<StepValues, 'globalDirectory' | 'envFile'>

export const EnvPrompt = ({ globalDirectory, envFile }: EnvPromptProps) => {
  const { defaultValue } = envPromptViewModel({ globalDirectory })

  return (
    <Prompt
      label='Credentials .env file'
      input={envFile}
      defaultValue={defaultValue}
    />
  )
}
