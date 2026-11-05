import type { JsonFieldArguments } from '../../types.ts'
import { theme } from '../../../theme.ts'

// One key of the config json: its trailing comma, and the colors and scroll
// id it takes when it is the key the current panel edits.
export class JsonFieldViewModel<Value> {
  readonly name: string
  protected value: Value
  private last: boolean
  private editable: boolean
  private highlightKey: string
  private readonly highlightId = 'config-highlight'

  constructor({
    name,
    value,
    last,
    editable,
    highlightKey,
  }: JsonFieldArguments<Value>) {
    this.name = name
    this.value = value
    this.last = last
    this.editable = editable
    this.highlightKey = highlightKey
  }

  comma() {
    if (this.last) return ''

    return ','
  }

  // A new value remounts the field, so a highlighted one scrolls into view
  // again.
  key() {
    return JSON.stringify(this.value)
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
