/** @jsxImportSource @opentui/react */
import { useTerminalDimensions } from '@opentui/react'
import { installStore as sharedInstallStore } from '../interactions/state/config-text.ts'
import { useInstallState } from '../interactions/hooks/use-install-state.ts'
import { configPathViewModel } from './config-path-view-model.ts'
import { useKeypress } from '../interactions/hooks/use-keypress.ts'
import { ConfigPanel } from './steps/config-panel.tsx'
import { StepPrompts } from './step-prompts.tsx'
import { Header } from './header.tsx'
import type { InstallAppProps } from '../types.ts'

export const InstallApp = ({
  installStore = sharedInstallStore,
}: InstallAppProps) => {
  const { width, height } = useTerminalDimensions()
  const installState = useInstallState(installStore)
  const { crowConfigPath } = configPathViewModel(installState)
  useKeypress(installStore)

  return (
    <box flexDirection="column" width={width} height={height}>
      <Header />
      <ConfigPanel {...installState} />
      <StepPrompts
        installStore={installStore}
        values={{ ...installState, crowConfigPath }}
      />
    </box>
  )
}
