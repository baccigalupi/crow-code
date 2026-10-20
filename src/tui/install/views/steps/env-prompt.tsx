import { Prompt } from '../prompt.tsx'
import { envPromptViewModel } from './env-prompt-view-model.ts'
import type { InputBuffer } from '../../../types.ts'
import type { InstallStep } from '../../types.ts'

type EnvPromptProps = {
  readonly step: InstallStep
  readonly globalDirectory: InputBuffer
  readonly envFile: InputBuffer
}

export const EnvPrompt = (
  { step, globalDirectory, envFile }: EnvPromptProps,
) => {
  const { fallback } = envPromptViewModel({ globalDirectory })
  if (step !== 'envFile') return null

  return (
    <Prompt
      label='Credentials .env file'
      input={envFile}
      fallback={fallback}
    />
  )
}
