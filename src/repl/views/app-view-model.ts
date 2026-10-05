import type { AppViewModelArguments } from '../types.ts'

const headerRows = 3

export const appViewModel = ({ stdout, state }: AppViewModelArguments) => {
  const columnWidth = stdout.columns || 80
  const rowHeight = stdout.rows || 24
  return {
    columnWidth,
    rowHeight,
    chatRowHeight: rowHeight - headerRows - state.inputRows,
    history: state.history,
    buffer: state.buffer,
    inputRows: state.inputRows,
  }
}
