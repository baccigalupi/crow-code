import type { InstallProvider } from '../types.ts'

// The "Provider N" title, counting the provider being typed.
export class ProviderPromptViewModel {
  private providers: readonly InstallProvider[]

  constructor(providers: readonly InstallProvider[]) {
    this.providers = providers
  }

  title() {
    return `Provider ${this.providers.length + 1}`
  }
}
