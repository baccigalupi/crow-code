import type { CrowProviderConfig, ProviderEntryArguments } from '../../types.ts'
import { StringFieldViewModel } from './string-field-view-model.ts'

// One provider in the config json. Only the last one is ever being typed, so
// only its fields highlight.
export class ProviderEntryViewModel {
  readonly index: number
  private provider: CrowProviderConfig
  private last: boolean
  private highlightKey: string
  private json: string

  constructor({
    provider,
    index,
    last,
    highlightKey,
    json,
  }: ProviderEntryArguments) {
    this.provider = provider
    this.index = index
    this.last = last
    this.highlightKey = highlightKey
    this.json = json
  }

  name() {
    return this.field('name', this.provider.name, false)
  }

  baseUrl() {
    return this.field('baseUrl', this.provider.baseUrl, true)
  }

  comma() {
    if (this.last) return ''

    return ','
  }

  private field(name: string, value: string, last: boolean) {
    const { json } = this
    const highlighted = this.last && this.highlightKey === name
    return new StringFieldViewModel({ name, value, highlighted, json, last })
  }
}
