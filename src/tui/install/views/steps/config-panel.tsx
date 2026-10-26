/** @jsxImportSource @opentui/react */
import { configViewModel } from './config-view-model.ts'
import { theme } from '../../../theme.ts'
import type { ConfigPanelProps } from '../../types.ts'

const Config = (configPanelProps: ConfigPanelProps) => {
  const { crowConfigPath, before, highlighted, after } =
    configViewModel(configPanelProps)
  return (
    <box flexDirection="column" paddingX={1}>
      <text>Installing repo config in: {crowConfigPath}</text>
      <box
        flexDirection="column"
        alignSelf="flex-start"
        backgroundColor={theme.configPanel.background}
        paddingX={2}
        paddingY={1}
        marginTop={1}
      >
        <text>
          {before}
          <span
            fg={theme.configPanel.highlightTextColor}
            bg={theme.configPanel.highlightBackground}
          >
            {highlighted}
          </span>
          {after}
        </text>
      </box>
    </box>
  )
}

export const ConfigPanel = (configPanelProps: ConfigPanelProps) => {
  if (configPanelProps.step === 'repo') return null

  return <Config {...configPanelProps} />
}
