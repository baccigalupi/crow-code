import type { AgentViewModelArguments, ReplState } from '../types.ts'

const headerRows = 3

const stdoutSize = (stdout: NodeJS.WriteStream) => ({
  columnWidth: stdout.columns || 80,
  rowHeight: stdout.rows || 24,
})

const chatRowHeight = (rowHeight: number, state: ReplState) =>
  rowHeight - headerRows - state.inputRows

const agentViewModelFields = (
  columnWidth: number,
  rowHeight: number,
  chatHeight: number,
  state: ReplState,
) => ({ ...state, columnWidth, rowHeight, chatRowHeight: chatHeight })

export const agentViewModel = ({ stdout, state }: AgentViewModelArguments) => {
  const { columnWidth, rowHeight } = stdoutSize(stdout)
  return agentViewModelFields(
    columnWidth,
    rowHeight,
    chatRowHeight(rowHeight, state),
    state,
  )
}
