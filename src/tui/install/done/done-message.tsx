import { TextAttributes } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import { useSignalValue } from '../interactions/use-signal-value.ts'
import { ProgressList } from '../complete-setup/setup-progress.tsx'
import { DoneActions } from '../interactions/handlers/done-actions.ts'
import { doneMessageViewModel } from './done-message-view-model.ts'

type DoneMessageProps = { store: DataStore }

// The finished setup tasks, then a dimmed hint that says how it ended. It
// holds focus, and any key quits.
export const DoneMessage = ({ store }: DoneMessageProps) => {
  const rows = useSignalValue(store.progress.rows)
  const viewModel = doneMessageViewModel(rows)
  const actions = new DoneActions(store)
  return (
    <box flexDirection="column" focusable focused onKeyDown={actions.keyDown()}>
      <ProgressList rows={rows} />
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>{viewModel.summary()}</text>
      </box>
    </box>
  )
}
