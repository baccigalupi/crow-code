import { Prompt } from '../prompt.tsx'
import { defaultCrowGlobalDirectory } from '../../interactions/state/config-buffer.ts'
import type { InputBuffer } from '../../../types.ts'
import type { InstallStep } from '../../types.ts'

type GlobalPathPromptProps = {
  readonly step: InstallStep
  readonly input: InputBuffer
}

export const GlobalPathPrompt = ({ step, input }: GlobalPathPromptProps) => {
  if (step !== 'user') return null

  return (
    <Prompt
      label='User crow directory'
      input={input}
      fallback={defaultCrowGlobalDirectory}
    />
  )
}
