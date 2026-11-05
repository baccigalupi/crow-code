import {
  decodePasteBytes,
  stripAnsiSequences,
  type PasteEvent,
} from '@opentui/core'
import { Keypress } from '../../keypress.ts'

// A paste is typed input that arrives all at once, with newlines dropped.
export const keypressFromPaste = (event: PasteEvent) => {
  const text = stripAnsiSequences(decodePasteBytes(event.bytes))
  return new Keypress(text.replace(/[\r\n]/g, ''), {})
}
