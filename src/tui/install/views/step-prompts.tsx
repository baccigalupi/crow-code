import { Box } from 'ink'
import { stepPromptsViewModel } from './step-prompts-view-model.ts'
import type { InstallStore, StepValues } from '../types.ts'

type StepPromptsProps = {
  readonly installStore: InstallStore
  readonly values: StepValues
}

export const StepPrompts = ({ installStore, values }: StepPromptsProps) => {
  const { View } = stepPromptsViewModel(installStore)

  return (
    <Box flexDirection="column" flexGrow={1} justifyContent="flex-end">
      <View {...values} />
    </Box>
  )
}
