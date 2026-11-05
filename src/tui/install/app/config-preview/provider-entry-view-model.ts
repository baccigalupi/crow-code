import type { ProviderRow } from '../../types.ts'

// One provider in the config json. Only the last one is ever being typed, so
// only its lines can highlight.
export class ProviderEntryViewModel {
  private row: ProviderRow

  constructor(row: ProviderRow) {
    this.row = row
  }

  name() {
    return this.row.name
  }

  baseUrl() {
    return this.row.baseUrl
  }

  editable() {
    return this.row.last
  }

  last() {
    return this.row.last
  }
}
