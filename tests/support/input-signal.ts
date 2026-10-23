import { signal } from '@preact/signals-core'
import { emptyText, insertText } from '../../src/tui/input-text.ts'

export const inputSignal = (text: string) => {
  return signal(insertText(emptyText(), text))
}
