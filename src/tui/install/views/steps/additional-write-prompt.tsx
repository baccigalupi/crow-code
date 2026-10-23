/** @jsxImportSource @opentui/react */
import { Prompt } from '../prompt.tsx'
import { additionalWritePromptViewModel } from './additional-write-prompt-view-model.ts'
import type { StepValues } from '../../types.ts'

type AdditionalWritePromptProps = Pick<StepValues, 'additionalWrite'>

export const AdditionalWritePrompt = ({
  additionalWrite,
}: AdditionalWritePromptProps) => {
  const { defaultValue } = additionalWritePromptViewModel()

  return (
    <Prompt
      label="Additional write directories"
      input={additionalWrite}
      defaultValue={defaultValue}
      bare
    />
  )
}
