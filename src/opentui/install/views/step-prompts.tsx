/** @jsxImportSource @opentui/react */
import { stepPromptsViewModel } from './step-prompts-view-model.ts'
import type { InstallStore, StepValues } from '../types.ts'

type StepPromptsProps = {
  readonly installStore: InstallStore
  readonly values: StepValues
}

export const StepPrompts = ({ installStore, values }: StepPromptsProps) => {
  const { View } = stepPromptsViewModel(installStore)

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      flexShrink={0}
      justifyContent="flex-end"
    >
      <View {...values} />
    </box>
  )
}
