import { Box, Text } from 'ink'
import { configViewModel } from './config-view-model.ts'
import { configPanel } from '../../../themes/config-panel.ts'
import type { ConfigPanelProps } from '../../types.ts'

const Config = (configPanelProps: ConfigPanelProps) => {
  const { crowConfigPath, before, highlighted, after } =
    configViewModel(configPanelProps)
  return (
    <Box flexDirection="column" paddingX={1}>
      <Text>Installing repo config in: {crowConfigPath}</Text>
      <Box
        flexDirection="column"
        alignSelf="flex-start"
        backgroundColor={configPanel.background}
        paddingX={2}
        paddingY={1}
        marginTop={1}
      >
        <Text wrap="wrap">
          {before}
          <Text inverse>{highlighted}</Text>
          {after}
        </Text>
      </Box>
    </Box>
  )
}

export const ConfigPanel = (configPanelProps: ConfigPanelProps) => {
  if (configPanelProps.step === 'repo') return null

  return <Config {...configPanelProps} />
}
