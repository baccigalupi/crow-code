import type { JsonFieldArguments } from '../../types.ts'
import { theme } from '../../../theme.ts'

// One key of the config json: its trailing comma, and the colors and scroll
// id it takes when it is the line the current panel edits.
export class JsonFieldViewModel<Value> {
  readonly name: string
  protected value: Value
  protected highlighted: boolean
  protected json: string
  private last: boolean
  private readonly highlightId = 'config-highlight'

  constructor({
    name,
    value,
    highlighted,
    json,
    last,
  }: JsonFieldArguments<Value>) {
    this.name = name
    this.value = value
    this.highlighted = highlighted
    this.json = json
    this.last = last
  }

  comma() {
    if (this.last) return ''

    return ','
  }

  // A new json remounts the highlighted field, so it scrolls into view again.
  key() {
    if (this.highlighted) return this.json

    return this.name
  }

  id() {
    if (this.highlighted) return this.highlightId

    return `config-${this.name}`
  }

  textColor() {
    if (!this.highlighted) return

    return theme.configPanel.highlightTextColor
  }

  background() {
    if (!this.highlighted) return

    return theme.configPanel.highlightBackground
  }
}
