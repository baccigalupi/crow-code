import { Box, Text } from 'ink'
import type { InstallStep } from '../../types.ts'

type ConfirmPromptProps = {
  readonly step: InstallStep
  readonly crowConfigPath: string
  readonly confirmation: boolean
}

const Choice = ({ label, active }: {
  readonly label: string
  readonly active: boolean
}) => {
  if (!active) return <Text>{label}</Text>

  return <Text inverse>{label}</Text>
}

export const ConfirmPrompt = (
  { step, crowConfigPath, confirmation }: ConfirmPromptProps,
) => {
  if (step !== 'confirm') return null

  return (
    <Box paddingX={1}>
      <Text>
        Write config to {crowConfigPath}?{' '}
        <Choice label='Yes' active={confirmation} />{' '}
        <Choice label='No' active={!confirmation} />
      </Text>
    </Box>
  )
}
