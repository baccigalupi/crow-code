import type { Keypress } from '../../keypress.ts'
import type { Outcome } from '../../types.ts'
import type { PanelName } from '../types.ts'

// A panel with nothing to type: every key means the same thing.
export class IdleController {
  private outcome: Outcome<PanelName>

  constructor(outcome: Outcome<PanelName>) {
    this.outcome = outcome
  }

  handle(_keypress: Keypress): Outcome<PanelName> {
    return this.outcome
  }
}
