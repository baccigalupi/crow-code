/** @jsxImportSource @opentui/react */
import { stepPromptsViewModel } from './step-prompts-view-model.ts'
import type { DataStore } from '../data-store.ts'
import type { StepValues } from '../types.ts'

type StepPromptsProps = {
  readonly model: DataStore
  readonly values: StepValues
}

export const StepPrompts = ({ model, values }: StepPromptsProps) => {
  const { View } = stepPromptsViewModel(model)

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
