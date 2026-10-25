/** @jsxImportSource @opentui/react */
import type { StepValues } from '../../types.ts'

type SetupProgressProps = Pick<StepValues, 'crowConfigPath'>

export const SetupProgress = ({ crowConfigPath }: SetupProgressProps) => {
  return (
    <box paddingX={1}>
      <text>Writing config to {crowConfigPath}</text>
    </box>
  )
}
