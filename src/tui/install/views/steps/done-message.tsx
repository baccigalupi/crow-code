import { Box, Text } from 'ink'
import type { InstallStep } from '../../types.ts'

type DoneMessageProps = {
  readonly step: InstallStep
  readonly crowConfigPath: string
}

export const DoneMessage = ({ step, crowConfigPath }: DoneMessageProps) => {
  if (step !== 'done') return null

  return (
    <Box paddingX={1} flexDirection='column'>
      <Text>Wrote config to {crowConfigPath}</Text>
      <Text dimColor>press any key to exit</Text>
    </Box>
  )
}
