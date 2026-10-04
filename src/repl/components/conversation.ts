import { crayon } from 'crayon'
import { Computed, type Signal } from '@ubernaut/exotui/app'
import { LogViewer } from '@ubernaut/exotui'
import type { App } from '../types.ts'
import { inputHeight } from './input.ts'
import { statusBarHeight } from './status-bar.ts'

export const conversation = (app: App, lines: Signal<string[]>) =>
  new LogViewer({
    parent: app.tui,
    theme: { base: crayon.white },
    zIndex: 1,
    lines,
    rectangle: new Computed(() => ({
      column: 0,
      row: statusBarHeight,
      width: app.tui.rectangle.value.width,
      height: app.tui.rectangle.value.height - statusBarHeight - inputHeight,
    })),
  })
