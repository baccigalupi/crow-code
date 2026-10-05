import { column } from '@ismail-elkorchi/terminal-ui'
import type { Element } from '@ismail-elkorchi/terminal-ui/components'
import type { ReplMessage, ReplState } from './types.ts'
import { chatElement } from './components/chat.ts'
import { headerElements } from './components/header.ts'
import { inputElement } from './components/input.ts'

export const replView = (state: ReplState): Element<ReplMessage> =>
  column([...headerElements(), chatElement(state), inputElement(state)], {
    id: 'repl',
    sizes: [
      { kind: 'fixed', cells: 1 },
      { kind: 'fixed', cells: 1 },
      { kind: 'fixed', cells: 1 },
      { kind: 'fill' },
      { kind: 'fixed', cells: state.inputRows },
    ],
  })
