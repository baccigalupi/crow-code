import { crayon } from 'crayon'
import { Computed, type Signal } from '@ubernaut/exotui/app'
import { LogViewer } from '@ubernaut/exotui'
import type { App } from '../types.ts'

export const logViewer = (app: App, lines: Signal<string[]>) =>
  new LogViewer({
    parent: app.tui,
    theme: { base: crayon.white },
    zIndex: 1,
    lines,
    rectangle: new Computed(() => ({
      column: 0,
      row: 1,
      width: app.tui.rectangle.value.width,
      height: app.tui.rectangle.value.height - 2,
    })),
  })
