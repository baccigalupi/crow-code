import { Prompt } from '../prompt.tsx'
import type { StepValues } from '../../types.ts'

type EscalateReadPromptProps = Pick<StepValues, 'escalateRead'>

export const EscalateReadPrompt = ({
  escalateRead,
}: EscalateReadPromptProps) => {
  return (
    <Prompt
      label="Escalate read directories"
      input={escalateRead}
      defaultValue="none"
    />
  )
}
