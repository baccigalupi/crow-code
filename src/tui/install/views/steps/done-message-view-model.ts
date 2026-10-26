import type { SetupProgressProps } from '../../types.ts'

export const doneMessageViewModel = ({ setupTasks }: SetupProgressProps) => {
  if (setupTasks.some((task) => task.error)) {
    return { exitMessage: 'Setup failed. Press any key to exit' }
  } else {
    return { exitMessage: 'Done! Press any key to exit' }
  }
}
