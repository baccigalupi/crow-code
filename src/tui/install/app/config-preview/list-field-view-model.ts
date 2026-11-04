import { JsonFieldViewModel } from './json-field-view-model.ts'
import { StringFieldViewModel } from './string-field-view-model.ts'

// A config key holding a list of strings, its items highlighted with it.
export class ListFieldViewModel extends JsonFieldViewModel<readonly string[]> {
  items() {
    return this.value.map((item, index) => this.item(item, index))
  }

  private item(value: string, index: number) {
    const { highlighted, json } = this
    const last = index === this.value.length - 1
    const name = String(index)
    return new StringFieldViewModel({ name, value, highlighted, json, last })
  }
}
