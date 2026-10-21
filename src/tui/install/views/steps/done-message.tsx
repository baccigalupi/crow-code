import { Box, Text } from 'ink'
import type { StepValues } from '../../types.ts'

type DoneMessageProps = Pick<StepValues, 'crowConfigPath'>

export const DoneMessage = ({ crowConfigPath }: DoneMessageProps) => {
  return (
    <Box paddingX={1} flexDirection="column">
      <Text>Wrote config to {crowConfigPath}</Text>
      <Text dimColor>press any key to exit</Text>
    </Box>
  )
}
