import { ProviderStep } from '../provider-step.tsx'

export class ProviderNameStep extends ProviderStep {
  readonly name = 'providerName'
  readonly next = 'providerUrl'
  readonly back = undefined
  readonly forward = 'providerUrl'
}
