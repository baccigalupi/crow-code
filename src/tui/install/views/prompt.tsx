import { Box, Text } from 'ink'
import { bufferViewModel } from '../../buffer-view-model.ts'
import {
  defaultCrowGlobalDirectory,
  defaultCrowRepoDirectory,
} from '../interactions/state/config-buffer.ts'
import type { InputBuffer } from '../../types.ts'
import type { InstallStep } from '../types.ts'

const DefaultValue = ({ input, fallback }: {
  readonly input: InputBuffer
  readonly fallback: string
}) => {
  if (input.text.length !== 0) return null

  return <Text dimColor>({fallback})</Text>
}

const Prompt = ({ label, input, fallback }: {
  readonly label: string
  readonly input: InputBuffer
  readonly fallback: string
}) => {
  const { before, cursor, after } = bufferViewModel(input)
  return (
    <Box paddingX={1}>
      <Text wrap='truncate-end'>
        {label}: {before}
        <DefaultValue input={input} fallback={fallback} />
        <Text inverse>{cursor}</Text>
        {after}
      </Text>
    </Box>
  )
}

export const RepoPrompt = ({ step, input }: {
  readonly step: InstallStep
  readonly input: InputBuffer
}) => {
  if (step !== 'repo') return null

  return (
    <Prompt
      label='What directory for the local repo crow setup'
      input={input}
      fallback={defaultCrowRepoDirectory}
    />
  )
}

export const UserPrompt = ({ step, input }: {
  readonly step: InstallStep
  readonly input: InputBuffer
}) => {
  if (step !== 'user') return null

  return (
    <Prompt
      label='User crow directory'
      input={input}
      fallback={defaultCrowGlobalDirectory}
    />
  )
}
