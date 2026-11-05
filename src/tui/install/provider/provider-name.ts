import type { DataStore } from '../data-store.ts'
import { ProviderPanel } from './provider.tsx'

export class ProviderNamePanel extends ProviderPanel {
  readonly name = 'providerName'
  readonly next = 'providerUrl'
  readonly back = undefined
  readonly forward = 'providerUrl'

  field(store: DataStore) {
    return store.providerEditForm.providerName
  }
}
