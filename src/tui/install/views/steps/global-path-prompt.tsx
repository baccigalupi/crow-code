/** @jsxImportSource @opentui/react */
import { Prompt } from '../prompt.tsx'
import { defaultCrowGlobalDirectory } from '../../data-stores/directories-store.ts'
import type { StepValues } from '../../types.ts'

type GlobalPathPromptProps = Pick<StepValues, 'globalDirectory'>

export const GlobalPathPrompt = ({
  globalDirectory,
}: GlobalPathPromptProps) => {
  return (
    <Prompt
      label="User crow directory"
      input={globalDirectory}
      defaultValue={defaultCrowGlobalDirectory}
    />
  )
}
