import { Prompt } from '../prompt.tsx'
import type { InputBuffer } from '../../../types.ts'
import type { InstallStep } from '../../types.ts'

type EscalateReadPromptProps = {
  readonly step: InstallStep
  readonly input: InputBuffer
}

export const EscalateReadPrompt = (
  { step, input }: EscalateReadPromptProps,
) => {
  if (step !== 'escalateRead') return null

  return (
    <Prompt
      label='Escalate read directories'
      input={input}
      defaultValue='none'
    />
  )
}
