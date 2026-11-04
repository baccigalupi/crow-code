import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { SetupTaskRow } from '../types.ts'
import { theme } from '../../theme.ts'
import { useSignalValue } from '../../use-signal-value.ts'

const colors = theme.setupProgress

// A failed task, its error dimmed on the line beneath.
const FailedRow = ({ task }: { task: SetupTaskRow }) => (
  <box flexDirection="column">
    <text>
      <span fg={colors.failedColor}>✗</span> {task.label}
    </text>
    <box paddingLeft={2}>
      <text attributes={TextAttributes.DIM}>{task.error}</text>
    </box>
  </box>
)

const DoneRow = ({ task }: { task: SetupTaskRow }) => (
  <text>
    <span fg={colors.completeColor}>✓</span>
    <span attributes={TextAttributes.DIM}> {task.label}</span>
  </text>
)

const RunningRow = ({ task }: { task: SetupTaskRow }) => (
  <text>› {task.label}</text>
)

const WaitingRow = ({ task }: { task: SetupTaskRow }) => (
  <text>
    {'  '}
    {task.label}
  </text>
)

const rowViews = {
  failed: FailedRow,
  done: DoneRow,
  running: RunningRow,
  waiting: WaitingRow,
}

const Row = ({ task }: { task: SetupTaskRow }) => {
  const View = rowViews[task.state]
  return <View task={task} />
}

type ProgressRowsProps = { rows: readonly SetupTaskRow[] }

type SetupProgressProps = { model: DataStore }

const ProgressRows = ({ rows }: ProgressRowsProps) => (
  <>
    {rows.map((task) => (
      <Row key={task.id} task={task} />
    ))}
  </>
)

// The setup tasks as rows, each drawn in the state the store gives it.
export const ProgressList = ({ rows }: ProgressRowsProps) => (
  <box flexDirection="column" paddingX={1}>
    <ProgressRows rows={rows} />
  </box>
)

export const SetupProgress = ({ model }: SetupProgressProps) => {
  const rows = useSignalValue(model.progress.rows)
  return <ProgressList rows={rows} />
}
