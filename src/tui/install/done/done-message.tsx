import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import { useSignalValue } from '../../use-signal-value.ts'
import { ProgressList } from '../complete-setup/setup-progress.tsx'
import { DoneMessageViewModel } from './done-message-view-model.ts'

type DoneMessageProps = { model: DataStore }

// The finished setup tasks, then a dimmed hint that says how it ended.
export const DoneMessage = ({ model }: DoneMessageProps) => {
  const rows = useSignalValue(model.progress.rows)
  const viewModel = new DoneMessageViewModel(rows)
  return (
    <box flexDirection="column">
      <ProgressList rows={rows} />
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>{viewModel.summary()}</text>
      </box>
    </box>
  )
}
