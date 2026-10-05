import {
  appendLogHistory,
  createTextAreaState,
} from '@ismail-elkorchi/terminal-ui/behavior'
import type { ScrollState } from '@ismail-elkorchi/terminal-ui/behavior'
import { textDocumentText } from '@ismail-elkorchi/terminal-ui/text'
import type { TuiContext, TuiUpdateResult } from '@ismail-elkorchi/terminal-ui'
import { applyChatTransition } from './update-chat.ts'
import {
  applyInputTransition,
  newlineTransition,
  resizeInput,
} from './update-input.ts'
import type { ReplMessage, ReplState } from './types.ts'

type ReplResult = TuiUpdateResult<ReplState, ReplMessage>

export const updateRepl = (
  state: ReplState,
  message: ReplMessage,
  context: TuiContext,
): ReplResult => {
  if (message.kind === 'inputTransition') {
    return applyInputTransition(state, message.transition, context)
  } else if (message.kind === 'chatTransition') {
    return applyChatTransition(state, message.transition)
  } else return updateCommand(state, message, context)
}

const updateCommand = (
  state: ReplState,
  message: Exclude<
    ReplMessage,
    { readonly kind: 'inputTransition' | 'chatTransition' }
  >,
  context: TuiContext,
): ReplResult => {
  if (message.kind === 'submit') return submitInput(state)
  else if (message.kind === 'insertNewline') {
    return applyInputTransition(state, newlineTransition, context)
  } else if (message.kind === 'resize') return resizeInput(state, context)
  else return { state, exit: {} }
}

const submitInput = (state: ReplState): ReplResult => ({
  state: submittedState(state, textDocumentText(state.input.document)),
})

const submittedState = (state: ReplState, text: string): ReplState => ({
  input: createTextAreaState({ value: '' }),
  inputRows: 1,
  history: appendLogHistory(state.history, [{
    id: `entry-${state.history.entryCount}`,
    text,
  }]),
  chat: {
    ...state.chat,
    followTail: true,
    scroll: tailScroll(state.chat.scroll),
  },
})

const tailScroll = (scroll: ScrollState): ScrollState => ({
  ...scroll,
  followTail: true,
})
