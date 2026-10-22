/** @jsxImportSource @opentui/react */
import { stepPromptsViewModel } from './step-prompts-view-model.ts'
import type { InstallStore, StepValues } from '../../../tui/install/types.ts'
import type { StepViews } from '../types.ts'

type StepPromptsProps = {
  readonly installStore: InstallStore
  readonly values: StepValues
  readonly views: StepViews
}

export const StepPrompts = ({
  installStore,
  values,
  views,
}: StepPromptsProps) => {
  const { View } = stepPromptsViewModel(installStore, views)

  return (
    <box flexDirection="column" flexGrow={1} justifyContent="flex-end">
      <View {...values} />
    </box>
  )
}
