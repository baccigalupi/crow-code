import type { DataStore } from '../data-store.ts'
import { ProviderPanel } from './provider.tsx'

export class ProviderUrlPanel extends ProviderPanel {
  readonly name = 'providerUrl'
  readonly next = 'providerCredentials'
  readonly back = 'providerName'
  readonly forward = 'providerCredentials'

  field(store: DataStore) {
    return store.providerEditForm.providerUrl
  }
}
