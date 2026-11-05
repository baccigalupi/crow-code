import { useTerminalDimensions } from '@opentui/react'
import type { DataStore } from './data-store.ts'
import { ConfigPreview } from './config-preview/config-preview.tsx'
import { CurrentPrompt } from './layout/current-prompt.tsx'
import { Header } from './layout/header.tsx'

type LayoutProps = {
  store: DataStore
}

// The whole install screen, filling the terminal: header, config preview,
// then the current step's prompt on the bottom rows.
export const Layout = ({ store }: LayoutProps) => {
  const { width, height } = useTerminalDimensions()
  return (
    <box flexDirection="column" width={width} height={height}>
      <Header />
      <ConfigPreview store={store} />
      <CurrentPrompt store={store} />
    </box>
  )
}
