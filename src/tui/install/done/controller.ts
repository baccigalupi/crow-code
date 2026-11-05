import type { Keypress } from '../../keypress.ts'
import type { Outcome } from '../../types.ts'
import type { PanelName } from '../types.ts'

// The done screen: any key exits.
export class DoneController {
  handle(_keypress: Keypress): Outcome<PanelName> {
    return 'exit'
  }
}
