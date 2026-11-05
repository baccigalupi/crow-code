import type { ProviderStepName } from '../types.ts'
import type { ProviderStep } from './provider-step.ts'
import { ProviderCredentialsStep } from './provider/provider-credentials-step.ts'
import { ProviderNameStep } from './provider/provider-name-step.ts'
import { ProviderUrlStep } from './provider/provider-url-step.ts'

// The provider form's fields, in form order, found by name.
export class ProviderSteps {
  private readonly steps: readonly ProviderStep[] = [
    new ProviderNameStep(),
    new ProviderUrlStep(),
    new ProviderCredentialsStep(),
  ]

  all() {
    return this.steps
  }

  // Every provider step name has a step here, so the find always matches.
  named(name: ProviderStepName) {
    return this.steps.find((step) => step.name === name) as ProviderStep
  }
}
