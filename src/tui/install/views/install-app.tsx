/** @jsxImportSource @opentui/react */
import { useTerminalDimensions } from '@opentui/react'
import { userInputStore as sharedUserInputStore } from '../interactions/state/config-text.ts'
import { useUserInputState } from '../interactions/hooks/use-user-input-state.ts'
import {
  noTaskStates,
  useSetupTasks,
} from '../interactions/hooks/use-setup-tasks.ts'
import { configPathViewModel } from './config-path-view-model.ts'
import { useKeypress } from '../interactions/hooks/use-keypress.ts'
import { ConfigPanel } from './steps/config-panel.tsx'
import { StepPrompts } from './step-prompts.tsx'
import { Header } from './header.tsx'
import type { InstallAppProps } from '../types.ts'

export const InstallApp = ({
  userInputStore = sharedUserInputStore,
  taskStates = noTaskStates,
}: InstallAppProps) => {
  const { width, height } = useTerminalDimensions()
  const userInputState = useUserInputState(userInputStore)
  const setupTasks = useSetupTasks(taskStates)
  const { crowConfigPath } = configPathViewModel(userInputState)
  useKeypress(userInputStore)

  return (
    <box flexDirection="column" width={width} height={height}>
      <Header />
      <ConfigPanel {...userInputState} />
      <StepPrompts
        userInputStore={userInputStore}
        values={{ ...userInputState, crowConfigPath, setupTasks }}
      />
    </box>
  )
}
