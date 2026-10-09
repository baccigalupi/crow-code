import { Box, Text } from 'ink'
import { configViewModel } from './config-view-model.ts'
import type { InputBuffer } from '../../types.ts'
import type { InstallStep } from '../types.ts'

const Config = ({ user, repo }: {
  readonly user: InputBuffer
  readonly repo: InputBuffer
}) => {
  const { filePath, json } = configViewModel({ user, repo })
  return (
    <Box flexDirection='column' paddingX={1}>
      <Text>
        Installing repo config in: {filePath}
      </Text>
      <Box
        flexDirection='column'
        alignSelf='flex-start'
        backgroundColor='#0a0f1e'
        paddingX={2}
        paddingY={1}
        marginTop={1}
      >
        <Text wrap='wrap'>{json}</Text>
      </Box>
    </Box>
  )
}

export const ConfigPanel = ({ step, user, repo }: {
  readonly step: InstallStep
  readonly user: InputBuffer
  readonly repo: InputBuffer
}) => {
  if (step !== 'user') return null

  return <Config user={user} repo={repo} />
}
