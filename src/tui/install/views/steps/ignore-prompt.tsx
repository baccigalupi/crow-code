/** @jsxImportSource @opentui/react */
import { Prompt } from '../prompt.tsx'
import { ignorePromptViewModel } from './ignore-prompt-view-model.ts'
import type { StepValues } from '../../types.ts'

type IgnorePromptProps = Pick<StepValues, 'ignore'>

export const IgnorePrompt = ({ ignore }: IgnorePromptProps) => {
  const { defaultValue } = ignorePromptViewModel()

  return (
    <Prompt
      label="Ignored paths"
      input={ignore}
      defaultValue={defaultValue}
      bare
    />
  )
}
