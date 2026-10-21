import { Prompt } from '../prompt.tsx'
import { escalateWritePromptViewModel } from './escalate-write-prompt-view-model.ts'
import type { InputBuffer } from '../../../types.ts'
import type { InstallStep } from '../../types.ts'

type EscalateWritePromptProps = {
  readonly step: InstallStep
  readonly input: InputBuffer
}

export const EscalateWritePrompt = (
  { step, input }: EscalateWritePromptProps,
) => {
  const { defaultValue } = escalateWritePromptViewModel()
  if (step !== 'escalateWrite') return null

  return (
    <Prompt
      label='Escalate write directories'
      input={input}
      defaultValue={defaultValue}
    />
  )
}
