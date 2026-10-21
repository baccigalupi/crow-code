import { Box } from 'ink'
import { stepPromptsViewModel } from './step-prompts-view-model.ts'
import type { InstallState, StepValues } from '../types.ts'

type StepPromptsProps = {
  readonly installState: InstallState
  readonly values: StepValues
}

export const StepPrompts = ({ installState, values }: StepPromptsProps) => {
  const { View } = stepPromptsViewModel(installState)

  return (
    <Box flexDirection='column' flexGrow={1} justifyContent='flex-end'>
      <View {...values} />
    </Box>
  )
}
