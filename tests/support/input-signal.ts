import { signal } from '@preact/signals-core'
import { emptyBuffer, insertText } from '../../src/tui/input-buffer.ts'

export const inputSignal = (text: string) => {
  return signal(insertText(emptyBuffer(), text))
}
