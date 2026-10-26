import type {
  SetupProgressProps,
  SetupProgressRow,
  SetupTaskStatus,
} from '../../types.ts'

const indicator = (task: SetupTaskStatus, isActive: boolean) => {
  if (task.done) {
    return '✓'
  } else if (isActive) {
    return '›'
  } else {
    return ' '
  }
}

export const setupProgressViewModel = ({
  setupTasks,
}: SetupProgressProps): SetupProgressRow[] => {
  const active = setupTasks.findIndex((task) => !task.done)
  return setupTasks.map((task, index) => ({
    id: task.id,
    label: task.label,
    indicator: indicator(task, index === active),
    done: task.done,
  }))
}
