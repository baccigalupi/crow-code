import { textAreaReducer } from '@ismail-elkorchi/terminal-ui/behavior'
import type {
  TextAreaState,
  TextAreaTransition,
} from '@ismail-elkorchi/terminal-ui/behavior'
import { createTextAreaRowOffsetMap } from '@ismail-elkorchi/terminal-ui'
import type {
  TextDocument,
  TextEditOperation,
} from '@ismail-elkorchi/terminal-ui/text'
import type { TuiContext, TuiUpdateResult } from '@ismail-elkorchi/terminal-ui'
import type { ReplMessage, ReplState } from '../../types.ts'

const inputRowCap = 8

const measureInputRows = (
  document: TextDocument,
  columns: number,
): number => {
  const rows = createTextAreaRowOffsetMap({
    document,
    terminalWidth: columns,
    terminalRows: inputRowCap,
    wrap: { mode: 'soft' },
  }).rowCount
  return Math.max(1, Math.min(inputRowCap, rows))
}

export const newlineTransition: TextAreaTransition = {
  kind: 'edit',
  operation: { kind: 'insert', text: '\n' },
}

export const applyInputTransition = (
  state: ReplState,
  transition: TextAreaTransition,
  context: TuiContext,
): TuiUpdateResult<ReplState, ReplMessage> => ({
  state: withInput(
    state,
    textAreaReducer(state.input, normalizeInsertText(transition)).state,
    context,
  ),
})

export const resizeInput = (
  state: ReplState,
  context: TuiContext,
): TuiUpdateResult<ReplState, ReplMessage> => ({
  state: withInput(state, state.input, context),
})

const withInput = (
  state: ReplState,
  input: TextAreaState,
  context: TuiContext,
): ReplState => ({
  ...state,
  input,
  inputRows: measureInputRows(input.document, context.terminalSize.columns),
})

const normalizeInsertText = (
  transition: TextAreaTransition,
): TextAreaTransition => {
  if (
    transition.kind !== 'edit' || !isTextOperation(transition.operation)
  ) {
    return transition
  }
  return { kind: 'edit', operation: normalizeText(transition.operation) }
}

const normalizeText = (
  operation: Extract<TextEditOperation, { readonly text: string }>,
): TextEditOperation => ({
  ...operation,
  text: operation.text.replace(/\r\n?/g, '\n'),
})

const isTextOperation = (
  operation: TextEditOperation,
): operation is Extract<TextEditOperation, { readonly text: string }> =>
  operation.kind === 'insert' || operation.kind === 'replaceRange' ||
  operation.kind === 'replaceSelection'
