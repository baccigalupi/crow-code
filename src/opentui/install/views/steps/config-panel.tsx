/** @jsxImportSource @opentui/react */
import { TextAttributes } from '@opentui/core'
import { configViewModel } from './config-view-model.ts'
import { configPanel } from '../../../themes/config-panel.ts'
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
        backgroundColor={configPanel.background}
        paddingX={2}
        paddingY={1}
        marginTop={1}
      >
        <text>
          {before}
          <span attributes={TextAttributes.INVERSE}>{highlighted}</span>
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
