import { Box, Text } from 'ink'
import { configViewModel } from './config-view-model.ts'
import type { InputBuffer } from '../../types.ts'
import type { InstallStep } from '../types.ts'

const Choice = ({ label, active }: {
  readonly label: string
  readonly active: boolean
}) => {
  if (!active) return <Text>{label}</Text>

  return <Text inverse>{label}</Text>
}

export const ConfirmPrompt = ({ step, repo, user, confirmation }: {
  readonly step: InstallStep
  readonly repo: InputBuffer
  readonly user: InputBuffer
  readonly confirmation: boolean
}) => {
  if (step !== 'confirm') return null

  const { filePath } = configViewModel({ repo, user })
  return (
    <Box paddingX={1}>
      <Text>
        Write config to {filePath}? <Choice label='Yes' active={confirmation} />
        {' '}
        <Choice label='No' active={!confirmation} />
      </Text>
    </Box>
  )
}

export const DoneMessage = ({ step, repo, user }: {
  readonly step: InstallStep
  readonly repo: InputBuffer
  readonly user: InputBuffer
}) => {
  if (step !== 'done') return null

  const { filePath } = configViewModel({ repo, user })
  return (
    <Box paddingX={1} flexDirection='column'>
      <Text>Wrote config to {filePath}</Text>
      <Text dimColor>press any key to exit</Text>
    </Box>
  )
}
