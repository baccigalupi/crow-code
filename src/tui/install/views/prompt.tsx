import { Box, Text } from 'ink'
import { bufferViewModel } from '../../buffer-view-model.ts'
import {
  defaultRepoDirectory,
  defaultUserDirectory,
} from '../interactions/state/directory-buffer.ts'
import type { InputBuffer } from '../../types.ts'
import type { InstallStep } from '../types.ts'

const DefaultValue = ({ buffer, fallback }: {
  readonly buffer: InputBuffer
  readonly fallback: string
}) => {
  if (buffer.text.length !== 0) return null

  return <Text dimColor>({fallback})</Text>
}

const Prompt = ({ label, buffer, fallback }: {
  readonly label: string
  readonly buffer: InputBuffer
  readonly fallback: string
}) => {
  const { before, cursor, after } = bufferViewModel(buffer)
  return (
    <Box paddingX={1}>
      <Text wrap='truncate-end'>
        {label}: {before}
        <DefaultValue buffer={buffer} fallback={fallback} />
        <Text inverse>{cursor}</Text>
        {after}
      </Text>
    </Box>
  )
}

export const RepoPrompt = ({ step, buffer }: {
  readonly step: InstallStep
  readonly buffer: InputBuffer
}) => {
  if (step !== 'repo') return null

  return (
    <Prompt
      label='What directory for the local repo crow setup'
      buffer={buffer}
      fallback={defaultRepoDirectory}
    />
  )
}

export const UserPrompt = ({ step, buffer }: {
  readonly step: InstallStep
  readonly buffer: InputBuffer
}) => {
  if (step !== 'user') return null

  return (
    <Prompt
      label='User crow directory'
      buffer={buffer}
      fallback={defaultUserDirectory}
    />
  )
}
