/** @jsxImportSource @opentui/react */
import { TextAttributes } from '@opentui/core'
import type { StepValues } from '../../types.ts'

type DoneMessageProps = Pick<StepValues, 'crowConfigPath'>

export const DoneMessage = ({ crowConfigPath }: DoneMessageProps) => {
  return (
    <box paddingX={1} flexDirection="column">
      <text>Wrote config to {crowConfigPath}</text>
      <text attributes={TextAttributes.DIM}>press any key to exit</text>
    </box>
  )
}
