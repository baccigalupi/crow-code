import { Box, Text } from 'ink'
import { configViewModel } from './config-view-model.ts'
import { configPanel } from '../../../themes/config-panel.ts'
import type { BuildCrowConfigArguments, InstallStep } from '../../types.ts'

type ConfigPanelProps = BuildCrowConfigArguments & {
  readonly step: InstallStep
}

const Config = (buildCrowConfigArguments: BuildCrowConfigArguments) => {
  const { crowConfigPath, crowConfigJson } = configViewModel(
    buildCrowConfigArguments,
  )
  return (
    <Box flexDirection='column' paddingX={1}>
      <Text>
        Installing repo config in: {crowConfigPath}
      </Text>
      <Box
        flexDirection='column'
        alignSelf='flex-start'
        backgroundColor={configPanel.background}
        paddingX={2}
        paddingY={1}
        marginTop={1}
      >
        <Text wrap='wrap'>{crowConfigJson}</Text>
      </Box>
    </Box>
  )
}

export const ConfigPanel = (
  { step, globalDirectory, repoDirectory, envFile }: ConfigPanelProps,
) => {
  if (step === 'repo') return null

  return (
    <Config
      globalDirectory={globalDirectory}
      repoDirectory={repoDirectory}
      envFile={envFile}
    />
  )
}
