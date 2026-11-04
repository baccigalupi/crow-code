import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { SetupTaskStatus } from '../types.ts'
import { theme } from '../../theme.ts'
import { useSignalValue } from '../../use-signal-value.ts'

const colors = theme.setupProgress

// A failed task, its error dimmed on the line beneath.
const FailedRow = ({ task }: { task: SetupTaskStatus }) => (
  <box flexDirection="column">
    <text>
      <span fg={colors.failedColor}>✗</span>
      {` ${task.label}`}
    </text>
    <box paddingLeft={2}>
      <text attributes={TextAttributes.DIM}>{task.error}</text>
    </box>
  </box>
)

const DoneRow = ({ task }: { task: SetupTaskStatus }) => (
  <text>
    <span fg={colors.completeColor}>✓</span>
    <span attributes={TextAttributes.DIM}>{` ${task.label}`}</span>
  </text>
)

const Row = ({ task, active }: { task: SetupTaskStatus; active: boolean }) => {
  if (task.error) return <FailedRow task={task} />
  if (task.done) return <DoneRow task={task} />
  return <text>{`${active ? '›' : ' '} ${task.label}`}</text>
}

type ProgressRowsProps = { tasks: readonly SetupTaskStatus[] }

type SetupProgressProps = { model: DataStore }

// The setup tasks as rows. The first unfinished task is running, unless one
// has already failed.
export const ProgressRows = ({ tasks }: ProgressRowsProps) => {
  const failed = tasks.some((task) => task.error)
  const active = failed ? -1 : tasks.findIndex((task) => !task.done)
  return (
    <box flexDirection="column" paddingX={1}>
      {tasks.map((task, index) => (
        <Row key={task.id} task={task} active={index === active} />
      ))}
    </box>
  )
}

export const SetupProgress = ({ model }: SetupProgressProps) => (
  <ProgressRows tasks={useSignalValue(model.progress.tasks)} />
)
