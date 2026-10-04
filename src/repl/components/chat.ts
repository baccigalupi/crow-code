import { crayon } from 'crayon'
import { LogViewer } from '@ubernaut/exotui'
import { Computed, type Signal } from '@ubernaut/exotui/app'
import { ChatSelection } from './copy-paste/chat-selection.ts'
import type { App } from '../types.ts'
import { inputHeight } from './user-input.ts'
import { headerHeight } from './header.ts'

const options = (app: App, lines: Signal<string[]>) => ({
  parent: app.tui,
  theme: { base: crayon.white },
  zIndex: 1,
  lines,
  rectangle: new Computed(() => ({
    column: 0,
    row: headerHeight,
    width: app.tui.rectangle.value.width,
    height: app.tui.rectangle.value.height - headerHeight - inputHeight,
  })),
})

export const chat = (app: App, lines: Signal<string[]>) => {
  const view = new LogViewer(options(app, lines))
  view.on('destroy', new ChatSelection(app, view, lines).register())
  return view
}
