import { ProviderStep } from '../provider-step.ts'

export class ProviderUrlStep extends ProviderStep {
  readonly name = 'providerUrl'
  readonly next = 'providerCredentials'
  readonly back = 'providerName'
  readonly forward = 'providerCredentials'
}
