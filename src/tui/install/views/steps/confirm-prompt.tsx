import { Box, Text } from 'ink'
import type { StepValues } from '../../types.ts'

type ConfirmPromptProps = Pick<StepValues, 'crowConfigPath' | 'confirmation'>

const Choice = ({
  label,
  active,
}: {
  readonly label: string
  readonly active: boolean
}) => {
  if (!active) return <Text>{label}</Text>

  return <Text inverse>{label}</Text>
}

export const ConfirmPrompt = ({
  crowConfigPath,
  confirmation,
}: ConfirmPromptProps) => {
  return (
    <Box paddingX={1}>
      <Text>
        Write config to {crowConfigPath}?{' '}
        <Choice label="Yes" active={confirmation} />{' '}
        <Choice label="No" active={!confirmation} />
      </Text>
    </Box>
  )
}
