import { JsonFieldViewModel } from './json-field-view-model.ts'

// A config key holding a list of strings.
export class ListFieldViewModel extends JsonFieldViewModel<readonly string[]> {
  items() {
    return this.value.map((value, index) => this.item(value, index))
  }

  private item(value: string, index: number) {
    const last = index === this.value.length - 1
    return { index, value, last }
  }
}
