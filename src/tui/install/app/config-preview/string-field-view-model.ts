import { JsonFieldViewModel } from './json-field-view-model.ts'

// A config key holding one string.
export class StringFieldViewModel extends JsonFieldViewModel<string> {
  quoted() {
    return JSON.stringify(this.value)
  }
}
