/** @jsxImportSource @opentui/react */
import { TextAttributes } from '@opentui/core'
import type { StepValues } from '../../types.ts'
import { SetupProgress } from './setup-progress.tsx'

type DoneMessageProps = Pick<StepValues, 'setupTasks'>

export const DoneMessage = ({ setupTasks }: DoneMessageProps) => {
  return (
    <box flexDirection="column">
      <SetupProgress setupTasks={setupTasks} />
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>Done! Press any key to exit</text>
      </box>
    </box>
  )
}
