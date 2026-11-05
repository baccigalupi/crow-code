import { useTerminalDimensions } from '@opentui/react'
import type { DataStore } from './data-store.ts'
import type { Router } from './router.ts'
import { ConfigPreview } from './app/config-preview.tsx'
import { CurrentPrompt } from './app/current-prompt.tsx'
import { Header } from './app/header.tsx'

type InstallAppProps = {
  store: DataStore
  router: Router
}

// The whole install screen, filling the terminal: header, config preview,
// then the current panel's prompt on the bottom rows.
export const InstallApp = ({ store, router }: InstallAppProps) => {
  const { width, height } = useTerminalDimensions()
  return (
    <box flexDirection="column" width={width} height={height}>
      <Header />
      <ConfigPreview store={store} />
      <CurrentPrompt store={store} router={router} />
    </box>
  )
}
