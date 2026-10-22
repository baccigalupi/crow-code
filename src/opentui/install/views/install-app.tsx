/** @jsxImportSource @opentui/react */
import { useTerminalDimensions } from '@opentui/react'
import { installStore as sharedInstallStore } from '../../../tui/install/interactions/state/config-buffer.ts'
import { useInstallState } from '../../../tui/install/interactions/hooks/use-install-state.ts'
import { configPathViewModel } from '../../../tui/install/views/config-path-view-model.ts'
import { useKeypress } from '../interactions/hooks/use-keypress.ts'
import { stepViews } from './step-views.ts'
import { StepPrompts } from './step-prompts.tsx'
import { Header } from './header.tsx'
import type { InstallAppProps } from '../types.ts'

export const InstallApp = ({
  installStore = sharedInstallStore,
  views = stepViews,
}: InstallAppProps) => {
  const { width, height } = useTerminalDimensions()
  const installState = useInstallState(installStore)
  const { crowConfigPath } = configPathViewModel(installState)
  useKeypress(installStore)

  return (
    <box flexDirection="column" width={width} height={height}>
      <Header />
      <StepPrompts
        installStore={installStore}
        values={{ ...installState, crowConfigPath }}
        views={views}
      />
    </box>
  )
}
