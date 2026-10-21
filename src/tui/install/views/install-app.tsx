import { Box, useStdout } from 'ink'
import { installState as sharedInstallState } from '../interactions/state/config-buffer.ts'
import { installAppViewModel } from './install-app-view-model.ts'
import { useKeypress } from '../interactions/hooks/use-keypress.ts'
import { useInstallValues } from '../interactions/hooks/use-install-values.ts'
import { ConfigPanel } from './steps/config-panel.tsx'
import { StepPrompts } from './step-prompts.tsx'
import { Header } from './header.tsx'
import { configPathViewModel } from './config-path-view-model.ts'
import type { InstallAppProps } from '../types.ts'

export const InstallApp = (
  { installState = sharedInstallState }: InstallAppProps,
) => {
  const { stdout } = useStdout()
  const values = useInstallValues(installState)
  const { rowHeight, columnWidth } = installAppViewModel({ stdout })
  const { crowConfigPath } = configPathViewModel(values)
  useKeypress(installState)

  return (
    <Box flexDirection='column' height={rowHeight} width={columnWidth}>
      <Header />
      <ConfigPanel {...values} />
      <StepPrompts
        installState={installState}
        values={{ ...values, crowConfigPath }}
      />
    </Box>
  )
}
