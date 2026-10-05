import { defineTui } from '@ismail-elkorchi/terminal-ui'
import type { TuiInputBinding } from '@ismail-elkorchi/terminal-ui/tui'
import { initialReplState } from './state.ts'
import { updateRepl } from './state/transitions/update.ts'
import { replView } from './view.ts'
import type { ReplApp, ReplMessage, ReplState } from './types.ts'

const inputBindings: readonly TuiInputBinding<ReplState, ReplMessage>[] = [
  {
    id: 'repl.submit',
    label: 'Submit',
    triggers: [{ kind: 'key', key: 'enter' }],
    phase: 'beforeFocus',
    message: { kind: 'submit' },
  },
  {
    id: 'repl.newline.shift-enter',
    label: 'Newline',
    triggers: [{ kind: 'key', key: 'enter', modifiers: { shift: true } }],
    phase: 'beforeFocus',
    message: { kind: 'insertNewline' },
  },
  {
    id: 'repl.newline.ctrl-j',
    label: 'Newline',
    triggers: [{ kind: 'key', key: 'j', modifiers: { ctrl: true } }],
    phase: 'beforeFocus',
    message: { kind: 'insertNewline' },
  },
  {
    id: 'repl.quit',
    label: 'Quit',
    triggers: [{ kind: 'key', key: 'c', modifiers: { ctrl: true } }],
    phase: 'beforeFocus',
    message: { kind: 'quit' },
  },
]

export const createReplApp = (): ReplApp =>
  defineTui<ReplState, ReplMessage>({
    id: 'crow-repl',
    init: () => ({
      state: initialReplState(),
      focus: { kind: 'element', elementId: 'input' },
    }),
    update: updateRepl,
    view: replView,
    inputBindings,
    resizeMessage: () => ({ kind: 'resize' }),
  })
