import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import { useSignalValue } from '../../use-signal-value.ts'
import { ProgressRows } from './setup-progress.tsx'

type DoneMessageProps = { model: DataStore }

// The finished setup tasks, then a dimmed hint that says how it ended.
export const DoneMessage = ({ model }: DoneMessageProps) => {
  const tasks = useSignalValue(model.progress.tasks)
  const failed = tasks.some((task) => task.error)
  return (
    <box flexDirection="column">
      <ProgressRows tasks={tasks} />
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>
          {failed
            ? 'Setup failed. Press any key to exit'
            : 'Done! Press any key to exit'}
        </text>
      </box>
    </box>
  )
}
