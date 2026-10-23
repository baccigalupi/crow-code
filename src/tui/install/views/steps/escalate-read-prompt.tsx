/** @jsxImportSource @opentui/react */
import { Prompt } from '../prompt.tsx'
import { escalateReadPromptViewModel } from './escalate-read-prompt-view-model.ts'
import type { StepValues } from '../../types.ts'

type EscalateReadPromptProps = Pick<StepValues, 'escalateRead'>

export const EscalateReadPrompt = ({
  escalateRead,
}: EscalateReadPromptProps) => {
  const { defaultValue } = escalateReadPromptViewModel()

  return (
    <Prompt
      label="Escalate read directories"
      input={escalateRead}
      defaultValue={defaultValue}
      bare
    />
  )
}
