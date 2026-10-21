import { Box, useStdout } from 'ink'
import { installStore as sharedInstallStore } from '../interactions/state/config-buffer.ts'
import { installAppViewModel } from './install-app-view-model.ts'
import { useKeypress } from '../interactions/hooks/use-keypress.ts'
import { useInstallState } from '../interactions/hooks/use-install-state.ts'
import { ConfigPanel } from './steps/config-panel.tsx'
import { StepPrompts } from './step-prompts.tsx'
import { Header } from './header.tsx'
import { configPathViewModel } from './config-path-view-model.ts'
import type { InstallAppProps } from '../types.ts'

export const InstallApp = ({
  installStore = sharedInstallStore,
}: InstallAppProps) => {
  const { stdout } = useStdout()
  const installState = useInstallState(installStore)
  const { rowHeight, columnWidth } = installAppViewModel({ stdout })
  const { crowConfigPath } = configPathViewModel(installState)
  useKeypress(installStore)

  return (
    <Box flexDirection="column" height={rowHeight} width={columnWidth}>
      <Header />
      <ConfigPanel {...installState} />
      <StepPrompts
        installStore={installStore}
        values={{ ...installState, crowConfigPath }}
      />
    </Box>
  )
}
