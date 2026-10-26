/** @jsxImportSource @opentui/react */
import { TextAttributes } from '@opentui/core'
import type { SetupProgressProps } from '../../types.ts'
import { doneMessageViewModel } from './done-message-view-model.ts'
import { SetupProgress } from './setup-progress.tsx'

export const DoneMessage = ({ setupTasks }: SetupProgressProps) => {
  const { exitMessage } = doneMessageViewModel({ setupTasks })
  return (
    <box flexDirection="column">
      <SetupProgress setupTasks={setupTasks} />
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>{exitMessage}</text>
      </box>
    </box>
  )
}
