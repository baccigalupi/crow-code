/** @jsxImportSource @opentui/react */
import { Prompt } from '../prompt.tsx'
import { defaultCrowRepoDirectory } from '../../interactions/state/config-text.ts'
import type { StepValues } from '../../types.ts'

type RepoPathPromptProps = Pick<StepValues, 'repoDirectory'>

export const RepoPathPrompt = ({ repoDirectory }: RepoPathPromptProps) => {
  return (
    <Prompt
      label="What directory for the local repo crow setup"
      input={repoDirectory}
      defaultValue={defaultCrowRepoDirectory}
    />
  )
}
