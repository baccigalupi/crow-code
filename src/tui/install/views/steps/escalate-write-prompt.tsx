import { Prompt } from '../prompt.tsx'
import { escalateWritePromptViewModel } from './escalate-write-prompt-view-model.ts'
import type { StepValues } from '../../types.ts'

type EscalateWritePromptProps = Pick<StepValues, 'escalateWrite'>

export const EscalateWritePrompt = ({
  escalateWrite,
}: EscalateWritePromptProps) => {
  const { defaultValue } = escalateWritePromptViewModel()

  return (
    <Prompt
      label="Escalate write directories"
      input={escalateWrite}
      defaultValue={defaultValue}
    />
  )
}
