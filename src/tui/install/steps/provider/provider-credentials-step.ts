import { ProviderStep } from '../provider-step.tsx'

// The last field loops back to the name for the next provider.
export class ProviderCredentialsStep extends ProviderStep {
  readonly name = 'providerCredentials'
  readonly next = 'providerName'
  readonly back = 'providerUrl'
  readonly forward = undefined
  readonly masked = true
}
