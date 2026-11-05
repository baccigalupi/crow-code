import { ProviderStep } from '../provider-step.tsx'

export class ProviderUrlStep extends ProviderStep {
  readonly name = 'providerUrl'
  readonly next = 'providerCredentials'
  readonly back = 'providerName'
  readonly forward = 'providerCredentials'
}
