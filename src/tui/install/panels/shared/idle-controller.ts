import type { Keypress } from '../../../keypress.ts'
import type { Outcome } from '../../../types.ts'
import type { InstallStep } from '../../types.ts'

// A panel with nothing to type: every key means the same thing.
export class IdleController {
  private outcome: Outcome<InstallStep>

  constructor(outcome: Outcome<InstallStep>) {
    this.outcome = outcome
  }

  handle(_keypress: Keypress): Outcome<InstallStep> {
    return this.outcome
  }
}
