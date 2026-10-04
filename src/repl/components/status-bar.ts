import { Computed, StatusBar } from '@ubernaut/exotui/app'
import { chromeTheme } from '../themes/chrome-theme.ts'
import type { App } from '../types.ts'

export const statusBarHeight = 3

const rectangle = (app: App, row: number) =>
  new Computed(() => ({
    column: 0,
    row,
    width: app.tui.rectangle.value.width,
    height: 1,
  }))

const blankLine = (app: App, row: number) =>
  new StatusBar({
    parent: app.tui,
    theme: chromeTheme,
    zIndex: 1,
    left: '',
    rectangle: rectangle(app, row),
  })

const content = (app: App) =>
  new StatusBar({
    parent: app.tui,
    theme: chromeTheme,
    zIndex: 1,
    left: ' Crow Code - context is King',
    right: 'ctrl-c quit ',
    rectangle: rectangle(app, 1),
  })

export const statusBar = (app: App) => {
  blankLine(app, 0)
  const component = content(app)
  blankLine(app, 2)
  return component
}
