import type { CrowProviderConfig, PanelHighlights } from '../../types.ts'
import type { CrowConfigInputs } from '../../crow-config/types.ts'
import type { CrowPermissionsConfig } from '../../../../types.ts'
import { theme } from '../../../theme.ts'
import { crowConfigFromInputs } from '../../crow-config/from-inputs.ts'
import { ListFieldViewModel } from './list-field-view-model.ts'
import { ProviderEntryViewModel } from './provider-entry-view-model.ts'
import { StringFieldViewModel } from './string-field-view-model.ts'

// The crow config's values, one view model per key, each told whether it is
// the key the current panel edits.
export class ConfigJsonViewModel {
  readonly background = theme.configPanel.background
  private inputs: CrowConfigInputs
  private highlights: PanelHighlights

  constructor(inputs: CrowConfigInputs, highlights: PanelHighlights) {
    this.inputs = inputs
    this.highlights = highlights
  }

  stringField(name: 'crowGlobalDirectory' | 'envFile') {
    const value = this.config()[name]
    return new StringFieldViewModel(this.fieldArguments(name, value, false))
  }

  listField(name: keyof CrowPermissionsConfig) {
    const value = this.config().permissions[name]
    return new ListFieldViewModel(this.fieldArguments(name, value, false))
  }

  lastListField(name: keyof CrowPermissionsConfig) {
    const value = this.config().permissions[name]
    return new ListFieldViewModel(this.fieldArguments(name, value, true))
  }

  providers() {
    const { providers } = this.config()
    return providers.map((provider, index) =>
      this.providerEntry(provider, index, providers.length),
    )
  }

  private providerEntry(
    provider: CrowProviderConfig,
    index: number,
    count: number,
  ) {
    const json = this.json()
    const highlightKey = this.highlights.key
    const last = index === count - 1
    const entry = { provider, index, last, highlightKey, json }
    return new ProviderEntryViewModel(entry)
  }

  private fieldArguments<Value>(name: string, value: Value, last: boolean) {
    const json = this.json()
    const highlighted = this.highlights.key === name
    return { name, value, highlighted, json, last }
  }

  private config() {
    return crowConfigFromInputs(this.inputs).crowConfig()
  }

  private json() {
    return crowConfigFromInputs(this.inputs).crowConfigJson()
  }
}
