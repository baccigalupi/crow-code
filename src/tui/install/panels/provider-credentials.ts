import type { DataStore } from '../data-store.ts'
import { ProviderPanel } from './provider.ts'

export class ProviderCredentialsPanel extends ProviderPanel {
  readonly name = 'providerCredentials'
  readonly next = 'providerName'
  readonly back = 'providerUrl'
  readonly forward = undefined
  readonly highlights = { key: 'providerCredentials' }

  field(store: DataStore) {
    return store.providerEditForm.providerCredentials
  }
}
