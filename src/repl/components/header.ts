import { statusBar } from '@ismail-elkorchi/terminal-ui'
import type { TerminalStyle } from '@ismail-elkorchi/terminal-ui'
import type { Element } from '@ismail-elkorchi/terminal-ui/components'
import type { ReplMessage } from '../types.ts'

export const chromeStyle: TerminalStyle = {
  fg: { kind: 'rgb', r: 230, g: 202, b: 108 },
  bg: { kind: 'rgb', r: 11, g: 61, b: 46 },
}

const chromeStyles = {
  root: chromeStyle,
  parts: {
    marker: chromeStyle,
    leading: chromeStyle,
    value: chromeStyle,
    trailing: chromeStyle,
  },
}

const blankBar = (id: string): Element<ReplMessage> =>
  statusBar({ id, styles: chromeStyles })

export const headerElements = (): readonly Element<ReplMessage>[] => [
  blankBar('header-top'),
  statusBar({
    id: 'header-title',
    leading: [
      { id: 'title', kind: 'text', text: ' Crow Code - context is King' },
    ],
    trailing: [{ id: 'hint', kind: 'text', text: 'ctrl-c quit ' }],
    styles: chromeStyles,
  }),
  blankBar('header-bottom'),
]
