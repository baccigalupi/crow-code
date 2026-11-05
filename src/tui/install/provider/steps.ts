import type { ProviderStep, ProviderStepName } from '../types.ts'

// Each field of the provider form: where return leads, where shift-tab and
// tab lead, and whether it is typed masked. The last field loops back for
// the next provider.
export const providerSteps: Record<ProviderStepName, ProviderStep> = {
  providerName: {
    next: 'providerUrl',
    back: undefined,
    forward: 'providerUrl',
    masked: false,
  },
  providerUrl: {
    next: 'providerCredentials',
    back: 'providerName',
    forward: 'providerCredentials',
    masked: false,
  },
  providerCredentials: {
    next: 'providerName',
    back: 'providerUrl',
    forward: undefined,
    masked: true,
  },
}
