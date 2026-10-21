import { Prompt } from '../prompt.tsx'
import { defaultCrowRepoDirectory } from '../../interactions/state/config-buffer.ts'
import type { InputBuffer } from '../../../types.ts'
import type { InstallStep } from '../../types.ts'

type RepoPathPromptProps = {
  readonly step: InstallStep
  readonly input: InputBuffer
}

export const RepoPathPrompt = ({ step, input }: RepoPathPromptProps) => {
  if (step !== 'repo') return null

  return (
    <Prompt
      label='What directory for the local repo crow setup'
      input={input}
      defaultValue={defaultCrowRepoDirectory}
    />
  )
}
