import type { Keypress } from '../../../keypress.ts'
import type { Outcome } from '../../../types.ts'
import type { PanelName } from '../../types.ts'
import type { ConfirmStore } from '../../data-stores/confirm-store.ts'

// Yes/no: arrows and y/n/j/k choose, return decides.
export class ConfirmController {
  private confirmation: ConfirmStore

  constructor(confirmation: ConfirmStore) {
    this.confirmation = confirmation
  }

  handle(keypress: Keypress): Outcome<PanelName> {
    if (this.choosesYes(keypress)) this.confirmation.choose(true)
    else if (this.choosesNo(keypress)) this.confirmation.choose(false)
    else if (keypress.key.return === true) return this.decide()
    return 'stay'
  }

  private choosesYes({ input, key }: Keypress) {
    if (key.leftArrow === true || key.upArrow === true) return true
    return input === 'y' || input === 'k'
  }

  private choosesNo({ input, key }: Keypress) {
    if (key.rightArrow === true || key.downArrow === true) return true
    return input === 'n' || input === 'j'
  }

  private decide(): Outcome<PanelName> {
    if (this.confirmation.confirmed.peek()) return 'next'
    return 'exit'
  }
}
