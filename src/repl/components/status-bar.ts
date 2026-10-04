import { crayon } from 'crayon'
import { Computed, StatusBar } from '@ubernaut/exotui/app'
import type { App } from '../types.ts'

export const statusBar = (app: App) =>
  new StatusBar({
    parent: app.tui,
    theme: { base: crayon.bgBlue.white },
    zIndex: 1,
    left: 'crow repl',
    right: 'ctrl-c quit',
    rectangle: new Computed(() => ({
      column: 0,
      row: 0,
      width: app.tui.rectangle.value.width,
      height: 1,
    })),
  })
