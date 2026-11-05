import type { FieldArguments } from '../../types.ts'
import { theme } from '../../../theme.ts'

// The colors and scroll id one config key takes when it is the key the
// current panel edits.
export class FieldViewModel {
  private name: string
  private editable: boolean
  private highlightKey: string
  private readonly highlightId = 'config-highlight'

  constructor({ name, editable, highlightKey }: FieldArguments) {
    this.name = name
    this.editable = editable
    this.highlightKey = highlightKey
  }

  id() {
    if (this.highlighted()) return this.highlightId

    return `config-${this.name}`
  }

  textColor() {
    if (!this.highlighted()) return

    return theme.configPanel.highlightTextColor
  }

  background() {
    if (!this.highlighted()) return

    return theme.configPanel.highlightBackground
  }

  private highlighted() {
    return this.editable && this.highlightKey === this.name
  }
}
