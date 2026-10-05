import { textArea } from '@ismail-elkorchi/terminal-ui'
import type { Element } from '@ismail-elkorchi/terminal-ui/components'
import type { TextAreaTransition } from '@ismail-elkorchi/terminal-ui/behavior'
import type { ReplMessage, ReplState } from '../types.ts'

export const inputElement = (state: ReplState): Element<ReplMessage> =>
  textArea<ReplMessage>({
    id: 'input',
    state: state.input,
    placeholder: 'type a message',
    wrap: { mode: 'soft' },
    meta: { accessibleName: 'message input' },
    onTransition: (transition: TextAreaTransition) => ({
      kind: 'inputTransition' as const,
      transition,
    }),
  })
