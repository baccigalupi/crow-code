import { Prompt } from '../prompt.tsx'
import type { StepValues } from '../../types.ts'

type AdditionalReadPromptProps = Pick<StepValues, 'additionalRead'>

export const AdditionalReadPrompt = ({
  additionalRead,
}: AdditionalReadPromptProps) => {
  return (
    <Prompt
      label="Additional read directories"
      input={additionalRead}
      defaultValue="none"
    />
  )
}
