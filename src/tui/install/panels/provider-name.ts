import type { DataStore } from '../data-store.ts'
import { ProviderPanel } from './provider.ts'

export class ProviderNamePanel extends ProviderPanel {
  readonly name = 'providerName'
  readonly next = 'providerUrl'
  readonly back = undefined
  readonly forward = 'providerUrl'
  readonly highlights = { key: 'name', occurrence: 'last' } as const

  field(store: DataStore) {
    return store.providerEditForm.providerName
  }
}
