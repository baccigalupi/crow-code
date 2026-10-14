import { Box, Text } from 'ink'
import { configViewModel } from './config-view-model.ts'
import type { InputBuffer } from '../../../types.ts'
import type { InstallStep } from '../../types.ts'

type DoneMessageProps = {
  readonly step: InstallStep
  readonly repoDirectory: InputBuffer
  readonly globalDirectory: InputBuffer
  readonly envFile: InputBuffer
}

export const DoneMessage = (
  { step, repoDirectory, globalDirectory, envFile }: DoneMessageProps,
) => {
  if (step !== 'done') return null

  const { crowConfigPath } = configViewModel({
    repoDirectory,
    globalDirectory,
    envFile,
  })
  return (
    <Box paddingX={1} flexDirection='column'>
      <Text>Wrote config to {crowConfigPath}</Text>
      <Text dimColor>press any key to exit</Text>
    </Box>
  )
}
