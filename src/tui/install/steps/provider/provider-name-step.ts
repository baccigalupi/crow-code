import { ProviderStep } from '../provider-step.ts'

export class ProviderNameStep extends ProviderStep {
  readonly name = 'providerName'
  readonly next = 'providerUrl'
  readonly back = undefined
  readonly forward = 'providerUrl'
}
