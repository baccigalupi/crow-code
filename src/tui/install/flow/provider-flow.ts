import type { PanelFlow } from '../../types.ts'
import type { InstallStep } from '../types.ts'
import type { ProvidersStore } from '../data-stores/providers-store.ts'
import type { TextFieldStore } from '../data-stores/text-field-store.ts'
import { ProviderFormController } from '../panels/provider/controller.ts'

// The provider form's three fields: tab walks them, return moves on and the
// last one starts another provider, escape leaves for the confirm prompt.
export class ProviderFlow {
  private providers: ProvidersStore
  private readonly steps: readonly InstallStep[] = [
    'providerName',
    'providerUrl',
    'providerCredentials',
  ]

  constructor(providers: ProvidersStore) {
    this.providers = providers
  }

  panels() {
    return Object.fromEntries(
      this.fields().map((field, index) => [
        this.steps[index],
        this.flow(field, index),
      ]),
    )
  }

  private flow(field: TextFieldStore, index: number): PanelFlow<InstallStep> {
    const controller = this.controller(field, index)
    return { controller, next: this.loop(index), cancel: 'confirm' }
  }

  private controller(field: TextFieldStore, index: number) {
    const { providers } = this
    const back = this.steps[index - 1]
    const forward = this.steps[index + 1]
    return new ProviderFormController({ field, providers, back, forward })
  }

  // The last field returns to the first, for another provider.
  private loop(index: number) {
    return this.steps[(index + 1) % this.steps.length]
  }

  private fields() {
    const { providerName, providerUrl, providerCredentials } = this.providers
    return [providerName, providerUrl, providerCredentials]
  }
}
