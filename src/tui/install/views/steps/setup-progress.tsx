/** @jsxImportSource @opentui/react */
import { TextAttributes } from '@opentui/core'
import { theme } from '../../../theme.ts'
import type { SetupProgressProps, SetupProgressRow } from '../../types.ts'
import { setupProgressViewModel } from './setup-progress-view-model.ts'

const DoneRow = ({ row }: { readonly row: SetupProgressRow }) => {
  if (!row.done || row.error) return null

  return (
    <text>
      <span fg={theme.setupProgress.completeColor}>{row.indicator}</span>
      <span attributes={TextAttributes.DIM}> {row.label}</span>
    </text>
  )
}

const FailedRow = ({ row }: { readonly row: SetupProgressRow }) => {
  if (!row.error) return null

  return (
    <>
      <text>
        <span fg={theme.setupProgress.failedColor}>{row.indicator}</span>
        <span> {row.label}</span>
      </text>
      <box paddingLeft={2}>
        <text attributes={TextAttributes.DIM}>{row.error}</text>
      </box>
    </>
  )
}

const PendingRow = ({ row }: { readonly row: SetupProgressRow }) => {
  if (row.done) return null

  return (
    <text>
      {row.indicator} {row.label}
    </text>
  )
}

const Row = ({ row }: { readonly row: SetupProgressRow }) => (
  <>
    <DoneRow row={row} />
    <FailedRow row={row} />
    <PendingRow row={row} />
  </>
)

const Rows = ({ rows }: { readonly rows: readonly SetupProgressRow[] }) =>
  rows.map((row) => <Row key={row.id} row={row} />)

export const SetupProgress = (props: SetupProgressProps) => {
  const rows = setupProgressViewModel(props)
  return (
    <box flexDirection="column" paddingX={1}>
      <Rows rows={rows} />
    </box>
  )
}
