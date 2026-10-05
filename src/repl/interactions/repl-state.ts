import {
  deleteBackward,
  deleteForward,
  emptyBuffer,
  insertText,
  measureRows,
  moveCursor,
} from './input-buffer.ts'
import type { InputBuffer, ReplAction, ReplState } from '../types.ts'

export const initialReplState = (): ReplState => ({
  buffer: emptyBuffer(),
  inputRows: 1,
  history: [],
})

const withBuffer = (
  state: ReplState,
  buffer: InputBuffer,
  columns: number,
): ReplState => ({
  ...state,
  buffer,
  inputRows: measureRows(buffer.text, columns),
})

const submit = (state: ReplState): ReplState => ({
  buffer: emptyBuffer(),
  inputRows: 1,
  history: [
    ...state.history,
    { id: `entry-${state.history.length}`, text: state.buffer.text },
  ],
})

const bufferFor = (state: ReplState, action: ReplAction): InputBuffer => {
  if (action.kind === 'insert') return insertText(state.buffer, action.text)
  else if (action.kind === 'backspace') return deleteBackward(state.buffer)
  else if (action.kind === 'delete') return deleteForward(state.buffer)
  else if (action.kind === 'newline') return insertText(state.buffer, '\n')
  return state.buffer
}

const updateBuffer = (
  state: ReplState,
  action: ReplAction,
  columns: number,
): ReplState => {
  if (action.kind === 'move') {
    return { ...state, buffer: moveCursor(state.buffer, action.to) }
  }
  return withBuffer(state, bufferFor(state, action), columns)
}

export const updateRepl = (
  state: ReplState,
  action: ReplAction,
  columns: number,
): ReplState => {
  if (action.kind === 'submit') return submit(state)
  else if (action.kind === 'quit') return state
  else if (action.kind === 'resize') {
    return { ...state, inputRows: measureRows(state.buffer.text, columns) }
  }
  return updateBuffer(state, action, columns)
}
