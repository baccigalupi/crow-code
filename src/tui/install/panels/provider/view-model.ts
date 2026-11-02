import type { InputText } from '../../../types.ts'
import type {
  InstallProvider,
  PanelName,
  ProviderFieldDefinition,
} from '../../types.ts'

type ProviderPromptValues = {
  readonly step: PanelName
  readonly providers: readonly InstallProvider[]
  readonly providerName: InputText
  readonly providerUrl: InputText
  readonly providerCredentials: InputText
}

// The three provider steps as one "Provider N" block. Earlier fields show
// their values, the current one is live, later ones wait.
export class ProviderPromptViewModel {
  private readonly definitions: readonly ProviderFieldDefinition[] = [
    { label: 'Name', input: 'providerName', masked: false },
    { label: 'Url', input: 'providerUrl', masked: false },
    { label: 'API key', input: 'providerCredentials', masked: true },
  ]

  props(values: ProviderPromptValues) {
    return {
      title: `Provider ${values.providers.length + 1}`,
      fields: this.definitions.map((field) => this.field(field, values)),
    }
  }

  private field(
    definition: ProviderFieldDefinition,
    values: ProviderPromptValues,
  ) {
    const { label, input, masked } = definition
    const status = this.status(input, values.step)
    return { label, input: values[input], masked, status }
  }

  private status(input: PanelName, step: PanelName) {
    const offset = this.position(input) - this.position(step)
    return (['done', 'active', 'pending'] as const)[Math.sign(offset) + 1]
  }

  private position(name: PanelName) {
    return this.definitions.findIndex((field) => field.input === name)
  }
}
