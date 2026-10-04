import { Computed, Input, type Signal } from '@ubernaut/exotui/app'
import { inputTheme } from '../themes/input-theme.ts'
import type { App } from '../types.ts'

export const inputHeight = 1

export const userInput = (
  app: App,
  lines: Signal<string[]>,
  text: Signal<string>,
) => new UserInput(app, lines, text)

export class UserInput {
  readonly component: Input
  private readonly graphemes = new Intl.Segmenter(undefined, {
    granularity: 'grapheme',
  })

  constructor(app: App, lines: Signal<string[]>, text: Signal<string>) {
    this.component = new Input(this.options(app, lines, text))
    this.component.on('paste', (event) => this.paste(event.text))
  }

  private readonly options = (
    app: App,
    lines: Signal<string[]>,
    text: Signal<string>,
  ) => ({
    parent: app.tui,
    theme: inputTheme,
    text,
    placeholder: 'type a message',
    onSubmit: (value: string) => {
      lines.value = [...lines.peek(), value]
      text.value = ''
    },
    zIndex: 2,
    rectangle: new Computed(() => ({
      column: 0,
      row: app.tui.rectangle.value.height - inputHeight,
      width: app.tui.rectangle.value.width,
    })),
  })

  private paste(value: string) {
    const flat = value.replace(/\r\n?|\n/g, ' ')
    Array.from(this.graphemes.segment(flat)).forEach(
      ({ segment }) => this.component.controller.insert(segment),
    )
  }
}
