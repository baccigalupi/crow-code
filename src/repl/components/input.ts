import { Computed, Input, type Signal } from '@ubernaut/exotui/app'
import { inputTheme } from '../themes/input-theme.ts'
import type { App } from '../types.ts'

const submit =
  (lines: Signal<string[]>, text: Signal<string>) => (value: string) => {
    lines.value = [...lines.peek(), value]
    text.value = ''
  }

export const input = (
  app: App,
  lines: Signal<string[]>,
  text: Signal<string>,
) =>
  new Input({
    parent: app.tui,
    theme: inputTheme,
    text,
    placeholder: 'type a message',
    onSubmit: submit(lines, text),
    zIndex: 2,
    rectangle: new Computed(() => ({
      column: 0,
      row: app.tui.rectangle.value.height - 1,
      width: app.tui.rectangle.value.width,
    })),
  })
