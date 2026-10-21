import { Prompt } from '../prompt.tsx'
import { allowedLocalScriptsPromptViewModel } from './allowed-local-scripts-prompt-view-model.ts'
import type { StepValues } from '../../types.ts'

type AllowedLocalScriptsPromptProps = Pick<StepValues, 'allowedLocalScripts'>

export const AllowedLocalScriptsPrompt = ({
  allowedLocalScripts,
}: AllowedLocalScriptsPromptProps) => {
  const { defaultValue } = allowedLocalScriptsPromptViewModel()

  return (
    <Prompt
      label="Allowed local scripts"
      input={allowedLocalScripts}
      defaultValue={defaultValue}
    />
  )
}
