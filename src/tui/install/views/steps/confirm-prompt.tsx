import { Box, Text } from 'ink'
import { configViewModel } from './config-view-model.ts'
import type { InputBuffer } from '../../../types.ts'
import type { InstallStep } from '../../types.ts'

type ConfirmPromptProps = {
  readonly step: InstallStep
  readonly repoDirectory: InputBuffer
  readonly globalDirectory: InputBuffer
  readonly envFile: InputBuffer
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
  { step, repoDirectory, globalDirectory, envFile, confirmation }:
    ConfirmPromptProps,
) => {
  if (step !== 'confirm') return null

  const { crowConfigPath } = configViewModel({
    step,
    repoDirectory,
    globalDirectory,
    envFile,
  })
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
