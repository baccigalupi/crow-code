/** @jsxImportSource @opentui/react */
import { stepPromptsViewModel } from './step-prompts-view-model.ts'
import type { UserInputStore, StepValues } from '../types.ts'

type StepPromptsProps = {
  readonly userInputStore: UserInputStore
  readonly values: StepValues
}

export const StepPrompts = ({ userInputStore, values }: StepPromptsProps) => {
  const { View } = stepPromptsViewModel(userInputStore)

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
