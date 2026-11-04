import { useTerminalDimensions } from '@opentui/react'
import type { DataStore } from './data-store.ts'
import type { Panels } from './panels.ts'
import { ConfigPreview } from './components/config-preview.tsx'
import { CurrentPrompt } from './components/current-prompt.tsx'
import { Header } from './components/header.tsx'

type InstallAppProps = {
  model: DataStore
  panels: Panels
}

// The whole install screen, filling the terminal: header, config preview,
// then the current panel's prompt on the bottom rows.
export const InstallApp = ({ model, panels }: InstallAppProps) => {
  const { width, height } = useTerminalDimensions()
  return (
    <box flexDirection="column" width={width} height={height}>
      <Header />
      <ConfigPreview model={model} panels={panels} />
      <CurrentPrompt model={model} panels={panels} />
    </box>
  )
}
