import type {
  SetupProgressProps,
  SetupProgressRow,
  SetupTaskStatus,
} from '../../types.ts'

const pendingIndicator = (isActive: boolean) => {
  if (isActive) {
    return '›'
  } else {
    return ' '
  }
}

const indicator = (task: SetupTaskStatus, isActive: boolean) => {
  if (task.error) {
    return '✗'
  } else if (task.done) {
    return '✓'
  } else {
    return pendingIndicator(isActive)
  }
}

const activeIndex = (setupTasks: readonly SetupTaskStatus[]) => {
  if (setupTasks.some((task) => task.error)) return -1

  return setupTasks.findIndex((task) => !task.done)
}

export const setupProgressViewModel = ({
  setupTasks,
}: SetupProgressProps): SetupProgressRow[] => {
  const active = activeIndex(setupTasks)
  return setupTasks.map((task, index) => ({
    ...task,
    indicator: indicator(task, index === active),
  }))
}
