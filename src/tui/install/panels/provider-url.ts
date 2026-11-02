import type { DataStore } from '../data-store.ts'
import { ProviderPanel } from './provider.ts'

export class ProviderUrlPanel extends ProviderPanel {
  readonly name = 'providerUrl'
  readonly next = 'providerCredentials'
  readonly back = 'providerName'
  readonly forward = 'providerCredentials'
  readonly highlights = { key: 'baseUrl', occurrence: 'last' } as const

  field(store: DataStore) {
    return store.providers.providerUrl
  }
}
