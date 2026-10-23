/** @jsxImportSource @opentui/react */
import { Prompt } from '../prompt.tsx'
import { additionalReadPromptViewModel } from './additional-read-prompt-view-model.ts'
import type { StepValues } from '../../types.ts'

type AdditionalReadPromptProps = Pick<StepValues, 'additionalRead'>

export const AdditionalReadPrompt = ({
  additionalRead,
}: AdditionalReadPromptProps) => {
  const { defaultValue } = additionalReadPromptViewModel()

  return (
    <Prompt
      label="Additional read directories"
      input={additionalRead}
      defaultValue={defaultValue}
      bare
    />
  )
}
